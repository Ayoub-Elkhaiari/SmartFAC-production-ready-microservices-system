from jose import JWTError, jwt
from fastapi import Depends, HTTPException
from fastapi.security import HTTPBearer

from config import settings

security = HTTPBearer(auto_error=False)


async def get_current_user(token=Depends(security)):
    if not token:
        return None
    try:
        return jwt.decode(token.credentials, settings.secret_key, algorithms=[settings.jwt_algorithm])
    except JWTError as exc:
        raise HTTPException(status_code=401, detail="Invalid token") from exc


def require_role(*roles):
    async def checker(user=Depends(get_current_user)):
        if not user or user.get("role") not in roles:
            raise HTTPException(status_code=403, detail="Forbidden")
        return user

    return checker
