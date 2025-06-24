const firebaseConfig = {
  apiKey: "AIzaSyAhiU_vFXznLI-dDGIWKXKsJtldxD4z940",
  authDomain: "booking-app-a81ec.firebaseapp.com",
  projectId: "booking-app-a81ec",
  storageBucket: "booking-app-a81ec.firebasestorage.app",
  messagingSenderId: "905587671438",
  appId: "1:905587671438:web:c7ad2eb82f7f5003aee4df"
};

// Initialize Firebase only if not already initialized
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}
