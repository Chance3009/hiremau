from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional
from models import Event, EventCreate, EventUpdate, EventStatus
from services.event_service import EventService
from datetime import datetime

router = APIRouter(tags=["events"])


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
def list_events(
    status: Optional[str] = Query(None, description="Filter by event status"),
    date: Optional[str] = Query(
        None, description="Filter by date (YYYY-MM-DD)"),
    location: Optional[str] = Query(None, description="Filter by location"),
    event_type: Optional[str] = Query(None, description="Filter by event type")
):
    """Get all events with optional filtering"""
    try:
        if status:
            # Validate status
            try:
                event_status = EventStatus(status)
                events = EventService.get_events_by_status(event_status)
            except ValueError:
                raise HTTPException(
                    status_code=400, detail=f"Invalid status: {status}")
        elif date:
            # Filter by date
            events = EventService.get_all_events()
            events = [e for e in events if e.get("date", "").startswith(date)]
        elif location:
            events = EventService.get_events_by_location(location)
        elif event_type:
            events = EventService.get_events_by_type(event_type)
        else:
            events = EventService.get_all_events()

        return events
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error fetching events: {str(e)}")


@router.post("/", response_model=Event)
def create_event(event: EventCreate, created_by: str = "system"):
    """Create a new event"""
    try:
        result = EventService.create_event(event, created_by)
        if result["success"]:
            # Get the created event
            created_event = EventService.get_event_by_id(result["event_id"])
            if created_event:
                return created_event
            else:
                raise HTTPException(
                    status_code=500, detail="Event created but could not retrieve")
        else:
            raise HTTPException(status_code=400, detail=result["error"])
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error creating event: {str(e)}")


@router.get("/{event_id}", response_model=Event)
def get_event(event_id: str):
    """Get a specific event by ID"""
    try:
        event = EventService.get_event_by_id(event_id)
        if not event:
            raise HTTPException(status_code=404, detail="Event not found")
        return event
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error fetching event: {str(e)}")


@router.put("/{event_id}", response_model=Event)
def update_event(event_id: str, event: EventUpdate, updated_by: str = "system"):
    """Update an event"""
    try:
        result = EventService.update_event(event_id, event, updated_by)
        if result["success"]:
            return result["event"]
        else:
            raise HTTPException(status_code=400, detail=result["error"])
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error updating event: {str(e)}")


@router.delete("/{event_id}")
def delete_event(event_id: str):
    """Delete an event"""
    try:
        result = EventService.delete_event(event_id)
        if result["success"]:
            return {"message": "Event deleted"}
        else:
            raise HTTPException(status_code=400, detail=result["error"])
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error deleting event: {str(e)}")


# Additional endpoints for enhanced functionality
@router.get("/upcoming/")
def get_upcoming_events():
    """Get all upcoming events"""
    try:
        events = EventService.get_upcoming_events()
        return {
            "events": events,
            "count": len(events)
        }
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error fetching upcoming events: {str(e)}")


@router.get("/past/")
def get_past_events():
    """Get all past events"""
    try:
        events = EventService.get_past_events()
        return {
            "events": events,
            "count": len(events)
        }
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error fetching past events: {str(e)}")


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


@router.get("/analytics/summary")
def get_events_summary():
    """Get summary of all events"""
    try:
        summary = EventService.get_events_summary()
        if "error" in summary:
            raise HTTPException(status_code=500, detail=summary["error"])
        return summary
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error getting events summary: {str(e)}")


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
