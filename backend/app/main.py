from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.firebase import init_firebase
from app.api import api_router
from contextlib import asynccontextmanager

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize Firebase on startup
    init_firebase()
    yield
    # Cleanup on shutdown if needed

app = FastAPI(
    title="Timetriq API",
    description="Backend API for the Timetriq Work Intelligence Platform",
    version="1.0.0",
    lifespan=lifespan,
)

# Set up CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, restrict this to the frontend origin
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include main API router
app.include_router(api_router, prefix="/api/v1")

@app.get("/health")
def health_check():
    return {"status": "ok", "service": "Timetriq API"}

