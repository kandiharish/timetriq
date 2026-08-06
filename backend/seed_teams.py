import os
import sys
import uuid
import firebase_admin
from firebase_admin import credentials, firestore

# Setup minimal path to import app core if needed, or just run directly
app_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), 'app'))
if app_dir not in sys.path:
    sys.path.append(app_dir)

from core import firebase

firebase.init_firebase()

def seed_teams():
    print('Fetching users...')
    users_ref = firebase.db.collection('users').stream()
    users = []
    for doc in users_ref:
        data = doc.to_dict()
        data['uid'] = doc.id
        users.append(data)
        
    managers = [u for u in users if u.get('role', '').lower() == 'manager']
    employees = [u for u in users if u.get('role', '').lower() == 'employee']
    
    if not managers:
        print('No managers found to create teams for.')
        return
        
    if not employees:
        print('No employees found to add to teams.')
        
    print(f'Found {len(managers)} managers and {len(employees)} employees.')
    
    # Check existing teams
    teams_ref = firebase.db.collection('teams').stream()
    existing_manager_ids = [doc.to_dict().get('managerId') for doc in teams_ref]
    
    for manager in managers:
        if manager['uid'] in existing_manager_ids:
            print(f'Manager {manager.get("email")} already has a team. Skipping.')
            continue
            
        team_id = str(uuid.uuid4())
        # Assign up to 3 random employees (or first 3)
        assigned_employees = employees[:3]
        members = []
        for emp in assigned_employees:
            members.append({
                'userId': emp['uid'],
                'name': emp.get('displayName', emp.get('email', 'Unknown')),
                'email': emp.get('email', ''),
                'role': 'Employee'
            })
            
        team_data = {
            'id': team_id,
            'name': f"{manager.get('displayName', 'Manager').split(' ')[0]}'s Team",
            'description': 'Automatically seeded team for demonstration.',
            'managerId': manager['uid'],
            'createdBy': manager['uid'],
            'createdAt': firestore.SERVER_TIMESTAMP,
            'updatedAt': firestore.SERVER_TIMESTAMP,
            'members': members
        }
        
        firebase.db.collection('teams').document(team_id).set(team_data)
        print(f'Created team {team_data["name"]} for manager {manager.get("email")}')

if __name__ == '__main__':
    seed_teams()
