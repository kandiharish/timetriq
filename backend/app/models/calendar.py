from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime, timezone

class CalendarEventBase(BaseModel):
    title: str
    description: Optional[str] = None
    type: str = Field(..., description="Task, Personal, Team")
    task_id: Optional[str] = None
    project_id: Optional[str] = None
    team_id: Optional[str] = None
    created_by: str
    participants: List[str] = []
    start_date: str = Field(..., description="ISO format date string")
    end_date: str = Field(..., description="ISO format date string")
    all_day: bool = False
    color: Optional[str] = None
    location: Optional[str] = None
    notes: Optional[str] = None

class CalendarEventCreate(CalendarEventBase):
    pass

class CalendarEventUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    type: Optional[str] = None
    task_id: Optional[str] = None
    project_id: Optional[str] = None
    team_id: Optional[str] = None
    participants: Optional[List[str]] = None
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    all_day: Optional[bool] = None
    color: Optional[str] = None
    location: Optional[str] = None
    notes: Optional[str] = None

class CalendarEventInDB(CalendarEventBase):
    id: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

