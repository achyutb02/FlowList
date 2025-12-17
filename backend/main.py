from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Optional
from uuid import uuid4

# Initialize FastAPI app
app = FastAPI(
    title="FlowList API",
    description="AI-powered task recommendations based on energy matching",
    version="1.0.0",
)

# Configure CORS for mobile app
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ============== Data Models ==============

class TaskCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=500)
    energy_required: int = Field(..., ge=1, le=5)
    time_estimate_minutes: int = Field(..., ge=5)

class Task(BaseModel):
    id: str
    title: str
    energy_required: int
    time_estimate_minutes: int

class RecommendationRequest(BaseModel):
    user_energy: int = Field(..., ge=1, le=5)
    available_time_minutes: int = Field(..., ge=5)

class TaskRecommendation(BaseModel):
    task: Task
    match_score: int
    reason: str

# ============== In-Memory Storage ==============

tasks: List[Task] = []

# ============== Endpoints ==============

@app.get("/", tags=["Health"])
def health_check():
    """Health check endpoint."""
    return {
        "status": "healthy",
        "message": "FlowList Brain is Online",
        "total_tasks": len(tasks)
    }


@app.post("/tasks", response_model=Task, tags=["Tasks"])
def create_task(task_data: TaskCreate):
    """Add a new task to the list."""
    new_task = Task(
        id=str(uuid4()),
        title=task_data.title,
        energy_required=task_data.energy_required,
        time_estimate_minutes=task_data.time_estimate_minutes
    )
    tasks.append(new_task)
    return new_task


@app.get("/tasks", response_model=List[Task], tags=["Tasks"])
def get_tasks():
    """Get all tasks."""
    return tasks


@app.delete("/tasks/{task_id}", tags=["Tasks"])
def delete_task(task_id: str):
    """Delete a task by ID."""
    global tasks
    original_length = len(tasks)
    tasks = [t for t in tasks if t.id != task_id]
    if len(tasks) == original_length:
        raise HTTPException(status_code=404, detail="Task not found")
    return {"message": "Task deleted"}


@app.post("/recommendations", response_model=List[TaskRecommendation], tags=["Recommendations"])
def get_recommendations(request: RecommendationRequest):
    """
    Get task recommendations based on user's current energy and available time.
    
    Logic:
    1. Filter out tasks that take longer than available time
    2. If user energy is low (<=2), filter out high-energy tasks (>=4) - Burnout Protection
    3. Calculate match score: abs(task.energy_required - user_energy)
    4. Sort by match score (lower is better - closer energy match)
    """
    user_energy = request.user_energy
    available_time = request.available_time_minutes
    
    recommendations = []
    
    for task in tasks:
        # Filter 1: Time constraint
        if task.time_estimate_minutes > available_time:
            continue
        
        # Filter 2: Burnout protection - low energy user shouldn't get high-energy tasks
        if user_energy <= 2 and task.energy_required >= 4:
            continue
        
        # Calculate match score (lower is better)
        match_score = abs(task.energy_required - user_energy)
        
        # Generate reason
        if match_score == 0:
            reason = f"Perfect energy match! Task needs {task.energy_required}, you have {user_energy}"
        elif match_score == 1:
            reason = f"Great fit - energy levels are close"
        elif task.energy_required < user_energy:
            reason = f"Easy task for your current energy level"
        else:
            reason = f"Slightly challenging but doable"
        
        recommendations.append(TaskRecommendation(
            task=task,
            match_score=match_score,
            reason=reason
        ))
    
    # Sort by match score (best matches first)
    recommendations.sort(key=lambda r: r.match_score)
    
    return recommendations


# Seed some sample tasks for testing
@app.on_event("startup")
def seed_sample_tasks():
    """Add sample tasks on startup for testing."""
    sample_tasks = [
        TaskCreate(title="Reply to emails", energy_required=1, time_estimate_minutes=15),
        TaskCreate(title="Read chapter 4", energy_required=2, time_estimate_minutes=30),
        TaskCreate(title="Write essay outline", energy_required=4, time_estimate_minutes=45),
        TaskCreate(title="Deep focus coding session", energy_required=5, time_estimate_minutes=60),
        TaskCreate(title="Quick brainstorm", energy_required=3, time_estimate_minutes=15),
        TaskCreate(title="Review notes", energy_required=2, time_estimate_minutes=20),
    ]
    for task_data in sample_tasks:
        create_task(task_data)
