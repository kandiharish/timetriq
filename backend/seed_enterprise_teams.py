import os
import sys
import uuid
from datetime import datetime, timezone

app_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), 'app'))
if app_dir not in sys.path:
    sys.path.append(app_dir)

from core import firebase

firebase.init_firebase()
db = firebase.db

def seed_enterprise_teams():
    print('Fetching users...')
    users_ref = db.collection('users').stream()
    users = []
    for doc in users_ref:
        data = doc.to_dict()
        data['uid'] = doc.id
        users.append(data)
        
    managers = [u for u in users if u.get('role', '').lower() == 'manager']
    employees = [u for u in users if u.get('role', '').lower() == 'employee']
    
    if not managers:
        print('No managers found.')
        return
        
    # Delete old teams and teamMembers
    print('Cleaning up old teams...')
    for t_doc in db.collection('teams').stream():
        db.collection('teams').document(t_doc.id).delete()
    for tm_doc in db.collection('teamMembers').stream():
        db.collection('teamMembers').document(tm_doc.id).delete()
        
    # Reset teamId for all users
    for u in users:
        db.collection('users').document(u['uid']).update({'teamId': None, 'team_id': None})
    
    print('Creating enterprise teams...')
    
    # Pre-defined enterprise teams
    team_configs = [
        {"name": "Engineering", "color": "#3B82F6", "icon": "Code"},
        {"name": "Quality Assurance", "color": "#10B981", "icon": "CheckCircle"},
        {"name": "Product Management", "color": "#8B5CF6", "icon": "Briefcase"},
        {"name": "Marketing", "color": "#F59E0B", "icon": "Megaphone"},
        {"name": "Human Resources", "color": "#EC4899", "icon": "Users"}
    ]
    
    # We map up to len(managers) teams
    used_configs = team_configs[:len(managers)]
    
    # Distribute employees evenly
    emps_per_team = max(1, len(employees) // len(used_configs)) if used_configs else 0
    
    for i, manager in enumerate(managers[:len(used_configs)]):
        config = used_configs[i]
        team_id = str(uuid.uuid4())
        
        team_data = {
            'id': team_id,
            'name': config['name'],
            'description': f"The {config['name']} department.",
            'managerId': manager['uid'],
            'color': config['color'],
            'icon': config['icon'],
            'assignedSpaces': [],
            'createdBy': manager['uid'],
            'createdAt': datetime.now(timezone.utc).isoformat(),
            'updatedAt': datetime.now(timezone.utc).isoformat()
        }
        
        db.collection('teams').document(team_id).set(team_data)
        
        # Update Manager's user doc
        db.collection('users').document(manager['uid']).update({'teamId': team_id, 'team_id': team_id})
        
        # Assign employees
        start_idx = i * emps_per_team
        end_idx = start_idx + emps_per_team if i < len(used_configs) - 1 else len(employees)
        assigned_emps = employees[start_idx:end_idx]
        
        for emp in assigned_emps:
            member_id = str(uuid.uuid4())
            member_data = {
                'id': member_id,
                'teamId': team_id,
                'userId': emp['uid'],
                'designation': f"{config['name']} Specialist",
                'joinedAt': datetime.now(timezone.utc).isoformat()
            }
            db.collection('teamMembers').document(member_id).set(member_data)
            db.collection('users').document(emp['uid']).update({'teamId': team_id, 'team_id': team_id})
            
        print(f"Created '{config['name']}' Team with Manager '{manager.get('email')}' and {len(assigned_emps)} employees.")

if __name__ == '__main__':
    seed_enterprise_teams()
