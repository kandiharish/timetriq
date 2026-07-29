import { getToken, onMessage } from 'firebase/messaging';
import { messaging } from '../core/firebase';
import toast from 'react-hot-toast';

export const requestNotificationPermission = async (token: string) => {
  try {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      const msg = await messaging();
      if (!msg) {
        console.warn('Messaging not supported on this browser.');
        return;
      }
      
      const vapidKey = import.meta.env.VITE_FIREBASE_VAPID_KEY;
      if (!vapidKey) {
          console.warn('VITE_FIREBASE_VAPID_KEY is not defined. Cannot get FCM token.');
          return;
      }

      const currentToken = await getToken(msg, { vapidKey });
      
      if (currentToken) {
        // Send token to backend to save for this user
        await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/notifications/token`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ token: currentToken })
        });
      } else {
        console.log('No registration token available. Request permission to generate one.');
      }
    }
  } catch (error) {
    console.error('An error occurred while retrieving token. ', error);
  }
};

export const setupMessageListener = async (onMessageReceived?: (payload: any) => void) => {
  const msg = await messaging();
  if (msg) {
    onMessage(msg, (payload) => {
      console.log('Message received in foreground: ', payload);
      if (onMessageReceived) {
        onMessageReceived(payload);
      }
      if (payload.notification) {
        toast.success(
          `${payload.notification.title}: ${payload.notification.body}`,
          { duration: 5000, position: 'top-right' }
        );
      }
    });
  }
};

// Also send config to service worker to initialize it
export const initializeServiceWorker = () => {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/firebase-messaging-sw.js')
      .then((registration) => {
        if (registration.active) {
          registration.active.postMessage({
            type: 'INITIALIZE_FIREBASE',
            firebaseConfig: {
              apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
              authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
              projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
              storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
              messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
              appId: import.meta.env.VITE_FIREBASE_APP_ID,
            }
          });
        }
      });
  }
};
