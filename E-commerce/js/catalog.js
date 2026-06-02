/**
 * catalog.js — Catálogo de Produtos
 * Carrega produtos do Firestore, renderiza vitrine e detalhe.
 */

import { db }           from "./firebase.js";
import { addToCart }    from "./cart.js";
import { showToast, formatCurrency } from "./ui.js";
import {
  collection, getDocs, query, orderBy, setDoc, doc
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

let allProducts = [];
let activeFilter = "todos";
let showAll      = false;
const PAGE_SIZE  = 8;

/* ─── 32 PRODUTOS PADRÃO ─── */
const DEFAULT_PRODUCTS = [
  { id:"p01", name:"Bolsa Boho Fio de Malha",        price:180, category:"Moda & Acessórios",  image:"Imagem 1.jpg",  type:"pronta-entrega", stock:2, description:"Bolsa artesanal moderna com alça de corrente e forro interno de linho. Perfeita para o dia a dia.",                         extraImages:[] },
  { id:"p02", name:"Ursinho Teddy de Pelúcia",        price:120, category:"Mundo Infantil",     image:"Imagem 2.jpg",  type:"sob-encomenda",   stock:1, description:"Amigurumi fofinho tecido em fio de algodão hipoalergênico. Ideal para bebês.",                                               extraImages:[] },
  { id:"p03", name:"Manta Aconchego para Bebê",       price:195, category:"Mundo Infantil",     image:"Imagem 3.jpg",  type:"sob-encomenda",   stock:1, description:"Manta macia com tramas antialérgicas, perfeita para o berço. Disponível em diversas cores.",                                 extraImages:[] },
  { id:"p04", name:"Caminho de Mesa Rústico",          price:150, category:"Decoração & Lar",   image:"Imagem 4.jpg",  type:"pronta-entrega", stock:3, description:"Caminho de mesa trabalhado com detalhes de franja artesanal. Adiciona charme à sua mesa.",                                    extraImages:[] },
  { id:"p05", name:"Bolsa Clutch Malha Chic",          price:110, category:"Moda & Acessórios", image:"Imagem 5.jpg",  type:"pronta-entrega", stock:1, description:"Clutch elegante com fecho metálico e alça de mão de crochê. Ideal para eventos.",                                              extraImages:[] },
  { id:"p06", name:"Sousplat Classic (Jogo de 4)",     price:120, category:"Decoração & Lar",   image:"Imagem 6.jpg",  type:"sob-encomenda",   stock:1, description:"Jogo de sousplat em barbante de alta resistência para mesa posta.",                                                          extraImages:[] },
  { id:"p07", name:"Amigurumi Polvo Macio",            price:85,  category:"Mundo Infantil",    image:"Imagem 7.jpg",  type:"pronta-entrega", stock:4, description:"Polvinho de crochê para recém-nascidos, acalma e conforta com segurança.",                                                    extraImages:[] },
  { id:"p08", name:"Cachecol Outono Premium",          price:95,  category:"Moda & Acessórios", image:"Imagem 8.jpg",  type:"sob-encomenda",   stock:1, description:"Cachecol unissex com lã macia e tramas térmicas trançadas.",                                                                 extraImages:[] },
  { id:"p09", name:"Sapatinho Baby Rose",              price:65,  category:"Mundo Infantil",    image:"Imagem 9.jpg",  type:"pronta-entrega", stock:2, description:"Sapatinho de bebê delicado com fita de cetim regulável.",                                                                     extraImages:[] },
  { id:"p10", name:"Bolsa Praia Bali",                 price:220, category:"Moda & Acessórios", image:"Imagem 10.jpg", type:"pronta-entrega", stock:1, description:"Bolsa de praia grande em crochê rústico com alças trançadas resistentes.",                                                    extraImages:[] },
  { id:"p11", name:"Porta-Treco Boho",                 price:55,  category:"Decoração & Lar",   image:"Imagem 11.jpg", type:"pronta-entrega", stock:5, description:"Porta-treco em macramê para organizar com estilo.",                                                                           extraImages:[] },
  { id:"p12", name:"Gorro Inverno Tricot",             price:78,  category:"Moda & Acessórios", image:"Imagem 12.jpg", type:"pronta-entrega", stock:3, description:"Gorro confortável em tricot macio, disponível em cores neutras.",                                                             extraImages:[] },
  { id:"p13", name:"Centro de Mesa Floral",            price:135, category:"Decoração & Lar",   image:"Imagem 13.jpg", type:"sob-encomenda",   stock:1, description:"Centro de mesa artesanal com flores em crochê. Beleza única para sua casa.",                                                 extraImages:[] },
  { id:"p14", name:"Mochila Mini Boho",                price:195, category:"Moda & Acessórios", image:"Imagem 14.jpg", type:"pronta-entrega", stock:2, description:"Mochila mini em crochê com detalhe de franjas e alças ajustáveis.",                                                          extraImages:[] },
  { id:"p15", name:"Boneca Abayomi",                   price:90,  category:"Mundo Infantil",    image:"Imagem 15.jpg", type:"sob-encomenda",   stock:1, description:"Boneca afro em crochê, símbolo de amor e identidade. Feita à mão com carinho.",                                              extraImages:[] },
  { id:"p16", name:"Tapete Redondo Nórdico",           price:280, category:"Decoração & Lar",   image:"Imagem 16.jpg", type:"sob-encomenda",   stock:1, description:"Tapete redondo em fio de malha reciclado, estilo escandinavo.",                                                              extraImages:[] },
  { id:"p17", name:"Bolsa Tote Listrada",              price:165, category:"Moda & Acessórios", image:"Imagem 17.jpg", type:"pronta-entrega", stock:2, description:"Bolsa tote espaçosa com listras coloridas em fio de algodão.",                                                                extraImages:[] },
  { id:"p18", name:"Conjunto Bebê Urso",               price:145, category:"Mundo Infantil",    image:"Imagem 18.jpg", type:"sob-encomenda",   stock:1, description:"Conjunto de touca e sapatilha em crochê com tema de urso. Presente perfeito.",                                               extraImages:[] },
  { id:"p19", name:"Vasinho Macramê",                  price:48,  category:"Decoração & Lar",   image:"Imagem 19.jpg", type:"pronta-entrega", stock:6, description:"Vasinho em macramê para plantas pequenas. Traz vida e textura ao ambiente.",                                                  extraImages:[] },
  { id:"p20", name:"Brinco Crochê Flores",             price:35,  category:"Moda & Acessórios", image:"Imagem 20.jpg", type:"pronta-entrega", stock:8, description:"Brinco artesanal em crochê com flores delicadas. Leve e charmoso.",                                                          extraImages:[] },
  { id:"p21", name:"Almofada Crochet Boho",            price:110, category:"Decoração & Lar",   image:"Imagem 21.jpg", type:"sob-encomenda",   stock:1, description:"Almofada decorativa em crochê com enchimento de fibra siliconada.",                                                         extraImages:[] },
  { id:"p22", name:"Bolsa Envelope Natal",             price:85,  category:"Moda & Acessórios", image:"Imagem 22.jpg", type:"pronta-entrega", stock:3, description:"Bolsa envelope especial de Natal, tecida com fio festivo.",                                                                  extraImages:[] },
  { id:"p23", name:"Dinossauro Rex Amigurumi",         price:78,  category:"Mundo Infantil",    image:"Imagem 23.jpg", type:"pronta-entrega", stock:4, description:"Dinossauro rex em crochê, brinquedo seguro e fofo para crianças.",                                                           extraImages:[] },
  { id:"p24", name:"Jogo Americano (4 peças)",         price:68,  category:"Decoração & Lar",   image:"Imagem 24.jpg", type:"pronta-entrega", stock:3, description:"Conjunto de 4 joguinhos americanos em crochê com detalhes geométricos.",                                                     extraImages:[] },
  { id:"p25", name:"Tiara Romântica",                  price:28,  category:"Moda & Acessórios", image:"Imagem 25.jpg", type:"pronta-entrega", stock:10,description:"Tiara delicada com flores em crochê. Ideal para looks românticos.",                                                          extraImages:[] },
  { id:"p26", name:"Organizador de Gaveta",            price:52,  category:"Decoração & Lar",   image:"Imagem 26.jpg", type:"sob-encomenda",   stock:1, description:"Organizador artesanal de gaveta em crochê firme. Funcional e bonito.",                                                      extraImages:[] },
  { id:"p27", name:"Coelho da Páscoa Amigurumi",       price:95,  category:"Mundo Infantil",    image:"Imagem 27.jpg", type:"pronta-entrega", stock:2, description:"Coelho fofinho em crochê, perfeito para cestas e decoração de Páscoa.",                                                      extraImages:[] },
  { id:"p28", name:"Colar Macramê Boho",               price:42,  category:"Moda & Acessórios", image:"Imagem 28.jpg", type:"pronta-entrega", stock:5, description:"Colar artesanal em macramê com pedra natural.",                                                                              extraImages:[] },
  { id:"p29", name:"Enfeite de Porta Macramê",         price:88,  category:"Decoração & Lar",   image:"Imagem 29.jpg", type:"sob-encomenda",   stock:1, description:"Enfeite de porta em macramê com franjas e conta de madeira. Dá boas-vindas com estilo.",                                    extraImages:[] },
  { id:"p30", name:"Kit Chá de Bebê (6 itens)",        price:320, category:"Mundo Infantil",    image:"Imagem 30.jpg", type:"sob-encomenda",   stock:1, description:"Kit completo para chá de bebê: manta, sapatinhos, touca, babador, sonageiro e mordedor.",                                   extraImages:[] },
  { id:"p31", name:"Cesta de Vime Decorativa",         price:175, category:"Decoração & Lar",   image:"Imagem 31.jpg", type:"sob-encomenda",   stock:1, description:"Cesta artesanal de palha e crochê para decoração ou organização.",                                                          extraImages:[] },
  { id:"p32", name:"Bolsa de Couro Crochê",            price:350, category:"Moda & Acessórios", image:"Imagem 32.png", type:"sob-encomenda",   stock:1, description:"Bolsa premium combinando couro vegano e crochê artesanal. Peça exclusiva de alto valor.",                                   extraImages:[] },
];

/* ─── INICIALIZAR PRODUTOS ─── */
export async function initProducts() {
  try {
    const snap = await getDocs(query(collection(db, "products"), orderBy("name")));
    if (snap.empty) {
      // Seed inicial
      for (const p of DEFAULT_PRODUCTS) {
        await setDoc(doc(db, "products", p.id), p);
      }
      allProducts = [...DEFAULT_PRODUCTS];
    } else {
      allProducts = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    }
  } catch (e) {
    console.warn("Firestore offline — usando produtos locais.", e);
    allProducts = JSON.parse(localStorage.getItem("faby_products") || "null") || [...DEFAULT_PRODUCTS];
  }
  window._fabyProducts = allProducts;
  return allProducts;
}

export function getAllProducts() { return allProducts; }
export function getProductById(id) { return allProducts.find(p => p.id === id); }

/* ─── RENDERIZAR VITRINE ─── */
export function renderCatalog() {
  const grid    = document.getElementById("products-grid");
  const viewBtn = document.getElementById("view-all-btn");
  if (!grid) return;

  let list = activeFilter === "todos"
    ? [...allProducts]
    : allProducts.filter(p => p.type === activeFilter);

  // Filtro de pesquisa (definido pelo input de busca no index.html)
  const query = (window.__searchQuery || "").trim().toLowerCase();
  if (query) {
    list = list.filter(p =>
      p.name.toLowerCase().includes(query) ||
      (p.category || "").toLowerCase().includes(query) ||
      (p.description || "").toLowerCase().includes(query)
    );
  }

  const shown = showAll ? list : list.slice(0, PAGE_SIZE);

  if (list.length === 0) {
    grid.innerHTML = `<div class="empty-state" style="grid-column:1/-1"><span class="material-symbols-outlined">search_off</span><h3>Nenhum produto encontrado</h3><p style="margin-top:8px;color:var(--on-surface-variant)">Tente outro termo ou limpe a busca.</p></div>`;
    if (viewBtn) viewBtn.style.display = "none";
    return;
  }

  grid.innerHTML = shown.map((p, i) => buildProductCard(p, i)).join("");

  if (viewBtn) {
    viewBtn.style.display = list.length <= PAGE_SIZE || showAll ? "none" : "flex";
  }
}


function buildProductCard(p, i) {
  const badgeHtml = p.type === "pronta-entrega"
    ? `<span class="product-card-badge badge-ready">Pronta Entrega</span>`
    : `<span class="product-card-badge badge-order">Sob Encomenda</span>`;

  // Alternar shapes do bento grid
  const shapes = ["arch-sm", "arch-md", "", "arch-lg"];
  const shape  = shapes[i % 4];

  return `
  <div class="product-card">
    <a href="produto.html?id=${p.id}" class="product-card-img-wrap ${shape}" style="aspect-ratio:3/4; display:block;">
      <img src="assets/images/${p.image}" alt="${p.name}" loading="lazy" onerror="this.src='assets/images/Imagem 1.jpg'">
      <div class="product-card-overlay">
        <span style="background:rgba(255,248,246,.95); color:var(--primary); padding:8px 20px; border-radius:999px; font-weight:700; font-size:13px; letter-spacing:.06em; text-transform:uppercase;">Ver produto</span>
      </div>
      ${badgeHtml}
    </a>
    <div class="product-card-info">
      <div class="product-card-name">${p.name}</div>
      <div class="product-card-price">${formatCurrency(p.price)}</div>
      <button class="btn btn-secondary btn-sm" style="margin-top:12px;width:100%;" onclick="window.quickAddToCart('${p.id}')">
        <span class="material-symbols-outlined" style="font-size:16px">add_shopping_cart</span> Adicionar
      </button>
    </div>
  </div>`;
}

/* ─── FILTROS ─── */
export function initFilters() {
  document.querySelectorAll(".filter-tab").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".filter-tab").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      activeFilter = btn.dataset.filter;
      showAll      = false;
      renderCatalog();
    });
  });

  const viewBtn = document.getElementById("view-all-btn");
  viewBtn?.addEventListener("click", () => { showAll = true; renderCatalog(); });
}

/* ─── QUICK ADD (global) ─── */
window.quickAddToCart = async (productId) => {
  const p = getProductById(productId);
  if (!p) return;
  await addToCart(p, 1);
};
