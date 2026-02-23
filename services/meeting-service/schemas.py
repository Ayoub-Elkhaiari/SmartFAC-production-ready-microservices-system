from datetime import datetime
from uuid import UUID

from pydantic import BaseModel


class MeetingCreate(BaseModel):
    title: str
    description: str | None = None
    course_id: UUID | None = None
    meeting_url: str
    scheduled_at: datetime
    duration_minutes: int
    is_recurring: bool = False


class MeetingUpdate(BaseModel):
    title: str | None = None
    description: str | None = None
    meeting_url: str | None = None
    scheduled_at: datetime | None = None
    duration_minutes: int | None = None
    is_recurring: bool | None = None
    status: str | None = None


class SessionCreate(BaseModel):
    room: str
    reserved_at: datetime
    duration_minutes: int
    purpose: str


class SessionUpdate(BaseModel):
    status: str


class MeetingOut(BaseModel):
    id: UUID
    title: str
    description: str | None
    course_id: UUID | None
    created_by: UUID
    meeting_url: str
    scheduled_at: datetime
    duration_minutes: int
    is_recurring: bool
    status: str

    class Config:
        from_attributes = True


class SessionOut(BaseModel):
    id: UUID
    professor_id: UUID
    room: str
    reserved_at: datetime
    duration_minutes: int
    purpose: str
    status: str

    class Config:
        from_attributes = True
