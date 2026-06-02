/**
 * admin.js — Painel Administrativo
 * CRUD de produtos, gerenciamento de pedidos, relatórios e configurações.
 */

import { db, storage }    from "./firebase.js";
import { getUser, isAdmin } from "./auth.js";
import { showToast, formatCurrency, formatDate, openModal, closeModal, genId } from "./ui.js";
import { getAllProducts }  from "./catalog.js";
import { STATUS }         from "./checkout.js";
import {
  collection, getDocs, doc, setDoc, deleteDoc, updateDoc, query, orderBy, where
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import {
  ref, uploadBytes, getDownloadURL
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-storage.js";

let products = [];
let orders   = [];
let editingProductId = null;

/* ─── INICIALIZAR ADMIN ─── */
export async function initAdmin() {
  if (!isAdmin()) {
    window.location.href = "index.html";
    return;
  }
  await Promise.all([loadProducts(), loadOrders()]);
  renderAdminProducts();
  renderAdminOrders();
  renderStats();
  bindEvents();
}

/* ─── CARREGAR DADOS ─── */
async function loadProducts() {
  try {
    const snap = await getDocs(query(collection(db, "products"), orderBy("name")));
    products = snap.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch {
    products = JSON.parse(localStorage.getItem("faby_products") || "[]");
  }
}

async function loadOrders() {
  try {
    const snap = await getDocs(query(collection(db, "orders"), orderBy("createdAt", "desc")));
    orders = snap.docs.map(d => ({ _docId: d.id, ...d.data() }));
  } catch {
    orders = JSON.parse(localStorage.getItem("faby_orders") || "[]");
  }
}

/* ─── STATS ─── */
function renderStats() {
  const totalRev = orders.reduce((s, o) => o.status !== STATUS.CANCELLED ? s + (o.total || 0) : s, 0);
  const pending  = orders.filter(o => o.status === STATUS.PENDING).length;
  const sent     = orders.filter(o => o.status === STATUS.SENT || o.status === STATUS.DELIVERED).length;

  setStat("stat-products",  products.length);
  setStat("stat-orders",    orders.length);
  setStat("stat-revenue",   formatCurrency(totalRev));
  setStat("stat-pending",   pending);
}
function setStat(id, val) { const el = document.getElementById(id); if (el) el.textContent = val; }

/* ─── RENDER PRODUTOS ─── */
function renderAdminProducts() {
  const tbody = document.getElementById("admin-products-tbody");
  if (!tbody) return;

  if (products.length === 0) {
    tbody.innerHTML = `<tr><td colspan="5" class="text-center" style="padding:32px;color:var(--on-surface-variant)">Nenhum produto cadastrado.</td></tr>`;
    return;
  }

  tbody.innerHTML = products.map(p => `
    <tr>
      <td><img src="assets/images/${p.image}" alt="${p.name}" onerror="this.src='assets/images/Imagem 1.jpg'"></td>
      <td>
        <div style="font-weight:700;color:var(--on-surface)">${p.name}</div>
        <div style="font-size:12px;color:var(--on-surface-variant)">${p.category}</div>
      </td>
      <td style="font-weight:700;color:var(--primary)">${formatCurrency(p.price)}</td>
      <td>
        <span class="chip ${p.type === 'pronta-entrega' ? 'chip-sent' : 'chip-producing'}">
          ${p.type === 'pronta-entrega' ? 'Pronta Entrega' : 'Sob Encomenda'}
        </span>
      </td>
      <td>
        <div class="table-actions">
          <button class="btn btn-secondary btn-sm btn-icon" onclick="adminEditProduct('${p.id}')" title="Editar">
            <span class="material-symbols-outlined" style="font-size:18px">edit</span>
          </button>
          <button class="btn btn-danger btn-sm btn-icon" onclick="adminDeleteProduct('${p.id}')" title="Excluir">
            <span class="material-symbols-outlined" style="font-size:18px">delete</span>
          </button>
        </div>
      </td>
    </tr>
  `).join("");
}

/* ─── RENDER PEDIDOS ─── */
function renderAdminOrders() {
  const tbody = document.getElementById("admin-orders-tbody");
  if (!tbody) return;

  if (orders.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" class="text-center" style="padding:32px;color:var(--on-surface-variant)">Nenhum pedido ainda.</td></tr>`;
    return;
  }

  tbody.innerHTML = orders.map(o => {
    const statusMap = {
      [STATUS.PENDING]:   "chip-pending",
      [STATUS.PRODUCING]: "chip-producing",
      [STATUS.SENT]:      "chip-sent",
      [STATUS.DELIVERED]: "chip-delivered",
      [STATUS.CANCELLED]: "chip-cancelled",
    };
    const chipClass = statusMap[o.status] || "chip-pending";
    const items = (o.items || []).map(i => `${i.quantity}x ${i.name}`).join(", ");

    return `
    <tr>
      <td><strong style="color:var(--primary)">#${o.orderId}</strong></td>
      <td>
        <div style="font-weight:600">${o.clientName}</div>
        <div style="font-size:12px;color:var(--on-surface-variant)">${o.clientPhone}</div>
      </td>
      <td style="font-size:13px;color:var(--on-surface-variant);max-width:200px">${items}</td>
      <td style="font-weight:700;color:var(--primary)">${formatCurrency(o.total || 0)}</td>
      <td><span class="chip ${chipClass}">${o.status}</span></td>
      <td>
        <div style="display:flex;gap:6px;flex-wrap:wrap">
          <button class="btn btn-sm" style="background:#fff0d6;color:#974e00;padding:6px 10px;" onclick="adminUpdateStatus('${o._docId || o.orderId}', '${STATUS.PRODUCING}')">Produzir</button>
          <button class="btn btn-sm" style="background:#d1e7dd;color:#0a5237;padding:6px 10px;" onclick="adminUpdateStatus('${o._docId || o.orderId}', '${STATUS.SENT}')">Enviar</button>
          <button class="btn btn-sm" style="background:#cfe2ff;color:#084298;padding:6px 10px;" onclick="adminUpdateStatus('${o._docId || o.orderId}', '${STATUS.DELIVERED}')">Entregue</button>
        </div>
      </td>
    </tr>`;
  }).join("");
}

/* ─── ATUALIZAR STATUS DO PEDIDO ─── */
window.adminUpdateStatus = async (docId, newStatus) => {
  try {
    await updateDoc(doc(db, "orders", docId), { status: newStatus });
    const o = orders.find(o => o._docId === docId || o.orderId === docId);
    if (o) o.status = newStatus;
  } catch {
    const local = JSON.parse(localStorage.getItem("faby_orders") || "[]");
    const o = local.find(o => o.orderId === docId);
    if (o) { o.status = newStatus; localStorage.setItem("faby_orders", JSON.stringify(local)); }
  }
  renderAdminOrders();
  renderStats();
  showToast("Status atualizado com sucesso!", "success");
};

/* ─── EDITAR PRODUTO ─── */
window.adminEditProduct = (id) => {
  const p = products.find(x => x.id === id);
  if (!p) return;
  editingProductId = id;
  document.getElementById("product-modal-title").textContent = "Editar Produto";
  document.getElementById("pf-id").value          = p.id;
  document.getElementById("pf-name").value        = p.name;
  document.getElementById("pf-price").value       = p.price;
  document.getElementById("pf-category").value    = p.category;
  document.getElementById("pf-type").value        = p.type;
  document.getElementById("pf-description").value = p.description || "";
  document.getElementById("pf-stock").value       = p.stock || 1;
  openModal("product-modal");
};

/* ─── DELETAR PRODUTO ─── */
window.adminDeleteProduct = async (id) => {
  if (!confirm("Tem certeza que deseja remover este produto?")) return;
  try {
    await deleteDoc(doc(db, "products", id));
  } catch {
    const local = JSON.parse(localStorage.getItem("faby_products") || "[]");
    localStorage.setItem("faby_products", JSON.stringify(local.filter(p => p.id !== id)));
  }
  products = products.filter(p => p.id !== id);
  renderAdminProducts();
  renderStats();
  showToast("Produto removido.", "info");
};

/* ─── SALVAR PRODUTO ─── */
async function saveProduct(formData) {
  const id      = editingProductId || genId("p");
  const imgFile = formData.get ? formData.get("image") : null;
  const extraFiles = formData.getAll ? formData.getAll("extraImages") : [];

  let imagePath    = "";
  let extraImages  = [];

  const existing = products.find(p => p.id === id);

  // Upload da capa
  if (imgFile && imgFile.size > 0) {
    try {
      const storageRef = ref(storage, `products/${id}/cover_${imgFile.name}`);
      await uploadBytes(storageRef, imgFile);
      imagePath = await getDownloadURL(storageRef);
    } catch {
      imagePath = imgFile.name; // fallback local
    }
  } else {
    imagePath = existing?.image || "Imagem 1.jpg";
  }

  // Upload das extras
  for (const f of extraFiles) {
    if (f.size === 0) continue;
    try {
      const storageRef = ref(storage, `products/${id}/extra_${f.name}`);
      await uploadBytes(storageRef, f);
      const url = await getDownloadURL(storageRef);
      extraImages.push(url);
    } catch {
      extraImages.push(f.name);
    }
  }
  if (extraImages.length === 0) extraImages = existing?.extraImages || [];

  const data = {
    id,
    name:        document.getElementById("pf-name").value.trim(),
    price:       parseFloat(document.getElementById("pf-price").value),
    category:    document.getElementById("pf-category").value.trim(),
    type:        document.getElementById("pf-type").value,
    description: document.getElementById("pf-description").value.trim(),
    stock:       parseInt(document.getElementById("pf-stock").value) || 1,
    image:       imagePath,
    extraImages,
  };

  try {
    await setDoc(doc(db, "products", id), data, { merge: true });
  } catch {
    const local = JSON.parse(localStorage.getItem("faby_products") || "[]");
    const idx = local.findIndex(p => p.id === id);
    if (idx >= 0) local[idx] = data; else local.push(data);
    localStorage.setItem("faby_products", JSON.stringify(local));
  }

  const idx = products.findIndex(p => p.id === id);
  if (idx >= 0) products[idx] = data; else products.push(data);

  closeModal("product-modal");
  renderAdminProducts();
  renderStats();
  showToast(`Produto "${data.name}" salvo com sucesso!`, "success");
  editingProductId = null;
}

/* ─── RELATÓRIOS ─── */
function renderReports() {
  const now    = new Date();
  const month  = now.getMonth();
  const year   = now.getFullYear();

  const monthOrders = orders.filter(o => {
    const d = new Date(o.createdAt || 0);
    return d.getMonth() === month && d.getFullYear() === year && o.status !== STATUS.CANCELLED;
  });

  const monthRev = monthOrders.reduce((s, o) => s + (o.total || 0), 0);

  const el = document.getElementById("reports-content");
  if (!el) return;

  const byStatus = {};
  Object.values(STATUS).forEach(s => { byStatus[s] = 0; });
  orders.forEach(o => { byStatus[o.status] = (byStatus[o.status] || 0) + 1; });

  el.innerHTML = `
    <div class="admin-stats-grid">
      <div class="stat-card">
        <div class="stat-card-icon" style="background:var(--primary-fixed)"><span class="material-symbols-outlined" style="color:var(--primary)">payments</span></div>
        <div class="stat-card-value">${formatCurrency(monthRev)}</div>
        <div class="stat-card-label">Faturamento do mês</div>
      </div>
      <div class="stat-card">
        <div class="stat-card-icon" style="background:#d1e7dd"><span class="material-symbols-outlined" style="color:#0a5237">shopping_bag</span></div>
        <div class="stat-card-value">${monthOrders.length}</div>
        <div class="stat-card-label">Pedidos no mês</div>
      </div>
    </div>
    <h3 style="font-family:var(--font-display);font-size:20px;color:var(--primary);margin-bottom:16px">Pedidos por Status</h3>
    <div style="display:flex;flex-direction:column;gap:10px">
      ${Object.entries(byStatus).filter(([,v]) => v > 0).map(([s, v]) => `
        <div style="display:flex;align-items:center;gap:16px">
          <span style="width:120px;font-size:13px;font-weight:600;color:var(--on-surface-variant)">${s}</span>
          <div style="flex:1;height:10px;background:var(--surface-container);border-radius:999px;overflow:hidden">
            <div style="height:100%;background:var(--primary);border-radius:999px;width:${Math.min(100,(v/orders.length)*100)}%"></div>
          </div>
          <span style="font-weight:700;color:var(--on-surface);min-width:24px">${v}</span>
        </div>
      `).join("")}
    </div>
  `;
}

/* ─── CONFIGURAÇÕES ─── */
function renderSettings() {
  const settings = JSON.parse(localStorage.getItem("faby_settings") || "{}");
  const el = document.getElementById("settings-content");
  if (!el) return;

  el.innerHTML = `
    <div style="display:flex;flex-direction:column;gap:20px;max-width:500px">
      <div class="form-group">
        <label class="form-label">WhatsApp da Loja (com DDD e código do país)</label>
        <input type="text" id="cfg-whatsapp" class="form-input" placeholder="5548999999999" value="${settings.whatsapp || localStorage.getItem('faby_whatsapp') || ''}">
      </div>
      <div class="form-group">
        <label class="form-label">Endereço da Loja</label>
        <input type="text" id="cfg-address" class="form-input" placeholder="Rua, N, Cidade" value="${settings.storeAddress || ''}">
      </div>
      <div class="form-group">
        <label class="form-label">Instagram</label>
        <input type="text" id="cfg-instagram" class="form-input" placeholder="@encantosdafaby" value="${settings.instagram || ''}">
      </div>
      <button class="btn btn-primary" onclick="saveSettings()">Salvar Configurações</button>
    </div>
  `;
}

window.saveSettings = () => {
  const s = {
    whatsapp:     document.getElementById("cfg-whatsapp")?.value.trim(),
    storeAddress: document.getElementById("cfg-address")?.value.trim(),
    instagram:    document.getElementById("cfg-instagram")?.value.trim(),
  };
  localStorage.setItem("faby_settings",  JSON.stringify(s));
  localStorage.setItem("faby_whatsapp",  s.whatsapp);
  showToast("Configurações salvas!", "success");
};

/* ─── BIND EVENTS ─── */
function bindEvents() {
  // Abas admin
  document.querySelectorAll(".admin-tab").forEach(tab => {
    tab.addEventListener("click", () => {
      document.querySelectorAll(".admin-tab").forEach(t => t.classList.remove("active"));
      tab.classList.add("active");
      const panel = tab.dataset.panel;
      document.querySelectorAll(".admin-panel").forEach(p => p.classList.add("hidden"));
      document.getElementById(`panel-${panel}`)?.classList.remove("hidden");
      if (panel === "reports")  renderReports();
      if (panel === "settings") renderSettings();
    });
  });

  // Botão novo produto
  document.getElementById("btn-new-product")?.addEventListener("click", () => {
    editingProductId = null;
    document.getElementById("product-crud-form")?.reset();
    document.getElementById("product-modal-title").textContent = "Novo Produto";
    document.getElementById("pf-id").value = "";
    openModal("product-modal");
  });

  // Form produto
  document.getElementById("product-crud-form")?.addEventListener("submit", async e => {
    e.preventDefault();
    const formData = new FormData(e.target);
    await saveProduct(formData);
  });
}
