import firebase_admin
from firebase_admin import messaging
from app.core.database import get_db

from typing import Optional

def send_push_notification(user_id: str, title: str, body: str, data: Optional[dict] = None):
    """
    Send a push notification to a specific user using Firebase Cloud Messaging.
    """
    if not firebase_admin._apps:
        print("Warning: Firebase admin not initialized. Cannot send notification.")
        return False

    db = get_db()
    if not db:
        print("Warning: Database not connected. Cannot fetch FCM token.")
        return False

    try:
        user_doc = db.collection("users").document(user_id).get()
        if not user_doc.exists:
            print(f"User {user_id} not found in Firestore.")
            return False

        user_data = user_doc.to_dict() or {}
        fcm_token = user_data.get("fcm_token")

        if not fcm_token:
            print(f"No FCM token found for user {user_id}. Skipping notification.")
            return False

        # Create the message
        message = messaging.Message(
            notification=messaging.Notification(
                title=title,
                body=body,
            ),
            data=data or {},
            token=fcm_token,
        )

        # Send the message
        response = messaging.send(message)
        print(f"Successfully sent message to user {user_id}: {response}")
        return True

    except Exception as e:
        print(f"Error sending push notification: {e}")
        return False
