// src/firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyCYEiprwYOpKYBhUNX9LfNfBYw0niG0UlU",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "fitfuel-af692.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "fitfuel-af692",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "fitfuel-af692.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "707391877553",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:707391877553:web:44ab6e70b32e3adaa2cd90"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
