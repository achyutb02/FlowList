import uuid
from datetime import datetime
from sqlalchemy import Column, String, Integer, Float, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.database import Base


def generate_uuid():
    return str(uuid.uuid4())


class User(Base):
    __tablename__ = "users"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    email = Column(String(255), unique=True, nullable=False, index=True)
    hashed_password = Column(String(255), nullable=False)
    name = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    onboarding_completed = Column(Boolean, default=False)
    
    # Current context (updated when user submits context)
    current_energy = Column(Integer, default=3)  # 1-5
    current_focus = Column(Integer, default=3)   # 1-5
    time_available_minutes = Column(Integer, default=60)
    
    # Relationships
    tasks = relationship("Task", back_populates="user", cascade="all, delete-orphan")
    activity_logs = relationship("ActivityLog", back_populates="user", cascade="all, delete-orphan")


class Task(Base):
    __tablename__ = "tasks"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False)
    title = Column(String(500), nullable=False)
    description = Column(Text, nullable=True)
    
    # Energy/Focus/Time requirements
    energy_required = Column(Integer, default=3)  # 1-5
    focus_required = Column(Integer, default=3)   # 1-5
    time_estimate_minutes = Column(Integer, default=30)
    
    # Scheduling
    due_date = Column(DateTime, nullable=True)
    
    # Status: active, completed, archived
    status = Column(String(50), default="active")
    
    # Organization
    category = Column(String(100), nullable=True)
    tags = Column(String(500), nullable=True)  # Comma-separated
    
    # Priority and algorithm factors
    importance_score = Column(Float, default=0.5)  # 0-1
    times_snoozed = Column(Integer, default=0)
    times_suggested = Column(Integer, default=0)
    last_suggested_at = Column(DateTime, nullable=True)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    completed_at = Column(DateTime, nullable=True)
    
    # External integrations (for future Canvas LMS)
    canvas_assignment_id = Column(String(255), nullable=True)
    
    # Relationships
    user = relationship("User", back_populates="tasks")
    activity_logs = relationship("ActivityLog", back_populates="task", cascade="all, delete-orphan")


class ActivityLog(Base):
    """Tracks user decisions for ML training data."""
    __tablename__ = "activity_log"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False)
    task_id = Column(String(36), ForeignKey("tasks.id"), nullable=True)
    
    # Action: accepted, snoozed, skipped, completed
    action = Column(String(50), nullable=False)
    
    # Context at time of decision
    user_energy = Column(Integer)
    user_focus = Column(Integer)
    time_available_minutes = Column(Integer)
    
    # Recommendation metadata
    recommendation_rank = Column(Integer, nullable=True)  # 1, 2, or 3
    recommendation_score = Column(Float, nullable=True)
    
    # Timing
    timestamp = Column(DateTime, default=datetime.utcnow)
    time_to_decision_seconds = Column(Integer, nullable=True)
    
    # Relationships
    user = relationship("User", back_populates="activity_logs")
    task = relationship("Task", back_populates="activity_logs")

