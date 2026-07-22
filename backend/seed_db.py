import os
import uuid
from datetime import datetime, timedelta
from dotenv import load_dotenv
import firebase_admin
from firebase_admin import credentials, firestore

load_dotenv()

cred_path = os.getenv("FIREBASE_CREDENTIALS_PATH")
if not cred_path:
    print("FIREBASE_CREDENTIALS_PATH not found in .env")
    exit(1)

cred = credentials.Certificate(cred_path)
firebase_admin.initialize_app(cred)

db = firestore.client()

def delete_collection(coll_ref, batch_size):
    docs = coll_ref.limit(batch_size).stream()
    deleted = 0
    for doc in docs:
        doc.reference.delete()
        deleted += 1
    if deleted >= batch_size:
        return delete_collection(coll_ref, batch_size)

print("Cleaning 'tasks' collection...")
delete_collection(db.collection('tasks'), 50)
print("Cleaning 'time_entries' collection...")
delete_collection(db.collection('time_entries'), 50)

tasks_data = [
    {"title": "Daily Standup Call", "projectId": "Internal", "assignedUserId": "team", "priority": "Medium", "status": "Todo", "estimatedHours": 2, "hoursWorked": 0, "offset_days": 0},
    {"title": "Meeting with Client A", "projectId": "Alpha", "assignedUserId": "john", "priority": "High", "status": "In Progress", "estimatedHours": 1, "hoursWorked": 1, "offset_days": -1},
    {"title": "Interview with Backend Candidate", "projectId": "HR", "assignedUserId": "jane", "priority": "Medium", "status": "Completed", "estimatedHours": 1, "hoursWorked": 1.5, "offset_days": -2},
    {"title": "Project Alpha Completion", "projectId": "Alpha", "assignedUserId": "alex", "priority": "Critical", "status": "Review", "estimatedHours": 10, "hoursWorked": 9, "offset_days": -3},
    {"title": "Add Auth Feature", "projectId": "Beta", "assignedUserId": "jane", "priority": "High", "status": "In Progress", "estimatedHours": 5, "hoursWorked": 3, "offset_days": 0},
    {"title": "Database Schema Design", "projectId": "Gamma", "assignedUserId": "alex", "priority": "Medium", "status": "Completed", "estimatedHours": 8, "hoursWorked": 8, "offset_days": -5},
    {"title": "Bug Fix #129", "projectId": "Beta", "assignedUserId": "john", "priority": "High", "status": "Review", "estimatedHours": 2, "hoursWorked": 2.5, "offset_days": -1},
    {"title": "Weekly Team Sync", "projectId": "Internal", "assignedUserId": "team", "priority": "Low", "status": "Todo", "estimatedHours": 1, "hoursWorked": 0, "offset_days": 1},
    {"title": "Onboard New Employee", "projectId": "HR", "assignedUserId": "jane", "priority": "Low", "status": "In Progress", "estimatedHours": 3, "hoursWorked": 1, "offset_days": 0},
    {"title": "Final QA Signoff", "projectId": "Alpha", "assignedUserId": "alex", "priority": "Critical", "status": "Blocked", "estimatedHours": 4, "hoursWorked": 1, "offset_days": -2}
]

today = datetime.now()

for task in tasks_data:
    task_id = str(uuid.uuid4())
    due_date = (today + timedelta(days=task["offset_days"] + 7)).strftime("%Y-%m-%d")
    
    task_doc = {
        "title": task["title"],
        "projectId": task["projectId"],
        "assignedUserId": task["assignedUserId"],
        "priority": task["priority"],
        "status": task["status"],
        "estimatedHours": task["estimatedHours"],
        "startDate": today.strftime("%Y-%m-%d"),
        "dueDate": due_date
    }
    
    db.collection('tasks').document(task_id).set(task_doc)
    print(f"Added task: {task['title']}")
    
    if task["hoursWorked"] > 0:
        entry_id = str(uuid.uuid4())
        entry_date = (today + timedelta(days=task["offset_days"])).strftime("%Y-%m-%d")
        entry_doc = {
            "task_id": task_id,
            "user_id": task["assignedUserId"],
            "date": entry_date,
            "hours_worked": task["hoursWorked"],
            "description": f"Worked on {task['title']}"
        }
        db.collection('time_entries').document(entry_id).set(entry_doc)

print("Database seeded with 10 practical tasks successfully.")
