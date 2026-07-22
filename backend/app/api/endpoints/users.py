from fastapi import APIRouter, Depends
from app.api.deps import get_current_user
from app.models.user import UserResponse

router = APIRouter()

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
