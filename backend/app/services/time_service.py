from typing import List, Optional
from datetime import datetime, timezone
from app.models.time_entry import TimeEntryCreate, TimeEntryUpdate, TimeEntryInDB
from app.services.task_service import get_task
import app.core.firebase as firebase
from firebase_admin import firestore
from google.cloud.firestore import Increment, Client
from google.cloud.firestore_v1.base_query import FieldFilter

def _get_db() -> Client:
    if not firebase.db:
        firebase.init_firebase()
    return firebase.db

def create_time_entry(user_id: str, entry_in: TimeEntryCreate) -> TimeEntryInDB:
    # Business Rule: Ensure task exists and belongs to user
    task = get_task(user_id, entry_in.task_id)
    if not task:
        raise ValueError("Task not found or does not belong to user")

    db = _get_db()
    doc_ref = db.collection('timeEntries').document()
    
    entry_data = entry_in.model_dump()
    if 'date' in entry_data:
        entry_data['date'] = entry_data['date'].isoformat()
        
    entry = TimeEntryInDB(
        id=doc_ref.id,
        owner_id=user_id,
        created_at=datetime.now(timezone.utc),
        updated_at=datetime.now(timezone.utc),
        **entry_data
    )
    
    db_payload = entry.model_dump()
    db_payload['date'] = str(db_payload['date'])
    
    doc_ref.set(db_payload)
    
    # Update actualHours on parent task
    task_ref = db.collection('tasks').document(entry_in.task_id)
    task_ref.update({
        'actualHours': Increment(entry_in.hours_worked)
    })
    
    return entry

def get_time_entries_for_task(user_id: str, task_id: str) -> List[TimeEntryInDB]:
    db = _get_db()
    # Technically, tasks own time entries, but we query by task_id and owner_id for safety
    docs = db.collection('timeEntries').where(filter=FieldFilter('task_id', '==', task_id)).where(filter=FieldFilter('owner_id', '==', user_id)).stream()
    
    entries = []
    for doc in docs:
        entries.append(TimeEntryInDB(**doc.to_dict()))
    return entries

def get_all_time_entries(user_id: str) -> List[TimeEntryInDB]:
    db = _get_db()
    docs = db.collection('timeEntries').where(filter=FieldFilter('owner_id', '==', user_id)).stream()
    
    entries = []
    for doc in docs:
        entries.append(TimeEntryInDB(**doc.to_dict()))
    return entries

def delete_time_entry(user_id: str, entry_id: str) -> bool:
    db = _get_db()
    doc_ref = db.collection('timeEntries').document(entry_id)
    doc = doc_ref.get()
    
    if doc.exists:
        data = doc.to_dict()
        if data.get('owner_id') == user_id:
            task_id = data.get('task_id')
            hours_worked = data.get('hours_worked', 0)
            
            # Hard delete for time entries or could be soft delete. We'll hard delete.
            doc_ref.delete()
            
            # Decrement actualHours on parent task
            if task_id:
                task_ref = db.collection('tasks').document(task_id)
                task_ref.update({
                    'actualHours': Increment(-hours_worked)
                })
                
            return True
    return False

def get_actual_hours_for_task(user_id: str, task_id: str) -> float:
    entries = get_time_entries_for_task(user_id, task_id)
    return sum(e.hours_worked for e in entries)
