from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime, timezone

class WorkspaceBase(BaseModel):
    name: str
    description: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class SpaceCreate(BaseModel):
    name: str
    description: Optional[str] = None

class SpaceInDB(WorkspaceBase):
    id: str

class FolderCreate(BaseModel):
    name: str
    description: Optional[str] = None
    space_id: str
    members: List[str] = []

class FolderInDB(WorkspaceBase):
    id: str
    space_id: str
    members: List[str] = []

class ListCreate(BaseModel):
    name: str
    description: Optional[str] = None
    folder_id: str

class ListInDB(WorkspaceBase):
    id: str
    folder_id: str
    space_id: str

# Hierarchy structures for UI
class HierarchyList(BaseModel):
    id: str
    name: str

class HierarchyFolder(BaseModel):
    id: str
    name: str
    lists: List[HierarchyList] = []

class HierarchySpace(BaseModel):
    id: str
    name: str
    folders: List[HierarchyFolder] = []
