from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from app.api.deps import get_current_admin_user
from app.services.admin_service import admin_service
from app.models.organization import OrganizationSettings, AuditLog
from app.models.user import UserInDB, UserUpdate

router = APIRouter()

@router.get("/organization-settings", response_model=OrganizationSettings)
def get_org_settings(current_admin: dict = Depends(get_current_admin_user)):
    """Retrieve organization settings."""
    try:
        return admin_service.get_organization_settings()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/organization-settings", response_model=OrganizationSettings)
def update_org_settings(settings: OrganizationSettings, current_admin: dict = Depends(get_current_admin_user)):
    """Update organization settings."""
    try:
        return admin_service.update_organization_settings(settings, str(current_admin.get("uid", "")))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/users", response_model=List[UserInDB])
def get_all_users(current_admin: dict = Depends(get_current_admin_user)):
    """Retrieve all users in the organization."""
    try:
        return admin_service.get_all_users()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/users/{uid}", response_model=UserInDB)
def update_user_role(uid: str, user_update: UserUpdate, current_admin: dict = Depends(get_current_admin_user)):
    """Update a user's role or details."""
    try:
        return admin_service.update_user(uid, user_update, str(current_admin.get("uid", "")))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/audit-logs", response_model=List[AuditLog])
def get_audit_logs(limit: int = 100, current_admin: dict = Depends(get_current_admin_user)):
    """Retrieve audit logs."""
    try:
        return admin_service.get_audit_logs(limit)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/timesheets/nag")
def nag_timesheets(current_admin: dict = Depends(get_current_admin_user)):
    """Trigger automated nagging for missing timesheets today."""
    try:
        from google.cloud.firestore import Client
        import app.core.firebase as firebase
        from datetime import datetime, timezone, timedelta
        import uuid

        if not firebase.db:
            firebase.init_firebase()
        db = firebase.db

        # 1. Get all employees
        users = db.collection("users").where("role", "in", ["Employee", "employee"]).stream()
        user_ids = [u.id for u in users]
        
        # 2. Get today's time entries
        today = datetime.now(timezone.utc).replace(hour=0, minute=0, second=0, microsecond=0)
        tomorrow = today + timedelta(days=1)
        
        entries = db.collection("time_entries").where("date", ">=", today).where("date", "<", tomorrow).stream()
        
        # 3. Calculate hours per user
        user_hours = {uid: 0 for uid in user_ids}
        for entry in entries:
            data = entry.to_dict()
            uid = data.get("userId")
            if uid in user_hours:
                user_hours[uid] += data.get("duration", 0) / 3600  # assuming duration in seconds
                
        # 4. Create notifications for those < 8 hours
        nagged_count = 0
        batch = db.batch()
        for uid, hours in user_hours.items():
            if hours < 8:
                notif_id = str(uuid.uuid4())
                notif_ref = db.collection("notifications").document(notif_id)
                batch.set(notif_ref, {
                    "id": notif_id,
                    "userId": uid,
                    "title": "Missing Timesheet",
                    "message": f"You have only logged {hours:.1f} hours today. Please complete your timesheet.",
                    "type": "warning",
                    "read": False,
                    "createdAt": datetime.now(timezone.utc)
                })
                nagged_count += 1
                
        batch.commit()
        return {"status": "success", "nagged_users_count": nagged_count}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
