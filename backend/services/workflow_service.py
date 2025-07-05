from datetime import datetime
from typing import List, Optional, Dict, Any
from models import (
    Candidate, RecruitmentStage, CandidateAction, StageTransition,
    WorkflowAction, ActionResult, StageInfo, WorkflowSummary,
    Interview, InterviewStatus, InterviewType
)
from supabase_client import supabase
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
        RecruitmentStage.SCREENING: {
            "label": "Screening",
            "description": "Resume review and phone screening",
            "actions": [
                CandidateAction.SCHEDULE_INTERVIEW,
                CandidateAction.REJECT_AFTER_SCREENING,
                CandidateAction.PUT_ON_HOLD,
                CandidateAction.UPDATE_SCREENING_NOTES
            ]
        },
        RecruitmentStage.INTERVIEW_SCHEDULED: {
            "label": "Interview Scheduled",
            "description": "Interview is scheduled but not yet started",
            "actions": [
                CandidateAction.START_INTERVIEW,
                CandidateAction.RESCHEDULE,
                CandidateAction.CANCEL_AND_REJECT,
                CandidateAction.REMIND_CANDIDATE
            ]
        },
        RecruitmentStage.INTERVIEWING: {
            "label": "Interviewing",
            "description": "Interview is currently in progress",
            "actions": [
                CandidateAction.COMPLETE_INTERVIEW,
                CandidateAction.PAUSE_INTERVIEW,
                CandidateAction.CANCEL_INTERVIEW
            ]
        },
        RecruitmentStage.INTERVIEW_COMPLETED: {
            "label": "Interview Completed",
            "description": "Interview finished, awaiting evaluation",
            "actions": [
                CandidateAction.MOVE_TO_FINAL_REVIEW,
                CandidateAction.REQUEST_ANOTHER_INTERVIEW,
                CandidateAction.REJECT_AFTER_INTERVIEW,
                CandidateAction.UPDATE_INTERVIEW_NOTES
            ]
        },
        RecruitmentStage.ADDITIONAL_INTERVIEW: {
            "label": "Additional Interview",
            "description": "Multiple interviews required",
            "actions": [
                CandidateAction.SCHEDULE_NEXT_INTERVIEW,
                CandidateAction.REJECT,
                CandidateAction.SKIP_ADDITIONAL
            ]
        },
        RecruitmentStage.FINAL_REVIEW: {
            "label": "Final Review",
            "description": "Decision-making stage, comparing candidates",
            "actions": [
                CandidateAction.EXTEND_OFFER,
                CandidateAction.FINAL_REJECT,
                CandidateAction.PUT_ON_HOLD_FOR_REVIEW,
                CandidateAction.COMPARE_CANDIDATES
            ]
        },
        RecruitmentStage.OFFER_EXTENDED: {
            "label": "Offer Extended",
            "description": "Job offer has been made to candidate",
            "actions": [
                CandidateAction.OFFER_ACCEPTED,
                CandidateAction.OFFER_DECLINED,
                CandidateAction.NEGOTIATE_OFFER,
                CandidateAction.WITHDRAW_OFFER
            ]
        },
        RecruitmentStage.NEGOTIATING: {
            "label": "Negotiating",
            "description": "Salary/terms negotiation in progress",
            "actions": [
                CandidateAction.UPDATE_OFFER,
                CandidateAction.NEGOTIATION_FAILED,
                CandidateAction.ACCEPT_COUNTER_OFFER
            ]
        },
        RecruitmentStage.ON_HOLD: {
            "label": "On Hold",
            "description": "Process paused for various reasons",
            "actions": [
                CandidateAction.REACTIVATE,
                CandidateAction.REJECT_FROM_HOLD,
                CandidateAction.UPDATE_HOLD_REASON
            ]
        },
        RecruitmentStage.HIRED: {
            "label": "Hired",
            "description": "Candidate accepted offer and joined company",
            "actions": []
        },
        RecruitmentStage.REJECTED: {
            "label": "Rejected",
            "description": "Candidate rejected at any stage",
            "actions": []
        }
    }

    @classmethod
    def perform_action(cls, candidate_id: str, action: CandidateAction, performed_by: str,
                       notes: Optional[str] = None, metadata: Optional[Dict[str, Any]] = None) -> ActionResult:
        """Perform an action on a candidate and update their stage"""
        try:
            # Get current candidate
            response = supabase.table("candidates").select(
                "*").eq("id", candidate_id).execute()

            if not response.data:
                return ActionResult(
                    success=False,
                    message="Candidate not found",
                    candidateId=candidate_id
                )

            candidate_data = response.data[0]
            current_stage = RecruitmentStage(
                candidate_data.get("currentStage", "applied"))

            # Validate action is allowed for current stage
            if not WorkflowStateMachine.is_valid_transition(current_stage, action):
                allowed_actions = WorkflowStateMachine.get_available_actions(
                    current_stage)
                return ActionResult(
                    success=False,
                    message=f"Action '{action.value}' not allowed in stage '{current_stage.value}'. Allowed actions: {[a.value for a in allowed_actions]}",
                    candidateId=candidate_id
                )

            # Determine next stage
            next_stage = WorkflowStateMachine.get_next_stage(
                current_stage, action)

            # Create stage transition record
            transition = {
                "candidate_id": candidate_id,
                "action": action.value,
                "from_stage": current_stage.value,
                "to_stage": next_stage.value if next_stage else current_stage.value,
                "performed_by": performed_by,
                "timestamp": datetime.now().isoformat(),
                "notes": notes or f"Performed action: {action.value}",
                "status": "completed"
            }

            # Prepare updates
            updates = {
                "updated_at": datetime.now().isoformat(),
                "updated_by": performed_by
            }

            # Update stage if it changes
            if next_stage and next_stage != current_stage:
                updates["currentStage"] = next_stage.value
                updates["stage"] = next_stage.value
                print(
                    f"🔄 Moving candidate {candidate_id} from {current_stage.value} to {next_stage.value}")

            # Handle specific action statuses
            if action == CandidateAction.REJECT or action == CandidateAction.REJECT_AFTER_SCREENING or action == CandidateAction.REJECT_AFTER_INTERVIEW or action == CandidateAction.FINAL_REJECT:
                updates["status"] = "rejected"
            elif action == CandidateAction.SHORTLIST:
                updates["status"] = "shortlisted"
            elif action == CandidateAction.SCHEDULE_INTERVIEW:
                updates["status"] = "interview-scheduled"
            elif action == CandidateAction.START_INTERVIEW:
                updates["status"] = "interviewing"
            elif action == CandidateAction.MOVE_TO_FINAL_REVIEW:
                updates["status"] = "final-review"
            elif action == CandidateAction.EXTEND_OFFER:
                updates["status"] = "offer-extended"
            elif action == CandidateAction.OFFER_ACCEPTED:
                updates["status"] = "hired"

            # Update candidate
            supabase.table("candidates").update(
                updates).eq("id", candidate_id).execute()

            # Log stage transition
            supabase.table("candidate_stage_history").insert(
                transition).execute()

            # Get next available actions
            final_stage = next_stage if next_stage else current_stage
            next_actions = WorkflowStateMachine.get_available_actions(
                final_stage)

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
                nextActions=next_actions
            )

        except Exception as e:
            print(f"❌ Error performing action: {str(e)}")
            return ActionResult(
                success=False,
                message=f"Error performing action: {str(e)}",
                candidateId=candidate_id
            )

    @classmethod
    def get_workflow_summary(cls) -> WorkflowSummary:
        """Get comprehensive workflow summary with stage breakdown"""
        try:
            # Get all candidates
            response = supabase.table("candidates").select("*").execute()
            candidates = response.data

            # Count candidates by stage
            stage_counts = {}
            for candidate in candidates:
                stage = candidate.get("currentStage", "applied")
                stage_counts[stage] = stage_counts.get(stage, 0) + 1

            # Build stage breakdown
            stage_breakdown = []
            for stage in RecruitmentStage:
                stage_info = StageInfo(
                    stage=stage,
                    label=cls.STAGE_CONFIG.get(stage, {}).get(
                        "label", stage.value.title()),
                    description=cls.STAGE_CONFIG.get(
                        stage, {}).get("description", ""),
                    actions=cls.STAGE_CONFIG.get(stage, {}).get("actions", []),
                    candidateCount=stage_counts.get(stage.value, 0)
                )
                stage_breakdown.append(stage_info)

            # Get recent transitions
            recent_transitions = cls._get_recent_transitions(10)

            return WorkflowSummary(
                totalCandidates=len(candidates),
                stageBreakdown=stage_breakdown,
                recentTransitions=recent_transitions
            )

        except Exception as e:
            print(f"❌ Error getting workflow summary: {str(e)}")
            raise

    @classmethod
    def get_candidates_by_stage(cls, stage: RecruitmentStage) -> List[Dict[str, Any]]:
        """Get all candidates in a specific stage"""
        try:
            response = supabase.table("candidates").select(
                "*").eq("currentStage", stage.value).execute()
            return response.data
        except Exception as e:
            print(f"❌ Error getting candidates by stage: {str(e)}")
            return []

    @classmethod
    def get_available_actions(cls, candidate_id: str) -> List[CandidateAction]:
        """Get available actions for a specific candidate"""
        try:
            response = supabase.table("candidates").select(
                "currentStage").eq("id", candidate_id).execute()

            if not response.data:
                return []

            current_stage = RecruitmentStage(
                response.data[0].get("currentStage", "applied"))
            return WorkflowStateMachine.get_available_actions(current_stage)

        except Exception as e:
            print(f"❌ Error getting available actions: {str(e)}")
            return []

    @classmethod
    def _get_recent_transitions(cls, limit: int = 10) -> List[StageTransition]:
        """Get recent stage transitions"""
        try:
            response = supabase.table("candidate_stage_history").select(
                "*").order("timestamp", desc=True).limit(limit).execute()

            transitions = []
            for record in response.data:
                transition = StageTransition(
                    candidateId=record["candidate_id"],
                    fromStage=RecruitmentStage(record["from_stage"]),
                    toStage=RecruitmentStage(record["to_stage"]),
                    action=CandidateAction(record["action"]),
                    performedBy=record["performed_by"],
                    timestamp=record["timestamp"],
                    notes=record.get("notes")
                )
                transitions.append(transition)

            return transitions

        except Exception as e:
            print(f"❌ Error getting recent transitions: {str(e)}")
            return []

    @classmethod
    def get_stage_metrics(cls) -> Dict[str, Any]:
        """Get stage metrics and conversion rates"""
        try:
            # Get all candidates
            response = supabase.table("candidates").select("*").execute()
            candidates = response.data

            # Count by stage
            stage_counts = {}
            for candidate in candidates:
                stage = candidate.get("currentStage", "applied")
                stage_counts[stage] = stage_counts.get(stage, 0) + 1

            # Calculate conversion rates
            conversion_rates = {}
            total_candidates = len(candidates)

            if total_candidates > 0:
                for stage in RecruitmentStage:
                    count = stage_counts.get(stage.value, 0)
                    conversion_rates[stage.value] = (
                        count / total_candidates) * 100

            return {
                "stage_counts": stage_counts,
                "conversion_rates": conversion_rates,
                "total_candidates": total_candidates
            }

        except Exception as e:
            print(f"❌ Error getting stage metrics: {str(e)}")
            return {}

    @classmethod
    def schedule_interview(cls, candidate_id: str, interview_data: Dict[str, Any], scheduled_by: str) -> ActionResult:
        """Schedule an interview for a candidate"""
        try:
            # First perform the schedule interview action
            result = cls.perform_action(
                candidate_id=candidate_id,
                action=CandidateAction.SCHEDULE_INTERVIEW,
                performed_by=scheduled_by,
                notes="Interview scheduled",
                metadata=interview_data
            )

            if not result.success:
                return result

            # Create interview record
            interview_record = {
                "candidate_id": candidate_id,
                "job_id": interview_data.get("job_id"),
                "event_id": interview_data.get("event_id"),
                "interviewer": interview_data.get("interviewer"),
                "date": interview_data.get("date"),
                "time": interview_data.get("time"),
                "duration": interview_data.get("duration", 60),
                "type": interview_data.get("type", "technical"),
                "status": "scheduled",
                "room": interview_data.get("room"),
                "notes": interview_data.get("notes"),
                "created_by": scheduled_by,
                "updated_by": scheduled_by
            }

            supabase.table("interviews").insert(interview_record).execute()

            return result

        except Exception as e:
            print(f"❌ Error scheduling interview: {str(e)}")
            return ActionResult(
                success=False,
                message=f"Error scheduling interview: {str(e)}",
                candidateId=candidate_id
            )

    @classmethod
    def start_interview(cls, candidate_id: str, interviewer_id: str, interview_type: str = "technical") -> ActionResult:
        """Start an interview for a candidate"""
        try:
            # Perform start interview action
            result = cls.perform_action(
                candidate_id=candidate_id,
                action=CandidateAction.START_INTERVIEW,
                performed_by=interviewer_id,
                notes="Interview started",
                metadata={"interview_type": interview_type}
            )

            if not result.success:
                return result

            # Update interview status
            supabase.table("interviews").update({
                "status": "in-progress",
                "updated_at": datetime.now().isoformat(),
                "updated_by": interviewer_id
            }).eq("candidate_id", candidate_id).eq("status", "scheduled").execute()

            return result

        except Exception as e:
            print(f"❌ Error starting interview: {str(e)}")
            return ActionResult(
                success=False,
                message=f"Error starting interview: {str(e)}",
                candidateId=candidate_id
            )

    @classmethod
    def complete_interview(cls, interview_id: str, outcome: str, next_steps: List[str], completed_by: str) -> ActionResult:
        """Complete an interview and update candidate stage"""
        try:
            # Get interview details
            response = supabase.table("interviews").select(
                "*").eq("id", interview_id).execute()

            if not response.data:
                return ActionResult(
                    success=False,
                    message="Interview not found",
                    candidateId=""
                )

            interview = response.data[0]
            candidate_id = interview["candidate_id"]

            # Update interview
            supabase.table("interviews").update({
                "status": "completed",
                "updated_at": datetime.now().isoformat(),
                "updated_by": completed_by
            }).eq("id", interview_id).execute()

            # Determine next action based on outcome
            if outcome == "pass":
                action = CandidateAction.MOVE_TO_FINAL_REVIEW
            elif outcome == "fail":
                action = CandidateAction.REJECT_AFTER_INTERVIEW
            else:
                action = CandidateAction.REQUEST_ANOTHER_INTERVIEW

            # Perform the appropriate action
            result = cls.perform_action(
                candidate_id=candidate_id,
                action=action,
                performed_by=completed_by,
                notes=f"Interview completed with outcome: {outcome}. Next steps: {', '.join(next_steps)}"
            )

            return result

        except Exception as e:
            print(f"❌ Error completing interview: {str(e)}")
            return ActionResult(
                success=False,
                message=f"Error completing interview: {str(e)}",
                candidateId=""
            )
