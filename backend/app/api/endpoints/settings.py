from fastapi import APIRouter, Depends
from app.api.deps import get_current_user
from app.models.settings import UserSettings, UserSettingsUpdate
from app.services import settings_service

router = APIRouter()

@router.get("/", response_model=UserSettings)
def get_settings(current_user: dict = Depends(get_current_user)):
    user_id = current_user["uid"]
    return settings_service.get_user_settings(user_id)

@router.put("/", response_model=UserSettings)
def update_settings(
    settings_in: UserSettingsUpdate,
    current_user: dict = Depends(get_current_user)
):
    user_id = current_user["uid"]
    return settings_service.update_user_settings(user_id, settings_in)
