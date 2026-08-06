from pydantic import BaseModel, Field, field_validator
from datetime import date, datetime, timezone
from typing import Optional

class TimeEntryBase(BaseModel):
    task_id: str
    date: date
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None
    hours_worked: float
    notes: Optional[str] = None
    tags: Optional[str] = None

    @field_validator('hours_worked')
    def validate_hours(cls, v):
        if v <= 0:
            raise ValueError('Hours worked must be greater than zero')
        if v > 24:
            raise ValueError('Hours worked cannot exceed 24 hours per entry')
        return v

class TimeEntryCreate(TimeEntryBase):
    pass

class TimeEntryUpdate(BaseModel):
    date: Optional[date] = None
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None
    hours_worked: Optional[float] = None
    notes: Optional[str] = None
    tags: Optional[str] = None

class TimeEntryInDB(TimeEntryBase):
    id: str
    owner_id: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class TimeEntryResponse(TimeEntryInDB):
    pass
