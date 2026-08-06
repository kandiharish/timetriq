from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime, timezone


class WorkspaceSettings(BaseModel):
    name: str = "My Workspace"
    timezone: str = "UTC"
    date_format: str = "YYYY-MM-DD"
    time_format: str = "24h"


class NotificationPreferences(BaseModel):
    email_notifications: bool = True
    push_notifications: bool = True
    task_reminders: bool = True
    weekly_summary: bool = True


class SecurityPolicies(BaseModel):
    require_mfa: bool = False
    session_timeout_minutes: int = 480
    allowed_domains: List[str] = Field(default_factory=list)


class SystemPreferences(BaseModel):
    default_language: str = "en"
    theme: str = "light"
    auto_track_idle: bool = False


class RoleConfig(BaseModel):
    role: str
    permissions: List[str] = Field(default_factory=list)


class AuditLog(BaseModel):
    id: str
    action: str
    performed_by: str
    affected_resource: str
    old_value: Optional[Dict[str, Any]] = None
    new_value: Optional[Dict[str, Any]] = None
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class OrganizationSettings(BaseModel):
    name: str = "My Organization"
    workspace: WorkspaceSettings = Field(default_factory=WorkspaceSettings)
    notifications: NotificationPreferences = Field(default_factory=NotificationPreferences)
    security: SecurityPolicies = Field(default_factory=SecurityPolicies)
    system: SystemPreferences = Field(default_factory=SystemPreferences)
    roles: List[RoleConfig] = Field(default_factory=list)
