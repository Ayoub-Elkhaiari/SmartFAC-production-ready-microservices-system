import os
import uuid
from datetime import datetime

from fastapi import APIRouter, Depends, File, HTTPException, Query, UploadFile
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from auth import require_role
from config import settings
from database import get_db
from models import NewsPost
from schemas import NewsCreate, NewsOut, NewsUpdate

router = APIRouter(prefix="/news", tags=["news"])


@router.get("/", response_model=list[NewsOut])
async def list_news(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(NewsPost).where(NewsPost.is_published.is_(True)).order_by(NewsPost.created_at.desc()).offset(skip).limit(limit)
    )
    return result.scalars().all()


@router.get("/admin/all", response_model=list[NewsOut])
async def list_all_news(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
    _: dict = Depends(require_role("admin")),
):
    result = await db.execute(select(NewsPost).order_by(NewsPost.created_at.desc()).offset(skip).limit(limit))
    return result.scalars().all()


@router.post("/", response_model=NewsOut, status_code=201)
async def create_news(
    payload: NewsCreate,
    db: AsyncSession = Depends(get_db),
    user: dict = Depends(require_role("admin")),
):
    post = NewsPost(**payload.model_dump(), author_id=user["sub"])
    db.add(post)
    await db.commit()
    await db.refresh(post)
    return post


@router.get("/{news_id}", response_model=NewsOut)
async def get_news(news_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(NewsPost).where(NewsPost.id == news_id))
    post = result.scalar_one_or_none()
    if not post:
        raise HTTPException(status_code=404, detail="News not found")
    return post


@router.put("/{news_id}", response_model=NewsOut)
async def update_news(
    news_id: uuid.UUID,
    payload: NewsUpdate,
    db: AsyncSession = Depends(get_db),
    _: dict = Depends(require_role("admin")),
):
    result = await db.execute(select(NewsPost).where(NewsPost.id == news_id))
    post = result.scalar_one_or_none()
    if not post:
        raise HTTPException(status_code=404, detail="News not found")
    for key, value in payload.model_dump(exclude_none=True).items():
        setattr(post, key, value)
    await db.commit()
    await db.refresh(post)
    return post


@router.delete("/{news_id}")
async def delete_news(
    news_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    _: dict = Depends(require_role("admin")),
):
    result = await db.execute(select(NewsPost).where(NewsPost.id == news_id))
    post = result.scalar_one_or_none()
    if not post:
        raise HTTPException(status_code=404, detail="News not found")
    await db.delete(post)
    await db.commit()
    return {"message": "News deleted"}


@router.post("/{news_id}/images", response_model=NewsOut)
async def upload_images(
    news_id: uuid.UUID,
    files: list[UploadFile] = File(...),
    db: AsyncSession = Depends(get_db),
    _: dict = Depends(require_role("admin")),
):
    result = await db.execute(select(NewsPost).where(NewsPost.id == news_id))
    post = result.scalar_one_or_none()
    if not post:
        raise HTTPException(status_code=404, detail="News not found")

    os.makedirs(settings.upload_dir, exist_ok=True)
    urls = list(post.images or [])
    for file in files:
        ext = os.path.splitext(file.filename or "image.jpg")[1] or ".jpg"
        filename = f"news_{news_id}_{uuid.uuid4()}{ext}"
        path = os.path.join(settings.upload_dir, filename)
        with open(path, "wb") as out:
            out.write(await file.read())
        urls.append(f"/uploads/{filename}")

    post.images = urls
    await db.commit()
    await db.refresh(post)
    return post


@router.post("/{news_id}/publish", response_model=NewsOut)
async def publish_news(
    news_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    _: dict = Depends(require_role("admin")),
):
    result = await db.execute(select(NewsPost).where(NewsPost.id == news_id))
    post = result.scalar_one_or_none()
    if not post:
        raise HTTPException(status_code=404, detail="News not found")
    post.is_published = True
    post.published_at = datetime.utcnow()
    await db.commit()
    await db.refresh(post)
    return post
