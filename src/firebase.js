import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBZScpOJHgeL3LRmwIqsl1HX248eELFdKk",
  authDomain: "tarjetas-congregacion-sur.firebaseapp.com",
  projectId: "tarjetas-congregacion-sur",
  storageBucket: "tarjetas-congregacion-sur.appspot.com",
  messagingSenderId: "761619333329",
  appId: "1:761619333329:web:5d537758328f8ab1e005f0"
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app)
const db = getFirestore(app);

export { db };