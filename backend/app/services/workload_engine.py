from datetime import date, timedelta
from typing import Dict, Any, List
from app.services.task_service import get_tasks
from app.services.time_service import get_actual_hours_for_task
from app.services.settings_service import get_user_settings

def get_working_days(start_date: date, end_date: date, working_days: List[int]) -> int:
    """
    Calculate the number of working days between two dates based on user settings.
    working_days: list of integers (0=Monday, 6=Sunday)
    """
    if start_date > end_date:
        return 0
        
    days = 0
    current_date = start_date
    while current_date <= end_date:
        if current_date.weekday() in working_days:
            days += 1
        current_date += timedelta(days=1)
    return days

def calculate_dashboard_metrics(user_id: str) -> Dict[str, Any]:
    """
    Aggregate tasks and time entries to produce high-level dashboard metrics.
    Includes capacity calculation based on user's custom settings.
    """
    tasks = get_tasks(user_id)
    settings = get_user_settings(user_id)
    
    # Calculate Weekly Capacity
    today = date.today()
    start_of_week = today - timedelta(days=today.weekday())
    end_of_week = start_of_week + timedelta(days=6)
    days_in_week = get_working_days(start_of_week, end_of_week, settings.working_days)
    weekly_capacity = days_in_week * settings.daily_capacity
    
    active_tasks = 0
    completed_tasks = 0
    total_estimated_hours = 0.0
    total_actual_hours = 0.0
    over_budget_tasks = []

    for task in tasks:
        if task.status.lower() == 'completed':
            completed_tasks += 1
        else:
            active_tasks += 1
            
        actual_hours = get_actual_hours_for_task(user_id, task.id)
        
        total_estimated_hours += task.estimatedHours
        total_actual_hours += actual_hours
        
        variance = actual_hours - task.estimatedHours
        if variance > 0:
            over_budget_tasks.append({
                "task_id": task.id,
                "task_name": task.title,
                "variance": variance
            })
            
    variance_total = total_actual_hours - total_estimated_hours
            
    return {
        "active_tasks": active_tasks,
        "completed_tasks": completed_tasks,
        "total_estimated_hours": total_estimated_hours,
        "total_actual_hours": total_actual_hours,
        "weekly_capacity": weekly_capacity,
        "variance": variance_total,
        "over_budget_tasks": over_budget_tasks
    }

def calculate_daily_workload(user_id: str, start_date: date, end_date: date) -> List[Dict[str, Any]]:
    tasks = get_tasks(user_id)
    settings = get_user_settings(user_id)
    
    # Initialize days
    days = []
    current_date = start_date
    while current_date <= end_date:
        days.append({
            "date": current_date.isoformat(),
            "is_working_day": current_date.weekday() in settings.working_days,
            "capacity": settings.daily_capacity if current_date.weekday() in settings.working_days else 0,
            "scheduled_hours": 0.0,
            "tasks": [],
            "is_overloaded": False
        })
        current_date += timedelta(days=1)
        
    for task in tasks:
        # Ignore completed tasks for future workload capacity
        if task.status.lower() == 'completed':
            continue
            
        task_start = task.startDate
        task_end = task.dueDate
        
        # Calculate working days for this task
        task_working_days = get_working_days(task_start, task_end, settings.working_days)
        if task_working_days == 0:
            continue
            
        daily_hours_for_task = task.estimatedHours / task_working_days
        
        # Distribute hours across the requested date range
        for day in days:
            day_date = date.fromisoformat(day["date"])
            if task_start <= day_date <= task_end and day["is_working_day"]:
                day["scheduled_hours"] += daily_hours_for_task
                day["tasks"].append({
                    "task_id": task.id,
                    "task_name": task.title,
                    "hours": round(daily_hours_for_task, 2)
                })
                
    # Determine overload
    for day in days:
        day["scheduled_hours"] = round(day["scheduled_hours"], 2)
        if day["scheduled_hours"] > day["capacity"]:
            day["is_overloaded"] = True
            
    return days
