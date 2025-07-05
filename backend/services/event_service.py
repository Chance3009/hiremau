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
            # Convert the EventCreate model to a dictionary for insertion
            event_data = event.dict()

            # Handle event_positions if present
            event_positions = event_data.pop('event_positions', [])

            # Set default values and ensure proper formatting
            event_data.setdefault('status', 'active')
            event_data.setdefault('created_at', datetime.utcnow().isoformat())
            event_data.setdefault('updated_at', datetime.utcnow().isoformat())

            # Insert the event into the database
            result = supabase.table("events").insert(event_data).execute()

            if not result.data:
                raise HTTPException(
                    status_code=500, detail="Failed to create event")

            created_event = result.data[0]
            event_id = created_event['id']

            # Insert event positions if provided
            if event_positions:
                for position in event_positions:
                    position_data = {
                        'event_id': event_id,
                        'job_id': position.get('job_id'),
                        'positions_available': position.get('positions_available', 1),
                        'positions_filled': 0,
                        'created_at': datetime.utcnow().isoformat(),
                        'updated_at': datetime.utcnow().isoformat()
                    }
                    supabase.table("event_positions").insert(
                        position_data).execute()

            # Ensure required integer fields are set properly
            created_event['registrations'] = created_event.get(
                'registrations') or 0
            created_event['interviews'] = created_event.get('interviews') or 0

            return Event(**created_event)
        except Exception as e:
            logger.error(f"Error creating event: {str(e)}")
            raise HTTPException(
                status_code=500, detail=f"Failed to create event: {str(e)}")

    async def update_event(self, event_id: str, event: EventUpdate) -> Optional[Event]:
        """Update an existing event"""
        try:
            existing_event = self.get_event_by_id(event_id)
            if not existing_event:
                return None

            update_data = event.dict(exclude_unset=True)
            if not update_data:
                return existing_event

            # Add updated timestamp
            update_data['updated_at'] = datetime.utcnow().isoformat()

            # Update using Supabase table operations
            result = supabase.table("events").update(
                update_data).eq("id", event_id).execute()

            if not result.data:
                return None

            updated_event = result.data[0]
            updated_event['registrations'] = updated_event.get(
                'registrations') or 0
            updated_event['interviews'] = updated_event.get('interviews') or 0

            return Event(**updated_event)
        except Exception as e:
            logger.error(f"Error updating event: {str(e)}")
            raise HTTPException(
                status_code=500, detail=f"Failed to update event: {str(e)}")

    async def delete_event(self, event_id: str) -> bool:
        """Delete an event"""
        try:
            existing_event = self.get_event_by_id(event_id)
            if not existing_event:
                return False

            # Delete using Supabase table operations
            result = supabase.table("events").delete().eq(
                "id", event_id).execute()
            return True
        except Exception as e:
            logger.error(f"Error deleting event: {str(e)}")
            raise HTTPException(
                status_code=500, detail=f"Failed to delete event: {str(e)}")

    async def get_event_metrics(self, event_id: str) -> Optional[Dict]:
        """Get metrics for a specific event"""
        try:
            existing_event = self.get_event_by_id(event_id)
            if not existing_event:
                return None

            # Get event basic info
            event_info = {
                'id': event_id,
                'title': existing_event.title if hasattr(existing_event, 'title') else 'Event'
            }

            # Count registrations
            try:
                reg_result = supabase.table("event_registrations").select(
                    "id", count="exact").eq("event_id", event_id).execute()
                event_info['total_registrations'] = reg_result.count or 0
            except:
                event_info['total_registrations'] = 0

            # Count interviews
            try:
                int_result = supabase.table("interviews").select(
                    "id", count="exact").eq("event_id", event_id).execute()
                event_info['total_interviews'] = int_result.count or 0
            except:
                event_info['total_interviews'] = 0

            # Count positions
            try:
                pos_result = supabase.table("event_positions").select(
                    "id", count="exact").eq("event_id", event_id).execute()
                event_info['total_positions'] = pos_result.count or 0
            except:
                event_info['total_positions'] = 0

            event_info['completed_interviews'] = 0  # Simplified for now

            return event_info
        except Exception as e:
            logger.error(f"Error getting event metrics: {str(e)}")
            return None

    async def get_event_positions(self, event_id: str) -> Optional[List[Dict]]:
        """Get all positions for an event"""
        try:
            result = supabase.table("event_positions").select(
                "*", "jobs(id, title, description)"
            ).eq("event_id", event_id).execute()

            if result.data:
                positions = []
                for pos in result.data:
                    position_data = {
                        'id': pos['id'],
                        'event_id': pos['event_id'],
                        'job_id': pos['job_id'],
                        'positions_available': pos.get('positions_available', 1),
                        'positions_filled': pos.get('positions_filled', 0),
                        'job_title': pos.get('jobs', {}).get('title', 'Unknown Position') if pos.get('jobs') else 'Unknown Position',
                        'job_description': pos.get('jobs', {}).get('description', '') if pos.get('jobs') else '',
                        'created_at': pos.get('created_at'),
                        'updated_at': pos.get('updated_at')
                    }
                    positions.append(position_data)
                return positions
            return []
        except Exception as e:
            logger.error(f"Error getting event positions: {str(e)}")
            return []

    async def get_event_registrations(self, event_id: str) -> Optional[List[Dict]]:
        """Get all registrations for an event"""
        try:
            result = supabase.table("event_registrations").select(
                "*", "candidates(id, name, email, phone, stage, status)"
            ).eq("event_id", event_id).execute()

            if result.data:
                registrations = []
                for reg in result.data:
                    reg_data = {
                        'id': reg['id'],
                        'event_id': reg['event_id'],
                        'candidate_id': reg['candidate_id'],
                        'registration_date': reg.get('registration_date'),
                        'status': reg.get('status', 'registered'),
                        'notes': reg.get('notes', ''),
                        'candidate': reg.get('candidates', {}),
                        'created_at': reg.get('created_at'),
                        'updated_at': reg.get('updated_at')
                    }
                    registrations.append(reg_data)
                return registrations
            return []
        except Exception as e:
            logger.error(f"Error getting event registrations: {str(e)}")
            return []

    async def register_candidate(self, event_id: str, registration: EventRegistrationCreate) -> Dict:
        """Register a candidate for an event"""
        try:
            registration_data = registration.dict()
            registration_data['event_id'] = event_id
            registration_data['registration_date'] = datetime.utcnow(
            ).isoformat()
            registration_data['status'] = 'registered'
            registration_data['created_at'] = datetime.utcnow().isoformat()
            registration_data['updated_at'] = datetime.utcnow().isoformat()

            result = supabase.table("event_registrations").insert(
                registration_data).execute()

            if result.data:
                return {
                    'success': True,
                    'registration_id': result.data[0]['id'],
                    'message': 'Candidate registered successfully'
                }
            else:
                raise HTTPException(
                    status_code=500, detail="Failed to register candidate")
        except Exception as e:
            logger.error(f"Error registering candidate: {str(e)}")
            raise HTTPException(
                status_code=500, detail=f"Failed to register candidate: {str(e)}")

    async def schedule_interview(self, event_id: str, interview: EventInterviewCreate) -> Dict:
        """Schedule an interview for an event"""
        try:
            interview_data = interview.dict()
            interview_data['event_id'] = event_id
            interview_data['status'] = 'scheduled'
            interview_data['created_at'] = datetime.utcnow().isoformat()
            interview_data['updated_at'] = datetime.utcnow().isoformat()

            result = supabase.table("interviews").insert(
                interview_data).execute()

            if result.data:
                return {
                    'success': True,
                    'interview_id': result.data[0]['id'],
                    'message': 'Interview scheduled successfully'
                }
            else:
                raise HTTPException(
                    status_code=500, detail="Failed to schedule interview")
        except Exception as e:
            logger.error(f"Error scheduling interview: {str(e)}")
            raise HTTPException(
                status_code=500, detail=f"Failed to schedule interview: {str(e)}")

    async def add_position(self, event_id: str, position: EventPositionCreate) -> Dict:
        """Add a position to an event"""
        try:
            position_data = position.dict()
            position_data['event_id'] = event_id
            position_data['positions_filled'] = 0
            position_data['created_at'] = datetime.utcnow().isoformat()
            position_data['updated_at'] = datetime.utcnow().isoformat()

            result = supabase.table("event_positions").insert(
                position_data).execute()

            if result.data:
                return {
                    'success': True,
                    'position_id': result.data[0]['id'],
                    'message': 'Position added successfully'
                }
            else:
                raise HTTPException(
                    status_code=500, detail="Failed to add position")
        except Exception as e:
            logger.error(f"Error adding position: {str(e)}")
            raise HTTPException(
                status_code=500, detail=f"Failed to add position: {str(e)}")

    async def get_upcoming_events(self) -> List[Dict[str, Any]]:
        """Get upcoming events"""
        try:
            current_date = datetime.utcnow().isoformat()
            result = supabase.table("events").select(
                "*").gte("date", current_date).order("date", desc=False).execute()
            return result.data if result.data else []
        except Exception as e:
            logger.error(f"Error getting upcoming events: {str(e)}")
            return []

    async def get_past_events(self) -> List[Dict[str, Any]]:
        """Get past events"""
        try:
            current_date = datetime.utcnow().isoformat()
            result = supabase.table("events").select(
                "*").lt("date", current_date).order("date", desc=True).execute()
            return result.data if result.data else []
        except Exception as e:
            logger.error(f"Error getting past events: {str(e)}")
            return []

    async def get_events_by_status(self, status: EventStatus) -> List[Dict[str, Any]]:
        """Get events by status"""
        try:
            result = supabase.table("events").select(
                "*").eq("status", status.value).order("date", desc=False).execute()
            return result.data if result.data else []
        except Exception as e:
            logger.error(f"Error getting events by status: {str(e)}")
            return []

    async def get_events_summary(self) -> Dict[str, Any]:
        """Get summary of all events"""
        try:
            total_result = supabase.table("events").select(
                "id", count="exact").execute()
            active_result = supabase.table("events").select(
                "id", count="exact").eq("status", "active").execute()

            current_date = datetime.utcnow().isoformat()
            upcoming_result = supabase.table("events").select(
                "id", count="exact").gte("date", current_date).execute()

            return {
                'total_events': total_result.count or 0,
                'active_events': active_result.count or 0,
                'upcoming_events': upcoming_result.count or 0
            }
        except Exception as e:
            logger.error(f"Error getting events summary: {str(e)}")
            return {
                'total_events': 0,
                'active_events': 0,
                'upcoming_events': 0
            }
