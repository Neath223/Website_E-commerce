/* ===========================
   MOBILE MENU MODULE
   =========================== */
const MobileMenu = (() => {
  const els = {
    navLinks: document.querySelectorAll(".nav-link"),
    menuOpenBtn: document.querySelector("#menu-open-button"),
    menuCloseBtn: document.querySelector("#menu-close-button")
  };

  return {
    init() {
      els.menuOpenBtn?.addEventListener("click", () => {
        document.body.classList.add("show-mobile-menu");
      });

      els.menuCloseBtn?.addEventListener("click", () => {
        document.body.classList.remove("show-mobile-menu");
      });

      els.navLinks.forEach(link => {
        link.addEventListener("click", () => {
          document.body.classList.remove("show-mobile-menu");
        });
      });
    }
  };
})();

/* ===========================
   IMAGE GALLERY MODULE
   =========================== */
const ImageGallery = (() => {
  return {
    changeImage(el) {
      const mainImg = document.getElementById('mainProductImage');
      if (mainImg && el.src) mainImg.src = el.src;
      
      document.querySelectorAll('.thumbnail-images .img-thumbnail').forEach(thumb => {
        thumb.classList.remove('active');
      });
      el.classList.add('active');
    }
  };
})();

/* ===========================
   QUANTITY SELECTOR MODULE
   =========================== */
const QuantitySelector = (() => {
  return {
    increase() {
      const input = document.getElementById('quantityInput');
      if (!input) return;
      input.value = (parseInt(input.value) || 1) + 1;
    },

    decrease() {
      const input = document.getElementById('quantityInput');
      if (!input) return;
      const val = parseInt(input.value) || 1;
      if (val > 1) input.value = val - 1;
    }
  };
})();

/* ===========================
   SWIPER SLIDER MODULE
   =========================== */
const TestimonialSlider = (() => {
  let swiper = null;

  return {
    init() {
      const wrapper = document.querySelector('.slider-wrapper');
      if (!wrapper) return;

      swiper = new Swiper('.slider-wrapper', {
        loop: true,
        grabCursor: true,
        spaceBetween: 25,
        autoplay: { delay: 3000 },
        pagination: {
          el: '.swiper-pagination',
          clickable: true,
          dynamicBullets: true,
        },
        navigation: {
          nextEl: '.swiper-button-next',
          prevEl: '.swiper-button-prev',
        },
        breakpoints: {
          0: { slidesPerView: 1 },
          768: { slidesPerView: 2 },
          1024: { slidesPerView: 3 },
        }
      });
    },

    destroy() {
      swiper?.destroy();
    }
  };
})();

/* ===========================
   CART MODULE
   =========================== */
const Cart = (() => {
  let cart = [];
  const STORAGE_KEY = 'shoppingCart';

  // HELPERS
  const save = () => localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
  
  const updateCount = () => {
    const total = cart.reduce((sum, item) => sum + item.quantity, 0);
    const counter = document.getElementById('cart-count');
    if (counter) {
      counter.textContent = total;
      counter.style.display = total > 0 ? 'inline' : 'none';
    }
  };

  const notify = (msg) => {
    const note = document.createElement('div');
    note.className = 'cart-notification';
    note.textContent = msg;
    document.body.appendChild(note);
    
    setTimeout(() => {
      note.classList.add('fade-out');
      setTimeout(() => note.remove(), 0);
    }, 0);
  };

  const findItem = (product) => 
    cart.find(item => item.id === product.id && item.size === product.size);

  // PUBLIC API
  return {
    init() {
      const saved = localStorage.getItem(STORAGE_KEY);
      cart = saved ? JSON.parse(saved) : [];
      updateCount();
    },

    add(product) {
      const existing = findItem(product);
      
      if (existing) {
        existing.quantity += product.quantity;
      } else {
        cart.push({ ...product });
      }

      save();
      updateCount();
      notify(`${product.name} added to cart!`);
    },

    remove(index) {
      if (index < 0 || index >= cart.length) return null;
      
      const [removed] = cart.splice(index, 1);
      save();
      updateCount();
      notify(`${removed.name} removed from cart`);
      return removed;
    },

    updateQty(index, qty) {
      if (index < 0 || index >= cart.length || qty <= 0) return false;
      
      cart[index].quantity = qty;
      save();
      updateCount();
      return true;
    },

    getAll: () => [...cart],
    
    getTotal: () => cart.reduce((sum, item) => sum + (item.price * item.quantity), 0),
    
    clear() {
      cart = [];
      save();
      updateCount();
      notify('Cart cleared!');
    },
    
    clearStorage() {
      // Comment out to keep cart data when navigating
      // localStorage.removeItem(STORAGE_KEY);
      // cart = [];
      // updateCount();
    }
  };
})();

/* ===========================
   UI MODULE
   =========================== */
const UI = (() => {
  // DOM SELECTORS
  const els = {
    cartIcon: '#cart-icon',
    cartModal: '#cart-modal',
    closeCart: '#close-cart',
    cartItems: '#cart-items',
    cartTotal: '#cart-total',
    productItems: '.product-item',
    modalAddBtn: '#modalAddToCart',
    qtyInput: '#quantityInput',
    mainImage: '#mainProductImage'
  };

  // STATE
  let modal = null;

  // DOM HELPERS
  const $ = (selector) => document.querySelector(selector);
  const $$ = (selector) => document.querySelectorAll(selector);

  // PRODUCT HELPERS
  const getModalProduct = () => {
    const modalEl = $('#myModal');
    if (!modalEl) return null;
    
    const sizeBtn = modalEl.querySelector('.btn-group input:checked');
    
    return {
      id: modalEl.dataset.productId || Date.now().toString(),
      name: modalEl.querySelector('.modal-body h2')?.textContent || 'Product',
      price: parseFloat(modalEl.querySelector('.current-price')?.textContent.replace(/[^\d.]/g, '') || 0),
      image: $(els.mainImage)?.src || '',
      size: sizeBtn?.nextElementSibling?.textContent || 'M',
      quantity: parseInt($(els.qtyInput)?.value) || 1
    };
  };

  const setupModal = (productCard) => {
    try {
      const modalEl = $('#myModal');
      if (!modalEl) return;
      
      const name = productCard.querySelector('.name').textContent;
      const priceText = productCard.querySelector('.discount').textContent;
      const origText = productCard.querySelector('.original').textContent;
      const img = productCard.querySelector('img').src;
      const id = productCard.dataset.productId || Date.now().toString();
      
      const price = parseFloat(priceText.replace(/[^\d.]/g, ''));
      const origPrice = parseFloat(origText.replace(/[^\d.]/g, ''));
      const discount = Math.round(((origPrice - price) / origPrice) * 100);
      
      // Update modal
      modalEl.dataset.productId = id;
      $(els.mainImage).src = img;
      modalEl.querySelector('.modal-body h2').textContent = name;
      modalEl.querySelector('.current-price').textContent = `After Discount: $${price.toFixed(2)}`;
      modalEl.querySelector('.original-price').textContent = `Original: $${origPrice.toFixed(2)}`;
      modalEl.querySelector('.discount-badge').textContent = `Discount: ${discount}%`;
      $(els.qtyInput).value = 1;
      
      // Update thumbnails
      $$('.thumbnail-images .img-thumbnail').forEach(thumb => {
        thumb.classList.remove('active');
        if (thumb.src === img) thumb.classList.add('active');
      });
      
    } catch (err) {
      console.error('Modal setup error:', err);
    }
  };

  const addFromModal = () => {
    const product = getModalProduct();
    if (product) {
      Cart.add(product);
      modal?.hide();
    }
  };

  // CART RENDERING
  const renderCart = () => {
    const cart = Cart.getAll();
    const container = $(els.cartItems);
    const totalEl = $(els.cartTotal);
    
    if (!container || !totalEl) return;
    
    if (cart.length === 0) {
      container.innerHTML = '<li class="cart-item">Your cart is empty</li>';
      totalEl.textContent = '0.00';
      return;
    }
    
    container.innerHTML = cart.map((item, i) => `
      <li class="cart-item d-flex align-items-center mb-3">
        <div class="flex-shrink-0">
          <img src="${item.image}" alt="${item.name}" width="60" class="img-thumbnail">
        </div>
        <div class="flex-grow-1 ms-3">
          <h6 class="mb-1">${item.name}</h6>
          <small class="text-muted">Size: ${item.size}</small>
          <div class="price">Price: $${(item.price * item.quantity).toFixed(2)}</div>
          <div class="d-flex justify-content-between align-items-center mt-2">
            <div class="quantity-controls">
              <button class="btn btn-sm btn-outline-secondary dec" data-index="${i}">-</button>
              <span class="mx-2">${item.quantity}</span>
              <button class="btn btn-sm btn-outline-secondary inc" data-index="${i}">+</button>
            </div>
          </div>
        </div>
        <button class="btn btn-sm btn-danger remove ms-3" data-index="${i}">
          <i class="fa-solid fa-trash"></i>
        </button>
      </li>
    `).join('');
    
    totalEl.textContent = Cart.getTotal().toFixed(2);
  };

  // EVENT HANDLERS
  const handleCartActions = (e) => {
    const btn = e.target.closest('.remove, .dec, .inc');
    if (!btn) return;
    
    const index = parseInt(btn.dataset.index);
    const cart = Cart.getAll();
    
    if (btn.classList.contains('remove')) {
      Cart.remove(index);
    } 
    else if (btn.classList.contains('dec')) {
      const qty = cart[index].quantity;
      qty > 1 ? Cart.updateQty(index, qty - 1) : Cart.remove(index);
    } 
    else if (btn.classList.contains('inc')) {
      Cart.updateQty(index, cart[index].quantity + 1);
    }
    
    renderCart();
  };

  const handleProductClick = (e) => {
    const btn = e.target.closest('.add-to-cart');
    if (!btn) return;
    
    e.preventDefault();
    e.stopPropagation();
    
    const card = btn.closest(els.productItems);
    setupModal(card);
    
    const modalEl = $('#myModal');
    if (modalEl) {
      modal = new bootstrap.Modal(modalEl);
      modal.show();
    }
  };

  // PUBLIC API
  return {
    init() {
      // Cart
      $(els.cartIcon)?.addEventListener('click', () => {
        renderCart();
        $(els.cartModal)?.classList.remove('hidden');
      });
      
      $(els.closeCart)?.addEventListener('click', () => {
        $(els.cartModal)?.classList.add('hidden');
      });
      
      // Products
      $$(els.productItems).forEach((item, i) => {
        if (!item.dataset.productId) item.dataset.productId = `product-${i + 1}`;
        item.addEventListener('click', handleProductClick);
      });
      
      // Modal
      $(els.modalAddBtn)?.addEventListener('click', (e) => {
        e.preventDefault();
        addFromModal();
      });
      
      // Cart actions
      $(els.cartItems)?.addEventListener('click', handleCartActions);
      
      // Modal cleanup
      $('#myModal')?.addEventListener('hidden.bs.modal', () => {
        $$('.modal-backdrop').forEach(el => el.remove());
        document.body.classList.remove('modal-open');
        document.body.style.cssText = '';
      });
    },

    changeImage(el) {
      const mainImg = $(els.mainImage);
      if (mainImg && el.src) mainImg.src = el.src;
      
      $$('.thumbnail-images .img-thumbnail').forEach(thumb => {
        thumb.classList.remove('active');
      });
      el.classList.add('active');
    },

    adjustQty(dir) {
      const input = $(els.qtyInput);
      if (!input) return;
      
      let val = parseInt(input.value) || 1;
      if (dir === 'up') {
        input.value = val + 1;
      } else if (dir === 'down' && val > 1) {
        input.value = val - 1;
      }
    }
  };
})();

/* ===========================
   INITIALIZATION
   =========================== */
document.addEventListener('DOMContentLoaded', () => {
  MobileMenu.init();
  Cart.init();
  UI.init();
  TestimonialSlider.init();
});

/* ===========================
   GLOBAL FUNCTIONS (HTML onclick)
   =========================== */
window.changeImage = (el) => UI.changeImage(el);
window.increaseQuantity = () => UI.adjustQty('up');
window.decreaseQuantity = () => UI.adjustQty('down');