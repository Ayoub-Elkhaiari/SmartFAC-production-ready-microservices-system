from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, EmailStr

from models import UserRole


class UserCreate(BaseModel):
    id: UUID | None = None
    email: EmailStr
    full_name: str
    role: UserRole
    department: str | None = None
    student_id: str | None = None


class UserUpdate(BaseModel):
    full_name: str | None = None
    role: UserRole | None = None
    department: str | None = None
    student_id: str | None = None
    is_active: bool | None = None


class UserOut(BaseModel):
    id: UUID
    email: EmailStr
    full_name: str
    role: UserRole
    avatar_url: str | None
    department: str | None
    student_id: str | None
    created_at: datetime
    is_active: bool

    class Config:
        from_attributes = True
