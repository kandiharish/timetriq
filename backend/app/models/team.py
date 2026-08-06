from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime, timezone

class TeamCreate(BaseModel):
    name: str
    description: Optional[str] = None
    managerId: str
    color: Optional[str] = None
    icon: Optional[str] = None
    assignedSpaces: List[str] = []

class TeamInDB(TeamCreate):
    id: str
    createdBy: str
    createdAt: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updatedAt: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class TeamMemberCreate(BaseModel):
    userId: str
    teamId: str
    designation: Optional[str] = None

class TeamMemberInDB(TeamMemberCreate):
    id: str
    joinedAt: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class ProjectMemberCreate(BaseModel):
    userId: str
    projectId: str  # Maps to Space/Folder ID depending on business logic
    role: str = "Member"

class ProjectMemberInDB(ProjectMemberCreate):
    id: str
    assignedBy: str
    assignedAt: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

# Nested responses for UI
class MemberProfile(BaseModel):
    userId: str
    name: str
    email: str
    role: str
    designation: Optional[str] = None

class TeamWithMembers(TeamInDB):
    members: List[MemberProfile] = []
