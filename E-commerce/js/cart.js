/**
 * cart.js — Carrinho de Compras
 * Estado global do carrinho + renderização do drawer
 */

import { db }             from "./firebase.js";
import { getUser }        from "./auth.js";
import { showToast, formatCurrency, openModal } from "./ui.js";
import {
  doc, setDoc, getDoc, onSnapshot
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

let items     = [];      // { id, name, price, image, quantity }
let listeners = [];      // callbacks para mudanças no carrinho
let unsubCart = null;    // Firebase listener

/* ─── GETTERS ─── */
export const getCart   = () => items;
export const getTotal  = () => items.reduce((s, i) => s + i.price * i.quantity, 0);
export const getCount  = () => items.reduce((s, i) => s + i.quantity, 0);

/* ─── LISTENERS ─── */
export function onCartChange(cb) { listeners.push(cb); cb(items); }
function notify() { listeners.forEach(cb => cb(items)); }

/* ─── SINCRONIZAÇÃO FIREBASE ─── */
export async function initCart(uid) {
  if (unsubCart) { unsubCart(); unsubCart = null; }

  if (uid) {
    // Ouvir mudanças em tempo real no doc do carrinho do usuário
    const cartRef = doc(db, "carts", uid);
    const snap    = await getDoc(cartRef);
    if (snap.exists()) items = snap.data().items || [];
    notify();

    unsubCart = onSnapshot(cartRef, snap => {
      if (snap.exists()) { items = snap.data().items || []; notify(); }
    });
  } else {
    // Sem login: usar localStorage
    items = JSON.parse(localStorage.getItem("faby_cart") || "[]");
    notify();
  }
}

async function persist() {
  const user = getUser();
  if (user) {
    await setDoc(doc(db, "carts", user.uid), { items }, { merge: true });
  } else {
    localStorage.setItem("faby_cart", JSON.stringify(items));
  }
  notify();
}

/* ─── AÇÕES ─── */
export async function addToCart(product, quantity = 1) {
  const existing = items.find(i => i.id === product.id);
  if (existing) {
    existing.quantity += quantity;
  } else {
    items.push({
      id:       product.id,
      name:     product.name,
      price:    product.price,
      image:    product.image,
      quantity,
    });
  }
  await persist();
  showToast(`"${product.name}" adicionado ao carrinho!`, "success");
}

export async function removeFromCart(productId) {
  items = items.filter(i => i.id !== productId);
  await persist();
}

export async function updateQuantity(productId, qty) {
  const item = items.find(i => i.id === productId);
  if (!item) return;
  if (qty <= 0) { await removeFromCart(productId); return; }
  item.quantity = qty;
  await persist();
}

export async function clearCart() {
  items = [];
  await persist();
}

/* ─── DRAWER UI ─── */
export function renderCartDrawer() {
  const body    = document.getElementById("cart-body");
  const count   = document.getElementById("cart-count");
  const subtotal = document.getElementById("cart-subtotal");
  if (!body) return;

  const n = getCount();
  if (count) {
    count.textContent = n;
    count.classList.toggle("visible", n > 0);
  }

  if (items.length === 0) {
    body.innerHTML = `
      <div class="cart-empty">
        <span class="material-symbols-outlined">shopping_bag</span>
        <p>Seu carrinho está vazio</p>
        <a href="index.html#catalogo" class="btn btn-outline btn-sm" style="margin-top:16px">Explorar produtos</a>
      </div>`;
  } else {
    body.innerHTML = items.map(item => `
      <div class="cart-item">
        <img src="assets/images/${item.image}" alt="${item.name}" onerror="this.src='assets/images/Imagem 1.jpg'">
        <div class="cart-item-info">
          <div class="cart-item-name">${item.name}</div>
          <div class="cart-item-price">${formatCurrency(item.price)} cada</div>
          <div class="cart-item-qty">
            <button class="qty-btn" onclick="window.cartUpdateQty('${item.id}', ${item.quantity - 1})">
              <span class="material-symbols-outlined" style="font-size:16px">remove</span>
            </button>
            <span class="qty-value">${item.quantity}</span>
            <button class="qty-btn" onclick="window.cartUpdateQty('${item.id}', ${item.quantity + 1})">
              <span class="material-symbols-outlined" style="font-size:16px">add</span>
            </button>
          </div>
        </div>
        <button class="cart-remove" onclick="window.cartRemove('${item.id}')" title="Remover">
          <span class="material-symbols-outlined" style="font-size:20px">delete_outline</span>
        </button>
      </div>
    `).join("");
  }

  if (subtotal) subtotal.textContent = formatCurrency(getTotal());
}

// Expor funções ao window para uso nos onclick inline do drawer
window.cartUpdateQty = async (id, qty) => { await updateQuantity(id, qty); };
window.cartRemove    = async (id)       => { await removeFromCart(id); };

/* ─── INICIALIZAR DRAWER ─── */
export function initCartDrawer() {
  const overlay   = document.getElementById("cart-overlay");
  const drawer    = document.getElementById("cart-drawer");
  const openBtn   = document.getElementById("open-cart-btn");
  const closeBtn  = document.getElementById("close-cart-btn");
  const checkoutBtn = document.getElementById("cart-checkout-btn");

  const open  = () => { drawer?.classList.add("open"); overlay?.classList.add("open"); };
  const close = () => { drawer?.classList.remove("open"); overlay?.classList.remove("open"); };

  openBtn?.addEventListener("click",  open);
  closeBtn?.addEventListener("click", close);
  overlay?.addEventListener("click",  close);
  checkoutBtn?.addEventListener("click", () => {
    if (items.length === 0) { showToast("Adicione produtos ao carrinho primeiro!", "error"); return; }
    close();
    openModal("checkout-modal");
  });

  onCartChange(() => renderCartDrawer());
}
