from fastapi import APIRouter, HTTPException, UploadFile, File, Form
from fastapi.responses import JSONResponse
from typing import List, Optional, Dict, Any
import json
import logging
import requests
from services.candidate_service_simplified import SimplifiedCandidateService

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/candidates", tags=["candidates"])

# Initialize service
candidate_service = SimplifiedCandidateService()


@router.get("/")
async def get_candidates(stage: str = None):
    """Get candidates with optional stage filter"""
    try:
        if stage:
            candidates = await candidate_service.get_candidates_by_stage(stage)
        else:
            # Get all candidates
            candidates = await candidate_service.search_candidates("", {})

        return JSONResponse(content=candidates)

    except Exception as e:
        logger.error(f"Error fetching candidates: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/create_with_processing")
async def create_candidate_with_processing(
    candidate_data: str = Form(...),
    resume_file: UploadFile = File(None)
):
    """Create candidate and process their documents"""
    try:
        # Parse candidate data
        candidate_info = json.loads(candidate_data)

        # Handle file uploads (simplified)
        files = []
        if resume_file:
            files.append({
                "name": resume_file.filename,
                "url": f"https://mock-url/{resume_file.filename}",
                "type": "resume"
            })

        # Create candidate with processing
        result = await candidate_service.create_candidate_with_processing(
            candidate_info, files
        )

        return JSONResponse(content=result)

    except Exception as e:
        logger.error(f"Error creating candidate: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{candidate_id}")
async def get_candidate_by_id(candidate_id: str):
    """Get candidate by ID with evaluation data"""
    try:
        candidate = await candidate_service.get_candidate_by_id(candidate_id)

        if not candidate:
            raise HTTPException(status_code=404, detail="Candidate not found")

        # Format for frontend
        formatted_candidate = {
            **candidate,
            "formatted_salary": f"RM {candidate.get('salary_expectations', 0):,.2f}" if candidate.get('salary_expectations') else "Not specified",
            "formatted_phone": candidate.get("phone", "").replace("+60", "").strip() if candidate.get("phone") else "",
            "country": "Malaysia",
            "currency": "MYR",
            "evaluation_data": candidate.get("evaluation_data", []),
            "ai_analysis": candidate.get("ai_analysis", [])
        }

        return JSONResponse(content=formatted_candidate)

    except Exception as e:
        logger.error(f"Error fetching candidate {candidate_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{candidate_id}/actions")
async def get_allowed_actions(candidate_id: str):
    """Get allowed actions for a candidate"""
    try:
        candidate = await candidate_service.get_candidate_by_id(candidate_id)

        if not candidate:
            raise HTTPException(status_code=404, detail="Candidate not found")

        current_stage = candidate.get("stage", "applied")

        # Define allowed actions by stage
        stage_actions = {
            "applied": ["move_to_screening", "reject"],
            "screening": ["schedule_interview", "shortlist", "reject"],
            "interviewed": ["shortlist", "reject"],
            "shortlisted": ["reject"],
            "rejected": []
        }

        allowed_actions = stage_actions.get(current_stage, [])
        return JSONResponse(content=allowed_actions)

    except Exception as e:
        logger.error(
            f"Error getting actions for candidate {candidate_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/{candidate_id}/actions/{action}")
async def perform_candidate_action(
    candidate_id: str,
    action: str,
    action_data: Dict[str, Any] = None
):
    """Perform an action on a candidate"""
    try:
        action_to_stage = {
            "shortlist": "shortlisted",
            "reject": "rejected",
            "schedule_interview": "interviewed",
            "move_to_screening": "screening"
        }

        new_stage = action_to_stage.get(action)
        if not new_stage:
            raise HTTPException(
                status_code=400, detail=f"Unknown action: {action}")

        success = await candidate_service.update_candidate_stage(candidate_id, new_stage)

        if not success:
            raise HTTPException(
                status_code=500, detail="Failed to perform action")

        return JSONResponse(content={
            "success": True,
            "message": f"Candidate {action} successfully",
            "new_stage": new_stage
        })

    except Exception as e:
        logger.error(f"Error performing action {action}: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
