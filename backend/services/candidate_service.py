import os
from dotenv import load_dotenv
from models import CandidateCreate, CandidateUpdate, RecruitmentStage, CandidateAction
from workflow_state_machine import WorkflowStateMachine
from typing import List, Optional, Dict, Any
from datetime import datetime
from fastapi import HTTPException, UploadFile
from .base import BaseService
from models import (
    Candidate, CandidateStatus, StageTransition, WorkflowAction
)
import logging
from supabase import Client
from supabase_client import supabase
import uuid
import requests
import json

logger = logging.getLogger(__name__)


class CandidateService(BaseService):
    """Service for managing candidates through their recruitment journey"""

    def __init__(self):
        super().__init__()
        self.db = supabase
        self.agent_url = "http://localhost:8000"  # Agent service endpoint
        logger.info(
            "CandidateService initialized with Supabase client and agent integration")

    async def create_candidate_with_processing(self, candidate_info: Dict[str, Any], files: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Create candidate and process documents through agent"""
        try:
            # Ensure candidate has an ID
            if "id" not in candidate_info:
                candidate_info["id"] = str(uuid.uuid4())

            candidate_id = candidate_info["id"]

            # Create candidate using the existing create_candidate method
            created_id = await self.create_candidate(candidate_info)

            if not created_id:
                raise Exception("Failed to create candidate")

            logger.info(f"Created candidate: {candidate_id}")

            # Create job application if job_id is provided
            if candidate_info.get("job_id"):
                try:
                    await self._create_job_application(candidate_id, candidate_info)
                except Exception as e:
                    logger.error(
                        f"Error creating job application for candidate {candidate_id}: {e}")

            # Process files through agent if any
            if files:
                for file_info in files:
                    try:
                        # Call agent to process file
                        await self._process_file_with_agent(candidate_id, file_info)
                    except Exception as e:
                        logger.error(
                            f"Error processing file {file_info['name']}: {e}")

            return {
                "success": True,
                "candidate_id": candidate_id,
                "message": "Candidate created successfully",
                "id": candidate_id  # Add this for frontend compatibility
            }

        except Exception as e:
            logger.error(f"Error creating candidate: {e}")
            return {
                "success": False,
                "error": str(e)
            }

    async def _create_job_application(self, candidate_id: str, candidate_info: Dict[str, Any]) -> bool:
        """Create job application for candidate"""
        try:
            job_app_data = {
                "candidate_id": candidate_id,
                "job_id": candidate_info["job_id"],
                "event_id": candidate_info.get("event_id"),
                "status": "applied",
                "applied_at": datetime.utcnow().isoformat()
            }

            # Remove None values
            job_app_data = {k: v for k,
                            v in job_app_data.items() if v is not None}

            app_response = self.db.table(
                "job_applications").insert(job_app_data).execute()

            if app_response.data:
                logger.info(
                    f"Created job application for candidate {candidate_id} -> job {candidate_info['job_id']}")
                return True
            else:
                logger.warning(
                    f"Failed to create job application for candidate {candidate_id}")
                return False

        except Exception as e:
            logger.error(
                f"Error creating job application for candidate {candidate_id}: {e}")
            return False

    async def _process_file_with_agent(self, candidate_id: str, file_info: Dict[str, Any]) -> bool:
        """Process a candidate file through the agent service"""
        try:
            # Prepare the document data for the agent
            agent_payload = {
                "name": file_info.get("name", "resume.pdf"),
                "url": file_info.get("url", ""),
                "uuid": candidate_id,
                "candidate_id": candidate_id,
                "file_type": file_info.get("type", "resume")
            }

            logger.info(f"Sending file to agent: {agent_payload}")

            # Call the agent service
            response = requests.post(
                f"{self.agent_url}/add-doc",
                json=agent_payload,
                timeout=30,
                headers={"Content-Type": "application/json"}
            )

            if response.status_code == 200:
                agent_response = response.json()
                logger.info(f"Agent processing successful: {agent_response}")

                # Store the agent response if needed
                if agent_response.get("response"):
                    await self._store_agent_analysis(candidate_id, agent_response["response"])

                return True
            else:
                logger.error(
                    f"Agent processing failed: {response.status_code} - {response.text}")
                return False

        except requests.exceptions.RequestException as e:
            logger.error(f"Error calling agent service: {e}")
            return False
        except Exception as e:
            logger.error(f"Error processing file with agent: {e}")
            return False

    async def _store_agent_analysis(self, candidate_id: str, analysis: str) -> bool:
        """Store agent analysis results in the database"""
        try:
            # Store in candidate_ai_analysis table
            analysis_data = {
                "candidate_id": candidate_id,
                "analysis_json": {"agent_response": analysis},
                "model_version": "agent_v1",
                "created_at": datetime.utcnow().isoformat()
            }

            result = self.db.table("candidate_ai_analysis").insert(
                analysis_data).execute()

            if result.data:
                logger.info(
                    f"Stored agent analysis for candidate {candidate_id}")
                return True
            else:
                logger.error(f"Failed to store agent analysis: {result}")
                return False

        except Exception as e:
            logger.error(f"Error storing agent analysis: {e}")
            return False

    async def get_agent_health(self) -> Dict[str, Any]:
        """Check if the agent service is healthy"""
        try:
            response = requests.get(f"{self.agent_url}/health", timeout=5)
            if response.status_code == 200:
                return {"status": "healthy", "agent_available": True}
            else:
                return {"status": "unhealthy", "agent_available": False}
        except Exception as e:
            logger.error(f"Agent health check failed: {e}")
            return {"status": "error", "agent_available": False, "error": str(e)}

    async def search_candidates(self, query: str, filters: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Search candidates with filters"""
        try:
            # Build query
            supabase_query = self.db.table("candidates").select("*")

            # Apply filters
            for key, value in filters.items():
                if value:
                    supabase_query = supabase_query.eq(key, value)

            # Execute query
            response = supabase_query.execute()
            return response.data or []

        except Exception as e:
            logger.error(f"Error searching candidates: {e}")
            return []

    async def create_candidate(self, candidate_data: Dict[str, Any]) -> str:
        """Create a new candidate in the database"""
        try:
            # Ensure we have an ID
            if "id" not in candidate_data:
                candidate_data["id"] = str(uuid.uuid4())

            # Log the incoming data
            logger.info(f"Creating candidate with raw data: {candidate_data}")

            # Prepare data according to the candidates table schema
            db_data = {
                "id": candidate_data["id"],
                "name": candidate_data["name"],
                "email": candidate_data.get("email"),
                "phone": candidate_data.get("phone"),
                "status": candidate_data.get("status", "active"),
                "stage": candidate_data.get("stage", "applied"),
                "education": candidate_data.get("education"),
                "experience": candidate_data.get("experience"),
                "ai_profile_json": candidate_data.get("ai_profile_json"),
                "ai_profile_summary": candidate_data.get("ai_profile_summary"),
                "profile_embedding": candidate_data.get("profile_embedding"),
                "created_at": datetime.utcnow().isoformat(),
                "updated_at": datetime.utcnow().isoformat(),
                "linkedin_url": candidate_data.get("linkedin_url"),
                "github_url": candidate_data.get("github_url"),
                "portfolio_url": candidate_data.get("portfolio_url"),
                "current_position": candidate_data.get("current_position"),
                "years_experience": candidate_data.get("years_experience", 0),
                "certifications": candidate_data.get("certifications", []),
                "languages": candidate_data.get("languages", ["English"]),
                "availability": candidate_data.get("availability"),
                "salary_expectations": candidate_data.get("salary_expectations"),
                "preferred_work_type": candidate_data.get("preferred_work_type"),
                "source": candidate_data.get("source", "direct"),
                "notes": candidate_data.get("notes"),
                "skills": candidate_data.get("skills", [])
            }

            # Remove None values to avoid database issues
            db_data = {k: v for k, v in db_data.items() if v is not None}

            logger.info(f"Prepared database data: {db_data}")

            # Insert into database
            result = self.db.table("candidates").insert(db_data).execute()
            logger.info(f"Database insert result: {result}")

            if result.data:
                created_id = result.data[0]["id"]
                logger.info(f"Successfully created candidate: {created_id}")
                return created_id
            else:
                logger.error(
                    f"Failed to create candidate, no data returned: {result}")
                raise Exception(
                    "Failed to create candidate in database - no data returned")

        except Exception as e:
            logger.error(f"Error creating candidate: {str(e)}")
            raise Exception(f"Failed to create candidate: {str(e)}")

    async def update_candidate_resume(self, candidate_id: str, resume_url: str) -> bool:
        """Update candidate with resume URL and create file record"""
        try:
            # Create file record
            file_data = {
                "candidate_id": candidate_id,
                "file_type": "resume",
                "file_url": resume_url,
                "file_name": "resume.pdf",  # You might want to extract the actual filename
                "uploaded_at": datetime.utcnow().isoformat()
            }

            file_result = self.db.table(
                "candidate_files").insert(file_data).execute()

            if file_result.data:
                logger.info(
                    f"Created file record for candidate {candidate_id}")
                return True
            else:
                logger.error(f"Failed to create file record: {file_result}")
                return False

        except Exception as e:
            logger.error(f"Error updating candidate resume: {str(e)}")
            return False

    async def update_candidate_analysis(self, candidate_id: str, analysis: Dict[str, Any]) -> None:
        """Update candidate with AI analysis results"""
        try:
            analysis_data = {
                'candidate_id': candidate_id,
                'analysis_json': analysis,
                'model_version': 'v1'  # Track model version for future reference
            }

            self.db.table('candidate_ai_analysis').insert(
                analysis_data).execute()

            # Update candidate profile with summary
            if 'summary' in analysis:
                self.db.table('candidates').update({
                    'ai_profile_summary': analysis['summary']
                }).eq('id', candidate_id).execute()

        except Exception as e:
            raise Exception(f"Error updating candidate analysis: {str(e)}")

    async def get_candidates_by_stage(self, stage: str) -> List[Dict[str, Any]]:
        """Get candidates by stage"""
        try:
            result = self.db.table("candidates").select(
                "*",
                "candidate_files(id, file_type, file_url, file_name, uploaded_at)"
            ).eq("stage", stage).eq("status", "active").order("created_at", desc=True).execute()

            candidates = result.data if result.data else []

            # Format candidates
            formatted_candidates = []
            for candidate in candidates:
                # Get evaluation data separately
                try:
                    eval_result = self.db.table("initial_screening_evaluation").select(
                        "*"
                    ).eq("candidate_id", candidate["id"]).execute()

                    candidate["evaluation_data"] = eval_result.data if eval_result.data else [
                    ]
                except Exception as e:
                    logger.warning(
                        f"Could not fetch evaluation for candidate {candidate['id']}: {str(e)}")
                    candidate["evaluation_data"] = []

                formatted_candidate = {
                    **candidate,
                    "country": "Malaysia",
                    "currency": "MYR",
                    "timezone": "Asia/Kuala_Lumpur",
                    "formatted_salary": f"RM {candidate.get('salary_expectations', 0):,.2f}" if candidate.get('salary_expectations') else "Not specified",
                    "formatted_phone": candidate.get("phone", "").replace("+60", "").strip() if candidate.get("phone") else "",
                    "resume_files": [f for f in candidate.get("candidate_files", []) if f.get("file_type") == "resume"],
                    "other_files": [f for f in candidate.get("candidate_files", []) if f.get("file_type") != "resume"]
                }
                formatted_candidates.append(formatted_candidate)

            return formatted_candidates

        except Exception as e:
            logger.error(
                f"Error fetching candidates by stage {stage}: {str(e)}")
            return []

    async def get_candidate_by_id(self, candidate_id: str) -> Optional[Dict[str, Any]]:
        """Get a candidate by ID with related data"""
        try:
            # Get candidate with related data
            result = self.db.table("candidates").select(
                "*",
                "candidate_files(id, file_type, file_url, file_name, uploaded_at)",
                "candidate_stage_history(id, action, from_stage, to_stage, notes, performed_by, timestamp)"
            ).eq("id", candidate_id).single().execute()

            if not result.data:
                return None

            candidate = result.data

            # Get evaluation data separately
            try:
                eval_result = self.db.table("initial_screening_evaluation").select(
                    "*"
                ).eq("candidate_id", candidate_id).execute()

                candidate["evaluation_data"] = eval_result.data if eval_result.data else []
            except Exception as e:
                logger.warning(
                    f"Could not fetch evaluation for candidate {candidate_id}: {str(e)}")
                candidate["evaluation_data"] = []

            # Get event registrations
            try:
                event_result = self.db.table("event_registrations").select(
                    "event_id, events(id, title, name, location, date)"
                ).eq("candidate_id", candidate_id).execute()

                candidate["event_registrations"] = event_result.data if event_result.data else [
                ]
            except Exception as e:
                logger.warning(
                    f"Could not fetch event registrations for candidate {candidate_id}: {str(e)}")
                candidate["event_registrations"] = []

            # Add Malaysian formatting
            candidate.update({
                "country": "Malaysia",
                "currency": "MYR",
                "timezone": "Asia/Kuala_Lumpur",
                "formatted_salary": f"RM {candidate.get('salary_expectations', 0):,.2f}" if candidate.get('salary_expectations') else "Not specified",
                "formatted_phone": candidate.get("phone", "").replace("+60", "").strip() if candidate.get("phone") else "",
                "resume_files": [f for f in candidate.get("candidate_files", []) if f.get("file_type") == "resume"],
                "other_files": [f for f in candidate.get("candidate_files", []) if f.get("file_type") != "resume"],
                "stage_history": candidate.get("candidate_stage_history", []),
                "events": [er.get("events") for er in candidate.get("event_registrations", []) if er.get("events")]
            })

            return candidate

        except Exception as e:
            logger.error(f"Error fetching candidate {candidate_id}: {str(e)}")
            return None

    async def update_candidate_stage(self, candidate_id: str, stage: str) -> bool:
        """Update candidate stage"""
        try:
            result = self.db.table("candidates").update({
                "stage": stage,
                "updated_at": datetime.utcnow().isoformat()
            }).eq("id", candidate_id).execute()

            if result.data:
                logger.info(
                    f"Updated candidate {candidate_id} stage to {stage}")
                return True
            else:
                logger.error(f"Failed to update candidate stage: {result}")
                return False

        except Exception as e:
            logger.error(f"Error updating candidate stage: {str(e)}")
            return False

    def get_candidate(self, candidate_id: str) -> Dict[str, Any]:
        """Get a candidate by ID"""
        try:
            result = self.db.table("candidates").select(
                "*").eq("id", candidate_id).execute()

            if not result.data:
                raise HTTPException(
                    status_code=404, detail="Candidate not found")

            return result.data[0]

        except Exception as e:
            logger.error(f"Error fetching candidate {candidate_id}: {str(e)}")
            raise HTTPException(status_code=500, detail=str(e))

    def update_candidate(self, candidate_id: str, candidate_data: CandidateUpdate) -> Dict[str, Any]:
        """Update a candidate"""
        try:
            # Convert to dict and add metadata
            update_dict = {k: v for k,
                           v in candidate_data.dict().items() if v is not None}
            update_dict["updated_at"] = datetime.utcnow().isoformat()

            # Update in database
            result = self.db.table("candidates").update(
                update_dict).eq("id", candidate_id).execute()

            if not result.data:
                raise HTTPException(
                    status_code=404, detail="Candidate not found")

            return result.data[0]

        except Exception as e:
            logger.error(f"Error updating candidate {candidate_id}: {str(e)}")
            raise HTTPException(status_code=500, detail=str(e))

    def delete_candidate(self, candidate_id: str) -> Dict[str, Any]:
        """Delete a candidate"""
        try:
            result = self.db.table("candidates").delete().eq(
                "id", candidate_id).execute()

            if not result.data:
                raise HTTPException(
                    status_code=404, detail="Candidate not found")

            return {"message": "Candidate deleted successfully"}

        except Exception as e:
            logger.error(f"Error deleting candidate {candidate_id}: {str(e)}")
            raise HTTPException(status_code=500, detail=str(e))

    def get_candidates_by_stage_enum(self, stage: RecruitmentStage) -> List[Dict[str, Any]]:
        """Get all candidates in a specific stage using enum"""
        try:
            result = self.db.table("candidates").select(
                "*").eq("stage", stage.value).execute()
            return result.data if result.data else []

        except Exception as e:
            logger.error(
                f"Error fetching candidates by stage {stage}: {str(e)}")
            raise HTTPException(status_code=500, detail=str(e))

    def perform_action(self, candidate_id: str, action: CandidateAction, metadata: Optional[Dict] = None) -> Dict[str, Any]:
        """Perform a workflow action on a candidate"""
        try:
            # Get current candidate state
            candidate = self.get_candidate(candidate_id)
            current_stage = RecruitmentStage(candidate["stage"])

            # Determine new stage based on action
            new_stage = self._get_next_stage(current_stage, action)

            # Update candidate stage
            if new_stage:
                self.update_candidate(
                    candidate_id, CandidateUpdate(stage=new_stage))

            # Record the transition
            transition = StageTransition(
                candidateId=candidate_id,
                fromStage=current_stage,
                toStage=new_stage if new_stage else current_stage,
                action=action,
                performedBy="system",
                timestamp=datetime.utcnow().isoformat()
            )

            # Store transition in stage history
            self._record_stage_transition(transition)

            return {
                "success": True,
                "message": f"Action {action.value} performed successfully",
                "newStage": new_stage.value if new_stage else current_stage.value
            }

        except Exception as e:
            logger.error(
                f"Error performing action {action} on candidate {candidate_id}: {str(e)}")
            raise HTTPException(status_code=500, detail=str(e))

    def _get_next_stage(self, current_stage: RecruitmentStage, action: CandidateAction) -> Optional[RecruitmentStage]:
        """Determine the next stage based on current stage and action"""
        stage_transitions = {
            (RecruitmentStage.APPLIED, CandidateAction.SHORTLIST): RecruitmentStage.SCREENING,
            (RecruitmentStage.APPLIED, CandidateAction.REJECT): RecruitmentStage.REJECTED,
            (RecruitmentStage.SCREENING, CandidateAction.SCHEDULE_INTERVIEW): RecruitmentStage.INTERVIEW_SCHEDULED,
            (RecruitmentStage.INTERVIEW_SCHEDULED, CandidateAction.START_INTERVIEW): RecruitmentStage.INTERVIEWING,
            (RecruitmentStage.INTERVIEWING, CandidateAction.COMPLETE_INTERVIEW): RecruitmentStage.INTERVIEW_COMPLETED,
            (RecruitmentStage.INTERVIEW_COMPLETED, CandidateAction.MOVE_TO_FINAL_REVIEW): RecruitmentStage.FINAL_REVIEW,
            (RecruitmentStage.FINAL_REVIEW, CandidateAction.EXTEND_OFFER): RecruitmentStage.OFFER_EXTENDED,
            (RecruitmentStage.OFFER_EXTENDED, CandidateAction.OFFER_ACCEPTED): RecruitmentStage.HIRED,
            (RecruitmentStage.OFFER_EXTENDED, CandidateAction.OFFER_DECLINED): RecruitmentStage.REJECTED,
        }

        return stage_transitions.get((current_stage, action))

    def _record_stage_transition(self, transition: StageTransition) -> None:
        """Record a stage transition in the history"""
        try:
            self.db.table("candidate_stage_history").insert(
                transition.dict()).execute()
        except Exception as e:
            logger.error(f"Error recording stage transition: {str(e)}")
            # Don't raise exception as this is a non-critical operation

    def get_stage_history(self, candidate_id: str) -> List[Dict[str, Any]]:
        """Get the stage history for a candidate"""
        try:
            result = self.db.table("candidate_stage_history").select(
                "*").eq("candidate_id", candidate_id).order("timestamp", desc=True).execute()
            return result.data if result.data else []

        except Exception as e:
            logger.error(
                f"Error fetching stage history for candidate {candidate_id}: {str(e)}")
            raise HTTPException(status_code=500, detail=str(e))

    def get_workflow_summary(self) -> Dict[str, Any]:
        """Get a summary of candidates in each stage"""
        try:
            result = self.db.table("candidates").select(
                "stage, count(*)").group("stage").execute()

            summary = {
                "totalCandidates": 0,
                "stageBreakdown": {},
                "recentTransitions": []
            }

            if result.data:
                for row in result.data:
                    stage = row["stage"]
                    count = row["count"]
                    summary["stageBreakdown"][stage] = count
                    summary["totalCandidates"] += count

            # Get recent transitions
            transitions = self.db.table("candidate_stage_history").select(
                "*").order("timestamp", desc=True).limit(10).execute()
            if transitions.data:
                summary["recentTransitions"] = transitions.data

            return summary

        except Exception as e:
            logger.error(f"Error getting workflow summary: {str(e)}")
            raise HTTPException(status_code=500, detail=str(e))

    @staticmethod
    def list_candidates(status=None, stage=None, event_id=None, position_id=None):
        query = supabase.table("candidates").select("*")
        if status:
            query = query.eq("status", status)
        if stage:
            query = query.eq("stage", stage)
        # event_id and position_id can be used for advanced filtering if you join with other tables
        response = query.execute()
        return response.data

    @staticmethod
    def get_all_candidates():
        """Get all candidates for dashboard overview"""
        response = supabase.table("candidates").select("*").execute()
        return response.data

    @staticmethod
    def get_candidates_by_event(event_id):
        """Get all candidates for a specific event"""
        response = supabase.table("candidates").select(
            "*").eq("event_id", event_id).execute()
        return response.data

    @staticmethod
    def get_available_actions(candidate_id: str):
        """Get available workflow actions for a candidate"""
        try:
            response = supabase.table("candidates").select(
                "currentStage").eq("id", candidate_id).execute()
            if not response.data:
                return []

            current_stage = RecruitmentStage(
                response.data[0].get("currentStage", "applied"))
            return WorkflowStateMachine.get_available_actions(current_stage)
        except Exception as e:
            print(f"Error getting available actions: {str(e)}")
            return []

    def get_candidates_by_stage_with_details(self, stage: RecruitmentStage) -> List[Dict[str, Any]]:
        """Get candidates with stage-specific details"""
        try:
            # Base query to get candidates
            query = self.db.table("candidates").select("""
                id,
                name,
                email,
                phone,
                status,
                stage,
                current_position,
                education,
                experience,
                skills,
                ai_profile_json,
                ai_profile_summary,
                created_at,
                updated_at,
                linkedin_url,
                github_url,
                portfolio_url,
                years_experience,
                salary_expectations,
                availability,
                notes
            """).eq("stage", stage.value)

            # Add stage-specific joins and fields
            if stage == RecruitmentStage.APPLIED:
                # For applied candidates, include their files and initial AI analysis
                query = query.select("""
                    *,
                    candidate_files(id, file_type, file_url, file_name),
                    candidate_ai_analysis(analysis_json)
                """)

            elif stage == RecruitmentStage.SCREENING:
                # For screening, include AI analysis and stage history
                query = query.select("""
                    *,
                    candidate_ai_analysis(analysis_json),
                    candidate_stage_history(action, notes, timestamp)
                """)

            elif stage == RecruitmentStage.INTERVIEW_SCHEDULED:
                # For interview scheduled, include interview details
                query = query.select("""
                    *,
                    interviews(id, scheduled_at, interviewer, type, status)
                """)

            elif stage == RecruitmentStage.INTERVIEWING:
                # For ongoing interviews, include interview progress
                query = query.select("""
                    *,
                    interviews(id, start_time, status, transcript, analysis)
                """)

            elif stage == RecruitmentStage.INTERVIEW_COMPLETED:
                # For completed interviews, include full analysis
                query = query.select("""
                    *,
                    interviews(id, summary, analysis, notes),
                    candidate_ai_analysis(analysis_json)
                """)

            elif stage == RecruitmentStage.FINAL_REVIEW:
                # For final review, include all assessments
                query = query.select("""
                    *,
                    interviews(summary, analysis),
                    candidate_ai_analysis(analysis_json),
                    candidate_stage_history(action, notes, timestamp)
                """)

            elif stage == RecruitmentStage.OFFER_EXTENDED:
                # For offer stage, include offer details
                query = query.select("""
                    *,
                    interviews(summary),
                    candidate_stage_history(action, notes, timestamp)
                """)

            # Execute query
            result = query.execute()

            if not result.data:
                return []

            # Process the results
            candidates = []
            for candidate in result.data:
                # Format the candidate data based on stage
                formatted_candidate = self._format_candidate_data(
                    candidate, stage)
                candidates.append(formatted_candidate)

            return candidates

        except Exception as e:
            logger.error(
                f"Error fetching candidates for stage {stage}: {str(e)}")
            raise HTTPException(status_code=500, detail=str(e))

    def _format_candidate_data(self, candidate: Dict[str, Any], stage: RecruitmentStage) -> Dict[str, Any]:
        """Format candidate data based on stage"""
        try:
            # Base candidate info
            formatted = {
                "id": candidate["id"],
                "name": candidate["name"],
                "email": candidate["email"],
                "phone": candidate["phone"],
                "status": candidate["status"],
                "stage": candidate["stage"],
                "currentPosition": candidate["current_position"],
                "experience": candidate["experience"],
                "education": candidate["education"],
                "skills": candidate["skills"],
                "createdAt": candidate["created_at"],
                "updatedAt": candidate["updated_at"]
            }

            # Add stage-specific data
            if stage == RecruitmentStage.APPLIED:
                formatted.update({
                    "files": candidate.get("candidate_files", []),
                    "aiAnalysis": candidate.get("candidate_ai_analysis", [{}])[0].get("analysis_json", {}),
                    "applicationDate": candidate["created_at"],
                    "source": candidate.get("source"),
                    "initialAssessment": {
                        "skillMatch": self._calculate_skill_match(candidate),
                        "experienceMatch": self._calculate_experience_match(candidate),
                        "educationMatch": self._calculate_education_match(candidate)
                    }
                })

            elif stage == RecruitmentStage.SCREENING:
                formatted.update({
                    "aiAnalysis": candidate.get("candidate_ai_analysis", [{}])[0].get("analysis_json", {}),
                    "screeningNotes": candidate.get("notes"),
                    "stageHistory": candidate.get("candidate_stage_history", []),
                    "skillAssessment": self._calculate_skill_assessment(candidate)
                })

            elif stage == RecruitmentStage.INTERVIEW_SCHEDULED:
                interviews = candidate.get("interviews", [])
                formatted.update({
                    "upcomingInterviews": [
                        {
                            "id": interview["id"],
                            "scheduledAt": interview["scheduled_at"],
                            "interviewer": interview["interviewer"],
                            "type": interview["type"],
                            "status": interview["status"]
                        }
                        for interview in interviews
                    ]
                })

            elif stage == RecruitmentStage.INTERVIEWING:
                interviews = candidate.get("interviews", [])
                formatted.update({
                    "currentInterview": {
                        "id": interviews[0]["id"] if interviews else None,
                        "startTime": interviews[0]["start_time"] if interviews else None,
                        "status": interviews[0]["status"] if interviews else None,
                        "transcript": interviews[0].get("transcript", []),
                        "analysis": interviews[0].get("analysis", {})
                    } if interviews else None
                })

            elif stage == RecruitmentStage.INTERVIEW_COMPLETED:
                formatted.update({
                    "interviews": [
                        {
                            "id": interview["id"],
                            "summary": interview["summary"],
                            "analysis": interview["analysis"],
                            "notes": interview["notes"]
                        }
                        for interview in candidate.get("interviews", [])
                    ],
                    "aiAnalysis": candidate.get("candidate_ai_analysis", [{}])[0].get("analysis_json", {})
                })

            elif stage == RecruitmentStage.FINAL_REVIEW:
                formatted.update({
                    "interviews": [
                        {
                            "summary": interview["summary"],
                            "analysis": interview["analysis"]
                        }
                        for interview in candidate.get("interviews", [])
                    ],
                    "aiAnalysis": candidate.get("candidate_ai_analysis", [{}])[0].get("analysis_json", {}),
                    "stageHistory": candidate.get("candidate_stage_history", []),
                    "overallAssessment": self._calculate_overall_assessment(candidate)
                })

            elif stage == RecruitmentStage.OFFER_EXTENDED:
                formatted.update({
                    "interviews": [{"summary": interview["summary"]} for interview in candidate.get("interviews", [])],
                    "stageHistory": candidate.get("candidate_stage_history", []),
                    "offerDetails": self._get_latest_offer_details(candidate)
                })

            return formatted

        except Exception as e:
            logger.error(f"Error formatting candidate data: {str(e)}")
            return candidate

    def _calculate_skill_match(self, candidate: Dict[str, Any]) -> float:
        """Calculate skill match percentage"""
        try:
            if not candidate.get("skills") or not candidate.get("ai_profile_json", {}).get("required_skills"):
                return 0.0

            candidate_skills = set(candidate["skills"])
            required_skills = set(
                candidate["ai_profile_json"]["required_skills"])

            if not required_skills:
                return 0.0

            matches = len(candidate_skills.intersection(required_skills))
            return (matches / len(required_skills)) * 100

        except Exception:
            return 0.0

    def _calculate_experience_match(self, candidate: Dict[str, Any]) -> float:
        """Calculate experience match percentage"""
        try:
            if not candidate.get("years_experience") or not candidate.get("ai_profile_json", {}).get("required_experience"):
                return 0.0

            actual_exp = candidate["years_experience"]
            required_exp = candidate["ai_profile_json"]["required_experience"]

            if actual_exp >= required_exp:
                return 100.0
            return (actual_exp / required_exp) * 100

        except Exception:
            return 0.0

    def _calculate_education_match(self, candidate: Dict[str, Any]) -> float:
        """Calculate education match percentage"""
        try:
            if not candidate.get("education") or not candidate.get("ai_profile_json", {}).get("required_education"):
                return 0.0

            education_level = {
                "high school": 1,
                "associate": 2,
                "bachelor": 3,
                "master": 4,
                "phd": 5
            }

            candidate_edu = candidate["education"].lower()
            required_edu = candidate["ai_profile_json"]["required_education"].lower(
            )

            candidate_level = next(
                (level for edu, level in education_level.items() if edu in candidate_edu), 0)
            required_level = next(
                (level for edu, level in education_level.items() if edu in required_edu), 0)

            if candidate_level >= required_level:
                return 100.0
            return (candidate_level / required_level) * 100

        except Exception:
            return 0.0

    def _calculate_skill_assessment(self, candidate: Dict[str, Any]) -> Dict[str, Any]:
        """Calculate detailed skill assessment"""
        try:
            return {
                "technicalSkills": self._assess_technical_skills(candidate),
                "softSkills": self._assess_soft_skills(candidate),
                "overallScore": self._calculate_overall_skill_score(candidate)
            }
        except Exception:
            return {}

    def _calculate_overall_assessment(self, candidate: Dict[str, Any]) -> Dict[str, Any]:
        """Calculate overall candidate assessment"""
        try:
            return {
                "skillMatch": self._calculate_skill_match(candidate),
                "experienceMatch": self._calculate_experience_match(candidate),
                "educationMatch": self._calculate_education_match(candidate),
                "interviewScore": self._calculate_interview_score(candidate),
                "cultureFit": self._calculate_culture_fit(candidate),
                "overallScore": self._calculate_final_score(candidate)
            }
        except Exception:
            return {}

    def _get_latest_offer_details(self, candidate: Dict[str, Any]) -> Dict[str, Any]:
        """Get the latest offer details"""
        try:
            history = candidate.get("candidate_stage_history", [])
            offer_actions = [h for h in history if h["action"]
                             in ["extend-offer", "update-offer"]]

            if not offer_actions:
                return {}

            latest_offer = max(offer_actions, key=lambda x: x["timestamp"])
            return {
                "salary": latest_offer.get("notes", {}).get("salary"),
                "startDate": latest_offer.get("notes", {}).get("start_date"),
                "status": latest_offer.get("status"),
                "lastUpdated": latest_offer["timestamp"]
            }
        except Exception:
            return {}

    async def create_event_registration(self, candidate_id: str, event_id: str) -> bool:
        """Create event registration for candidate"""
        try:
            registration_data = {
                "candidate_id": candidate_id,
                "event_id": event_id,
                "registered_at": datetime.utcnow().isoformat()
            }

            result = self.db.table("event_registrations").insert(
                registration_data).execute()

            if result.data:
                logger.info(
                    f"Created event registration for candidate {candidate_id} and event {event_id}")
                return True
            else:
                logger.error(f"Failed to create event registration: {result}")
                return False

        except Exception as e:
            logger.error(f"Error creating event registration: {str(e)}")
            return False


# Create singleton instance
candidate_service = CandidateService()
