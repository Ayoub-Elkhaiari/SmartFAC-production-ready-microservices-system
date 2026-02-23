import uuid
from datetime import timezone

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from auth import require_role
from database import get_db
from models import SessionReservation
from schemas import SessionCreate, SessionOut

router = APIRouter(tags=["sessions"])


def to_db_datetime(dt):
    if dt is None:
        return None
    if dt.tzinfo is not None:
        return dt.astimezone(timezone.utc).replace(tzinfo=None)
    return dt


@router.get("/sessions/", response_model=list[SessionOut])
async def list_sessions(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(SessionReservation).offset(skip).limit(limit))
    return result.scalars().all()


@router.post("/sessions/", response_model=SessionOut, status_code=201)
async def reserve_session(
    payload: SessionCreate,
    db: AsyncSession = Depends(get_db),
    user: dict = Depends(require_role("professor")),
):
    payload_data = payload.model_dump()
    payload_data["reserved_at"] = to_db_datetime(payload_data["reserved_at"])
    reservation = SessionReservation(**payload_data, professor_id=user["sub"])
    db.add(reservation)
    await db.commit()
    await db.refresh(reservation)
    return reservation


@router.put("/sessions/{session_id}/approve", response_model=SessionOut)
async def approve_session(
    session_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    _: dict = Depends(require_role("admin")),
):
    result = await db.execute(select(SessionReservation).where(SessionReservation.id == session_id))
    reservation = result.scalar_one_or_none()
    if not reservation:
        raise HTTPException(status_code=404, detail="Reservation not found")
    reservation.status = "approved"
    await db.commit()
    await db.refresh(reservation)
    return reservation


@router.put("/sessions/{session_id}/reject", response_model=SessionOut)
async def reject_session(
    session_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    _: dict = Depends(require_role("admin")),
):
    result = await db.execute(select(SessionReservation).where(SessionReservation.id == session_id))
    reservation = result.scalar_one_or_none()
    if not reservation:
        raise HTTPException(status_code=404, detail="Reservation not found")
    reservation.status = "rejected"
    await db.commit()
    await db.refresh(reservation)
    return reservation
