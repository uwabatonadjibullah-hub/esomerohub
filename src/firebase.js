// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDRqkDd4Q9y2l4pNOmdy0gKRKFt4sK4BEk",
  authDomain: "esomerohub.firebaseapp.com",
  projectId: "esomerohub",
  storageBucket: "esomerohub.firebasestorage.app",
  messagingSenderId: "44356864508",
  appId: "1:44356864508:web:668b355803eed9c2d7ca79",
};


const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);