import os
from supabase import create_client
from dotenv import load_dotenv
from models import CandidateCreate, CandidateUpdate, RecruitmentStage, CandidateAction
from workflow_state_machine import WorkflowStateMachine

load_dotenv()
supabase = create_client(os.getenv("SUPABASE_URL"), os.getenv("SUPABASE_KEY"))


class CandidateService:
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
    def get_candidate(candidate_id):
        response = supabase.table("candidates").select(
            "*").eq("id", candidate_id).single().execute()
        return response.data

    @staticmethod
    def create_candidate(candidate: CandidateCreate):
        response = supabase.table("candidates").insert(
            candidate.dict()).execute()
        return {"success": True, "candidate_id": response.data[0]["id"]}

    @staticmethod
    def update_candidate(candidate_id, candidate: CandidateUpdate):
        response = supabase.table("candidates").update(
            candidate.dict(exclude_unset=True)).eq("id", candidate_id).execute()
        return {"success": True}

    @staticmethod
    def delete_candidate(candidate_id):
        supabase.table("candidates").delete().eq("id", candidate_id).execute()
        return {"success": True}

    @staticmethod
    def get_candidates_by_stage(stage: RecruitmentStage):
        """Get all candidates in a specific recruitment stage"""
        response = supabase.table("candidates").select(
            "*").eq("currentStage", stage.value).execute()
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

    @staticmethod
    def get_workflow_summary():
        """Get workflow summary with stage breakdown"""
        try:
            response = supabase.table("candidates").select("*").execute()
            candidates = response.data

            # Count candidates by stage
            stage_counts = {}
            for candidate in candidates:
                stage = candidate.get("currentStage", "applied")
                stage_counts[stage] = stage_counts.get(stage, 0) + 1

            return {
                "totalCandidates": len(candidates),
                "stageBreakdown": stage_counts
            }
        except Exception as e:
            print(f"Error getting workflow summary: {str(e)}")
            return {"totalCandidates": 0, "stageBreakdown": {}}
