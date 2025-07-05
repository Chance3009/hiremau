from fastapi import APIRouter, Depends, HTTPException, File, UploadFile, Form, Query, BackgroundTasks
from typing import List, Optional, Dict, Any
from models import (
    Candidate, CandidateCreate, CandidateUpdate,
    CandidateStatus, RecruitmentStage, CandidateAction,
    StageTransition, WorkflowAction
)
from services.candidate_service import CandidateService
from services.base import BaseService
from services.storage_service import StorageService
from services.agent_service import AgentService
from services.evaluation_service import evaluation_service
from services.stage_management_service import stage_management_service
import json
from pydantic import BaseModel
import os
import logging
from datetime import datetime
import uuid

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/candidates", tags=["candidates"])
candidate_service = CandidateService()
storage_service = StorageService()
agent_service = AgentService()


@router.post("/", response_model=Dict[str, Any])
async def create_candidate(
    background_tasks: BackgroundTasks,
    candidate_data: str = Form(...),
    resume_file: Optional[UploadFile] = File(None),
    supporting_docs: Optional[List[UploadFile]] = File(None)
):
    """Create a new candidate with optional resume upload and trigger evaluation"""
    try:
        # Parse candidate data
        data = json.loads(candidate_data)
        logger.info(f"Creating candidate with data: {data}")

        # Create candidate in database
        candidate_id = await candidate_service.create_candidate(data)
        logger.info(f"Created candidate with ID: {candidate_id}")

        # Handle resume upload if provided
        resume_url = None
        if resume_file:
            try:
                # Upload resume to storage
                resume_url = await storage_service.upload_resume(resume_file, candidate_id)

                # Save file record to candidate_files table
                file_record = {
                    "candidate_id": candidate_id,
                    "file_type": resume_file.content_type,
                    "file_url": resume_url,
                    "file_name": resume_file.filename,
                    "file_size": resume_file.size,
                    "file_category": "resume"
                }

                # Insert file record
                from supabase_client import supabase
                result = supabase.table("candidate_files").insert(
                    file_record).execute()
                logger.info(f"Saved resume file record: {result.data}")

                # Update candidate with resume URL
                await candidate_service.update_candidate_resume(candidate_id, resume_url)

                # Trigger evaluation in background
                background_tasks.add_task(
                    evaluation_service.process_candidate_evaluation_async,
                    candidate_id,
                    resume_url,
                    data.get("name", "Unknown"),
                    data.get("job_id", "")
                )
                logger.info(
                    f"Triggered evaluation for candidate {candidate_id}")
            except Exception as upload_error:
                logger.error(f"Error uploading resume: {str(upload_error)}")
                # Continue without resume - don't fail the entire candidate creation
                resume_url = None

        # Handle supporting documents if provided
        supporting_doc_urls = []
        if supporting_docs:
            for doc in supporting_docs:
                try:
                    doc_url = await storage_service.upload_supporting_doc(doc, candidate_id)
                    supporting_doc_urls.append(doc_url)

                    # Save file record
                    file_record = {
                        "candidate_id": candidate_id,
                        "file_type": doc.content_type,
                        "file_url": doc_url,
                        "file_name": doc.filename,
                        "file_size": doc.size,
                        "file_category": "supporting_document"
                    }

                    result = supabase.table("candidate_files").insert(
                        file_record).execute()
                    logger.info(
                        f"Saved supporting doc file record: {result.data}")
                except Exception as doc_error:
                    logger.error(
                        f"Error uploading supporting document: {str(doc_error)}")
                    # Continue with other documents

        return {
            "success": True,
            "id": candidate_id,
            "candidate_id": candidate_id,
            "resume_url": resume_url,
            "supporting_doc_urls": supporting_doc_urls,
            "evaluation_triggered": resume_url is not None,
            "message": f"Candidate created successfully{'with resume' if resume_url else ''}"
        }

    except Exception as e:
        logger.error(f"Error creating candidate: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{candidate_id}", response_model=Dict[str, Any])
async def get_candidate(
    candidate_id: str,
    service: CandidateService = Depends(CandidateService.get_instance)
):
    """Get a candidate by ID"""
    try:
        candidate = await service.get_candidate_by_id(candidate_id)
        if not candidate:
            raise HTTPException(status_code=404, detail="Candidate not found")
        return candidate
    except Exception as e:
        logger.error(f"Error fetching candidate: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.put("/{candidate_id}", response_model=Dict[str, Any])
async def update_candidate(
    candidate_id: str,
    candidate: CandidateUpdate,
    service: CandidateService = Depends(CandidateService.get_instance)
):
    """Update a candidate"""
    try:
        updated_candidate = service.update_candidate(candidate_id, candidate)
        return updated_candidate
    except Exception as e:
        logger.error(f"Error updating candidate: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/{candidate_id}", response_model=Dict[str, Any])
async def delete_candidate(
    candidate_id: str,
    service: CandidateService = Depends(CandidateService.get_instance)
):
    """Delete a candidate"""
    try:
        result = service.delete_candidate(candidate_id)
        return result
    except Exception as e:
        logger.error(f"Error deleting candidate: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/stage/{stage}", response_model=List[Dict[str, Any]])
async def get_candidates_by_stage(
    stage: RecruitmentStage,
    service: CandidateService = Depends(CandidateService.get_instance)
):
    """Get candidates by recruitment stage"""
    try:
        candidates = await service.get_candidates_by_stage(stage.value)
        return candidates
    except Exception as e:
        logger.error(f"Error fetching candidates by stage: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/{candidate_id}/actions/{action}", response_model=Dict[str, Any])
async def perform_candidate_action(
    candidate_id: str,
    action: CandidateAction,
    metadata: Optional[Dict[str, Any]] = None,
    service: CandidateService = Depends(CandidateService.get_instance)
):
    """Perform an action on a candidate"""
    try:
        result = service.perform_action(candidate_id, action, metadata)
        return result
    except Exception as e:
        logger.error(f"Error performing action: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{candidate_id}/history", response_model=List[Dict[str, Any]])
async def get_candidate_history(
    candidate_id: str,
    service: CandidateService = Depends(CandidateService.get_instance)
):
    """Get candidate action history"""
    try:
        history = service.get_stage_history(candidate_id)
        return history
    except Exception as e:
        logger.error(f"Error fetching candidate history: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/workflow/summary", response_model=Dict[str, Any])
async def get_workflow_summary(
    service: CandidateService = Depends(CandidateService.get_instance)
):
    """Get a summary of the recruitment workflow"""
    return service.get_workflow_summary()


# Temporarily disabled until python-multipart is installed
# @router.post("/{candidate_id}/files", response_model=Dict[str, Any])
# async def upload_candidate_file(
#     candidate_id: str,
#     file: UploadFile = File(...),
#     service: CandidateService = Depends(CandidateService.get_instance)
# ):
#     """Upload a file for a candidate"""
#     try:
#         # Read file content
#         content = await file.read()
#
#         # Upload to Supabase storage
#         file_path = f"candidate-files/{candidate_id}/{file.filename}"
#         result = service.db.storage.from_("candidate-files").upload(
#             file_path,
#             content
#         )
#
#         # Get public URL
#         file_url = service.db.storage.from_(
#             "candidate-files").get_public_url(file_path)
#
#         # Create file record
#         file_record = {
#             "candidate_id": candidate_id,
#             "file_type": file.content_type,
#             "file_url": file_url,
#             "file_name": file.filename,
#             "file_size": len(content)
#         }
#
#         result = service.db.table(
#             "candidate_files").insert(file_record).execute()
#
#         return {
#             "success": True,
#             "file_id": result.data[0]["id"],
#             "file_url": file_url
#         }
#
#     except Exception as e:
#         raise HTTPException(status_code=500, detail=str(e))


@router.get("/{candidate_id}/files", response_model=List[Dict[str, Any]])
async def get_candidate_files(
    candidate_id: str
):
    """Get all files for a candidate"""
    try:
        from supabase_client import supabase

        # Get files from candidate_files table
        result = supabase.table("candidate_files").select(
            "*").eq("candidate_id", candidate_id).execute()

        return result.data if result.data else []

    except Exception as e:
        logger.error(f"Error fetching candidate files: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{candidate_id}/evaluation", response_model=Dict[str, Any])
async def get_candidate_evaluation(
    candidate_id: str
):
    """Get evaluation data for a candidate"""
    try:
        evaluation_data = await evaluation_service.get_candidate_evaluation(candidate_id)

        if not evaluation_data:
            return {"success": False, "message": "No evaluation data found"}

        return {
            "success": True,
            "evaluation": evaluation_data
        }

    except Exception as e:
        logger.error(f"Error fetching candidate evaluation: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/{candidate_id}/trigger-evaluation", response_model=Dict[str, Any])
async def trigger_candidate_evaluation(
    candidate_id: str,
    background_tasks: BackgroundTasks
):
    """Manually trigger evaluation for a candidate"""
    try:
        # Get candidate data
        candidate = await candidate_service.get_candidate_by_id(candidate_id)
        if not candidate:
            raise HTTPException(status_code=404, detail="Candidate not found")

        # Get resume file
        from supabase_client import supabase
        files_result = supabase.table("candidate_files").select(
            "*").eq("candidate_id", candidate_id).eq("file_category", "resume").execute()

        if not files_result.data:
            raise HTTPException(
                status_code=400, detail="No resume file found for candidate")

        resume_file = files_result.data[0]

        # Trigger evaluation in background
        background_tasks.add_task(
            evaluation_service.process_candidate_evaluation_async,
            candidate_id,
            resume_file["file_url"],
            candidate.get("name", "Unknown"),
            candidate.get("job_id", "")
        )

        return {
            "success": True,
            "message": "Evaluation triggered successfully"
        }

    except Exception as e:
        logger.error(f"Error triggering evaluation: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/stage/{stage}/details", response_model=List[Dict[str, Any]])
async def get_candidates_by_stage_with_details(
    stage: RecruitmentStage,
    service: CandidateService = Depends(CandidateService.get_instance)
):
    """Get candidates with stage-specific details"""
    return service.get_candidates_by_stage_with_details(stage)


@router.get("/candidates/stage/{stage}")
async def get_candidates_by_stage_str(stage: str):
    try:
        candidates = await candidate_service.get_candidates_by_stage(stage)
        return candidates
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/candidates/{candidate_id}")
async def get_candidate_str(candidate_id: str):
    try:
        candidate = await candidate_service.get_candidate_by_id(candidate_id)
        if not candidate:
            raise HTTPException(status_code=404, detail="Candidate not found")
        return candidate
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.put("/candidates/{candidate_id}/stage")
async def update_candidate_stage(candidate_id: str, stage: str):
    try:
        await candidate_service.update_candidate_stage(candidate_id, stage)
        return {"status": "success", "message": "Stage updated successfully"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/quick-register")
async def quick_register_candidate(
    candidate_data: str = Form(...),
    resume_file: Optional[UploadFile] = None,
    background_tasks: BackgroundTasks = BackgroundTasks(),
) -> Dict[str, Any]:
    """
    Quick register a candidate with basic info and optional resume.
    """
    try:
        logger.info("Starting quick register process")
        logger.info(f"Received raw candidate data: {candidate_data}")
        logger.info(f"Resume file received: {True if resume_file else False}")

        # Parse the candidate data
        data = json.loads(candidate_data)

        logger.info(f"Parsed candidate registration data: {data}")

        # Generate unique candidate ID
        candidate_id = str(uuid.uuid4())
        logger.info(f"Generated candidate ID: {candidate_id}")

        # Prepare candidate data for database - only include fields that exist in the candidates table
        candidate_db_data = {
            "id": candidate_id,
            "name": data["name"],
            "email": data["email"],
            "phone": data["phone"],
            "current_position": data.get("current_position", ""),
            "years_experience": int(data.get("years_experience", 0)) if data.get("years_experience") else 0,
            "education": data.get("education", ""),
            "experience": data.get("experience", ""),
            "skills": data.get("skills", []),
            "linkedin_url": data.get("linkedin_url", ""),
            "github_url": data.get("github_url", ""),
            "portfolio_url": data.get("portfolio_url", ""),
            "availability": data.get("availability", "immediately"),
            "salary_expectations": float(data.get("salary_expectations", 0)) if data.get("salary_expectations") else None,
            "preferred_work_type": data.get("preferred_work_type", "full_time"),
            "source": data.get("source", "direct"),
            "stage": "applied",
            "status": "active",
            "notes": f"Registered from {data.get('source', 'direct')} - Malaysia",
            "certifications": data.get("certifications", []),
            "languages": data.get("languages", ["English", "Bahasa Malaysia"])
        }

        logger.info(
            f"Prepared candidate data for database: {candidate_db_data}")

        # Create candidate in database
        created_candidate_id = await candidate_service.create_candidate(candidate_db_data)

        if not created_candidate_id:
            raise Exception("Failed to create candidate in database")

        logger.info(
            f"Successfully created candidate with ID: {created_candidate_id}")

        # Handle resume upload if provided
        resume_url = None
        if resume_file:
            try:
                logger.info(
                    f"Processing resume upload for candidate {created_candidate_id}")
                resume_url = await storage_service.upload_resume(resume_file, created_candidate_id)

                if resume_url:
                    await candidate_service.update_candidate_resume(created_candidate_id, resume_url)

                    # Trigger evaluation in background
                    background_tasks.add_task(
                        evaluation_service.process_candidate_evaluation_async,
                        created_candidate_id,
                        resume_url,
                        data["name"],
                        data.get("job_id", "")
                    )

                    logger.info(
                        f"Resume uploaded and evaluation triggered for candidate {created_candidate_id}")

            except Exception as e:
                logger.error(f"Error handling resume upload: {str(e)}")
                # Continue without resume if upload fails
                pass

        # Create event registration if event_id is provided
        if data.get("event_id"):
            try:
                logger.info(
                    f"Creating event registration for candidate {created_candidate_id} and event {data['event_id']}")

                success = await candidate_service.create_event_registration(
                    created_candidate_id,
                    data["event_id"]
                )

                if success:
                    logger.info(f"Event registration created successfully")
                else:
                    logger.warning(f"Failed to create event registration")

            except Exception as e:
                logger.error(f"Error creating event registration: {str(e)}")
                # Continue without event registration if it fails
                pass

        # Store job application info in notes if job_id is provided
        if data.get("job_id"):
            try:
                logger.info(
                    f"Adding job application note for candidate {created_candidate_id} and job {data['job_id']}")

                # Get current notes and append job info
                current_notes = candidate_db_data.get("notes", "")
                job_note = f"Applied for job ID: {data['job_id']}"
                updated_notes = f"{current_notes} | {job_note}" if current_notes else job_note

                # Update candidate notes
                candidate_service.db.table("candidates").update({
                    "notes": updated_notes,
                    "updated_at": datetime.utcnow().isoformat()
                }).eq("id", created_candidate_id).execute()

                logger.info(
                    f"Job application noted for candidate {created_candidate_id}")

            except Exception as e:
                logger.error(f"Error noting job application: {str(e)}")
                # Continue without job application note if it fails
                pass

        logger.info(
            f"Candidate registration completed successfully: {created_candidate_id}")

        return {
            "success": True,
            "id": created_candidate_id,
            "message": "Candidate registered successfully",
            "evaluation_status": "processing" if resume_file else "no_resume",
            "resume_url": resume_url,
            "country": "Malaysia",
            "currency": "MYR",
            "timezone": "Asia/Kuala_Lumpur",
            "formatted_phone": data["phone"].replace("+60", "").strip() if data.get("phone") else "",
            "formatted_salary": f"RM {data.get('salary_expectations', 0):,.2f}" if data.get('salary_expectations') else "Not specified",
            # Include the event and job IDs for reference
            "event_id": data.get("event_id"),
            "job_id": data.get("job_id")
        }

    except Exception as e:
        logger.error(f"Error in quick register: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/", response_model=List[Dict[str, Any]])
async def get_candidates(
    stage: Optional[str] = Query(None),
    event_id: Optional[str] = Query(None),
    job_id: Optional[str] = Query(None),
    limit: int = Query(50, ge=1, le=100)
):
    """Get candidates with optional filtering - uses real database data with proper joins"""
    try:
        # Build query with proper joins using the actual database schema
        query = candidate_service.db.table("candidates").select(
            "*",
            "candidate_files(id, file_type, file_url, file_name, uploaded_at)",
            "candidate_stage_history(id, action, from_stage, to_stage, notes, performed_by, timestamp)",
            "event_registrations(event_id, events(id, title, name, location, date))"
        )

        # Apply filters
        if stage:
            query = query.eq("stage", stage)
        if event_id:
            # Filter by event through the event_registrations join
            query = query.eq("event_registrations.event_id", event_id)
        if job_id:
            # For job filtering, we'll check notes field for now (until job_applications table exists)
            query = query.like("notes", f"%{job_id}%")

        # Only get active candidates
        query = query.eq("status", "active")

        # Apply limit and ordering
        query = query.limit(limit).order("created_at", desc=True)

        result = query.execute()

        candidates = result.data if result.data else []

        # Format candidates with Malaysian localization and fetch evaluations separately
        formatted_candidates = []
        for candidate in candidates:
            # Fetch evaluation data separately (due to candidate_id type mismatch)
            evaluation_data = []
            try:
                eval_result = candidate_service.db.table("initial_screening_evaluation").select(
                    "*"
                ).eq("candidate_id", candidate["id"]).execute()

                if eval_result.data:
                    evaluation_data = eval_result.data
            except Exception as e:
                logger.warning(
                    f"Could not fetch evaluation for candidate {candidate['id']}: {str(e)}")

            formatted_candidate = {
                **candidate,
                "country": "Malaysia",
                "currency": "MYR",
                "timezone": "Asia/Kuala_Lumpur",
                "formatted_salary": f"RM {candidate.get('salary_expectations', 0):,.2f}" if candidate.get('salary_expectations') else "Not specified",
                "formatted_phone": candidate.get("phone", "").replace("+60", "").strip() if candidate.get("phone") else "",
                "evaluation_data": evaluation_data,
                "resume_files": [f for f in candidate.get("candidate_files", []) if f.get("file_type") == "resume"],
                "other_files": [f for f in candidate.get("candidate_files", []) if f.get("file_type") != "resume"],
                "stage_history": candidate.get("candidate_stage_history", []),
                "events": [er.get("events") for er in candidate.get("event_registrations", []) if er.get("events")],
                "allowed_actions": await stage_management_service.get_allowed_actions(candidate["id"])
            }
            formatted_candidates.append(formatted_candidate)

        return formatted_candidates

    except Exception as e:
        logger.error(f"Error fetching candidates: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{candidate_id}/actions", response_model=List[str])
async def get_candidate_actions(candidate_id: str):
    """Get allowed actions for a candidate based on their current stage"""
    try:
        actions = await stage_management_service.get_allowed_actions(candidate_id)
        return actions
    except Exception as e:
        logger.error(f"Error getting candidate actions: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/{candidate_id}/actions/{action}")
async def perform_candidate_action(
    candidate_id: str,
    action: str,
    performed_by: str = "user",
    notes: str = ""
):
    """Perform a stage transition action on a candidate"""
    try:
        result = await stage_management_service.transition_candidate_stage(
            candidate_id, action, performed_by, notes
        )

        if result["success"]:
            return result
        else:
            raise HTTPException(status_code=400, detail=result["error"])

    except Exception as e:
        logger.error(f"Error performing candidate action: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/stage/{stage}/enhanced")
async def get_candidates_by_stage_enhanced(stage: str):
    """Get candidates by stage with all required data for that stage"""
    try:
        candidates = await stage_management_service.get_candidates_by_stage_with_requirements(stage)
        return candidates
    except Exception as e:
        logger.error(f"Error getting enhanced candidates by stage: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/stages/summary")
async def get_stages_summary():
    """Get summary of candidates across all stages"""
    try:
        summary = await stage_management_service.get_stage_summary()
        return summary
    except Exception as e:
        logger.error(f"Error getting stages summary: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/{candidate_id}/interview-details", response_model=Dict[str, Any])
async def store_interview_details(
    candidate_id: str,
    interview_details: Dict[str, Any]
):
    """Store interview scheduling details for a candidate"""
    try:
        from supabase_client import supabase

        # Prepare interview record
        interview_data = {
            "candidate_id": candidate_id,
            "scheduled_date": interview_details.get("date"),
            "scheduled_time": interview_details.get("time"),
            "interviewer": interview_details.get("interviewer"),
            "room": interview_details.get("room"),
            "status": interview_details.get("status", "scheduled"),
            "scheduled_by": interview_details.get("scheduled_by", "user"),
            "created_at": datetime.utcnow().isoformat(),
            "notes": interview_details.get("notes", "")
        }

        # Try to insert into interview_schedules table (create if not exists)
        try:
            result = supabase.table("interview_schedules").insert(
                interview_data).execute()
            logger.info(f"Stored interview details: {result.data}")
        except Exception as table_error:
            logger.warning(
                f"Could not store in interview_schedules table: {table_error}")
            # Fallback: store in candidate notes or a generic table
            notes_data = {
                "candidate_id": candidate_id,
                "note_type": "interview_schedule",
                "content": json.dumps(interview_data),
                "created_at": datetime.utcnow().isoformat()
            }
            supabase.table("candidate_notes").insert(notes_data).execute()

        return {
            "success": True,
            "message": "Interview details stored successfully",
            "interview_details": interview_data
        }

    except Exception as e:
        logger.error(f"Error storing interview details: {str(e)}")
        return {
            "success": False,
            "message": f"Failed to store interview details: {str(e)}"
        }
