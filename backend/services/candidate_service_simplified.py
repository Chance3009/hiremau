import os
import requests
from dotenv import load_dotenv
from typing import List, Optional, Dict, Any
from datetime import datetime
from fastapi import HTTPException, UploadFile
import logging
from supabase import Client, create_client
from supabase_client import supabase
import uuid
import json

logger = logging.getLogger(__name__)

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")


class SimplifiedCandidateService:
    """Simplified service for managing candidates in the recruitment pipeline"""

    def __init__(self):
        self.supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
        self.agent_url = "http://localhost:8000"  # Main agent endpoint
        logger.info("SimplifiedCandidateService initialized")

    async def create_candidate_with_processing(self, candidate_info: Dict[str, Any], files: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Create candidate and process documents"""
        try:
            # Create candidate in database
            candidate_response = self.supabase.table(
                "candidates").insert(candidate_info).execute()

            if not candidate_response.data:
                raise Exception("Failed to create candidate")

            candidate = candidate_response.data[0]
            candidate_id = candidate["id"]

            # Create job application if job_id is provided
            if candidate_info.get("job_id"):
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

                    app_response = self.supabase.table(
                        "job_applications").insert(job_app_data).execute()

                    if app_response.data:
                        logger.info(
                            f"Created job application for candidate {candidate_id} -> job {candidate_info['job_id']}")
                    else:
                        logger.warning(
                            f"Failed to create job application for candidate {candidate_id}")

                except Exception as e:
                    logger.error(
                        f"Error creating job application for candidate {candidate_id}: {e}")

            # Process files through agent if any
            if files:
                for file_info in files:
                    try:
                        # TODO: Call agent to process file
                        # For now, we'll just log the file info
                        logger.info(
                            f"Processing file {file_info['name']} for candidate {candidate_id}")
                    except Exception as e:
                        logger.error(
                            f"Error processing file {file_info['name']}: {e}")

            return {
                "success": True,
                "candidate_id": candidate_id,
                "message": "Candidate created successfully"
            }

        except Exception as e:
            logger.error(f"Error creating candidate: {e}")
            return {
                "success": False,
                "error": str(e)
            }

    async def get_candidates_by_stage(self, stage: str) -> List[Dict[str, Any]]:
        """Get candidates by stage"""
        try:
            response = self.supabase.table("candidates").select(
                "*").eq("stage", stage).execute()
            return response.data or []
        except Exception as e:
            logger.error(f"Error fetching candidates by stage {stage}: {e}")
            return []

    async def get_candidate_by_id(self, candidate_id: str) -> Optional[Dict[str, Any]]:
        """Get candidate by ID with evaluation data"""
        try:
            # Fetch candidate data
            candidate_response = self.supabase.table(
                "candidates").select("*").eq("id", candidate_id).execute()

            if not candidate_response.data:
                logger.warning(f"Candidate {candidate_id} not found")
                return None

            candidate = candidate_response.data[0]

            # Fetch evaluation data from initial_screening_evaluation
            evaluation_response = self.supabase.table("initial_screening_evaluation").select(
                "*").eq("candidate_id", candidate_id).execute()

            # Format evaluation data for frontend
            evaluation_data = []
            if evaluation_response.data:
                for evaluation in evaluation_response.data:
                    evaluation_data.append({
                        "id": evaluation.get("id"),
                        "overall_score": evaluation.get("overall_score"),
                        "recommendation": evaluation.get("recommendation"),
                        "resume_summary": evaluation.get("resume_summary"),
                        "experience_relevance": evaluation.get("experience_relevance"),
                        "technical_competency_assessment": evaluation.get("technical_competency_assessment"),
                        "cultural_fit_indicators": evaluation.get("cultural_fit_indicators"),
                        "strengths": evaluation.get("strengths"),
                        "weaknesses": evaluation.get("weaknesses"),
                        "missing_required_skills": evaluation.get("missing_required_skills"),
                        "standout_qualities": evaluation.get("standout_qualities"),
                        "potential_concerns": evaluation.get("potential_concerns"),
                        "recommendation_reasoning": evaluation.get("recommendation_reasoning"),
                        "interview_focus_areas": evaluation.get("interview_focus_areas"),
                        "technical_skills": evaluation.get("technical_skills"),
                        "communication_assessment": evaluation.get("communication_assessment"),
                        "education_background": evaluation.get("education_background"),
                        "red_flags": evaluation.get("red_flags"),
                        "career_progression": evaluation.get("career_progression"),
                        "created_at": evaluation.get("created_at")
                    })

            # Fetch AI analysis from candidate_table (embeddings)
            ai_analysis = []
            try:
                ai_response = self.supabase.table("candidate_table").select(
                    "*").eq("document_id", candidate_id).execute()
                if ai_response.data:
                    for ai_record in ai_response.data:
                        ai_analysis.append({
                            "content": ai_record.get("content"),
                            "metadata": ai_record.get("metadata"),
                            "document_id": ai_record.get("document_id"),
                            "name": ai_record.get("name")
                        })
            except Exception as e:
                logger.warning(
                    f"Could not fetch AI analysis for candidate {candidate_id}: {e}")

            # Return formatted candidate data
            return {
                **candidate,
                "evaluation_data": evaluation_data,
                "ai_analysis": ai_analysis,
                # Alternative field name for frontend compatibility
                "evaluationData": evaluation_data,
                "formatted_salary": f"RM {candidate.get('salary_expectations', 0):,.2f}" if candidate.get('salary_expectations') else "Not specified",
                "formatted_phone": candidate.get("phone", "").replace("+60", "").strip() if candidate.get("phone") else "",
                "country": "Malaysia",
                "currency": "MYR"
            }

        except Exception as e:
            logger.error(f"Error fetching candidate {candidate_id}: {e}")
            return None

    async def update_candidate_stage(self, candidate_id: str, new_stage: str, notes: str = None) -> bool:
        """Update candidate stage"""
        try:
            update_data = {"stage": new_stage,
                           "updated_at": datetime.utcnow().isoformat()}
            if notes:
                update_data["notes"] = notes

            response = self.supabase.table("candidates").update(
                update_data).eq("id", candidate_id).execute()
            return len(response.data) > 0
        except Exception as e:
            logger.error(f"Error updating candidate {candidate_id} stage: {e}")
            return False

    async def get_pipeline_summary(self) -> Dict[str, Any]:
        """Get recruitment pipeline summary"""
        try:
            # Get counts by stage
            stages = ["applied", "screening",
                      "interviewed", "shortlisted", "rejected"]
            stage_counts = {}

            for stage in stages:
                response = self.supabase.table("candidates").select(
                    "id", count="exact").eq("stage", stage).execute()
                stage_counts[stage] = response.count or 0

            return {
                "stage_counts": stage_counts,
                "total_candidates": sum(stage_counts.values())
            }

        except Exception as e:
            logger.error(f"Error getting pipeline summary: {e}")
            return {"stage_counts": {}, "total_candidates": 0}

    async def search_candidates(self, query: str, filters: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Search candidates with filters"""
        try:
            # Build query
            supabase_query = self.supabase.table("candidates").select("*")

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
