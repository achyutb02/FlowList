from typing import List, Optional
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import User, Task, ActivityLog
from app.schemas import (
    TaskCreate,
    TaskUpdate,
    TaskResponse,
    ContextUpdate,
    ContextResponse,
    ActivityLogResponse,
)
from app.auth import get_current_user

router = APIRouter(prefix="/tasks", tags=["Tasks"])


@router.get("", response_model=List[TaskResponse])
def get_tasks(
    status_filter: Optional[str] = Query(None, alias="status"),
    category: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all tasks for the current user."""
    query = db.query(Task).filter(Task.user_id == current_user.id)
    
    if status_filter:
        query = query.filter(Task.status == status_filter)
    if category:
        query = query.filter(Task.category == category)
    
    tasks = query.order_by(Task.created_at.desc()).all()
    return tasks


@router.post("", response_model=TaskResponse, status_code=status.HTTP_201_CREATED)
def create_task(
    task_data: TaskCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new task."""
    new_task = Task(
        user_id=current_user.id,
        title=task_data.title,
        description=task_data.description,
        energy_required=task_data.energy_required,
        focus_required=task_data.focus_required,
        time_estimate_minutes=task_data.time_estimate_minutes,
        due_date=task_data.due_date,
        category=task_data.category,
        tags=task_data.tags,
        importance_score=task_data.importance_score
    )
    
    db.add(new_task)
    db.commit()
    db.refresh(new_task)
    
    return new_task


@router.get("/{task_id}", response_model=TaskResponse)
def get_task(
    task_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get a specific task by ID."""
    task = db.query(Task).filter(
        Task.id == task_id,
        Task.user_id == current_user.id
    ).first()
    
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )
    
    return task


@router.put("/{task_id}", response_model=TaskResponse)
def update_task(
    task_id: str,
    task_data: TaskUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update a task."""
    task = db.query(Task).filter(
        Task.id == task_id,
        Task.user_id == current_user.id
    ).first()
    
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )
    
    # Update only provided fields
    update_data = task_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(task, field, value)
    
    db.commit()
    db.refresh(task)
    
    return task


@router.delete("/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_task(
    task_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete a task."""
    task = db.query(Task).filter(
        Task.id == task_id,
        Task.user_id == current_user.id
    ).first()
    
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )
    
    db.delete(task)
    db.commit()


@router.post("/{task_id}/accept", response_model=ActivityLogResponse)
def accept_task(
    task_id: str,
    recommendation_rank: Optional[int] = None,
    recommendation_score: Optional[float] = None,
    time_to_decision_seconds: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Accept a task recommendation."""
    task = db.query(Task).filter(
        Task.id == task_id,
        Task.user_id == current_user.id
    ).first()
    
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )
    
    # Log the activity
    activity_log = ActivityLog(
        user_id=current_user.id,
        task_id=task_id,
        action="accepted",
        user_energy=current_user.current_energy,
        user_focus=current_user.current_focus,
        time_available_minutes=current_user.time_available_minutes,
        recommendation_rank=recommendation_rank,
        recommendation_score=recommendation_score,
        time_to_decision_seconds=time_to_decision_seconds
    )
    
    db.add(activity_log)
    db.commit()
    db.refresh(activity_log)
    
    return activity_log


@router.post("/{task_id}/snooze", response_model=ActivityLogResponse)
def snooze_task(
    task_id: str,
    recommendation_rank: Optional[int] = None,
    recommendation_score: Optional[float] = None,
    time_to_decision_seconds: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Snooze a task recommendation."""
    task = db.query(Task).filter(
        Task.id == task_id,
        Task.user_id == current_user.id
    ).first()
    
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )
    
    # Increment snooze count
    task.times_snoozed += 1
    
    # Log the activity
    activity_log = ActivityLog(
        user_id=current_user.id,
        task_id=task_id,
        action="snoozed",
        user_energy=current_user.current_energy,
        user_focus=current_user.current_focus,
        time_available_minutes=current_user.time_available_minutes,
        recommendation_rank=recommendation_rank,
        recommendation_score=recommendation_score,
        time_to_decision_seconds=time_to_decision_seconds
    )
    
    db.add(activity_log)
    db.commit()
    db.refresh(activity_log)
    
    return activity_log


@router.post("/{task_id}/complete", response_model=TaskResponse)
def complete_task(
    task_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Mark a task as completed."""
    task = db.query(Task).filter(
        Task.id == task_id,
        Task.user_id == current_user.id
    ).first()
    
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )
    
    task.status = "completed"
    task.completed_at = datetime.utcnow()
    
    # Log the completion
    activity_log = ActivityLog(
        user_id=current_user.id,
        task_id=task_id,
        action="completed",
        user_energy=current_user.current_energy,
        user_focus=current_user.current_focus,
        time_available_minutes=current_user.time_available_minutes
    )
    
    db.add(activity_log)
    db.commit()
    db.refresh(task)
    
    return task


# Context endpoints
@router.post("/context", response_model=ContextResponse, tags=["Context"])
def update_context(
    context: ContextUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update the user's current context (energy, focus, time available)."""
    current_user.current_energy = context.energy
    current_user.current_focus = context.focus
    current_user.time_available_minutes = context.time_available_minutes
    
    db.commit()
    
    return ContextResponse(
        energy=current_user.current_energy,
        focus=current_user.current_focus,
        time_available_minutes=current_user.time_available_minutes
    )


@router.get("/context/current", response_model=ContextResponse, tags=["Context"])
def get_context(current_user: User = Depends(get_current_user)):
    """Get the user's current context."""
    return ContextResponse(
        energy=current_user.current_energy,
        focus=current_user.current_focus,
        time_available_minutes=current_user.time_available_minutes
    )

