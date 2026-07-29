// Give the service worker access to Firebase Messaging.
importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-messaging-compat.js');

let messaging;

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'INITIALIZE_FIREBASE') {
    firebase.initializeApp(event.data.firebaseConfig);
    messaging = firebase.messaging();
    
    messaging.onBackgroundMessage((payload) => {
      console.log('[firebase-messaging-sw.js] Received background message ', payload);
      
      const notificationTitle = payload.notification?.title || 'Notification';
      const notificationOptions = {
        body: payload.notification?.body,
        icon: '/favicon.svg'
      };

      self.registration.showNotification(notificationTitle, notificationOptions);
    });
  }
});
