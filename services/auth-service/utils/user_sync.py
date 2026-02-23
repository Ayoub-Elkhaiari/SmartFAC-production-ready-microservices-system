import httpx

from config import settings
from models import AuthUser


async def create_user_profile(user: AuthUser) -> bool:
    payload = {
        "id": str(user.id),
        "email": user.email,
        "full_name": user.full_name,
        "role": user.role.value,
    }
    async with httpx.AsyncClient(timeout=10) as client:
        resp = await client.post(f"{settings.user_service_url}/users/", json=payload)
        if resp.status_code in (200, 201):
            return True
        # If already exists, treat as synced.
        if resp.status_code == 400:
            body = resp.json()
            if body.get("detail") == "Email already exists":
                return True
        return False
