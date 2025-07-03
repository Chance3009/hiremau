from typing import List, Optional, Dict, Any
from datetime import datetime
from models import Interview, InterviewCreate, InterviewUpdate, InterviewStatus, InterviewType
from supabase_client import supabase
import logging

logger = logging.getLogger(__name__)


class InterviewService:
    """Service class for managing interviews"""

    @staticmethod
    def create_interview(interview_data: InterviewCreate, scheduled_by: str = "system") -> Dict[str, Any]:
        """Create a new interview"""
        try:
            # Convert to dict and add metadata
            interview_dict = interview_data.dict()
            interview_dict.update({
                "created_by": scheduled_by,
                "updated_by": scheduled_by,
                "created_at": datetime.utcnow().isoformat(),
                "updated_at": datetime.utcnow().isoformat()
            })

            # Insert into database
            result = supabase.table("interviews").insert(
                interview_dict).execute()

            if result.data:
                logger.info(
                    f"Interview created successfully: {result.data[0]['id']}")
                return {
                    "success": True,
                    "interview_id": result.data[0]["id"],
                    "message": "Interview scheduled successfully"
                }
            else:
                return {
                    "success": False,
                    "error": "Failed to create interview"
                }

        except Exception as e:
            logger.error(f"Error creating interview: {str(e)}")
            return {
                "success": False,
                "error": f"Error creating interview: {str(e)}"
            }

    @staticmethod
    def get_all_interviews() -> List[Dict[str, Any]]:
        """Get all interviews"""
        try:
            result = supabase.table("interviews").select(
                "*").order("date", desc=True).execute()
            return result.data if result.data else []
        except Exception as e:
            logger.error(f"Error fetching interviews: {str(e)}")
            return []

    @staticmethod
    def get_interview_by_id(interview_id: str) -> Optional[Dict[str, Any]]:
        """Get interview by ID"""
        try:
            result = supabase.table("interviews").select(
                "*").eq("id", interview_id).execute()
            return result.data[0] if result.data else None
        except Exception as e:
            logger.error(f"Error fetching interview {interview_id}: {str(e)}")
            return None

    @staticmethod
    def update_interview(interview_id: str, interview_data: InterviewUpdate, updated_by: str = "system") -> Dict[str, Any]:
        """Update an interview"""
        try:
            # Convert to dict and add metadata
            update_dict = {k: v for k,
                           v in interview_data.dict().items() if v is not None}
            update_dict.update({
                "updated_by": updated_by,
                "updated_at": datetime.utcnow().isoformat()
            })

            # Update in database
            result = supabase.table("interviews").update(
                update_dict).eq("id", interview_id).execute()

            if result.data:
                logger.info(f"Interview updated successfully: {interview_id}")
                return {
                    "success": True,
                    "message": "Interview updated successfully",
                    "interview": result.data[0]
                }
            else:
                return {
                    "success": False,
                    "error": "Interview not found"
                }

        except Exception as e:
            logger.error(f"Error updating interview {interview_id}: {str(e)}")
            return {
                "success": False,
                "error": f"Error updating interview: {str(e)}"
            }

    @staticmethod
    def delete_interview(interview_id: str) -> Dict[str, Any]:
        """Delete an interview"""
        try:
            result = supabase.table("interviews").delete().eq(
                "id", interview_id).execute()

            if result.data:
                logger.info(f"Interview deleted successfully: {interview_id}")
                return {
                    "success": True,
                    "message": "Interview deleted successfully"
                }
            else:
                return {
                    "success": False,
                    "error": "Interview not found"
                }

        except Exception as e:
            logger.error(f"Error deleting interview {interview_id}: {str(e)}")
            return {
                "success": False,
                "error": f"Error deleting interview: {str(e)}"
            }

    @staticmethod
    def get_interviews_by_status(status: InterviewStatus) -> List[Dict[str, Any]]:
        """Get interviews by status"""
        try:
            result = supabase.table("interviews").select(
                "*").eq("status", status.value).order("date", desc=True).execute()
            return result.data if result.data else []
        except Exception as e:
            logger.error(
                f"Error fetching interviews by status {status}: {str(e)}")
            return []

    @staticmethod
    def get_interviews_by_candidate(candidate_id: str) -> List[Dict[str, Any]]:
        """Get interviews by candidate ID"""
        try:
            result = supabase.table("interviews").select(
                "*").eq("candidate_id", candidate_id).order("date", desc=True).execute()
            return result.data if result.data else []
        except Exception as e:
            logger.error(
                f"Error fetching interviews by candidate {candidate_id}: {str(e)}")
            return []

    @staticmethod
    def get_interviews_by_job(job_id: str) -> List[Dict[str, Any]]:
        """Get interviews by job ID"""
        try:
            result = supabase.table("interviews").select(
                "*").eq("job_id", job_id).order("date", desc=True).execute()
            return result.data if result.data else []
        except Exception as e:
            logger.error(
                f"Error fetching interviews by job {job_id}: {str(e)}")
            return []

    @staticmethod
    def get_interviews_by_event(event_id: str) -> List[Dict[str, Any]]:
        """Get interviews by event ID"""
        try:
            result = supabase.table("interviews").select(
                "*").eq("event_id", event_id).order("date", desc=True).execute()
            return result.data if result.data else []
        except Exception as e:
            logger.error(
                f"Error fetching interviews by event {event_id}: {str(e)}")
            return []

    @staticmethod
    def get_interviews_by_interviewer(interviewer_id: str) -> List[Dict[str, Any]]:
        """Get interviews by interviewer ID"""
        try:
            result = supabase.table("interviews").select("*").execute()
            interviews = result.data if result.data else []

            # Filter by interviewer ID (since interviewer is stored as JSON)
            filtered_interviews = []
            for interview in interviews:
                interviewer = interview.get("interviewer", {})
                if interviewer.get("id") == interviewer_id:
                    filtered_interviews.append(interview)

            return filtered_interviews
        except Exception as e:
            logger.error(
                f"Error fetching interviews by interviewer {interviewer_id}: {str(e)}")
            return []

    @staticmethod
    def get_scheduled_interviews() -> List[Dict[str, Any]]:
        """Get all scheduled interviews"""
        return InterviewService.get_interviews_by_status(InterviewStatus.SCHEDULED)

    @staticmethod
    def get_in_progress_interviews() -> List[Dict[str, Any]]:
        """Get all interviews currently in progress"""
        return InterviewService.get_interviews_by_status(InterviewStatus.IN_PROGRESS)

    @staticmethod
    def get_completed_interviews() -> List[Dict[str, Any]]:
        """Get all completed interviews"""
        return InterviewService.get_interviews_by_status(InterviewStatus.COMPLETED)

    @staticmethod
    def get_todays_interviews() -> List[Dict[str, Any]]:
        """Get all interviews scheduled for today"""
        try:
            today = datetime.utcnow().date().isoformat()
            result = supabase.table("interviews").select(
                "*").gte("date", today).lt("date", f"{today}T23:59:59").execute()
            return result.data if result.data else []
        except Exception as e:
            logger.error(f"Error fetching today's interviews: {str(e)}")
            return []

    @staticmethod
    def start_interview(interview_id: str, started_by: str = "system") -> Dict[str, Any]:
        """Start an interview session"""
        try:
            update_dict = {
                "status": InterviewStatus.IN_PROGRESS.value,
                "updated_by": started_by,
                "updated_at": datetime.utcnow().isoformat()
            }

            result = supabase.table("interviews").update(
                update_dict).eq("id", interview_id).execute()

            if result.data:
                logger.info(f"Interview started: {interview_id}")
                return {
                    "success": True,
                    "message": "Interview started successfully",
                    "interview": result.data[0]
                }
            else:
                return {
                    "success": False,
                    "error": "Interview not found"
                }

        except Exception as e:
            logger.error(f"Error starting interview {interview_id}: {str(e)}")
            return {
                "success": False,
                "error": f"Error starting interview: {str(e)}"
            }

    @staticmethod
    def complete_interview(interview_id: str, outcome: str, evaluation: Optional[Dict[str, Any]] = None, completed_by: str = "system") -> Dict[str, Any]:
        """Complete an interview session"""
        try:
            if outcome not in ["pass", "fail", "pending"]:
                return {
                    "success": False,
                    "error": "Invalid outcome. Must be 'pass', 'fail', or 'pending'"
                }

            update_dict = {
                "status": InterviewStatus.COMPLETED.value,
                "outcome": outcome,
                "updated_by": completed_by,
                "updated_at": datetime.utcnow().isoformat()
            }

            if evaluation:
                update_dict["evaluation"] = evaluation

            result = supabase.table("interviews").update(
                update_dict).eq("id", interview_id).execute()

            if result.data:
                logger.info(f"Interview completed: {interview_id}")
                return {
                    "success": True,
                    "message": "Interview completed successfully",
                    "interview": result.data[0]
                }
            else:
                return {
                    "success": False,
                    "error": "Interview not found"
                }

        except Exception as e:
            logger.error(
                f"Error completing interview {interview_id}: {str(e)}")
            return {
                "success": False,
                "error": f"Error completing interview: {str(e)}"
            }

    @staticmethod
    def reschedule_interview(interview_id: str, new_date: str, new_time: str, rescheduled_by: str = "system") -> Dict[str, Any]:
        """Reschedule an interview"""
        try:
            update_dict = {
                "date": new_date,
                "time": new_time,
                "status": InterviewStatus.SCHEDULED.value,
                "rescheduled_from": interview_id,
                "updated_by": rescheduled_by,
                "updated_at": datetime.utcnow().isoformat()
            }

            result = supabase.table("interviews").update(
                update_dict).eq("id", interview_id).execute()

            if result.data:
                logger.info(f"Interview rescheduled: {interview_id}")
                return {
                    "success": True,
                    "message": "Interview rescheduled successfully",
                    "interview": result.data[0]
                }
            else:
                return {
                    "success": False,
                    "error": "Interview not found"
                }

        except Exception as e:
            logger.error(
                f"Error rescheduling interview {interview_id}: {str(e)}")
            return {
                "success": False,
                "error": f"Error rescheduling interview: {str(e)}"
            }

    @staticmethod
    def cancel_interview(interview_id: str, reason: str, cancelled_by: str = "system") -> Dict[str, Any]:
        """Cancel an interview"""
        try:
            update_dict = {
                "status": InterviewStatus.CANCELLED.value,
                "cancellation_reason": reason,
                "updated_by": cancelled_by,
                "updated_at": datetime.utcnow().isoformat()
            }

            result = supabase.table("interviews").update(
                update_dict).eq("id", interview_id).execute()

            if result.data:
                logger.info(f"Interview cancelled: {interview_id}")
                return {
                    "success": True,
                    "message": "Interview cancelled successfully",
                    "interview": result.data[0]
                }
            else:
                return {
                    "success": False,
                    "error": "Interview not found"
                }

        except Exception as e:
            logger.error(
                f"Error cancelling interview {interview_id}: {str(e)}")
            return {
                "success": False,
                "error": f"Error cancelling interview: {str(e)}"
            }

    @staticmethod
    def add_interview_note(interview_id: str, note_text: str, author: str = "system") -> Dict[str, Any]:
        """Add a note to an interview"""
        try:
            # Get current interview
            interview = InterviewService.get_interview_by_id(interview_id)
            if not interview:
                return {
                    "success": False,
                    "error": "Interview not found"
                }

            # Add note to existing notes or create new notes field
            notes = interview.get("notes", "")
            new_notes = f"{notes}\n\n[{datetime.utcnow().isoformat()}] {author}: {note_text}"

            update_dict = {
                "notes": new_notes,
                "updated_by": author,
                "updated_at": datetime.utcnow().isoformat()
            }

            result = supabase.table("interviews").update(
                update_dict).eq("id", interview_id).execute()

            if result.data:
                logger.info(f"Note added to interview: {interview_id}")
                return {
                    "success": True,
                    "message": "Note added successfully",
                    "interview": result.data[0]
                }
            else:
                return {
                    "success": False,
                    "error": "Failed to add note"
                }

        except Exception as e:
            logger.error(
                f"Error adding note to interview {interview_id}: {str(e)}")
            return {
                "success": False,
                "error": f"Error adding note: {str(e)}"
            }

    @staticmethod
    def get_interview_analytics() -> Dict[str, Any]:
        """Get interview analytics"""
        try:
            # Get all interviews
            interviews = InterviewService.get_all_interviews()

            # Calculate metrics
            total_interviews = len(interviews)
            scheduled_interviews = sum(
                1 for i in interviews if i.get("status") == "scheduled")
            in_progress_interviews = sum(
                1 for i in interviews if i.get("status") == "in-progress")
            completed_interviews = sum(
                1 for i in interviews if i.get("status") == "completed")
            cancelled_interviews = sum(
                1 for i in interviews if i.get("status") == "cancelled")

            # Count by outcome
            outcomes = {}
            for interview in interviews:
                outcome = interview.get("outcome", "unknown")
                outcomes[outcome] = outcomes.get(outcome, 0) + 1

            # Count by type
            types = {}
            for interview in interviews:
                interview_type = interview.get("type", "unknown")
                types[interview_type] = types.get(interview_type, 0) + 1

            return {
                "total_interviews": total_interviews,
                "scheduled": scheduled_interviews,
                "in_progress": in_progress_interviews,
                "completed": completed_interviews,
                "cancelled": cancelled_interviews,
                "completion_rate": round((completed_interviews / max(total_interviews, 1)) * 100, 2),
                "outcomes": outcomes,
                "types": types
            }

        except Exception as e:
            logger.error(f"Error getting interview analytics: {str(e)}")
            return {"error": f"Error getting interview analytics: {str(e)}"}

    @staticmethod
    def get_interview_availability(date: str, interviewer_id: Optional[str] = None) -> Dict[str, Any]:
        """Get interview availability for a specific date"""
        try:
            # Get interviews for the specified date
            result = supabase.table("interviews").select(
                "*").eq("date", date).execute()
            interviews = result.data if result.data else []

            # Filter by interviewer if specified
            if interviewer_id:
                interviews = [i for i in interviews if i.get(
                    "interviewer", {}).get("id") == interviewer_id]

            # Calculate availability (assuming 9 AM to 5 PM with 1-hour slots)
            booked_slots = []
            for interview in interviews:
                if interview.get("status") in ["scheduled", "in-progress"]:
                    time = interview.get("time", "")
                    duration = interview.get("duration_minutes", 60)
                    booked_slots.append({
                        "time": time,
                        "duration": duration,
                        "interview_id": interview.get("id")
                    })

            return {
                "date": date,
                "interviewer_id": interviewer_id,
                "booked_slots": booked_slots,
                "total_booked": len(booked_slots)
            }

        except Exception as e:
            logger.error(
                f"Error getting interview availability for {date}: {str(e)}")
            return {"error": f"Error getting interview availability: {str(e)}"}
