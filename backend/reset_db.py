import os
from dotenv import load_dotenv
import firebase_admin
from firebase_admin import credentials, firestore

load_dotenv()

# Initialize Firebase Admin SDK
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
        print(f"Deleting doc {doc.id} => {doc.to_dict()}")
        doc.reference.delete()
        deleted += 1

    if deleted >= batch_size:
        return delete_collection(coll_ref, batch_size)

print("Starting database reset...")

print("Cleaning 'tasks' collection...")
delete_collection(db.collection('tasks'), 50)

print("Cleaning 'time_entries' collection...")
delete_collection(db.collection('time_entries'), 50)

print("Database reset complete. All tasks and time entries have been wiped.")
