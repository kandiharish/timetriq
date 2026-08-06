from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime, timezone
from app.api.deps import get_current_user
from app.core.database import get_db
from app.models.notification import NotificationModel

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
        user_ref = db.collection("users").document(user_id)
        user_ref.set({"fcm_token": request.token}, merge=True)
        return {"status": "success", "message": "Token registered"}
    except Exception as e:
        print(f"Error saving token: {e}")
        raise HTTPException(status_code=500, detail="Failed to register token")

@router.get("/", response_model=List[NotificationModel])
def get_notifications(current_user: dict = Depends(get_current_user)):
    """
    Get all notifications for the current user.
    """
    db = get_db()
    if not db:
        raise HTTPException(status_code=500, detail="Database connection not available")

    user_id = current_user.get("uid")
    try:
        docs = db.collection("notifications").where("userId", "==", user_id).order_by("createdAt", direction="DESCENDING").limit(50).stream()
        results = []
        for doc in docs:
            data = doc.to_dict() or {}
            data['id'] = doc.id
            results.append(data)
        return results
    except Exception as e:
        print(f"Error fetching notifications: {e}")
        # Firestore composite index might be needed if order_by and where are combined.
        # Fallback to fetching and sorting manually if index is missing.
        try:
            docs = db.collection("notifications").where("userId", "==", user_id).stream()
            results = []
            for doc in docs:
                data = doc.to_dict() or {}
                data['id'] = doc.id
                results.append(data)
            results.sort(key=lambda x: x.get('createdAt', ''), reverse=True)
            return results[:50]
        except Exception as fallback_e:
            raise HTTPException(status_code=500, detail="Failed to fetch notifications")

@router.patch("/{notification_id}/read")
def mark_notification_read(notification_id: str, current_user: dict = Depends(get_current_user)):
    """
    Mark a notification as read.
    """
    db = get_db()
    if not db:
        raise HTTPException(status_code=500, detail="Database connection not available")
        
    try:
        doc_ref = db.collection("notifications").document(notification_id)
        doc = doc_ref.get()
        if not doc.exists:
            raise HTTPException(status_code=404, detail="Notification not found")
        if (doc.to_dict() or {}).get("userId") != current_user.get("uid"):
            raise HTTPException(status_code=403, detail="Not authorized")
            
        doc_ref.update({"isRead": True})
        return {"status": "success"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to update notification")
