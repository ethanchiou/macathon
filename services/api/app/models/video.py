"""
Video Lesson Models
Pydantic models for video generation requests and responses
"""
from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, Field


class Slide(BaseModel):
    """A single slide in the video lesson."""
    slideNumber: int
    title: str
    narration: str = Field(..., description="TTS narration text (~15-20 seconds)")
    imagePrompt: str = Field(..., description="Prompt for image generation")
    keyPoints: List[str] = Field(default_factory=list, description="Bullet points shown on screen")


class VideoScript(BaseModel):
    """Complete script for a video lesson."""
    title: str
    slides: List[Slide]


class VideoRequest(BaseModel):
    """Request to generate a video lesson."""
    topic: str = Field(..., description="The biology topic for the video")
    gradeBand: str = Field(..., description="Target grade band (3-5, 6-8, 9-12)")
    region: str = Field(..., description="Region for contextual examples")
    slideCount: int = Field(default=5, ge=3, le=8, description="Number of slides (3-8)")


class VideoResponse(BaseModel):
    """Response after video generation."""
    videoId: str
    title: str
    videoUrl: str
    thumbnailUrl: str
    durationSeconds: float


class VideoDocument(BaseModel):
    """Video document stored in Firestore."""
    id: str
    ownerUid: str
    topic: str
    gradeBand: str
    region: str
    title: str
    videoUrl: str
    thumbnailUrl: str
    durationSeconds: float
    createdAt: datetime
    script: Optional[VideoScript] = None


class VideoSummary(BaseModel):
    """Summary of a video for listing."""
    id: str
    title: str
    topic: str
    gradeBand: str
    thumbnailUrl: str
    durationSeconds: float
    createdAt: datetime
