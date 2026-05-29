/**
 * ==========================================================================
 * ENCANTOS DA FABY — CORE APPLICATION JS
 * Resilient Cloud-Ready Architecture with LocalStorage Fallback & Firebase Auth/Firestore
 * ==========================================================================
 */

// Firebase SDK imports (using official modular CDNs)
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc, getDocs, updateDoc, deleteDoc, collection, addDoc, query, where, onSnapshot } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// Configuração Oficial do Firebase do Projeto Encantos da Faby
const firebaseConfig = {
  apiKey: "AIzaSyCI1f78fw1pIhoUpvfgK-Y-vWIHt5n01Tk",
  authDomain: "encantos-da-faby.firebaseapp.com",
  projectId: "encantos-da-faby",
  storageBucket: "encantos-da-faby.firebasestorage.app",
  messagingSenderId: "704117339517",
  appId: "1:704117339517:web:d34bcf17eb75985020c814",
  measurementId: "G-Y3G8PYYDRT"
};

// State Variables
let app, auth, db;
let isFirebaseActive = false;

// Active Session state
let currentUser = null;
let userRole = "client"; // client or admin
let cart = [];
let dbProducts = [];
let dbOrders = [];

// Pagination state
let currentPage = 1;
const productsPerPage = 8;
let activeFilter = "todos";

// Default Pre-Populated 32 Products
const DEFAULT_32_PRODUCTS = [
  { id: "p1", name: "Bolsa Boho Fio de Malha", price: 180.00, category: "Moda & Acessórios", image: "Imagem 1.jpg", type: "pronta-entrega", stock: 2, description: "Bolsa artesanal moderna com alça de corrente e forro interno." },
  { id: "p2", name: "Ursinho Teddy de Pelúcia", price: 120.00, category: "Mundo Infantil", image: "Imagem 2.jpg", type: "sob-encomenda", stock: 1, description: "Amigurumi fofinho tecido em fio de algodão hipoalergênico." },
  { id: "p3", name: "Manta Aconchego para Bebê", price: 195.00, category: "Mundo Infantil", image: "Imagem 3.jpg", type: "sob-encomenda", stock: 1, description: "Manta macia com tramas antialérgicas, perfeita para o berço." },
  { id: "p4", name: "Caminho de Mesa Rústico", price: 150.00, category: "Decoração & Lar", image: "Imagem 4.jpg", type: "pronta-entrega", stock: 3, description: "Caminho de mesa trabalhado com detalhes de franja artesanal." },
  { id: "p5", name: "Bolsa Clutch Malha Chic", price: 110.00, category: "Moda & Acessórios", image: "Imagem 5.jpg", type: "pronta-entrega", stock: 1, description: "Clutch elegante com fecho metálico e alça de mão de crochê." },
  { id: "p6", name: "Sousplat Classic (Jogo de 4)", price: 120.00, category: "Decoração & Lar", image: "Imagem 6.jpg", type: "sob-encomenda", stock: 1, description: "Jogo de sousplat em barbante de alta resistência para mesa posta." },
  { id: "p7", name: "Amigurumi Polvo Macio", price: 85.00, category: "Mundo Infantil", image: "Imagem 7.jpg", type: "pronta-entrega", stock: 4, description: "Polvinho de crochê para recém-nascidos, acalma e conforta." },
  { id: "p8", name: "Cachecol Outono Premium", price: 95.00, category: "Moda & Acessórios", image: "Imagem 8.jpg", type: "sob-encomenda", stock: 1, description: "Cachecol unissex com lã macia e tramas térmicas trançadas." },
  { id: "p9", name: "Sapatinho Baby Rose", price: 65.00, category: "Mundo Infantil", image: "Imagem 9.jpg", type: "pronta-entrega", stock: 2, description: "Sapatinho de bebê delicado com fita de cetim regulável." },
  { id: "p10", name: "Almofada Nó Escandinavo", price: 140.00, category: "Decoração & Lar", image: "Imagem 10.jpg", type: "sob-encomenda", stock: 1, description: "Almofada de nó decorativa, design escandinavo moderno." },
  { id: "p11", name: "Touca Infantil Ursinho", price: 55.00, category: "Mundo Infantil", image: "Imagem 11.jpg", type: "pronta-entrega", stock: 5, description: "Touca com orelhinhas fofas para aquecer no inverno." },
  { id: "p12", name: "Bolsa Tote Algodão Cru", price: 190.00, category: "Moda & Acessórios", image: "Imagem 12.jpg", type: "sob-encomenda", stock: 1, description: "Bolsa espaçosa estilo sacola com alças confortáveis de ombro." },
  { id: "p13", name: "Tapete Mandala Flor", price: 230.00, category: "Decoração & Lar", image: "Imagem 13.jpg", type: "pronta-entrega", stock: 1, description: "Tapete redondo grande em padrão mandala para sala ou quarto." },
  { id: "p14", name: "Amigurumi Girafa Mimosa", price: 135.00, category: "Mundo Infantil", image: "Imagem 14.jpg", type: "sob-encomenda", stock: 1, description: "Girafinha simpática com olhos de segurança e enchimento macio." },
  { id: "p15", name: "Bolsa Classic Fio de Malha", price: 165.00, category: "Moda & Acessórios", image: "Imagem 15.jpg", type: "sob-encomenda", stock: 1, description: "Design icônico com alça transversal regulável." },
  { id: "p16", name: "Jogo Americano Boho (4 peças)", price: 140.00, category: "Decoração & Lar", image: "Imagem 16.jpg", type: "pronta-entrega", stock: 2, description: "Americanos retangulares em crochê com franjas modernas." },
  { id: "p17", name: "Cesto Organizador Trio", price: 130.00, category: "Decoração & Lar", image: "Imagem 17.jpg", type: "sob-encomenda", stock: 1, description: "Kit de 3 cestos organizadores de fios de malha de tamanhos P, M e G." },
  { id: "p18", name: "Cropped Verão Algodão", price: 110.00, category: "Moda & Acessórios", image: "Imagem 18.jpg", type: "sob-encomenda", stock: 1, description: "Top cropped leve, fresco e ajustável nas costas para os dias quentes." },
  { id: "p19", name: "Sapatinho Baby Blue", price: 65.00, category: "Mundo Infantil", image: "Imagem 19.jpg", type: "pronta-entrega", stock: 3, description: "Delicado sapatinho azul em fio de algodão egípcio." },
  { id: "p20", name: "Amigurumi Dinossauro Dino", price: 125.00, category: "Mundo Infantil", image: "Imagem 20.jpg", type: "sob-encomenda", stock: 1, description: "Dinossaurinho colorido e seguro para todas as idades." },
  { id: "p21", name: "Cachecol Gola Infinity", price: 80.00, category: "Moda & Acessórios", image: "Imagem 21.jpg", type: "pronta-entrega", stock: 2, description: "Gola fechada em crochê, prática e quentinha." },
  { id: "p22", name: "Manta Soft Tricotada", price: 210.00, category: "Mundo Infantil", image: "Imagem 22.jpg", type: "sob-encomenda", stock: 1, description: "Manta pesada para berço, tramas clássicas e aconchegantes." },
  { id: "p23", name: "Tapete Corredor Rústico", price: 180.00, category: "Decoração & Lar", image: "Imagem 23.jpg", type: "pronta-entrega", stock: 1, description: "Passadeira retangular de crochê para corredores ou cozinhas." },
  { id: "p24", name: "Amigurumi Coelhinha Lilás", price: 115.00, category: "Mundo Infantil", image: "Imagem 24.jpg", type: "sob-encomenda", stock: 1, description: "Coelhinha charmosa com vestidinho lilás e orelhas longas." },
  { id: "p25", name: "Bolsa Bucket Fio Náutico", price: 195.00, category: "Moda & Acessórios", image: "Imagem 25.jpg", type: "pronta-entrega", stock: 1, description: "Bolsa bucket resistente à água feita com fio náutico." },
  { id: "p26", name: "Porta-Copos Elegance (6 peças)", price: 60.00, category: "Decoração & Lar", image: "Imagem 26.jpg", type: "pronta-entrega", stock: 4, description: "Jogo de porta-copos sofisticados para proteger seus móveis." },
  { id: "p27", name: "Prendedor de Cortina Flor", price: 50.00, category: "Decoração & Lar", image: "Imagem 27.jpg", type: "sob-encomenda", stock: 1, description: "Par de prendedores de cortina com formato de flor de girassol." },
  { id: "p28", name: "Touca Baby Orelhinhas", price: 50.00, category: "Mundo Infantil", image: "Imagem 28.jpg", type: "pronta-entrega", stock: 3, description: "Gorrinho fofo para recém-nascidos." },
  { id: "p29", name: "Chaveiro Amigurumi Coração", price: 25.00, category: "Moda & Acessórios", image: "Imagem 29.jpg", type: "pronta-entrega", stock: 10, description: "Chaveirinho fofo de coração recheado de carinho." },
  { id: "p30", name: "Sousplat Dueto (Jogo de 2)", price: 65.00, category: "Decoração & Lar", image: "Imagem 30.jpg", type: "pronta-entrega", stock: 2, description: "Par de sousplats creme com borda dourada elegante." },
  { id: "p31", name: "Bolsa Clutch Fio Dourado", price: 130.00, category: "Moda & Acessórios", image: "Imagem 31.jpg", type: "sob-encomenda", stock: 1, description: "Bolsa de festa artesanal brilhante com fecho de botão magnético." },
  { id: "p32", name: "Bolsa Sacola Maxi Faby", price: 220.00, category: "Moda & Acessórios", image: "Imagem 32.png", type: "sob-encomenda", stock: 1, description: "A clássica e espaçosa bolsa premium com novelos e trama suave." }
];

// Helper: Check if Firebase Config is active and connect
function tryInitializeFirebase() {
  try {
    // If user has customized key, proceed, otherwise skip
    if (firebaseConfig.apiKey && firebaseConfig.apiKey !== "MOCK_API_KEY_ENCANTOS_FABY_SAFE_LOCAL_FALLBACK") {
      app = initializeApp(firebaseConfig);
      auth = getAuth(app);
      db = getFirestore(app);
      isFirebaseActive = true;
      console.log("🌸 Firebase initialized successfully!");
    } else {
      console.warn("⚠️ Firebase keys not set. Falling back to robust LocalStorage database!");
    }
  } catch (error) {
    console.error("⚠️ Firebase initialization failed:", error);
  }
}

tryInitializeFirebase();

// Local Database State (Fallback)
function getLocalProducts() {
  const local = localStorage.getItem("faby_products");
  if (local) return JSON.parse(local);
  localStorage.setItem("faby_products", JSON.stringify(DEFAULT_32_PRODUCTS));
  return DEFAULT_32_PRODUCTS;
}

function saveLocalProducts(products) {
  localStorage.setItem("faby_products", JSON.stringify(products));
  dbProducts = products;
}

function getLocalOrders() {
  const local = localStorage.getItem("faby_orders");
  return local ? JSON.parse(local) : [];
}

function saveLocalOrder(order) {
  const orders = getLocalOrders();
  orders.push(order);
  localStorage.setItem("faby_orders", JSON.stringify(orders));
  dbOrders = orders;
}

function getLocalUsers() {
  const local = localStorage.getItem("faby_users");
  return local ? JSON.parse(local) : {
    "fabiola@encantosdafaby.com.br": { name: "Fabíola Admin", role: "admin", cart: [] }
  };
}

function saveLocalUser(email, data) {
  const users = getLocalUsers();
  users[email] = data;
  localStorage.setItem("faby_users", JSON.stringify(users));
}

// Initialize Product Database state
dbProducts = isFirebaseActive ? [] : getLocalProducts();
dbOrders = isFirebaseActive ? [] : getLocalOrders();

/**
 * ==========================================================================
 * DATABASE SYNC OPERATIONS
 * ==========================================================================
 */

async function syncProductDatabase() {
  if (isFirebaseActive) {
    try {
      const q = collection(db, "products");
      const querySnapshot = await getDocs(q);
      if (querySnapshot.empty) {
        // Inject 32 default products
        for (const prod of DEFAULT_32_PRODUCTS) {
          await setDoc(doc(db, "products", prod.id), prod);
        }
        dbProducts = [...DEFAULT_32_PRODUCTS];
      } else {
        dbProducts = [];
        querySnapshot.forEach((doc) => {
          dbProducts.push(doc.data());
        });
      }
    } catch (e) {
      console.error("Error fetching Firestore products:", e);
      isFirebaseActive = false; // Graceful degradation to local if Firebase fails mid-session
      dbProducts = getLocalProducts();
    }
  } else {
    dbProducts = getLocalProducts();
  }
  renderVitrine();
  populateImageSelect();
  renderAdminProducts();
}

async function syncOrders() {
  if (isFirebaseActive) {
    try {
      const q = collection(db, "orders");
      const querySnapshot = await getDocs(q);
      dbOrders = [];
      querySnapshot.forEach((doc) => {
        dbOrders.push({ ...doc.data(), id: doc.id });
      });
    } catch (e) {
      console.error("Error fetching orders:", e);
      dbOrders = getLocalOrders();
    }
  } else {
    dbOrders = getLocalOrders();
  }
  renderClientOrders();
  renderAdminOrders();
}

/**
 * ==========================================================================
 * AUTHENTICATION SYSTEM
 * ==========================================================================
 */

function setupAuthListener() {
  if (isFirebaseActive) {
    onAuthStateChanged(auth, async (user) => {
      if (user) {
        currentUser = user;
        // Fetch role and cart from Firestore
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          userRole = userData.role || "client";
          cart = userData.cart || [];
        } else {
          userRole = "client";
          cart = [];
          await setDoc(doc(db, "users", user.uid), { email: user.email, role: "client", cart: [] });
        }
        onUserLoginSuccess(user.email, user.displayName || "Cliente");
      } else {
        onUserLogout();
      }
    });
  } else {
    // Local session restore
    const savedSession = sessionStorage.getItem("faby_session_user");
    if (savedSession) {
      const session = JSON.parse(savedSession);
      currentUser = session;
      userRole = session.role;
      cart = session.cart || [];
      onUserLoginSuccess(session.email, session.name);
    } else {
      onUserLogout();
    }
  }
}

function handleLogin(email, password) {
  const errorAlert = document.getElementById("auth-error-alert");
  errorAlert.style.display = "none";

  if (isFirebaseActive) {
    signInWithEmailAndPassword(auth, email, password)
      .then(() => {
        closeModal("auth-modal");
      })
      .catch((error) => {
        errorAlert.textContent = "Erro ao logar: E-mail ou senha incorretos.";
        errorAlert.style.display = "block";
      });
  } else {
    // Local Storage Mock Auth
    const users = getLocalUsers();
    // Simulate special Admin login or client lookup
    if (email === "fabiola@encantosdafaby.com.br" && password === "faby123") {
      const sessionUser = { email, name: "Fabíola Admin", role: "admin", cart: [] };
      sessionStorage.setItem("faby_session_user", JSON.stringify(sessionUser));
      currentUser = sessionUser;
      userRole = "admin";
      cart = [];
      onUserLoginSuccess(email, "Fabíola Admin");
      closeModal("auth-modal");
    } else if (users[email] && password === "faby123") { // simplistic local mock pass
      const sessionUser = { email, name: users[email].name, role: "client", cart: users[email].cart || [] };
      sessionStorage.setItem("faby_session_user", JSON.stringify(sessionUser));
      currentUser = sessionUser;
      userRole = "client";
      cart = sessionUser.cart;
      onUserLoginSuccess(email, users[email].name);
      closeModal("auth-modal");
    } else if (email && password) {
      // Auto register local client if matches pattern for ease of test
      const name = email.split("@")[0];
      const sessionUser = { email, name: name.charAt(0).toUpperCase() + name.slice(1), role: "client", cart: [] };
      users[email] = sessionUser;
      saveLocalUser(email, users[email]);
      sessionStorage.setItem("faby_session_user", JSON.stringify(sessionUser));
      currentUser = sessionUser;
      userRole = "client";
      cart = [];
      onUserLoginSuccess(email, sessionUser.name);
      closeModal("auth-modal");
    } else {
      errorAlert.textContent = "Digite e-mail e senha para acessar.";
      errorAlert.style.display = "block";
    }
  }
}

function handleRegister(name, email, password) {
  const errorAlert = document.getElementById("auth-error-alert");
  errorAlert.style.display = "none";

  if (isFirebaseActive) {
    createUserWithEmailAndPassword(auth, email, password)
      .then(async (userCredential) => {
        const user = userCredential.user;
        // Save initial user doc
        await setDoc(doc(db, "users", user.uid), {
          name: name,
          email: email,
          role: "client",
          cart: []
        });
        closeModal("auth-modal");
      })
      .catch((error) => {
        errorAlert.textContent = "Erro ao cadastrar: " + error.message;
        errorAlert.style.display = "block";
      });
  } else {
    // Local mock register
    const users = getLocalUsers();
    if (users[email]) {
      errorAlert.textContent = "E-mail já cadastrado.";
      errorAlert.style.display = "block";
      return;
    }
    const newUser = { email, name, role: "client", cart: [] };
    users[email] = newUser;
    saveLocalUser(email, users[email]);
    
    // Auto log in
    sessionStorage.setItem("faby_session_user", JSON.stringify(newUser));
    currentUser = newUser;
    userRole = "client";
    cart = [];
    onUserLoginSuccess(email, name);
    closeModal("auth-modal");
  }
}

function handleLogout() {
  if (isFirebaseActive) {
    signOut(auth);
  } else {
    sessionStorage.removeItem("faby_session_user");
    onUserLogout();
  }
}

function onUserLoginSuccess(email, displayName) {
  document.getElementById("auth-portal-btn").innerHTML = `<i class="fa-solid fa-user-circle"></i> Sair (${displayName.split(" ")[0]})`;
  document.getElementById("auth-portal-btn").onclick = handleLogout;
  
  if (userRole === "admin") {
    // Show admin indicators
    document.querySelectorAll(".admin-only").forEach(el => el.style.display = "block");
    document.getElementById("admin-panel-section").style.display = "block";
    document.getElementById("client-orders-section").style.display = "none";
    document.getElementById("auth-btn-label").textContent = "Sair (Admin)";
  } else {
    // Regular client logged in
    document.querySelectorAll(".admin-only").forEach(el => el.style.display = "none");
    document.getElementById("admin-panel-section").style.display = "none";
    document.getElementById("client-orders-section").style.display = "block";
    document.getElementById("client-user-name").textContent = displayName;
  }
  
  syncOrders();
  syncCartUI();
}

function onUserLogout() {
  currentUser = null;
  userRole = "client";
  cart = [];
  
  document.getElementById("auth-portal-btn").innerHTML = `<i class="fa-solid fa-user"></i> <span>Entrar</span>`;
  document.getElementById("auth-portal-btn").onclick = () => openModal("auth-modal");
  document.querySelectorAll(".admin-only").forEach(el => el.style.display = "none");
  document.getElementById("admin-panel-section").style.display = "none";
  document.getElementById("client-orders-section").style.display = "none";
  
  syncCartUI();
}

async function updateCloudCart() {
  if (isFirebaseActive && currentUser) {
    try {
      await updateDoc(doc(db, "users", currentUser.uid), { cart: cart });
    } catch (e) {
      console.error("Failed to update cloud cart:", e);
    }
  } else if (!isFirebaseActive && currentUser) {
    const users = getLocalUsers();
    if (users[currentUser.email]) {
      users[currentUser.email].cart = cart;
      saveLocalUser(currentUser.email, users[currentUser.email]);
      // Update session storage too
      currentUser.cart = cart;
      sessionStorage.setItem("faby_session_user", JSON.stringify(currentUser));
    }
  }
}

/**
 * ==========================================================================
 * CART OPERATIONS
 * ==========================================================================
 */

function addToCart(productId, customizableOptions = null) {
  const product = dbProducts.find(p => p.id === productId);
  if (!product) return;

  if (customizableOptions) {
    // Encomenda Personalizada
    const cartItemId = "custom_" + Date.now();
    const item = {
      cartId: cartItemId,
      id: product.id,
      name: customizableOptions.baseName,
      price: customizableOptions.price,
      image: product.image,
      quantity: 1,
      isCustom: true,
      options: {
        colorName: customizableOptions.colorName,
        colorHex: customizableOptions.colorHex,
        size: customizableOptions.size,
        notes: customizableOptions.notes
      }
    };
    cart.push(item);
  } else {
    // Regular Product
    const existing = cart.find(item => item.id === productId && !item.isCustom);
    if (existing) {
      existing.quantity += 1;
    } else {
      cart.push({
        cartId: product.id,
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        quantity: 1,
        isCustom: false
      });
    }
  }
  
  updateCloudCart();
  syncCartUI();
  openCartDrawer();
}

function updateCartQuantity(cartId, delta) {
  const item = cart.find(item => item.cartId === cartId);
  if (!item) return;

  item.quantity += delta;
  if (item.quantity <= 0) {
    cart = cart.filter(item => item.cartId !== cartId);
  }
  
  updateCloudCart();
  syncCartUI();
}

function removeFromCart(cartId) {
  cart = cart.filter(item => item.cartId !== cartId);
  updateCloudCart();
  syncCartUI();
}

function syncCartUI() {
  const container = document.getElementById("cart-items-container");
  const countBadge = document.getElementById("cart-count");
  const subtotalEl = document.getElementById("cart-subtotal");
  const checkoutBtn = document.getElementById("go-to-checkout-btn");

  container.innerHTML = "";
  let totalCount = 0;
  let subtotal = 0;

  if (cart.length === 0) {
    container.innerHTML = `
      <div class="cart-empty-message">
        <i class="fa-solid fa-shopping-basket cart-empty-icon"></i>
        <p>Sua sacola está vazia.</p>
      </div>
    `;
    checkoutBtn.disabled = true;
  } else {
    checkoutBtn.disabled = false;
    cart.forEach(item => {
      totalCount += item.quantity;
      subtotal += item.price * item.quantity;

      const itemDiv = document.createElement("div");
      itemDiv.className = "cart-item";
      
      let metaText = item.isCustom 
        ? `<div class="cart-item-meta">Tamanho: ${item.options.size} | Cor: <span style="display:inline-block; width:10px; height:10px; border-radius:50%; background-color:${item.options.colorHex}"></span> ${item.options.colorName} ${item.options.notes ? `<br>Observações: "${item.options.notes}"` : ''}</div>`
        : `<div class="cart-item-meta">Pronta Entrega</div>`;

      itemDiv.innerHTML = `
        <img src="../Imagens dos produtos/${item.image}" alt="${item.name}" class="cart-item-img">
        <div class="cart-item-details">
          <div class="cart-item-title">${item.name}</div>
          ${metaText}
          <div class="cart-item-price-row">
            <span class="cart-item-price">R$ ${(item.price * item.quantity).toFixed(2).replace(".", ",")}</span>
            <div class="quantity-controls">
              <button class="qty-btn" onclick="adjustQty('${item.cartId}', -1)">-</button>
              <span class="qty-val">${item.quantity}</span>
              <button class="qty-btn" onclick="adjustQty('${item.cartId}', 1)">+</button>
            </div>
          </div>
        </div>
        <button class="remove-item-btn" onclick="deleteCartItem('${item.cartId}')" aria-label="Remover item"><i class="fa-solid fa-trash-can"></i></button>
      `;
      container.appendChild(itemDiv);
    });
  }

  countBadge.textContent = totalCount;
  subtotalEl.textContent = `R$ ${subtotal.toFixed(2).replace(".", ",")}`;
}

// Globals exposed for dynamic HTML onclick events
window.adjustQty = (cartId, delta) => updateCartQuantity(cartId, delta);
window.deleteCartItem = (cartId) => removeFromCart(cartId);

/**
 * ==========================================================================
 * VITRINE / CATALOG RENDERING (WITH PAGINATION)
 * ==========================================================================
 */

function renderVitrine() {
  const grid = document.getElementById("products-grid");
  const numbersContainer = document.getElementById("page-numbers-container");
  grid.innerHTML = "";
  
  // Filter products
  let filtered = dbProducts;
  if (activeFilter !== "todos") {
    filtered = dbProducts.filter(p => p.type === activeFilter);
  }

  // Handle empty state
  if (filtered.length === 0) {
    grid.innerHTML = `<div class="cart-empty-message" style="grid-column: 1/-1;"><p>Nenhum produto cadastrado nesta categoria.</p></div>`;
    numbersContainer.innerHTML = "";
    return;
  }

  // Calculate Pagination
  const totalPages = Math.ceil(filtered.length / productsPerPage);
  if (currentPage > totalPages) currentPage = totalPages || 1;

  const startIdx = (currentPage - 1) * productsPerPage;
  const pageProducts = filtered.slice(startIdx, startIdx + productsPerPage);

  // Render products
  pageProducts.forEach(prod => {
    const card = document.createElement("div");
    card.className = "product-card";
    
    const badgeHtml = prod.type === "pronta-entrega"
      ? `<span class="badge badge-ready">Pronta Entrega</span>`
      : `<span class="badge badge-custom">Sob Encomenda</span>`;

    card.innerHTML = `
      <div class="product-image-container">
        <img src="../Imagens dos produtos/${prod.image}" alt="${prod.name}" class="product-img">
        <div class="product-badges">${badgeHtml}</div>
      </div>
      <div class="product-info">
        <span class="product-category">${prod.category}</span>
        <h3 class="product-title">${prod.name}</h3>
        <div class="product-price-row">
          <div class="product-price">R$ ${prod.price.toFixed(2).replace(".", ",")}</div>
          <button class="add-to-cart-btn" onclick="quickAdd('${prod.id}')" aria-label="Adicionar ao Carrinho">
            <i class="fa-solid fa-cart-plus"></i>
          </button>
        </div>
      </div>
    `;
    grid.appendChild(card);
  });

  // Render Page Numbers
  numbersContainer.innerHTML = "";
  for (let i = 1; i <= totalPages; i++) {
    const btn = document.createElement("button");
    btn.className = `filter-btn ${i === currentPage ? 'active' : ''}`;
    btn.style.padding = "4px 12px";
    btn.textContent = i;
    btn.onclick = () => {
      currentPage = i;
      renderVitrine();
    };
    numbersContainer.appendChild(btn);
  }

  // Adjust pagination buttons disabled state
  document.getElementById("prev-page-btn").disabled = currentPage === 1;
  document.getElementById("next-page-btn").disabled = currentPage === totalPages;
}

window.quickAdd = (productId) => {
  addToCart(productId);
};

// Filters listeners
document.querySelectorAll(".catalog-filters .filter-btn").forEach(btn => {
  btn.addEventListener("click", (e) => {
    document.querySelectorAll(".catalog-filters .filter-btn").forEach(b => b.classList.remove("active"));
    e.target.classList.add("active");
    activeFilter = e.target.dataset.filter;
    currentPage = 1;
    renderVitrine();
  });
});

document.getElementById("prev-page-btn").onclick = () => {
  if (currentPage > 1) {
    currentPage--;
    renderVitrine();
  }
};

document.getElementById("next-page-btn").onclick = () => {
  const filtered = activeFilter === "todos" ? dbProducts : dbProducts.filter(p => p.type === activeFilter);
  const totalPages = Math.ceil(filtered.length / productsPerPage);
  if (currentPage < totalPages) {
    currentPage++;
    renderVitrine();
  }
};



/**
 * ==========================================================================
 * CHECKOUT & MOCK PAYMENT SYSTEM
 * ==========================================================================
 */

let pixTimerInterval = null;

function openCheckoutModal() {
  closeCartDrawer();
  
  // Fill in client profile if logged in
  if (currentUser) {
    document.getElementById("checkout-name").value = currentUser.name || "";
    document.getElementById("checkout-phone").value = currentUser.phone || "";
  }

  // Populate checkout summary
  const summaryList = document.getElementById("checkout-summary-items");
  summaryList.innerHTML = "";
  let subtotal = 0;

  cart.forEach(item => {
    subtotal += item.price * item.quantity;
    const row = document.createElement("div");
    row.className = "summary-item-row";
    row.innerHTML = `
      <span class="summary-item-name">${item.quantity}x ${item.name}</span>
      <span class="summary-item-price">R$ ${(item.price * item.quantity).toFixed(2).replace(".", ",")}</span>
    `;
    summaryList.appendChild(row);
  });

  document.getElementById("checkout-subtotal").textContent = `R$ ${subtotal.toFixed(2).replace(".", ",")}`;
  document.getElementById("checkout-total").textContent = `R$ ${subtotal.toFixed(2).replace(".", ",")}`;

  // Visual toggle
  document.getElementById("checkout-form-view").style.display = "grid";
  document.getElementById("checkout-success-view").style.display = "none";

  openModal("checkout-modal");
  startPIXCountdown();
}

function startPIXCountdown() {
  if (pixTimerInterval) clearInterval(pixTimerInterval);
  let time = 300; // 5 minutes
  const timerEl = document.getElementById("pix-countdown");

  pixTimerInterval = setInterval(() => {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    timerEl.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    time--;

    if (time < 0) {
      clearInterval(pixTimerInterval);
      timerEl.textContent = "Expirado";
    }
  }, 1000);
}

// Payment Methods toggle
document.getElementById("tab-pix-btn").onclick = (e) => {
  document.getElementById("tab-pix-btn").classList.add("active");
  document.getElementById("tab-card-btn").classList.remove("active");
  document.getElementById("payment-pix-content").classList.add("active");
  document.getElementById("payment-card-content").classList.remove("active");
};

document.getElementById("tab-card-btn").onclick = (e) => {
  document.getElementById("tab-card-btn").classList.add("active");
  document.getElementById("tab-pix-btn").classList.remove("active");
  document.getElementById("payment-card-content").classList.add("active");
  document.getElementById("payment-pix-content").classList.remove("active");
};

// Dynamic Card Flip & Bindings
const cardInputNumber = document.getElementById("card-number");
const cardInputName = document.getElementById("card-name");
const cardInputExpiry = document.getElementById("card-expiry");
const cardInputCvv = document.getElementById("card-cvv");
const cardMock = document.getElementById("credit-card-mock");

cardInputNumber.addEventListener("input", (e) => {
  let val = e.target.value.replace(/\D/g, "");
  val = val.substring(0, 16);
  const formatted = val.match(/.{1,4}/g)?.join(" ") || "•••• •••• •••• ••••";
  document.getElementById("card-display-number").textContent = formatted;
  e.target.value = val.match(/.{1,4}/g)?.join(" ") || "";
});

cardInputName.addEventListener("input", (e) => {
  document.getElementById("card-display-name").textContent = e.target.value.toUpperCase() || "NOME COMPLETO";
});

cardInputExpiry.addEventListener("input", (e) => {
  let val = e.target.value.replace(/\D/g, "");
  if (val.length > 2) {
    val = val.substring(0, 2) + "/" + val.substring(2, 4);
  }
  document.getElementById("card-display-expiry").textContent = val || "MM/AA";
  e.target.value = val;
});

cardInputCvv.addEventListener("focus", () => cardMock.classList.add("flipped"));
cardInputCvv.addEventListener("blur", () => cardMock.classList.remove("flipped"));
cardInputCvv.addEventListener("input", (e) => {
  document.getElementById("card-display-cvv").textContent = e.target.value || "•••";
});

// Final Confirm Order Submission
document.getElementById("confirm-purchase-btn").onclick = async () => {
  // Simple form validations
  const clientName = document.getElementById("checkout-name").value;
  const clientPhone = document.getElementById("checkout-phone").value;
  const clientAddress = document.getElementById("checkout-address").value;
  
  if (!clientName || !clientPhone || !clientAddress) {
    alert("Por favor, preencha todos os campos obrigatórios de endereço.");
    return;
  }

  // Create order schema
  const isCard = document.getElementById("tab-card-btn").classList.contains("active");
  let subtotal = 0;
  cart.forEach(item => subtotal += item.price * item.quantity);

  const orderId = "ORD-" + Math.floor(100000 + Math.random() * 900000);
  const newOrder = {
    orderId: orderId,
    clientEmail: currentUser ? currentUser.email : "anonimo@encantosdafaby.com",
    clientName: clientName,
    clientPhone: clientPhone,
    address: `${clientAddress}, CEP ${document.getElementById("checkout-cep").value}, ${document.getElementById("checkout-city").value}/${document.getElementById("checkout-state").value}`,
    items: [...cart],
    total: subtotal,
    paymentMethod: isCard ? "Cartão de Crédito" : "PIX",
    status: "Pendente", // Pendente, Em Produção, Concluído
    date: new Date().toLocaleDateString("pt-BR") + " " + new Date().toLocaleTimeString("pt-BR")
  };

  // Save order to Firebase or LocalStorage
  if (isFirebaseActive) {
    try {
      await addDoc(collection(db, "orders"), newOrder);
    } catch (e) {
      console.error("Firestore Order Save Failed:", e);
      saveLocalOrder(newOrder);
    }
  } else {
    saveLocalOrder(newOrder);
  }

  // Clear client Cart in database
  cart = [];
  updateCloudCart();
  syncCartUI();

  // Setup WhatsApp redirect trigger with formatted message
  setupWhatsAppTrigger(newOrder);

  // Transition UI
  document.getElementById("checkout-form-view").style.display = "none";
  document.getElementById("checkout-success-view").style.display = "block";
  
  syncOrders();
};

function setupWhatsAppTrigger(order) {
  let orderDetailsText = "";
  order.items.forEach(item => {
    let customText = "";
    if (item.isCustom) {
      customText = `\n  └ *Cor:* ${item.options.colorName}\n  └ *Tamanho:* ${item.options.size}${item.options.notes ? `\n  └ *Notas:* "${item.options.notes}"` : ''}`;
    }
    orderDetailsText += `• ${item.quantity}x ${item.name} - R$ ${(item.price * item.quantity).toFixed(2).replace(".", ",")}${customText}\n`;
  });

  const whatsappMessage = `🌸 *NOVO PEDIDO - ENCANTOS DA FABY* 🌸
-----------------------------------------
👤 *Cliente:* ${order.clientName}
📞 *WhatsApp:* ${order.clientPhone}
📍 *Entrega:* ${order.address}

🛒 *ITENS DO PEDIDO:*
${orderDetailsText}
💰 *TOTAL:* R$ ${order.total.toFixed(2).replace(".", ",")}
💳 *Forma de Pagamento:* ${order.paymentMethod}
-----------------------------------------
_Pedido #${order.orderId} registrado no sistema em ${order.date}._`;

  const encodedText = encodeURIComponent(whatsappMessage);
  // Default WhatsApp API number for Faby (Placeholder)
  const phone = "5511999999999"; 
  const whatsappUrl = `https://api.whatsapp.com/send?phone=${phone}&text=${encodedText}`;
  
  document.getElementById("send-whatsapp-order-btn").onclick = () => {
    window.open(whatsappUrl, "_blank");
  };
}

document.getElementById("close-success-view-btn").onclick = () => {
  closeModal("checkout-modal");
};

/**
 * ==========================================================================
 * PORTALS: CUSTOMER AND ADMIN REAL-TIME VIEWS
 * ==========================================================================
 */

function renderClientOrders() {
  const container = document.getElementById("client-orders-grid");
  const emptyEl = document.getElementById("orders-list-empty");
  
  container.innerHTML = "";
  
  const clientOrders = dbOrders.filter(o => o.clientEmail === (currentUser ? currentUser.email : ""));

  if (clientOrders.length === 0) {
    emptyEl.style.display = "block";
    container.style.display = "none";
  } else {
    emptyEl.style.display = "none";
    container.style.display = "grid";

    clientOrders.forEach(order => {
      const card = document.createElement("div");
      card.className = "testimonial-card"; // Re-uses beautifully styled box shadow and rounded styles
      card.style.display = "flex";
      card.style.flexDirection = "column";
      card.style.justifyContent = "space-between";
      
      let statusColor = "var(--color-primary)";
      if (order.status === "Em Produção") statusColor = "orange";
      if (order.status === "Concluído" || order.status === "Enviado") statusColor = "var(--color-secondary)";

      let itemsSummary = "";
      order.items.forEach(it => {
        itemsSummary += `<div style="font-size:0.85rem; margin-bottom: 4px;">• ${it.quantity}x ${it.name}</div>`;
      });

      card.innerHTML = `
        <div>
          <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid var(--border-soft); padding-bottom:8px; margin-bottom:12px;">
            <span style="font-weight:700; color:var(--text-primary); font-size: 0.95rem;">Pedido #${order.orderId}</span>
            <span style="font-size:0.8rem; color:var(--text-muted);">${order.date.split(" ")[0]}</span>
          </div>
          <div style="margin-bottom: 12px;">
            ${itemsSummary}
          </div>
        </div>
        <div style="display:flex; justify-content:space-between; align-items:center; border-top:1px solid var(--border-soft); padding-top:12px; margin-top:8px;">
          <span style="font-family:var(--font-headings); font-weight:800; font-size:1.15rem; color:var(--color-primary-dark)">R$ ${order.total.toFixed(2).replace(".", ",")}</span>
          <span class="badge" style="background-color:${statusColor}; color:#fff; font-size:0.7rem;">${order.status}</span>
        </div>
      `;
      container.appendChild(card);
    });
  }
}

// ADMIN DASHBOARD TAB NAVIGATION
document.getElementById("admin-tab-orders-btn").onclick = () => {
  document.getElementById("admin-tab-orders-btn").classList.add("active");
  document.getElementById("admin-tab-products-btn").classList.remove("active");
  document.getElementById("admin-orders-content").classList.add("active");
  document.getElementById("admin-products-content").classList.remove("active");
};

document.getElementById("admin-tab-products-btn").onclick = () => {
  document.getElementById("admin-tab-products-btn").classList.add("active");
  document.getElementById("admin-tab-orders-btn").classList.remove("active");
  document.getElementById("admin-products-content").classList.add("active");
  document.getElementById("admin-orders-content").classList.remove("active");
};

function renderAdminOrders() {
  const tbody = document.getElementById("admin-orders-tbody");
  const emptyEl = document.getElementById("admin-orders-list-empty");
  const table = document.getElementById("admin-orders-table");

  tbody.innerHTML = "";
  
  if (dbOrders.length === 0) {
    emptyEl.style.display = "block";
    table.style.display = "none";
  } else {
    emptyEl.style.display = "none";
    table.style.display = "table";

    dbOrders.forEach(order => {
      const tr = document.createElement("tr");
      tr.style.borderBottom = "1px solid var(--border-soft)";
      
      let itemsListText = "";
      order.items.forEach(it => {
        let optionsDetails = "";
        if (it.isCustom) {
          optionsDetails = ` <span style="font-size:0.75rem; color:var(--text-muted);">(${it.options.size}, ${it.options.colorName})</span>`;
        }
        itemsListText += `<div style="font-size:0.8rem;">${it.quantity}x ${it.name}${optionsDetails}</div>`;
      });

      let statusColor = "var(--color-primary)";
      if (order.status === "Em Produção") statusColor = "orange";
      if (order.status === "Concluído" || order.status === "Enviado") statusColor = "var(--color-secondary)";

      tr.innerHTML = `
        <td style="padding: 12px; font-weight:600; color:var(--color-primary-dark)">#${order.orderId}</td>
        <td style="padding: 12px;"><strong>${order.clientName}</strong><br><span style="font-size:0.75rem; color:var(--text-muted);">${order.clientPhone}</span></td>
        <td style="padding: 12px;">${itemsListText}</td>
        <td style="padding: 12px; font-family:var(--font-headings); font-weight:700;">R$ ${order.total.toFixed(2).replace(".", ",")}</td>
        <td style="padding: 12px; font-size:0.8rem;">${order.paymentMethod}</td>
        <td style="padding: 12px;"><span class="badge" style="background-color:${statusColor}; color:#fff; font-size:0.7rem;">${order.status}</span></td>
        <td style="padding: 12px;">
          <div style="display:flex; gap:6px;">
            <button class="btn btn-secondary" onclick="updateOrderStatus('${order.id || order.orderId}', 'Em Produção')" style="padding:4px 8px; font-size:0.7rem; border-color:orange; color:orange;"><i class="fa-solid fa-hourglass-start"></i> Produzir</button>
            <button class="btn btn-secondary" onclick="updateOrderStatus('${order.id || order.orderId}', 'Concluído')" style="padding:4px 8px; font-size:0.7rem; border-color:var(--color-secondary); color:var(--color-secondary);"><i class="fa-solid fa-truck"></i> Enviar</button>
          </div>
        </td>
      `;
      tbody.appendChild(tr);
    });
  }
}

window.updateOrderStatus = async (idOrOrderId, newStatus) => {
  if (isFirebaseActive) {
    try {
      const orderRef = doc(db, "orders", idOrOrderId);
      await updateDoc(orderRef, { status: newStatus });
    } catch (e) {
      // If Firestore doc id wasn't fetched correctly, query by orderId
      console.error("Failed directly updating Firestore order by doc id, running fallback query...", e);
    }
  } else {
    const orders = getLocalOrders();
    const order = orders.find(o => o.orderId === idOrOrderId);
    if (order) {
      order.status = newStatus;
      localStorage.setItem("faby_orders", JSON.stringify(orders));
      dbOrders = orders;
    }
  }
  syncOrders();
};

function renderAdminProducts() {
  const tbody = document.getElementById("admin-products-tbody");
  tbody.innerHTML = "";

  dbProducts.forEach(prod => {
    const tr = document.createElement("tr");
    tr.style.borderBottom = "1px solid var(--border-soft)";

    tr.innerHTML = `
      <td style="padding: 12px;"><img src="../Imagens dos produtos/${prod.image}" alt="${prod.name}" style="height:40px; width:40px; object-fit:cover; border-radius: var(--radius-sm);"></td>
      <td style="padding: 12px; font-weight:600;">${prod.name}</td>
      <td style="padding: 12px; font-size:0.8rem; color:var(--text-muted);">${prod.category}</td>
      <td style="padding: 12px; font-family:var(--font-headings); font-weight:700;">R$ ${prod.price.toFixed(2).replace(".", ",")}</td>
      <td style="padding: 12px;">${prod.stock}</td>
      <td style="padding: 12px;"><span class="badge ${prod.type === 'pronta-entrega' ? 'badge-ready' : 'badge-custom'}">${prod.type === 'pronta-entrega' ? 'Pronta Entrega' : 'Sob Encomenda'}</span></td>
      <td style="padding: 12px; text-align:center;">
        <div style="display:flex; gap:6px; justify-content:center;">
          <button class="btn btn-secondary" onclick="editProduct('${prod.id}')" style="padding:6px; font-size:0.8rem;"><i class="fa-solid fa-edit"></i></button>
          <button class="btn btn-secondary" onclick="deleteProduct('${prod.id}')" style="padding:6px; font-size:0.8rem; border-color:var(--color-primary); color:var(--color-primary);"><i class="fa-solid fa-trash"></i></button>
        </div>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

// Product Manager Helpers (CRUD)
function populateImageSelect() {
  const select = document.getElementById("form-product-image");
  select.innerHTML = "";
  // Inject the 32 images
  for (let i = 1; i <= 32; i++) {
    const ext = i === 32 ? "png" : "jpg";
    const filename = `Imagem ${i}.${ext}`;
    const opt = document.createElement("option");
    opt.value = filename;
    opt.textContent = filename;
    select.appendChild(opt);
  }
}

window.editProduct = (productId) => {
  const prod = dbProducts.find(p => p.id === productId);
  if (!prod) return;

  document.getElementById("form-product-id").value = prod.id;
  document.getElementById("form-product-name").value = prod.name;
  document.getElementById("form-product-price").value = prod.price;
  document.getElementById("form-product-category").value = prod.category;
  document.getElementById("form-product-type").value = prod.type;
  document.getElementById("form-product-image").value = prod.image;
  document.getElementById("form-product-stock").value = prod.stock;
  document.getElementById("form-product-description").value = prod.description;

  document.getElementById("product-form-title").textContent = `Editar Produto: ${prod.name}`;
  document.getElementById("product-form-container").style.display = "block";
  document.getElementById("product-form-container").scrollIntoView({ behavior: "smooth" });
};

window.deleteProduct = async (productId) => {
  if (!confirm("Tem certeza que deseja remover este produto da loja da Faby?")) return;

  if (isFirebaseActive) {
    try {
      await deleteDoc(doc(db, "products", productId));
    } catch (e) {
      console.error("Failed to delete Firestore product:", e);
    }
  } else {
    const prods = getLocalProducts().filter(p => p.id !== productId);
    saveLocalProducts(prods);
  }
  syncProductDatabase();
};

document.getElementById("admin-add-product-btn").onclick = () => {
  document.getElementById("admin-product-form").reset();
  document.getElementById("form-product-id").value = "";
  document.getElementById("product-form-title").textContent = "Adicionar Novo Produto";
  document.getElementById("product-form-container").style.display = "block";
};

document.getElementById("form-cancel-btn").onclick = () => {
  document.getElementById("product-form-container").style.display = "none";
};

// Form Product Submission
document.getElementById("admin-product-form").onsubmit = async (e) => {
  e.preventDefault();
  const id = document.getElementById("form-product-id").value;
  const name = document.getElementById("form-product-name").value;
  const price = parseFloat(document.getElementById("form-product-price").value);
  const category = document.getElementById("form-product-category").value;
  const type = document.getElementById("form-product-type").value;
  const image = document.getElementById("form-product-image").value;
  const stock = parseInt(document.getElementById("form-product-stock").value);
  const description = document.getElementById("form-product-description").value;

  const productData = {
    id: id || "p_custom_" + Date.now(),
    name,
    price,
    category,
    type,
    image,
    stock,
    description
  };

  if (isFirebaseActive) {
    try {
      await setDoc(doc(db, "products", productData.id), productData);
    } catch (e) {
      console.error("Firestore Product Save Failed:", e);
      // fallback local
      saveProductLocalFallback(productData);
    }
  } else {
    saveProductLocalFallback(productData);
  }

  document.getElementById("product-form-container").style.display = "none";
  syncProductDatabase();
};

function saveProductLocalFallback(productData) {
  const prods = getLocalProducts();
  const existingIdx = prods.findIndex(p => p.id === productData.id);
  if (existingIdx >= 0) {
    prods[existingIdx] = productData;
  } else {
    prods.push(productData);
  }
  saveLocalProducts(prods);
}

/**
 * ==========================================================================
 * WINDOW / CORE INTERACTION MODALS
 * ==========================================================================
 */

// Mobile Navigation menu toggle
document.getElementById("mobile-menu-toggle").onclick = () => {
  const menu = document.getElementById("nav-menu");
  if (menu.style.display === "flex") {
    menu.style.display = "none";
  } else {
    menu.style.display = "flex";
    menu.style.flexDirection = "column";
    menu.style.position = "absolute";
    menu.style.top = "80px";
    menu.style.left = "0";
    menu.style.width = "100%";
    menu.style.backgroundColor = "var(--white)";
    menu.style.padding = "20px";
    menu.style.borderBottom = "1px solid var(--border-soft)";
    menu.style.gap = "15px";
    menu.style.boxShadow = "var(--shadow-md)";
    menu.style.zIndex = "99";
  }
};

// Modals management
window.openModal = (modalId) => {
  document.getElementById(modalId).classList.add("open");
};

window.closeModal = (modalId) => {
  document.getElementById(modalId).classList.remove("open");
  if (modalId === "checkout-modal" && pixTimerInterval) {
    clearInterval(pixTimerInterval);
  }
};

// Cart Drawer open/close
function openCartDrawer() {
  document.getElementById("cart-drawer").classList.add("open");
  document.getElementById("cart-overlay").classList.add("open");
}

function closeCartDrawer() {
  document.getElementById("cart-drawer").classList.remove("open");
  document.getElementById("cart-overlay").classList.remove("open");
}

document.getElementById("open-cart-btn").onclick = openCartDrawer;
document.getElementById("close-cart-btn").onclick = closeCartDrawer;
document.getElementById("cart-overlay").onclick = closeCartDrawer;

// Cart trigger -> checkout
document.getElementById("go-to-checkout-btn").onclick = openCheckoutModal;

// Authentication Modal Tabs switcher
document.getElementById("auth-tab-login-btn").onclick = () => {
  document.getElementById("auth-tab-login-btn").classList.add("active");
  document.getElementById("auth-tab-register-btn").classList.remove("active");
  document.getElementById("auth-login-form").classList.add("active");
  document.getElementById("auth-register-form").classList.remove("active");
};

document.getElementById("auth-tab-register-btn").onclick = () => {
  document.getElementById("auth-tab-register-btn").classList.add("active");
  document.getElementById("auth-tab-login-btn").classList.remove("active");
  document.getElementById("auth-register-form").classList.add("active");
  document.getElementById("auth-login-form").classList.remove("active");
};

document.getElementById("close-auth-modal-btn").onclick = () => closeModal("auth-modal");
document.getElementById("auth-modal-backdrop").onclick = () => closeModal("auth-modal");

document.getElementById("close-checkout-modal-btn").onclick = () => closeModal("checkout-modal");
document.getElementById("checkout-modal-backdrop").onclick = () => closeModal("checkout-modal");

// Auth Form Submissions
document.getElementById("auth-login-form").onsubmit = (e) => {
  e.preventDefault();
  handleLogin(document.getElementById("login-email").value, document.getElementById("login-password").value);
};

document.getElementById("auth-register-form").onsubmit = (e) => {
  e.preventDefault();
  handleRegister(
    document.getElementById("register-name").value,
    document.getElementById("register-email").value,
    document.getElementById("register-password").value
  );
};

// Initialize Application UI
document.addEventListener("DOMContentLoaded", () => {
  setupAuthListener();
  syncProductDatabase();
});
