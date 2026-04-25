// js/firebase-setup.js

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-firestore.js";

// TODO: Replace this config with your actual Firebase project configuration
const firebaseConfig = {
  apiKey: "AIzaSyCVk8lrrvTlanvCLnOgJ-FDeEx2QLlE45c",
  authDomain: "final-vridhi.firebaseapp.com",
  projectId: "final-vridhi",
  storageBucket: "final-vridhi.firebasestorage.app",
  messagingSenderId: "1047018150544",
  appId: "1:1047018150544:web:e4151115bd94b129a11615",
  measurementId: "G-RJQ3YD3YPW"
};
// Initialize Firebase
const app = initializeApp(firebaseConfig);
// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);
