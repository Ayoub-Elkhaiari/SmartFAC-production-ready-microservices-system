from datetime import timedelta

import redis.asyncio as redis
from fastapi import APIRouter, Depends, Header, HTTPException
from passlib.context import CryptContext
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from config import settings
from database import get_db
from models import AuthUser
from schemas import ForgotPasswordRequest, ResetPasswordRequest, VerifyOtpRequest
from utils.email import send_otp_email
from utils.jwt import create_token, decode_token
from utils.otp import store_otp, verify_otp

router = APIRouter()
pwd_context = CryptContext(schemes=["pbkdf2_sha256"], deprecated="auto")
redis_client = redis.from_url(settings.redis_url)


@router.post("/forgot-password")
async def forgot_password(payload: ForgotPasswordRequest, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(AuthUser).where(AuthUser.email == payload.email))
    user = result.scalar_one_or_none()
    if not user:
        return {"message": "If email exists, OTP was sent"}
    otp = await store_otp(payload.email, redis_client)
    await send_otp_email(payload.email, otp)
    return {"message": "OTP sent"}


@router.post("/verify-otp")
async def verify(payload: VerifyOtpRequest):
    ok = await verify_otp(payload.email, payload.otp, redis_client)
    if not ok:
        raise HTTPException(status_code=400, detail="Invalid OTP")
    reset_token = create_token({"email": payload.email, "type": "reset"}, timedelta(minutes=10))
    return {"reset_token": reset_token}


@router.post("/reset-password")
async def reset_password(
    payload: ResetPasswordRequest,
    db: AsyncSession = Depends(get_db),
    x_reset_token: str = Header(default=""),
):
    if not x_reset_token:
        raise HTTPException(status_code=401, detail="Missing reset token")
    try:
        claims = decode_token(x_reset_token)
    except Exception as exc:
        raise HTTPException(status_code=401, detail="Invalid reset token") from exc

    if claims.get("type") != "reset":
        raise HTTPException(status_code=401, detail="Invalid token type")
    email = claims["email"]
    result = await db.execute(select(AuthUser).where(AuthUser.email == email))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user.password_hash = pwd_context.hash(payload.password)
    await db.commit()
    return {"message": "Password updated"}
