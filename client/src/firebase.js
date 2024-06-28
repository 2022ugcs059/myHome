// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "mern-estate-a4020.firebaseapp.com",
  projectId: "mern-estate-a4020",
  storageBucket: "mern-estate-a4020.appspot.com",
  messagingSenderId: "692249026733",
  appId: "1:692249026733:web:2d1b91acda8e7ce252e624"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);