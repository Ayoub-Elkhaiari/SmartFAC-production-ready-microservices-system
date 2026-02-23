from contextlib import asynccontextmanager

import httpx
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from config import settings
from schemas import ChatRequest, ChatResponse

FALLBACK_REPLY = "I do not have that information yet. Please contact the faculty via: support@smart-faculty.edu"

SYSTEM_PROMPT = (
    "You are Smart Faculty Assistant for the Smart Faculty platform. "
    "Help users navigate Student, Professor, and Admin portals. "
    "Explain where to find: courses, enrollment, materials, meetings, session reservations, news, analytics, and user management. "
    "If information is missing or uncertain, do not invent facts; respond exactly with: "
    f"'{FALLBACK_REPLY}'."
)


@asynccontextmanager
async def lifespan(app: FastAPI):
    yield


app = FastAPI(title="Chat Service", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
async def health():
    return {"status": "ok", "service": "chat-service"}


@app.post("/chat", response_model=ChatResponse)
async def chat(payload: ChatRequest):
    if not settings.openrouter_api_key:
        return ChatResponse(reply=FALLBACK_REPLY)
    if not payload.messages:
        raise HTTPException(status_code=400, detail="messages cannot be empty")

    openrouter_payload = {
        "model": settings.openrouter_model,
        "messages": [{"role": "system", "content": SYSTEM_PROMPT}]
        + [{"role": m.role, "content": m.content} for m in payload.messages],
    }

    headers = {
        "Authorization": f"Bearer {settings.openrouter_api_key}",
        "Content-Type": "application/json",
        "HTTP-Referer": settings.openrouter_site_url,
        "X-Title": settings.openrouter_site_name,
    }

    try:
        async with httpx.AsyncClient(timeout=settings.request_timeout_seconds) as client:
            response = await client.post(
                "https://openrouter.ai/api/v1/chat/completions",
                headers=headers,
                json=openrouter_payload,
            )
        response.raise_for_status()
        data = response.json()
        reply = (
            data.get("choices", [{}])[0]
            .get("message", {})
            .get("content", "")
            .strip()
        )
        if not reply:
            reply = FALLBACK_REPLY
        return ChatResponse(reply=reply)
    except httpx.HTTPError:
        return ChatResponse(reply=FALLBACK_REPLY)
