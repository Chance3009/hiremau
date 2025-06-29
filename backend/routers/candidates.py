from fastapi import APIRouter, HTTPException, UploadFile, File, Query
from typing import List, Optional
from models import Candidate, CandidateAction, RecruitmentStage, ActionResult, WorkflowSummary
from firestore_client import db
from services.workflow_service import WorkflowService
from services.candidate_service import CandidateService
from datetime import datetime

router = APIRouter(tags=["candidates"])


@router.get("/", response_model=List[Candidate])
def get_candidates(
    stage: Optional[str] = Query(
        None, description="Filter by recruitment stage"),
    status: Optional[str] = Query(None, description="Filter by status"),
    event_id: Optional[str] = Query(None, description="Filter by event ID"),
    position_id: Optional[str] = Query(
        None, description="Filter by position ID"),
    skills: Optional[str] = Query(
        None, description="Filter by skills (comma-separated)"),
    min_experience: Optional[int] = Query(
        None, description="Minimum years of experience"),
    location: Optional[str] = Query(None, description="Filter by location"),
    visa_status: Optional[str] = Query(
        None, description="Filter by visa status"),
    assigned_recruiter: Optional[str] = Query(
        None, description="Filter by assigned recruiter"),
    sort_by: Optional[str] = Query(
        "appliedDate", description="Sort by: appliedDate, score, name"),
    sort_order: Optional[str] = Query(
        "desc", description="Sort order: asc, desc"),
    limit: Optional[int] = Query(100, description="Maximum number of results")
):
    """Get all candidates with advanced filtering and sorting"""
    try:
        # Build filters dictionary
        filters = {}
        if stage:
            filters['stage'] = stage
        if status:
            filters['status'] = status
        if event_id:
            filters['eventId'] = event_id
        if position_id:
            filters['positionId'] = position_id
        if skills:
            filters['skills'] = [s.strip() for s in skills.split(",")]
        if min_experience:
            filters['minExperience'] = min_experience
        if location:
            filters['location'] = location
        if visa_status:
            filters['visaStatus'] = visa_status
        if assigned_recruiter:
            filters['assignedRecruiter'] = assigned_recruiter
        if sort_by:
            filters['sortBy'] = sort_by
        if sort_order:
            filters['sortOrder'] = sort_order
        if limit:
            filters['limit'] = limit

        # Use the enhanced search service
        candidates = CandidateService.search_candidates(filters)
        return candidates

    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error fetching candidates: {str(e)}")


@router.get("/by-stage/{stage}")
def get_candidates_by_stage(stage: str):
    """Get candidates in a specific recruitment stage"""
    try:
        # Validate stage
        try:
            recruitment_stage = RecruitmentStage(stage)
        except ValueError:
            raise HTTPException(
                status_code=400, detail=f"Invalid stage: {stage}")

        candidates = WorkflowService.get_candidates_by_stage(recruitment_stage)
        return candidates
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error fetching candidates by stage: {str(e)}")


@router.get("/workflow/summary", response_model=WorkflowSummary)
def get_workflow_summary():
    """Get summary of the recruitment workflow"""
    try:
        return WorkflowService.get_workflow_summary()
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error getting workflow summary: {str(e)}")


@router.get("/workflow/metrics")
def get_stage_metrics():
    """Get detailed metrics for each recruitment stage"""
    try:
        return WorkflowService.get_stage_metrics()
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error getting stage metrics: {str(e)}")


@router.get("/{candidate_id}", response_model=Candidate)
def get_candidate(candidate_id: str):
    """Get a specific candidate by ID with enriched data"""
    try:
        candidate = CandidateService.get_candidate(candidate_id)
        if not candidate:
            raise HTTPException(status_code=404, detail="Candidate not found")
        return candidate
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error fetching candidate: {str(e)}")


@router.get("/{candidate_id}/actions")
def get_available_actions(candidate_id: str):
    """Get available actions for a candidate based on their current stage"""
    try:
        actions = WorkflowService.get_available_actions(candidate_id)
        return {"candidateId": candidate_id, "availableActions": [action.value for action in actions]}
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error getting available actions: {str(e)}")


@router.post("/{candidate_id}/actions/{action}", response_model=ActionResult)
def perform_candidate_action(
    candidate_id: str,
    action: str,
    performed_by: str = "system",
    notes: Optional[str] = None
):
    """Perform an action on a candidate (shortlist, reject, etc.)"""
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
        raise HTTPException(
            status_code=500, detail=f"Error performing action: {str(e)}")


@router.post("/{candidate_id}/schedule-interview", response_model=ActionResult)
def schedule_interview(
    candidate_id: str,
    interview_data: dict,
    scheduled_by: str = "system"
):
    """Schedule an interview for a candidate"""
    try:
        # Validate required fields
        required_fields = ["date", "time", "interviewer"]
        for field in required_fields:
            if field not in interview_data:
                raise HTTPException(
                    status_code=400, detail=f"Missing required field: {field}")

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


@router.post("/{candidate_id}/start-interview", response_model=ActionResult)
def start_interview(
    candidate_id: str,
    interviewer_id: str = "system",
    interview_type: str = "technical"
):
    """Start an interview session for a candidate"""
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


@router.post("/")
def create_candidate(candidate_data: dict, created_by: str = "system"):
    """Create a new candidate with workflow initialization"""
    try:
        result = CandidateService.create_candidate(candidate_data)
        if result['success']:
            return {
                "success": True,
                "candidate_id": result['candidate_id'],
                "message": "Candidate created successfully"
            }
        else:
            raise HTTPException(status_code=400, detail=result['error'])
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error creating candidate: {str(e)}")


@router.put("/{candidate_id}", response_model=Candidate)
def update_candidate(candidate_id: str, candidate: Candidate):
    """Update a candidate"""
    doc_ref = db.collection("candidates").document(candidate_id)
    doc = doc_ref.get()
    if not doc.exists:
        raise HTTPException(status_code=404, detail="Candidate not found")

    try:
        candidate_data = candidate.dict()
        candidate_data["lastActionDate"] = datetime.now().isoformat()
        doc_ref.update(candidate_data)
        return {"message": "Candidate updated successfully"}
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error updating candidate: {str(e)}")


@router.patch("/{candidate_id}/status")
def update_candidate_status(candidate_id: str, status: str, performed_by: str = "system"):
    """Update only the status of a candidate"""
    if status not in ['shortlist', 'kiv', 'reject', 'new', 'interview-scheduled', 'interviewing', 'final-review', 'offer-made']:
        raise HTTPException(status_code=400, detail="Invalid status")

    doc_ref = db.collection("candidates").document(candidate_id)
    doc = doc_ref.get()
    if not doc.exists:
        raise HTTPException(status_code=404, detail="Candidate not found")

    try:
        # Determine action based on status
        action_mapping = {
            'shortlist': CandidateAction.SHORTLIST,
            'reject': CandidateAction.REJECT
        }

        if status in action_mapping:
            # Use workflow service for status changes that affect stage
            result = WorkflowService.perform_action(
                candidate_id=candidate_id,
                action=action_mapping[status],
                performed_by=performed_by,
                notes=f"Status updated to {status}"
            )

            if not result.success:
                raise HTTPException(status_code=400, detail=result.message)

            return {"message": f"Candidate status updated to {status}", "result": result}
        else:
            # Simple status update for kiv/new
            doc_ref.update({
                "status": status,
                "lastActionDate": datetime.now().isoformat()
            })
            return {"message": f"Candidate status updated to {status}"}

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error updating candidate status: {str(e)}")


@router.delete("/{candidate_id}")
def delete_candidate(candidate_id: str):
    """Delete a candidate"""
    doc_ref = db.collection("candidates").document(candidate_id)
    doc = doc_ref.get()
    if not doc.exists:
        raise HTTPException(status_code=404, detail="Candidate not found")

    try:
        doc_ref.delete()
        return {"message": "Candidate deleted successfully"}
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error deleting candidate: {str(e)}")


@router.get("/{candidate_id}/stage-history")
def get_candidate_stage_history(candidate_id: str):
    """Get the stage transition history for a candidate"""
    try:
        doc = db.collection("candidates").document(candidate_id).get()
        if not doc.exists:
            raise HTTPException(status_code=404, detail="Candidate not found")

        candidate_data = doc.to_dict()
        stage_history = candidate_data.get("stageHistory", [])

        return {
            "candidateId": candidate_id,
            "stageHistory": stage_history,
            "currentStage": candidate_data.get("currentStage", "applied")
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error getting stage history: {str(e)}")


# Advanced search and filtering
@router.get("/search/advanced")
def advanced_candidate_search(
    query: Optional[str] = Query(
        None, description="Search in name, position, skills"),
    min_score: Optional[float] = Query(
        None, description="Minimum AI match score"),
    max_score: Optional[float] = Query(
        None, description="Maximum AI match score"),
    experience_level: Optional[str] = Query(
        None, description="Experience level"),
    location: Optional[str] = Query(None, description="Location"),
    visa_status: Optional[str] = Query(None, description="Visa status"),
    tags: Optional[str] = Query(None, description="Tags (comma-separated)"),
    stage: Optional[str] = Query(
        None, description="Current recruitment stage"),
    limit: Optional[int] = Query(50, description="Maximum results")
):
    """Advanced search for candidates with multiple filters"""
    try:
        candidates = []
        docs = db.collection("candidates").limit(
            limit * 2).stream()  # Get more to filter

        for doc in docs:
            candidate_data = doc.to_dict()

            # Apply text search
            if query:
                searchable_text = f"{candidate_data.get('name', '')} {candidate_data.get('position', '')} {' '.join(candidate_data.get('skills', []))}"
                if query.lower() not in searchable_text.lower():
                    continue

            # Apply score filters
            ai_match = candidate_data.get("aiMatch", 0)
            if min_score and ai_match < min_score:
                continue
            if max_score and ai_match > max_score:
                continue

            # Apply other filters
            if experience_level and candidate_data.get("experience", "").lower() != experience_level.lower():
                continue
            if location and location.lower() not in candidate_data.get("location", "").lower():
                continue
            if visa_status and candidate_data.get("visaStatus", "").lower() != visa_status.lower():
                continue
            if stage and candidate_data.get("currentStage", "") != stage:
                continue

            # Apply tags filter
            if tags:
                tag_list = [t.strip().lower() for t in tags.split(",")]
                candidate_tags = [t.lower()
                                  for t in candidate_data.get("tags", [])]
                if not any(tag in candidate_tags for tag in tag_list):
                    continue

            candidates.append(candidate_data)

            if len(candidates) >= limit:
                break

        return {
            "candidates": candidates,
            "total": len(candidates),
            "filters_applied": {
                "query": query,
                "min_score": min_score,
                "max_score": max_score,
                "experience_level": experience_level,
                "location": location,
                "visa_status": visa_status,
                "tags": tags,
                "stage": stage
            }
        }
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error in advanced search: {str(e)}")


@router.get("/analytics/funnel")
def get_recruitment_funnel():
    """Get recruitment funnel analytics"""
    try:
        stages = [stage.value for stage in RecruitmentStage]
        funnel_data = []

        for stage in stages:
            count = len(list(db.collection("candidates").where(
                "currentStage", "==", stage).stream()))
            funnel_data.append({
                "stage": stage,
                "count": count,
                "label": WorkflowService.STAGE_CONFIG[RecruitmentStage(stage)]["label"]
            })

        return {
            "funnel": funnel_data,
            "total_candidates": sum(item["count"] for item in funnel_data)
        }
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error getting recruitment funnel: {str(e)}")


@router.get("/search/by-skills")
def search_candidates_by_skills(skills: str = Query(..., description="Comma-separated list of skills")):
    """Search candidates by skills"""
    skill_list = [skill.strip() for skill in skills.split(",")]

    # Get all candidates and filter by skills (Firestore doesn't support array-contains-any for multiple values easily)
    docs = db.collection("candidates").stream()
    matching_candidates = []

    for doc in docs:
        candidate_data = doc.to_dict()
        candidate_skills = candidate_data.get("skills", [])

        # Check if candidate has any of the requested skills
        if any(skill in candidate_skills for skill in skill_list):
            # Add match score based on how many skills match
            matching_skills = [
                skill for skill in skill_list if skill in candidate_skills]
            candidate_data["matchingSkills"] = matching_skills
            candidate_data["skillMatchScore"] = len(
                matching_skills) / len(skill_list)
            matching_candidates.append(candidate_data)

    # Sort by skill match score (descending)
    matching_candidates.sort(key=lambda x: x["skillMatchScore"], reverse=True)

    return {
        "candidates": matching_candidates,
        "searchedSkills": skill_list,
        "totalMatches": len(matching_candidates)
    }


@router.get("/event/{event_id}", response_model=List[Candidate])
def get_candidates_by_event(event_id: str):
    """Get all candidates for a specific event"""
    docs = db.collection("candidates").where(
        "eventId", "==", event_id).stream()
    return [doc.to_dict() for doc in docs]


@router.get("/position/{position_id}", response_model=List[Candidate])
def get_candidates_by_position(position_id: str):
    """Get all candidates for a specific position"""
    docs = db.collection("candidates").where(
        "positionId", "==", position_id).stream()
    return [doc.to_dict() for doc in docs]


@router.get("/analytics/summary")
def get_candidates_analytics():
    """Get comprehensive analytics for all candidates"""
    try:
        analytics = CandidateService.get_candidate_analytics()
        return analytics
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error getting analytics: {str(e)}")


@router.post("/bulk/action")
def bulk_candidate_action(
    candidate_ids: List[str],
    action: str,
    performed_by: str = "system",
    notes: Optional[str] = None
):
    """Perform bulk actions on multiple candidates"""
    try:
        result = CandidateService.bulk_action(
            candidate_ids=candidate_ids,
            action=action,
            performed_by=performed_by,
            notes=notes
        )
        return result
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error performing bulk action: {str(e)}")


@router.post("/{candidate_id}/assign-recruiter")
def assign_recruiter_to_candidate(
    candidate_id: str,
    recruiter_id: str,
    assigned_by: str = "system"
):
    """Assign a recruiter to a candidate"""
    try:
        result = CandidateService.assign_recruiter(
            candidate_id=candidate_id,
            recruiter_id=recruiter_id,
            assigned_by=assigned_by
        )
        return result
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error assigning recruiter: {str(e)}")


@router.get("/analytics/detailed")
def get_detailed_candidate_analytics():
    """Get detailed candidate analytics with insights"""
    try:
        analytics = CandidateService.get_candidate_analytics()

        # Add additional insights
        insights = []

        # Check for bottlenecks
        stage_distribution = analytics.get('stage_distribution', {})
        total_candidates = analytics.get('total_candidates', 0)

        if total_candidates > 0:
            for stage, count in stage_distribution.items():
                percentage = (count / total_candidates) * 100
                if percentage > 40:  # More than 40% in one stage indicates bottleneck
                    insights.append({
                        'type': 'bottleneck',
                        'stage': stage,
                        'percentage': round(percentage, 1),
                        'message': f'{percentage:.1f}% of candidates are stuck in {stage} stage'
                    })

        # Check conversion rates
        conversion_rates = analytics.get('conversion_rates', {})
        for transition, rate in conversion_rates.items():
            if rate < 20:  # Low conversion rate
                insights.append({
                    'type': 'low_conversion',
                    'transition': transition,
                    'rate': rate,
                    'message': f'Low conversion rate: {rate}% for {transition}'
                })

        analytics['insights'] = insights
        return analytics

    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error getting detailed analytics: {str(e)}")


# Placeholder for agentic/AI logic (e.g., resume analysis, candidate ranking)
@router.post("/{candidate_id}/analyze")
def analyze_candidate(candidate_id: str):
    """Analyze candidate using AI (placeholder for future implementation)"""
    doc = db.collection("candidates").document(candidate_id).get()
    if not doc.exists:
        raise HTTPException(status_code=404, detail="Candidate not found")

    # TODO: Implement AI analysis
    return {"message": "AI analysis not yet implemented", "candidateId": candidate_id}


@router.post("/{candidate_id}/resume")
def upload_resume(candidate_id: str, file: UploadFile = File(...)):
    """Upload resume file (placeholder for GCS integration)"""
    # TODO: Implement file upload to GCS
    return {"message": "Resume upload not implemented", "filename": file.filename}


@router.get("/{candidate_id}/resume")
def download_resume(candidate_id: str):
    """Download resume file (placeholder for GCS integration)"""
    # TODO: Implement file download from GCS
    return {"message": "Resume download not implemented"}


@router.get("/by-job/{job_id}")
def get_candidates_by_job(job_id: str):
    """Get all candidates for a specific job/position"""
    try:
        # Get candidates by positionId (which maps to job_id)
        candidates = []
        docs = db.collection("candidates").where(
            "positionId", "==", job_id).stream()

        for doc in docs:
            candidate_data = doc.to_dict()
            candidates.append(candidate_data)

        # Get job details
        job_doc = db.collection("jobs").document(job_id).get()
        job_info = job_doc.to_dict() if job_doc.exists else {
            "title": "Unknown Job"}

        # Calculate job-specific metrics
        stage_distribution = {}
        for candidate in candidates:
            stage = candidate.get("currentStage", "applied")
            stage_distribution[stage] = stage_distribution.get(stage, 0) + 1

        return {
            "jobId": job_id,
            "jobTitle": job_info.get("title", "Unknown Job"),
            "jobDepartment": job_info.get("department", ""),
            "candidates": candidates,
            "totalCandidates": len(candidates),
            "stageDistribution": stage_distribution,
            "metrics": {
                "applied": stage_distribution.get("applied", 0),
                "screened": stage_distribution.get("screened", 0),
                "interviewed": stage_distribution.get("interviewed", 0),
                "finalReview": stage_distribution.get("final-review", 0),
                "shortlisted": stage_distribution.get("shortlisted", 0)
            }
        }
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error getting candidates by job: {str(e)}")


@router.get("/by-event/{event_id}")
def get_candidates_by_event(event_id: str):
    """Get all candidates for a specific event"""
    try:
        # Get candidates by eventId
        candidates = []
        docs = db.collection("candidates").where(
            "eventId", "==", event_id).stream()

        for doc in docs:
            candidate_data = doc.to_dict()
            candidates.append(candidate_data)

        # Get event details
        event_doc = db.collection("events").document(event_id).get()
        event_info = event_doc.to_dict() if event_doc.exists else {
            "title": "Unknown Event"}

        # Get interviews for this event
        interview_docs = db.collection("interviews").where(
            "eventId", "==", event_id).stream()
        interviews = [doc.to_dict() for doc in interview_docs]

        # Calculate event-specific metrics
        stage_distribution = {}
        for candidate in candidates:
            stage = candidate.get("currentStage", "applied")
            stage_distribution[stage] = stage_distribution.get(stage, 0) + 1

        interview_metrics = {
            "scheduled": sum(1 for i in interviews if i.get("status") == "scheduled"),
            "inProgress": sum(1 for i in interviews if i.get("status") == "in-progress"),
            "completed": sum(1 for i in interviews if i.get("status") == "completed"),
            "total": len(interviews)
        }

        return {
            "eventId": event_id,
            "eventTitle": event_info.get("title", "Unknown Event"),
            "eventDate": event_info.get("date", ""),
            "eventLocation": event_info.get("location", ""),
            "candidates": candidates,
            "totalCandidates": len(candidates),
            "stageDistribution": stage_distribution,
            "interviewMetrics": interview_metrics,
            "metrics": {
                "applied": stage_distribution.get("applied", 0),
                "screened": stage_distribution.get("screened", 0),
                "interviewed": stage_distribution.get("interviewed", 0),
                "finalReview": stage_distribution.get("final-review", 0),
                "shortlisted": stage_distribution.get("shortlisted", 0),
                "registrations": event_info.get("registrations", 0)
            }
        }
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error getting candidates by event: {str(e)}")


@router.get("/filter/job-and-event")
def get_candidates_by_job_and_event(
    job_id: Optional[str] = Query(
        None, description="Filter by job/position ID"),
    event_id: Optional[str] = Query(None, description="Filter by event ID"),
    stage: Optional[str] = Query(
        None, description="Filter by recruitment stage"),
    status: Optional[str] = Query(None, description="Filter by status"),
    limit: Optional[int] = Query(100, description="Maximum number of results")
):
    """Get candidates filtered by both job and event with additional filters"""
    try:
        query = db.collection("candidates")

        # Apply filters
        if job_id:
            query = query.where("positionId", "==", job_id)
        if event_id:
            query = query.where("eventId", "==", event_id)
        if stage:
            query = query.where("currentStage", "==", stage)
        if status:
            query = query.where("status", "==", status)

        # Get documents
        docs = query.limit(limit).stream()
        candidates = [doc.to_dict() for doc in docs]

        # Get job and event info if specified
        job_info = None
        event_info = None

        if job_id:
            job_doc = db.collection("jobs").document(job_id).get()
            if job_doc.exists:
                job_info = job_doc.to_dict()

        if event_id:
            event_doc = db.collection("events").document(event_id).get()
            if event_doc.exists:
                event_info = event_doc.to_dict()

        # Calculate metrics
        stage_distribution = {}
        status_distribution = {}

        for candidate in candidates:
            stage = candidate.get("currentStage", "applied")
            status = candidate.get("status", "new")

            stage_distribution[stage] = stage_distribution.get(stage, 0) + 1
            status_distribution[status] = status_distribution.get(
                status, 0) + 1

        return {
            "filters": {
                "jobId": job_id,
                "eventId": event_id,
                "stage": stage,
                "status": status
            },
            "jobInfo": job_info,
            "eventInfo": event_info,
            "candidates": candidates,
            "totalCandidates": len(candidates),
            "stageDistribution": stage_distribution,
            "statusDistribution": status_distribution
        }
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error filtering candidates: {str(e)}")


@router.get("/jobs/{job_id}/pipeline")
def get_job_recruitment_pipeline(job_id: str):
    """Get complete recruitment pipeline for a specific job"""
    try:
        # Get job details
        job_doc = db.collection("jobs").document(job_id).get()
        if not job_doc.exists:
            raise HTTPException(status_code=404, detail="Job not found")

        job_data = job_doc.to_dict()

        # Get all candidates for this job
        candidates = []
        docs = db.collection("candidates").where(
            "positionId", "==", job_id).stream()

        for doc in docs:
            candidate_data = doc.to_dict()
            candidates.append(candidate_data)

        # Organize candidates by stage
        pipeline = {
            "applied": [],
            "screened": [],
            "interviewed": [],
            "final-review": [],
            "shortlisted": []
        }

        for candidate in candidates:
            stage = candidate.get("currentStage", "applied")
            if stage in pipeline:
                pipeline[stage].append(candidate)

        # Calculate conversion rates
        conversion_rates = {}
        stages = list(pipeline.keys())

        for i in range(len(stages) - 1):
            current_stage = stages[i]
            next_stage = stages[i + 1]

            current_count = len(pipeline[current_stage])
            next_count = len(pipeline[next_stage])

            if current_count > 0:
                conversion_rate = (next_count / current_count) * 100
                conversion_rates[f"{current_stage}_to_{next_stage}"] = round(
                    conversion_rate, 2)

        return {
            "jobId": job_id,
            "jobTitle": job_data.get("title", ""),
            "jobDepartment": job_data.get("department", ""),
            "totalCandidates": len(candidates),
            "pipeline": pipeline,
            "stageCounts": {stage: len(candidates) for stage, candidates in pipeline.items()},
            "conversionRates": conversion_rates,
            "metrics": {
                "applicationToHire": round((len(pipeline["shortlisted"]) / max(len(candidates), 1)) * 100, 2),
                "interviewToHire": round((len(pipeline["shortlisted"]) / max(len(pipeline["interviewed"]), 1)) * 100, 2) if pipeline["interviewed"] else 0
            }
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error getting job pipeline: {str(e)}")


@router.get("/events/{event_id}/pipeline")
def get_event_recruitment_pipeline(event_id: str):
    """Get complete recruitment pipeline for a specific event"""
    try:
        # Get event details
        event_doc = db.collection("events").document(event_id).get()
        if not event_doc.exists:
            raise HTTPException(status_code=404, detail="Event not found")

        event_data = event_doc.to_dict()

        # Get all candidates for this event
        candidates = []
        docs = db.collection("candidates").where(
            "eventId", "==", event_id).stream()

        for doc in docs:
            candidate_data = doc.to_dict()
            candidates.append(candidate_data)

        # Get interviews for this event
        interview_docs = db.collection("interviews").where(
            "eventId", "==", event_id).stream()
        interviews = [doc.to_dict() for doc in interview_docs]

        # Organize candidates by stage
        pipeline = {
            "applied": [],
            "screened": [],
            "interviewed": [],
            "final-review": [],
            "shortlisted": []
        }

        for candidate in candidates:
            stage = candidate.get("currentStage", "applied")
            if stage in pipeline:
                pipeline[stage].append(candidate)

        # Group candidates by position
        candidates_by_position = {}
        for candidate in candidates:
            position_id = candidate.get("positionId", "unknown")
            if position_id not in candidates_by_position:
                candidates_by_position[position_id] = []
            candidates_by_position[position_id].append(candidate)

        # Interview statistics
        interview_stats = {
            "scheduled": [i for i in interviews if i.get("status") == "scheduled"],
            "inProgress": [i for i in interviews if i.get("status") == "in-progress"],
            "completed": [i for i in interviews if i.get("status") == "completed"]
        }

        return {
            "eventId": event_id,
            "eventTitle": event_data.get("title", ""),
            "eventDate": event_data.get("date", ""),
            "eventLocation": event_data.get("location", ""),
            "totalCandidates": len(candidates),
            "totalRegistrations": event_data.get("registrations", 0),
            "pipeline": pipeline,
            "stageCounts": {stage: len(candidates) for stage, candidates in pipeline.items()},
            "candidatesByPosition": candidates_by_position,
            "interviewStats": {
                "scheduled": len(interview_stats["scheduled"]),
                "inProgress": len(interview_stats["inProgress"]),
                "completed": len(interview_stats["completed"]),
                "total": len(interviews)
            },
            "interviews": interviews,
            "metrics": {
                "registrationToApplication": round((len(candidates) / max(event_data.get("registrations", 1), 1)) * 100, 2),
                "applicationToInterview": round((len(pipeline["interviewed"]) / max(len(candidates), 1)) * 100, 2),
                "interviewCompletion": round((len(interview_stats["completed"]) / max(len(interviews), 1)) * 100, 2) if interviews else 0
            }
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error getting event pipeline: {str(e)}")
