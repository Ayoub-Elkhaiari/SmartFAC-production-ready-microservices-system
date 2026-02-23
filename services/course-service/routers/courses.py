from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import and_, select
from sqlalchemy.ext.asyncio import AsyncSession

from auth import require_role
from database import get_db
from models import Course
from schemas import CourseCreate, CourseOut, CourseUpdate

router = APIRouter(tags=["courses"])


@router.get("/courses/", response_model=list[CourseOut])
async def list_courses(
    department: str | None = None,
    semester: str | None = None,
    include_inactive: bool = False,
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
):
    filters = []
    if department:
        filters.append(Course.department == department)
    if semester:
        filters.append(Course.semester == semester)
    if not include_inactive:
        filters.append(Course.is_active.is_(True))
    stmt = select(Course).offset(skip).limit(limit)
    if filters:
        stmt = stmt.where(and_(*filters))
    result = await db.execute(stmt)
    return result.scalars().all()


@router.post("/courses/", response_model=CourseOut, status_code=201)
async def create_course(
    payload: CourseCreate,
    db: AsyncSession = Depends(get_db),
    user: dict = Depends(require_role("professor", "admin")),
):
    if user.get("role") == "professor" and str(payload.professor_id) != user.get("sub"):
        raise HTTPException(status_code=403, detail="Professors can only create their own courses")
    course = Course(**payload.model_dump())
    db.add(course)
    await db.commit()
    await db.refresh(course)
    return course


@router.get("/courses/{course_id}", response_model=CourseOut)
async def get_course(course_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Course).where(Course.id == course_id))
    course = result.scalar_one_or_none()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    return course


@router.put("/courses/{course_id}", response_model=CourseOut)
async def update_course(
    course_id: str,
    payload: CourseUpdate,
    db: AsyncSession = Depends(get_db),
    user: dict = Depends(require_role("professor", "admin")),
):
    result = await db.execute(select(Course).where(Course.id == course_id))
    course = result.scalar_one_or_none()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    if user.get("role") == "professor" and str(course.professor_id) != user.get("sub"):
        raise HTTPException(status_code=403, detail="Professors can only edit their own courses")
    for key, value in payload.model_dump(exclude_none=True).items():
        setattr(course, key, value)
    await db.commit()
    await db.refresh(course)
    return course


@router.delete("/courses/{course_id}")
async def delete_course(
    course_id: str,
    db: AsyncSession = Depends(get_db),
    user: dict = Depends(require_role("professor", "admin")),
):
    result = await db.execute(select(Course).where(Course.id == course_id))
    course = result.scalar_one_or_none()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    if user.get("role") == "professor" and str(course.professor_id) != user.get("sub"):
        raise HTTPException(status_code=403, detail="Professors can only delete their own courses")
    # Soft-delete to preserve enrollments/material history and avoid FK violations.
    course.is_active = False
    await db.commit()
    return {"message": "Course deactivated"}
