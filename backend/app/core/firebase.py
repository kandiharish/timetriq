import firebase_admin
from firebase_admin import credentials, auth, firestore
from app.core.config import settings
import os
import json
import base64
import logging

logger = logging.getLogger(__name__)

db = None

# Initialize Firebase Admin SDK
def init_firebase():
    global db
    if not firebase_admin._apps:
        # Priority 1: Base64 encoded JSON string in env var (Best for Render/Vercel)
        firebase_creds_b64 = os.getenv("FIREBASE_CREDENTIALS_BASE64")
        # Priority 2: JSON string in env var
        firebase_creds_json = os.getenv("FIREBASE_CREDENTIALS_JSON")
        
        try:
            if firebase_creds_b64:
                cred_json = base64.b64decode(firebase_creds_b64).decode('utf-8')
                cred_dict = json.loads(cred_json)
                cred = credentials.Certificate(cred_dict)
                firebase_admin.initialize_app(cred)
                logger.info("Firebase initialized using Base64 credentials.")
            elif firebase_creds_json:
                cred_dict = json.loads(firebase_creds_json)
                cred = credentials.Certificate(cred_dict)
                firebase_admin.initialize_app(cred)
                logger.info("Firebase initialized using JSON string credentials.")
            # Priority 3: File path (for local development)
            elif settings.FIREBASE_CREDENTIALS_PATH:
                cred = credentials.Certificate(settings.FIREBASE_CREDENTIALS_PATH)
                firebase_admin.initialize_app(cred)
                logger.info("Firebase initialized using credentials file path.")
            else:
                # Default init (relies on GOOGLE_APPLICATION_CREDENTIALS)
                firebase_admin.initialize_app()
                logger.info("Firebase initialized using default credentials.")
        except Exception as e:
            logger.error(f"Failed to initialize Firebase: {e}")
            raise RuntimeError(f"Firebase initialization failed: {e}. Please ensure FIREBASE_CREDENTIALS_BASE64 is correctly configured in Render.")

    try:
        db = firestore.client()
    except Exception as e:
        logger.error(f"Failed to initialize Firestore client: {e}")
        raise RuntimeError(f"Could not connect to Firestore: {e}. Check if your Firebase credentials are valid.")

def verify_token(token: str):
    try:
        decoded_token = auth.verify_id_token(token)
        return decoded_token
    except Exception as e:
        return None
