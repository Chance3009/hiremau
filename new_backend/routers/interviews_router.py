from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional
from models import Interview, InterviewCreate, InterviewUpdate, InterviewStatus, InterviewType
from services.interview_service import InterviewService
from datetime import datetime

router = APIRouter(tags=["interviews"])


@router.get("/", response_model=List[Interview])
def get_interviews(
    candidate_id: Optional[str] = Query(
        None, description="Filter by candidate ID"),
    status: Optional[str] = Query(
        None, description="Filter by interview status"),
    interviewer_id: Optional[str] = Query(
        None, description="Filter by interviewer ID"),
    date: Optional[str] = Query(
        None, description="Filter by date (YYYY-MM-DD)"),
    type: Optional[str] = Query(None, description="Filter by interview type"),
    limit: Optional[int] = Query(100, description="Maximum number of results")
):
    """Get all interviews with optional filtering"""
    try:
        if candidate_id:
            interviews = InterviewService.get_interviews_by_candidate(
                candidate_id)
        elif status:
            # Validate status
            try:
                interview_status = InterviewStatus(status)
                interviews = InterviewService.get_interviews_by_status(
                    interview_status)
            except ValueError:
                raise HTTPException(
                    status_code=400, detail=f"Invalid status: {status}")
        elif interviewer_id:
            interviews = InterviewService.get_interviews_by_interviewer(
                interviewer_id)
        elif date:
            # Filter by date
            interviews = InterviewService.get_all_interviews()
            interviews = [i for i in interviews if i.get(
                "date", "").startswith(date)]
        elif type:
            # Validate type
            try:
                interview_type = InterviewType(type)
                interviews = InterviewService.get_all_interviews()
                interviews = [i for i in interviews if i.get(
                    "type") == interview_type.value]
            except ValueError:
                raise HTTPException(
                    status_code=400, detail=f"Invalid type: {type}")
        else:
            interviews = InterviewService.get_all_interviews()

        # Apply limit
        if limit:
            interviews = interviews[:limit]

        return interviews
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error fetching interviews: {str(e)}")


@router.get("/scheduled")
def get_scheduled_interviews():
    """Get all scheduled interviews with enriched data"""
    try:
        interviews = InterviewService.get_scheduled_interviews()
        return {
            "interviews": interviews,
            "count": len(interviews)
        }
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error fetching scheduled interviews: {str(e)}")


@router.get("/in-progress")
def get_in_progress_interviews():
    """Get all interviews currently in progress with enriched data"""
    try:
        interviews = InterviewService.get_in_progress_interviews()
        return {
            "interviews": interviews,
            "count": len(interviews)
        }
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error fetching in-progress interviews: {str(e)}")


@router.get("/today")
def get_todays_interviews():
    """Get all interviews scheduled for today with enriched data"""
    try:
        interviews = InterviewService.get_todays_interviews()
        return {
            "interviews": interviews,
            "count": len(interviews)
        }
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error fetching today's interviews: {str(e)}")


@router.get("/interviewer/{interviewer_id}")
def get_interviews_by_interviewer(interviewer_id: str):
    """Get all interviews for a specific interviewer"""
    try:
        interviews = InterviewService.get_interviews_by_interviewer(
            interviewer_id)
        return {
            "interviewer_id": interviewer_id,
            "interviews": interviews,
            "count": len(interviews)
        }
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error fetching interviews by interviewer: {str(e)}")


@router.get("/{interview_id}")
def get_interview(interview_id: str):
    """Get a specific interview by ID"""
    try:
        interview = InterviewService.get_interview_by_id(interview_id)
        if not interview:
            raise HTTPException(status_code=404, detail="Interview not found")
        return interview
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error fetching interview: {str(e)}")


@router.post("/")
def create_interview(interview_data: InterviewCreate, scheduled_by: str = "system"):
    """Create a new interview with workflow integration"""
    try:
        result = InterviewService.create_interview(
            interview_data, scheduled_by)
        if result["success"]:
            return {
                "success": True,
                "interview_id": result["interview_id"],
                "message": "Interview scheduled successfully"
            }
        else:
            raise HTTPException(status_code=400, detail=result["error"])
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error creating interview: {str(e)}")


@router.post("/{interview_id}/start")
def start_interview_session(interview_id: str, started_by: str = "system"):
    """Start an interview session with workflow integration"""
    try:
        result = InterviewService.start_interview(interview_id, started_by)
        if result["success"]:
            return result
        else:
            raise HTTPException(status_code=400, detail=result["error"])
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error starting interview: {str(e)}")


@router.post("/{interview_id}/complete")
def complete_interview_session(
    interview_id: str,
    outcome: str,
    evaluation: Optional[dict] = None,
    completed_by: str = "system"
):
    """Complete an interview session with evaluation and workflow progression"""
    try:
        result = InterviewService.complete_interview(
            interview_id=interview_id,
            outcome=outcome,
            evaluation=evaluation,
            completed_by=completed_by
        )

        if result["success"]:
            return result
        else:
            raise HTTPException(status_code=400, detail=result["error"])
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error completing interview: {str(e)}")


@router.patch("/{interview_id}/status")
def update_interview_status(interview_id: str, status: str):
    """Update interview status"""
    try:
        # Validate status
        try:
            interview_status = InterviewStatus(status)
        except ValueError:
            valid_statuses = [status.value for status in InterviewStatus]
            raise HTTPException(
                status_code=400, detail=f"Invalid status. Must be one of: {valid_statuses}")

        # Update status
        update_data = InterviewUpdate(status=interview_status)
        result = InterviewService.update_interview(
            interview_id, update_data, "system")

        if result["success"]:
            return result
        else:
            raise HTTPException(status_code=400, detail=result["error"])
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error updating interview status: {str(e)}")


@router.post("/{interview_id}/notes")
def add_interview_note(interview_id: str, note_text: str, author: str = "system"):
    """Add a note to an interview"""
    try:
        result = InterviewService.add_interview_note(
            interview_id, note_text, author)
        if result["success"]:
            return result
        else:
            raise HTTPException(status_code=400, detail=result["error"])
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error adding interview note: {str(e)}")


@router.post("/{interview_id}/reschedule")
def reschedule_interview(
    interview_id: str,
    new_date: str,
    new_time: str,
    rescheduled_by: str = "system"
):
    """Reschedule an interview"""
    try:
        result = InterviewService.reschedule_interview(
            interview_id=interview_id,
            new_date=new_date,
            new_time=new_time,
            rescheduled_by=rescheduled_by
        )

        if result["success"]:
            return result
        else:
            raise HTTPException(status_code=400, detail=result["error"])
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error rescheduling interview: {str(e)}")


@router.post("/{interview_id}/cancel")
def cancel_interview(
    interview_id: str,
    reason: str,
    cancelled_by: str = "system"
):
    """Cancel an interview"""
    try:
        result = InterviewService.cancel_interview(
            interview_id=interview_id,
            reason=reason,
            cancelled_by=cancelled_by
        )

        if result["success"]:
            return result
        else:
            raise HTTPException(status_code=400, detail=result["error"])
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error cancelling interview: {str(e)}")


@router.put("/{interview_id}")
def update_interview(interview_id: str, interview: InterviewUpdate, updated_by: str = "system"):
    """Update an interview"""
    try:
        result = InterviewService.update_interview(
            interview_id, interview, updated_by)
        if result["success"]:
            return result["interview"]
        else:
            raise HTTPException(status_code=400, detail=result["error"])
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error updating interview: {str(e)}")


@router.delete("/{interview_id}")
def delete_interview(interview_id: str):
    """Delete an interview"""
    try:
        result = InterviewService.delete_interview(interview_id)
        if result["success"]:
            return {"message": "Interview deleted"}
        else:
            raise HTTPException(status_code=400, detail=result["error"])
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error deleting interview: {str(e)}")


@router.get("/analytics/summary")
def get_interview_analytics():
    """Get interview analytics"""
    try:
        analytics = InterviewService.get_interview_analytics()
        if "error" in analytics:
            raise HTTPException(status_code=500, detail=analytics["error"])
        return analytics
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error getting interview analytics: {str(e)}")


@router.get("/analytics/completion-rate")
def get_interview_completion_rate():
    """Get interview completion rate"""
    try:
        analytics = InterviewService.get_interview_analytics()
        if "error" in analytics:
            raise HTTPException(status_code=500, detail=analytics["error"])

        return {
            "completion_rate": analytics.get("completion_rate", 0),
            "total_interviews": analytics.get("total_interviews", 0),
            "completed_interviews": analytics.get("completed", 0)
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error getting completion rate: {str(e)}")


@router.get("/analytics/by-outcome")
def get_interviews_by_outcome():
    """Get interviews grouped by outcome"""
    try:
        analytics = InterviewService.get_interview_analytics()
        if "error" in analytics:
            raise HTTPException(status_code=500, detail=analytics["error"])

        return {
            "outcomes": analytics.get("outcomes", {}),
            "total_interviews": analytics.get("total_interviews", 0)
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error getting interviews by outcome: {str(e)}")


@router.get("/schedule/availability")
def get_interview_availability(
    date: str = Query(..., description="Date in YYYY-MM-DD format"),
    interviewer_id: Optional[str] = Query(
        None, description="Filter by interviewer ID")
):
    """Get interview availability for a specific date"""
    try:
        availability = InterviewService.get_interview_availability(
            date, interviewer_id)
        if "error" in availability:
            raise HTTPException(status_code=500, detail=availability["error"])
        return availability
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error getting interview availability: {str(e)}")


@router.get("/candidate/{candidate_id}")
def get_candidate_interviews(candidate_id: str):
    """Get all interviews for a specific candidate"""
    try:
        interviews = InterviewService.get_interviews_by_candidate(candidate_id)
        return {
            "candidate_id": candidate_id,
            "interviews": interviews,
            "count": len(interviews)
        }
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error getting candidate interviews: {str(e)}")


@router.get("/job/{job_id}")
def get_job_interviews(job_id: str):
    """Get all interviews for a specific job"""
    try:
        interviews = InterviewService.get_interviews_by_job(job_id)
        return {
            "job_id": job_id,
            "interviews": interviews,
            "count": len(interviews)
        }
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error getting job interviews: {str(e)}")


@router.get("/event/{event_id}")
def get_event_interviews(event_id: str):
    """Get all interviews for a specific event"""
    try:
        interviews = InterviewService.get_interviews_by_event(event_id)
        return {
            "event_id": event_id,
            "interviews": interviews,
            "count": len(interviews)
        }
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error getting event interviews: {str(e)}")
