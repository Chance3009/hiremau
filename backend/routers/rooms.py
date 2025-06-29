from fastapi import APIRouter, HTTPException
from typing import List
from models import Room
from firestore_client import db

router = APIRouter(tags=["rooms"])


@router.get("/", response_model=List[Room])
def list_rooms():
    docs = db.collection("rooms").stream()
    return [doc.to_dict() for doc in docs]


@router.post("/", response_model=Room)
def create_room(room: Room):
    db.collection("rooms").document(room.id).set(room.dict())
    return room


@router.get("/{room_id}", response_model=Room)
def get_room(room_id: str):
    doc = db.collection("rooms").document(room_id).get()
    if not doc.exists:
        raise HTTPException(status_code=404, detail="Room not found")
    return doc.to_dict()


@router.put("/{room_id}", response_model=Room)
def update_room(room_id: str, room: Room):
    db.collection("rooms").document(room_id).set(room.dict())
    return room


@router.delete("/{room_id}")
def delete_room(room_id: str):
    db.collection("rooms").document(room_id).delete()
    return {"message": "Room deleted"}


@router.post("/{room_id}/reserve")
def reserve_room(room_id: str):
    # TODO: Implement room reservation logic
    return {"message": "Room reservation not implemented"}


@router.post("/{room_id}/release")
def release_room(room_id: str):
    # TODO: Implement room release logic
    return {"message": "Room release not implemented"}

# Placeholder for agentic/AI logic (e.g., room optimization)
# def analyze_room(...):
#     pass
