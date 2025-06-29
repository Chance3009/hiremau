from fastapi import APIRouter, HTTPException
from typing import List
from models import Event
from firestore_client import db

router = APIRouter(tags=["events"])


@router.get("/", response_model=List[Event])
def list_events():
    docs = db.collection("events").stream()
    return [doc.to_dict() for doc in docs]


@router.post("/", response_model=Event)
def create_event(event: Event):
    db.collection("events").document(event.id).set(event.dict())
    return event


@router.get("/{event_id}", response_model=Event)
def get_event(event_id: str):
    doc = db.collection("events").document(event_id).get()
    if not doc.exists:
        raise HTTPException(status_code=404, detail="Event not found")
    return doc.to_dict()


@router.put("/{event_id}", response_model=Event)
def update_event(event_id: str, event: Event):
    db.collection("events").document(event_id).set(event.dict())
    return event


@router.delete("/{event_id}")
def delete_event(event_id: str):
    db.collection("events").document(event_id).delete()
    return {"message": "Event deleted"}

# Placeholder for agentic/AI logic (e.g., event optimization)
# def analyze_event(...):
#     pass
