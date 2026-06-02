/**
 * ui.js — Utilitários de Interface
 * Toast, modais, helpers DOM usados por todos os módulos
 */

/* ─── TOAST ─── */
let toastContainer = null;
function getToastContainer() {
  if (!toastContainer) {
    toastContainer = document.createElement("div");
    toastContainer.className = "toast-container";
    document.body.appendChild(toastContainer);
  }
  return toastContainer;
}

export function showToast(message, type = "info", duration = 3500) {
  const el = document.createElement("div");
  el.className = `toast toast-${type}`;
  const icon = type === "success" ? "check_circle" : type === "error" ? "error" : "info";
  el.innerHTML = `<span class="material-symbols-outlined">${icon}</span> ${message}`;
  getToastContainer().appendChild(el);
  requestAnimationFrame(() => { el.classList.add("show"); });
  setTimeout(() => {
    el.classList.remove("show");
    setTimeout(() => el.remove(), 300);
  }, duration);
}

/* ─── MODAL ─── */
const openModals = new Set();

export function openModal(id) {
  const el = document.getElementById(id);
  if (!el) return;
  el.classList.add("open");
  openModals.add(id);
  document.body.style.overflow = "hidden";
}

export function closeModal(id) {
  const el = document.getElementById(id);
  if (!el) return;
  el.classList.remove("open");
  openModals.delete(id);
  if (openModals.size === 0) document.body.style.overflow = "";
}

export function closeAllModals() {
  openModals.forEach(id => closeModal(id));
}

// Fechar ao clicar no overlay
document.addEventListener("click", e => {
  if (e.target.classList.contains("modal-overlay")) {
    closeModal(e.target.id);
  }
});

// Fechar com ESC
document.addEventListener("keydown", e => {
  if (e.key === "Escape" && openModals.size > 0) {
    const last = [...openModals].pop();
    closeModal(last);
  }
});

/* ─── ACCORDION ─── */
export function initAccordions(container = document) {
  container.querySelectorAll(".accordion-trigger").forEach(btn => {
    btn.addEventListener("click", () => {
      const content = btn.nextElementSibling;
      const isOpen  = content.classList.contains("open");
      btn.classList.toggle("open", !isOpen);
      content.classList.toggle("open", !isOpen);
    });
  });
}

/* ─── CARROSSEL ─── */
export function initCarousel(trackEl, dotsEl) {
  if (!trackEl) return;
  let current = 0;
  const items = trackEl.children;
  const total = items.length;
  const dots  = dotsEl ? [...dotsEl.children] : [];

  function go(n) {
    current = (n + total) % total;
    trackEl.style.transform = `translateX(-${current * 100}%)`;
    dots.forEach((d, i) => d.classList.toggle("active", i === current));
  }

  return { go, next: () => go(current + 1), prev: () => go(current - 1) };
}

/* ─── UPLOAD PREVIEW ─── */
export function setupImageUpload(inputEl, previewContainer, mainPreviewEl) {
  if (!inputEl) return;
  inputEl.addEventListener("change", () => {
    const files = [...inputEl.files];
    if (previewContainer) {
      previewContainer.innerHTML = "";
      files.forEach(file => {
        const reader = new FileReader();
        reader.onload = e => {
          const img = document.createElement("img");
          img.className = "upload-thumb";
          img.src = e.target.result;
          previewContainer.appendChild(img);
        };
        reader.readAsDataURL(file);
      });
    }
    if (mainPreviewEl && files[0]) {
      const reader = new FileReader();
      reader.onload = e => {
        mainPreviewEl.src = e.target.result;
        mainPreviewEl.classList.remove("hidden");
      };
      reader.readAsDataURL(files[0]);
    }
  });
}

/* ─── FORMATAR MOEDA ─── */
export function formatCurrency(value) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
}

/* ─── FORMATAR DATA ─── */
export function formatDate(iso) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

/* ─── ID GERADOR ─── */
export function genId(prefix = "id") {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2,7)}`;
}
