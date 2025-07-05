from fastapi import APIRouter, HTTPException, UploadFile, File, Form
from fastapi.responses import JSONResponse
from typing import List, Optional, Dict, Any
import json
import logging
import requests
from services.candidate_service import CandidateService

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/candidates", tags=["candidates"])

# Initialize service
candidate_service = CandidateService()


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


@router.post("/")
async def create_candidate(
    candidate_data: str = Form(...),
    resume_file: UploadFile = File(None)
):
    """Create a new candidate - main endpoint for frontend"""
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


@router.get("/final-review")
async def get_final_review_candidates():
    """Get candidates in final_review stage with their initial screening evaluation data"""
    try:
        # First, get all candidates in final_review stage
        candidates_response = candidate_service.db.table("candidates").select(
            "*"
        ).eq("stage", "final_review").execute()

        if not candidates_response.data:
            return JSONResponse(content={
                "candidates": [],
                "count": 0,
                "message": "No candidates in final review stage"
            })

        candidates_with_evaluation = []

        for candidate in candidates_response.data:
            # Fetch evaluation data for each candidate
            evaluation_response = candidate_service.db.table("initial_screening_evaluation").select(
                "*"
            ).eq("candidate_id", candidate["id"]).order("created_at", desc=True).limit(1).execute()

            # Get the most recent evaluation
            evaluation_data = evaluation_response.data[0] if evaluation_response.data else None

            # Combine candidate data with evaluation
            candidate_with_eval = {
                **candidate,
                "evaluation_data": evaluation_data,
                "formatted_phone": candidate.get("phone", "").replace("+60", "").strip() if candidate.get("phone") else "",
                "formatted_salary": f"RM {candidate.get('salary_expectations', 0):,.2f}" if candidate.get('salary_expectations') else None,
                "country": "Malaysia",
                "currency": "MYR"
            }

            candidates_with_evaluation.append(candidate_with_eval)

        return JSONResponse(content={
            "candidates": candidates_with_evaluation,
            "count": len(candidates_with_evaluation),
            "message": "Final review candidates retrieved successfully"
        })

    except Exception as e:
        logger.error(f"Error fetching final review candidates: {str(e)}")
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

        # Define allowed actions by stage - updated to match database constraints
        stage_actions = {
            # shortlist moves to "screened"
            "applied": ["shortlist", "reject"],
            # schedule_interview moves to "interview"
            "screened": ["schedule_interview", "move_to_shortlisted", "reject"],
            # After interview can shortlist or move to final
            "interview": ["move_to_shortlisted", "move_to_final", "reject"],
            # From shortlist can go to final or offer
            "shortlisted": ["move_to_final", "send_offer", "reject"],
            # From final review can offer or reject
            "final_review": ["send_offer", "reject"],
            # From offer can hire, decline, or reject
            "offer": ["hire", "decline", "reject"],
            "hired": ["onboard"],  # From hired can onboard
            "onboarded": [],  # Final stage
            "rejected": [],  # Final stage
            "declined": []  # Final stage
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
        # Updated action_to_stage mapping to match database constraints
        action_to_stage = {
            "shortlist": "screened",  # Changed from "shortlisted" to "screened"
            "reject": "rejected",
            "schedule_interview": "interview",  # Changed from "interviewed" to "interview"
            "move_to_screening": "screened",  # Changed from "screening" to "screened"
            "move_to_shortlisted": "shortlisted",  # New action for final shortlist
            "move_to_final": "final_review",  # New action for final review
            "send_offer": "offer",  # New action for offer
            "hire": "hired",  # New action for hired
            "decline": "declined",  # New action for declined
            "onboard": "onboarded"  # New action for onboarded
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


@router.get("/{candidate_id}/evaluation")
async def get_candidate_evaluation(candidate_id: str):
    """Get initial screening evaluation data for a candidate"""
    try:
        # Fetch from initial_screening_evaluation table
        result = candidate_service.db.table("initial_screening_evaluation").select(
            "*"
        ).eq("candidate_id", candidate_id).execute()

        if not result.data:
            # Return empty evaluation if none found
            return JSONResponse(content={
                "candidate_id": candidate_id,
                "evaluation": None,
                "message": "No evaluation data found"
            })

        # Get the most recent evaluation
        evaluation = result.data[0]

        return JSONResponse(content={
            "candidate_id": candidate_id,
            "evaluation": evaluation,
            "message": "Evaluation data retrieved successfully"
        })

    except Exception as e:
        logger.error(
            f"Error fetching evaluation for candidate {candidate_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{candidate_id}/files")
async def get_candidate_files(candidate_id: str):
    """Get files for a specific candidate"""
    try:
        # Get candidate files from database
        files_response = candidate_service.db.table("candidate_files").select(
            "*"
        ).eq("candidate_id", candidate_id).execute()

        candidate_files = files_response.data if files_response.data else []

        return JSONResponse(content={
            "candidate_id": candidate_id,
            "files": candidate_files,
            "count": len(candidate_files)
        })

    except Exception as e:
        logger.error(
            f"Error fetching files for candidate {candidate_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{candidate_id}/interview-data")
async def get_candidate_interview_data(candidate_id: str):
    """Get interview data for a candidate"""
    try:
        # Fetch interview data from initial_screening_evaluation
        evaluation_response = candidate_service.db.table("initial_screening_evaluation").select(
            "*"
        ).eq("candidate_id", candidate_id).execute()

        interview_data = []
        if evaluation_response.data:
            for evaluation in evaluation_response.data:
                interview_data.append({
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

        return JSONResponse(content={
            "interview_data": interview_data,
            "candidate_id": candidate_id,
            "count": len(interview_data)
        })

    except Exception as e:
        logger.error(
            f"Error fetching interview data for candidate {candidate_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/system/agent-health")
async def check_agent_health():
    """Check if the agent service is healthy and responding"""
    try:
        health_status = await candidate_service.get_agent_health()
        return JSONResponse(content=health_status)
    except Exception as e:
        logger.error(f"Error checking agent health: {str(e)}")
        return JSONResponse(content={
            "status": "error",
            "agent_available": False,
            "error": str(e)
        })


@router.post("/test-agent")
async def test_agent_integration():
    """Test the agent integration with a sample document"""
    try:
        # Create a test payload
        test_payload = {
            "name": "test_resume.pdf",
            "url": "https://example.com/test_resume.pdf",
            "uuid": "test-candidate-id",
            "candidate_id": "test-candidate-id",
            "file_type": "resume"
        }

        # Test the agent processing
        result = await candidate_service._process_file_with_agent("test-candidate-id", test_payload)

        return JSONResponse(content={
            "success": result,
            "message": "Agent test completed",
            "test_payload": test_payload
        })

    except Exception as e:
        logger.error(f"Error testing agent integration: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
