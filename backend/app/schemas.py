from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from datetime import datetime


# ============== User Schemas ==============

class UserCreate(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=6)
    name: Optional[str] = None


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserResponse(BaseModel):
    id: str
    email: str
    name: Optional[str]
    created_at: datetime
    onboarding_completed: bool
    current_energy: int
    current_focus: int
    time_available_minutes: int
    
    class Config:
        from_attributes = True


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class TokenData(BaseModel):
    user_id: Optional[str] = None


# ============== Context Schemas ==============

class ContextUpdate(BaseModel):
    energy: int = Field(..., ge=1, le=5, description="Current energy level 1-5")
    focus: int = Field(..., ge=1, le=5, description="Current focus level 1-5")
    time_available_minutes: int = Field(..., ge=5, description="Available time in minutes")


class ContextResponse(BaseModel):
    energy: int
    focus: int
    time_available_minutes: int


# ============== Task Schemas ==============

class TaskCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=500)
    description: Optional[str] = None
    energy_required: int = Field(default=3, ge=1, le=5)
    focus_required: int = Field(default=3, ge=1, le=5)
    time_estimate_minutes: int = Field(default=30, ge=5)
    due_date: Optional[datetime] = None
    category: Optional[str] = None
    tags: Optional[str] = None
    importance_score: float = Field(default=0.5, ge=0, le=1)


class TaskUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=500)
    description: Optional[str] = None
    energy_required: Optional[int] = Field(None, ge=1, le=5)
    focus_required: Optional[int] = Field(None, ge=1, le=5)
    time_estimate_minutes: Optional[int] = Field(None, ge=5)
    due_date: Optional[datetime] = None
    category: Optional[str] = None
    tags: Optional[str] = None
    importance_score: Optional[float] = Field(None, ge=0, le=1)
    status: Optional[str] = None


class TaskResponse(BaseModel):
    id: str
    title: str
    description: Optional[str]
    energy_required: int
    focus_required: int
    time_estimate_minutes: int
    due_date: Optional[datetime]
    status: str
    category: Optional[str]
    tags: Optional[str]
    importance_score: float
    times_snoozed: int
    created_at: datetime
    completed_at: Optional[datetime]
    
    class Config:
        from_attributes = True


# ============== Recommendation Schemas ==============

class RecommendationRequest(BaseModel):
    user_energy: int = Field(..., ge=1, le=5)
    time_available_minutes: int = Field(..., ge=1)


class RecommendationReason(BaseModel):
    factor: str
    description: str
    score_contribution: float


class TaskRecommendation(BaseModel):
    task: TaskResponse
    score: float
    rank: int
    reasons: List[RecommendationReason]


class RecommendationsResponse(BaseModel):
    recommendations: List[TaskRecommendation]
    context: ContextResponse


# ============== Activity Log Schemas ==============

class ActivityLogCreate(BaseModel):
    task_id: str
    action: str = Field(..., pattern="^(accepted|snoozed|skipped|completed)$")
    recommendation_rank: Optional[int] = None
    recommendation_score: Optional[float] = None
    time_to_decision_seconds: Optional[int] = None


class ActivityLogResponse(BaseModel):
    id: str
    task_id: Optional[str]
    action: str
    user_energy: Optional[int]
    user_focus: Optional[int]
    time_available_minutes: Optional[int]
    recommendation_rank: Optional[int]
    recommendation_score: Optional[float]
    timestamp: datetime
    
    class Config:
        from_attributes = True
