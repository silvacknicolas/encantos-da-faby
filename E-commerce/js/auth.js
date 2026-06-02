/**
 * auth.js — Autenticação Firebase
 * Gerencia login, registro, sessão e logout.
 * Expõe: currentUser, onAuthChange(callback), login(), register(), logout()
 */

import { auth, db }           from "./firebase.js";
import { showToast }          from "./ui.js";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updatePassword,
  EmailAuthProvider,
  reauthenticateWithCredential
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import {
  doc, setDoc, getDoc, updateDoc
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// Email da conta administradora
const ADMIN_EMAIL = "fabiola@encantosdafaby.com.br";

let currentUser  = null;
let authCallbacks = [];

/** Retorna o usuário atual (ou null) */
export const getUser = () => currentUser;

/** Retorna true se o usuário atual é admin */
export const isAdmin = () => currentUser?.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase();

/** Registra callback para mudanças de autenticação */
export function onAuthChange(cb) {
  authCallbacks.push(cb);
  // Chamar imediatamente com estado atual se já resolvido
  if (currentUser !== undefined) cb(currentUser);
}

/** Inicializa o listener de estado de autenticação */
export function initAuth() {
  onAuthStateChanged(auth, async (firebaseUser) => {
    if (firebaseUser) {
      // Buscar dados extras do Firestore
      const snap = await getDoc(doc(db, "users", firebaseUser.uid));
      currentUser = {
        uid:     firebaseUser.uid,
        email:   firebaseUser.email,
        name:    snap.exists() ? snap.data().name    : firebaseUser.email.split("@")[0],
        address: snap.exists() ? snap.data().address : "",
        photo:   snap.exists() ? snap.data().photo   : "",
        role:    snap.exists() ? snap.data().role     : "client",
      };
    } else {
      currentUser = null;
    }
    authCallbacks.forEach(cb => cb(currentUser));
  });
}

/** Login com email/senha */
export async function login(email, password) {
  try {
    await signInWithEmailAndPassword(auth, email, password);
    return { success: true };
  } catch (err) {
    const msg = translateAuthError(err.code);
    return { success: false, error: msg };
  }
}

/** Cadastro de novo usuário */
export async function register(name, email, password) {
  try {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    // Salvar dados extras no Firestore
    await setDoc(doc(db, "users", cred.user.uid), {
      uid:     cred.user.uid,
      email,
      name,
      address: "",
      photo:   "",
      role:    email.toLowerCase() === ADMIN_EMAIL.toLowerCase() ? "admin" : "client",
      createdAt: new Date().toISOString()
    });
    return { success: true };
  } catch (err) {
    const msg = translateAuthError(err.code);
    return { success: false, error: msg };
  }
}

/** Logout */
export async function logout() {
  await signOut(auth);
}

/** Atualizar dados do perfil */
export async function updateProfile(data) {
  if (!currentUser) return { success: false, error: "Não autenticado." };
  try {
    await updateDoc(doc(db, "users", currentUser.uid), data);
    currentUser = { ...currentUser, ...data };
    authCallbacks.forEach(cb => cb(currentUser));
    return { success: true };
  } catch (err) {
    return { success: false, error: "Erro ao salvar perfil." };
  }
}

/** Alterar senha */
export async function changePassword(currentPassword, newPassword) {
  if (!auth.currentUser) return { success: false, error: "Não autenticado." };
  try {
    const cred = EmailAuthProvider.credential(auth.currentUser.email, currentPassword);
    await reauthenticateWithCredential(auth.currentUser, cred);
    await updatePassword(auth.currentUser, newPassword);
    return { success: true };
  } catch (err) {
    if (err.code === "auth/wrong-password") return { success: false, error: "Senha atual incorreta." };
    return { success: false, error: "Erro ao alterar senha." };
  }
}

function translateAuthError(code) {
  const map = {
    "auth/user-not-found":      "Usuário não encontrado.",
    "auth/wrong-password":      "Senha incorreta.",
    "auth/invalid-email":       "E-mail inválido.",
    "auth/email-already-in-use":"Este e-mail já está em uso.",
    "auth/weak-password":       "Senha muito fraca. Use ao menos 6 caracteres.",
    "auth/too-many-requests":   "Muitas tentativas. Tente novamente mais tarde.",
    "auth/invalid-credential":  "Credenciais inválidas. Verifique email e senha.",
  };
  return map[code] || "Erro inesperado. Tente novamente.";
}
