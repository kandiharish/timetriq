import firebase_admin
from firebase_admin import credentials, firestore
import os
from dotenv import load_dotenv

load_dotenv()

from app.core.firebase import init_firebase

# Initialize Firebase using our central configuration
init_firebase()

def get_db():
    try:
        db = firestore.client()
        return db
    except ValueError as e:
        print(f"Firestore client error: {e}")
        return None
