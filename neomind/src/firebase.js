// Import the functions you need from the SDKs you need
//atiatiatiatiatiatiati
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyC9aBRMAv5uLoksHm6bKww4rvQRWNZ_Y8g",
  authDomain: "neomind-f4981.firebaseapp.com",
  projectId: "neomind-f4981",
  storageBucket: "neomind-f4981.firebasestorage.app",
  messagingSenderId: "208155488527",
  appId: "1:208155488527:web:ec36b63341cb9de872ce7a",
  measurementId: "G-MLMTN7KKY0"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const auth = getAuth(app);
export const db = getFirestore(app);
