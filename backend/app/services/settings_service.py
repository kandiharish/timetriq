from app.core.firebase import db
from app.models.settings import UserSettings, UserSettingsUpdate

COLLECTION_NAME = "settings"

def get_user_settings(user_id: str) -> UserSettings:
    doc_ref = db.collection(COLLECTION_NAME).document(user_id)
    doc = doc_ref.get()
    
    if doc.exists:
        data = doc.to_dict()
        data["user_id"] = user_id
        return UserSettings(**data)
    
    # Return default settings if none exist
    return UserSettings(user_id=user_id)

def update_user_settings(user_id: str, settings_update: UserSettingsUpdate) -> UserSettings:
    doc_ref = db.collection(COLLECTION_NAME).document(user_id)
    
    update_data = {
        "daily_capacity": settings_update.daily_capacity,
        "working_days": settings_update.working_days
    }
    
    doc_ref.set(update_data, merge=True)
    
    return get_user_settings(user_id)
