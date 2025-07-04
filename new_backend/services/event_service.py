import os
from dotenv import load_dotenv
from models import EventCreate, EventUpdate, Event, EventStatus
from typing import List, Optional, Dict, Any
from datetime import datetime
from supabase_client import supabase
import logging
from fastapi import HTTPException
from .base import BaseService
from models import (
    EventRegistration, EventRegistrationCreate,
    EventInterview, EventInterviewCreate,
    EventPosition, EventPositionCreate
)

logger = logging.getLogger(__name__)


class EventService(BaseService):
    """Service for managing recruitment events"""

    def get_events(self, filters: Dict = None) -> List[Event]:
        """Get all events with optional filters"""
        try:
            query = supabase.table("events").select("*")

            if filters:
                for key, value in filters.items():
                    query = query.eq(key, value)

            query = query.order("date", desc=False)
            result = query.execute()

            # Ensure required fields have default values
            events = []
            for event_data in result.data:
                # Set default values for fields that might be None
                event_data['registrations'] = event_data.get(
                    'registrations') or 0
                event_data['interviews'] = event_data.get('interviews') or 0
                events.append(Event(**event_data))

            return events
        except Exception as e:
            logger.error(f"Error getting events: {str(e)}")
            raise

    def get_event_by_id(self, event_id: str) -> Optional[Event]:
        """Get a specific event by ID"""
        try:
            result = supabase.table("events").select(
                "*").eq("id", event_id).execute()
            if result.data:
                event_data = result.data[0]
                # Set default values for fields that might be None
                event_data['registrations'] = event_data.get(
                    'registrations') or 0
                event_data['interviews'] = event_data.get('interviews') or 0
                return Event(**event_data)
            return None
        except Exception as e:
            logger.error(f"Error getting event by ID: {str(e)}")
            raise

    async def create_event(self, event: EventCreate) -> Event:
        """Create a new event"""
        try:
            result = await self.supabase.query(
                """
                INSERT INTO events (
                    title, date, time, location, status,
                    positions, analytics_json
                ) VALUES (
                    :title, :date, :time, :location, :status,
                    :positions, :analytics_json
                ) RETURNING *
                """,
                values=event.dict()
            ).execute()
            return Event(**result.data[0])
        except Exception as e:
            logger.error(f"Error creating event: {str(e)}")
            raise

    async def update_event(self, event_id: str, event: EventUpdate) -> Optional[Event]:
        """Update an existing event"""
        try:
            existing_event = await self.get_event_by_id(event_id)
            if not existing_event:
                return None

            update_data = event.dict(exclude_unset=True)
            if not update_data:
                return existing_event

            set_clauses = []
            for key, value in update_data.items():
                if isinstance(value, str):
                    set_clauses.append(f"{key} = '{value}'")
                else:
                    set_clauses.append(f"{key} = {value}")

            query = f"""
                UPDATE events
                SET {', '.join(set_clauses)}
                WHERE id = '{event_id}'
                RETURNING *
            """
            result = await self.supabase.query(query).execute()
            return Event(**result.data[0])
        except Exception as e:
            logger.error(f"Error updating event: {str(e)}")
            raise

    async def delete_event(self, event_id: str) -> bool:
        """Delete an event"""
        try:
            existing_event = await self.get_event_by_id(event_id)
            if not existing_event:
                return False

            await self.supabase.query(
                f"DELETE FROM events WHERE id = '{event_id}'"
            ).execute()
            return True
        except Exception as e:
            logger.error(f"Error deleting event: {str(e)}")
            raise

    async def get_event_metrics(self, event_id: str) -> Optional[Dict]:
        """Get metrics for a specific event"""
        try:
            existing_event = await self.get_event_by_id(event_id)
            if not existing_event:
                return None

            result = await self.supabase.query(
                f"""
                SELECT
                    e.id,
                    e.title,
                    COUNT(DISTINCT er.id) as total_registrations,
                    COUNT(DISTINCT ei.id) as total_interviews,
                    COUNT(DISTINCT ep.id) as total_positions,
                    COUNT(DISTINCT CASE WHEN ei.status = 'completed' THEN ei.id END) as completed_interviews
                FROM events e
                LEFT JOIN event_registrations er ON e.id = er.event_id
                LEFT JOIN event_interviews ei ON e.id = ei.event_id
                LEFT JOIN event_positions ep ON e.id = ep.event_id
                WHERE e.id = '{event_id}'
                GROUP BY e.id, e.title
                """
            ).execute()
            return result.data[0] if result.data else None
        except Exception as e:
            logger.error(f"Error getting event metrics: {str(e)}")
            raise

    async def get_event_positions(self, event_id: str) -> Optional[List[Dict]]:
        """Get all positions for a specific event"""
        try:
            existing_event = await self.get_event_by_id(event_id)
            if not existing_event:
                return None

            result = await self.supabase.query(
                f"""
                SELECT
                    ep.*,
                    j.title as job_title,
                    j.department as job_department
                FROM event_positions ep
                JOIN jobs j ON ep.job_id = j.id
                WHERE ep.event_id = '{event_id}'
                ORDER BY ep.created_at DESC
                """
            ).execute()
            return result.data
        except Exception as e:
            logger.error(f"Error getting event positions: {str(e)}")
            raise

    async def get_event_registrations(self, event_id: str) -> Optional[List[Dict]]:
        """Get all registrations for a specific event"""
        try:
            existing_event = await self.get_event_by_id(event_id)
            if not existing_event:
                return None

            result = await self.supabase.query(
                f"""
                SELECT
                    er.*,
                    c.name as candidate_name,
                    c.email as candidate_email,
                    j.title as job_title
                FROM event_registrations er
                JOIN candidates c ON er.candidate_id = c.id
                LEFT JOIN jobs j ON er.job_id = j.id
                WHERE er.event_id = '{event_id}'
                ORDER BY er.created_at DESC
                """
            ).execute()
            return result.data
        except Exception as e:
            logger.error(f"Error getting event registrations: {str(e)}")
            raise

    async def register_candidate(self, event_id: str, registration: EventRegistrationCreate) -> Dict:
        """Register a candidate for an event"""
        try:
            existing_event = await self.get_event_by_id(event_id)
            if not existing_event:
                raise HTTPException(status_code=404, detail="Event not found")

            result = await self.supabase.query(
                """
                INSERT INTO event_registrations (
                    event_id, candidate_id, job_id
                ) VALUES (
                    :event_id, :candidate_id, :job_id
                ) RETURNING *
                """,
                values={
                    "event_id": event_id,
                    "candidate_id": registration.candidate_id,
                    "job_id": registration.job_id
                }
            ).execute()
            return result.data[0]
        except Exception as e:
            logger.error(f"Error registering candidate: {str(e)}")
            raise

    async def schedule_interview(self, event_id: str, interview: EventInterviewCreate) -> Dict:
        """Schedule an interview for an event"""
        try:
            existing_event = await self.get_event_by_id(event_id)
            if not existing_event:
                raise HTTPException(status_code=404, detail="Event not found")

            result = await self.supabase.query(
                """
                INSERT INTO event_interviews (
                    event_id, candidate_id, job_id, interviewer, scheduled_at
                ) VALUES (
                    :event_id, :candidate_id, :job_id, :interviewer, :scheduled_at
                ) RETURNING *
                """,
                values={
                    "event_id": event_id,
                    "candidate_id": interview.candidate_id,
                    "job_id": interview.job_id,
                    "interviewer": interview.interviewer,
                    "scheduled_at": interview.scheduled_at
                }
            ).execute()
            return result.data[0]
        except Exception as e:
            logger.error(f"Error scheduling interview: {str(e)}")
            raise

    async def add_position(self, event_id: str, position: EventPositionCreate) -> Dict:
        """Add a position to an event"""
        try:
            existing_event = await self.get_event_by_id(event_id)
            if not existing_event:
                raise HTTPException(status_code=404, detail="Event not found")

            result = await self.supabase.query(
                """
                INSERT INTO event_positions (
                    event_id, job_id, slots, filled, description
                ) VALUES (
                    :event_id, :job_id, :slots, :filled, :description
                ) RETURNING *
                """,
                values={
                    "event_id": event_id,
                    "job_id": position.job_id,
                    "slots": position.slots,
                    "filled": position.filled,
                    "description": position.description
                }
            ).execute()
            return result.data[0]
        except Exception as e:
            logger.error(f"Error adding position: {str(e)}")
            raise

    async def get_upcoming_events(self) -> List[Dict[str, Any]]:
        """Get all upcoming events"""
        try:
            result = await self.supabase.query(
                """
                SELECT *
                FROM events
                WHERE date >= CURRENT_DATE
                AND status = 'upcoming'
                ORDER BY date ASC
                """
            ).execute()
            return result.data
        except Exception as e:
            logger.error(f"Error getting upcoming events: {str(e)}")
            raise

    async def get_past_events(self) -> List[Dict[str, Any]]:
        """Get all past events"""
        try:
            result = await self.supabase.query(
                """
                SELECT *
                FROM events
                WHERE date < CURRENT_DATE
                ORDER BY date DESC
                """
            ).execute()
            return result.data
        except Exception as e:
            logger.error(f"Error getting past events: {str(e)}")
            raise

    async def get_events_by_status(self, status: EventStatus) -> List[Dict[str, Any]]:
        """Get events by status"""
        try:
            result = await self.supabase.query(
                f"""
                SELECT *
                FROM events
                WHERE status = '{status}'
                ORDER BY date ASC
                """
            ).execute()
            return result.data
        except Exception as e:
            logger.error(f"Error getting events by status: {str(e)}")
            raise

    async def get_events_summary(self) -> Dict[str, Any]:
        """Get summary of all events"""
        try:
            result = await self.supabase.query(
                """
                SELECT
                    COUNT(*) as total_events,
                    COUNT(CASE WHEN status = 'upcoming' THEN 1 END) as upcoming_events,
                    COUNT(CASE WHEN status = 'ongoing' THEN 1 END) as ongoing_events,
                    COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_events,
                    COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as cancelled_events
                FROM events
                """
            ).execute()
            return result.data[0]
        except Exception as e:
            logger.error(f"Error getting events summary: {str(e)}")
            raise
