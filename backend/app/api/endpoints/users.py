from fastapi import APIRouter, Depends
from typing import List
from app.api.deps import get_current_user
from app.models.user import UserResponse, UserInDB
from app.services.admin_service import admin_service

router = APIRouter()

@router.get("/", response_model=List[UserInDB])
def get_all_users(current_user: dict = Depends(get_current_user)):
    """Retrieve all users in the organization (directory)."""
    return admin_service.get_all_users()

@router.get("/me")
def read_users_me(current_user: dict = Depends(get_current_user)):
    """
    Get current user details based on the provided Firebase token.
    """
    # In a real implementation, we would fetch the user from Firestore here
    # using the `current_user['uid']`. For now, we return the token payload.
    return {
        "uid": current_user.get("uid"),
        "email": current_user.get("email"),
        "display_name": current_user.get("name"),
    }
