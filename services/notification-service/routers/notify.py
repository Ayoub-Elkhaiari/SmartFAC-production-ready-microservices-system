from fastapi import APIRouter

from email_utils import send_email
from schemas import EnrollmentConfirmRequest, MeetingReminderRequest, OtpEmailRequest, WelcomeEmailRequest

router = APIRouter()


@router.post("/send-otp-email")
async def send_otp_email(payload: OtpEmailRequest):
    send_email(payload.to_email, "Smart Faculty OTP", f"Your OTP code is: {payload.otp}")
    return {"message": "OTP email queued"}


@router.post("/send-welcome-email")
async def send_welcome_email(payload: WelcomeEmailRequest):
    send_email(payload.to_email, "Welcome to Smart Faculty", f"Hi {payload.full_name}, welcome aboard.")
    return {"message": "Welcome email queued"}


@router.post("/send-meeting-reminder")
async def send_meeting_reminder(payload: MeetingReminderRequest):
    send_email(
        payload.to_email,
        "Meeting reminder",
        f"Reminder: {payload.meeting_title} at {payload.meeting_time}.",
    )
    return {"message": "Meeting reminder queued"}


@router.post("/send-enrollment-confirm")
async def send_enrollment_confirm(payload: EnrollmentConfirmRequest):
    send_email(payload.to_email, "Enrollment confirmed", f"You enrolled in {payload.course_title}.")
    return {"message": "Enrollment confirmation queued"}
