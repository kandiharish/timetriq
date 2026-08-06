from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from app.api.deps import get_current_user
from app.services.team_service import team_service
from app.models.team import (
    TeamCreate, TeamInDB, TeamMemberCreate, TeamMemberInDB, TeamWithMembers
)
from app.services.admin_service import admin_service

router = APIRouter()

def require_admin(current_user: dict = Depends(get_current_user)):
    user_db = admin_service.get_user(str(current_user.get("uid", "")))
    if not user_db or user_db.role != "Admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only Admins can perform this action",
        )
    return current_user

def require_manager_or_admin(current_user: dict = Depends(get_current_user)):
    user_db = admin_service.get_user(str(current_user.get("uid", "")))
    if not user_db or user_db.role not in ["Admin", "Manager"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only Admins or Managers can perform this action",
        )
    return current_user

@router.get("", response_model=List[TeamWithMembers])
def get_teams(current_user: dict = Depends(get_current_user)):
    """Retrieve all teams with their members. Filtered by role."""
    try:
        uid = str(current_user.get("uid", ""))
        user_db = admin_service.get_user(uid)
        role = user_db.role if user_db else "Employee"
        return team_service.get_all_teams(user_id=uid, user_role=role)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("", response_model=TeamInDB)
def create_team(team: TeamCreate, current_user: dict = Depends(require_admin)):
    """Create a new Team (Admins only)."""
    try:
        return team_service.create_team(team, created_by=current_user["uid"])
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/{team_id}/members", response_model=TeamMemberInDB)
def add_team_member(team_id: str, member: TeamMemberCreate, current_user: dict = Depends(require_manager_or_admin)):
    """Add a user to a Team (Admins & Managers only)."""
    if member.teamId != team_id:
        raise HTTPException(status_code=400, detail="Team ID mismatch")
    try:
        return team_service.add_member(member)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
