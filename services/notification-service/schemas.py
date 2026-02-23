from pydantic import BaseModel, EmailStr


class OtpEmailRequest(BaseModel):
    to_email: EmailStr
    otp: str


class WelcomeEmailRequest(BaseModel):
    to_email: EmailStr
    full_name: str


class MeetingReminderRequest(BaseModel):
    to_email: EmailStr
    meeting_title: str
    meeting_time: str


class EnrollmentConfirmRequest(BaseModel):
    to_email: EmailStr
    course_title: str
