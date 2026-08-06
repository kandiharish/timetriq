from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from app.api.deps import get_current_user
from app.services.workspace_service import workspace_service
from app.models.workspace import (
    SpaceCreate, SpaceInDB, FolderCreate, FolderInDB, 
    ListCreate, ListInDB, HierarchySpace
)
from app.services.admin_service import admin_service

router = APIRouter()

def require_manager_or_admin(current_user: dict = Depends(get_current_user)):
    user_db = admin_service.get_user(str(current_user.get("uid", "")))
    if not user_db or user_db.role not in ["Admin", "Manager"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only Admins or Managers can perform this action",
        )
    return current_user

@router.get("/hierarchy", response_model=List[HierarchySpace])
def get_workspace_hierarchy(current_user: dict = Depends(get_current_user)):
    """Retrieve the full workspace hierarchy (Spaces -> Folders -> Lists)."""
    try:
        user_db = admin_service.get_user(str(current_user.get("uid", "")))
        role = user_db.role if user_db else "Employee"
        return workspace_service.get_hierarchy(user_id=str(current_user.get("uid", "")), user_role=role)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/spaces", response_model=SpaceInDB)
def create_space(space: SpaceCreate, current_user: dict = Depends(require_manager_or_admin)):
    """Create a new Space (Admins & Managers only)."""
    try:
        return workspace_service.create_space(space)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/folders", response_model=FolderInDB)
def create_folder(folder: FolderCreate, current_user: dict = Depends(require_manager_or_admin)):
    """Create a new Folder within a Space (Admins & Managers only)."""
    try:
        return workspace_service.create_folder(folder)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/lists", response_model=ListInDB)
def create_list(list_data: ListCreate, current_user: dict = Depends(require_manager_or_admin)):
    """Create a new List within a Folder (Admins & Managers only)."""
    try:
        return workspace_service.create_list(list_data)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

from pydantic import BaseModel

class MembersUpdate(BaseModel):
    members: List[str]

@router.patch("/folders/{folder_id}/members")
def update_folder_members(folder_id: str, data: MembersUpdate, current_user: dict = Depends(require_manager_or_admin)):
    """Update members assigned to a folder (Admins & Managers only)."""
    try:
        return workspace_service.update_folder_members(folder_id, data.members)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
