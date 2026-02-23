import httpx

from config import settings


async def send_otp_email(email: str, otp: str) -> None:
    async with httpx.AsyncClient(timeout=10) as client:
        await client.post(
            f"{settings.notification_service_url}/send-otp-email",
            json={"to_email": email, "otp": otp},
        )
