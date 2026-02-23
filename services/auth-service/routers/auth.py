from datetime import timedelta

import redis.asyncio as redis
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, Response, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from passlib.context import CryptContext
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from config import settings
from database import get_db
from models import AuthUser
from schemas import LoginRequest, RefreshRequest, RegisterRequest, TokenResponse, UserOut
from utils.jwt import create_token, decode_token
from utils.user_sync import create_user_profile

router = APIRouter()
security = HTTPBearer(auto_error=False)
pwd_context = CryptContext(schemes=["pbkdf2_sha256"], deprecated="auto")
redis_client = redis.from_url(settings.redis_url, decode_responses=True)


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: AsyncSession = Depends(get_db),
) -> AuthUser:
    if not credentials:
        raise HTTPException(status_code=401, detail="Missing token")
    token = credentials.credentials
    if await redis_client.get(f"blacklist:{token}"):
        raise HTTPException(status_code=401, detail="Token blacklisted")
    try:
        payload = decode_token(token)
    except Exception as exc:
        raise HTTPException(status_code=401, detail="Invalid token") from exc
    user_id = payload.get("sub")
    result = await db.execute(select(AuthUser).where(AuthUser.id == user_id))
    user = result.scalar_one_or_none()
    if not user or not user.is_active:
        raise HTTPException(status_code=401, detail="Inactive user")
    return user


async def require_admin(user: AuthUser = Depends(get_current_user)) -> AuthUser:
    if user.role.value != "admin":
        raise HTTPException(status_code=403, detail="Forbidden")
    return user


@router.post("/register", response_model=UserOut, status_code=201)
async def register(payload: RegisterRequest, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(AuthUser).where(AuthUser.email == payload.email))
    if result.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Email already exists")
    user = AuthUser(
        email=payload.email,
        full_name=payload.full_name,
        role=payload.role,
        password_hash=pwd_context.hash(payload.password),
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)
    synced = await create_user_profile(user)
    if not synced:
        await db.delete(user)
        await db.commit()
        raise HTTPException(status_code=500, detail="User profile sync failed")
    return user


@router.post("/login", response_model=TokenResponse)
async def login(payload: LoginRequest, response: Response, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(AuthUser).where(AuthUser.email == payload.email))
    user = result.scalar_one_or_none()
    if not user or not pwd_context.verify(payload.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    access = create_token(
        {"sub": str(user.id), "email": user.email, "role": user.role.value},
        timedelta(minutes=settings.access_token_expire_minutes),
    )
    refresh = create_token(
        {"sub": str(user.id), "type": "refresh"},
        timedelta(days=settings.refresh_token_expire_days),
    )
    response.set_cookie(
        key="refresh_token",
        value=refresh,
        httponly=True,
        max_age=settings.refresh_token_expire_days * 86400,
        samesite="lax",
    )
    return TokenResponse(access_token=access)


@router.post("/refresh", response_model=TokenResponse)
async def refresh(payload: RefreshRequest, response: Response):
    token = payload.refresh_token or ""
    if not token:
        raise HTTPException(status_code=401, detail="Missing refresh token")
    try:
        claims = decode_token(token)
    except Exception as exc:
        raise HTTPException(status_code=401, detail="Invalid refresh token") from exc
    if claims.get("type") != "refresh":
        raise HTTPException(status_code=401, detail="Invalid token type")

    access = create_token(
        {"sub": claims["sub"], "email": claims.get("email", ""), "role": claims.get("role", "student")},
        timedelta(minutes=settings.access_token_expire_minutes),
    )
    return TokenResponse(access_token=access)


@router.post("/logout")
async def logout(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    response: Response = None,
):
    if not credentials:
        raise HTTPException(status_code=400, detail="Missing token")
    token = credentials.credentials
    await redis_client.setex(f"blacklist:{token}", settings.access_token_expire_minutes * 60, "1")
    if response:
        response.delete_cookie("refresh_token")
    return {"message": "Logged out"}


@router.get("/me", response_model=UserOut)
async def me(user: AuthUser = Depends(get_current_user)):
    return user


@router.get("/users", response_model=list[UserOut])
async def list_users(
    role: str | None = None,
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
    _: AuthUser = Depends(require_admin),
):
    stmt = select(AuthUser)
    if role:
        stmt = stmt.where(AuthUser.role == role)
    stmt = stmt.offset(skip).limit(limit)
    result = await db.execute(stmt)
    return result.scalars().all()


@router.get("/users/{user_id}", response_model=UserOut)
async def get_user_by_id(
    user_id: UUID,
    db: AsyncSession = Depends(get_db),
    _: AuthUser = Depends(get_current_user),
):
    result = await db.execute(select(AuthUser).where(AuthUser.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user
