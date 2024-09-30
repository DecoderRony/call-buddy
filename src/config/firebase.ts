// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "call-buddy-863f5.firebaseapp.com",
  projectId: "call-buddy-863f5",
  storageBucket: "call-buddy-863f5.appspot.com",
  messagingSenderId: "31826496795",
  appId: "1:31826496795:web:9e29f7a47c976ee15497be",
  measurementId: "G-R204RLPPNV",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app);

// Exports
export const firestore = getFirestore(app);
