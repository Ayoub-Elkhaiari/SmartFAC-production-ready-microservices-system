import uuid

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from auth import require_role
from database import get_db
from models import Course, Enrollment
from schemas import EnrollmentOut

router = APIRouter(tags=["enrollment"])


@router.post("/courses/{course_id}/enroll", response_model=EnrollmentOut)
async def enroll(
    course_id: uuid.UUID,
    student_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    user: dict = Depends(require_role("student", "admin")),
):
    if user.get("role") == "student" and user.get("sub") != str(student_id):
        raise HTTPException(status_code=403, detail="Students can only enroll themselves")
    result = await db.execute(select(Course).where(Course.id == course_id))
    course = result.scalar_one_or_none()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    if not course.is_active:
        raise HTTPException(status_code=400, detail="Course is not active")

    count_result = await db.execute(
        select(func.count()).select_from(Enrollment).where(Enrollment.course_id == course_id, Enrollment.status == "active")
    )
    active_count = count_result.scalar_one()
    if course.max_students > 0 and active_count >= course.max_students:
        raise HTTPException(status_code=400, detail="Course full")

    existing = await db.execute(
        select(Enrollment).where(Enrollment.course_id == course_id, Enrollment.student_id == student_id, Enrollment.status == "active")
    )
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Already enrolled")

    enrollment = Enrollment(course_id=course_id, student_id=student_id)
    db.add(enrollment)
    await db.commit()
    await db.refresh(enrollment)
    return enrollment


@router.delete("/courses/{course_id}/enroll")
async def drop(
    course_id: uuid.UUID,
    student_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    user: dict = Depends(require_role("student", "admin")),
):
    if user.get("role") == "student" and user.get("sub") != str(student_id):
        raise HTTPException(status_code=403, detail="Students can only drop themselves")
    result = await db.execute(
        select(Enrollment).where(Enrollment.course_id == course_id, Enrollment.student_id == student_id, Enrollment.status == "active")
    )
    enrollment = result.scalar_one_or_none()
    if not enrollment:
        raise HTTPException(status_code=404, detail="Enrollment not found")
    enrollment.status = "dropped"
    await db.commit()
    return {"message": "Dropped"}


@router.get("/courses/{course_id}/students", response_model=list[EnrollmentOut])
async def list_students(
    course_id: uuid.UUID,
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
    _: dict = Depends(require_role("professor", "admin")),
):
    result = await db.execute(
        select(Enrollment).where(Enrollment.course_id == course_id, Enrollment.status == "active").offset(skip).limit(limit)
    )
    return result.scalars().all()


@router.get("/students/{student_id}/courses", response_model=list[EnrollmentOut])
async def student_courses(
    student_id: uuid.UUID,
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
    user: dict = Depends(require_role("student", "admin")),
):
    if user.get("role") == "student" and user.get("sub") != str(student_id):
        raise HTTPException(status_code=403, detail="Students can only access their own courses")
    result = await db.execute(
        select(Enrollment).where(Enrollment.student_id == student_id, Enrollment.status == "active").offset(skip).limit(limit)
    )
    return result.scalars().all()
