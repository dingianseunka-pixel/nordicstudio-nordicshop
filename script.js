/* NordicShop – gemensam frontend-logik */

const CART_KEY = "nordicshop_cart";
const NEWSLETTER_KEY = "nordicshop_newsletter";
const ORDERS_KEY = "nordicshop_orders";

/* ---------- Sidkonfiguration ----------
 * Registrera nya sidor här. Varje ny HTML-sida behöver bara:
 *   <main data-page="min-sida"> ... </main>
 * och så läggs en post till nedan. Då får sidan automatiskt
 * aktiv meny, årtal i footer och ev. renderare.
 */
const PAGE_CONFIG = {
  home: { title: "Nordic Shop – Kvalitet för vardagen", nav: "index.html" },
  produkter: { title: "Produkter – Nordic Shop", nav: "produkter.html" },
  nyheter: { title: "Nyheter – Nordic Shop", nav: "nyheter.html" },
  "om-oss": { title: "Om oss – Nordic Shop", nav: "om-oss.html" },
  kundvagn: { title: "Kundvagn – Nordic Shop", nav: "kundvagn.html" },
  produkt: { title: "Produkt – Nordic Shop", nav: "produkter.html" },
};

/* ---------- Produktkatalog (används av sök) ---------- */
const PRODUCTS = [
  {
    id: "mugg",
    name: "Keramikmugg",
    desc: "Handgjord, 35 cl",
    price: 149,
    longDesc:
      "En handgjord keramikmugg tillverkad av skandinaviska hantverkare. Rymmer 35 cl och tål maskindisk. Den matta glasyren ger ett tidlöst utseende som passar både till vardags och fest.",
    gradient: "linear-gradient(135deg,#e0e7ff,#c7d2fe)",
  },
  {
    id: "linnepaslakan",
    name: "Linnepåslakan",
    desc: "100% lin, 150x210 cm",
    price: 499,
    longDesc:
      "Ett påslakan i 100% europeiskt lin. Linnedesignen andas och blir mjukare för varje tvätt. Mått 150x210 cm passar standarddubbelsäng. Tillverkad med miljövänliga färger.",
    gradient: "linear-gradient(135deg,#fef3c7,#fde68a)",
  },
  {
    id: "bambuljus",
    name: "Bambuljus",
    desc: "Doft: sandelträ",
    price: 229,
    longDesc:
      "Ett doftljus i bambubehållare med varm sandelträdoft. Brinntid cirka 40 timmar. Perfekt för att skapa en lugn stämning i hemmet.",
    gradient: "linear-gradient(135deg,#dcfce7,#bbf7d0)",
  },
  {
    id: "vas",
    name: "Vas i stengods",
    desc: "H 24 cm, matt glasyr",
    price: 349,
    longDesc:
      "En elegant vas i stengods med matt glasyr. Höjd 24 cm. Passar både till snittblommor och som dekorativt objekt i sig. Handtillverkad i små serier.",
    gradient: "linear-gradient(135deg,#fce7f3,#fbcfe8)",
  },
  {
    id: "skarbrada",
    name: "Träskärbräda",
    desc: "Ek, 40x20 cm",
    price: 279,
    longDesc:
      "En rejäl skärbräda i massiv ek, 40x20 cm. Behandlad med livsmedelsgodkänd olja. Tål daglig användning och blir vackrare med åren.",
    gradient: "linear-gradient(135deg,#e0f2fe,#bae6fd)",
  },
  {
    id: "ylleplad",
    name: "Yllepläd",
    desc: "130x180 cm, mjuk ull",
    price: 549,
    longDesc:
      "En mjuk och värmande pläd i 100% ull. Mått 130x180 cm. Vävd i Skandinavien med traditionella tekniker. Perfekt i soffan eller på sängen under kyliga kvällar.",
    gradient: "linear-gradient(135deg,#ede9fe,#ddd6fe)",
  },
];

function getProductById(id) {
  return PRODUCTS.find((p) => p.id === id);
}

/* ---------- Dynamisk rendering av produktkort ---------- */
function productCardHTML(p, opts = {}) {
  const tag = opts.tag
    ? `<span class="tag ${opts.tagClass || ""}">${opts.tag}</span>`
    : "";
  const priceHTML = opts.oldPrice
    ? `<span class="price"><s>${formatPrice(opts.oldPrice)}</s> ${formatPrice(p.price)}</span>`
    : `<span class="price">${formatPrice(p.price)}</span>`;

  return `
    <article class="product-card" data-id="${p.id}" data-name="${p.name}" data-price="${p.price}">
      <div class="product-image" style="background: ${p.gradient};">
        ${tag}
      </div>
      <div class="product-body">
        <h3>${p.name}</h3>
        <p class="product-desc">${p.desc}</p>
        <div class="product-footer">
          ${priceHTML}
          <button class="btn btn-small add-to-cart" type="button">Lägg i kundvagn</button>
        </div>
      </div>
    </article>
  `;
}

function renderProductGrid() {
  document.querySelectorAll('[data-render="products"]').forEach((grid) => {
    const limit = Number(grid.dataset.limit) || PRODUCTS.length;
    grid.innerHTML = PRODUCTS.slice(0, limit)
      .map((p) => productCardHTML(p))
      .join("");
  });
}

function renderNewsGrid() {
  document.querySelectorAll('[data-render="news"]').forEach((grid) => {
    const news = PRODUCTS.filter((p) =>
      ["bambuljus", "vas", "skarbrada"].includes(p.id)
    );
    grid.innerHTML = news
      .map((p) => productCardHTML(p, { tag: "Nyhet", tagClass: "tag-new" }))
      .join("");
  });
}

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
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
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

/* ---------- Klickbara produktkort -> produktsida i nytt fönster ---------- */
function bindProductCardLinks() {
  document.querySelectorAll(".product-card[data-id]").forEach((card) => {
    card.style.cursor = "pointer";
    card.setAttribute("role", "link");
    card.setAttribute("tabindex", "0");
    card.setAttribute("aria-label", `Läs mer om ${card.dataset.name}`);

    const open = () => {
      const url = `produkt.html?id=${encodeURIComponent(card.dataset.id)}`;
      window.open(url, "_blank", "noopener");
    };

    card.addEventListener("click", open);
    card.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        open();
      }
    });
  });
}

/* ---------- Produktsida ---------- */
function renderProductPage() {
  const nameEl = document.getElementById("productName");
  if (!nameEl) return;

  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");
  const product = getProductById(id);

  const titleEl = document.getElementById("productTitle");
  const subtitleEl = document.getElementById("productSubtitle");
  const descEl = document.getElementById("productDesc");
  const priceEl = document.getElementById("productPrice");
  const visualEl = document.getElementById("productVisual");
  const addBtn = document.getElementById("productAddBtn");

  if (!product) {
    if (titleEl) titleEl.textContent = "Produkten hittades inte";
    if (subtitleEl) subtitleEl.textContent = "Gå tillbaka till produktsidan för att välja en produkt.";
    nameEl.textContent = "Okänd produkt";
    if (descEl) descEl.textContent = "";
    if (priceEl) priceEl.textContent = "";
    if (addBtn) addBtn.style.display = "none";
    return;
  }

  document.title = `${product.name} – Nordic Shop`;
  if (titleEl) titleEl.textContent = product.name;
  if (subtitleEl) subtitleEl.textContent = product.desc;
  nameEl.textContent = product.name;
  if (descEl) descEl.textContent = product.longDesc;
  if (priceEl) priceEl.textContent = formatPrice(product.price);
  if (visualEl) visualEl.style.background = product.gradient;

  if (addBtn) {
    addBtn.addEventListener("click", () => {
      addToCart(product.id, product.name, product.price);
    });
  }

  renderRelatedProducts(product.id);
}

function renderRelatedProducts(currentId) {
  const container = document.getElementById("relatedProducts");
  if (!container) return;
  const related = PRODUCTS.filter((p) => p.id !== currentId).slice(0, 3);
  container.innerHTML = related.map((p) => productCardHTML(p)).join("");
  bindAddToCartButtons();
  bindProductCardLinks();
}

/* ---------- Sök ---------- */
function initSearch() {
  const toggle = document.getElementById("searchToggle");
  const panel = document.getElementById("searchPanel");
  const input = document.getElementById("searchInput");
  const results = document.getElementById("searchResults");
  if (!toggle || !panel || !input || !results) return;

  const closePanel = () => {
    panel.hidden = true;
    toggle.setAttribute("aria-expanded", "false");
    input.value = "";
    results.innerHTML = "";
  };

  toggle.addEventListener("click", () => {
    const isOpen = !panel.hidden;
    panel.hidden = isOpen;
    toggle.setAttribute("aria-expanded", String(!isOpen));
    if (!isOpen) {
      input.focus();
    } else {
      closePanel();
    }
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !panel.hidden) closePanel();
  });

  document.addEventListener("click", (e) => {
    if (panel.hidden) return;
    if (panel.contains(e.target) || toggle.contains(e.target)) return;
    closePanel();
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
          <a href="produkt.html?id=${encodeURIComponent(p.id)}" class="search-result-link">
            <strong>${p.name}</strong>
            <div class="product-desc">${p.desc}</div>
          </a>
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
    const email = form.querySelector('input[type="email"]').value.trim();
    if (!email) return;
    try {
      const list = JSON.parse(localStorage.getItem(NEWSLETTER_KEY)) || [];
      if (!list.includes(email)) list.push(email);
      localStorage.setItem(NEWSLETTER_KEY, JSON.stringify(list));
    } catch {
      /* ignorera */
    }
    form.reset();
    showToast("Tack för din prenumeration!");
  });
}

/* ---------- Kontaktformulär ---------- */
function initContactForm() {
  const form = document.getElementById("contactForm");
  if (!form) return;
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    form.reset();
    showToast("Tack! Vi återkommer inom kort.");
  });
}

/* ---------- Aktiv meny + årtal ---------- */
function initActiveNav() {
  const path = window.location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll(".main-nav a").forEach((a) => {
    const href = a.getAttribute("href");
    if (href === path) a.classList.add("nav-active");
  });
}

function initFooterYear() {
  document.querySelectorAll(".footer-bottom p").forEach((p) => {
    p.textContent = p.textContent.replace(/©\s*\d{4}/, `© ${new Date().getFullYear()}`);
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
    const product = getProductById(item.id);
    const gradient = product ? product.gradient : "linear-gradient(135deg,#e0e7ff,#c7d2fe)";
    const el = document.createElement("div");
    el.className = "cart-item";
    el.innerHTML = `
      <div class="cart-thumb" style="background: ${gradient};"></div>
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
    try {
      const orders = JSON.parse(localStorage.getItem(ORDERS_KEY)) || [];
      orders.push({
        date: new Date().toISOString(),
        items: cart,
        total,
      });
      localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
    } catch {
      /* ignorera */
    }
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
  renderProductGrid();
  renderNewsGrid();
  updateCartCount();
  bindAddToCartButtons();
  bindProductCardLinks();
  initSearch();
  initNewsletter();
  initContactForm();
  initActiveNav();
  initFooterYear();
  renderCartPage();
  renderProductPage();
});
