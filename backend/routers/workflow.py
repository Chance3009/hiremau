from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional, Dict, Any
from models import (
    RecruitmentStage, CandidateAction, ActionResult, WorkflowSummary,
    StageTransition, WorkflowAction
)
from firestore_client import db
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
        doc = db.collection("candidates").document(candidate_id).get()
        if not doc.exists:
            raise HTTPException(status_code=404, detail="Candidate not found")

        candidate_data = doc.to_dict()
        current_stage = candidate_data.get("currentStage", "applied")

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
        doc = db.collection("candidates").document(candidate_id).get()
        if not doc.exists:
            raise HTTPException(status_code=404, detail="Candidate not found")

        candidate_data = doc.to_dict()
        stage_history = candidate_data.get("stageHistory", [])

        return {
            "candidateId": candidate_id,
            "currentStage": candidate_data.get("currentStage", "applied"),
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
        transitions = []

        # Get all candidates and their stage history
        candidates = db.collection("candidates").stream()

        for candidate_doc in candidates:
            candidate_data = candidate_doc.to_dict()
            stage_history = candidate_data.get("stageHistory", [])

            for transition in stage_history:
                transition["candidateName"] = candidate_data.get(
                    "name", "Unknown")
                transitions.append(transition)

        # Sort by timestamp (most recent first)
        transitions.sort(key=lambda x: x.get("timestamp", ""), reverse=True)

        return {
            "transitions": transitions[:limit],
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
        candidates = list(db.collection("candidates").stream())

        metrics = {
            "totalCandidates": len(candidates),
            "stageDistribution": {},
            "averageTimeInStage": {},
            "bottlenecks": [],
            "completionRate": 0
        }

        # Calculate stage distribution
        for candidate_doc in candidates:
            candidate_data = candidate_doc.to_dict()
            stage = candidate_data.get("currentStage", "applied")
            metrics["stageDistribution"][stage] = metrics["stageDistribution"].get(
                stage, 0) + 1

        # Calculate completion rate (candidates who reached final stages)
        final_stages = ["final-review", "shortlisted"]
        completed_candidates = sum(
            metrics["stageDistribution"].get(stage, 0) for stage in final_stages
        )

        if metrics["totalCandidates"] > 0:
            metrics["completionRate"] = round(
                (completed_candidates / metrics["totalCandidates"]) * 100, 2)

        # Identify bottlenecks (stages with high candidate counts)
        total_candidates = metrics["totalCandidates"]
        for stage, count in metrics["stageDistribution"].items():
            # More than 40% in one stage
            if total_candidates > 0 and (count / total_candidates) > 0.4:
                metrics["bottlenecks"].append({
                    "stage": stage,
                    "count": count,
                    "percentage": round((count / total_candidates) * 100, 2)
                })

        return metrics
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error getting workflow performance: {str(e)}")


@router.get("/audit/actions")
def get_workflow_audit_log(
    limit: int = Query(50, description="Number of actions to return"),
    candidate_id: Optional[str] = Query(
        None, description="Filter by candidate ID"),
    action: Optional[str] = Query(None, description="Filter by action type"),
    performed_by: Optional[str] = Query(
        None, description="Filter by performer")
):
    """Get audit log of all workflow actions"""
    try:
        query = db.collection("workflow_actions")

        # Apply filters
        if candidate_id:
            query = query.where("candidateId", "==", candidate_id)
        if action:
            query = query.where("action", "==", action)
        if performed_by:
            query = query.where("performedBy", "==", performed_by)

        # Get documents ordered by timestamp
        docs = query.order_by(
            "timestamp", direction="DESCENDING").limit(limit).stream()

        actions = []
        for doc in docs:
            action_data = doc.to_dict()
            actions.append(action_data)

        return {
            "actions": actions,
            "total": len(actions),
            "filters": {
                "candidateId": candidate_id,
                "action": action,
                "performedBy": performed_by
            }
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
    """Perform a workflow action on multiple candidates"""
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
                "message": result.message,
                "newStage": result.newStage.value if result.newStage else None
            })

        successful_count = sum(1 for r in results if r["success"])

        return {
            "action": action,
            "totalCandidates": len(candidate_ids),
            "successful": successful_count,
            "failed": len(candidate_ids) - successful_count,
            "results": results
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error performing bulk action: {str(e)}")


@router.get("/pipeline/health")
def get_pipeline_health():
    """Get overall health metrics of the recruitment pipeline"""
    try:
        # Get workflow summary
        summary = WorkflowService.get_workflow_summary()

        # Calculate health metrics
        total_candidates = summary.totalCandidates

        if total_candidates == 0:
            return {
                "health": "healthy",
                "score": 100,
                "totalCandidates": 0,
                "issues": [],
                "recommendations": ["Start adding candidates to the pipeline"]
            }

        issues = []
        score = 100

        # Check for bottlenecks
        stage_breakdown = {
            stage.stage.value: stage.candidateCount for stage in summary.stageBreakdown}

        for stage, count in stage_breakdown.items():
            percentage = (count / total_candidates) * 100
            if percentage > 50:  # More than 50% in one stage
                issues.append(
                    f"Bottleneck detected in {stage} stage ({percentage:.1f}% of candidates)")
                score -= 20

        # Check for stagnant pipeline (no recent activity)
        recent_transitions = summary.recentTransitions
        if len(recent_transitions) == 0:
            issues.append("No recent activity in the pipeline")
            score -= 30
        else:
            # Check if recent activity is within last 7 days
            recent_dates = [t.timestamp for t in recent_transitions[:5]]
            seven_days_ago = (datetime.now() - timedelta(days=7)).isoformat()

            if all(date < seven_days_ago for date in recent_dates):
                issues.append("No activity in the last 7 days")
                score -= 15

        # Determine health status
        if score >= 80:
            health = "healthy"
        elif score >= 60:
            health = "warning"
        else:
            health = "critical"

        recommendations = []
        if "bottleneck" in str(issues).lower():
            recommendations.append(
                "Review and process candidates in bottleneck stages")
        if "activity" in str(issues).lower():
            recommendations.append(
                "Increase pipeline activity and candidate processing")
        if not issues:
            recommendations.append(
                "Pipeline is healthy - maintain current processing rate")

        return {
            "health": health,
            "score": max(0, score),
            "totalCandidates": total_candidates,
            "stageBreakdown": stage_breakdown,
            "issues": issues,
            "recommendations": recommendations,
            "lastActivity": recent_transitions[0].timestamp if recent_transitions else None
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

        analytics = {
            "stage": stage,
            "candidateCount": len(candidates),
            "averageTimeInStage": 0,
            "inboundActions": {},
            "outboundActions": {},
            "conversionRate": 0
        }

        # Analyze stage transitions to calculate time in stage and actions
        all_candidates = db.collection("candidates").stream()

        inbound_actions = {}
        outbound_actions = {}
        stage_durations = []

        for candidate_doc in all_candidates:
            candidate_data = candidate_doc.to_dict()
            stage_history = candidate_data.get("stageHistory", [])

            for i, transition in enumerate(stage_history):
                # Count inbound actions to this stage
                if transition.get("toStage") == stage:
                    action = transition.get("action", "unknown")
                    inbound_actions[action] = inbound_actions.get(
                        action, 0) + 1

                # Count outbound actions from this stage
                if transition.get("fromStage") == stage:
                    action = transition.get("action", "unknown")
                    outbound_actions[action] = outbound_actions.get(
                        action, 0) + 1

                # Calculate time in stage (simplified - would need more sophisticated logic)
                if transition.get("fromStage") == stage and i < len(stage_history) - 1:
                    # This is a rough calculation - in production you'd want more precise timing
                    stage_durations.append(1)  # Placeholder: 1 day average

        if stage_durations:
            analytics["averageTimeInStage"] = sum(
                stage_durations) / len(stage_durations)

        analytics["inboundActions"] = inbound_actions
        analytics["outboundActions"] = outbound_actions

        return analytics
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error getting stage analytics: {str(e)}")


@router.get("/stages/{stage}/actions")
def get_stage_actions(stage: str):
    """Get available actions for a specific stage"""
    try:
        recruitment_stage = RecruitmentStage(stage)
        actions = WorkflowStateMachine.get_available_actions(recruitment_stage)

        return {
            "stage": stage,
            "description": WorkflowStateMachine.get_stage_description(recruitment_stage),
            "availableActions": [
                {
                    "action": action.value,
                    "description": WorkflowStateMachine.get_action_description(action),
                    "nextStage": WorkflowStateMachine.get_next_stage(recruitment_stage, action).value
                    if WorkflowStateMachine.get_next_stage(recruitment_stage, action) else stage
                }
                for action in actions
            ]
        }
    except ValueError:
        raise HTTPException(status_code=400, detail=f"Invalid stage: {stage}")


@router.post("/validate-transition")
def validate_transition(current_stage: str, action: str):
    """Validate if a transition is allowed"""
    try:
        stage = RecruitmentStage(current_stage)
        candidate_action = CandidateAction(action)

        is_valid = WorkflowStateMachine.is_valid_transition(
            stage, candidate_action)
        next_stage = None

        if is_valid:
            next_stage = WorkflowStateMachine.get_next_stage(
                stage, candidate_action)

        return {
            "valid": is_valid,
            "currentStage": current_stage,
            "action": action,
            "nextStage": next_stage.value if next_stage else None,
            "message": "Valid transition" if is_valid else f"Invalid action '{action}' for stage '{current_stage}'"
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/flow-diagram")
def get_workflow_diagram():
    """Get workflow flow data for diagram generation"""
    nodes = []
    edges = []

    # Create nodes for each stage
    for stage in RecruitmentStage:
        nodes.append({
            "id": stage.value,
            "label": WorkflowStateMachine.get_stage_description(stage),
            "color": WorkflowStateMachine.get_stage_color(stage),
            "isTerminal": WorkflowStateMachine.is_terminal_stage(stage)
        })

    # Create edges for each valid transition
    for stage in RecruitmentStage:
        actions = WorkflowStateMachine.get_available_actions(stage)
        for action in actions:
            try:
                next_stage = WorkflowStateMachine.get_next_stage(stage, action)
                if next_stage and next_stage != stage:  # Don't show self-loops
                    edges.append({
                        "from": stage.value,
                        "to": next_stage.value,
                        "label": WorkflowStateMachine.get_action_description(action),
                        "action": action.value
                    })
            except ValueError:
                continue

    return {
        "nodes": nodes,
        "edges": edges,
        "metadata": {
            "totalStages": len(nodes),
            "totalTransitions": len(edges),
            "terminalStages": [node["id"] for node in nodes if node["isTerminal"]]
        }
    }
