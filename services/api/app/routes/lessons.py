"""
Lesson Plan API Routes
POST /generate - Generate a new lesson plan
GET /lessons/{lessonId} - Get a lesson by ID
PUT /lessons/{lessonId} - Update a lesson
GET /lessons - List all lessons for user
"""
from typing import List

from fastapi import APIRouter, Depends, HTTPException

from ..models.lesson import (
    GenerateRequest,
    GenerateResponse,
    LessonDocument,
    LessonSummary,
    UpdateLessonRequest,
)
from ..services.auth import verify_firebase_token
from ..services.generator import get_lesson_generator
from ..repositories.firestore import get_lesson_repository


router = APIRouter()


@router.post("/generate", response_model=GenerateResponse)
async def generate_lesson(
    request: GenerateRequest,
    user_id: str = Depends(verify_firebase_token)
):
    """Generate a new lesson plan from the given parameters."""
    generator = get_lesson_generator()
    repo = get_lesson_repository()
    
    # Generate the lesson plan
    lesson_plan = await generator.generate(request)
    
    # Save to Firestore
    doc = await repo.create(
        owner_uid=user_id,
        region=request.region,
        grade_band=request.gradeBand,
        duration_minutes=request.durationMinutes,
        topic_prompt=request.topicPrompt,
        lesson_plan=lesson_plan
    )
    
    return GenerateResponse(
        lessonId=doc.id,
        lessonPlan=lesson_plan
    )


@router.get("/lessons", response_model=List[LessonSummary])
async def list_lessons(
    user_id: str = Depends(verify_firebase_token)
):
    """List all lessons for the authenticated user."""
    repo = get_lesson_repository()
    return await repo.list_by_owner(user_id)


@router.get("/lessons/{lesson_id}", response_model=LessonDocument)
async def get_lesson(
    lesson_id: str,
    user_id: str = Depends(verify_firebase_token)
):
    """Get a specific lesson by ID."""
    repo = get_lesson_repository()
    doc = await repo.get_by_id(lesson_id, user_id)
    
    if not doc:
        raise HTTPException(status_code=404, detail="Lesson not found")
    
    return doc


@router.put("/lessons/{lesson_id}", response_model=LessonDocument)
async def update_lesson(
    lesson_id: str,
    request: UpdateLessonRequest,
    user_id: str = Depends(verify_firebase_token)
):
    """Update a lesson's content."""
    repo = get_lesson_repository()
    doc = await repo.update(lesson_id, user_id, request.lessonPlan)
    
    if not doc:
        raise HTTPException(status_code=404, detail="Lesson not found")
    
    return doc


@router.delete("/lessons/{lesson_id}")
async def delete_lesson(
    lesson_id: str,
    user_id: str = Depends(verify_firebase_token)
):
    """Delete a lesson."""
    repo = get_lesson_repository()
    success = await repo.delete(lesson_id, user_id)
    
    if not success:
        raise HTTPException(status_code=404, detail="Lesson not found")
    
    return {"success": True}
