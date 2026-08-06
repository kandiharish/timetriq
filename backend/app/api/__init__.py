# API Router Initialization
from fastapi import APIRouter
from app.api.endpoints import users, tasks, time_entries, dashboard, settings, calendar, notifications, admin, workspace, team

api_router = APIRouter()

# Include routes
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(tasks.router, prefix="/tasks", tags=["tasks"])
api_router.include_router(time_entries.router, prefix="/time-entries", tags=["time-entries"])
api_router.include_router(dashboard.router, prefix="/dashboard", tags=["dashboard"])
api_router.include_router(settings.router, prefix="/settings", tags=["settings"])
api_router.include_router(calendar.router, prefix="/calendar", tags=["calendar"])
api_router.include_router(notifications.router, prefix="/notifications", tags=["notifications"])
api_router.include_router(admin.router, prefix="/admin", tags=["admin"])
api_router.include_router(workspace.router, prefix="/workspace", tags=["workspace"])
api_router.include_router(team.router, prefix="/teams", tags=["teams"])



