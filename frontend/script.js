// --- DOM ELEMENTS ---

const searchForm = document.getElementById('searchForm');
const searchInput = document.getElementById('searchInput');

const suggestionSection = document.getElementById('suggestionSection');
const resultSection = document.getElementById('resultSection');
const resultTitle = document.getElementById('resultTitle');
const priceList = document.getElementById('priceList');

const bestPlatformBox = document.getElementById('bestPlatformBox');
const bestPlatformText = document.getElementById('bestPlatformText');
const bestPlatformBtn = document.getElementById('bestPlatformBtn');

const productCards = document.querySelectorAll('.product-card');

// --- PRODUCT DATA FOR THE 6 BOXES ---
// (Make sure you also have these in DB, or add later)
const allProducts = [
  {
    name: 'milk',
    icon: '🥛',
    desc: 'Tap to compare milk prices instantly.'
  },
  {
    name: 'bread',
    icon: '🍞',
    desc: 'See where bread is cheapest right now.'
  },
  {
    name: 'curd',
    icon: '🥣',
    desc: 'Find the best curd price across apps.'
  },
  {
    name: 'rice',
    icon: '🍚',
    desc: 'Quickly compare rice prices.'
  },
  {
    name: 'crispello',
    icon: '🍫',
    desc: 'Check which app gives cheaper crispello.'
  },
  {
    name: 'eggs',
    icon: '🥚',
    desc: 'Compare eggs prices in one click.'
  }
];

let currentStartIndex = 0;

// --- COMMON FETCH+RENDER FUNCTION ---

async function fetchAndRender(query) {
  const trimmed = query.trim();
  if (!trimmed) return;

  try {
    const res = await fetch(`/api/products?name=${encodeURIComponent(trimmed)}`);
    const data = await res.json();
    renderResults(trimmed, data);
  } catch (err) {
    console.error(err);
    renderResults(trimmed, []);
  }
}

// --- SEARCH FORM ---

searchForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const query = searchInput.value;
  fetchAndRender(query);
});

// --- RENDER RESULTS ---

function renderResults(query, products) {
  // hide home cards when showing results page
  suggestionSection.classList.add('hidden');
  resultSection.classList.remove('hidden');

  resultTitle.textContent = query.charAt(0).toUpperCase() + query.slice(1);
  priceList.innerHTML = '';

  if (!Array.isArray(products) || products.length === 0) {
    priceList.innerHTML =
      '<p>No data found for this product. Try "milk", "bread" or "curd".</p>';
    bestPlatformBox.classList.add('hidden');
    return;
  }

  // find cheapest
  let cheapest = products[0];
  for (let i = 1; i < products.length; i++) {
    if (Number(products[i].price) < Number(cheapest.price)) {
      cheapest = products[i];
    }
  }

  // build rows
  products.forEach((item) => {
    const row = document.createElement('div');
    row.classList.add('price-row');
    if (item.platform === cheapest.platform) {
      row.classList.add('best');
    }

    const nameSpan = document.createElement('span');
    nameSpan.classList.add('platform');
    nameSpan.textContent = item.platform;

    const priceSpan = document.createElement('span');
    priceSpan.classList.add('price');
    priceSpan.textContent = `₹${Number(item.price).toFixed(2)}`;

    row.appendChild(nameSpan);
    row.appendChild(priceSpan);
    priceList.appendChild(row);
  });

  // best platform box
  bestPlatformBox.classList.remove('hidden');
  bestPlatformText.textContent = `${cheapest.platform} is the cheapest for "${cheapest.product_name}" at ₹${Number(
    cheapest.price
  ).toFixed(2)}.`;

  bestPlatformBtn.textContent = `${cheapest.platform} link`;
  bestPlatformBtn.onclick = () => {
    window.open(cheapest.site_url, '_blank');
  };
}

// --- FILL 6 CARDS BASED ON currentStartIndex ---

function fillCards() {
  productCards.forEach((card, i) => {
    const data = allProducts[(currentStartIndex + i) % allProducts.length];
    if (!data) return;

    card.dataset.product = data.name;

    const iconEl = card.querySelector('.card-icon');
    const titleEl = card.querySelector('.card-title');
    const descEl = card.querySelector('.card-desc');
    const btnEl = card.querySelector('.card-btn');

    if (iconEl) iconEl.textContent = data.icon;
    if (titleEl) titleEl.textContent =
      data.name.charAt(0).toUpperCase() + data.name.slice(1);
    if (descEl) descEl.textContent = data.desc;
    if (btnEl) btnEl.textContent = `Compare ${
      data.name.charAt(0).toUpperCase() + data.name.slice(1)
    }`;
  });
}

// --- ROTATE CARDS WITH FADE ANIMATION ---

function rotateCards() {
  // add fade-out class
  suggestionSection.classList.add('fading');

  setTimeout(() => {
    // after fade-out, change content
    currentStartIndex = (currentStartIndex + 1) % allProducts.length;
    fillCards();

    // fade-in
    suggestionSection.classList.remove('fading');
  }, 500); // must match CSS transition duration (0.5s)
}

// initial fill
fillCards();

// rotate every 10 seconds
setInterval(rotateCards, 10000);

// --- CLICK HANDLERS FOR CARDS AND BUTTONS ---

productCards.forEach((card) => {
  const handleClick = () => {
    const product = card.dataset.product;
    if (!product) return;
    searchInput.value = product;
    fetchAndRender(product);
  };

  card.addEventListener('click', handleClick);

  const btn = card.querySelector('.card-btn');
  if (btn) {
    btn.addEventListener('click', (e) => {
      e.stopPropagation(); // avoid double firing
      handleClick();
    });
  }
});
