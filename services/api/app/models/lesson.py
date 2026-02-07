"""
Lesson Plan Generator API - Pydantic Models
Strict schema for biology lesson plans
"""
from datetime import datetime
from typing import List, Literal, Optional
from pydantic import BaseModel, Field


class PriorKnowledgeRecap(BaseModel):
    """Prior knowledge section with review bullets and quick check questions."""
    bullets: List[str] = Field(..., min_length=1, description="Review points for prior knowledge")
    quickCheckQuestions: List[str] = Field(..., min_length=1, description="Quick check questions")


class Misconception(BaseModel):
    """Common misconception with correction and check question."""
    misconception: str = Field(..., description="The common misconception")
    correction: str = Field(..., description="The correct understanding")
    checkQuestion: str = Field(..., description="Question to check understanding")


class Activity(BaseModel):
    """Hands-on classroom activity."""
    title: str = Field(..., description="Activity title")
    timeMinutes: int = Field(..., ge=5, le=60, description="Duration in minutes")
    materials: List[str] = Field(..., min_length=1, description="Required materials")
    steps: List[str] = Field(..., min_length=1, description="Step-by-step instructions")
    teacherPrompts: List[str] = Field(..., min_length=1, description="Prompts for teacher to use")
    expectedStudentResponses: List[str] = Field(..., min_length=1, description="Expected student responses")


class Differentiation(BaseModel):
    """Differentiation strategies for different learner types."""
    strugglingLearners: List[str] = Field(..., min_length=1, description="Strategies for struggling learners")
    advancedLearners: List[str] = Field(..., min_length=1, description="Extensions for advanced learners")
    languageLearners: List[str] = Field(..., min_length=1, description="Support for English language learners")


class LessonPlan(BaseModel):
    """Complete lesson plan following strict schema."""
    title: str = Field(..., description="Lesson title")
    gradeBand: Literal["6-8", "9-10", "11-12"] = Field(..., description="Target grade band")
    region: str = Field(..., description="Target region/country")
    durationMinutes: int = Field(..., ge=20, le=120, description="Lesson duration")
    learningGoals: List[str] = Field(..., min_length=2, description="Learning objectives")
    priorKnowledgeRecap: PriorKnowledgeRecap
    coreExplanation: List[str] = Field(..., min_length=3, description="Core content explanation")
    commonMisconceptions: List[Misconception] = Field(..., min_length=2, description="At least 2 misconceptions")
    activity: Activity
    exitTicket: List[str] = Field(..., min_length=3, description="Exit ticket questions")
    differentiation: Differentiation
    localContextExamples: List[str] = Field(..., min_length=2, description="Region-specific examples")


# Request/Response Models

class GenerateRequest(BaseModel):
    """Request body for lesson plan generation."""
    region: str = Field(..., description="Target region/country")
    gradeBand: Literal["6-8", "9-10", "11-12"] = Field(..., description="Target grade band")
    durationMinutes: Literal[20, 60] = Field(..., description="Lesson duration")
    topicPrompt: str = Field(..., min_length=5, max_length=500, description="Topic description")


class LessonDocument(BaseModel):
    """Firestore lesson document."""
    id: str = Field(..., description="Lesson document ID")
    ownerUid: str = Field(..., description="Owner user ID")
    region: str
    gradeBand: str
    durationMinutes: int
    topicPrompt: str
    createdAt: datetime
    updatedAt: datetime
    lessonPlanJson: LessonPlan


class GenerateResponse(BaseModel):
    """Response from lesson generation."""
    lessonId: str = Field(..., description="Generated lesson ID")
    lessonPlan: LessonPlan


class UpdateLessonRequest(BaseModel):
    """Request body for updating a lesson."""
    lessonPlan: LessonPlan


class LessonSummary(BaseModel):
    """Summary of a lesson for library listing."""
    id: str
    title: str
    region: str
    gradeBand: str
    createdAt: datetime
    updatedAt: datetime
