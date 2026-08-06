import os
import sys
from datetime import datetime, timezone
from dotenv import load_dotenv
import firebase_admin
from firebase_admin import credentials, auth, firestore

load_dotenv()

cred_path = os.getenv("FIREBASE_CREDENTIALS_PATH")
if not cred_path:
    print("FIREBASE_CREDENTIALS_PATH not found in .env")
    sys.exit(1)

if not firebase_admin._apps:
    cred = credentials.Certificate(cred_path)
    firebase_admin.initialize_app(cred)

db = firestore.client()

demo_users = [
    {"name": "harsh", "role": "Manager"},
    {"name": "sathyam", "role": "Manager"},
    {"name": "vishaka", "role": "HR"},
    {"name": "sakshi", "role": "HR"},
    {"name": "pradeep", "role": "Employee"},
    {"name": "ramu", "role": "Employee"},
    {"name": "rahul", "role": "Employee"},
    {"name": "dev", "role": "Employee"}
]

print("Starting to create/update demo users...")

for user_info in demo_users:
    email = f"{user_info['name']}@verveadvisory.com"
    display_name = user_info['name'].capitalize()
    role = user_info['role']
    
    # Try to find existing Auth user
    try:
        auth_user = auth.get_user_by_email(email)
        print(f"Auth user {email} already exists with uid {auth_user.uid}.")
    except auth.UserNotFoundError:
        # Create Auth User
        auth_user = auth.create_user(
            email=email,
            email_verified=True,
            password="password",
            display_name=display_name
        )
        print(f"Created Auth user {email} with uid {auth_user.uid}.")

    # Update/Set Firestore user document
    user_doc = {
        "uid": auth_user.uid,
        "email": email,
        "display_name": display_name,
        "role": role,
        "is_archived": False,
        "created_at": datetime.now(timezone.utc),
        "updated_at": datetime.now(timezone.utc)
    }
    
    db.collection("users").document(auth_user.uid).set(user_doc)
    print(f"Synced {display_name} ({role}) to Firestore users collection.")

print("Demo users creation and syncing completed successfully!")
