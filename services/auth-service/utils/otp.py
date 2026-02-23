import random

import redis.asyncio as redis


async def store_otp(email: str, r: redis.Redis) -> str:
    otp = str(random.randint(100000, 999999))
    await r.setex(f"otp:{email}", 900, otp)
    return otp


async def verify_otp(email: str, otp: str, r: redis.Redis) -> bool:
    stored = await r.get(f"otp:{email}")
    if stored and stored.decode() == otp:
        await r.delete(f"otp:{email}")
        return True
    return False
