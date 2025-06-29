from fastapi import APIRouter, HTTPException
from typing import List
from models import Position
from firestore_client import db

router = APIRouter(tags=["positions"])


@router.get("/", response_model=List[Position])
def list_positions():
    """Get all positions"""
    docs = db.collection("positions").stream()
    return [doc.to_dict() for doc in docs]


@router.post("/", response_model=Position)
def create_position(position: Position):
    """Create a new position"""
    db.collection("positions").document(position.id).set(position.dict())
    return position


@router.get("/{position_id}", response_model=Position)
def get_position(position_id: str):
    """Get a specific position by ID"""
    doc = db.collection("positions").document(position_id).get()
    if not doc.exists:
        raise HTTPException(status_code=404, detail="Position not found")
    return doc.to_dict()


@router.put("/{position_id}", response_model=Position)
def update_position(position_id: str, position: Position):
    """Update an existing position"""
    db.collection("positions").document(position_id).set(position.dict())
    return position


@router.delete("/{position_id}")
def delete_position(position_id: str):
    """Delete a position"""
    db.collection("positions").document(position_id).delete()
    return {"message": "Position deleted"}


@router.get("/department/{department}", response_model=List[Position])
def get_positions_by_department(department: str):
    """Get all positions in a specific department"""
    docs = db.collection("positions").where(
        "department", "==", department).stream()
    return [doc.to_dict() for doc in docs]
