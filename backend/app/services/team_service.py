import uuid
from typing import List, Optional
from google.cloud.firestore import Client
import app.core.firebase as firebase
from app.models.team import (
    TeamCreate, TeamInDB, TeamMemberCreate, TeamMemberInDB, 
    TeamWithMembers, MemberProfile
)

def _get_db() -> Client:
    if not firebase.db:
        firebase.init_firebase()
    assert firebase.db is not None, "Firestore client not initialized"
    return firebase.db

class TeamService:
    def create_team(self, team: TeamCreate, created_by: str) -> TeamInDB:
        db = _get_db()
        team_id = str(uuid.uuid4())
        
        # Verify manager exists
        manager_doc = db.collection("users").document(team.managerId).get()
        if not manager_doc.exists:
            raise ValueError("Manager user not found")
            
        new_team = TeamInDB(id=team_id, createdBy=created_by, **team.model_dump())
        db.collection("teams").document(team_id).set(new_team.model_dump())
        return new_team

    def get_all_teams(self, user_id: str, user_role: str) -> List[TeamWithMembers]:
        db = _get_db()
        teams_ref = db.collection("teams")
        
        if user_role == "Employee":
            # Employee sees only their own team.
            user_doc = db.collection("users").document(user_id).get()
            team_id = user_doc.to_dict().get("teamId") if user_doc.exists else None
            if not team_id:
                return []
            teams_docs = teams_ref.where("id", "==", team_id).stream()
        elif user_role == "Manager":
            # Manager sees only teams they manage
            teams_docs = teams_ref.where("managerId", "==", user_id).stream()
        else:
            # Admin sees all teams
            teams_docs = teams_ref.stream()
            
        teams = [TeamInDB(**{**(d.to_dict() or {}), "id": d.id}) for d in teams_docs]
        
        result = []
        for t in teams:
            members_docs = db.collection("teamMembers").where("teamId", "==", t.id).stream()
            members_list = []
            for m_doc in members_docs:
                m_data = m_doc.to_dict() or {}
                user_doc = db.collection("users").document(m_data.get("userId", "")).get()
                if user_doc.exists:
                    u_data = user_doc.to_dict() or {}
                    members_list.append(MemberProfile(
                        userId=user_doc.id,
                        name=u_data.get("displayName", "Unknown"),
                        email=u_data.get("email", ""),
                        role=u_data.get("role", "Employee"),
                        designation=m_data.get("designation")
                    ))
            
            manager_doc = db.collection("users").document(t.managerId).get()
            if manager_doc.exists:
                m_data = manager_doc.to_dict() or {}
                manager_profile = MemberProfile(
                    userId=manager_doc.id,
                    name=m_data.get("displayName", "Unknown"),
                    email=m_data.get("email", ""),
                    role=m_data.get("role", "Manager"),
                    designation="Manager"
                )
                if not any(m.userId == manager_profile.userId for m in members_list):
                    members_list.append(manager_profile)
                    
            result.append(TeamWithMembers(**t.model_dump(), members=members_list))
            
        return result

    def add_member(self, member: TeamMemberCreate) -> TeamMemberInDB:
        db = _get_db()
        
        # Check if already in team
        existing = db.collection("teamMembers").where("teamId", "==", member.teamId).where("userId", "==", member.userId).limit(1).stream()
        if len(list(existing)) > 0:
            raise ValueError("User is already in this team")
            
        member_id = str(uuid.uuid4())
        new_member = TeamMemberInDB(id=member_id, **member.model_dump())
        
        batch = db.batch()
        batch.set(db.collection("teamMembers").document(member_id), new_member.model_dump())
        batch.update(db.collection("users").document(member.userId), {"teamId": member.teamId})
        batch.commit()
        
        return new_member

team_service = TeamService()
