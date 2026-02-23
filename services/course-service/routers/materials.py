import os
import uuid

from fastapi import APIRouter, Depends, File, Form, HTTPException, Query, UploadFile
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from auth import get_current_user, require_role
from config import settings
from database import get_db
from models import Material
from schemas import MaterialOut

router = APIRouter(tags=["materials"])


@router.get("/courses/{course_id}/materials", response_model=list[MaterialOut])
async def list_materials(
    course_id: uuid.UUID,
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Material).where(Material.course_id == course_id).offset(skip).limit(limit))
    return result.scalars().all()


@router.post("/courses/{course_id}/materials", response_model=MaterialOut, status_code=201)
async def upload_material(
    course_id: uuid.UUID,
    title: str = Form(...),
    description: str = Form(default=""),
    file_type: str = Form(...),
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
    user: dict = Depends(require_role("professor", "admin")),
):
    os.makedirs(settings.upload_dir, exist_ok=True)
    ext = os.path.splitext(file.filename or "material")[1]
    filename = f"material_{course_id}_{uuid.uuid4()}{ext}"
    target = os.path.join(settings.upload_dir, filename)
    with open(target, "wb") as out:
        out.write(await file.read())

    material = Material(
        course_id=course_id,
        title=title,
        description=description,
        file_url=f"/uploads/{filename}",
        file_type=file_type,
        uploaded_by=user.get("sub"),
    )
    db.add(material)
    await db.commit()
    await db.refresh(material)
    return material


@router.delete("/courses/{course_id}/materials/{material_id}")
async def delete_material(
    course_id: uuid.UUID,
    material_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    _: dict = Depends(require_role("professor", "admin")),
):
    result = await db.execute(select(Material).where(Material.id == material_id, Material.course_id == course_id))
    material = result.scalar_one_or_none()
    if not material:
        raise HTTPException(status_code=404, detail="Material not found")
    await db.delete(material)
    await db.commit()
    return {"message": "Material deleted"}
