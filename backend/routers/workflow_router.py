from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional, Dict, Any
from models import (
    RecruitmentStage, CandidateAction, ActionResult, WorkflowSummary,
    StageTransition, WorkflowAction
)
from supabase_client import supabase
from services.workflow_service import WorkflowService
from datetime import datetime, timedelta
from workflow_state_machine import WorkflowStateMachine

router = APIRouter(tags=["workflow"])


@router.get("/summary", response_model=WorkflowSummary)
def get_workflow_summary():
    """Get comprehensive workflow summary"""
    try:
        return WorkflowService.get_workflow_summary()
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error getting workflow summary: {str(e)}")


@router.get("/stages")
def get_all_stages():
    """Get all recruitment stages with descriptions and colors"""
    stages = []
    for stage in RecruitmentStage:
        stages.append({
            "stage": stage.value,
            "description": WorkflowStateMachine.get_stage_description(stage),
            "color": WorkflowStateMachine.get_stage_color(stage),
            "isTerminal": WorkflowStateMachine.is_terminal_stage(stage),
            "availableActions": [action.value for action in WorkflowStateMachine.get_available_actions(stage)]
        })
    return {"stages": stages}


@router.get("/stage/{stage}/candidates")
def get_stage_candidates(stage: str):
    """Get all candidates in a specific stage"""
    try:
        # Validate stage
        try:
            recruitment_stage = RecruitmentStage(stage)
        except ValueError:
            raise HTTPException(
                status_code=400, detail=f"Invalid stage: {stage}")

        candidates = WorkflowService.get_candidates_by_stage(recruitment_stage)
        return {
            "stage": stage,
            "candidates": candidates,
            "count": len(candidates)
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error getting stage candidates: {str(e)}")


@router.get("/actions")
def get_all_actions():
    """Get all candidate actions with descriptions"""
    actions = []
    for action in CandidateAction:
        actions.append({
            "action": action.value,
            "description": WorkflowStateMachine.get_action_description(action)
        })
    return {"actions": actions}


@router.post("/candidate/{candidate_id}/action/{action}", response_model=ActionResult)
def execute_workflow_action(
    candidate_id: str,
    action: str,
    performed_by: str = "system",
    notes: Optional[str] = None,
    metadata: Optional[Dict[str, Any]] = None
):
    """Execute a workflow action on a candidate"""
    try:
        # Validate action
        try:
            candidate_action = CandidateAction(action)
        except ValueError:
            raise HTTPException(
                status_code=400, detail=f"Invalid action: {action}")

        result = WorkflowService.perform_action(
            candidate_id=candidate_id,
            action=candidate_action,
            performed_by=performed_by,
            notes=notes,
            metadata=metadata or {}
        )

        if not result.success:
            raise HTTPException(status_code=400, detail=result.message)

        return result
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error executing workflow action: {str(e)}")


@router.get("/candidate/{candidate_id}/available-actions")
def get_candidate_available_actions(candidate_id: str):
    """Get available actions for a specific candidate"""
    try:
        actions = WorkflowService.get_available_actions(candidate_id)

        # Get candidate current stage for context
        response = supabase.table("candidates").select(
            "currentStage").eq("id", candidate_id).execute()
        if not response.data:
            raise HTTPException(status_code=404, detail="Candidate not found")

        current_stage = response.data[0].get("currentStage", "applied")

        return {
            "candidateId": candidate_id,
            "currentStage": current_stage,
            "availableActions": [action.value for action in actions]
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error getting available actions: {str(e)}")


@router.get("/candidate/{candidate_id}/history")
def get_candidate_workflow_history(candidate_id: str):
    """Get complete workflow history for a candidate"""
    try:
        # Get candidate
        candidate_response = supabase.table("candidates").select(
            "currentStage").eq("id", candidate_id).execute()
        if not candidate_response.data:
            raise HTTPException(status_code=404, detail="Candidate not found")

        current_stage = candidate_response.data[0].get(
            "currentStage", "applied")

        # Get stage history
        history_response = supabase.table("candidate_stage_history").select(
            "*").eq("candidate_id", candidate_id).order("timestamp", desc=True).execute()
        stage_history = history_response.data

        return {
            "candidateId": candidate_id,
            "currentStage": current_stage,
            "stageHistory": stage_history,
            "totalTransitions": len(stage_history)
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error getting workflow history: {str(e)}")


@router.get("/transitions/recent")
def get_recent_transitions(limit: int = Query(20, description="Number of recent transitions to return")):
    """Get recent stage transitions across all candidates"""
    try:
        response = supabase.table("candidate_stage_history").select(
            "*").order("timestamp", desc=True).limit(limit).execute()
        transitions = response.data

        # Add candidate names to transitions
        for transition in transitions:
            candidate_response = supabase.table("candidates").select(
                "name").eq("id", transition["candidate_id"]).execute()
            if candidate_response.data:
                transition["candidateName"] = candidate_response.data[0].get(
                    "name", "Unknown")

        return {
            "transitions": transitions,
            "total": len(transitions)
        }
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error getting recent transitions: {str(e)}")


@router.get("/metrics/conversion-rates")
def get_conversion_rates():
    """Get conversion rates between stages"""
    try:
        metrics = WorkflowService.get_stage_metrics()
        return {
            "conversionRates": metrics.get("conversion_rates", {}),
            "stageCounts": metrics.get("stage_counts", {}),
            "totalCandidates": metrics.get("total_candidates", 0)
        }
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error getting conversion rates: {str(e)}")


@router.get("/metrics/performance")
def get_workflow_performance():
    """Get workflow performance metrics"""
    try:
        # Get all candidates
        response = supabase.table("candidates").select("*").execute()
        candidates = response.data

        # Calculate metrics
        total_candidates = len(candidates)
        hired_count = len(
            [c for c in candidates if c.get("currentStage") == "hired"])
        rejected_count = len(
            [c for c in candidates if c.get("currentStage") == "rejected"])

        # Calculate time metrics (simplified)
        avg_time_in_pipeline = 0  # Would need to calculate from stage history

        return {
            "totalCandidates": total_candidates,
            "hiredCount": hired_count,
            "rejectedCount": rejected_count,
            "hiringRate": (hired_count / total_candidates * 100) if total_candidates > 0 else 0,
            "rejectionRate": (rejected_count / total_candidates * 100) if total_candidates > 0 else 0,
            "avgTimeInPipeline": avg_time_in_pipeline
        }
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error getting performance metrics: {str(e)}")


@router.get("/audit/actions")
def get_workflow_audit_log(
    limit: int = Query(50, description="Number of actions to return"),
    candidate_id: Optional[str] = Query(
        None, description="Filter by candidate ID"),
    action: Optional[str] = Query(None, description="Filter by action type"),
    performed_by: Optional[str] = Query(
        None, description="Filter by performer")
):
    """Get workflow audit log with optional filters"""
    try:
        query = supabase.table("candidate_stage_history").select("*")

        if candidate_id:
            query = query.eq("candidate_id", candidate_id)
        if action:
            query = query.eq("action", action)
        if performed_by:
            query = query.eq("performed_by", performed_by)

        response = query.order("timestamp", desc=True).limit(limit).execute()

        return {
            "actions": response.data,
            "total": len(response.data)
        }
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error getting audit log: {str(e)}")


@router.post("/bulk/action")
def bulk_workflow_action(
    action: str,
    candidate_ids: List[str],
    performed_by: str = "system",
    notes: Optional[str] = None
):
    """Perform the same action on multiple candidates"""
    try:
        # Validate action
        try:
            candidate_action = CandidateAction(action)
        except ValueError:
            raise HTTPException(
                status_code=400, detail=f"Invalid action: {action}")

        results = []
        for candidate_id in candidate_ids:
            result = WorkflowService.perform_action(
                candidate_id=candidate_id,
                action=candidate_action,
                performed_by=performed_by,
                notes=notes
            )
            results.append({
                "candidateId": candidate_id,
                "success": result.success,
                "message": result.message
            })

        success_count = len([r for r in results if r["success"]])

        return {
            "action": action,
            "totalCandidates": len(candidate_ids),
            "successCount": success_count,
            "failureCount": len(candidate_ids) - success_count,
            "results": results
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error performing bulk action: {str(e)}")


@router.get("/pipeline/health")
def get_pipeline_health():
    """Get pipeline health metrics and alerts"""
    try:
        # Get all candidates
        response = supabase.table("candidates").select("*").execute()
        candidates = response.data

        # Calculate health metrics
        total_candidates = len(candidates)
        stuck_candidates = 0  # Would need business logic to determine
        overdue_interviews = 0  # Would need to check interview dates

        # Check for candidates stuck in stages too long
        for candidate in candidates:
            stage = candidate.get("currentStage", "applied")
            # Add logic to check if candidate is stuck too long in a stage

        health_score = 100 - \
            (stuck_candidates / total_candidates *
             100) if total_candidates > 0 else 100

        alerts = []
        if stuck_candidates > 0:
            alerts.append(
                f"{stuck_candidates} candidates may be stuck in pipeline")
        if overdue_interviews > 0:
            alerts.append(f"{overdue_interviews} interviews are overdue")

        return {
            "healthScore": health_score,
            "totalCandidates": total_candidates,
            "stuckCandidates": stuck_candidates,
            "overdueInterviews": overdue_interviews,
            "alerts": alerts,
            "status": "healthy" if health_score > 80 else "needs_attention"
        }
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error getting pipeline health: {str(e)}")


@router.get("/stage/{stage}/analytics")
def get_stage_analytics(stage: str):
    """Get detailed analytics for a specific stage"""
    try:
        # Validate stage
        try:
            recruitment_stage = RecruitmentStage(stage)
        except ValueError:
            raise HTTPException(
                status_code=400, detail=f"Invalid stage: {stage}")

        # Get candidates in this stage
        candidates = WorkflowService.get_candidates_by_stage(recruitment_stage)

        # Calculate stage-specific metrics
        avg_time_in_stage = 0  # Would need to calculate from stage history
        conversion_rate = 0  # Would need to calculate from historical data

        return {
            "stage": stage,
            "candidateCount": len(candidates),
            "avgTimeInStage": avg_time_in_stage,
            "conversionRate": conversion_rate,
            "candidates": candidates
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error getting stage analytics: {str(e)}")


@router.get("/stages/{stage}/actions")
def get_stage_actions(stage: str):
    """Get available actions for a specific stage"""
    try:
        # Validate stage
        try:
            recruitment_stage = RecruitmentStage(stage)
        except ValueError:
            raise HTTPException(
                status_code=400, detail=f"Invalid stage: {stage}")

        actions = WorkflowStateMachine.get_available_actions(recruitment_stage)

        return {
            "stage": stage,
            "availableActions": [action.value for action in actions],
            "actionDescriptions": {
                action.value: WorkflowStateMachine.get_action_description(
                    action)
                for action in actions
            }
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error getting stage actions: {str(e)}")


@router.post("/validate-transition")
def validate_transition(current_stage: str, action: str):
    """Validate if a transition is allowed"""
    try:
        # Validate inputs
        try:
            recruitment_stage = RecruitmentStage(current_stage)
            candidate_action = CandidateAction(action)
        except ValueError as e:
            raise HTTPException(
                status_code=400, detail=f"Invalid stage or action: {str(e)}")

        # Check if transition is valid
        is_valid = WorkflowStateMachine.is_valid_transition(
            recruitment_stage, candidate_action)

        if is_valid:
            next_stage = WorkflowStateMachine.get_next_stage(
                recruitment_stage, candidate_action)
        else:
            next_stage = None

        return {
            "currentStage": current_stage,
            "action": action,
            "isValid": is_valid,
            "nextStage": next_stage.value if next_stage else None,
            "message": f"Valid transition to {next_stage.value}" if is_valid else "Invalid transition"
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error validating transition: {str(e)}")


@router.get("/flow-diagram")
def get_workflow_diagram():
    """Get workflow diagram data for visualization"""
    try:
        # Build workflow diagram data
        nodes = []
        edges = []

        for stage in RecruitmentStage:
            nodes.append({
                "id": stage.value,
                "label": WorkflowStateMachine.get_stage_description(stage),
                "color": WorkflowStateMachine.get_stage_color(stage),
                "isTerminal": WorkflowStateMachine.is_terminal_stage(stage)
            })

            # Add edges for valid transitions
            for action, next_stage in WorkflowStateMachine.TRANSITIONS.get(stage, []):
                if next_stage:  # Skip self-transitions
                    edges.append({
                        "from": stage.value,
                        "to": next_stage.value,
                        "action": action.value,
                        "label": WorkflowStateMachine.get_action_description(action)
                    })

        return {
            "nodes": nodes,
            "edges": edges,
            "totalStages": len(nodes),
            "totalTransitions": len(edges)
        }
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error getting workflow diagram: {str(e)}")


@router.post("/interview/schedule")
def schedule_interview_endpoint(
    candidate_id: str,
    interview_data: Dict[str, Any],
    scheduled_by: str = "system"
):
    """Schedule an interview for a candidate"""
    try:
        result = WorkflowService.schedule_interview(
            candidate_id=candidate_id,
            interview_data=interview_data,
            scheduled_by=scheduled_by
        )

        if not result.success:
            raise HTTPException(status_code=400, detail=result.message)

        return result
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error scheduling interview: {str(e)}")


@router.post("/interview/start")
def start_interview_endpoint(
    candidate_id: str,
    interviewer_id: str,
    interview_type: str = "technical"
):
    """Start an interview for a candidate"""
    try:
        result = WorkflowService.start_interview(
            candidate_id=candidate_id,
            interviewer_id=interviewer_id,
            interview_type=interview_type
        )

        if not result.success:
            raise HTTPException(status_code=400, detail=result.message)

        return result
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error starting interview: {str(e)}")


@router.post("/interview/complete")
def complete_interview_endpoint(
    interview_id: str,
    outcome: str,
    next_steps: List[str],
    completed_by: str = "system"
):
    """Complete an interview and update candidate stage"""
    try:
        result = WorkflowService.complete_interview(
            interview_id=interview_id,
            outcome=outcome,
            next_steps=next_steps,
            completed_by=completed_by
        )

        if not result.success:
            raise HTTPException(status_code=400, detail=result.message)

        return result
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error completing interview: {str(e)}")
