from datetime import datetime
from uuid import UUID

from pydantic import BaseModel


class CourseCreate(BaseModel):
    title: str
    description: str
    code: str
    credits: int
    professor_id: UUID
    department: str
    semester: str
    max_students: int


class CourseUpdate(BaseModel):
    title: str | None = None
    description: str | None = None
    code: str | None = None
    credits: int | None = None
    professor_id: UUID | None = None
    department: str | None = None
    semester: str | None = None
    max_students: int | None = None
    is_active: bool | None = None


class CourseOut(BaseModel):
    id: UUID
    title: str
    description: str
    code: str
    credits: int
    professor_id: UUID
    department: str
    semester: str
    max_students: int
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True


class EnrollmentOut(BaseModel):
    id: UUID
    course_id: UUID
    student_id: UUID
    enrolled_at: datetime
    status: str

    class Config:
        from_attributes = True


class MaterialOut(BaseModel):
    id: UUID
    course_id: UUID
    title: str
    description: str | None
    file_url: str
    file_type: str
    uploaded_by: UUID
    uploaded_at: datetime

    class Config:
        from_attributes = True
