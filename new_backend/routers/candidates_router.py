from fastapi import APIRouter, HTTPException, Query
from services.candidate_service import CandidateService
from services.workflow_service import WorkflowService
from models import CandidateCreate, CandidateUpdate, RecruitmentStage, CandidateAction

router = APIRouter(tags=["candidates"])


@router.get("/")
def api_list_candidates(
    status: str = Query(None),
    stage: str = Query(None),
    event_id: str = Query(None),
    position_id: str = Query(None)
):
    try:
        return CandidateService.list_candidates(status, stage, event_id, position_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{candidate_id}")
def api_get_candidate(candidate_id: str):
    candidate = CandidateService.get_candidate(candidate_id)
    if not candidate:
        raise HTTPException(status_code=404, detail="Candidate not found")
    return candidate


@router.post("/")
def api_create_candidate(candidate: CandidateCreate):
    return CandidateService.create_candidate(candidate)


@router.put("/{candidate_id}")
def api_update_candidate(candidate_id: str, candidate: CandidateUpdate):
    return CandidateService.update_candidate(candidate_id, candidate)


@router.delete("/{candidate_id}")
def api_delete_candidate(candidate_id: str):
    return CandidateService.delete_candidate(candidate_id)


# Workflow endpoints
@router.get("/{candidate_id}/available-actions")
def get_candidate_available_actions(candidate_id: str):
    """Get available workflow actions for a candidate"""
    try:
        actions = CandidateService.get_available_actions(candidate_id)
        return {
            "candidateId": candidate_id,
            "availableActions": [action.value for action in actions]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/{candidate_id}/action/{action}")
def perform_candidate_action(
    candidate_id: str,
    action: str,
    performed_by: str = "system",
    notes: str = None
):
    """Perform a workflow action on a candidate"""
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
            notes=notes
        )

        if not result.success:
            raise HTTPException(status_code=400, detail=result.message)

        return result
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/stage/{stage}")
def get_candidates_by_stage(stage: str):
    """Get all candidates in a specific stage"""
    try:
        # Validate stage
        try:
            recruitment_stage = RecruitmentStage(stage)
        except ValueError:
            raise HTTPException(
                status_code=400, detail=f"Invalid stage: {stage}")

        candidates = CandidateService.get_candidates_by_stage(
            recruitment_stage)
        return {
            "stage": stage,
            "candidates": candidates,
            "count": len(candidates)
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/workflow/summary")
def get_workflow_summary():
    """Get workflow summary with stage breakdown"""
    try:
        summary = CandidateService.get_workflow_summary()
        return summary
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
