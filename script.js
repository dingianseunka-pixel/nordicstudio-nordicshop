/* NordicShop – gemensam frontend-logik */

const CART_KEY = "nordicshop_cart";

/* ---------- Produktkatalog (används av sök) ---------- */
const PRODUCTS = [
  { id: "mugg", name: "Keramikmugg", desc: "Handgjord, 35 cl", price: 149 },
  { id: "linnepaslakan", name: "Linnepåslakan", desc: "100% lin, 150x210 cm", price: 499 },
  { id: "bambuljus", name: "Bambuljus", desc: "Doft: sandelträ", price: 229 },
  { id: "vas", name: "Vas i stengods", desc: "H 24 cm, matt glasyr", price: 349 },
  { id: "skarbrada", name: "Träskärbräda", desc: "Ek, 40x20 cm", price: 279 },
  { id: "ylleplad", name: "Yllepläd", desc: "130x180 cm, mjuk ull", price: 549 },
];

/* ---------- Hjälpfunktioner ---------- */
function formatPrice(n) {
  return n.toLocaleString("sv-SE") + " kr";
}

function getCart() {
  try {
    return JSON.parse(localStorage.getItem(CART_KEY)) || [];
  } catch {
    return [];
  }
}

function saveCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  updateCartCount();
}

function cartTotalQty(cart) {
  return cart.reduce((sum, item) => sum + item.qty, 0);
}

function cartTotalPrice(cart) {
  return cart.reduce((sum, item) => sum + item.price * item.qty, 0);
}

function updateCartCount() {
  const el = document.getElementById("cartCount");
  if (!el) return;
  const qty = cartTotalQty(getCart());
  el.textContent = qty;
  el.style.display = qty > 0 ? "flex" : "none";
}

function addToCart(id, name, price) {
  const cart = getCart();
  const existing = cart.find((i) => i.id === id);
  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({ id, name, price, qty: 1 });
  }
  saveCart(cart);
  showToast(`${name} lades i kundvagnen`);
}

function showToast(message) {
  const toast = document.getElementById("toast");
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(showToast._t);
  showToast._t = setTimeout(() => toast.classList.remove("show"), 2200);
}

/* ---------- Kundvagnsknappar (startsida + produktsida) ---------- */
function bindAddToCartButtons() {
  document.querySelectorAll(".add-to-cart").forEach((btn) => {
    btn.addEventListener("click", () => {
      const card = btn.closest("[data-id]");
      if (!card) return;
      addToCart(
        card.dataset.id,
        card.dataset.name,
        Number(card.dataset.price)
      );
    });
  });
}

/* ---------- Sök ---------- */
function initSearch() {
  const toggle = document.getElementById("searchToggle");
  const panel = document.getElementById("searchPanel");
  const input = document.getElementById("searchInput");
  const results = document.getElementById("searchResults");
  if (!toggle || !panel || !input || !results) return;

  toggle.addEventListener("click", () => {
    const isOpen = !panel.hidden;
    panel.hidden = isOpen;
    toggle.setAttribute("aria-expanded", String(!isOpen));
    if (!isOpen) {
      input.focus();
    } else {
      input.value = "";
      results.innerHTML = "";
    }
  });

  input.addEventListener("input", () => {
    const q = input.value.trim().toLowerCase();
    results.innerHTML = "";
    if (!q) return;

    const matches = PRODUCTS.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.desc.toLowerCase().includes(q)
    );

    if (matches.length === 0) {
      results.innerHTML = '<p class="search-empty">Inga produkter matchade sökningen.</p>';
      return;
    }

    matches.forEach((p) => {
      const row = document.createElement("div");
      row.className = "search-result";
      row.innerHTML = `
        <div>
          <strong>${p.name}</strong>
          <div class="product-desc">${p.desc}</div>
        </div>
        <div style="display:flex;align-items:center;gap:12px;">
          <span class="price">${formatPrice(p.price)}</span>
          <button class="btn btn-small" type="button">Lägg i kundvagn</button>
        </div>
      `;
      row.querySelector("button").addEventListener("click", () => {
        addToCart(p.id, p.name, p.price);
      });
      results.appendChild(row);
    });
  });
}

/* ---------- Nyhetsbrev ---------- */
function initNewsletter() {
  const form = document.getElementById("newsletterForm");
  if (!form) return;
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    form.reset();
    showToast("Tack för din prenumeration!");
  });
}

/* ---------- Kundvagnssida ---------- */
function renderCartPage() {
  const container = document.getElementById("cartItems");
  const summary = document.getElementById("cartSummary");
  if (!container || !summary) return;

  const cart = getCart();

  if (cart.length === 0) {
    container.innerHTML = `
      <div class="cart-empty">
        <h2>Din kundvagn är tom</h2>
        <p>Lägg till några produkter för att komma igång.</p>
        <a href="produkter.html" class="btn btn-primary">Till produkter</a>
      </div>
    `;
    summary.innerHTML = "";
    return;
  }

  container.innerHTML = "";
  cart.forEach((item) => {
    const el = document.createElement("div");
    el.className = "cart-item";
    el.innerHTML = `
      <div class="cart-thumb"></div>
      <div>
        <h3>${item.name}</h3>
        <p class="product-desc">${formatPrice(item.price)} / st</p>
        <div class="qty">
          <button type="button" data-action="dec" aria-label="Minska">−</button>
          <span>${item.qty}</span>
          <button type="button" data-action="inc" aria-label="Öka">+</button>
        </div>
      </div>
      <div class="cart-item-right">
        <strong>${formatPrice(item.price * item.qty)}</strong>
        <button type="button" class="remove-btn" data-action="remove">Ta bort</button>
      </div>
    `;
    el.querySelector('[data-action="inc"]').addEventListener("click", () => changeQty(item.id, 1));
    el.querySelector('[data-action="dec"]').addEventListener("click", () => changeQty(item.id, -1));
    el.querySelector('[data-action="remove"]').addEventListener("click", () => removeItem(item.id));
    container.appendChild(el);
  });

  const subtotal = cartTotalPrice(cart);
  const shipping = subtotal >= 499 ? 0 : 49;
  const total = subtotal + shipping;

  summary.innerHTML = `
    <h2>Sammanfattning</h2>
    <div class="summary-row"><span>Delsumma</span><span>${formatPrice(subtotal)}</span></div>
    <div class="summary-row"><span>Frakt</span><span>${shipping === 0 ? "Fri frakt" : formatPrice(shipping)}</span></div>
    <div class="summary-row total"><span>Totalt</span><span>${formatPrice(total)}</span></div>
    <button type="button" class="btn btn-primary" id="checkoutBtn">Slutför köp</button>
  `;

  document.getElementById("checkoutBtn").addEventListener("click", () => {
    showToast("Tack för ditt köp! (testbeställning)");
    saveCart([]);
    renderCartPage();
  });
}

function changeQty(id, delta) {
  const cart = getCart();
  const item = cart.find((i) => i.id === id);
  if (!item) return;
  item.qty += delta;
  const filtered = cart.filter((i) => i.qty > 0);
  saveCart(filtered);
  renderCartPage();
}

function removeItem(id) {
  const cart = getCart().filter((i) => i.id !== id);
  saveCart(cart);
  renderCartPage();
}

/* ---------- Init ---------- */
document.addEventListener("DOMContentLoaded", () => {
  updateCartCount();
  bindAddToCartButtons();
  initSearch();
  initNewsletter();
  renderCartPage();
});
