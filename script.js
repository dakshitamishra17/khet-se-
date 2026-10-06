
// ===================== DATA — Bhopal-only farmers =====================
const products = [
  {id:1, name:"Fresh Tomatoes (Tamatar)", farmer:"Ramesh Patel", loc:"Berasia, Bhopal", cat:"vegetables", emoji:"🍅", price:32, mandiPrice:45, unit:"kg", fresh:true, organic:false, bg:"#fff5f5"},
  {id:2, name:"Desi Aam (Mango)", farmer:"Suresh Verma", loc:"Phanda, Bhopal", cat:"fruits", emoji:"🥭", price:120, mandiPrice:160, unit:"kg", fresh:true, organic:true, bg:"#fffbf0"},
  {id:3, name:"Organic Palak (Spinach)", farmer:"Kavita Sharma", loc:"Ratibad, Bhopal", cat:"vegetables", emoji:"🥬", price:28, mandiPrice:40, unit:"bundle", fresh:true, organic:true, bg:"#f0fff4"},
  {id:4, name:"Sharbati Gehu (Wheat)", farmer:"Gurpreet Jat", loc:"Hoshangabad Rd, Bhopal", cat:"grains", emoji:"🌾", price:30, mandiPrice:42, unit:"kg", fresh:false, organic:false, bg:"#fffef5"},
  {id:5, name:"Kele (Bananas)", farmer:"Mohan Yadav", loc:"Mandideep, Bhopal", cat:"fruits", emoji:"🍌", price:38, mandiPrice:52, unit:"dozen", fresh:true, organic:false, bg:"#fffef0"},
  {id:6, name:"Hari Mirch (Green Chillies)", farmer:"Bala Krishnan", loc:"Misrod, Bhopal", cat:"vegetables", emoji:"🌶️", price:55, mandiPrice:75, unit:"kg", fresh:true, organic:false, bg:"#fff5f0"},
  {id:7, name:"Desi Ghee", farmer:"Aarti Devi", loc:"Berasia, Bhopal", cat:"dairy", emoji:"🧈", price:480, mandiPrice:600, unit:"kg", fresh:true, organic:true, bg:"#fffcf0"},
  {id:8, name:"Aloo (Potato)", farmer:"Dinesh Verma", loc:"Vidisha Rd, Bhopal", cat:"vegetables", emoji:"🥔", price:18, mandiPrice:28, unit:"kg", fresh:true, organic:false, bg:"#faf5ef"},
  {id:9, name:"Tarbooj (Watermelon)", farmer:"Ravi Kumar", loc:"Obaidullaganj, Bhopal", cat:"fruits", emoji:"🍉", price:20, mandiPrice:30, unit:"kg", fresh:true, organic:false, bg:"#fff5f8"},
  {id:10, name:"Pyaz (Red Onion)", farmer:"Mahesh Patidar", loc:"Sehore Rd, Bhopal", cat:"vegetables", emoji:"🧅", price:22, mandiPrice:35, unit:"kg", fresh:true, organic:false, bg:"#fff8f5"},
  {id:11, name:"Dhaniya (Fresh Coriander)", farmer:"Priya Nair", loc:"Fanda, Bhopal", cat:"herbs", emoji:"🌿", price:20, mandiPrice:30, unit:"bundle", fresh:true, organic:true, bg:"#f0fff7"},
  {id:12, name:"Makka (Maize)", farmer:"Rajendra Jat", loc:"Raisen Rd, Bhopal", cat:"grains", emoji:"🌽", price:22, mandiPrice:32, unit:"kg", fresh:false, organic:false, bg:"#fffaf5"},
];

let cart = [];
let myListings = [];
let orders = [];
let activeCategory = 'all';
let selectedPayment = 'cod';
let isHindi = false;
let currentUser = null;

const translations = {
    'nav-home': { en: 'Market', hi: 'बाज़ार' },
    'nav-sell': { en: 'Farmer Central', hi: 'किसान केंद्र' },
    'nav-orders': { en: 'Orders', hi: 'आदेश' },
    'nav-dash': { en: 'Dashboard', hi: 'डैशबोर्ड' },
    'search-placeholder': { en: 'Search for "Organic Tomato" or "Berasia"...', hi: 'खोजें "जैविक टमाटर" या "बैरसिया"...' },
    'cat-all': { en: 'All', hi: 'सब' },
    'cat-veg': { en: 'Vegetables', hi: 'सब्जियां' },
    'cat-fruit': { en: 'Fruits', hi: 'फल' },
    'cat-grain': { en: 'Grains', hi: 'अनाज' },
    'cat-dairy': { en: 'Dairy', hi: 'डेयरी' },
    'welcome-msg': { en: 'Namaste, ', hi: 'नमस्ते, ' },
    'market-stats': { en: 'Market Statistics', hi: 'बाज़ार के आँकड़े' },
    'active-listings': { en: 'Active Listings', hi: 'सक्रिय लिस्टिंग' },
    'total-orders': { en: 'Active Orders', hi: 'कुल ऑर्डर' },
    'total-earnings': { en: 'Total Earnings', hi: 'कुल कमाई' },
    'ask-ai': { en: '💬 Ask AI Kisan Sahayak', hi: '💬 किसान सहायक से पूछें' },
    'ask-placeholder': { en: 'e.g. Tamatar mein paani kitna dein?', hi: 'जैसे: टमाटर में पानी कितना दें?' }
};

const API_URL = 'http://localhost:5000/api';

// Helper for Fetch Headers
function getHeaders() {
  const token = localStorage.getItem('khetse_token');
  return {
    'Content-Type': 'application/json',
    'x-auth-token': token || ''
  };
}

// ===================== RENDER PRODUCTS =====================
function renderProducts(list) {
  const grid = document.getElementById('productGrid');
  if(!list.length) {
    grid.innerHTML = '<div class="empty-state"><div class="empty-icon">🔍</div><p>No products found</p></div>';
    return;
  }
  grid.innerHTML = list.map((p,i) => {
    const savePct = Math.round(((p.mandiPrice - p.price) / p.mandiPrice) * 100);
    return `
    <div class="product-card fade-up" style="animation-delay:${i*0.05}s">
      <div class="product-img" style="background:${p.bg || '#f9f9f9'}">
        <span>${p.emoji || '🌾'}</span>
        ${p.fresh ? '<span class="fresh-badge">Just Harvested</span>' : ''}
        ${p.organic ? '<span class="organic-badge">🌿 Organic</span>' : ''}
      </div>
      <div class="product-body">
        <div class="product-name">${p.name}</div>
        <div class="product-farmer"><span class="farmer-dot"></span>${p.farmer} (ID: ${p.farmer_id || 'N/A'}) · ${p.loc}</div>
        <div class="price-compare">
          <span class="mandi-label">Mandi:</span>
          <span class="mandi-price">₹${p.mandiPrice || Math.round(p.price*1.4)}/${p.unit}</span>
          <span class="save-chip">Save ${savePct || 30}%</span>
        </div>
        <div class="product-footer">
          <div>
            <div class="product-price">₹${p.price} <span class="product-unit">/ ${p.unit}</span></div>
            <div class="farmer-price-label">✅ KhetSe Farmer Price</div>
          </div>
          <button class="add-btn" id="btn-${p.id || p._id}" onclick="instaAdd('${p.id || p._id}')">+</button>
          <div class="insta-cart-ctrl" id="ctrl-${p.id || p._id}">
            <button class="insta-minus" onclick="instaChange('${p.id || p._id}',-1)">−</button>
            <span class="insta-qty" id="qty-${p.id || p._id}">1</span>
            <button class="insta-plus" onclick="instaChange('${p.id || p._id}',1)">+</button>
          </div>
        </div>
      </div>
    </div>`;
  }).join('');
  setTimeout(syncCartStateToCards, 0);
}

function filterCategory(cat, el) {
  activeCategory = cat;
  document.querySelectorAll('.cat-card').forEach(c => c.classList.remove('active'));
  if(el) el.classList.add('active');
  applyFilters();
}

async function applyFilters() {
  const searchInput = document.getElementById('searchInput');
  const search = searchInput ? searchInput.value.toLowerCase() : '';
  
  try {
    const res = await fetch(`${API_URL}/products`);
    const allProducts = await res.json();
    
    let list = allProducts;
    if(activeCategory !== 'all') list = list.filter(p => p.cat === activeCategory);
    if(search) list = list.filter(p => p.name.toLowerCase().includes(search) || p.farmer.toLowerCase().includes(search));
    
    window.allProducts = allProducts;
    renderProducts(list);
  } catch (err) {
    console.error('Failed to fetch products:', err);
    showToast('⚠️ Server connection failed');
  }
}

// ===================== INSTAMART-STYLE CART =====================
function instaAdd(id) {
  const product = (window.allProducts || products).find(p => (p.id || p._id) === id);
  if(!product) return;
  const existing = cart.find(c => (c.id || c._id) === id);
  if(existing) { existing.qty++; }
  else { cart.push({...product, qty: 1}); }
  updateCartUI();
  
  const btn = document.getElementById('btn-'+id);
  const ctrl = document.getElementById('ctrl-'+id);
  const qtyEl = document.getElementById('qty-'+id);
  if(btn) btn.style.display = 'none';
  if(ctrl) ctrl.classList.add('visible');
  if(qtyEl) qtyEl.textContent = cart.find(c=>(c.id || c._id)===id)?.qty || 1;
  showToast(`${product.emoji || '🌾'} Added to cart!`);
}

function instaChange(id, delta) {
  const item = cart.find(c => (c.id || c._id) === id);
  if(!item) return;
  item.qty += delta;
  if(item.qty <= 0) {
    cart = cart.filter(c => (c.id || c._id) !== id);
    const btn = document.getElementById('btn-'+id);
    const ctrl = document.getElementById('ctrl-'+id);
    if(btn) btn.style.display = '';
    if(ctrl) ctrl.classList.remove('visible');
  } else {
    const qtyEl = document.getElementById('qty-'+id);
    if(qtyEl) qtyEl.textContent = item.qty;
  }
  updateCartUI();
}

function syncCartStateToCards() {
  cart.forEach(item => {
    const id = item.id || item._id;
    const btn = document.getElementById('btn-'+id);
    const ctrl = document.getElementById('ctrl-'+id);
    const qtyEl = document.getElementById('qty-'+id);
    if(btn) btn.style.display = 'none';
    if(ctrl) ctrl.classList.add('visible');
    if(qtyEl) qtyEl.textContent = item.qty;
  });
}

function updateCartUI() {
  const countEl = document.getElementById('cartCount');
  if(countEl) countEl.textContent = cart.reduce((s,i)=>s+i.qty,0);
  const items = document.getElementById('cartItems');
  const paySection = document.getElementById('paymentSection');

  if(!items) return;

  if(!cart.length) {
    items.innerHTML = '<div class="empty-state"><div class="empty-icon">🛒</div><p>Your cart is empty</p></div>';
    document.getElementById('cartSummary').innerHTML = '';
    document.getElementById('checkoutTotal').textContent = '';
    if(paySection) paySection.style.display = 'none';
    return;
  }

  items.innerHTML = cart.map(item => `
    <div class="cart-item">
      <span class="cart-item-emoji">${item.emoji || '🌾'}</span>
      <div class="cart-item-info">
        <div class="cart-item-name">${item.name}</div>
        <div class="cart-item-price">₹${item.price} / ${item.unit}</div>
      </div>
      <div class="qty-ctrl">
        <button class="qty-btn" onclick="instaChange('${item.id || item._id}',-1)">−</button>
        <span class="qty-num">${item.qty}</span>
        <button class="qty-btn" onclick="instaChange('${item.id || item._id}',1)">+</button>
      </div>
      <button class="remove-item" onclick="removeItem('${item.id || item._id}')">🗑</button>
    </div>
  `).join('');

  const subtotal = cart.reduce((s,i) => s + (i.price * i.qty), 0);
  const delivery = 30; 
  const total = subtotal + delivery;

  document.getElementById('cartSummary').innerHTML = `
    <div class="cart-row"><span>Subtotal</span><span>₹${subtotal.toLocaleString('en-IN')}</span></div>
    <div class="cart-row"><span>Delivery</span><span>₹${delivery}</span></div>
    <div class="cart-row total"><span>Total Payable</span><span>₹${total.toLocaleString('en-IN')}</span></div>
  `;
  document.getElementById('checkoutTotal').textContent = ` — ₹${total.toLocaleString('en-IN')}`;
  if(paySection) paySection.style.display = 'block';
}

function removeItem(id) {
  cart = cart.filter(c => (c.id || c._id) !== id);
  const btn = document.getElementById('btn-'+id);
  const ctrl = document.getElementById('ctrl-'+id);
  if(btn) btn.style.display = '';
  if(ctrl) ctrl.classList.remove('visible');
  updateCartUI();
}

function toggleCart() {
  document.getElementById('cartOverlay').classList.toggle('open');
  document.getElementById('cartPanel').classList.toggle('open');
}

let generatedOTP = null;

function selectPayment(method) {
    selectedPayment = method;
    document.querySelectorAll('.pay-opt').forEach(opt => opt.classList.remove('selected'));
    const target = document.getElementById('pay-' + method);
    if(target) target.classList.add('selected');
}

async function checkout() {
    if(!cart.length) { showToast('Your cart is empty!'); return; }
    const token = localStorage.getItem('khetse_token');
    if(!token) { showToast('Please login to place an order'); showLoginPage(); return; }

    toggleCart(); // Close cart panel
    
    const overlay = document.getElementById('paymentModalOverlay');
    if(!overlay) return;
    overlay.classList.add('open');
    
    if (selectedPayment === 'upi') {
        document.getElementById('upiPaymentView').style.display = 'block';
        document.getElementById('codPaymentView').style.display = 'none';
    } else {
        document.getElementById('upiPaymentView').style.display = 'none';
        document.getElementById('codPaymentView').style.display = 'block';
        // Generate random 4-digit OTP
        generatedOTP = Math.floor(1000 + Math.random() * 9000).toString();
        const otpDisplay = document.getElementById('simulated-otp');
        if(otpDisplay) otpDisplay.textContent = generatedOTP;
    }
}

function closePaymentModal() {
    const overlay = document.getElementById('paymentModalOverlay');
    if(overlay) overlay.classList.remove('open');
}

async function verifyAndPlaceOrder(method) {
    if (method === 'cod') {
        const entered = document.getElementById('cod-otp').value;
        if (entered !== generatedOTP) {
            showToast('❌ Invalid OTP. Please try again.');
            return;
        }
    } else if (method === 'upi') {
        const txn = document.getElementById('upi-txn-id').value.trim();
        if (txn.length < 8) {
            showToast('❌ Please enter a valid Transaction ID.');
            return;
        }
    }

    const subtotal = cart.reduce((s,i) => s + (i.price * i.qty), 0);
    const total = subtotal + 30;

    const orderData = {
        items: cart.map(i => ({ name: i.name, qty: i.qty, price: i.price, emoji: i.emoji || '🌾', farmer_id: i.farmer_id })),
        total,
        payment_method: selectedPayment === 'upi' ? 'UPI' : 'Cash on Delivery',
        verification_code: selectedPayment === 'upi' ? document.getElementById('upi-txn-id').value : generatedOTP
    };

    try {
        const res = await fetch(`${API_URL}/orders`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(orderData)
        });

        if (res.ok) {
            cart = [];
            updateCartUI();
            closePaymentModal();
            document.getElementById('modalOverlay').classList.add('open');
            renderOrders();
            showToast('🚀 Order placed successfully!');
        } else {
            showToast('Checkout failed');
        }
    } catch (err) {
        showToast('Connection error');
    }
}

function closeModal() {
  const modal = document.getElementById('modalOverlay');
  if(modal) modal.classList.remove('open');
  showPage('orders');
}

// ===================== FARMER =====================
async function listProduct() {
  const name = document.getElementById('f-name').value.trim();
  const cat = document.getElementById('f-cat').value;
  const price = parseInt(document.getElementById('f-price').value);
  const qty = parseInt(document.getElementById('f-qty').value);
  const loc = document.getElementById('f-loc').value;
  const organic = document.getElementById('f-organic').value === 'yes';

  if(!name||!price||!qty) { showToast('Please fill all required fields!'); return; }

  const productData = {
    name, cat: cat.toLowerCase(), price, qty, loc, organic,
    farmer: currentUser.name,
    mandiPrice: Math.round(price * 1.35),
    emoji: '🌾',
    unit: 'kg'
  };

  try {
    const res = await fetch(`${API_URL}/products`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(productData)
    });

    if(res.ok) {
      showToast(`✅ ${name} listed successfully!`);
      ['f-name','f-price','f-qty'].forEach(id => {
          const el = document.getElementById(id);
          if(el) el.value='';
      });
      renderMyListings();
      applyFilters();
    } else {
      showToast('Error listing product');
    }
  } catch (err) {
    showToast('Server connection failed');
  }
}

async function renderMyListings() {
  const el = document.getElementById('myListings');
  if(!el) return;
  
  try {
    const res = await fetch(`${API_URL}/products`);
    const all = await res.json();
    const mine = all.filter(p => String(p.farmer_id) === String(currentUser?.id));

    if(!mine.length) {
      el.innerHTML = '<div class="empty-state"><div class="empty-icon">📋</div><p>No listings yet.</p></div>';
      return;
    }
    el.innerHTML = mine.map(l => `
      <div class="listing-item">
        <span class="listing-emoji">${l.emoji || '🌾'}</span>
        <div class="listing-info">
          <div class="listing-name">${l.name}</div>
          <div class="listing-meta">📍 ${l.loc} · ${l.qty} available · Farmer ID: ${l.farmer_id || 'N/A'}</div>
        </div>
        <div style="text-align:right">
          <div class="listing-price">₹${l.price}/kg</div>
          <span class="listing-status">● Active</span>
        </div>
      </div>
    `).join('');
  } catch (err) {
    el.innerHTML = '<p>Unable to load listings.</p>';
  }
}

// ===================== AI GUIDANCE =====================
const aiKnowledge = {
  keywords: {
    'tomato|tamatar': "🍅 Tomatoes need watering every 3-4 days in summer. Apply neem oil spray every 15 days for pest control.",
    'wheat|gehu': "🌾 Wheat needs 4-6 irrigations total. First irrigation at 21 days is critical.",
    'organic': "🌿 Organic produce gets 20-30% price premium on KhetSe.",
  },
  default: "🤖 For best results in Bhopal: focus on wheat, tomato, and onion. Call KVK Bhopal (1800-180-1551) for advice."
};

function askAI() {
  const q = document.getElementById('aiQuestion').value.trim();
  if(!q) return;
  const responseEl = document.getElementById('aiResponse');
  responseEl.className = 'ai-response-box show';
  responseEl.innerHTML = 'Thinking...';

  setTimeout(() => {
    const lower = q.toLowerCase();
    let answer = aiKnowledge.default;
    for(const [pattern, response] of Object.entries(aiKnowledge.keywords)) {
      if(new RegExp(pattern).test(lower)) { answer = response; break; }
    }
    responseEl.innerHTML = `<strong>🤖 KhetSe AI:</strong><br>${answer}`;
  }, 600);
}

// ===================== ORDERS =====================
async function renderOrders() {
  const el = document.getElementById('ordersList');
  if(!el) return;
  if(!currentUser) {
    el.innerHTML = '<p>Please login to view orders</p>';
    return;
  }
  
  try {
    const res = await fetch(`${API_URL}/orders`, { headers: getHeaders() });
    const apiOrders = await res.json();

    if(!apiOrders.length) {
      el.innerHTML = '<div class="empty-state"><p>No orders yet.</p></div>';
      return;
    }

    el.innerHTML = apiOrders.map(order => `
      <div class="order-card">
        <div class="order-header">
          <div>
            <div class="order-id"># ${order.orderId}</div>
            <div class="order-date">📅 ${new Date(order.date).toLocaleDateString()}</div>
          </div>
          <span class="order-status status-${order.status}">${order.status}</span>
        </div>
        <div class="order-items">
          ${order.items.map(item=>`
            <div class="order-item">
              <span>${item.emoji || '🌾'}</span>
              <span>${item.name} × ${item.qty} (Farmer ID: ${item.farmer_id || 'N/A'})</span>
              <span>₹${item.price * item.qty}</span>
            </div>
          `).join('')}
        </div>
        <div class="order-footer">
          <div class="order-total">Total: ₹${order.total}</div>
        </div>
      </div>
    `).join('');
  } catch (err) {
    el.innerHTML = '<p>Unable to load orders.</p>';
  }
}

// ===================== DASHBOARD =====================
async function updateDashboard() {
    const ordersEl = document.getElementById('d-orders');
    const revEl = document.getElementById('d-revenue');
    const listEl = document.getElementById('d-listings'); // Assuming this exists or will be added

    if (!currentUser || currentUser.role !== 'farmer') return;

    try {
        const res = await fetch(`${API_URL}/farmer/stats`, { headers: getHeaders() });
        if (res.ok) {
            const stats = await res.json();
            if(ordersEl) ordersEl.textContent = stats.activeOrders;
            if(revEl) revEl.textContent = `₹${stats.totalEarnings.toLocaleString('en-IN')}`;
            if(listEl) listEl.textContent = stats.activeListings;
        }
    } catch (err) {
        console.error('Failed to fetch dashboard stats');
    }
}

// ===================== ACCESSIBILITY: LANGUAGE & VOICE =====================

function toggleLanguage() {
    isHindi = !isHindi;
    const btn = document.getElementById('langToggleBtn');
    if (btn) btn.textContent = isHindi ? '🌐 EN/HI' : '🌐 HI/EN';
    
    updateUI();
    showToast(isHindi ? 'भाषा बदल दी गई: हिंदी' : 'Language changed: English');
}

function updateUI() {
    const elements = document.querySelectorAll('[data-trans]');
    elements.forEach(el => {
        const key = el.getAttribute('data-trans');
        if (translations[key]) {
            if (el.tagName === 'INPUT') {
                el.placeholder = translations[key][isHindi ? 'hi' : 'en'];
            } else {
                el.textContent = translations[key][isHindi ? 'hi' : 'en'];
            }
        }
    });

    // Update conditional text based on role/state
    const nameDisp = document.getElementById('user-name-display');
    if (nameDisp && currentUser) {
        nameDisp.parentElement.childNodes[0].textContent = isHindi ? translations['welcome-msg'].hi : translations['welcome-msg'].en;
    }
}

let recognition;
if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = isHindi ? 'hi-IN' : 'en-IN';

    recognition.onresult = (event) => {
        const text = event.results[0][0].transcript;
        const input = document.getElementById('aiQuestion');
        if (input) {
            input.value = text;
            showToast(isHindi ? 'सुना गया: ' + text : 'Heard: ' + text);
            askAI(); // Automatically ask after voice input
        }
        document.getElementById('micBtn').classList.remove('recording');
    };

    recognition.onerror = () => {
        document.getElementById('micBtn').classList.remove('recording');
        showToast('⚠️ Voice recognition error');
    };

    recognition.onend = () => {
        document.getElementById('micBtn').classList.remove('recording');
    };
}

function toggleMic() {
    if (!recognition) {
        showToast('❌ Speech API not supported in this browser');
        return;
    }

    const micBtn = document.getElementById('micBtn');
    micBtn.classList.add('recording');
    recognition.lang = isHindi ? 'hi-IN' : 'en-IN';
    recognition.start();
    showToast(isHindi ? 'बोलिये, मैं सुन रहा हूँ...' : 'Listening...');
}

// --- AUTHENTICATION UI CONTROLLERS ---
let loginRole = 'consumer';
let isRegMode = false;

function selectLoginRole(role) {
    loginRole = role;
    document.querySelectorAll('.role-row').forEach(r => r.classList.remove('selected'));
    if(role) {
        const row = document.getElementById('role-row-' + role);
        if(row) row.classList.add('selected');
        const fields = document.getElementById('loginFields');
        if(fields) fields.style.display = 'block';
    } else {
        const fields = document.getElementById('loginFields');
        if(fields) fields.style.display = 'none';
    }
}

function toggleAuthMode() {
    isRegMode = !isRegMode;
    const title = document.getElementById('loginTitle');
    const btnText = document.getElementById('loginBtnText');
    const toggleBtn = document.getElementById('authToggleBtn');
    const nameGroup = document.getElementById('regNameGroup');

    if (isRegMode) {
        if(title) title.innerText = "Join KhetSe";
        if(btnText) btnText.innerText = "Create Account →";
        if(toggleBtn) toggleBtn.innerText = "Login here";
        if(nameGroup) nameGroup.style.display = 'block';
    } else {
        if(title) title.innerText = "Welcome to KhetSe";
        if(btnText) btnText.innerText = "Sign In →";
        if(toggleBtn) toggleBtn.innerText = "Register here";
        if(nameGroup) nameGroup.style.display = 'none';
    }
}

function togglePassVis() {
    const passInput = document.getElementById('lf-pass');
    const btn = document.getElementById('passToggleBtn');
    if (passInput && passInput.type === 'password') {
        passInput.type = 'text';
        if(btn) btn.innerText = '🔒';
    } else if(passInput) {
        passInput.type = 'password';
        if(btn) btn.innerText = '👁️';
    }
}

async function handleAuthSubmit() {
    const emailEl = document.getElementById('lf-email');
    const passEl = document.getElementById('lf-pass');
    const nameEl = document.getElementById('lf-name');
    const errorDiv = document.getElementById('loginError');
    
    if (!emailEl || !passEl) return;
    
    const email = emailEl.value;
    const password = passEl.value;
    const name = nameEl ? nameEl.value : '';
    
    if (errorDiv) errorDiv.style.display = 'none';

    if (!email || !password || (isRegMode && !name)) {
        if (errorDiv) {
            errorDiv.innerText = "Please fill all fields";
            errorDiv.style.display = 'block';
        }
        return;
    }

    const endpoint = isRegMode ? '/auth/register' : '/auth/login';
    const payload = isRegMode 
        ? { name, email, password, role: loginRole }
        : { email, password };

    try {
        const response = await fetch(`${API_URL}${endpoint}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const data = await response.json();

        if (response.ok) {
            localStorage.setItem('khetse_token', data.token);
            localStorage.setItem('khetse_user', JSON.stringify(data.user));
            currentUser = data.user;
            location.reload(); 
        } else {
            if (errorDiv) {
                errorDiv.innerText = data.msg || "Auth failed";
                errorDiv.style.display = 'block';
            }
        }
    } catch (err) {
        if (errorDiv) {
            errorDiv.innerText = "Backend is not running!";
            errorDiv.style.display = 'block';
        }
    }
}

function updateNavUI() {
  if(!currentUser) return;
  const btn = document.getElementById('loginNavBtn');
  if(!btn) return;
  btn.innerHTML = `<span>${currentUser.role === 'farmer' ? '🌾' : '👤'}</span><span class="login-btn-text">${currentUser.name}</span>`;
  btn.classList.add('logged-in');
  btn.onclick = handleLogout;
}

function handleLogout() {
  localStorage.removeItem('khetse_token');
  localStorage.removeItem('khetse_user');
  currentUser = null;
  location.reload();
}

function showLoginPage() {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-tab').forEach(t => t.classList.remove('active'));
  const loginPage = document.getElementById('page-login');
  if(loginPage) loginPage.classList.add('active');
  selectLoginRole(null);
}

// ===================== UTILS =====================
function showPage(name) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-tab').forEach(t => t.classList.remove('active'));
  const pg = document.getElementById('page-'+name);
  if(pg) pg.classList.add('active');
  
  const tabs = document.querySelectorAll('.nav-tab');
  const pages = ['home','farmer','orders','dashboard'];
  const idx = pages.indexOf(name);
  if(idx !== -1 && tabs[idx]) tabs[idx].classList.add('active');
  
  if(name==='orders') renderOrders();
  if(name==='dashboard') updateDashboard();
  if(name==='home') setTimeout(syncCartStateToCards, 0);
}

function showToast(msg) {
  const t = document.getElementById('toast');
  if(!t) return;
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(()=>t.classList.remove('show'), 2800);
}

// ===================== INIT =====================
window.onload = () => {
    const savedUser = localStorage.getItem('khetse_user');
    const token = localStorage.getItem('khetse_token');
    
    if (savedUser && token) {
        currentUser = JSON.parse(savedUser);
        updateNavUI();
        const loginPage = document.getElementById('page-login');
        if(loginPage) loginPage.classList.remove('active');
        const homePage = document.getElementById('page-home');
        if(homePage) homePage.classList.add('active');
        const nav = document.querySelector('nav');
        if(nav) nav.style.display = 'flex';
        
        const nameDisp = document.getElementById('user-name-display');
        if (nameDisp) nameDisp.innerText = currentUser.name;
        
        if (currentUser.role === 'farmer') {
            const navSell = document.getElementById('nav-sell');
            if(navSell) navSell.style.display = 'block';
            renderMyListings();
        }
        
        applyFilters();
        renderOrders();
        updateDashboard();
    } else {
        showLoginPage();
    }
};
