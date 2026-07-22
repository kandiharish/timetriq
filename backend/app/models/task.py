from pydantic import BaseModel, Field, field_validator
from typing import Optional
from datetime import date, datetime, timezone

class TaskBase(BaseModel):
    title: str = Field(..., description="The name of the task")
    description: Optional[str] = None
    projectId: str = Field(..., description="Project ID this task belongs to")
    assignedUserId: str = Field(..., description="User ID assigned to this task")
    estimatedHours: float = Field(..., description="Estimated effort in hours. Must be positive.")
    startDate: date = Field(..., description="Start date")
    dueDate: date = Field(..., description="Expected completion date")
    status: str = Field(default="Todo", description="Current status of the task")
    priority: str = Field(default="Medium", description="Importance of the task")
    completedDate: Optional[date] = None
    actualHours: float = Field(default=0.0, description="Total logged time for this task")
    order: int = Field(default=0, description="Order of the task for drag and drop")

    @field_validator('estimatedHours')
    def hours_must_be_positive(cls, v):
        if v <= 0:
            raise ValueError('estimatedHours must be greater than zero')
        return v

    @field_validator('dueDate')
    def due_date_must_be_after_start_date(cls, v, info):
        if 'startDate' in info.data and v < info.data['startDate']:
            raise ValueError('dueDate must be greater than or equal to startDate')
        return v
        
    @field_validator('status')
    def validate_status(cls, v):
        allowed = ['Todo', 'In Progress', 'Review', 'Completed', 'Blocked']
        if v not in allowed:
            raise ValueError(f'Status must be one of {allowed}')
        return v
        
    @field_validator('priority')
    def validate_priority(cls, v):
        allowed = ['Low', 'Medium', 'High', 'Critical']
        if v not in allowed:
            raise ValueError(f'Priority must be one of {allowed}')
        return v

class TaskCreate(TaskBase):
    pass

class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    projectId: Optional[str] = None
    assignedUserId: Optional[str] = None
    estimatedHours: Optional[float] = None
    startDate: Optional[date] = None
    dueDate: Optional[date] = None
    status: Optional[str] = None
    priority: Optional[str] = None
    completedDate: Optional[date] = None
    actualHours: Optional[float] = None
    order: Optional[int] = None

class TaskInDB(TaskBase):
    id: str
    userId: str
    createdAt: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updatedAt: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    isArchived: bool = False

class TaskResponse(TaskInDB):
    pass
