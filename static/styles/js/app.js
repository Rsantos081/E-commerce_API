const API_BASE = "";

const state = {
  authenticated: false,
  userName: null,
  products: [],        
  productsById: new Map(),
  cartItems: [],        
};

const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);

function showToast(message, type = "info") {
  const container = $("#toastContainer");
  const el = document.createElement("div");
  el.className = `toast ${type === "error" ? "toast--error" : type === "success" ? "toast--success" : ""}`;
  el.textContent = message;
  container.appendChild(el);
  setTimeout(() => el.remove(), 3200);
}

function formatBRL(value) {
  const n = Number(value) || 0;
  return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function swatchColorFor(name) {

  const palette = ["#3B5A45", "#B4842A", "#5B5F52", "#8A5A3B", "#2E4A63"];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return palette[Math.abs(hash) % palette.length];
}

function initials(name) {
  return name.trim().slice(0, 2).toUpperCase();
}


async function api(path, { method = "GET", body } = {}) {
  let response;
  try {
    response = await fetch(`${API_BASE}${path}`, {
      method,
      credentials: "include", 
      headers: body ? { "Content-Type": "application/json" } : undefined,
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch (err) {
    showToast("Não foi possível falar com a API. Ela está rodando em " + API_BASE + "?", "error");
    throw err;
  }

  let data = null;
  try { data = await response.json(); } catch (_) { /* resposta sem corpo JSON */ }

  if (!response.ok) {
    const msg = (data && (data.mensagem || data.mensagme)) || `Erro ${response.status}`;
    throw { status: response.status, message: msg, data };
  }
  return data;
}


async function refreshSession() {
  try {
    const data = await api("/api/me");
    state.authenticated = !!data.autenticado;
    state.userName = data.nome || null;
  } catch (_) {
    state.authenticated = false;
    state.userName = null;
  }
  renderAuthUI();
}

function renderAuthUI() {
  const label = $("#accountLabel");
  const admin = $("#adminPanel");
  if (state.authenticated) {
    label.textContent = `Sair (${state.userName})`;
    admin.classList.remove("hidden");
  } else {
    label.textContent = "Entrar";
    admin.classList.add("hidden");
  }
  renderProducts();
}

async function handleLogin(nome, senha) {
  try {
    await api("/api/login", { method: "POST", body: { nome, senha } });
    showToast("Login realizado com sucesso.", "success");
    closeAuthModal();
    await refreshSession();
    await loadCart();
  } catch (err) {
    showToast(err.message || "Credenciais inválidas.", "error");
  }
}

async function handleRegister(nome, senha) {
  try {
    await api("/api/register", { method: "POST", body: { nome, senha } });
    showToast("Conta criada. Agora faça login.", "success");
    switchAuthTab("login");
    $("#loginNome").value = nome;
  } catch (err) {
    showToast(err.message || "Não foi possível criar a conta.", "error");
  }
}

async function handleLogout() {
  try {
    await api("/api/logout", { method: "POST" });
  } catch (_) {  }
  state.authenticated = false;
  state.userName = null;
  state.cartItems = [];
  renderAuthUI();
  renderCart();
  showToast("Você saiu da conta.", "info");
}


async function loadProducts() {
  try {
    const list = await api("/api/products/");
    state.products = list;
    state.productsById = new Map(list.map((p) => [p.id, p]));
    renderProducts();
  } catch (err) {
    showToast("Não foi possível carregar os produtos.", "error");
  }
}

function renderProducts() {
  const grid = $("#productGrid");
  const term = $("#searchInput").value.trim().toLowerCase();
  const filtered = state.products.filter((p) => p.nome.toLowerCase().includes(term));

  $("#productCountLabel").textContent = `${filtered.length} ${filtered.length === 1 ? "item" : "itens"}`;
  $("#emptyState").classList.toggle("hidden", filtered.length !== 0);

  grid.innerHTML = filtered.map((p) => `
    <article class="card" data-id="${p.id}">
      ${state.authenticated ? `
        <div class="card__icon-row">
          <button class="icon-btn" data-action="edit" data-id="${p.id}" title="Editar">✎</button>
          <button class="icon-btn" data-action="delete" data-id="${p.id}" title="Remover">🗑</button>
        </div>` : ""}
      <div class="card__swatch" style="background:${swatchColorFor(p.nome)}">${initials(p.nome)}</div>
      <h3 class="card__name">${escapeHtml(p.nome)}</h3>
      <div class="card__price">${formatBRL(p.preco)}</div>
      <div class="card__actions">
        <button class="btn btn--ghost" data-action="detail" data-id="${p.id}">Detalhes</button>
        <button class="btn btn--primary" data-action="add-cart" data-id="${p.id}">Adicionar</button>
      </div>
    </article>
  `).join("");
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

async function openProductDetail(id) {
  try {
    const p = await api(`/api/products/${id}`);
    $("#detailContent").innerHTML = `
      <h2>${escapeHtml(p.nome)}</h2>
      <div class="detail__price">${formatBRL(p.preco)}</div>
      <p>${p.descricao ? escapeHtml(p.descricao) : "Sem descrição cadastrada."}</p>
      <button class="btn btn--primary btn--full" data-action="add-cart" data-id="${p.id}">Adicionar ao carrinho</button>
    `;
    openModal("#detailOverlay", "#detailModal");
  } catch (err) {
    showToast(err.message || "Produto não encontrado.", "error");
  }
}

async function submitProductForm(e) {
  e.preventDefault();
  const id = $("#productId").value;
  const payload = {
    nome: $("#productNome").value.trim(),
    preco: parseFloat($("#productPreco").value),
    descricao: $("#productDescricao").value.trim(),
  };
  if (!payload.nome || Number.isNaN(payload.preco)) {
    showToast("Preencha nome e preço corretamente.", "error");
    return;
  }
  try {
    if (id) {
      await api(`/api/products/update/${id}`, { method: "PUT", body: payload });
      showToast("Produto atualizado.", "success");
    } else {
      await api("/api/products/add", { method: "POST", body: payload });
      showToast("Produto adicionado à prateleira.", "success");
    }
    resetProductForm();
    await loadProducts();
  } catch (err) {
    showToast(err.message || "Não foi possível salvar o produto.", "error");
  }
}

function fillProductFormForEdit(id) {
  const p = state.productsById.get(id);
  if (!p) return;
  $("#productId").value = p.id;
  $("#productNome").value = p.nome;
  $("#productPreco").value = p.preco;
  $("#productDescricao").value = p.descricao || "";
  $("#productSubmitBtn").textContent = "Salvar alterações";
  $("#productCancelBtn").classList.remove("hidden");
  $("#adminPanel").scrollIntoView({ behavior: "smooth", block: "start" });
}

function resetProductForm() {
  $("#productForm").reset();
  $("#productId").value = "";
  $("#productSubmitBtn").textContent = "Adicionar à prateleira";
  $("#productCancelBtn").classList.add("hidden");
}

async function deleteProduct(id) {
  if (!confirm("Remover este produto da prateleira?")) return;
  try {
    await api(`/api/products/delete/${id}`, { method: "DELETE" });
    showToast("Produto removido.", "success");
    await loadProducts();
  } catch (err) {
    showToast(err.message || "Não foi possível remover o produto.", "error");
  }
}


async function loadCart() {
  if (!state.authenticated) { state.cartItems = []; renderCart(); return; }
  try {
    state.cartItems = await api("/cart/");
  } catch (_) {
    state.cartItems = [];
  }
  renderCart();
}

function renderCart() {
  const list = $("#cartItems");
  const count = state.cartItems.length;
  $("#cartCount").textContent = count;
  $("#cartEmptyMsg").classList.toggle("hidden", count !== 0);
  $("#btnCheckout").disabled = count === 0;

  let total = 0;
  list.innerHTML = state.cartItems.map((item) => {
    const product = state.productsById.get(item.product_id);
    const price = product ? product.preco : 0;
    total += price;
    return `
      <div class="receipt-line">
        <span class="receipt-line__name">${escapeHtml(item.product_name)}</span>
        <span class="receipt-line__fill"></span>
        <span class="receipt-line__price">${formatBRL(price)}</span>
        <button class="receipt-line__remove" data-action="remove-cart" data-id="${item.product_id}" title="Remover">✕</button>
      </div>
    `;
  }).join("");

  $("#cartTotal").textContent = formatBRL(total);
}

async function addToCart(productId) {
  if (!state.authenticated) {
    showToast("Entre na sua conta para adicionar itens ao carrinho.", "error");
    openAuthModal();
    return;
  }
  try {
    await api(`/cart/add/${productId}`, { method: "POST" });
    showToast("Item adicionado ao carrinho.", "success");
    await loadCart();
  } catch (err) {
    showToast(err.message || "Não foi possível adicionar ao carrinho.", "error");
  }
}

async function removeFromCart(productId) {
  try {
    await api(`/cart/remove/${productId}`, { method: "DELETE" });
    await loadCart();
  } catch (err) {
    showToast(err.message || "Não foi possível remover o item.", "error");
  }
}

async function checkout() {
  try {
    const data = await api("/cart/checkout", { method: "POST" });
    showToast(data.mensagem || "Compra finalizada.", "success");
    state.cartItems = [];
    renderCart();
    closeCart();
  } catch (err) {
    showToast(err.message || "Não foi possível finalizar a compra.", "error");
  }
}


function openModal(overlaySel, modalSel) {
  $(overlaySel).classList.remove("hidden");
  $(modalSel).classList.remove("hidden");
}
function closeModal(overlaySel, modalSel) {
  $(overlaySel).classList.add("hidden");
  $(modalSel).classList.add("hidden");
}

function openAuthModal() { switchAuthTab("login"); openModal("#authOverlay", "#authModal"); }
function closeAuthModal() { closeModal("#authOverlay", "#authModal"); }

function switchAuthTab(tab) {
  $$(".modal__tab").forEach((btn) => btn.classList.toggle("is-active", btn.dataset.tab === tab));
  $("#loginForm").classList.toggle("hidden", tab !== "login");
  $("#registerForm").classList.toggle("hidden", tab !== "register");
}

function openCart() {
  $("#cartOverlay").classList.remove("hidden");
  $("#cartDrawer").classList.add("is-open");
  $("#cartDrawer").setAttribute("aria-hidden", "false");
}
function closeCart() {
  $("#cartOverlay").classList.add("hidden");
  $("#cartDrawer").classList.remove("is-open");
  $("#cartDrawer").setAttribute("aria-hidden", "true");
}


function bindEvents() {
  $("#btnAccount").addEventListener("click", () => {
    if (state.authenticated) handleLogout();
    else openAuthModal();
  });

  $("#btnCart").addEventListener("click", openCart);
  $("#btnCloseCart").addEventListener("click", closeCart);
  $("#cartOverlay").addEventListener("click", closeCart);
  $("#btnCheckout").addEventListener("click", checkout);

  $("#btnCloseAuth").addEventListener("click", closeAuthModal);
  $("#authOverlay").addEventListener("click", closeAuthModal);
  $$(".modal__tab").forEach((btn) => btn.addEventListener("click", () => switchAuthTab(btn.dataset.tab)));

  $("#loginForm").addEventListener("submit", (e) => {
    e.preventDefault();
    handleLogin($("#loginNome").value.trim(), $("#loginSenha").value);
  });
  $("#registerForm").addEventListener("submit", (e) => {
    e.preventDefault();
    handleRegister($("#registerNome").value.trim(), $("#registerSenha").value);
  });

  $("#btnCloseDetail").addEventListener("click", () => closeModal("#detailOverlay", "#detailModal"));
  $("#detailOverlay").addEventListener("click", () => closeModal("#detailOverlay", "#detailModal"));

  $("#searchInput").addEventListener("input", renderProducts);

  $("#productForm").addEventListener("submit", submitProductForm);
  $("#productCancelBtn").addEventListener("click", resetProductForm);


  $("#productGrid").addEventListener("click", (e) => {
    const btn = e.target.closest("button[data-action]");
    if (!btn) return;
    const id = parseInt(btn.dataset.id, 10);
    const action = btn.dataset.action;
    if (action === "add-cart") addToCart(id);
    else if (action === "detail") openProductDetail(id);
    else if (action === "edit") fillProductFormForEdit(id);
    else if (action === "delete") deleteProduct(id);
  });

  $("#detailContent").addEventListener("click", (e) => {
    const btn = e.target.closest("button[data-action='add-cart']");
    if (btn) addToCart(parseInt(btn.dataset.id, 10));
  });

  $("#cartItems").addEventListener("click", (e) => {
    const btn = e.target.closest("button[data-action='remove-cart']");
    if (btn) removeFromCart(parseInt(btn.dataset.id, 10));
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      closeCart();
      closeAuthModal();
      closeModal("#detailOverlay", "#detailModal");
    }
  });
}
(async function init() {
  bindEvents();
  await refreshSession();
  await loadProducts();
  await loadCart();
})();