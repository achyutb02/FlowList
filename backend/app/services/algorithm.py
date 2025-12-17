from datetime import datetime, timedelta
from typing import List, Tuple
from app.models import Task, User
from app.schemas import TaskRecommendation, RecommendationReason, TaskResponse


class RecommendationAlgorithm:
    """
    FlowList recommendation algorithm that scores tasks based on:
    - Context Match (40%): How well the task fits current energy/focus
    - Urgency (30%): Time pressure from deadlines
    - Importance (20%): User-defined priority
    - Freshness (10%): Avoid over-suggesting same tasks
    
    Special rules:
    - Burnout Protection: 70% penalty when user_energy <= 2 and task_energy >= 4
    - Peak Capture: 20% bonus when user_energy >= 4 and task_energy >= 4
    - Time Constraint: 80% penalty for tasks that won't fit available time
    """
    
    # Scoring weights
    WEIGHT_CONTEXT = 0.40
    WEIGHT_URGENCY = 0.30
    WEIGHT_IMPORTANCE = 0.20
    WEIGHT_FRESHNESS = 0.10
    
    # Special rule modifiers
    BURNOUT_PENALTY = 0.30  # Multiply by 0.30 (70% penalty)
    PEAK_BONUS = 1.20      # Multiply by 1.20 (20% bonus)
    TIME_PENALTY = 0.20    # Multiply by 0.20 (80% penalty)
    
    def __init__(self, user: User, energy_override: int = None, time_override: int = None):
        self.user = user
        self.user_energy = energy_override if energy_override is not None else user.current_energy
        self.user_focus = user.current_focus
        self.time_available = time_override if time_override is not None else user.time_available_minutes

    
    def calculate_context_score(self, task: Task) -> Tuple[float, List[RecommendationReason]]:
        """
        Calculate how well the task matches current user context.
        Returns a score between 0 and 1.
        """
        reasons = []
        
        # Energy alignment (0-1)
        energy_diff = abs(task.energy_required - self.user_energy)
        energy_score = 1.0 - (energy_diff / 4.0)  # Max diff is 4
        
        # Focus alignment (0-1)
        focus_diff = abs(task.focus_required - self.user_focus)
        focus_score = 1.0 - (focus_diff / 4.0)
        
        # Combine energy and focus scores
        context_score = (energy_score * 0.6 + focus_score * 0.4)
        
        if energy_score >= 0.75:
            reasons.append(RecommendationReason(
                factor="Energy Match",
                description=f"Your energy ({self.user_energy}) matches well with this task's needs ({task.energy_required})",
                score_contribution=energy_score * 0.6 * self.WEIGHT_CONTEXT
            ))
        elif energy_score < 0.5:
            reasons.append(RecommendationReason(
                factor="Energy Mismatch",
                description=f"This task needs energy level {task.energy_required}, but you're at {self.user_energy}",
                score_contribution=energy_score * 0.6 * self.WEIGHT_CONTEXT
            ))
        
        if focus_score >= 0.75:
            reasons.append(RecommendationReason(
                factor="Focus Match",
                description=f"Your focus ({self.user_focus}) aligns with task requirements ({task.focus_required})",
                score_contribution=focus_score * 0.4 * self.WEIGHT_CONTEXT
            ))
        
        return context_score, reasons
    
    def calculate_urgency_score(self, task: Task) -> Tuple[float, List[RecommendationReason]]:
        """
        Calculate urgency based on due date.
        Returns a score between 0 and 1.
        """
        reasons = []
        
        if not task.due_date:
            # No deadline = low urgency
            return 0.20, [RecommendationReason(
                factor="No Deadline",
                description="This task has no due date - lower urgency",
                score_contribution=0.20 * self.WEIGHT_URGENCY
            )]
        
        now = datetime.utcnow()
        time_until_due = task.due_date - now
        hours_until_due = time_until_due.total_seconds() / 3600
        
        if hours_until_due <= 0:
            # Overdue
            urgency_score = 1.0
            reasons.append(RecommendationReason(
                factor="Overdue",
                description="This task is past its deadline!",
                score_contribution=self.WEIGHT_URGENCY
            ))
        elif hours_until_due <= 2:
            urgency_score = 0.95
            reasons.append(RecommendationReason(
                factor="Due Very Soon",
                description="Due in less than 2 hours",
                score_contribution=0.95 * self.WEIGHT_URGENCY
            ))
        elif hours_until_due <= 24:
            urgency_score = 0.80
            reasons.append(RecommendationReason(
                factor="Due Today",
                description="Due within 24 hours",
                score_contribution=0.80 * self.WEIGHT_URGENCY
            ))
        elif hours_until_due <= 48:
            urgency_score = 0.60
            reasons.append(RecommendationReason(
                factor="Due Tomorrow",
                description="Due within 48 hours",
                score_contribution=0.60 * self.WEIGHT_URGENCY
            ))
        elif hours_until_due <= 168:  # 1 week
            urgency_score = 0.40
            reasons.append(RecommendationReason(
                factor="Due This Week",
                description="Due within a week",
                score_contribution=0.40 * self.WEIGHT_URGENCY
            ))
        else:
            urgency_score = 0.20
            reasons.append(RecommendationReason(
                factor="Not Urgent",
                description="Due more than a week from now",
                score_contribution=0.20 * self.WEIGHT_URGENCY
            ))
        
        return urgency_score, reasons
    
    def calculate_importance_score(self, task: Task) -> Tuple[float, List[RecommendationReason]]:
        """
        Use the user-defined importance score.
        Returns a score between 0 and 1.
        """
        reasons = []
        importance = task.importance_score
        
        if importance >= 0.8:
            reasons.append(RecommendationReason(
                factor="High Priority",
                description="You marked this as high importance",
                score_contribution=importance * self.WEIGHT_IMPORTANCE
            ))
        elif importance <= 0.3:
            reasons.append(RecommendationReason(
                factor="Low Priority",
                description="Lower priority task",
                score_contribution=importance * self.WEIGHT_IMPORTANCE
            ))
        
        return importance, reasons
    
    def calculate_freshness_score(self, task: Task) -> Tuple[float, List[RecommendationReason]]:
        """
        Penalize tasks that have been suggested/snoozed many times.
        Returns a score between 0 and 1.
        """
        reasons = []
        
        # Snooze penalty
        snooze_penalty = min(task.times_snoozed * 0.1, 0.5)  # Max 50% penalty
        
        # Recent suggestion penalty
        suggestion_penalty = 0
        if task.last_suggested_at:
            minutes_since_suggested = (datetime.utcnow() - task.last_suggested_at).total_seconds() / 60
            if minutes_since_suggested < 30:
                suggestion_penalty = 0.3
        
        freshness_score = max(0, 1.0 - snooze_penalty - suggestion_penalty)
        
        if task.times_snoozed > 0:
            reasons.append(RecommendationReason(
                factor="Previously Snoozed",
                description=f"Snoozed {task.times_snoozed} time(s)",
                score_contribution=-snooze_penalty * self.WEIGHT_FRESHNESS
            ))
        
        return freshness_score, reasons
    
    def apply_special_rules(self, task: Task, base_score: float) -> Tuple[float, List[RecommendationReason]]:
        """Apply special rules that modify the final score."""
        reasons = []
        final_score = base_score
        
        # Burnout Protection (STRICT): Filter out high energy tasks entirely when user energy is low
        if self.user_energy <= 2 and task.energy_required >= 4:
            # Return 0 score to filter it out effectively (or handle in get_recommendations)
            final_score = 0.0
            reasons.append(RecommendationReason(
                factor="Burnout Protection",
                description="Task requires too much energy for your current state",
                score_contribution=-10.0
            ))
            return final_score, reasons
        
        # Time Constraint (STRICT): Filter out tasks that don't fit
        if task.time_estimate_minutes > self.time_available:
            final_score = 0.0
            reasons.append(RecommendationReason(
                factor="Time Constraint",
                description=f"Not enough time ({task.time_estimate_minutes}m needed, {self.time_available}m available)",
                score_contribution=-10.0
            ))
            return final_score, reasons
            
        # Peak Capture: High energy user + high energy task
        if self.user_energy >= 4 and task.energy_required >= 4:
            final_score *= self.PEAK_BONUS
            reasons.append(RecommendationReason(
                factor="Peak Energy Match",
                description="You're at peak energy - great time for this challenging task!",
                score_contribution=base_score * (self.PEAK_BONUS - 1)
            ))
        
        return final_score, reasons
    
    def score_task(self, task: Task) -> Tuple[float, List[RecommendationReason]]:
        """Calculate the complete score for a task."""
        all_reasons = []
        
        # Calculate component scores
        context_score, context_reasons = self.calculate_context_score(task)
        urgency_score, urgency_reasons = self.calculate_urgency_score(task)
        importance_score, importance_reasons = self.calculate_importance_score(task)
        freshness_score, freshness_reasons = self.calculate_freshness_score(task)
        
        all_reasons.extend(context_reasons)
        all_reasons.extend(urgency_reasons)
        all_reasons.extend(importance_reasons)
        all_reasons.extend(freshness_reasons)
        
        # Calculate weighted base score
        base_score = (
            context_score * self.WEIGHT_CONTEXT +
            urgency_score * self.WEIGHT_URGENCY +
            importance_score * self.WEIGHT_IMPORTANCE +
            freshness_score * self.WEIGHT_FRESHNESS
        )
        
        # Apply special rules
        final_score, special_reasons = self.apply_special_rules(task, base_score)
        all_reasons.extend(special_reasons)
        
        return final_score, all_reasons
    
    def get_recommendations(self, tasks: List[Task], limit: int = 3) -> List[TaskRecommendation]:
        """
        Get the top N task recommendations based on current context.
        """
        scored_tasks = []
        
        for task in tasks:
            if task.status != "active":
                continue
            
            score, reasons = self.score_task(task)
            
            # Filter out zero-score tasks (hard constraints)
            if score <= 0.01:
                continue
                
            scored_tasks.append((task, score, reasons))
        
        # Sort by score descending
        scored_tasks.sort(key=lambda x: x[1], reverse=True)
        
        # Build recommendations
        recommendations = []
        for rank, (task, score, reasons) in enumerate(scored_tasks[:limit], start=1):
            # Update task's suggestion tracking
            task.times_suggested += 1
            task.last_suggested_at = datetime.utcnow()
            
            # Filter to top 3 most impactful reasons
            sorted_reasons = sorted(reasons, key=lambda r: abs(r.score_contribution), reverse=True)[:3]
            
            recommendations.append(TaskRecommendation(
                task=TaskResponse.model_validate(task),
                score=round(score, 3),
                rank=rank,
                reasons=sorted_reasons
            ))
        
        return recommendations

