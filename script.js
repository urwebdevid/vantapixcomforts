// ============================================================
// script.js - Common JavaScript for all pages
// ============================================================

// ----- CART SYSTEM -----
let cart = [];

// Load cart from localStorage
function loadCart() {
    const stored = localStorage.getItem('vantapixCart');
    if (stored) {
        try {
            cart = JSON.parse(stored);
        } catch (e) {
            cart = [];
        }
    } else {
        cart = [];
    }
    updateCartUI();
}

// Save cart to localStorage
function saveCart() {
    localStorage.setItem('vantapixCart', JSON.stringify(cart));
}

// Add to cart with quantity
function addToCartWithQuantity(name, price, quantity) {
    const existing = cart.find(item => item.name === name);
    if (existing) {
        existing.quantity += quantity;
    } else {
        cart.push({ name, price, quantity });
    }
    saveCart();
    updateCartUI();
    showToast(`🛒 Added ${quantity} × ${name} to cart! (${cart.reduce((s, i) => s + i.quantity, 0)} items)`);
}

// Update cart UI (badge and dropdown)
function updateCartUI() {
    const count = cart.reduce((sum, item) => sum + item.quantity, 0);
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    const badge = document.getElementById('cartBadge');
    if (badge) {
        badge.textContent = count;
        if (count > 0) {
            badge.style.display = 'inline';
            badge.classList.remove('bounce');
            void badge.offsetWidth;
            badge.classList.add('bounce');
        } else {
            badge.style.display = 'inline';
            badge.textContent = '0';
        }
    }

    // Update dropdown
    const cartItems = document.getElementById('cartItems');
    const cartTotal = document.getElementById('cartTotal');
    const totalPrice = document.getElementById('totalPrice');

    if (cartItems) {
        if (cart.length === 0) {
            cartItems.innerHTML = '<div class="empty-cart">Your cart is empty.</div>';
            if (cartTotal) cartTotal.style.display = 'none';
        } else {
            let html = '';
            cart.forEach((item, index) => {
                html += `
                    <div class="cart-item">
                        <span class="item-name">${item.name} × ${item.quantity}</span>
                        <span>
                            <span class="item-price">$${(item.price * item.quantity).toFixed(2)}</span>
                            <button class="item-remove" data-index="${index}" aria-label="Remove item">✕</button>
                        </span>
                    </div>
                `;
            });
            cartItems.innerHTML = html;
            if (cartTotal) {
                cartTotal.style.display = 'flex';
                if (totalPrice) totalPrice.textContent = total.toFixed(2);
            }

            // Add remove listeners
            document.querySelectorAll('.item-remove').forEach(btn => {
                btn.addEventListener('click', function(e) {
                    e.stopPropagation();
                    const idx = parseInt(this.dataset.index);
                    const removed = cart[idx];
                    cart.splice(idx, 1);
                    saveCart();
                    updateCartUI();
                    showToast(`✕ Removed ${removed.name} from cart`, false);
                });
            });
        }
    }
}

// Toast notification
function showToast(message, isAdd = true) {
    const toast = document.getElementById('toast');
    if (toast) {
        toast.textContent = message;
        toast.className = 'toast show';
        clearTimeout(toast._timeout);
        toast._timeout = setTimeout(() => {
            toast.classList.remove('show');
        }, 2500);
    }
}

// ----- QUANTITY POPUP -----
let currentProduct = null;
let currentQuantity = 1;

function openQuantityPopup(name, price) {
    currentProduct = { name, price };
    currentQuantity = 1;
    const modalProductName = document.getElementById('modalProductName');
    const modalProductPrice = document.getElementById('modalProductPrice');
    const qtyDisplay = document.getElementById('qtyDisplay');
    
    if (modalProductName) modalProductName.textContent = name;
    if (modalProductPrice) modalProductPrice.textContent = `$${price.toFixed(2)} each`;
    if (qtyDisplay) qtyDisplay.textContent = '1';
    
    const overlay = document.getElementById('quantityOverlay');
    if (overlay) {
        overlay.classList.add('open');
        document.body.style.overflow = 'hidden';
    }
}

function closeQuantityPopup() {
    const overlay = document.getElementById('quantityOverlay');
    if (overlay) {
        overlay.classList.remove('open');
        document.body.style.overflow = '';
    }
    currentProduct = null;
}

// Initialize quantity popup controls
function initQuantityPopup() {
    const qtyDecrease = document.getElementById('qtyDecrease');
    const qtyIncrease = document.getElementById('qtyIncrease');
    const qtyDisplay = document.getElementById('qtyDisplay');
    const qtyCancel = document.getElementById('qtyCancel');
    const qtyConfirm = document.getElementById('qtyConfirm');
    const overlay = document.getElementById('quantityOverlay');

    if (qtyDecrease) {
        qtyDecrease.addEventListener('click', function() {
            if (currentQuantity > 1) {
                currentQuantity--;
                if (qtyDisplay) qtyDisplay.textContent = currentQuantity;
            }
        });
    }

    if (qtyIncrease) {
        qtyIncrease.addEventListener('click', function() {
            if (currentQuantity < 99) {
                currentQuantity++;
                if (qtyDisplay) qtyDisplay.textContent = currentQuantity;
            }
        });
    }

    if (qtyCancel) {
        qtyCancel.addEventListener('click', closeQuantityPopup);
    }

    if (qtyConfirm) {
        qtyConfirm.addEventListener('click', function() {
            if (currentProduct) {
                addToCartWithQuantity(
                    currentProduct.name,
                    currentProduct.price,
                    currentQuantity
                );
                closeQuantityPopup();
            }
        });
    }

    if (overlay) {
        overlay.addEventListener('click', function(e) {
            if (e.target === this) {
                closeQuantityPopup();
            }
        });
    }

    // Keyboard shortcuts
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && overlay && overlay.classList.contains('open')) {
            closeQuantityPopup();
        }
        if (e.key === 'Enter' && overlay && overlay.classList.contains('open')) {
            if (qtyConfirm) qtyConfirm.click();
        }
    });
}

// ----- CART TOGGLE -----
function initCartToggle() {
    const cartToggle = document.getElementById('cartToggle');
    const cartDropdown = document.getElementById('cartDropdown');

    if (cartToggle) {
        cartToggle.addEventListener('click', function(e) {
            e.stopPropagation();
            if (cartDropdown) {
                cartDropdown.classList.toggle('open');
            }
        });
    }

    document.addEventListener('click', function(e) {
        const wrapper = document.getElementById('cartWrapper');
        if (wrapper && !wrapper.contains(e.target)) {
            if (cartDropdown) {
                cartDropdown.classList.remove('open');
            }
        }
    });
}

// ----- SEARCH FUNCTIONALITY -----
function initSearch() {
    const searchInput = document.getElementById('searchInput');
    const searchButton = document.getElementById('searchButton');
    const productCards = document.querySelectorAll('.product-card');
    const noResults = document.getElementById('noResults');

    function filterProducts() {
        if (!searchInput) return;
        const query = searchInput.value.toLowerCase().trim();
        let visibleCount = 0;

        productCards.forEach(card => {
            const name = card.getAttribute('data-name')?.toLowerCase() || '';
            const category = card.getAttribute('data-category')?.toLowerCase() || '';
            const matches = query === '' || name.includes(query) || category.includes(query);

            if (matches) {
                card.classList.remove('hidden');
                visibleCount++;
            } else {
                card.classList.add('hidden');
            }
        });

        if (noResults) {
            if (visibleCount === 0 && query !== '') {
                noResults.classList.add('show');
            } else {
                noResults.classList.remove('show');
            }
        }
    }

    if (searchInput) {
        searchInput.addEventListener('input', filterProducts);
    }
    if (searchButton) {
        searchButton.addEventListener('click', filterProducts);
    }
    if (searchInput) {
        searchInput.addEventListener('keydown', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                filterProducts();
            }
        });
    }
}

// ----- INITIALIZE CART LISTENERS (for dynamically added buttons) -----
function initializeCartListeners() {
    document.querySelectorAll('.add-to-cart').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            const name = this.dataset.name;
            const price = parseFloat(this.dataset.price);
            openQuantityPopup(name, price);
        });
    });
}

// ----- SYNC CART FROM LOCAL STORAGE (for cart page) -----
function syncCartFromLocalStorage() {
    const stored = localStorage.getItem('vantapixCart');
    if (stored) {
        try {
            cart = JSON.parse(stored);
            updateCartUI();
        } catch (e) {
            cart = [];
        }
    }
}

// ----- BUTTER SMOOTH CARDS -----
function initCardButter() {
    document.querySelectorAll('.product-card').forEach(card => {
        card.addEventListener('mouseenter', () => {
            card.style.transition = 'transform 0.35s cubic-bezier(0.15, 0.85, 0.3, 1.1), box-shadow 0.4s ease';
        });
        card.addEventListener('mouseleave', () => {
            card.style.transition = 'transform 0.3s cubic-bezier(0.23, 1, 0.32, 1), box-shadow 0.3s ease';
        });
    });
}

// ----- INTRO VIDEO -----
function initIntroVideo() {
    const overlay = document.getElementById('introOverlay');
    const video = document.getElementById('introVideo');

    function hideOverlay() {
        if (overlay) overlay.classList.add('hide');
    }

    if (video) {
        video.addEventListener('ended', hideOverlay);
        setTimeout(hideOverlay, 10000);
    } else {
        setTimeout(hideOverlay, 3000);
    }
}

// ----- DOM CONTENT LOADED -----
document.addEventListener('DOMContentLoaded', function() {
    // Load cart from localStorage
    loadCart();
    
    // Initialize components
    initIntroVideo();
    initQuantityPopup();
    initCartToggle();
    initSearch();
    initCardButter();
    
    // Initialize cart listeners for existing buttons
    setTimeout(() => {
        initializeCartListeners();
    }, 100);
    
    // Checkout button
    const checkoutBtn = document.getElementById('checkoutBtn');
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', function() {
            if (cart.length === 0) {
                showToast('Your cart is empty!', false);
                return;
            }
            window.location.href = 'cart.html';
        });
    }

    console.log('🟠 VANTAPIX COMFORTS · All systems ready');
});