"""
Lesson Plan Generator API
FastAPI application entry point
"""
import os
from contextlib import asynccontextmanager

from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Load environment variables
load_dotenv()

from .routes.lessons import router as lessons_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan handler."""
    # Startup
    print("🚀 Lesson Plan Generator API starting...")
    yield
    # Shutdown
    print("👋 Lesson Plan Generator API shutting down...")


app = FastAPI(
    title="Lesson Plan Generator API",
    description="API for generating structured biology lesson plans for teachers",
    version="1.0.0",
    lifespan=lifespan
)

# Configure CORS
cors_origins = os.getenv("CORS_ORIGINS", "http://localhost:3000").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(lessons_router, prefix="/api", tags=["lessons"])


@app.get("/")
async def root():
    """Root endpoint."""
    return {
        "message": "Lesson Plan Generator API",
        "version": "1.0.0",
        "docs": "/docs"
    }


@app.get("/health")
async def health():
    """Health check endpoint."""
    return {"status": "healthy"}
