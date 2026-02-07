"""
Firestore Repository for Lesson Plans
Handles all CRUD operations with user-scoped security
"""
from datetime import datetime
from typing import List, Optional
import uuid

from google.cloud.firestore_v1 import FieldFilter

from ..services.auth import get_firestore_client
from ..models.lesson import LessonPlan, LessonDocument, LessonSummary


class LessonRepository:
    """Repository for lesson plan CRUD operations in Firestore."""
    
    COLLECTION = "lessons"
    
    def __init__(self):
        self.db = get_firestore_client()
    
    def _get_collection(self):
        return self.db.collection(self.COLLECTION)
    
    async def create(
        self,
        owner_uid: str,
        region: str,
        grade_band: str,
        duration_minutes: int,
        topic_prompt: str,
        lesson_plan: LessonPlan
    ) -> LessonDocument:
        """Create a new lesson document."""
        lesson_id = str(uuid.uuid4())
        now = datetime.utcnow()
        
        doc_data = {
            "ownerUid": owner_uid,
            "region": region,
            "gradeBand": grade_band,
            "durationMinutes": duration_minutes,
            "topicPrompt": topic_prompt,
            "createdAt": now,
            "updatedAt": now,
            "lessonPlanJson": lesson_plan.model_dump()
        }
        
        self._get_collection().document(lesson_id).set(doc_data)
        
        return LessonDocument(
            id=lesson_id,
            ownerUid=owner_uid,
            region=region,
            gradeBand=grade_band,
            durationMinutes=duration_minutes,
            topicPrompt=topic_prompt,
            createdAt=now,
            updatedAt=now,
            lessonPlanJson=lesson_plan
        )
    
    async def get_by_id(self, lesson_id: str, owner_uid: str) -> Optional[LessonDocument]:
        """Get a lesson by ID, ensuring owner matches."""
        doc = self._get_collection().document(lesson_id).get()
        
        if not doc.exists:
            return None
        
        data = doc.to_dict()
        
        # Security check: only owner can access
        if data.get("ownerUid") != owner_uid:
            return None
        
        return LessonDocument(
            id=doc.id,
            ownerUid=data["ownerUid"],
            region=data["region"],
            gradeBand=data["gradeBand"],
            durationMinutes=data["durationMinutes"],
            topicPrompt=data["topicPrompt"],
            createdAt=data["createdAt"],
            updatedAt=data["updatedAt"],
            lessonPlanJson=LessonPlan(**data["lessonPlanJson"])
        )
    
    async def update(
        self,
        lesson_id: str,
        owner_uid: str,
        lesson_plan: LessonPlan
    ) -> Optional[LessonDocument]:
        """Update a lesson's plan content."""
        doc_ref = self._get_collection().document(lesson_id)
        doc = doc_ref.get()
        
        if not doc.exists:
            return None
        
        data = doc.to_dict()
        
        # Security check: only owner can update
        if data.get("ownerUid") != owner_uid:
            return None
        
        now = datetime.utcnow()
        
        doc_ref.update({
            "lessonPlanJson": lesson_plan.model_dump(),
            "updatedAt": now
        })
        
        return LessonDocument(
            id=doc.id,
            ownerUid=data["ownerUid"],
            region=data["region"],
            gradeBand=data["gradeBand"],
            durationMinutes=data["durationMinutes"],
            topicPrompt=data["topicPrompt"],
            createdAt=data["createdAt"],
            updatedAt=now,
            lessonPlanJson=lesson_plan
        )
    
    async def list_by_owner(self, owner_uid: str) -> List[LessonSummary]:
        """List all lessons owned by a user."""
        query = self._get_collection().where(
            filter=FieldFilter("ownerUid", "==", owner_uid)
        ).order_by("createdAt", direction="DESCENDING")
        
        docs = query.stream()
        
        summaries = []
        for doc in docs:
            data = doc.to_dict()
            lesson_plan = data.get("lessonPlanJson", {})
            
            summaries.append(LessonSummary(
                id=doc.id,
                title=lesson_plan.get("title", "Untitled Lesson"),
                region=data.get("region", ""),
                gradeBand=data.get("gradeBand", ""),
                createdAt=data.get("createdAt"),
                updatedAt=data.get("updatedAt")
            ))
        
        return summaries
    
    async def delete(self, lesson_id: str, owner_uid: str) -> bool:
        """Delete a lesson (for future use)."""
        doc_ref = self._get_collection().document(lesson_id)
        doc = doc_ref.get()
        
        if not doc.exists:
            return False
        
        data = doc.to_dict()
        
        # Security check: only owner can delete
        if data.get("ownerUid") != owner_uid:
            return False
        
        doc_ref.delete()
        return True


# Singleton instance
_repo: Optional[LessonRepository] = None


def get_lesson_repository() -> LessonRepository:
    """Get singleton repository instance."""
    global _repo
    if _repo is None:
        _repo = LessonRepository()
    return _repo
