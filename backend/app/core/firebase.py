import firebase_admin
from firebase_admin import credentials, auth, firestore
from app.core.config import settings

db = None

# Initialize Firebase Admin SDK
def init_firebase():
    global db
    if not firebase_admin._apps:
        if settings.FIREBASE_CREDENTIALS_PATH:
            cred = credentials.Certificate(settings.FIREBASE_CREDENTIALS_PATH)
            firebase_admin.initialize_app(cred)
        else:
            try:
                firebase_admin.initialize_app()
            except ValueError:
                pass
    
    db = firestore.client()

def verify_token(token: str):
    try:
        decoded_token = auth.verify_id_token(token)
        return decoded_token
    except Exception as e:
        return None

