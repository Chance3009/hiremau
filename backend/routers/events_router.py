from fastapi import APIRouter, HTTPException, Query, Depends
from typing import List, Optional, Dict, Any
from models import (
    Event, EventCreate, EventUpdate, EventStatus,
    EventRegistration, EventRegistrationCreate,
    EventInterview, EventInterviewCreate,
    EventPosition, EventPositionCreate
)
from services.event_service import EventService
from datetime import datetime
from supabase_client import supabase
from pydantic import BaseModel
import logging

router = APIRouter(prefix="/events", tags=["events"])
event_service = EventService()
logger = logging.getLogger(__name__)


class EventModel(BaseModel):
    id: str
    title: str
    name: Optional[str] = None
    description: Optional[str] = None
    date: Optional[str] = None
    location: Optional[str] = None
    status: Optional[str] = "active"
    event_type: Optional[str] = None


@router.get("/active/list", response_model=List[EventModel])
async def get_active_events():
    """Get all active events - simplified endpoint for forms"""
    try:
        result = supabase.table("events").select(
            "*").order("title", desc=False).execute()

        if result.data:
            events = []
            for event_data in result.data:
                event = EventModel(
                    id=str(event_data["id"]),
                    title=event_data["title"],
                    name=event_data.get("name"),
                    description=event_data.get("description"),
                    date=str(event_data.get("date")) if event_data.get(
                        "date") else None,
                    location=event_data.get("location"),
                    status=event_data.get("status", "active"),
                    event_type=event_data.get("event_type")
                )
                events.append(event)
            return events
        else:
            return []

    except Exception as e:
        logger.error(f"Error fetching active events: {str(e)}")
        raise HTTPException(
            status_code=500, detail=f"Error fetching active events: {str(e)}")


@router.get("/test")
def test_events():
    """Test endpoint that returns mock events without database access"""
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


@router.get("/", response_model=List[Event])
def get_events(
    status: Optional[str] = Query(None),
    location: Optional[str] = Query(None)
):
    """Get all events with optional filters"""
    try:
        filters = {k: v for k, v in {"status": status,
                                     "location": location}.items() if v is not None}
        return event_service.get_events(filters)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{event_id}", response_model=Event)
async def get_event(event_id: str):
    """Get a specific event by ID"""
    try:
        event = await event_service.get_event_by_id(event_id)
        if not event:
            raise HTTPException(status_code=404, detail="Event not found")
        return event
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/", response_model=Event)
async def create_event(event: EventCreate):
    """Create a new event"""
    try:
        return await event_service.create_event(event)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.put("/{event_id}", response_model=Event)
async def update_event(event_id: str, event: EventUpdate):
    """Update an existing event"""
    try:
        updated_event = await event_service.update_event(event_id, event)
        if not updated_event:
            raise HTTPException(status_code=404, detail="Event not found")
        return updated_event
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/{event_id}")
async def delete_event(event_id: str):
    """Delete an event"""
    try:
        success = await event_service.delete_event(event_id)
        if not success:
            raise HTTPException(status_code=404, detail="Event not found")
        return {"message": "Event deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# Additional endpoints for enhanced functionality
@router.get("/upcoming/", response_model=Dict[str, Any])
async def get_upcoming_events():
    """Get all upcoming events"""
    try:
        events = await event_service.get_upcoming_events()
        return {
            "events": events,
            "count": len(events)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/past/", response_model=Dict[str, Any])
async def get_past_events():
    """Get all past events"""
    try:
        events = await event_service.get_past_events()
        return {
            "events": events,
            "count": len(events)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{event_id}/analytics")
def get_event_analytics(event_id: str):
    """Get analytics for a specific event"""
    try:
        analytics = EventService.get_event_analytics(event_id)
        if "error" in analytics:
            raise HTTPException(status_code=404, detail=analytics["error"])
        return analytics
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error getting event analytics: {str(e)}")


@router.get("/{event_id}/candidates")
def get_event_candidates(event_id: str):
    """Get all candidates for a specific event"""
    try:
        from candidate_service import CandidateService
        candidates = CandidateService.get_candidates_by_event(event_id)
        return {
            "event_id": event_id,
            "candidates": candidates,
            "count": len(candidates)
        }
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error getting event candidates: {str(e)}")


@router.get("/{event_id}/interviews")
def get_event_interviews(event_id: str):
    """Get all interviews for a specific event"""
    try:
        from interview_service import InterviewService
        interviews = InterviewService.get_interviews_by_event(event_id)
        return {
            "event_id": event_id,
            "interviews": interviews,
            "count": len(interviews)
        }
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error getting event interviews: {str(e)}")


@router.patch("/{event_id}/status")
def update_event_status(event_id: str, status: str, updated_by: str = "system"):
    """Update event status"""
    try:
        # Validate status
        try:
            event_status = EventStatus(status)
        except ValueError:
            raise HTTPException(
                status_code=400, detail=f"Invalid status: {status}")

        result = EventService.update_event_status(
            event_id, event_status, updated_by)
        if result["success"]:
            return result
        else:
            raise HTTPException(status_code=400, detail=result["error"])
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error updating event status: {str(e)}")


@router.get("/analytics/summary", response_model=Dict[str, Any])
async def get_events_summary():
    """Get summary of all events"""
    try:
        return await event_service.get_events_summary()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/with-candidates/")
def get_events_with_candidates():
    """Get events with candidate counts"""
    try:
        events = EventService.get_events_with_candidates()
        return {
            "events": events,
            "count": len(events)
        }
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error fetching events with candidates: {str(e)}")


@router.get("/search/by-location")
def search_events_by_location(location: str = Query(..., description="Location to search for")):
    """Search events by location"""
    try:
        events = EventService.get_events_by_location(location)
        return {
            "location": location,
            "events": events,
            "count": len(events)
        }
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error searching events by location: {str(e)}")


@router.get("/search/by-type")
def search_events_by_type(event_type: str = Query(..., description="Event type to search for")):
    """Search events by type"""
    try:
        events = EventService.get_events_by_type(event_type)
        return {
            "event_type": event_type,
            "events": events,
            "count": len(events)
        }
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error searching events by type: {str(e)}")


@router.post("/{event_id}/positions", response_model=Dict[str, Any])
async def add_event_position(event_id: str, position: EventPositionCreate):
    """Add a position to an event"""
    try:
        return await event_service.add_position(event_id, position)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{event_id}/positions", response_model=List[Dict[str, Any]])
async def get_event_positions(event_id: str):
    """Get all positions for an event"""
    try:
        return await event_service.get_event_positions(event_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/{event_id}/registrations", response_model=Dict[str, Any])
async def register_candidate(event_id: str, registration: EventRegistrationCreate):
    """Register a candidate for an event"""
    try:
        return await event_service.register_candidate(event_id, registration)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{event_id}/registrations", response_model=List[Dict[str, Any]])
async def get_event_registrations(event_id: str):
    """Get all registrations for an event"""
    try:
        return await event_service.get_event_registrations(event_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/{event_id}/interviews", response_model=Dict[str, Any])
async def schedule_interview(event_id: str, interview: EventInterviewCreate):
    """Schedule an interview for an event"""
    try:
        return await event_service.schedule_interview(event_id, interview)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{event_id}/interviews", response_model=List[Dict[str, Any]])
async def get_event_interviews(event_id: str):
    """Get all interviews for an event"""
    try:
        return await event_service.get_event_interviews(event_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{event_id}/metrics", response_model=Dict[str, Any])
async def get_event_metrics(event_id: str):
    """Get metrics for an event"""
    try:
        return await event_service.get_event_metrics(event_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/status/{status}", response_model=Dict[str, Any])
async def get_events_by_status(status: EventStatus):
    """Get events by status"""
    try:
        events = await event_service.get_events_by_status(status)
        return {
            "events": events,
            "count": len(events)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
