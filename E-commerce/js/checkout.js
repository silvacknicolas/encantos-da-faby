/**
 * checkout.js — Fluxo de Checkout + Mercado Pago
 */

import { db }                  from "./firebase.js";
import { getUser }             from "./auth.js";
import { getCart, getTotal, clearCart } from "./cart.js";
import { showToast, formatCurrency, closeModal } from "./ui.js";
import {
  collection, addDoc
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// Public Key Mercado Pago (sandbox para testes)
const MP_PUBLIC_KEY = "TEST-1234567890"; // substituir pela chave real em produção

let mp = null;
let cardBrick = null;

/* ─── STATUS DO PEDIDO ─── */
const STATUS = {
  PENDING:    "Pendente",
  PRODUCING:  "Em Produção",
  SENT:       "Enviado",
  DELIVERED:  "Entregue",
  CANCELLED:  "Cancelado",
};

/* ─── INICIALIZAR CHECKOUT ─── */
export function initCheckout() {
  const form = document.getElementById("checkout-form");
  if (!form) return;

  // Preencher dados do usuário logado automaticamente
  const user = getUser();
  if (user) {
    const nameEl = document.getElementById("checkout-name");
    const addrEl = document.getElementById("checkout-address");
    if (nameEl && !nameEl.value) nameEl.value = user.name || "";
    if (addrEl && !addrEl.value) addrEl.value = user.address || "";
  }

  // Abas de pagamento
  document.querySelectorAll(".payment-tab").forEach(tab => {
    tab.addEventListener("click", () => {
      document.querySelectorAll(".payment-tab").forEach(t => t.classList.remove("active"));
      tab.classList.add("active");
      const method = tab.dataset.method;
      document.querySelectorAll(".payment-panel").forEach(p => p.classList.add("hidden"));
      document.getElementById(`payment-${method}`)?.classList.remove("hidden");

      if (method === "card" && !cardBrick) {
        initMercadoPago();
      }
    });
  });

  // Submissão do formulário
  form.addEventListener("submit", async e => {
    e.preventDefault();
    await submitOrder();
  });
}

/* ─── INICIALIZAR SDK MERCADO PAGO ─── */
async function initMercadoPago() {
  try {
    // Carregar SDK Mercado Pago dinamicamente
    if (!window.MercadoPago) {
      await loadScript("https://sdk.mercadopago.com/js/v2");
    }
    mp = new window.MercadoPago(MP_PUBLIC_KEY, { locale: "pt-BR" });

    const bricksBuilder = mp.bricks();
    cardBrick = await bricksBuilder.create("cardPayment", "mp-card-brick", {
      initialization: { amount: getTotal() },
      callbacks: {
        onReady: () => {},
        onSubmit: (cardData) => handleCardPayment(cardData),
        onError: (err) => { console.error(err); showToast("Erro no pagamento.", "error"); },
      },
      customization: {
        visual: { style: { theme: "flat" } },
        paymentMethods: { maxInstallments: 12 },
      },
    });
  } catch (e) {
    console.warn("Mercado Pago SDK não disponível:", e);
    showToast("Pagamento com cartão temporariamente indisponível. Use PIX.", "error");
  }
}

function loadScript(src) {
  return new Promise((resolve, reject) => {
    const s = document.createElement("script");
    s.src = src; s.onload = resolve; s.onerror = reject;
    document.head.appendChild(s);
  });
}

/* ─── PROCESSAR PEDIDO ─── */
async function submitOrder() {
  const submitBtn = document.getElementById("checkout-submit-btn");
  if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = "Processando..."; }

  const cart = getCart();
  if (cart.length === 0) {
    showToast("Carrinho vazio!", "error");
    if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = "Confirmar Pedido"; }
    return;
  }

  const user = getUser();
  const name    = document.getElementById("checkout-name")?.value.trim();
  const phone   = document.getElementById("checkout-phone")?.value.trim();
  const address = document.getElementById("checkout-address")?.value.trim();
  const cep     = document.getElementById("checkout-cep")?.value.trim();
  const city    = document.getElementById("checkout-city")?.value.trim();
  const state   = document.getElementById("checkout-state")?.value.trim();

  if (!name || !phone || !address || !city) {
    showToast("Preencha todos os campos obrigatórios.", "error");
    if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = "Confirmar Pedido"; }
    return;
  }

  const activeTab    = document.querySelector(".payment-tab.active");
  const paymentMethod = activeTab ? activeTab.dataset.method : "pix";

  const orderId = "EF" + Date.now().toString().slice(-6);
  const order = {
    orderId,
    clientUid:     user?.uid  || null,
    clientEmail:   user?.email || "anonimo@faby.com",
    clientName:    name,
    clientPhone:   phone,
    address:       `${address}, ${cep}, ${city}/${state}`,
    items:         [...cart],
    total:         getTotal(),
    paymentMethod: paymentMethod === "pix" ? "PIX" : "Cartão de Crédito",
    status:        STATUS.PENDING,
    createdAt:     new Date().toISOString(),
  };

  try {
    await addDoc(collection(db, "orders"), order);
  } catch (e) {
    // Fallback localStorage
    const local = JSON.parse(localStorage.getItem("faby_orders") || "[]");
    local.push(order);
    localStorage.setItem("faby_orders", JSON.stringify(local));
  }

  await clearCart();
  sendWhatsApp(order);
  showOrderSuccess(order);
}

async function handleCardPayment(cardData) {
  // Em produção: enviar cardData.token ao backend para processar via MP API
  console.log("Card payment data:", cardData);
  await submitOrder();
}

/* ─── SUCESSO ─── */
function showOrderSuccess(order) {
  const form    = document.getElementById("checkout-form-view");
  const success = document.getElementById("checkout-success-view");
  if (form)    form.classList.add("hidden");
  if (success) {
    success.classList.remove("hidden");
    const idEl = document.getElementById("success-order-id");
    if (idEl) idEl.textContent = order.orderId;
  }
  const closeBtn = document.getElementById("checkout-done-btn");
  closeBtn?.addEventListener("click", () => closeModal("checkout-modal"), { once: true });
}

/* ─── WHATSAPP ─── */
function sendWhatsApp(order) {
  // Número do WhatsApp da Fabíola (configurável no admin)
  const phone = localStorage.getItem("faby_whatsapp") || "5500000000000";
  const items = order.items.map(i => `• ${i.quantity}x ${i.name} — ${formatCurrency(i.price * i.quantity)}`).join("\n");
  const msg = `🌸 *NOVO PEDIDO — Encantos da Faby* 🌸\n\n*Pedido:* #${order.orderId}\n*Cliente:* ${order.clientName}\n*Tel:* ${order.clientPhone}\n*Endereço:* ${order.address}\n\n*Itens:*\n${items}\n\n*Total:* ${formatCurrency(order.total)}\n*Pagamento:* ${order.paymentMethod}`;
  const url = `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`;
  window.open(url, "_blank");
}

export { STATUS };
