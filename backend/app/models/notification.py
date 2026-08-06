from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class NotificationBase(BaseModel):
    userId: str
    title: str
    message: str
    type: str  # e.g., TaskAssigned, StatusUpdated, PriorityChanged
    entityType: str  # e.g., Task, Project, User
    entityId: str
    triggeredBy: str
    isRead: bool = False

class NotificationCreate(NotificationBase):
    pass

class NotificationUpdate(BaseModel):
    isRead: Optional[bool] = None

class NotificationModel(NotificationBase):
    id: str
    createdAt: datetime
