import os
from dotenv import load_dotenv
import firebase_admin
from firebase_admin import credentials, firestore
import uuid

load_dotenv()
cred_path = os.getenv("FIREBASE_CREDENTIALS_PATH")
if not cred_path:
    print("FIREBASE_CREDENTIALS_PATH not found in .env")
    exit(1)

cred = credentials.Certificate(cred_path)
if not firebase_admin._apps:
    firebase_admin.initialize_app(cred)

db = firestore.client()

def seed_workspace():
    # 1. Frontend Space
    frontend_space_id = str(uuid.uuid4())
    db.collection("spaces").document(frontend_space_id).set({
        "id": frontend_space_id,
        "name": "Frontend",
        "description": "Frontend Development Space"
    })
    print(f"Created Frontend Space: {frontend_space_id}")
    
    frontend_folder_id = str(uuid.uuid4())
    db.collection("folders").document(frontend_folder_id).set({
        "id": frontend_folder_id,
        "space_id": frontend_space_id,
        "name": "React App",
        "members": []
    })
    
    frontend_list_id = str(uuid.uuid4())
    db.collection("lists").document(frontend_list_id).set({
        "id": frontend_list_id,
        "space_id": frontend_space_id,
        "folder_id": frontend_folder_id,
        "name": "Sprint 43"
    })
    
    # 2. Backend Space
    backend_space_id = str(uuid.uuid4())
    db.collection("spaces").document(backend_space_id).set({
        "id": backend_space_id,
        "name": "Backend",
        "description": "Backend Development Space"
    })
    print(f"Created Backend Space: {backend_space_id}")
    
    backend_folder_id = str(uuid.uuid4())
    db.collection("folders").document(backend_folder_id).set({
        "id": backend_folder_id,
        "space_id": backend_space_id,
        "name": "API Services",
        "members": []
    })
    
    backend_list_id = str(uuid.uuid4())
    db.collection("lists").document(backend_list_id).set({
        "id": backend_list_id,
        "space_id": backend_space_id,
        "folder_id": backend_folder_id,
        "name": "To Do"
    })
    
    print("Workspace seeded successfully.")

if __name__ == "__main__":
    seed_workspace()
