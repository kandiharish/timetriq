from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime, timezone

class UserBase(BaseModel):
    email: str
    display_name: Optional[str] = None
    photo_url: Optional[str] = None

class UserCreate(UserBase):
    uid: str

class UserInDB(UserBase):
    uid: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    is_archived: bool = False
    role: str = "Employee"
    team_id: Optional[str] = None

class UserUpdate(BaseModel):
    display_name: Optional[str] = None
    photo_url: Optional[str] = None
    role: Optional[str] = None
    team_id: Optional[str] = None
    is_archived: Optional[bool] = None

class UserResponse(UserInDB):
    pass
