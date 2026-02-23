from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routers.notify import router as notify_router

app = FastAPI(title="notification-service")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(notify_router)


@app.get("/health")
async def health():
    return {"status": "ok", "service": "notification-service"}
