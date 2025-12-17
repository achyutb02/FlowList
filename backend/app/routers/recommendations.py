from fastapi import APIRouter, Depends, Query, Body
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import User, Task
from app.schemas import RecommendationsResponse, ContextResponse, RecommendationRequest
from app.auth import get_current_user
from app.services.algorithm import RecommendationAlgorithm

router = APIRouter(prefix="/recommendations", tags=["Recommendations"])


@router.post("", response_model=RecommendationsResponse)
def get_recommendations(
    request: RecommendationRequest = Body(...),
    limit: int = Query(default=3, ge=1, le=10),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get task recommendations based on explicit energy and time constraints.
    
    This replaces the previous GET endpoint to allow specific context inputs
    without updating the user's persisted profile immediately if desired.
    """
    # Get user's active tasks
    tasks = db.query(Task).filter(
        Task.user_id == current_user.id,
        Task.status == "active"
    ).all()
    
    # Run the algorithm with overrides
    algorithm = RecommendationAlgorithm(
        current_user, 
        energy_override=request.user_energy,
        time_override=request.time_available_minutes
    )
    recommendations = algorithm.get_recommendations(tasks, limit=limit)
    
    # Commit any task updates (suggestion tracking)
    db.commit()
    
    return RecommendationsResponse(
        recommendations=recommendations,
        context=ContextResponse(
            energy=request.user_energy,
            focus=current_user.current_focus,
            time_available_minutes=request.time_available_minutes
        )
    )
