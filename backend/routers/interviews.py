from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional
from models import Interview, InterviewStatus, InterviewType, ActionResult
from firestore_client import db
from services.workflow_service import WorkflowService
from services.interview_service import InterviewService
from datetime import datetime

router = APIRouter()


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
        query = db.collection("interviews")

        # Apply filters
        if candidate_id:
            query = query.where("candidateId", "==", candidate_id)
        if status:
            query = query.where("status", "==", status)
        if date:
            query = query.where("date", "==", date)
        if type:
            query = query.where("type", "==", type)

        docs = query.limit(limit).stream()
        interviews = []

        for doc in docs:
            interview_data = doc.to_dict()

            # Filter by interviewer if specified
            if interviewer_id:
                interviewer = interview_data.get("interviewer", {})
                if interviewer.get("id") != interviewer_id:
                    continue

            interviews.append(interview_data)

        return interviews
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error fetching interviews: {str(e)}")


@router.get("/scheduled")
def get_scheduled_interviews():
    """Get all scheduled interviews with enriched data"""
    try:
        interviews = InterviewService.get_interviews_by_status("scheduled")
        return interviews
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error fetching scheduled interviews: {str(e)}")


@router.get("/in-progress")
def get_in_progress_interviews():
    """Get all interviews currently in progress with enriched data"""
    try:
        interviews = InterviewService.get_interviews_by_status("in-progress")
        return interviews
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error fetching in-progress interviews: {str(e)}")


@router.get("/today")
def get_todays_interviews():
    """Get all interviews scheduled for today with enriched data"""
    try:
        interviews = InterviewService.get_interviews_today()
        return interviews
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error fetching today's interviews: {str(e)}")


@router.get("/interviewer/{interviewer_id}")
def get_interviews_by_interviewer(interviewer_id: str):
    """Get all interviews for a specific interviewer"""
    try:
        interviews = []
        docs = db.collection("interviews").stream()

        for doc in docs:
            interview_data = doc.to_dict()
            interviewer = interview_data.get("interviewer", {})
            if interviewer.get("id") == interviewer_id:
                interviews.append(interview_data)

        return interviews
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error fetching interviews by interviewer: {str(e)}")


@router.get("/{interview_id}")
def get_interview(interview_id: str):
    """Get a specific interview by ID"""
    doc = db.collection("interviews").document(interview_id).get()
    if not doc.exists:
        raise HTTPException(status_code=404, detail="Interview not found")
    return doc.to_dict()


@router.post("/")
def create_interview(interview_data: dict, scheduled_by: str = "system"):
    """Create a new interview with workflow integration"""
    try:
        result = InterviewService.schedule_interview(
            interview_data, scheduled_by)
        if result['success']:
            return {
                "success": True,
                "interview_id": result['interview_id'],
                "message": "Interview scheduled successfully"
            }
        else:
            raise HTTPException(status_code=400, detail=result['error'])
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
        if result['success']:
            return result
        else:
            raise HTTPException(status_code=400, detail=result['error'])
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
        if outcome not in ["pass", "fail", "pending"]:
            raise HTTPException(
                status_code=400, detail="Invalid outcome. Must be 'pass', 'fail', or 'pending'")

        result = InterviewService.complete_interview(
            interview_id=interview_id,
            outcome=outcome,
            evaluation=evaluation,
            completed_by=completed_by
        )

        if result['success']:
            return result
        else:
            raise HTTPException(status_code=400, detail=result['error'])
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error completing interview: {str(e)}")


@router.patch("/{interview_id}/status")
def update_interview_status(interview_id: str, status: str):
    """Update interview status"""
    valid_statuses = [status.value for status in InterviewStatus]
    if status not in valid_statuses:
        raise HTTPException(
            status_code=400, detail=f"Invalid status. Must be one of: {valid_statuses}")

    doc_ref = db.collection("interviews").document(interview_id)
    doc = doc_ref.get()
    if not doc.exists:
        raise HTTPException(status_code=404, detail="Interview not found")

    try:
        updates = {"status": status}

        # Add timestamp based on status
        if status == "in-progress":
            updates["startedAt"] = datetime.now().isoformat()
        elif status == "completed":
            updates["completedAt"] = datetime.now().isoformat()
        elif status == "cancelled":
            updates["cancelledAt"] = datetime.now().isoformat()

        doc_ref.update(updates)
        return {"message": f"Interview status updated to {status}"}
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error updating interview status: {str(e)}")


@router.post("/{interview_id}/messages")
def add_interview_message(interview_id: str, message_data: dict):
    """Add a message to an interview session"""
    try:
        result = InterviewService.add_interview_message(
            interview_id, message_data)
        if result['success']:
            return result
        else:
            raise HTTPException(status_code=400, detail=result['error'])
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error adding message: {str(e)}")


@router.post("/{interview_id}/notes")
def add_interview_note(interview_id: str, note_text: str, author: str = "system"):
    """Add a note to an interview"""
    try:
        result = InterviewService.add_interview_note(
            interview_id, note_text, author)
        if result['success']:
            return result
        else:
            raise HTTPException(status_code=400, detail=result['error'])
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error adding note: {str(e)}")


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
        if result['success']:
            return result
        else:
            raise HTTPException(status_code=400, detail=result['error'])
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
        if result['success']:
            return result
        else:
            raise HTTPException(status_code=400, detail=result['error'])
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error cancelling interview: {str(e)}")


@router.put("/{interview_id}")
def update_interview(interview_id: str, interview: Interview):
    """Update an interview"""
    doc_ref = db.collection("interviews").document(interview_id)
    doc = doc_ref.get()
    if not doc.exists:
        raise HTTPException(status_code=404, detail="Interview not found")

    try:
        interview_data = interview.dict()
        doc_ref.update(interview_data)
        return {"message": "Interview updated successfully"}
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error updating interview: {str(e)}")


@router.delete("/{interview_id}")
def delete_interview(interview_id: str):
    """Delete an interview"""
    doc_ref = db.collection("interviews").document(interview_id)
    doc = doc_ref.get()
    if not doc.exists:
        raise HTTPException(status_code=404, detail="Interview not found")

    try:
        doc_ref.delete()
        return {"message": "Interview deleted successfully"}
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error deleting interview: {str(e)}")


@router.get("/analytics/summary")
def get_interview_analytics():
    """Get comprehensive interview analytics"""
    try:
        analytics = InterviewService.get_interview_analytics()
        return analytics
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error getting interview analytics: {str(e)}")


@router.get("/analytics/completion-rate")
def get_interview_completion_rate():
    """Get interview completion rate analytics (legacy endpoint)"""
    try:
        analytics = InterviewService.get_interview_analytics()
        performance = analytics.get('performance_metrics', {})

        return {
            "completion_rate": performance.get('completion_rate', 0),
            "total_interviews": analytics.get('total_interviews', 0),
            "completed_interviews": performance.get('completed_interviews', 0),
            "pending_interviews": analytics.get('total_interviews', 0) - performance.get('completed_interviews', 0)
        }
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error getting completion rate: {str(e)}")


@router.get("/analytics/by-outcome")
def get_interviews_by_outcome():
    """Get interview analytics by outcome (legacy endpoint)"""
    try:
        analytics = InterviewService.get_interview_analytics()
        outcome_distribution = analytics.get('outcome_distribution', {})
        total = analytics.get('total_interviews', 0)

        return {
            "outcomes": outcome_distribution,
            "total_interviews": total,
            "percentages": {
                outcome: round((count / total) * 100, 2) if total > 0 else 0
                for outcome, count in outcome_distribution.items()
            }
        }
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error getting interview outcomes: {str(e)}")


@router.get("/schedule/availability")
def get_interview_availability(
    date: str = Query(..., description="Date in YYYY-MM-DD format"),
    interviewer_id: Optional[str] = Query(
        None, description="Filter by interviewer ID")
):
    """Get interview availability for a specific date"""
    try:
        # Get all interviews for the date
        interviews_query = db.collection(
            "interviews").where("date", "==", date)
        interviews = [doc.to_dict() for doc in interviews_query.stream()]

        # Filter by interviewer if specified
        if interviewer_id:
            interviews = [
                interview for interview in interviews
                if interview.get("interviewer", {}).get("id") == interviewer_id
            ]

        # Extract booked time slots
        booked_slots = [interview["time"] for interview in interviews]

        # Define available time slots (you can make this configurable)
        all_slots = [
            "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
            "13:00", "13:30", "14:00", "14:30", "15:00", "15:30",
            "16:00", "16:30", "17:00", "17:30"
        ]

        available_slots = [
            slot for slot in all_slots if slot not in booked_slots]

        return {
            "date": date,
            "interviewer_id": interviewer_id,
            "available_slots": available_slots,
            "booked_slots": booked_slots,
            "total_slots": len(all_slots),
            "available_count": len(available_slots)
        }
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error getting interview availability: {str(e)}")

# Placeholder for agentic/AI logic (e.g., interview analysis, summary)
# def analyze_interview(...):
#     pass
