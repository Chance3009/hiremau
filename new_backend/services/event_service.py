import os
from dotenv import load_dotenv
from models import EventCreate, EventUpdate, Event, EventStatus
from typing import List, Optional, Dict, Any
from datetime import datetime
from supabase_client import supabase
import logging

logger = logging.getLogger(__name__)


class EventService:
    """Service class for managing events"""

    @staticmethod
    def create_event(event_data: EventCreate, created_by: str = "system") -> Dict[str, Any]:
        """Create a new event"""
        try:
            # Convert to dict and add metadata
            event_dict = event_data.dict()
            event_dict.update({
                "created_by": created_by,
                "updated_by": created_by,
                "created_at": datetime.utcnow().isoformat(),
                "updated_at": datetime.utcnow().isoformat()
            })

            # Insert into database
            result = supabase.table("events").insert(event_dict).execute()

            if result.data:
                logger.info(
                    f"Event created successfully: {result.data[0]['id']}")
                return {
                    "success": True,
                    "event_id": result.data[0]["id"],
                    "message": "Event created successfully"
                }
            else:
                return {
                    "success": False,
                    "error": "Failed to create event"
                }

        except Exception as e:
            logger.error(f"Error creating event: {str(e)}")
            return {
                "success": False,
                "error": f"Error creating event: {str(e)}"
            }

    @staticmethod
    def get_all_events() -> List[Dict[str, Any]]:
        """Get all events"""
        try:
            if supabase is None:
                logger.warning(
                    "Supabase client not configured. Returning mock data.")
                return [
                    {
                        "id": "1",
                        "name": "Tech Career Fair 2024",
                        "description": "Annual technology career fair",
                        "date": "2024-12-15T10:00:00",
                        "location": "San Francisco",
                        "status": "upcoming",
                        "capacity": 500,
                        "registrations": 150,
                        "attendees": 0,
                        "organizer": "Tech Recruiters Inc",
                        "event_type": "career-fair",
                        "created_at": "2024-01-01T00:00:00",
                        "updated_at": "2024-01-01T00:00:00"
                    },
                    {
                        "id": "2",
                        "name": "Engineering Meetup",
                        "description": "Monthly engineering networking event",
                        "date": "2024-11-20T18:00:00",
                        "location": "New York",
                        "status": "upcoming",
                        "capacity": 100,
                        "registrations": 75,
                        "attendees": 0,
                        "organizer": "Engineering Network",
                        "event_type": "networking",
                        "created_at": "2024-01-01T00:00:00",
                        "updated_at": "2024-01-01T00:00:00"
                    }
                ]

            result = supabase.table("events").select(
                "*").order("date", desc=True).execute()
            return result.data if result.data else []
        except Exception as e:
            logger.error(f"Error fetching events: {str(e)}")
            return []

    @staticmethod
    def get_event_by_id(event_id: str) -> Optional[Dict[str, Any]]:
        """Get event by ID"""
        try:
            if supabase is None:
                logger.warning(
                    "Supabase client not configured. Returning mock data.")
                # Return mock data for testing
                mock_events = [
                    {
                        "id": "1",
                        "name": "Tech Career Fair 2024",
                        "description": "Annual technology career fair",
                        "date": "2024-12-15T10:00:00",
                        "location": "San Francisco",
                        "status": "upcoming",
                        "capacity": 500,
                        "registrations": 150,
                        "attendees": 0,
                        "organizer": "Tech Recruiters Inc",
                        "event_type": "career-fair",
                        "created_at": "2024-01-01T00:00:00",
                        "updated_at": "2024-01-01T00:00:00"
                    }
                ]
                return next((event for event in mock_events if event["id"] == event_id), None)

            result = supabase.table("events").select(
                "*").eq("id", event_id).single().execute()
            return result.data if result.data else None
        except Exception as e:
            logger.error(f"Error fetching event {event_id}: {str(e)}")
            return None

    @staticmethod
    def update_event(event_id: str, event_data: EventUpdate, updated_by: str = "system") -> Dict[str, Any]:
        """Update an event"""
        try:
            # Convert to dict and add metadata
            update_dict = {k: v for k,
                           v in event_data.dict().items() if v is not None}
            update_dict.update({
                "updated_by": updated_by,
                "updated_at": datetime.utcnow().isoformat()
            })

            # Update in database
            result = supabase.table("events").update(
                update_dict).eq("id", event_id).execute()

            if result.data:
                logger.info(f"Event updated successfully: {event_id}")
                return {
                    "success": True,
                    "message": "Event updated successfully",
                    "event": result.data[0]
                }
            else:
                return {
                    "success": False,
                    "error": "Event not found"
                }

        except Exception as e:
            logger.error(f"Error updating event {event_id}: {str(e)}")
            return {
                "success": False,
                "error": f"Error updating event: {str(e)}"
            }

    @staticmethod
    def delete_event(event_id: str) -> Dict[str, Any]:
        """Delete an event"""
        try:
            result = supabase.table("events").delete().eq(
                "id", event_id).execute()

            if result.data:
                logger.info(f"Event deleted successfully: {event_id}")
                return {
                    "success": True,
                    "message": "Event deleted successfully"
                }
            else:
                return {
                    "success": False,
                    "error": "Event not found"
                }

        except Exception as e:
            logger.error(f"Error deleting event {event_id}: {str(e)}")
            return {
                "success": False,
                "error": f"Error deleting event: {str(e)}"
            }

    @staticmethod
    def get_events_by_status(status: EventStatus) -> List[Dict[str, Any]]:
        """Get events by status"""
        try:
            result = supabase.table("events").select(
                "*").eq("status", status.value).order("date", desc=True).execute()
            return result.data if result.data else []
        except Exception as e:
            logger.error(f"Error fetching events by status {status}: {str(e)}")
            return []

    @staticmethod
    def get_upcoming_events() -> List[Dict[str, Any]]:
        """Get upcoming events"""
        try:
            current_date = datetime.utcnow().isoformat()
            result = supabase.table("events").select(
                "*").gte("date", current_date).order("date", asc=True).execute()
            return result.data if result.data else []
        except Exception as e:
            logger.error(f"Error fetching upcoming events: {str(e)}")
            return []

    @staticmethod
    def get_past_events() -> List[Dict[str, Any]]:
        """Get past events"""
        try:
            current_date = datetime.utcnow().isoformat()
            result = supabase.table("events").select(
                "*").lt("date", current_date).order("date", desc=True).execute()
            return result.data if result.data else []
        except Exception as e:
            logger.error(f"Error fetching past events: {str(e)}")
            return []

    @staticmethod
    def get_events_by_location(location: str) -> List[Dict[str, Any]]:
        """Get events by location"""
        try:
            result = supabase.table("events").select(
                "*").eq("location", location).order("date", desc=True).execute()
            return result.data if result.data else []
        except Exception as e:
            logger.error(
                f"Error fetching events by location {location}: {str(e)}")
            return []

    @staticmethod
    def get_events_by_type(event_type: str) -> List[Dict[str, Any]]:
        """Get events by type"""
        try:
            result = supabase.table("events").select(
                "*").eq("type", event_type).order("date", desc=True).execute()
            return result.data if result.data else []
        except Exception as e:
            logger.error(
                f"Error fetching events by type {event_type}: {str(e)}")
            return []

    @staticmethod
    def get_events_with_candidates() -> List[Dict[str, Any]]:
        """Get events with candidate information for dashboard"""
        try:
            result = supabase.table("events").select("*").execute()
            events = result.data if result.data else []

            # Add mock candidate data for now (in real implementation, this would join with candidates table)
            for event in events:
                event["candidate_count"] = 0  # Mock data
                event["registrations"] = 0  # Mock data
            return events
        except Exception as e:
            logger.error(f"Error fetching events with candidates: {str(e)}")
            return []

    @staticmethod
    def get_event_analytics(event_id: str) -> Dict[str, Any]:
        """Get analytics for a specific event"""
        try:
            event = EventService.get_event_by_id(event_id)
            if not event:
                return {
                    "success": False,
                    "error": "Event not found"
                }

            # Mock analytics data (in real implementation, this would calculate from actual data)
            analytics = {
                "total_registrations": 0,
                "total_attendees": 0,
                "attendance_rate": 0.0,
                "candidate_conversions": 0,
                "interview_scheduled": 0,
                "hires": 0,
                "feedback_score": 0.0
            }

            return {
                "success": True,
                "event_id": event_id,
                "analytics": analytics
            }

        except Exception as e:
            logger.error(f"Error getting event analytics {event_id}: {str(e)}")
            return {
                "success": False,
                "error": f"Error getting event analytics: {str(e)}"
            }

    @staticmethod
    def update_event_status(event_id: str, status: EventStatus, updated_by: str = "system") -> Dict[str, Any]:
        """Update event status"""
        try:
            result = supabase.table("events").update({
                "status": status.value,
                "updated_by": updated_by,
                "updated_at": datetime.utcnow().isoformat()
            }).eq("id", event_id).execute()

            if result.data:
                logger.info(
                    f"Event status updated successfully: {event_id} -> {status.value}")
                return {
                    "success": True,
                    "message": "Event status updated successfully",
                    "event": result.data[0]
                }
            else:
                return {
                    "success": False,
                    "error": "Event not found"
                }

        except Exception as e:
            logger.error(f"Error updating event status {event_id}: {str(e)}")
            return {
                "success": False,
                "error": f"Error updating event status: {str(e)}"
            }

    @staticmethod
    def get_events_summary() -> Dict[str, Any]:
        """Get summary of all events"""
        try:
            all_events = EventService.get_all_events()

            total_events = len(all_events)
            upcoming_events = len(EventService.get_upcoming_events())
            past_events = len(EventService.get_past_events())

            # Count by status
            status_counts = {}
            for event in all_events:
                status = event.get("status", "unknown")
                status_counts[status] = status_counts.get(status, 0) + 1

            # Count by type
            type_counts = {}
            for event in all_events:
                event_type = event.get("type", "unknown")
                type_counts[event_type] = type_counts.get(event_type, 0) + 1

            return {
                "success": True,
                "summary": {
                    "total_events": total_events,
                    "upcoming_events": upcoming_events,
                    "past_events": past_events,
                    "status_distribution": status_counts,
                    "type_distribution": type_counts
                }
            }

        except Exception as e:
            logger.error(f"Error getting events summary: {str(e)}")
            return {
                "success": False,
                "error": f"Error getting events summary: {str(e)}"
            }
