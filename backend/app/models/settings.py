from pydantic import BaseModel, Field
from typing import List

class UserSettings(BaseModel):
    user_id: str
    daily_capacity: float = Field(default=8.0, description="Number of hours available per work day")
    working_days: List[int] = Field(default=[0, 1, 2, 3, 4], description="Days of the week (0=Mon, 6=Sun)")

class UserSettingsUpdate(BaseModel):
    daily_capacity: float = Field(..., ge=0, le=24)
    working_days: List[int]
