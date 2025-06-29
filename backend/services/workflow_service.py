from datetime import datetime
from typing import List, Optional, Dict, Any
from models import (
    Candidate, RecruitmentStage, CandidateAction, StageTransition,
    WorkflowAction, ActionResult, StageInfo, WorkflowSummary,
    Interview, InterviewStatus, InterviewType
)
from firestore_client import db
from workflow_state_machine import WorkflowStateMachine


class WorkflowService:
    """Handles all recruitment workflow business logic"""

    # Stage configuration matching frontend constants
    STAGE_CONFIG = {
        RecruitmentStage.APPLIED: {
            "label": "Applied",
            "description": "Review applications and initial candidate assessment",
            "actions": [
                CandidateAction.SHORTLIST,
                CandidateAction.REJECT,
                CandidateAction.VIEW_PROFILE,
                CandidateAction.ANALYZE_RESUME
            ]
        },
        RecruitmentStage.SCREENED: {
            "label": "Screened",
            "description": "Schedule or conduct interviews",
            "actions": [
                CandidateAction.SCHEDULE_INTERVIEW,
                CandidateAction.START_INTERVIEW,
                CandidateAction.REJECT
            ]
        },
        RecruitmentStage.INTERVIEWED: {
            "label": "Interview",
            "description": "Review interview results and compare candidates",
            "actions": [
                CandidateAction.MOVE_TO_FINAL,
                CandidateAction.REQUEST_ANOTHER_INTERVIEW,
                CandidateAction.REJECT
            ]
        },
        RecruitmentStage.FINAL_REVIEW: {
            "label": "Final Review",
            "description": "Make final hiring decisions",
            "actions": [
                CandidateAction.MAKE_OFFER,
                CandidateAction.REJECT
            ]
        },
        RecruitmentStage.SHORTLISTED: {
            "label": "Shortlisted",
            "description": "Candidates ready for final offer",
            "actions": [
                CandidateAction.MAKE_OFFER,
                CandidateAction.COMPARE_CANDIDATES,
                CandidateAction.REJECT
            ]
        }
    }

    @classmethod
    def get_next_stage(cls, current_stage: RecruitmentStage, action: CandidateAction) -> Optional[RecruitmentStage]:
        """Determine the next stage based on current stage and action"""
        stage_transitions = {
            RecruitmentStage.APPLIED: {
                CandidateAction.SHORTLIST: RecruitmentStage.SCREENED,
                CandidateAction.REJECT: None  # Terminal state
            },
            RecruitmentStage.SCREENED: {
                CandidateAction.SCHEDULE_INTERVIEW: RecruitmentStage.SCREENED,  # Stay in screened
                CandidateAction.START_INTERVIEW: RecruitmentStage.INTERVIEWED,
                CandidateAction.REJECT: None
            },
            RecruitmentStage.INTERVIEWED: {
                CandidateAction.MOVE_TO_FINAL: RecruitmentStage.FINAL_REVIEW,
                CandidateAction.REQUEST_ANOTHER_INTERVIEW: RecruitmentStage.SCREENED,
                CandidateAction.REJECT: None
            },
            RecruitmentStage.FINAL_REVIEW: {
                CandidateAction.MAKE_OFFER: RecruitmentStage.SHORTLISTED,
                CandidateAction.REJECT: None
            },
            RecruitmentStage.SHORTLISTED: {
                CandidateAction.MAKE_OFFER: RecruitmentStage.SHORTLISTED,  # Stay shortlisted
                CandidateAction.REJECT: None
            }
        }

        return stage_transitions.get(current_stage, {}).get(action)

    @classmethod
    def perform_action(cls, candidate_id: str, action: CandidateAction, performed_by: str,
                       notes: Optional[str] = None, metadata: Optional[Dict[str, Any]] = None) -> ActionResult:
        """Perform an action on a candidate and update their stage"""
        try:
            # Get current candidate
            doc = db.collection("candidates").document(candidate_id).get()
            if not doc.exists:
                return ActionResult(
                    success=False,
                    message="Candidate not found",
                    candidateId=candidate_id
                )

            candidate_data = doc.to_dict()
            current_stage = RecruitmentStage(
                candidate_data.get("currentStage", "applied"))

            # Validate action is allowed for current stage
            allowed_actions = cls.STAGE_CONFIG[current_stage]["actions"]
            if action not in allowed_actions:
                return ActionResult(
                    success=False,
                    message=f"Action '{action.value}' not allowed in stage '{current_stage.value}'. Allowed actions: {[a.value for a in allowed_actions]}",
                    candidateId=candidate_id
                )

            # Determine next stage
            next_stage = cls.get_next_stage(current_stage, action)

            # Create stage transition record
            transition = {
                "candidateId": candidate_id,
                "fromStage": current_stage.value,
                "toStage": next_stage.value if next_stage else current_stage.value,
                "action": action.value,
                "performedBy": performed_by,
                "timestamp": datetime.now().isoformat(),
                "notes": notes or f"Performed action: {action.value}"
            }

            # Prepare updates
            updates = {
                "lastActionDate": datetime.now().isoformat()
            }

            # Update stage if it changes
            if next_stage and next_stage != current_stage:
                updates["currentStage"] = next_stage.value
                print(
                    f"🔄 Moving candidate {candidate_id} from {current_stage.value} to {next_stage.value}")

            # Handle specific action statuses
            if action == CandidateAction.REJECT:
                updates["status"] = "reject"
            elif action == CandidateAction.SHORTLIST:
                updates["status"] = "shortlist"
            elif action == CandidateAction.SCHEDULE_INTERVIEW:
                updates["status"] = "interview-scheduled"
            elif action == CandidateAction.START_INTERVIEW:
                updates["status"] = "interviewing"
            elif action == CandidateAction.MOVE_TO_FINAL:
                updates["status"] = "final-review"
            elif action == CandidateAction.MAKE_OFFER:
                updates["status"] = "offer-made"

            # Update stage history
            stage_history = candidate_data.get("stageHistory", [])
            stage_history.append(transition)
            updates["stageHistory"] = stage_history

            # Apply updates to candidate
            db.collection("candidates").document(candidate_id).update(updates)

            # Log the workflow action
            workflow_action = {
                "action": action.value,
                "candidateId": candidate_id,
                "performedBy": performed_by,
                "timestamp": datetime.now().isoformat(),
                "metadata": metadata or {},
                "notes": notes or f"Performed action: {action.value}",
                "fromStage": current_stage.value,
                "toStage": next_stage.value if next_stage else current_stage.value
            }
            cls._log_workflow_action(workflow_action)

            # Get next available actions
            final_stage = next_stage if next_stage else current_stage
            next_actions = cls.STAGE_CONFIG.get(
                final_stage, {}).get("actions", [])

            print(
                f"✅ Action '{action.value}' performed successfully on candidate {candidate_id}")
            if next_stage:
                print(f"   Stage: {current_stage.value} → {next_stage.value}")

            return ActionResult(
                success=True,
                message=f"Successfully performed action '{action.value}'" + (
                    f" and moved to stage '{next_stage.value}'" if next_stage and next_stage != current_stage else ""),
                candidateId=candidate_id,
                newStage=next_stage,
                nextActions=[action.value for action in next_actions]
            )

        except Exception as e:
            print(
                f"❌ Error performing action '{action.value}' on candidate {candidate_id}: {str(e)}")
            return ActionResult(
                success=False,
                message=f"Error performing action: {str(e)}",
                candidateId=candidate_id
            )

    @classmethod
    def schedule_interview(cls, candidate_id: str, interview_data: Dict[str, Any], scheduled_by: str) -> ActionResult:
        """Schedule an interview for a candidate"""
        try:
            # Create interview record
            interview = {
                "id": f"interview_{candidate_id}_{datetime.now().strftime('%Y%m%d_%H%M%S')}",
                "candidateId": candidate_id,
                "eventId": interview_data.get("eventId", ""),
                "date": interview_data["date"],
                "time": interview_data["time"],
                "duration": interview_data.get("duration", 45),
                "type": interview_data.get("type", "technical"),
                "status": "scheduled",
                "interviewer": interview_data["interviewer"],
                "room": interview_data.get("room", "Virtual Room"),
                "notes": [],
                "messages": [],
                "scheduledBy": scheduled_by,
                "scheduledAt": datetime.now().isoformat()
            }

            # Save interview
            db.collection("interviews").document(
                interview["id"]).set(interview)

            # Update candidate stage and add interview reference
            candidate_updates = {
                "scheduledInterview": {
                    "id": interview["id"],
                    "date": interview_data["date"],
                    "time": interview_data["time"],
                    "interviewer": interview_data["interviewer"]["name"]
                }
            }

            db.collection("candidates").document(
                candidate_id).update(candidate_updates)

            # Perform the schedule interview action
            return cls.perform_action(
                candidate_id,
                CandidateAction.SCHEDULE_INTERVIEW,
                scheduled_by,
                notes=f"Interview scheduled for {interview_data['date']} at {interview_data['time']}",
                metadata={"interviewId": interview["id"]}
            )

        except Exception as e:
            return ActionResult(
                success=False,
                message=f"Error scheduling interview: {str(e)}",
                candidateId=candidate_id
            )

    @classmethod
    def start_interview(cls, candidate_id: str, interviewer_id: str, interview_type: str = "technical") -> ActionResult:
        """Start an interview session"""
        try:
            # Check if there's a scheduled interview
            interviews = db.collection("interviews").where(
                "candidateId", "==", candidate_id).where("status", "==", "scheduled").stream()
            interview_doc = None

            for interview in interviews:
                interview_doc = interview
                break

            if interview_doc:
                # Update existing scheduled interview
                interview_id = interview_doc.id
                db.collection("interviews").document(interview_id).update({
                    "status": "in-progress",
                    "startedAt": datetime.now().isoformat()
                })
            else:
                # Create instant interview
                interview_id = f"instant_{candidate_id}_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
                interview = {
                    "id": interview_id,
                    "candidateId": candidate_id,
                    "eventId": "",
                    "date": datetime.now().strftime("%Y-%m-%d"),
                    "time": datetime.now().strftime("%H:%M"),
                    "duration": 45,
                    "type": interview_type,
                    "status": "in-progress",
                    "interviewer": {"id": interviewer_id, "name": "Current User", "role": "Interviewer"},
                    "room": "Virtual Room",
                    "notes": [],
                    "messages": [],
                    "startedAt": datetime.now().isoformat()
                }
                db.collection("interviews").document(
                    interview_id).set(interview)

            # Perform the start interview action
            return cls.perform_action(
                candidate_id,
                CandidateAction.START_INTERVIEW,
                interviewer_id,
                notes=f"Interview started at {datetime.now().strftime('%H:%M')}",
                metadata={"interviewId": interview_id}
            )

        except Exception as e:
            return ActionResult(
                success=False,
                message=f"Error starting interview: {str(e)}",
                candidateId=candidate_id
            )

    @classmethod
    def complete_interview(cls, interview_id: str, outcome: str, next_steps: List[str], completed_by: str) -> ActionResult:
        """Complete an interview and determine next actions"""
        try:
            # Get interview
            interview_doc = db.collection(
                "interviews").document(interview_id).get()
            if not interview_doc.exists:
                return ActionResult(
                    success=False,
                    message="Interview not found",
                    candidateId=""
                )

            interview_data = interview_doc.to_dict()
            candidate_id = interview_data["candidateId"]

            # Update interview status
            db.collection("interviews").document(interview_id).update({
                "status": "completed",
                "completedAt": datetime.now().isoformat(),
                "outcome": outcome,
                "nextSteps": next_steps
            })

            # Determine next action based on outcome
            if outcome == "pass":
                action = CandidateAction.MOVE_TO_FINAL
                notes = "Interview completed successfully - moving to final review"
            elif outcome == "fail":
                action = CandidateAction.REJECT
                notes = "Interview completed - candidate not suitable"
            else:  # pending
                action = CandidateAction.REQUEST_ANOTHER_INTERVIEW
                notes = "Interview completed - requires additional assessment"

            return cls.perform_action(
                candidate_id,
                action,
                completed_by,
                notes=notes,
                metadata={"interviewId": interview_id, "outcome": outcome}
            )

        except Exception as e:
            return ActionResult(
                success=False,
                message=f"Error completing interview: {str(e)}",
                candidateId=""
            )

    @classmethod
    def get_workflow_summary(cls) -> WorkflowSummary:
        """Get summary of the entire recruitment workflow"""
        try:
            # Get all candidates
            candidates = list(db.collection("candidates").stream())

            # Count candidates by stage
            stage_counts = {}
            total_candidates = 0

            for candidate_doc in candidates:
                candidate_data = candidate_doc.to_dict()
                stage = candidate_data.get("currentStage", "applied")
                stage_counts[stage] = stage_counts.get(stage, 0) + 1
                total_candidates += 1

            # Build stage breakdown
            stage_breakdown = []
            for stage in RecruitmentStage:
                config = cls.STAGE_CONFIG[stage]
                stage_breakdown.append(StageInfo(
                    stage=stage,
                    label=config["label"],
                    description=config["description"],
                    actions=config["actions"],
                    candidateCount=stage_counts.get(stage.value, 0)
                ))

            # Get recent transitions
            recent_transitions = []
            for candidate_doc in candidates[-10:]:  # Last 10 candidates
                candidate_data = candidate_doc.to_dict()
                stage_history = candidate_data.get("stageHistory", [])
                if stage_history:
                    # Get the most recent transition
                    recent_transition = stage_history[-1]
                    recent_transitions.append(
                        StageTransition(**recent_transition))

            return WorkflowSummary(
                totalCandidates=total_candidates,
                stageBreakdown=stage_breakdown,
                recentTransitions=recent_transitions
            )

        except Exception as e:
            print(f"Error getting workflow summary: {str(e)}")
            return WorkflowSummary(
                totalCandidates=0,
                stageBreakdown=[],
                recentTransitions=[]
            )

    @classmethod
    def get_candidates_by_stage(cls, stage: RecruitmentStage) -> List[Dict[str, Any]]:
        """Get all candidates in a specific stage"""
        try:
            docs = db.collection("candidates").where(
                "currentStage", "==", stage.value).stream()
            return [doc.to_dict() for doc in docs]
        except Exception as e:
            print(f"Error getting candidates by stage: {str(e)}")
            return []

    @classmethod
    def get_available_actions(cls, candidate_id: str) -> List[CandidateAction]:
        """Get available actions for a candidate based on their current stage"""
        try:
            doc = db.collection("candidates").document(candidate_id).get()
            if not doc.exists:
                return []

            candidate_data = doc.to_dict()
            current_stage = candidate_data.get("currentStage", "applied")

            # Use the new state machine to get available actions
            return WorkflowStateMachine.get_available_actions(current_stage)

        except Exception as e:
            print(f"Error getting available actions: {str(e)}")
            return []

    @classmethod
    def _log_workflow_action(cls, action: Dict[str, Any]):
        """Log a workflow action for audit trail"""
        try:
            db.collection("workflow_actions").add(action)
        except Exception as e:
            print(f"Error logging workflow action: {str(e)}")

    @classmethod
    def get_stage_metrics(cls) -> Dict[str, Any]:
        """Get metrics for each stage of the recruitment pipeline"""
        try:
            candidates = list(db.collection("candidates").stream())

            metrics = {
                "total_candidates": len(candidates),
                "stage_counts": {},
                "conversion_rates": {},
                "average_time_in_stage": {},
                "bottlenecks": []
            }

            # Count candidates by stage
            for candidate_doc in candidates:
                candidate_data = candidate_doc.to_dict()
                stage = candidate_data.get("currentStage", "applied")
                metrics["stage_counts"][stage] = metrics["stage_counts"].get(
                    stage, 0) + 1

            # Calculate conversion rates
            stages = list(RecruitmentStage)
            for i in range(len(stages) - 1):
                current_stage = stages[i].value
                next_stage = stages[i + 1].value

                current_count = metrics["stage_counts"].get(current_stage, 0)
                next_count = metrics["stage_counts"].get(next_stage, 0)

                if current_count > 0:
                    conversion_rate = (next_count / current_count) * 100
                    metrics["conversion_rates"][f"{current_stage}_to_{next_stage}"] = round(
                        conversion_rate, 2)

            return metrics

        except Exception as e:
            print(f"Error getting stage metrics: {str(e)}")
            return {}
