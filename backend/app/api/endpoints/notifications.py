from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from typing import Optional
from app.api.deps import get_current_user
from app.core.database import get_db

router = APIRouter()

class TokenRequest(BaseModel):
    token: str

@router.post("/token")
def register_token(request: TokenRequest, current_user: dict = Depends(get_current_user)):
    """
    Register an FCM token for the current user.
    """
    db = get_db()
    if not db:
        raise HTTPException(status_code=500, detail="Database connection not available")

    user_id = current_user.get("uid")
    if not user_id:
        raise HTTPException(status_code=401, detail="Invalid user")

    try:
        # Save token to user's profile in Firestore
        user_ref = db.collection("users").document(user_id)
        # We use merge=True to update or create if doesn't exist
        user_ref.set({"fcm_token": request.token}, merge=True)
        return {"status": "success", "message": "Token registered"}
    except Exception as e:
        print(f"Error saving token: {e}")
        raise HTTPException(status_code=500, detail="Failed to register token")
