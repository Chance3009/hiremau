"""
Stage Management Service for Candidate Workflow
Handles the state machine for candidate stages and statuses
"""

import logging
from typing import Dict, List, Optional, Any
from datetime import datetime
from supabase_client import supabase

logger = logging.getLogger(__name__)


class StageManagementService:
    def __init__(self):
        # Define the stage flow and allowed transitions
        self.stage_transitions = {
            "applied": ["screening", "rejected"],
            "screening": ["shortlisted", "rejected", "interview"],
            "shortlisted": ["interview", "rejected"],
            "interview": ["final_review", "rejected", "offer"],
            "final_review": ["offer", "rejected"],
            "offer": ["hired", "rejected", "declined"],
            "hired": ["onboarded"],
            "rejected": [],  # Terminal state
            "declined": [],  # Terminal state
            "onboarded": []  # Terminal state
        }

        # Define status mappings for each stage
        self.stage_status_mapping = {
            "applied": "active",
            "screening": "under_review",
            "shortlisted": "shortlisted",
            "interview": "interviewing",
            "final_review": "final_review",
            "offer": "offer_extended",
            "hired": "hired",
            "rejected": "rejected",
            "declined": "declined",
            "onboarded": "onboarded"
        }

        # Define what data to fetch for each stage
        self.stage_data_requirements = {
            "applied": ["basic_info", "resume", "application_data"],
            "screening": ["basic_info", "resume", "initial_evaluation"],
            "shortlisted": ["basic_info", "resume", "initial_evaluation", "screening_notes"],
            "interview": ["basic_info", "resume", "initial_evaluation", "interview_schedule", "interview_notes"],
            "final_review": ["basic_info", "resume", "evaluations", "interview_feedback", "references"],
            "offer": ["basic_info", "evaluations", "offer_details", "salary_negotiation"],
            "hired": ["basic_info", "offer_details", "onboarding_checklist"],
            "rejected": ["basic_info", "rejection_reason", "feedback"],
            "declined": ["basic_info", "decline_reason"],
            "onboarded": ["basic_info", "onboarding_completion", "team_assignment"]
        }

    async def get_allowed_actions(self, candidate_id: str) -> List[str]:
        """Get allowed actions for a candidate based on their current stage"""
        try:
            # Get current stage
            result = supabase.table("candidates").select(
                "stage, status").eq("id", candidate_id).single().execute()

            if not result.data:
                return []

            current_stage = result.data.get("stage", "applied")
            allowed_stages = self.stage_transitions.get(current_stage, [])

            # Convert stages to actions
            actions = []
            for stage in allowed_stages:
                if stage == "screening":
                    actions.append("start_screening")
                elif stage == "shortlisted":
                    actions.append("shortlist")
                elif stage == "interview":
                    actions.append("schedule_interview")
                elif stage == "final_review":
                    actions.append("move_to_final")
                elif stage == "offer":
                    actions.append("make_offer")
                elif stage == "hired":
                    actions.append("hire")
                elif stage == "rejected":
                    actions.append("reject")
                elif stage == "declined":
                    actions.append("mark_declined")
                elif stage == "onboarded":
                    actions.append("complete_onboarding")

            return actions

        except Exception as e:
            logger.error(f"Error getting allowed actions: {str(e)}")
            return []

    async def transition_candidate_stage(self, candidate_id: str, action: str, performed_by: str = "system", notes: str = "") -> Dict[str, Any]:
        """Transition a candidate to a new stage based on action"""
        try:
            # Get current stage
            result = supabase.table("candidates").select(
                "stage, status, name").eq("id", candidate_id).single().execute()

            if not result.data:
                return {"success": False, "error": "Candidate not found"}

            current_stage = result.data.get("stage", "applied")
            candidate_name = result.data.get("name", "Unknown")

            # Map action to new stage
            new_stage = self._action_to_stage(action)
            if not new_stage:
                return {"success": False, "error": f"Invalid action: {action}"}

            # Check if transition is allowed
            allowed_stages = self.stage_transitions.get(current_stage, [])
            if new_stage not in allowed_stages:
                return {"success": False, "error": f"Cannot transition from {current_stage} to {new_stage}"}

            # Get new status
            new_status = self.stage_status_mapping.get(new_stage, "active")

            # Update candidate stage and status
            update_result = supabase.table("candidates").update({
                "stage": new_stage,
                "status": new_status,
                "updated_at": datetime.utcnow().isoformat()
            }).eq("id", candidate_id).execute()

            if not update_result.data:
                return {"success": False, "error": "Failed to update candidate"}

            # Create stage history record
            history_data = {
                "candidate_id": candidate_id,
                "action": action,
                "from_stage": current_stage,
                "to_stage": new_stage,
                "notes": notes or f"Transitioned from {current_stage} to {new_stage}",
                "performed_by": performed_by,
                "timestamp": datetime.utcnow().isoformat(),
                "status": new_status
            }

            supabase.table("candidate_stage_history").insert(
                history_data).execute()

            logger.info(
                f"Candidate {candidate_name} ({candidate_id}) transitioned from {current_stage} to {new_stage}")

            return {
                "success": True,
                "candidate_id": candidate_id,
                "from_stage": current_stage,
                "to_stage": new_stage,
                "new_status": new_status,
                "action": action,
                "message": f"Successfully transitioned to {new_stage}"
            }

        except Exception as e:
            logger.error(f"Error transitioning candidate stage: {str(e)}")
            return {"success": False, "error": str(e)}

    def _action_to_stage(self, action: str) -> Optional[str]:
        """Map action to stage"""
        action_stage_map = {
            "start_screening": "screening",
            "shortlist": "shortlisted",
            "schedule_interview": "interview",
            "move_to_final": "final_review",
            "make_offer": "offer",
            "hire": "hired",
            "reject": "rejected",
            "mark_declined": "declined",
            "complete_onboarding": "onboarded"
        }
        return action_stage_map.get(action)

    async def get_stage_data_requirements(self, stage: str) -> List[str]:
        """Get data requirements for a specific stage"""
        return self.stage_data_requirements.get(stage, ["basic_info"])

    async def get_candidates_by_stage_with_requirements(self, stage: str) -> List[Dict[str, Any]]:
        """Get candidates in a stage with their required data"""
        try:
            # Get data requirements for this stage
            requirements = await self.get_stage_data_requirements(stage)

            # Build select query based on requirements
            select_fields = ["*"]

            if "resume" in requirements:
                select_fields.append(
                    "candidate_files(id, file_type, file_url, file_name, uploaded_at)")

            if "initial_evaluation" in requirements or "evaluations" in requirements:
                # Note: We'll fetch this separately due to type mismatch
                pass

            if "interview_schedule" in requirements or "interview_notes" in requirements:
                select_fields.append(
                    "interviews(id, scheduled_date, status, notes, interviewer)")

            if "screening_notes" in requirements:
                select_fields.append(
                    "candidate_stage_history(notes, timestamp, performed_by)")

            # Get candidates
            query = supabase.table("candidates").select(", ".join(select_fields)).eq(
                "stage", stage).eq("status", self.stage_status_mapping.get(stage, "active"))

            result = query.execute()
            candidates = result.data if result.data else []

            # Enrich with evaluation data if needed
            for candidate in candidates:
                if "initial_evaluation" in requirements or "evaluations" in requirements:
                    try:
                        eval_result = supabase.table("initial_screening_evaluation").select(
                            "*").eq("candidate_id", candidate["id"]).execute()
                        candidate["evaluation_data"] = eval_result.data if eval_result.data else [
                        ]
                    except Exception as e:
                        logger.warning(
                            f"Could not fetch evaluation for candidate {candidate['id']}: {str(e)}")
                        candidate["evaluation_data"] = []

                # Add Malaysian formatting
                candidate.update({
                    "country": "Malaysia",
                    "currency": "MYR",
                    "timezone": "Asia/Kuala_Lumpur",
                    "formatted_salary": f"RM {candidate.get('salary_expectations', 0):,.2f}" if candidate.get('salary_expectations') else "Not specified",
                    "formatted_phone": candidate.get("phone", "").replace("+60", "").strip() if candidate.get("phone") else "",
                })

            return candidates

        except Exception as e:
            logger.error(f"Error getting candidates by stage: {str(e)}")
            return []

    async def get_stage_summary(self) -> Dict[str, Any]:
        """Get summary of candidates across all stages"""
        try:
            summary = {}

            for stage in self.stage_transitions.keys():
                count_result = supabase.table("candidates").select("id", count="exact").eq(
                    "stage", stage).eq("status", self.stage_status_mapping.get(stage, "active")).execute()
                summary[stage] = count_result.count or 0

            return {
                "success": True,
                "stage_counts": summary,
                "total_active": sum(count for stage, count in summary.items() if stage not in ["rejected", "declined", "onboarded"])
            }

        except Exception as e:
            logger.error(f"Error getting stage summary: {str(e)}")
            return {"success": False, "error": str(e)}


# Create singleton instance
stage_management_service = StageManagementService()
