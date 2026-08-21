// ================================================================
// script.js - Common JavaScript for all pages
// ================================================================

// ----- INTRO VIDEO -----
document.addEventListener('DOMContentLoaded', function() {
    var overlay = document.getElementById('introOverlay');
    var video = document.getElementById('introVideo');
    if (video) {
        video.addEventListener('ended', function() { overlay.classList.add('hide'); });
        setTimeout(function() { overlay.classList.add('hide'); }, 10000);
    } else {
        setTimeout(function() { overlay.classList.add('hide'); }, 3000);
    }
});

// ----- CART FUNCTIONS -----
function getCart() {
    try { return JSON.parse(localStorage.getItem('vantapixCart')) || []; } 
    catch(e) { return []; }
}

function saveCart(cart) {
    localStorage.setItem('vantapixCart', JSON.stringify(cart));
}

function updateBadge() {
    var cart = getCart();
    var count = 0;
    cart.forEach(function(item) { count += item.quantity; });
    var badge = document.getElementById('cartBadge');
    if (badge) {
        badge.textContent = count;
        if (count > 0) {
            badge.classList.remove('bounce');
            void badge.offsetWidth;
            badge.classList.add('bounce');
        }
    }
    updateDropdown();
}

function updateDropdown() {
    var cart = getCart();
    var total = 0;
    var items = document.getElementById('cartItems');
    var totalDiv = document.getElementById('cartTotal');
    var totalPrice = document.getElementById('totalPrice');
    if (!items) return;
    if (cart.length === 0) {
        items.innerHTML = '<div class="empty-cart">Your cart is empty.</div>';
        if (totalDiv) totalDiv.style.display = 'none';
    } else {
        var html = '';
        cart.forEach(function(item, index) {
            total += item.price * item.quantity;
            html += `
                <div class="cart-item">
                    <span class="item-name">${item.name} × ${item.quantity}</span>
                    <span>
                        <span class="item-price">₹${(item.price * item.quantity).toFixed(2)}</span>
                        <button class="item-remove" onclick="removeFromCart(${index})">✕</button>
                    </span>
                </div>
            `;
        });
        items.innerHTML = html;
        if (totalDiv) {
            totalDiv.style.display = 'flex';
            if (totalPrice) totalPrice.textContent = total.toFixed(2);
        }
    }
}

function removeFromCart(index) {
    var cart = getCart();
    cart.splice(index, 1);
    saveCart(cart);
    updateBadge();
    showToast('✕ Item removed from cart');
}

function addToCart(name, price, qty) {
    var cart = getCart();
    var existing = cart.find(function(item) { return item.name === name; });
    if (existing) { existing.quantity += qty; } 
    else { cart.push({ name: name, price: price, quantity: qty }); }
    saveCart(cart);
    updateBadge();
    showToast('🛒 Added ' + qty + ' × ' + name + ' to cart!');
}

// ----- QUANTITY POPUP -----
var currentProduct = null;
var currentQty = 1;

function openQtyPopup(name, price) {
    currentProduct = { name: name, price: price };
    currentQty = 1;
    var nameEl = document.getElementById('modalProductName');
    var priceEl = document.getElementById('modalProductPrice');
    var displayEl = document.getElementById('qtyDisplay');
    if (nameEl) nameEl.textContent = name;
    if (priceEl) priceEl.textContent = '₹' + price.toFixed(2) + ' each';
    if (displayEl) displayEl.textContent = '1';
    var overlay = document.getElementById('quantityOverlay');
    if (overlay) {
        overlay.classList.add('open');
        document.body.style.overflow = 'hidden';
    }
}

function closeQtyPopup() {
    var overlay = document.getElementById('quantityOverlay');
    if (overlay) {
        overlay.classList.remove('open');
        document.body.style.overflow = '';
    }
    currentProduct = null;
}

// ----- TOAST -----
function showToast(message) {
    var toast = document.getElementById('toast');
    if (!toast) return;
    toast.textContent = message;
    toast.className = 'toast show';
    clearTimeout(toast._timeout);
    toast._timeout = setTimeout(function() { toast.classList.remove('show'); }, 3000);
}

// ----- CART TOGGLE & QUANTITY CONTROLS -----
document.addEventListener('DOMContentLoaded', function() {
    // Cart dropdown toggle
    var toggle = document.getElementById('cartToggle');
    var dropdown = document.getElementById('cartDropdown');
    if (toggle) {
        toggle.addEventListener('click', function(e) {
            e.stopPropagation();
            if (dropdown) dropdown.classList.toggle('open');
        });
    }
    document.addEventListener('click', function(e) {
        var wrapper = document.querySelector('.nav-cart-wrapper');
        if (wrapper && !wrapper.contains(e.target)) {
            if (dropdown) dropdown.classList.remove('open');
        }
    });

    // Quantity popup controls
    var dec = document.getElementById('qtyDecrease');
    var inc = document.getElementById('qtyIncrease');
    var cancel = document.getElementById('qtyCancel');
    var confirm = document.getElementById('qtyConfirm');
    var overlay = document.getElementById('quantityOverlay');
    var display = document.getElementById('qtyDisplay');

    if (dec) {
        dec.addEventListener('click', function() {
            if (currentQty > 1) { currentQty--; if (display) display.textContent = currentQty; }
        });
    }
    if (inc) {
        inc.addEventListener('click', function() {
            if (currentQty < 99) { currentQty++; if (display) display.textContent = currentQty; }
        });
    }
    if (cancel) {
        cancel.addEventListener('click', closeQtyPopup);
    }
    if (confirm) {
        confirm.addEventListener('click', function() {
            if (currentProduct) {
                addToCart(currentProduct.name, currentProduct.price, currentQty);
                closeQtyPopup();
            }
        });
    }
    if (overlay) {
        overlay.addEventListener('click', function(e) {
            if (e.target === this) closeQtyPopup();
        });
    }

    // Update cart badge on load
    updateBadge();

    // Search on all pages
    var searchBtn = document.getElementById('searchButton');
    var searchInput = document.getElementById('searchInput');
    if (searchBtn && searchInput) {
        searchBtn.addEventListener('click', function() {
            var query = searchInput.value.trim();
            if (query) {
                window.location.href = 'products.html?search=' + encodeURIComponent(query);
            }
        });
        searchInput.addEventListener('keydown', function(e) {
            if (e.key === 'Enter') searchBtn.click();
        });
    }

    // Fix: Attach add-to-cart buttons on all pages
    attachAddToCartButtons();
});

// ----- ATTACH ADD TO CART (for dynamic content) -----
function attachAddToCartButtons() {
    document.querySelectorAll('.add-to-cart').forEach(function(btn) {
        btn.removeEventListener('click', handleAddToCart);
        btn.addEventListener('click', handleAddToCart);
    });
}

function handleAddToCart(e) {
    e.stopPropagation();
    var name = this.dataset.name;
    var price = parseFloat(this.dataset.price);
    if (name && price) {
        openQtyPopup(name, price);
    } else {
        showToast('Error: Product information missing.');
    }
}

// ----- BUY NOW BUTTON (redirect to checkout) -----
function buyNow(name, price) {
    openQtyPopup(name, price);
}

// ----- FOR GLOBAL ACCESS (for inline onclick) -----
window.openQtyPopup = openQtyPopup;
window.addToCart = addToCart;
window.buyNow = buyNow;
window.showToast = showToast;
window.getCart = getCart;
window.saveCart = saveCart;
window.removeFromCart = removeFromCart;
window.updateBadge = updateBadge;