from datetime import datetime
from uuid import UUID

from pydantic import BaseModel


class NewsCreate(BaseModel):
    title: str
    content: str


class NewsUpdate(BaseModel):
    title: str | None = None
    content: str | None = None
    is_published: bool | None = None


class NewsOut(BaseModel):
    id: UUID
    title: str
    content: str
    author_id: UUID
    images: list[str]
    is_published: bool
    published_at: datetime | None
    created_at: datetime

    class Config:
        from_attributes = True
