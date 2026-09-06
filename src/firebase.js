import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyAAcrd33ljFT3yN8K8uOKzYUSQM0jnh9Jg",
  authDomain: "pagosfast-app.firebaseapp.com",
  projectId: "pagosfast-app",
  storageBucket: "pagosfast-app.firebasestorage.app",
  messagingSenderId: "256211014812",
  appId: "1:256211014812:web:23f03694bba38ef54a8959",
  measurementId: "G-QRW7K2Y80Z"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);