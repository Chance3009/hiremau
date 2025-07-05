from fastapi import APIRouter, HTTPException, BackgroundTasks
from typing import Dict, Any, Optional
from services.evaluation_service import evaluation_service
from pydantic import BaseModel
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/evaluation", tags=["evaluation"])


class EvaluationTriggerRequest(BaseModel):
    candidate_id: str
    resume_url: str
    candidate_name: str
    position_applied: str = ""


class EvaluationResponse(BaseModel):
    success: bool
    message: str
    data: Optional[Dict[str, Any]] = None


@router.post("/trigger", response_model=EvaluationResponse)
async def trigger_evaluation(request: EvaluationTriggerRequest, background_tasks: BackgroundTasks):
    """
    Trigger evaluation for a candidate
    """
    try:
        # Add the evaluation process as a background task
        background_tasks.add_task(
            evaluation_service.process_candidate_evaluation_async,
            request.candidate_id,
            request.resume_url,
            request.candidate_name,
            request.position_applied
        )

        return EvaluationResponse(
            success=True,
            message="Evaluation process started in background",
            data={"candidate_id": request.candidate_id}
        )

    except Exception as e:
        logger.error(f"Error triggering evaluation: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/candidate/{candidate_id}", response_model=EvaluationResponse)
async def get_candidate_evaluation(candidate_id: str):
    """
    Get evaluation data for a candidate
    """
    try:
        evaluation_data = await evaluation_service.get_candidate_evaluation(candidate_id)

        if evaluation_data:
            return EvaluationResponse(
                success=True,
                message="Evaluation data retrieved successfully",
                data=evaluation_data
            )
        else:
            return EvaluationResponse(
                success=False,
                message="No evaluation data found for this candidate",
                data=None
            )

    except Exception as e:
        logger.error(f"Error getting evaluation: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/manual-save")
async def manual_save_evaluation(candidate_id: str, evaluation_data: Dict[str, Any]):
    """
    Manually save evaluation data (for testing or manual input)
    """
    try:
        result = await evaluation_service.save_initial_screening_evaluation(candidate_id, evaluation_data)

        if result["success"]:
            return EvaluationResponse(
                success=True,
                message="Evaluation saved successfully",
                data={"evaluation_id": result["evaluation_id"]}
            )
        else:
            raise HTTPException(status_code=500, detail=result["error"])

    except Exception as e:
        logger.error(f"Error saving evaluation: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/status/{candidate_id}")
async def get_evaluation_status(candidate_id: str):
    """
    Get the evaluation status for a candidate
    """
    try:
        evaluation_data = await evaluation_service.get_candidate_evaluation(candidate_id)

        if evaluation_data:
            return {
                "candidate_id": candidate_id,
                "has_evaluation": True,
                "evaluation_date": evaluation_data.get("evaluation_date"),
                "recommendation": evaluation_data.get("recommendation"),
                "last_updated": evaluation_data.get("updated_at")
            }
        else:
            return {
                "candidate_id": candidate_id,
                "has_evaluation": False,
                "status": "No evaluation found"
            }

    except Exception as e:
        logger.error(f"Error getting evaluation status: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
