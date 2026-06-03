/**
 * perfil.js — Área do Cliente
 */

import { db, storage }          from "./firebase.js";
import { getUser, updateProfile, changePassword } from "./auth.js";
import { showToast, formatCurrency, formatDate, openModal, closeModal, setupImageUpload } from "./ui.js";
import {
  collection, getDocs, query, where, orderBy
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import {
  ref, uploadBytes, getDownloadURL
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-storage.js";

export async function initPerfil() {
  const user = getUser();
  if (!user) { window.location.href = "index.html"; return; }

  renderUserInfo(user);
  await loadOrders(user);
  bindEvents(user);
}

function renderUserInfo(user) {
  const nameEl  = document.getElementById("profile-user-name");
  const emailEl = document.getElementById("profile-user-email");
  const avatarEl = document.getElementById("profile-avatar-img");

  if (nameEl)  nameEl.textContent  = user.name  || "Usuário";
  if (emailEl) emailEl.textContent = user.email || "";
  if (avatarEl && user.photo) {
    avatarEl.src = user.photo;
    avatarEl.classList.remove("hidden");
    document.getElementById("profile-avatar-icon")?.classList.add("hidden");
  }

  // Preencher formulário
  const nameInput = document.getElementById("pf-name");
  const addrInput = document.getElementById("pf-address");
  if (nameInput)  nameInput.value  = user.name    || "";
  if (addrInput)  addrInput.value  = user.address || "";
}

async function loadOrders(user) {
  const container = document.getElementById("orders-container");
  if (!container) return;

  let userOrders = [];

  try {
    const snap = await getDocs(
      query(collection(db, "orders"),
        where("clientUid", "==", user.uid),
        orderBy("createdAt", "desc")
      )
    );
    userOrders = snap.docs.map(d => d.data());
  } catch {
    const local = JSON.parse(localStorage.getItem("faby_orders") || "[]");
    userOrders  = local.filter(o => o.clientEmail === user.email);
  }

  if (userOrders.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <span class="material-symbols-outlined">receipt_long</span>
        <h3>Nenhum pedido ainda</h3>
        <p>Seus pedidos aparecerão aqui após a compra.</p>
        <a href="index.html#catalogo" class="btn btn-primary" style="margin-top:20px">Explorar produtos</a>
      </div>`;
    return;
  }

  const statusChipMap = {
    "Pendente":    "chip-pending",
    "Em Produção": "chip-producing",
    "Enviado":     "chip-sent",
    "Entregue":    "chip-delivered",
    "Cancelado":   "chip-cancelled",
  };

  container.innerHTML = userOrders.map(o => {
    const chip  = statusChipMap[o.status] || "chip-pending";
    const items = (o.items || []).map(i => `${i.quantity}x ${i.name}`).join(" · ");
    return `
    <div class="order-card">
      <div class="order-card-header">
        <div>
          <div class="order-id">Pedido #${o.orderId}</div>
          <div class="order-total">${formatCurrency(o.total || 0)}</div>
        </div>
        <span class="chip ${chip}">${o.status}</span>
      </div>
      <div class="order-items">${items}</div>
      <div style="font-size:12px;color:var(--on-surface-variant);margin-top:8px">${formatDate(o.createdAt)}</div>
    </div>`;
  }).join("");
}

function bindEvents(user) {
  // Avatar upload
  const avatarInput = document.getElementById("avatar-input");
  const avatarWrap  = document.getElementById("avatar-wrap");
  avatarWrap?.addEventListener("click", () => avatarInput?.click());

  avatarInput?.addEventListener("change", async () => {
    const file = avatarInput.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async e => {
      const base64Data = e.target.result;
      const img = document.getElementById("profile-avatar-img");
      if (img) { img.src = base64Data; img.classList.remove("hidden"); }
      document.getElementById("profile-avatar-icon")?.classList.add("hidden");

      try {
        const storageRef = ref(storage, `users/${user.uid}/avatar`);
        await uploadBytes(storageRef, file);
        const url = await getDownloadURL(storageRef);
        await updateProfile({ photo: url });
        showToast("Foto de perfil atualizada!", "success");
      } catch (err) {
        // Se falhar o upload no Storage (Spark plan), salvamos o Base64 diretamente no Firestore (gratuito)
        await updateProfile({ photo: base64Data });
        showToast("Foto de perfil atualizada!", "success");
      }
    };
    reader.readAsDataURL(file);
  });

  // Salvar perfil
  document.getElementById("profile-form")?.addEventListener("submit", async e => {
    e.preventDefault();
    const name    = document.getElementById("pf-name")?.value.trim();
    const address = document.getElementById("pf-address")?.value.trim();
    const result  = await updateProfile({ name, address });
    if (result.success) {
      showToast("Perfil atualizado!", "success");
      document.getElementById("profile-user-name").textContent = name;
    } else {
      showToast(result.error, "error");
    }
  });

  // Alterar senha
  document.getElementById("password-form")?.addEventListener("submit", async e => {
    e.preventDefault();
    const current = document.getElementById("pf-current-password")?.value;
    const newPwd  = document.getElementById("pf-new-password")?.value;
    const confirm = document.getElementById("pf-confirm-password")?.value;

    if (newPwd !== confirm) { showToast("As senhas não coincidem.", "error"); return; }
    if (newPwd.length < 6)  { showToast("A senha deve ter ao menos 6 caracteres.", "error"); return; }

    const result = await changePassword(current, newPwd);
    if (result.success) {
      showToast("Senha alterada com sucesso!", "success");
      e.target.reset();
    } else {
      showToast(result.error, "error");
    }
  });
}
