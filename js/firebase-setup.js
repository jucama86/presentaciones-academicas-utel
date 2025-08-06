import { initializeApp } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-app.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyBPtJzbY4gCFuloNqP0O9uzvCOQ0zrxEqM",
  authDomain: "presentaciones-academicas-utel.firebaseapp.com",
  projectId: "presentaciones-academicas-utel",
  storageBucket: "presentaciones-academicas-utel.firebasestorage.app",
  messagingSenderId: "996142514366",
  appId: "1:996142514366:web:46246b96eb0885b6dcdeef"
};

const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);
