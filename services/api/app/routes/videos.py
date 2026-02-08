"""
Video Lesson API Routes
POST /generate-video - Generate a new video lesson
GET /videos - List all videos for user
GET /videos/{videoId} - Get a video by ID
GET /videos/{videoId}/stream - Stream/download video file
"""
from typing import List
import uuid
import os
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import FileResponse

from ..models.video import (
    VideoRequest,
    VideoResponse,
    VideoScript,
    VideoSummary,
)
from ..services.auth import verify_firebase_token
from ..services.video_generator import get_video_script_generator
from ..services.image_generator import get_image_generator
from ..services.tts_generator import get_tts_generator
from ..services.video_assembler import get_video_assembler, SlideAssets


router = APIRouter()


@router.post("/generate-video", response_model=VideoResponse)
async def generate_video(
    request: VideoRequest,
    user_id: str = Depends(verify_firebase_token)
):
    """
    Generate a video lesson from the given topic.
    
    Pipeline:
    1. Generate script via Gemini
    2. Generate images via NanoBanana (parallel)
    3. Generate TTS audio via ElevenLabs (parallel)
    4. Assemble video via FFmpeg
    """
    video_id = str(uuid.uuid4())
    
    # Step 1: Generate script
    print(f"[VIDEO] Starting video generation for topic: {request.topic}")
    script_generator = get_video_script_generator()
    script = await script_generator.generate_script(request)
    print(f"[VIDEO] Script generated: {script.title} with {len(script.slides)} slides")
    
    # Step 2 & 3: Generate images and audio in parallel
    image_generator = get_image_generator()
    tts_generator = get_tts_generator()
    
    # Extract prompts and narrations
    image_prompts = [slide.imagePrompt for slide in script.slides]
    narration_texts = [slide.narration for slide in script.slides]
    
    print(f"[VIDEO] Generating {len(image_prompts)} images and {len(narration_texts)} audio clips...")
    
    # Generate in parallel
    import asyncio
    images_task = image_generator.generate_slide_images(image_prompts)
    audio_task = tts_generator.generate_slide_narrations(narration_texts)
    
    images, audio_results = await asyncio.gather(images_task, audio_task)
    
    # Log results
    images_success = sum(1 for img in images if img is not None)
    audio_success = sum(1 for aud, _ in audio_results if aud is not None)
    print(f"[VIDEO] Images generated: {images_success}/{len(images)}")
    print(f"[VIDEO] Audio clips generated: {audio_success}/{len(audio_results)}")
    
    # Step 4: Assemble video
    slides = []
    total_duration = 0.0
    
    for i, slide in enumerate(script.slides):
        audio_bytes, duration = audio_results[i] if i < len(audio_results) else (None, 5.0)
        slides.append(SlideAssets(
            slide_number=slide.slideNumber,
            image_bytes=images[i] if i < len(images) else None,
            audio_bytes=audio_bytes,
            duration_seconds=duration if duration > 0 else 5.0
        ))
        total_duration += duration if duration > 0 else 5.0
    
    # Assemble the video
    assembler = get_video_assembler()
    video_path = await assembler.assemble_video(slides, f"{video_id}.mp4")
    
    print(f"[VIDEO] Assembly result: {video_path}")
    
    # TODO: Upload to Firebase Storage and get public URL
    # For now, return local path
    video_url = f"/output/{video_id}.mp4" if video_path else ""
    thumbnail_url = ""  # TODO: Generate thumbnail from first frame
    
    # TODO: Save to Firestore
    
    return VideoResponse(
        videoId=video_id,
        title=script.title,
        videoUrl=video_url,
        thumbnailUrl=thumbnail_url,
        durationSeconds=total_duration
    )


@router.get("/videos", response_model=List[VideoSummary])
async def list_videos(
    user_id: str = Depends(verify_firebase_token)
):
    """List all videos for the authenticated user."""
    # TODO: Implement Firestore query
    return []


@router.get("/videos/{video_id}")
async def get_video(
    video_id: str,
    user_id: str = Depends(verify_firebase_token)
):
    """Get a specific video by ID."""
    # TODO: Implement Firestore query
    raise HTTPException(status_code=404, detail="Video not found")


@router.get("/videos/{video_id}/stream")
async def stream_video(video_id: str):
    """
    Stream or download a video file.
    No auth required for direct video access (video ID is the security).
    """
    # Look for video in output directory
    output_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "output")
    video_path = os.path.join(output_dir, f"{video_id}.mp4")
    
    if not os.path.exists(video_path):
        raise HTTPException(status_code=404, detail="Video not found")
    
    return FileResponse(
        video_path,
        media_type="video/mp4",
        filename=f"lesson_{video_id}.mp4"
    )
