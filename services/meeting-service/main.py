import asyncio
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.exc import OperationalError

from database import Base, engine
from routers.meetings import router as meetings_router
from routers.sessions import router as sessions_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    for _ in range(20):
        try:
            async with engine.begin() as conn:
                await conn.run_sync(Base.metadata.create_all)
            break
        except OperationalError:
            await asyncio.sleep(2)
    else:
        raise RuntimeError("Database is not reachable for meeting-service")
    yield


app = FastAPI(title="meeting-service", lifespan=lifespan)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(meetings_router)
app.include_router(sessions_router)


@app.get("/health")
async def health():
    return {"status": "ok", "service": "meeting-service"}
