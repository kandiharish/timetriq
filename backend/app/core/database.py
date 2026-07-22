import firebase_admin
from firebase_admin import credentials, firestore
import os
from dotenv import load_dotenv

load_dotenv()

def initialize_firebase():
    if not firebase_admin._apps:
        cred_path = os.getenv("FIREBASE_CREDENTIALS_PATH")
        # Ensure path is absolute relative to the project root if it's not absolute
        if cred_path and not os.path.isabs(cred_path):
            # Assumes backend is the current working directory, or resolve relative to this file
            base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
            cred_path = os.path.join(base_dir, cred_path)
            
        if cred_path and os.path.exists(cred_path):
            cred = credentials.Certificate(cred_path)
            firebase_admin.initialize_app(cred)
        else:
            try:
                firebase_admin.initialize_app()
            except Exception as e:
                print(f"Warning: Firebase could not be initialized: {e}")

initialize_firebase()

def get_db():
    try:
        db = firestore.client()
        return db
    except ValueError as e:
        print(f"Firestore client error: {e}")
        return None
