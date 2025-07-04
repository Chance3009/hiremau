from fastapi import APIRouter, HTTPException, Depends, Query
from typing import List, Optional, Dict, Any
from datetime import datetime, date, time
from pydantic import BaseModel, Field
from supabase import create_client, Client
import os
from dotenv import load_dotenv
import json

# Load environment variables
load_dotenv()

# Initialize Supabase client
supabase: Client = create_client(
    os.getenv("SUPABASE_URL"),
    os.getenv("SUPABASE_KEY")
)

router = APIRouter(prefix="/scheduling", tags=["scheduling"])

# Pydantic models


class InterviewerBase(BaseModel):
    name: str
    email: str
    role: str
    department: Optional[str] = None
    is_active: bool = True
    availability_pattern: Dict[str, List[str]] = Field(default_factory=dict)


class Interviewer(InterviewerBase):
    id: str
    created_at: datetime
    updated_at: datetime


class RoomBase(BaseModel):
    name: str
    capacity: int = 4
    type: str = "general"  # 'general', 'event', 'virtual'
    location: Optional[str] = None
    equipment: List[str] = Field(default_factory=list)
    is_active: bool = True
    event_id: Optional[str] = None


class Room(RoomBase):
    id: str
    created_at: datetime
    updated_at: datetime


class InterviewScheduleBase(BaseModel):
    candidate_id: str
    interviewer_id: str
    room_id: Optional[str] = None
    scheduled_date: date
    scheduled_time: time
    duration_minutes: int = 60
    interview_type: str = "technical"  # 'technical', 'hr', 'cultural', 'final'
    interview_mode: str = "in-person"  # 'in-person', 'virtual', 'hybrid'
    status: str = "scheduled"  # 'scheduled', 'completed', 'cancelled', 'rescheduled'
    notes: Optional[str] = None
    meeting_link: Optional[str] = None
    created_by: Optional[str] = None


class InterviewSchedule(InterviewScheduleBase):
    id: str
    created_at: datetime
    updated_at: datetime


class AvailabilitySlot(BaseModel):
    date: date
    start_time: time
    end_time: time
    is_available: bool = True
    reason: Optional[str] = None


class InterviewerAvailability(BaseModel):
    interviewer_id: str
    date: date
    slots: List[Dict[str, Any]]  # Time slots with availability


class RoomAvailability(BaseModel):
    room_id: str
    date: date
    slots: List[Dict[str, Any]]  # Time slots with availability

# Interviewer endpoints


@router.get("/interviewers", response_model=List[Interviewer])
async def get_interviewers(
    active_only: bool = Query(
        True, description="Only return active interviewers"),
    department: Optional[str] = Query(None, description="Filter by department")
):
    """Get all interviewers"""
    try:
        query = supabase.table("interviewers").select("*")

        if active_only:
            query = query.eq("is_active", True)

        if department:
            query = query.eq("department", department)

        query = query.order("name")

        result = query.execute()
        return result.data
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error fetching interviewers: {str(e)}")


@router.get("/interviewers/{interviewer_id}", response_model=Interviewer)
async def get_interviewer(interviewer_id: str):
    """Get specific interviewer"""
    try:
        result = supabase.table("interviewers").select(
            "*").eq("id", interviewer_id).execute()
        if not result.data:
            raise HTTPException(
                status_code=404, detail="Interviewer not found")
        return result.data[0]
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error fetching interviewer: {str(e)}")


@router.post("/interviewers", response_model=Interviewer)
async def create_interviewer(interviewer: InterviewerBase):
    """Create new interviewer"""
    try:
        result = supabase.table("interviewers").insert(
            interviewer.dict()).execute()
        return result.data[0]
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error creating interviewer: {str(e)}")

# Room endpoints


@router.get("/rooms", response_model=List[Room])
async def get_rooms(
    active_only: bool = Query(True, description="Only return active rooms"),
    room_type: Optional[str] = Query(None, description="Filter by room type"),
    event_id: Optional[str] = Query(None, description="Filter by event ID")
):
    """Get all rooms"""
    try:
        query = supabase.table("rooms").select("*")

        if active_only:
            query = query.eq("is_active", True)

        if room_type:
            query = query.eq("type", room_type)

        if event_id:
            query = query.eq("event_id", event_id)

        query = query.order("name")

        result = query.execute()
        return result.data
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error fetching rooms: {str(e)}")


@router.get("/rooms/{room_id}", response_model=Room)
async def get_room(room_id: str):
    """Get specific room"""
    try:
        result = supabase.table("rooms").select(
            "*").eq("id", room_id).execute()
        if not result.data:
            raise HTTPException(status_code=404, detail="Room not found")
        return result.data[0]
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error fetching room: {str(e)}")

# Interview schedule endpoints


@router.get("/interviews", response_model=List[InterviewSchedule])
async def get_interview_schedules(
    candidate_id: Optional[str] = Query(None),
    interviewer_id: Optional[str] = Query(None),
    room_id: Optional[str] = Query(None),
    scheduled_date: Optional[date] = Query(None),
    status: Optional[str] = Query(None)
):
    """Get interview schedules with optional filters"""
    try:
        query = supabase.table("interview_schedules").select("*")

        if candidate_id:
            query = query.eq("candidate_id", candidate_id)
        if interviewer_id:
            query = query.eq("interviewer_id", interviewer_id)
        if room_id:
            query = query.eq("room_id", room_id)
        if scheduled_date:
            query = query.eq("scheduled_date", scheduled_date.isoformat())
        if status:
            query = query.eq("status", status)

        query = query.order("scheduled_date", desc=False).order(
            "scheduled_time", desc=False)

        result = query.execute()
        return result.data
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error fetching interview schedules: {str(e)}")


@router.post("/interviews", response_model=InterviewSchedule)
async def create_interview_schedule(interview: InterviewScheduleBase):
    """Create new interview schedule"""
    try:
        # Check for conflicts
        existing_query = supabase.table("interview_schedules").select("*").eq(
            "interviewer_id", interview.interviewer_id
        ).eq("scheduled_date", interview.scheduled_date.isoformat()).eq(
            "scheduled_time", interview.scheduled_time.isoformat()
        ).eq("status", "scheduled")

        existing_result = existing_query.execute()
        if existing_result.data:
            raise HTTPException(
                status_code=409,
                detail="Interviewer already has an interview scheduled at this time"
            )

        # Check room conflict if room specified
        if interview.room_id:
            room_query = supabase.table("interview_schedules").select("*").eq(
                "room_id", interview.room_id
            ).eq("scheduled_date", interview.scheduled_date.isoformat()).eq(
                "scheduled_time", interview.scheduled_time.isoformat()
            ).eq("status", "scheduled")

            room_result = room_query.execute()
            if room_result.data:
                raise HTTPException(
                    status_code=409,
                    detail="Room already booked at this time"
                )

        result = supabase.table("interview_schedules").insert(
            interview.dict()).execute()
        return result.data[0]
    except Exception as e:
        if "409" in str(e):
            raise e
        raise HTTPException(
            status_code=500, detail=f"Error creating interview schedule: {str(e)}")


@router.get("/availability/interviewers/{interviewer_id}")
async def get_interviewer_availability(
    interviewer_id: str,
    start_date: date = Query(...,
                             description="Start date for availability check"),
    end_date: date = Query(..., description="End date for availability check")
):
    """Get interviewer availability for date range"""
    try:
        # Get interviewer's general availability pattern
        interviewer_result = supabase.table("interviewers").select(
            "availability_pattern").eq("id", interviewer_id).execute()
        if not interviewer_result.data:
            raise HTTPException(
                status_code=404, detail="Interviewer not found")

        availability_pattern = interviewer_result.data[0].get(
            "availability_pattern", {})

        # Get specific availability overrides
        availability_query = supabase.table("interviewer_availability").select("*").eq(
            "interviewer_id", interviewer_id
        ).gte("date", start_date.isoformat()).lte("date", end_date.isoformat())

        availability_result = availability_query.execute()

        # Get existing bookings
        bookings_query = supabase.table("interview_schedules").select("scheduled_date, scheduled_time").eq(
            "interviewer_id", interviewer_id
        ).eq("status", "scheduled").gte("scheduled_date", start_date.isoformat()).lte("scheduled_date", end_date.isoformat())

        bookings_result = bookings_query.execute()
        booked_slots = {
            f"{booking['scheduled_date']}_{booking['scheduled_time']}" for booking in bookings_result.data}

        # Generate availability slots
        availability_slots = []
        current_date = start_date

        while current_date <= end_date:
            day_name = current_date.strftime("%A").lower()
            day_slots = availability_pattern.get(day_name, [])

            # Generate hourly slots for this day
            available_times = []
            for time_slot in day_slots:
                slot_key = f"{current_date.isoformat()}_{time_slot}:00"
                is_available = slot_key not in booked_slots

                available_times.append({
                    "time": time_slot,
                    "is_available": is_available,
                    "status": "available" if is_available else "booked"
                })

            if available_times:
                availability_slots.append({
                    "date": current_date.isoformat(),
                    "day": day_name.title(),
                    "slots": available_times
                })

            current_date = current_date.replace(day=current_date.day + 1)

        return availability_slots
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error fetching interviewer availability: {str(e)}")


@router.get("/availability/rooms/{room_id}")
async def get_room_availability(
    room_id: str,
    start_date: date = Query(...,
                             description="Start date for availability check"),
    end_date: date = Query(..., description="End date for availability check")
):
    """Get room availability for date range"""
    try:
        # Get existing bookings for this room
        bookings_query = supabase.table("interview_schedules").select("scheduled_date, scheduled_time").eq(
            "room_id", room_id
        ).eq("status", "scheduled").gte("scheduled_date", start_date.isoformat()).lte("scheduled_date", end_date.isoformat())

        bookings_result = bookings_query.execute()
        booked_slots = {
            f"{booking['scheduled_date']}_{booking['scheduled_time']}" for booking in bookings_result.data}

        # Generate availability slots (9 AM to 5 PM by default)
        availability_slots = []
        current_date = start_date

        while current_date <= end_date:
            available_times = []
            for hour in range(9, 17):  # 9 AM to 5 PM
                time_str = f"{hour:02d}:00"
                slot_key = f"{current_date.isoformat()}_{time_str}:00"
                is_available = slot_key not in booked_slots

                available_times.append({
                    "time": time_str,
                    "is_available": is_available,
                    "status": "available" if is_available else "booked"
                })

            availability_slots.append({
                "date": current_date.isoformat(),
                "day": current_date.strftime("%A"),
                "slots": available_times
            })

            current_date = current_date.replace(day=current_date.day + 1)

        return availability_slots
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error fetching room availability: {str(e)}")


@router.get("/availability/summary")
async def get_availability_summary(
    start_date: date = Query(...,
                             description="Start date for availability check"),
    end_date: date = Query(..., description="End date for availability check")
):
    """Get overall availability summary"""
    try:
        # Get all active interviewers
        interviewers_result = supabase.table("interviewers").select(
            "id, name, role").eq("is_active", True).execute()

        # Get all active rooms
        rooms_result = supabase.table("rooms").select(
            "id, name, type").eq("is_active", True).execute()

        # Get all scheduled interviews in the date range
        interviews_result = supabase.table("interview_schedules").select("*").eq(
            "status", "scheduled"
        ).gte("scheduled_date", start_date.isoformat()).lte("scheduled_date", end_date.isoformat()).execute()

        return {
            "interviewers": interviewers_result.data,
            "rooms": rooms_result.data,
            "scheduled_interviews": interviews_result.data,
            "date_range": {
                "start": start_date.isoformat(),
                "end": end_date.isoformat()
            }
        }
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error fetching availability summary: {str(e)}")


@router.put("/interviews/{interview_id}/status")
async def update_interview_status(
    interview_id: str,
    status: str,
    notes: Optional[str] = None
):
    """Update interview status"""
    try:
        update_data = {"status": status}
        if notes:
            update_data["notes"] = notes

        result = supabase.table("interview_schedules").update(
            update_data).eq("id", interview_id).execute()

        if not result.data:
            raise HTTPException(status_code=404, detail="Interview not found")

        return result.data[0]
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error updating interview status: {str(e)}")


@router.delete("/interviews/{interview_id}")
async def cancel_interview(interview_id: str):
    """Cancel an interview"""
    try:
        result = supabase.table("interview_schedules").update(
            {"status": "cancelled"}).eq("id", interview_id).execute()

        if not result.data:
            raise HTTPException(status_code=404, detail="Interview not found")

        return {"message": "Interview cancelled successfully"}
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error cancelling interview: {str(e)}")
