import { initializeApp } from "firebase/app";
import firebaseConfig from "./firebaseConfig";
import { getDatabase } from "firebase/database";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// initialize app

const app = initializeApp(firebaseConfig);

export const storage = getFirestore(app)

export const auth = getAuth(app);

export const db = getDatabase(app);
export default app;
