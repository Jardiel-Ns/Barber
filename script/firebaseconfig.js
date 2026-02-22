import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyBsD9o7n1Al_JR0a2k2XXDg40FXy3SJKzE",
  authDomain: "barber-a4c8d.firebaseapp.com",
  projectId: "barber-a4c8d",
  storageBucket: "barber-a4c8d.firebasestorage.app",
  messagingSenderId: "463751191217",
  appId: "1:463751191217:web:fa1db256764389873c2090",
  measurementId: "G-RYHEQMR9TT"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);