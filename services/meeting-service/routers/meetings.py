import uuid
from datetime import timezone

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from auth import require_role
from database import get_db
from models import Meeting
from schemas import MeetingCreate, MeetingOut, MeetingUpdate

router = APIRouter(tags=["meetings"])


def to_db_datetime(dt):
    if dt is None:
        return None
    if dt.tzinfo is not None:
        return dt.astimezone(timezone.utc).replace(tzinfo=None)
    return dt


@router.get("/meetings/", response_model=list[MeetingOut])
async def list_meetings(
    course_id: uuid.UUID | None = None,
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
):
    stmt = select(Meeting).offset(skip).limit(limit)
    if course_id:
        stmt = stmt.where(Meeting.course_id == course_id)
    result = await db.execute(stmt)
    return result.scalars().all()


@router.post("/meetings/", response_model=MeetingOut, status_code=201)
async def create_meeting(
    payload: MeetingCreate,
    db: AsyncSession = Depends(get_db),
    user: dict = Depends(require_role("professor", "admin")),
):
    payload_data = payload.model_dump()
    payload_data["scheduled_at"] = to_db_datetime(payload_data["scheduled_at"])
    meeting = Meeting(**payload_data, created_by=user["sub"])
    db.add(meeting)
    await db.commit()
    await db.refresh(meeting)
    return meeting


@router.get("/meetings/{meeting_id}", response_model=MeetingOut)
async def get_meeting(meeting_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Meeting).where(Meeting.id == meeting_id))
    meeting = result.scalar_one_or_none()
    if not meeting:
        raise HTTPException(status_code=404, detail="Meeting not found")
    return meeting


@router.put("/meetings/{meeting_id}", response_model=MeetingOut)
async def update_meeting(
    meeting_id: uuid.UUID,
    payload: MeetingUpdate,
    db: AsyncSession = Depends(get_db),
    _: dict = Depends(require_role("professor", "admin")),
):
    result = await db.execute(select(Meeting).where(Meeting.id == meeting_id))
    meeting = result.scalar_one_or_none()
    if not meeting:
        raise HTTPException(status_code=404, detail="Meeting not found")
    for key, value in payload.model_dump(exclude_none=True).items():
        if key == "scheduled_at":
            value = to_db_datetime(value)
        setattr(meeting, key, value)
    await db.commit()
    await db.refresh(meeting)
    return meeting


@router.delete("/meetings/{meeting_id}")
async def cancel_meeting(
    meeting_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    _: dict = Depends(require_role("professor", "admin")),
):
    result = await db.execute(select(Meeting).where(Meeting.id == meeting_id))
    meeting = result.scalar_one_or_none()
    if not meeting:
        raise HTTPException(status_code=404, detail="Meeting not found")
    meeting.status = "cancelled"
    await db.commit()
    return {"message": "Meeting cancelled"}


@router.post("/meetings/{meeting_id}/join")
async def join_meeting(meeting_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Meeting).where(Meeting.id == meeting_id))
    meeting = result.scalar_one_or_none()
    if not meeting:
        raise HTTPException(status_code=404, detail="Meeting not found")
    return {"join_url": meeting.meeting_url, "meeting_id": str(meeting.id)}
