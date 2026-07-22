from typing import List, Optional
from datetime import datetime, timezone
from google.cloud.firestore_v1.base_query import FieldFilter
from app.models.task import TaskCreate, TaskUpdate, TaskInDB
import app.core.firebase as firebase

def _get_db():
    if not firebase.db:
        firebase.init_firebase()
    return firebase.db

def create_task(user_id: str, task_in: TaskCreate) -> TaskInDB:
    db = _get_db()
    doc_ref = db.collection('tasks').document()
    
    task_data = task_in.model_dump()
    # Convert dates to ISO strings for Firestore storage
    if 'startDate' in task_data:
        task_data['startDate'] = task_data['startDate'].isoformat()
    if 'dueDate' in task_data:
        task_data['dueDate'] = task_data['dueDate'].isoformat()

    now = datetime.now(timezone.utc)
    task = TaskInDB(
        id=doc_ref.id,
        userId=user_id,
        createdAt=now,
        updatedAt=now,
        isArchived=False,
        **task_data
    )
    
    db_payload = task.model_dump()
    db_payload['startDate'] = str(db_payload['startDate'])
    db_payload['dueDate'] = str(db_payload['dueDate'])
    if db_payload.get('completedDate'):
        db_payload['completedDate'] = str(db_payload['completedDate'])
    
    doc_ref.set(db_payload)
    return task

def get_tasks(user_id: str) -> List[TaskInDB]:
    db = _get_db()
    docs = db.collection('tasks').where(filter=FieldFilter('userId', '==', user_id)).where(filter=FieldFilter('isArchived', '==', False)).stream()
    
    tasks = []
    for doc in docs:
        tasks.append(TaskInDB(**doc.to_dict()))
    return tasks

def get_task(user_id: str, task_id: str) -> Optional[TaskInDB]:
    db = _get_db()
    doc_ref = db.collection('tasks').document(task_id)
    doc = doc_ref.get()
    
    if doc.exists:
        data = doc.to_dict()
        if data.get('userId') == user_id and not data.get('isArchived', False):
            return TaskInDB(**data)
    return None

def update_task(user_id: str, task_id: str, task_update: TaskUpdate) -> Optional[TaskInDB]:
    db = _get_db()
    doc_ref = db.collection('tasks').document(task_id)
    doc = doc_ref.get()
    
    if doc.exists:
        data = doc.to_dict()
        if data.get('userId') == user_id and not data.get('isArchived', False):
            update_data = task_update.model_dump(exclude_unset=True)
            
            # Check status change for completedDate
            if update_data.get('status') == 'Completed' and data.get('status') != 'Completed':
                from datetime import timezone
                update_data['completedDate'] = str(datetime.now(timezone.utc).date())
                
            # Format dates
            if 'startDate' in update_data:
                update_data['startDate'] = str(update_data['startDate'])
            if 'dueDate' in update_data:
                update_data['dueDate'] = str(update_data['dueDate'])
            if 'completedDate' in update_data and not isinstance(update_data['completedDate'], str):
                update_data['completedDate'] = str(update_data['completedDate'])
                
            from datetime import timezone
            update_data['updatedAt'] = datetime.now(timezone.utc)
            
            doc_ref.update(update_data)
            
            # Fetch updated
            updated_doc = doc_ref.get()
            return TaskInDB(**updated_doc.to_dict())
            
    return None

def delete_task(user_id: str, task_id: str) -> bool:
    db = _get_db()
    doc_ref = db.collection('tasks').document(task_id)
    doc = doc_ref.get()
    
    if doc.exists:
        data = doc.to_dict()
        if data.get('userId') == user_id and not data.get('isArchived', False):
            from datetime import timezone
            # Soft delete
            doc_ref.update({
                'isArchived': True,
                'updatedAt': datetime.now(timezone.utc)
            })
            return True
    return False
