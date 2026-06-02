/**
 * firebase.js — Inicialização do Firebase
 * Importado por todos os módulos que precisam de Auth ou Firestore
 */

import { initializeApp }              from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth }                    from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { getFirestore }               from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { getStorage }                 from "https://www.gstatic.com/firebasejs/10.12.0/firebase-storage.js";

const firebaseConfig = {
  apiKey:            "AIzaSyCI1f78fw1pIhoUpvfgK-Y-vWIHt5nO1Tk",
  authDomain:        "encantos-da-faby.firebaseapp.com",
  projectId:         "encantos-da-faby",
  storageBucket:     "encantos-da-faby.firebasestorage.app",
  messagingSenderId: "704117339517",
  appId:             "1:704117339517:web:d34bcf17eb75985020c814",
  measurementId:     "G-Y3G8PYYDRT"
};

const app     = initializeApp(firebaseConfig);
const auth    = getAuth(app);
const db      = getFirestore(app);
const storage = getStorage(app);

export { app, auth, db, storage };
