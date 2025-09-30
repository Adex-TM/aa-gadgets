// AA Gadgets - Unified Application JavaScript
// ===============================================

// Global App State
const App = {
    // Configuration
    config: {
        cartKey: 'aagadgets_cart',
        themeKey: 'aagadgets_theme',
        wishlistKey: 'aagadgets_wishlist'
    },
    
    // State
    state: {
        cart: [],
        wishlist: [],
        currentPage: null,
        isMobile: false,
        isMenuOpen: false
    },
    
    // Initialize app
    init() {
        this.detectMobile();
        this.loadState();
        this.setupGlobalEventListeners();
        this.initializePage();
        this.setupNavigation();
    },
    
    // Mobile detection
    detectMobile() {
        this.state.isMobile = window.innerWidth <= 768;
        window.addEventListener('resize', () => {
            this.state.isMobile = window.innerWidth <= 768;
            this.updateMobileUI();
        });
    },
    
    // Load state from localStorage
    loadState() {
        try {
            const cart = localStorage.getItem(this.config.cartKey);
            if (cart) this.state.cart = JSON.parse(cart);
            
            const wishlist = localStorage.getItem(this.config.wishlistKey);
            if (wishlist) this.state.wishlist = JSON.parse(wishlist);
        } catch (e) {
            console.warn('Failed to load state from localStorage:', e);
        }
    },
    
    // Save state to localStorage
    saveState() {
        try {
            localStorage.setItem(this.config.cartKey, JSON.stringify(this.state.cart));
            localStorage.setItem(this.config.wishlistKey, JSON.stringify(this.state.wishlist));
        } catch (e) {
            console.warn('Failed to save state to localStorage:', e);
        }
    },
    
    // Setup global event listeners
    setupGlobalEventListeners() {
        // Theme toggle
        const themeToggle = document.getElementById('theme-toggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', () => this.toggleTheme());
        }
        
        // Header profile → login
        const headerProfile = document.getElementById('header-profile');
        if (headerProfile) {
            headerProfile.addEventListener('click', (e) => {
                e.preventDefault();
                this.navigateTo('login.html');
            });
        }
        
        // Mobile menu toggle
        const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
        if (mobileMenuToggle) {
            mobileMenuToggle.addEventListener('click', () => this.toggleMobileMenu());
        }
        
        // Cart functionality
        this.setupCart();
        
        // Smooth scrolling
        this.setupSmoothScrolling();
        
        // Page transitions
        this.setupPageTransitions();

        // Header scroll shadow
        this.setupHeaderScrollShadow();
    },
    
    // Initialize current page
    initializePage() {
        const currentPath = window.location.pathname;
        this.state.currentPage = this.getPageFromPath(currentPath);
        
        console.log('Initializing page:', this.state.currentPage);
        
        // Initialize page-specific functionality
        switch (this.state.currentPage) {
            case 'catalog':
                this.initCatalog();
                break;
            case 'cart':
                this.initCartPage();
                break;
            case 'checkout':
                this.initCheckoutPage();
                break;
            case 'tradein':
                this.initTradeIn();
                break;
            case 'installment':
                this.initInstallment();
                break;
            case 'admin':
                this.initAdmin();
                break;
            case 'delivery':
                this.initDelivery();
                break;
            default:
                this.initHome();
        }
        
        // Common initialization
        this.initCommon();
    },
    
    // Get page name from path
    getPageFromPath(path) {
        if (path === '/' || path === '/index.html') return 'home';
        if (path.includes('catalog')) return 'catalog';
        if (path.includes('cart')) return 'cart';
        if (path.includes('checkout')) return 'checkout';
        if (path.includes('profile')) return 'profile';
        if (path.includes('admin')) return 'admin';
        if (path.includes('tradein')) return 'tradein';
        if (path.includes('installment')) return 'installment';
        if (path.includes('delivery')) return 'delivery';
        return 'home';
    },
    
    // Setup navigation
    setupNavigation() {
        // Main navigation
        const navLinks = document.querySelectorAll('.main-nav a, .footer a[href]');
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                const href = link.getAttribute('href');
                if (href && !href.startsWith('#') && !href.startsWith('http')) {
                    e.preventDefault();
                    this.navigateTo(href);
                }
            });
        });
        
        // Breadcrumb navigation
        this.setupBreadcrumbs();
        
        // Back button
        window.addEventListener('popstate', () => {
            this.initializePage();
        });
    },
    
    // Navigate to page
    navigateTo(href) {
        // Add loading state
        document.body.classList.add('page-loading');
        
        // Update URL without reload
        history.pushState({}, '', href);
        
        // Load page content
        this.loadPage(href).then(() => {
            this.initializePage();
            document.body.classList.remove('page-loading');
            
            // Scroll to top
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }).catch(error => {
            console.error('Failed to load page:', error);
            // Fallback to full page reload
            window.location.href = href;
        });
    },
    
    // Load page content
    async loadPage(href) {
        try {
            const response = await fetch(href);
            const html = await response.text();
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');
            
            // Update main content
            const main = document.querySelector('main');
            const newMain = doc.querySelector('main');
            if (main && newMain) {
                main.innerHTML = newMain.innerHTML;
            }
            
            // Update page title
            document.title = doc.title;
            
            // Update meta tags
            this.updateMetaTags(doc);
            
        } catch (error) {
            throw new Error(`Failed to load page: ${error.message}`);
        }
    },
    
    // Update meta tags
    updateMetaTags(doc) {
        const metaTags = ['description', 'keywords', 'og:title', 'og:description', 'og:image'];
        metaTags.forEach(name => {
            const selector = name.startsWith('og:') ? `meta[property="${name}"]` : `meta[name="${name}"]`;
            const newTag = doc.querySelector(selector);
            const currentTag = document.querySelector(selector);
            
            if (newTag && currentTag) {
                currentTag.setAttribute('content', newTag.getAttribute('content'));
            }
        });
    },
    
    // Setup breadcrumbs
    setupBreadcrumbs() {
        const breadcrumbContainer = document.querySelector('.breadcrumb-list');
        if (!breadcrumbContainer) return;
        
        const currentPath = window.location.pathname;
        const breadcrumbs = this.generateBreadcrumbs(currentPath);
        
        breadcrumbContainer.innerHTML = breadcrumbs.map(crumb => `
            <li class="breadcrumb-item ${crumb.active ? 'active' : ''}">
                ${crumb.active ? 
                    `<span aria-current="page">${crumb.name}</span>` : 
                    `<a href="${crumb.href}" class="breadcrumb-link">${crumb.name}</a>`
                }
            </li>
        `).join('');
    },
    
    // Generate breadcrumbs for current path
    generateBreadcrumbs(path) {
        const breadcrumbs = [
            { name: 'Главная', href: '/', active: false }
        ];
        
        if (path.includes('catalog')) {
            breadcrumbs.push({ name: 'Каталог', href: '/catalog.html', active: true });
        } else if (path.includes('tradein')) {
            breadcrumbs.push(
                { name: 'Сервисы', href: '/services.html', active: false },
                { name: 'Trade-in', href: '/tradein.html', active: true }
            );
        } else if (path.includes('installment')) {
            breadcrumbs.push(
                { name: 'Сервисы', href: '/services.html', active: false },
                { name: 'Рассрочка', href: '/installment.html', active: true }
            );
        } else if (path.includes('delivery')) {
            breadcrumbs.push(
                { name: 'Сервисы', href: '/services.html', active: false },
                { name: 'Доставка', href: '/delivery.html', active: true }
            );
        }
        
        return breadcrumbs;
    },
    
    // Toggle theme
    toggleTheme() {
        document.body.classList.toggle('dark-mode');
        const isDark = document.body.classList.contains('dark-mode');
        localStorage.setItem(this.config.themeKey, isDark ? 'dark' : 'light');
    },
    
    // Toggle mobile menu
    toggleMobileMenu() {
        this.state.isMenuOpen = !this.state.isMenuOpen;
        document.body.classList.toggle('mobile-menu-open', this.state.isMenuOpen);
        
        const menu = document.querySelector('.mobile-menu');
        if (menu) {
            menu.setAttribute('aria-hidden', !this.state.isMenuOpen);
        }
    },
    
    // Update mobile UI
    updateMobileUI() {
        if (!this.state.isMobile && this.state.isMenuOpen) {
            this.toggleMobileMenu();
        }
    },
    
    // Setup cart functionality
    setupCart() {
        // Cart drawer controls
        const cartDrawer = document.getElementById('cart-drawer');
        const cartTrigger = document.getElementById('cart-trigger');
        const headerCartTrigger = document.getElementById('header-cart-trigger');
        const cartClose = document.querySelector('.cart-close');
        const cartOverlay = document.querySelector('.cart-overlay');
        
        // On pages with drawer, open it; otherwise navigate to cart page
        const openOrNavigate = () => {
            if (cartDrawer) {
                this.openCart();
            } else {
                this.navigateTo('cart.html');
            }
        };
        if (cartTrigger) cartTrigger.addEventListener('click', openOrNavigate);
        if (headerCartTrigger) headerCartTrigger.addEventListener('click', openOrNavigate);
        if (cartClose) cartClose.addEventListener('click', () => this.closeCart());
        if (cartOverlay) cartOverlay.addEventListener('click', () => this.closeCart());
        
        // Update cart display
        this.updateCartDisplay();
    },

    // ===== Cart Page =====
    initCartPage() {
        const container = document.getElementById('cart-page-container');
        if (!container) return;
        this.renderCartPage();

        container.addEventListener('click', (e) => {
            const inc = e.target.closest('[data-action="inc"]');
            const dec = e.target.closest('[data-action="dec"]');
            const remove = e.target.closest('[data-action="remove"]');
            if (inc || dec || remove) {
                const id = parseInt((inc||dec||remove).dataset.id);
                const item = this.state.cart.find(i => i.id === id);
                if (!item) return;
                if (inc) item.quantity += 1;
                if (dec) item.quantity = Math.max(1, item.quantity - 1);
                if (remove) this.state.cart = this.state.cart.filter(i => i.id !== id);
                this.saveState();
                this.renderCartPage();
                this.updateCartDisplay();
            }
        });
    },

    renderCartPage() {
        const container = document.getElementById('cart-page-container');
        if (!container) return;
        if (!this.state.cart.length) {
            container.innerHTML = `
                <div class="cart-list">
                    <div class="cart-empty">
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
                          <path d="M3 7V5C3 3.89543 3.89543 3 5 3H19C20.1046 3 21 3.89543 21 5V7M3 7L5 21H19L21 7M3 7H21M8 11V17M12 11В17M16 11В17" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                        <p>Корзина пуста</p>
                    </div>
                </div>`;
            return;
        }

        const itemsHtml = this.state.cart.map(item => `
            <div class="cart-row">
                <img src="${item.image}" alt="${item.name}" />
                <div class="cart-title">${item.name}</div>
                <div class="cart-price">${this.formatPrice(item.price)}</div>
                <div class="qty-controls">
                    <button class="qty-btn" data-action="dec" data-id="${item.id}" aria-label="Уменьшить">-</button>
                    <span>${item.quantity}</span>
                    <button class="qty-btn" data-action="inc" data-id="${item.id}" aria-label="Увеличить">+</button>
                </div>
                <button class="remove-btn" data-action="remove" data-id="${item.id}" aria-label="Удалить">Удалить</button>
            </div>
        `).join('');

        const total = this.state.cart.reduce((s,i)=> s + i.price * i.quantity, 0);

        container.innerHTML = `
            <div class="cart-page-layout">
                <div class="cart-list">
                    ${itemsHtml}
                </div>
                <aside class="order-summary">
                    <h3>Итого</h3>
                    <div class="summary-row"><span>Товары</span><span>${this.state.cart.length}</span></div>
                    <div class="summary-row summary-total"><span>К оплате</span><span>${this.formatPrice(total)}</span></div>
                    <div class="summary-actions">
                        <button class="cta-button" id="proceed-checkout">Перейти к оформлению</button>
                        <a class="cta-button secondary" href="catalog.html">Продолжить покупки</a>
                    </div>
                </aside>
            </div>`;

        const proceedBtn = document.getElementById('proceed-checkout');
        if (proceedBtn) {
            proceedBtn.addEventListener('click', () => this.navigateTo('checkout.html'));
        }
    },

    // ===== Checkout Page =====
    initCheckoutPage() {
        const layout = document.getElementById('checkout-page-layout');
        if (!layout) return;
        const total = this.state.cart.reduce((s,i)=> s + i.price * i.quantity, 0);
        const products = this.state.cart.map(i => `
            <div class="summary-row"><span>${i.name} × ${i.quantity}</span><span>${this.formatPrice(i.price * i.quantity)}</span></div>
        `).join('');

        layout.innerHTML = `
            <div class="checkout-page-layout">
                <form class="checkout-form" id="checkout-form" aria-label="Форма оформления заказа">
                    <h3>Данные получателя</h3>
                    <div class="form-row">
                        <div class="form-group"><label for="name">Имя</label><input id="name" type="text" required /></div>
                        <div class="form-group"><label for="phone">Телефон</label><input id="phone" type="tel" required /></div>
                    </div>
                    <div class="form-group"><label for="email">Email</label><input id="email" type="email" required /></div>
                    <h3>Доставка</h3>
                    <div class="form-group"><label for="city">Город</label><input id="city" type="text" required /></div>
                    <div class="form-group"><label for="address">Адрес</label><input id="address" type="text" required /></div>
                    <div class="form-group"><label for="comment">Комментарий к заказу</label><textarea id="comment" placeholder="Подъезд, этаж, код..."></textarea></div>
                    <button type="submit" class="cta-button">Подтвердить заказ</button>
                </form>
                <aside class="order-summary">
                    <h3>Ваш заказ</h3>
                    ${products}
                    <div class="summary-row summary-total"><span>Итого</span><span>${this.formatPrice(total)}</span></div>
                </aside>
            </div>`;

        const form = document.getElementById('checkout-form');
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                if (!this.validateForm(form)) return;
                this.showNotification('Спасибо! Заказ оформлен. Мы свяжемся с вами.', 'success');
                // Simple flow: clear cart and redirect
                this.state.cart = [];
                this.saveState();
                this.updateCartDisplay();
                setTimeout(() => this.navigateTo('index.html'), 1200);
            });
        }
    },
    
    // Open cart
    openCart() {
        const cartDrawer = document.getElementById('cart-drawer');
        if (cartDrawer) {
            cartDrawer.classList.add('open');
            cartDrawer.setAttribute('aria-hidden', 'false');
            document.body.style.overflow = 'hidden';
        }
    },
    
    // Close cart
    closeCart() {
        const cartDrawer = document.getElementById('cart-drawer');
        if (cartDrawer) {
            cartDrawer.classList.remove('open');
            cartDrawer.setAttribute('aria-hidden', 'true');
            document.body.style.overflow = '';
        }
    },
    
    // Add to cart
    addToCart(product) {
        const existingItem = this.state.cart.find(item => item.id === product.id);
        
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            this.state.cart.push({
                ...product,
                quantity: 1
            });
        }
        
        this.saveState();
        this.updateCartDisplay();
        this.showNotification(`${product.name} добавлен в корзину`);
    },
    
    // Remove from cart
    removeFromCart(productId) {
        this.state.cart = this.state.cart.filter(item => item.id !== productId);
        this.saveState();
        this.updateCartDisplay();
    },
    
    // Update cart display
    updateCartDisplay() {
        const cartCount = document.getElementById('cart-count');
        const headerCartCount = document.getElementById('header-cart-count');
        const cartItemsContainer = document.getElementById('cart-items');
        const cartTotalPrice = document.querySelector('.cart-total-price');
        const checkoutBtn = document.querySelector('.checkout-btn');
        
        const totalItems = this.state.cart.reduce((sum, item) => sum + item.quantity, 0);
        
        // Update counters
        if (cartCount) {
            cartCount.textContent = totalItems;
            cartCount.classList.toggle('show', totalItems > 0);
        }
        if (headerCartCount) {
            headerCartCount.textContent = totalItems;
            headerCartCount.classList.toggle('show', totalItems > 0);
        }
        
        // Update cart items
        if (cartItemsContainer) {
            if (this.state.cart.length === 0) {
                cartItemsContainer.innerHTML = `
                    <div class="cart-empty">
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
                            <path d="M3 7V5C3 3.89543 3.89543 3 5 3H19C20.1046 3 21 3.89543 21 5V7M3 7L5 21H19L21 7M3 7H21M8 11V17M12 11V17M16 11V17" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                        <p>Корзина пуста</p>
                    </div>
                `;
                if (checkoutBtn) checkoutBtn.disabled = true;
            } else {
                cartItemsContainer.innerHTML = this.state.cart.map(item => `
                    <div class="cart-item">
                        <div class="cart-item-image">
                            <img src="${item.image}" alt="${item.name}" loading="lazy">
                        </div>
                        <div class="cart-item-info">
                            <div class="cart-item-title">${item.name}</div>
                            <div class="cart-item-price">${this.formatPrice(item.price)} × ${item.quantity}</div>
                        </div>
                        <button class="cart-item-remove" onclick="App.removeFromCart(${item.id})" aria-label="Удалить ${item.name}">
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                                <path d="M12 4L4 12M4 4L12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                            </svg>
                        </button>
                    </div>
                `).join('');
                if (checkoutBtn) checkoutBtn.disabled = false;
            }
        }
        
        // Update total
        if (cartTotalPrice) {
            const total = this.state.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
            cartTotalPrice.textContent = this.formatPrice(total);
        }
    },
    
    // Setup smooth scrolling
    setupSmoothScrolling() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });
    },
    
    // Setup page transitions
    setupPageTransitions() {
        // Add transition classes
        document.body.classList.add('page-transitions');
    },
    
    // Show notification
    showNotification(message, type = 'success') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.classList.add('show');
        }, 100);
        
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    },

    // Header scroll shadow
    setupHeaderScrollShadow() {
        const header = document.querySelector('.header');
        if (!header) return;
        const toggle = () => {
            const scrolled = window.scrollY > 8;
            header.classList.toggle('scrolled', scrolled);
        };
        toggle();
        window.addEventListener('scroll', toggle, { passive: true });
    },
    
    // Format price
    formatPrice(price) {
        return new Intl.NumberFormat('ru-RU', {
            style: 'currency',
            currency: 'RUB',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(price).replace('₽', '₽');
    },
    
    // Common initialization
    initCommon() {
        // Scroll animations
        this.setupScrollAnimations();
        
        // FAQ accordions
        this.setupFAQAccordions();
        
        // Form validation
        this.setupFormValidation();

        // Profile tabs
        this.setupProfileTabs();
    },
    
    // Setup scroll animations
    setupScrollAnimations() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        });
        
        // Wait for DOM to be ready
        setTimeout(() => {
            document.querySelectorAll('.animate-on-scroll').forEach(el => {
                observer.observe(el);
            });
        }, 100);
    },
    
    // Setup FAQ accordions
    setupFAQAccordions() {
        // Legacy .faq-item structure (used on some pages)
        document.querySelectorAll('.faq-item').forEach(item => {
            const question = item.querySelector('.faq-question');
            const answer = item.querySelector('.faq-answer');
            if (!question || !answer) return;
            question.addEventListener('click', () => {
                const isOpen = item.classList.contains('active');
                document.querySelectorAll('.faq-item').forEach(otherItem => {
                    if (otherItem !== item) {
                        otherItem.classList.remove('active');
                        const otherAnswer = otherItem.querySelector('.faq-answer');
                        if (otherAnswer) otherAnswer.style.maxHeight = null;
                    }
                });
                if (isOpen) {
                    item.classList.remove('active');
                    answer.style.maxHeight = null;
                } else {
                    item.classList.add('active');
                    answer.style.maxHeight = answer.scrollHeight + 'px';
                }
            });
        });

        // New .accordion structure used on index.html
        const accordionItems = document.querySelectorAll('.accordion .accordion-item');
        if (!accordionItems.length) return;

        accordionItems.forEach((item) => {
            const trigger = item.querySelector('.accordion-trigger');
            const panel = item.querySelector('.accordion-panel');
            if (!trigger || !panel) return;

            // Initialize state
            const expanded = trigger.getAttribute('aria-expanded') === 'true';
            if (!expanded) {
                panel.hidden = true;
                panel.style.maxHeight = null;
            } else {
                panel.hidden = false;
                panel.style.maxHeight = panel.scrollHeight + 'px';
            }

            const closeOthers = () => {
                accordionItems.forEach(other => {
                    if (other !== item) {
                        const otherTrigger = other.querySelector('.accordion-trigger');
                        const otherPanel = other.querySelector('.accordion-panel');
                        if (!otherTrigger || !otherPanel) return;
                        otherTrigger.setAttribute('aria-expanded', 'false');
                        otherPanel.style.maxHeight = null;
                        otherPanel.hidden = true;
                    }
                });
            };

            trigger.addEventListener('click', () => {
                const isOpen = trigger.getAttribute('aria-expanded') === 'true';
                if (isOpen) {
                    trigger.setAttribute('aria-expanded', 'false');
                    panel.style.maxHeight = null;
                    // Delay hidden to allow collapse transition
                    setTimeout(() => { panel.hidden = true; }, 200);
                } else {
                    closeOthers();
                    trigger.setAttribute('aria-expanded', 'true');
                    panel.hidden = false;
                    panel.style.maxHeight = panel.scrollHeight + 'px';
                }
            });
        });
    },
    
    // Setup form validation
    setupFormValidation() {
        const forms = document.querySelectorAll('form');
        forms.forEach(form => {
            form.addEventListener('submit', (e) => {
                if (!this.validateForm(form)) {
                    e.preventDefault();
                }
            });
        });
    },
    
    // Validate form
    validateForm(form) {
        const requiredFields = form.querySelectorAll('[required]');
        let isValid = true;
        
        requiredFields.forEach(field => {
            if (!field.value.trim()) {
                this.showFieldError(field, 'Это поле обязательно для заполнения');
                isValid = false;
            } else {
                this.clearFieldError(field);
            }
        });
        
        return isValid;
    },
    
    // Show field error
    showFieldError(field, message) {
        this.clearFieldError(field);
        
        const error = document.createElement('div');
        error.className = 'field-error';
        error.textContent = message;
        
        field.parentNode.appendChild(error);
        field.classList.add('error');
    },
    
    // Clear field error
    clearFieldError(field) {
        const error = field.parentNode.querySelector('.field-error');
        if (error) {
            error.remove();
        }
        field.classList.remove('error');
    },

    // ===== Profile Page =====
    setupProfileTabs() {
        const tabs = document.querySelectorAll('.profile-tab');
        const panels = {
            overview: document.getElementById('tab-overview'),
            orders: document.getElementById('tab-orders'),
            settings: document.getElementById('tab-settings')
        };
        if (!tabs.length) return;
        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                tabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                Object.values(panels).forEach(p => p && p.classList.add('hidden'));
                const key = tab.dataset.tab;
                const panel = panels[key];
                if (panel) panel.classList.remove('hidden');
            });
        });
        // Load initial user info and orders
        this.loadProfileData();
    },

    loadProfileData() {
        const nameEl = document.getElementById('profile-name');
        const emailEl = document.getElementById('profile-email');
        const avatarEl = document.getElementById('profile-avatar');
        const wishlistCount = document.getElementById('wishlist-count');
        const lastOrder = document.getElementById('last-order');
        const shippingAddress = document.getElementById('shipping-address');
        const ordersList = document.getElementById('orders-list');
        const profileForm = document.getElementById('profile-form');
        const logoutBtn = document.getElementById('logout');
        const editBtn = document.getElementById('edit-profile');

        const user = this.getUser();
        if (user) {
            if (nameEl) nameEl.textContent = user.name || 'Пользователь';
            if (emailEl) emailEl.textContent = user.email || '';
            if (avatarEl && (user.name || user.email)) {
                const initial = (user.name || user.email || 'A').trim().charAt(0).toUpperCase();
                avatarEl.textContent = initial;
            }
            if (wishlistCount) wishlistCount.textContent = `${this.state.wishlist?.length || 0} товаров`;
            if (shippingAddress) shippingAddress.textContent = user.address || 'Не указан';
        }

        // Mock orders list from cart history (optional stub)
        const history = JSON.parse(localStorage.getItem('aagadgets_orders') || '[]');
        if (lastOrder) {
            lastOrder.textContent = history.length ? `№${history[history.length-1].id} на сумму ${this.formatPrice(history[history.length-1].total)}` : 'Пока нет заказов';
        }
        if (ordersList) {
            if (!history.length) {
                ordersList.innerHTML = '<p class="muted">Заказов пока нет</p>';
            } else {
                ordersList.innerHTML = history.map(order => `
                    <div class="order-card">
                        <div>
                            <div class="order-id">Заказ №${order.id}</div>
                            <div class="order-items">${order.items.map(i=>`${i.name} × ${i.quantity}`).join(', ')}</div>
                        </div>
                        <div>
                            <div class="order-status">${order.status || 'В обработке'}</div>
                            <div class="order-total">${this.formatPrice(order.total)}</div>
                        </div>
                    </div>
                `).join('');
            }
        }

        if (profileForm) {
            const setName = document.getElementById('set-name');
            const setEmail = document.getElementById('set-email');
            const setPhone = document.getElementById('set-phone');
            const setAddress = document.getElementById('set-address');
            if (user) {
                if (setName) setName.value = user.name || '';
                if (setEmail) setEmail.value = user.email || '';
                if (setPhone) setPhone.value = user.phone || '';
                if (setAddress) setAddress.value = user.address || '';
            }
            profileForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const updated = {
                    ...user,
                    name: setName?.value || '',
                    email: setEmail?.value || '',
                    phone: setPhone?.value || '',
                    address: setAddress?.value || ''
                };
                localStorage.setItem('aagadgets_user', JSON.stringify(updated));
                this.showNotification('Профиль обновлен', 'success');
                this.loadProfileData();
            });
        }

        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                localStorage.removeItem('aagadgets_user');
                this.showNotification('Вы вышли из аккаунта', 'success');
                setTimeout(()=> this.navigateTo('index.html'), 600);
            });
        }

        if (editBtn) {
            editBtn.addEventListener('click', () => {
                const settingsTab = document.querySelector('.profile-tab[data-tab="settings"]');
                if (settingsTab) settingsTab.click();
            });
        }
    },

    getUser() {
        try { return JSON.parse(localStorage.getItem('aagadgets_user') || 'null'); } catch { return null; }
    },

    // ===== Admin Panel =====
    initAdmin() {
        const user = this.getUser();
        if (!user) {
            this.showNotification('Требуется вход', 'warning');
            setTimeout(()=> this.navigateTo('login.html'), 600);
            return;
        }
        this.setupAdminTabs();
        this.renderAdminStats();
        this.renderAdminProducts();
        this.renderAdminOrders();
        this.renderAdminUsers();
        this.setupAdminForms();
    },

    setupAdminTabs() {
        const tabs = document.querySelectorAll('.admin-tab');
        const panels = {
            dashboard: document.getElementById('admin-dashboard'),
            products: document.getElementById('admin-products'),
            orders: document.getElementById('admin-orders'),
            users: document.getElementById('admin-users'),
            settings: document.getElementById('admin-settings')
        };
        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                tabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                Object.values(panels).forEach(p => p && p.classList.add('hidden'));
                const key = tab.dataset.tab;
                panels[key]?.classList.remove('hidden');
            });
        });
    },

    adminGet(key, fallback) {
        try { return JSON.parse(localStorage.getItem(key) || 'null') ?? fallback; } catch { return fallback; }
    },
    adminSet(key, value) {
        try { localStorage.setItem(key, JSON.stringify(value)); } catch {}
    },

    renderAdminStats() {
        const orders = this.adminGet('aagadgets_orders', []);
        const products = this.adminGet('aagadgets_products', []);
        const users = this.adminGet('aagadgets_users', []);
        const so = document.getElementById('admin-stats-orders');
        const sp = document.getElementById('admin-stats-products');
        const su = document.getElementById('admin-stats-users');
        if (so) so.textContent = orders.length;
        if (sp) sp.textContent = products.length || (this.catalogProducts?.length || 0);
        if (su) su.textContent = users.length + 1;
    },

    renderAdminProducts() {
        const table = document.getElementById('products-table');
        if (!table) return;
        const store = this.adminGet('aagadgets_products', []);
        const rows = store.map((p, idx) => `
            <div class="admin-row">
                <div>${idx + 1}</div>
                <div>${p.name}</div>
                <div>${this.formatPrice(p.price)}</div>
                <div>${p.category}</div>
                <div>
                    <button class="cta-button secondary" data-edit="${p.id}">Редактировать</button>
                    <button class="cta-button" data-delete="${p.id}">Удалить</button>
                </div>
            </div>
        `).join('');
        table.innerHTML = `
            <div class="admin-row header"><div>#</div><div>Название</div><div>Цена</div><div>Категория</div><div>Действия</div></div>
            ${rows || '<div class="muted" style="padding:10px 0">Товаров пока нет</div>'}
        `;

        table.addEventListener('click', (e) => {
            const editBtn = e.target.closest('[data-edit]');
            const delBtn = e.target.closest('[data-delete]');
            const form = document.getElementById('product-form');
            if (editBtn && form) this.adminEditProduct(parseInt(editBtn.dataset.edit));
            if (delBtn) this.adminDeleteProduct(parseInt(delBtn.dataset.delete));
        });
    },

    setupAdminForms() {
        const addBtn = document.getElementById('product-add');
        const form = document.getElementById('product-form');
        const cancel = document.getElementById('product-cancel');
        if (addBtn && form) {
            addBtn.addEventListener('click', () => {
                form.classList.remove('hidden');
                form.dataset.editing = '';
                document.getElementById('product-form-title').textContent = 'Новый товар';
                form.reset?.();
            });
        }
        if (cancel && form) {
            cancel.addEventListener('click', () => form.classList.add('hidden'));
        }
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                const id = form.dataset.editing ? parseInt(form.dataset.editing) : Date.now();
                const product = {
                    id,
                    name: document.getElementById('p-name').value.trim(),
                    price: parseInt(document.getElementById('p-price').value || '0'),
                    category: document.getElementById('p-category').value,
                    image: document.getElementById('p-image').value.trim(),
                    description: document.getElementById('p-desc').value.trim(),
                    inStock: document.getElementById('p-instock').checked,
                    isNew: document.getElementById('p-new').checked,
                    isSale: document.getElementById('p-sale').checked
                };
                const store = this.adminGet('aagadgets_products', []);
                const idx = store.findIndex(p => p.id === id);
                if (idx >= 0) store[idx] = product; else store.push(product);
                this.adminSet('aagadgets_products', store);
                this.showNotification('Товар сохранен', 'success');
                form.classList.add('hidden');
                this.renderAdminProducts();
                this.renderAdminStats();
            });
        }
    },

    adminEditProduct(id) {
        const store = this.adminGet('aagadgets_products', []);
        const p = store.find(i => i.id === id);
        const form = document.getElementById('product-form');
        if (!p || !form) return;
        form.classList.remove('hidden');
        form.dataset.editing = String(id);
        document.getElementById('product-form-title').textContent = 'Редактировать товар';
        document.getElementById('p-name').value = p.name;
        document.getElementById('p-price').value = p.price;
        document.getElementById('p-category').value = p.category;
        document.getElementById('p-image').value = p.image || '';
        document.getElementById('p-desc').value = p.description || '';
        document.getElementById('p-instock').checked = !!p.inStock;
        document.getElementById('p-new').checked = !!p.isNew;
        document.getElementById('p-sale').checked = !!p.isSale;
    },

    adminDeleteProduct(id) {
        const store = this.adminGet('aagadgets_products', []);
        const next = store.filter(p => p.id !== id);
        this.adminSet('aagadgets_products', next);
        this.showNotification('Товар удален', 'success');
        this.renderAdminProducts();
        this.renderAdminStats();
    },

    renderAdminOrders() {
        const table = document.getElementById('orders-table');
        if (!table) return;
        const orders = this.adminGet('aagadgets_orders', []);
        const rows = orders.map((o, idx) => `
            <div class="admin-row">
                <div>${idx + 1}</div>
                <div>№${o.id}</div>
                <div>${this.formatPrice(o.total)}</div>
                <div>${o.status || 'В обработке'}</div>
                <div>
                    <button class="cta-button secondary" data-ostatus="${o.id}">Статус</button>
                    <button class="cta-button" data-odelete="${o.id}">Удалить</button>
                </div>
            </div>
        `).join('');
        table.innerHTML = `
            <div class="admin-row header"><div>#</div><div>Заказ</div><div>Сумма</div><div>Статус</div><div>Действия</div></div>
            ${rows || '<div class="muted" style="padding:10px 0">Заказов пока нет</div>'}
        `;

        table.addEventListener('click', (e) => {
            const sBtn = e.target.closest('[data-ostatus]');
            const dBtn = e.target.closest('[data-odelete]');
            if (sBtn) this.adminCycleOrderStatus(parseInt(sBtn.dataset.ostatus));
            if (dBtn) this.adminDeleteOrder(parseInt(dBtn.dataset.odelete));
        });
    },

    adminCycleOrderStatus(id) {
        const orders = this.adminGet('aagadgets_orders', []);
        const idx = orders.findIndex(o => o.id === id);
        if (idx < 0) return;
        const order = orders[idx];
        const flow = ['В обработке', 'Собран', 'В пути', 'Доставлен'];
        const next = flow[(flow.indexOf(order.status || 'В обработке') + 1) % flow.length];
        order.status = next;
        this.adminSet('aagadgets_orders', orders);
        this.renderAdminOrders();
        this.showNotification('Статус обновлен', 'success');
    },

    adminDeleteOrder(id) {
        const orders = this.adminGet('aagadgets_orders', []);
        this.adminSet('aagadgets_orders', orders.filter(o => o.id !== id));
        this.renderAdminOrders();
        this.renderAdminStats();
        this.showNotification('Заказ удален', 'success');
    },

    renderAdminUsers() {
        const table = document.getElementById('users-table');
        if (!table) return;
        const users = this.adminGet('aagadgets_users', []);
        const current = this.getUser();
        const all = [current, ...users.filter(u => u?.email !== current?.email)].filter(Boolean);
        const rows = all.map((u, idx) => `
            <div class="admin-row">
                <div>${idx + 1}</div>
                <div>${u.name || 'Пользователь'}</div>
                <div>${u.email || '-'}</div>
                <div>-</div>
                <div><button class="cta-button" data-udelete="${u.email}">Удалить</button></div>
            </div>
        `).join('');
        table.innerHTML = `
            <div class="admin-row header"><div>#</div><div>Имя</div><div>Email</div><div>Роли</div><div>Действия</div></div>
            ${rows || '<div class="muted" style="padding:10px 0">Пользователей пока нет</div>'}
        `;
        table.addEventListener('click', (e) => {
            const dBtn = e.target.closest('[data-udelete]');
            if (dBtn) this.adminDeleteUser(dBtn.dataset.udelete);
        });
    },

    adminDeleteUser(email) {
        const users = this.adminGet('aagadgets_users', []);
        this.adminSet('aagadgets_users', users.filter(u => u.email !== email));
        this.renderAdminUsers();
        this.renderAdminStats();
        this.showNotification('Пользователь удален', 'success');
    },
};

// Initialize app when DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => App.init());
} else {
    App.init();
}

// Page-specific modules
// ====================

// Home page module
App.initHome = function() {
    // Hero slider
    this.initHeroSlider();
    
    // Product filters
    this.initProductFilters();
    
    // Add to cart buttons
    this.initAddToCartButtons();
    
    // MacBook configurator
    this.initMacBookConfigurator();
    
    // Newsletter form
    this.initNewsletterForm();
};

// Newsletter form
App.initNewsletterForm = function() {
    const newsletterForm = document.querySelector('.newsletter-form');
    if (!newsletterForm) return;
    
    newsletterForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = newsletterForm.querySelector('input[type="email"]').value;
        
        if (email) {
            this.showNotification('Спасибо за подписку! Мы будем держать вас в курсе новинок.', 'success');
            newsletterForm.reset();
        }
    });
};

// Hero slider functionality
App.initHeroSlider = function() {
    const hero = document.querySelector('.hero');
    const sliderWrapper = document.querySelector('.slider-wrapper');
    const slides = document.querySelectorAll('.slide');
    const prevBtn = document.querySelector('.prev-btn');
    const nextBtn = document.querySelector('.next-btn');
    const dotsContainer = document.querySelector('.slider-dots');

    if (!hero || !sliderWrapper || !slides.length || !dotsContainer) return;

    let currentIndex = 0;
    let slideInterval;
    const totalSlides = slides.length;

    // Create dots
    slides.forEach((_, i) => {
        const dot = document.createElement('button');
        dot.classList.add('dot');
        if (i === 0) dot.classList.add('active');
        dot.addEventListener('click', () => {
            this.goToSlide(i);
            this.resetInterval();
        });
        dotsContainer.appendChild(dot);
    });
    const dots = document.querySelectorAll('.dot');

    // Navigation functions
    this.goToSlide = (index) => {
        slides[currentIndex].classList.remove('active');
        dots[currentIndex].classList.remove('active');

        currentIndex = (index + totalSlides) % totalSlides;
        sliderWrapper.style.transform = `translateX(-${currentIndex * 100}%)`;
        slides[currentIndex].classList.add('active');
        dots[currentIndex].classList.add('active');
    };

    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            this.goToSlide(currentIndex - 1);
            this.resetInterval();
        });
    }
    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            this.goToSlide(currentIndex + 1);
            this.resetInterval();
        });
    }

    // Auto-play
    this.startInterval = () => {
        slideInterval = setInterval(() => {
            this.goToSlide(currentIndex + 1);
        }, 5000);
    };

    this.resetInterval = () => {
        clearInterval(slideInterval);
        this.startInterval();
    };

    hero.addEventListener('mouseenter', () => clearInterval(slideInterval));
    hero.addEventListener('mouseleave', this.startInterval);

    // Touch support
    let touchStartX = 0;
    let touchEndX = 0;

    hero.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
    });

    hero.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].screenX;
        this.handleSwipe();
    });

    this.handleSwipe = () => {
        if (touchEndX < touchStartX) {
            this.goToSlide(currentIndex + 1);
            this.resetInterval();
        }
        if (touchEndX > touchStartX) {
            this.goToSlide(currentIndex - 1);
            this.resetInterval();
        }
    };

    this.startInterval();
};

// Product filters
App.initProductFilters = function() {
    const filterTags = document.querySelectorAll('.filter-tag');
    const productCards = document.querySelectorAll('.product-card');
    const sortSelect = document.querySelector('.sort-select');
    
    if (!filterTags.length || !productCards.length) return;
    
    filterTags.forEach(tag => {
        tag.addEventListener('click', () => {
            filterTags.forEach(t => t.classList.remove('active'));
            tag.classList.add('active');
            
            const filterValue = tag.getAttribute('data-filter');
            
            productCards.forEach(card => {
                const cardCategory = card.getAttribute('data-category');
                
                if (filterValue === 'all' || cardCategory === filterValue) {
                    card.style.display = 'block';
                    card.style.animation = 'fadeInUp 0.3s ease-out';
                } else {
                    card.style.display = 'none';
                }
            });
        });
    });
    
    if (sortSelect) {
        sortSelect.addEventListener('change', () => {
            const sortValue = sortSelect.value;
            const container = document.querySelector('.products-grid');
            const cards = Array.from(productCards).filter(card => 
                card.style.display !== 'none'
            );
            
            cards.sort((a, b) => {
                const priceA = parseInt(a.querySelector('.current-price').textContent.replace(/\D/g, ''));
                const priceB = parseInt(b.querySelector('.current-price').textContent.replace(/\D/g, ''));
                
                switch (sortValue) {
                    case 'price-low':
                        return priceA - priceB;
                    case 'price-high':
                        return priceB - priceA;
                    case 'newest':
                        return Math.random() - 0.5;
                    default:
                        return 0;
                }
            });
            
            cards.forEach(card => container.appendChild(card));
        });
    }
};

// Add to cart buttons
App.initAddToCartButtons = function() {
    document.addEventListener('click', (e) => {
        if (e.target.closest('.add-to-cart-btn')) {
            e.preventDefault();
            const btn = e.target.closest('.add-to-cart-btn');
            const productCard = btn.closest('.product-card');
            
            if (!productCard) return;
            
            const product = {
                id: Date.now(), // Simple ID generation
                name: productCard.querySelector('.product-title')?.textContent || 'Товар',
                price: parseInt(productCard.querySelector('.current-price')?.textContent.replace(/\D/g, '') || '0'),
                image: productCard.querySelector('.product-image img')?.src || ''
            };
            
            this.addToCart(product);
            
            // Visual feedback
            const originalText = btn.innerHTML;
            btn.innerHTML = '<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M13 5L6 12L3 9" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>Добавлено';
            btn.style.backgroundColor = '#34c759';
            
            setTimeout(() => {
                btn.innerHTML = originalText;
                btn.style.backgroundColor = '';
            }, 2000);
        }
    });
};

// MacBook configurator
App.initMacBookConfigurator = function() {
    const colorBtns = document.querySelectorAll('.color-btn');
    const storageBtns = document.querySelectorAll('.storage-btn');
    const priceElement = document.getElementById('macbook-price');
    const macbookImage = document.getElementById('macbook-image');
    
    // Color options
    colorBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            colorBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            const color = btn.dataset.color;
            // Update image based on color
            if (macbookImage) {
                if (color === 'silver') {
                    macbookImage.src = 'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/mbp16-silver-select-202310?wid=1200&hei=800&fmt=jpeg&qlt=90&.v=1697230830200';
                } else {
                    macbookImage.src = 'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/mbp16-spaceblack-select-202310?wid=1200&hei=800&fmt=jpeg&qlt=90&.v=1697230830200';
                }
            }
        });
    });
    
    // Storage options
    storageBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            storageBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            const price = parseInt(btn.dataset.price);
            if (priceElement) {
                priceElement.textContent = this.formatPrice(price);
            }
        });
    });
};

// Catalog page module
App.initCatalog = function() {
    // Product data
    this.catalogProducts = [
        // iPhone
        { id: 1, name: "iPhone 15 Pro", category: "iphone", price: 119990, oldPrice: 129990, image: "https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/iphone-15-pro-finish-select-202309-6-1inch-naturaltitanium?wid=5120&hei=3280&fmt=p-jpg&qlt=80&.v=1693009279820", inStock: true, isNew: true, isSale: true, description: "Титан. Так прочен. Так лёгок. Так Pro." },
        { id: 2, name: "iPhone 15", category: "iphone", price: 89990, oldPrice: 99990, image: "https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/iphone-15-finish-select-202309-6-1inch-pink?wid=5120&hei=3280&fmt=p-jpg&qlt=80&.v=1693009279820", inStock: true, isNew: true, isSale: true, description: "Новый дизайн. Новая камера. Новая мощь." },
        { id: 3, name: "iPhone 14 Pro", category: "iphone", price: 99990, oldPrice: null, image: "https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/iphone-14-pro-finish-select-202209-6-1inch-deeppurple?wid=5120&hei=3280&fmt=p-jpg&qlt=80&.v=1663703841896", inStock: true, isNew: false, isSale: false, description: "Pro. Вне всяких сомнений." },
        // Mac
        { id: 4, name: "MacBook Pro 14\"", category: "mac", price: 239990, oldPrice: null, image: "https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/mbp14-spaceblack-select-202310?wid=904&hei=840&fmt=jpeg&qlt=90&.v=1697230830200", inStock: true, isNew: false, isSale: false, description: "Мощь, меняющая всё." },
        { id: 5, name: "MacBook Air 15\"", category: "mac", price: 179990, oldPrice: null, image: "https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/macbook-air-15-midnight-select-202306?wid=904&hei=840&fmt=jpeg&qlt=90&.v=1684432486255", inStock: true, isNew: true, isSale: false, description: "Поразительно тонкий. Изумительно быстрый." },
        { id: 6, name: "iMac 24\"", category: "mac", price: 165990, oldPrice: 204990, image: "https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/imac-24-blue-select-202104?wid=904&hei=840&fmt=jpeg&qlt=90&.v=1617492405000", inStock: true, isNew: false, isSale: true, description: "Мощность и красота в одном устройстве." },
        // iPad
        { id: 7, name: "iPad Pro 12.9\"", category: "ipad", price: 109990, oldPrice: null, image: "https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/ipad-pro-12-select-wifi-spacegray-202210?wid=470&hei=556&fmt=png-alpha&.v=1664411208424", inStock: true, isNew: false, isSale: false, description: "Мощный. Простой. Универсальный." },
        { id: 8, name: "iPad Air", category: "ipad", price: 59990, oldPrice: 69990, image: "https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/ipad-air-select-202203-blue?wid=470&hei=556&fmt=png-alpha&.v=1645667448278", inStock: true, isNew: false, isSale: true, description: "Лёгкий. Яркий. Мощный." },
        // Apple Watch
        { id: 9, name: "Apple Watch Ultra 2", category: "watch", price: 89990, oldPrice: null, image: "https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/MPU63ref_VW_34FR+watch-49-titanium-ultra2_VW_34FR+watch-face-49-alpine-green_VW_34FR_GEO_RU?wid=752&hei=720&bg-color=255,255,255&fit=hfit&qlt=80&.v=1694507026362", inStock: true, isNew: true, isSale: false, description: "Приключения ждут." },
        { id: 10, name: "Apple Watch Series 9", category: "watch", price: 39990, oldPrice: null, image: "https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/watch-s9-gps-select-202309?wid=470&hei=556&fmt=png-alpha&.v=1692892891000", inStock: true, isNew: true, isSale: false, description: "Следите за здоровьем и активностью." },
        // AirPods
        { id: 11, name: "AirPods Pro (2-го поколения)", category: "airpods", price: 24990, oldPrice: null, image: "https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/MT223?wid=400&hei=400&fmt=jpeg&qlt=90&.v=1693248332598", inStock: true, isNew: false, isSale: false, description: "Активное шумоподавление." },
        { id: 12, name: "AirPods (3-го поколения)", category: "airpods", price: 19990, oldPrice: null, image: "https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/MV7N2?wid=400&hei=400&fmt=jpeg&qlt=90&.v=1634664364000", inStock: true, isNew: false, isSale: false, description: "Звук, который вы полюбите." },
        // Accessories
        { id: 13, name: "Apple Pencil (USB-C)", category: "accessories", price: 7990, oldPrice: null, image: "https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/MU7T2_AV2?wid=400&hei=400&fmt=jpeg&qlt=90&.v=1693006277259", inStock: true, isNew: false, isSale: false, description: "Точность в каждом штрихе." },
        { id: 14, name: "Зарядное устройство MagSafe", category: "accessories", price: 3990, oldPrice: null, image: "https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/MX0J2?wid=400&hei=400&fmt=jpeg&qlt=90&.v=1679693151240", inStock: true, isNew: false, isSale: false, description: "Быстрая беспроводная зарядка." }
    ];

    this.catalogState = {
        currentCategory: 'all',
        currentSort: 'popular',
        currentView: 'grid',
        currentSearch: '',
        currentPriceRange: { min: 0, max: 500000 },
        filteredProducts: [...this.catalogProducts]
    };

    this.setupCatalogEventListeners();
    this.renderCatalogProducts();
    this.updateCatalogResultsCount();
};

// Setup catalog event listeners
App.setupCatalogEventListeners = function() {
    const searchInput = document.getElementById('search-input');
    const categoryFilters = document.querySelectorAll('.category-filter');
    const sortSelect = document.querySelector('.sort-select');
    const viewBtns = document.querySelectorAll('.view-btn');
    const priceMinSlider = document.getElementById('price-min');
    const priceMaxSlider = document.getElementById('price-max');
    const priceMinLabel = document.getElementById('price-min-label');
    const priceMaxLabel = document.getElementById('price-max-label');

    // Search
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            this.catalogState.currentSearch = e.target.value.toLowerCase();
            this.filterCatalogProducts();
        });
    }

    // Category filters
    categoryFilters.forEach(filter => {
        filter.addEventListener('click', (e) => {
            e.preventDefault();
            categoryFilters.forEach(f => f.classList.remove('active'));
            filter.classList.add('active');
            this.catalogState.currentCategory = filter.dataset.category;
            this.filterCatalogProducts();
        });
    });

    // Sort
    if (sortSelect) {
        sortSelect.addEventListener('change', (e) => {
            this.catalogState.currentSort = e.target.value;
            this.sortCatalogProducts();
        });
    }

    // View toggle
    viewBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            viewBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            this.catalogState.currentView = btn.dataset.view;
            this.renderCatalogProducts();
        });
    });

    // Price range
    if (priceMinSlider) {
        priceMinSlider.addEventListener('input', (e) => {
            this.catalogState.currentPriceRange.min = parseInt(e.target.value);
            if (priceMinLabel) priceMinLabel.textContent = this.formatPrice(this.catalogState.currentPriceRange.min);
            this.filterCatalogProducts();
        });
    }

    if (priceMaxSlider) {
        priceMaxSlider.addEventListener('input', (e) => {
            this.catalogState.currentPriceRange.max = parseInt(e.target.value);
            if (priceMaxLabel) priceMaxLabel.textContent = this.formatPrice(this.catalogState.currentPriceRange.max);
            this.filterCatalogProducts();
        });
    }

    // Checkbox filters
    const checkboxes = document.querySelectorAll('input[type="checkbox"]');
    checkboxes.forEach(checkbox => {
        checkbox.addEventListener('change', () => this.filterCatalogProducts());
    });
};

// Filter catalog products
App.filterCatalogProducts = function() {
    this.catalogState.filteredProducts = this.catalogProducts.filter(product => {
        // Category filter
        if (this.catalogState.currentCategory !== 'all' && product.category !== this.catalogState.currentCategory) {
            return false;
        }

        // Search filter
        if (this.catalogState.currentSearch && !product.name.toLowerCase().includes(this.catalogState.currentSearch)) {
            return false;
        }

        // Price range filter
        if (product.price < this.catalogState.currentPriceRange.min || product.price > this.catalogState.currentPriceRange.max) {
            return false;
        }

        // Availability filter
        const inStockChecked = document.querySelector('input[value="in-stock"]')?.checked;
        const preOrderChecked = document.querySelector('input[value="pre-order"]')?.checked;
        
        if (inStockChecked && !preOrderChecked && !product.inStock) {
            return false;
        }
        if (!inStockChecked && preOrderChecked && product.inStock) {
            return false;
        }

        // Special filters
        const saleChecked = document.querySelector('input[value="sale"]')?.checked;
        const newChecked = document.querySelector('input[value="new"]')?.checked;

        if (saleChecked && !product.isSale) {
            return false;
        }
        if (newChecked && !product.isNew) {
            return false;
        }

        return true;
    });

    this.sortCatalogProducts();
    this.renderCatalogProducts();
    this.updateCatalogResultsCount();
};

// Sort catalog products
App.sortCatalogProducts = function() {
    this.catalogState.filteredProducts.sort((a, b) => {
        switch (this.catalogState.currentSort) {
            case 'price-low':
                return a.price - b.price;
            case 'price-high':
                return b.price - a.price;
            case 'newest':
                return b.isNew - a.isNew;
            case 'name':
                return a.name.localeCompare(b.name);
            case 'popular':
            default:
                return 0;
        }
    });
};

// Render catalog products
App.renderCatalogProducts = function() {
    const productsGrid = document.getElementById('products-grid');
    if (!productsGrid) return;

    if (this.catalogState.filteredProducts.length === 0) {
        productsGrid.innerHTML = `
            <div class="no-results">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none">
                    <path d="M21 21L16.65 16.65M19 11C19 15.4183 15.4183 19 11 19C6.58172 19 3 15.4183 3 11C3 6.58172 6.58172 3 11 3C15.4183 3 19 6.58172 19 11Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                <h3>Товары не найдены</h3>
                <p>Попробуйте изменить параметры поиска или фильтры</p>
            </div>
        `;
        return;
    }

    const gridClass = this.catalogState.currentView === 'list' ? 'products-list' : 'products-grid';
    productsGrid.className = gridClass;

    productsGrid.innerHTML = this.catalogState.filteredProducts.map(product => `
        <div class="product-card ${this.catalogState.currentView === 'list' ? 'list-view' : ''}" data-category="${product.category}">
            <div class="product-image">
                <img src="${product.image}" alt="${product.name}" loading="lazy" decoding="async" width="400" height="300" />
                ${product.isNew ? '<div class="product-badge new">Новинка</div>' : ''}
                ${product.isSale ? '<div class="product-badge sale">Скидка</div>' : ''}
                ${!product.inStock ? '<div class="product-badge out-of-stock">Нет в наличии</div>' : ''}
            </div>
            <div class="product-info">
                <h3 class="product-title">${product.name}</h3>
                <p class="product-description">${product.description}</p>
                <div class="product-price">
                    <span class="current-price">${this.formatPrice(product.price)}</span>
                    ${product.oldPrice ? `<span class="old-price">${this.formatPrice(product.oldPrice)}</span>` : ''}
                </div>
                <div class="product-actions">
                    <button class="add-to-cart-btn" ${!product.inStock ? 'disabled' : ''} aria-label="Добавить ${product.name} в корзину">
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                            <path d="M2 4H3.5L4.5 10H12.5L14 4H2Z" stroke="currentColor" stroke-width="1.5" fill="none"/>
                            <circle cx="5" cy="13" r="1" fill="currentColor"/>
                            <circle cx="12" cy="13" r="1" fill="currentColor"/>
                        </svg>
                        ${product.inStock ? 'В корзину' : 'Нет в наличии'}
                    </button>
                    <button class="wishlist-btn" aria-label="Добавить в избранное">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                            <path d="M20.84 4.61C20.3292 4.099 19.7228 3.69364 19.0554 3.41708C18.3879 3.14052 17.6725 2.99817 16.95 2.99817C16.2275 2.99817 15.5121 3.14052 14.8446 3.41708C14.1772 3.69364 13.5708 4.099 13.06 4.61L12 5.67L10.94 4.61C9.9083 3.5783 8.50903 2.9987 7.05 2.9987C5.59096 2.9987 4.19169 3.5783 3.16 4.61C2.1283 5.6417 1.5487 7.04097 1.5487 8.5C1.5487 9.95903 2.1283 11.3583 3.16 12.39L12 21.23L20.84 12.39C21.351 11.8792 21.7563 11.2728 22.0329 10.6053C22.3095 9.93789 22.4518 9.22248 22.4518 8.5C22.4518 7.77752 22.3095 7.06211 22.0329 6.39467C21.7563 5.72723 21.351 5.1208 20.84 4.61Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    `).join('');

    // Add event listeners to new buttons
    this.setupCatalogProductEventListeners();
};

// Setup catalog product event listeners
App.setupCatalogProductEventListeners = function() {
    const addToCartBtns = document.querySelectorAll('.add-to-cart-btn');
    const wishlistBtns = document.querySelectorAll('.wishlist-btn');

    addToCartBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const productCard = btn.closest('.product-card');
            const productTitle = productCard.querySelector('.product-title').textContent;
            const productPrice = productCard.querySelector('.current-price').textContent;
            const productImage = productCard.querySelector('.product-image img').src;

            // Find product in catalog
            const product = this.catalogProducts.find(p => p.name === productTitle);
            if (product) {
                this.addToCart(product);
            }

            // Visual feedback
            const originalText = btn.innerHTML;
            btn.innerHTML = '<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M13 5L6 12L3 9" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>Добавлено';
            btn.style.backgroundColor = '#34c759';
            btn.disabled = true;

            setTimeout(() => {
                btn.innerHTML = originalText;
                btn.style.backgroundColor = '';
                btn.disabled = false;
            }, 2000);
        });
    });

    wishlistBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            btn.classList.toggle('active');
        });
    });
};

// Update catalog results count
App.updateCatalogResultsCount = function() {
    const resultsCount = document.getElementById('results-count');
    if (resultsCount) {
        resultsCount.textContent = `Найдено товаров: ${this.catalogState.filteredProducts.length}`;
    }
};

// Trade-in page module
App.initTradeIn = function() {
    this.tradeInState = {
        currentStep: 1,
        selectedDeviceType: null,
        selectedDevice: null,
        selectedCondition: null
    };

    this.deviceData = {
        iphone: [
            { name: "iPhone 15 Pro Max", basePrice: 120000, image: "https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/iphone-15-pro-finish-select-202309-6-1inch-naturaltitanium?wid=5120&hei=3280&fmt=p-jpg&qlt=80&.v=1693009279820" },
            { name: "iPhone 15 Pro", basePrice: 100000, image: "https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/iphone-15-pro-finish-select-202309-6-1inch-naturaltitanium?wid=5120&hei=3280&fmt=p-jpg&qlt=80&.v=1693009279820" },
            { name: "iPhone 15", basePrice: 80000, image: "https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/iphone-15-finish-select-202309-6-1inch-pink?wid=5120&hei=3280&fmt=p-jpg&qlt=80&.v=1693009279820" },
            { name: "iPhone 14 Pro Max", basePrice: 90000, image: "https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/iphone-14-pro-finish-select-202209-6-1inch-deeppurple?wid=5120&hei=3280&fmt=p-jpg&qlt=80&.v=1663703841896" },
            { name: "iPhone 14 Pro", basePrice: 75000, image: "https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/iphone-14-pro-finish-select-202209-6-1inch-deeppurple?wid=5120&hei=3280&fmt=p-jpg&qlt=80&.v=1663703841896" },
            { name: "iPhone 14", basePrice: 60000, image: "https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/iphone-14-finish-select-202209-6-1inch-purple?wid=5120&hei=3280&fmt=p-jpg&qlt=80&.v=1663703841896" }
        ],
        ipad: [
            { name: "iPad Pro 12.9\" (M2)", basePrice: 90000, image: "https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/ipad-pro-12-select-wifi-spacegray-202210?wid=470&hei=556&fmt=png-alpha&.v=1664411208424" },
            { name: "iPad Pro 11\" (M2)", basePrice: 70000, image: "https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/ipad-pro-11-select-wifi-spacegray-202210?wid=470&hei=556&fmt=png-alpha&.v=1664411208424" },
            { name: "iPad Air (M1)", basePrice: 50000, image: "https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/ipad-air-select-202203-blue?wid=470&hei=556&fmt=png-alpha&.v=1645667448278" }
        ],
        mac: [
            { name: "MacBook Pro 16\" (M2 Pro)", basePrice: 200000, image: "https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/mbp16-spaceblack-select-202310?wid=904&hei=840&fmt=jpeg&qlt=90&.v=1697230830200" },
            { name: "MacBook Pro 14\" (M2 Pro)", basePrice: 180000, image: "https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/mbp14-spaceblack-select-202310?wid=904&hei=840&fmt=jpeg&qlt=90&.v=1697230830200" },
            { name: "MacBook Air 15\" (M2)", basePrice: 150000, image: "https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/macbook-air-15-midnight-select-202306?wid=904&hei=840&fmt=jpeg&qlt=90&.v=1684432486255" }
        ],
        watch: [
            { name: "Apple Watch Ultra 2", basePrice: 80000, image: "https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/MPU63ref_VW_34FR+watch-49-titanium-ultra2_VW_34FR+watch-face-49-alpine-green_VW_34FR_GEO_RU?wid=752&hei=720&bg-color=255,255,255&fit=hfit&qlt=80&.v=1694507026362" },
            { name: "Apple Watch Series 9", basePrice: 35000, image: "https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/watch-s9-gps-select-202309?wid=470&hei=556&fmt=png-alpha&.v=1692892891000" }
        ]
    };

    this.conditionMultipliers = {
        excellent: 1.0,
        good: 0.9,
        fair: 0.75,
        poor: 0.5
    };

    this.setupTradeInEventListeners();
};

// Setup Trade-in event listeners
App.setupTradeInEventListeners = function() {
    const deviceTypeBtns = document.querySelectorAll('.device-type-btn');
    const deviceModelsContainer = document.getElementById('device-models');
    const conditionOptions = document.querySelectorAll('.condition-option input[type="radio"]');
    const formSteps = document.querySelectorAll('.form-step');
    const backToTypesBtn = document.getElementById('back-to-types');
    const backToModelsBtn = document.getElementById('back-to-models');
    const backToConditionBtn = document.getElementById('back-to-condition');
    const proceedTradeinBtn = document.getElementById('proceed-tradein');

    // Device type selection
    deviceTypeBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            this.tradeInState.selectedDeviceType = btn.dataset.type;
            this.loadDeviceModels(this.tradeInState.selectedDeviceType);
            this.nextTradeInStep();
        });
    });

    // Back buttons
    if (backToTypesBtn) backToTypesBtn.addEventListener('click', () => this.prevTradeInStep());
    if (backToModelsBtn) backToModelsBtn.addEventListener('click', () => this.prevTradeInStep());
    if (backToConditionBtn) backToConditionBtn.addEventListener('click', () => this.prevTradeInStep());

    // Condition selection
    conditionOptions.forEach(option => {
        option.addEventListener('change', () => {
            if (option.checked) {
                this.tradeInState.selectedCondition = option.value;
                this.calculateTradeInPrice();
                this.nextTradeInStep();
            }
        });
    });

    // Proceed to trade-in
    if (proceedTradeinBtn) {
        proceedTradeinBtn.addEventListener('click', () => {
            window.location.href = 'tel:+79000000000';
        });
    }
};

// Load device models
App.loadDeviceModels = function(deviceType) {
    const deviceModelsContainer = document.getElementById('device-models');
    if (!deviceModelsContainer) return;

    const models = this.deviceData[deviceType] || [];
    deviceModelsContainer.innerHTML = '';

    models.forEach(model => {
        const modelBtn = document.createElement('button');
        modelBtn.className = 'device-model-btn';
        modelBtn.innerHTML = `
            <img src="${model.image}" alt="${model.name}" width="80" height="80" />
            <div class="model-info">
                <span class="model-name">${model.name}</span>
                <span class="model-price">до ${this.formatPrice(model.basePrice)}</span>
            </div>
        `;
        modelBtn.addEventListener('click', () => {
            this.tradeInState.selectedDevice = model;
            this.nextTradeInStep();
        });
        deviceModelsContainer.appendChild(modelBtn);
    });
};

// Next Trade-in step
App.nextTradeInStep = function() {
    if (this.tradeInState.currentStep < 4) {
        const formSteps = document.querySelectorAll('.form-step');
        formSteps[this.tradeInState.currentStep - 1].classList.remove('active');
        this.tradeInState.currentStep++;
        formSteps[this.tradeInState.currentStep - 1].classList.add('active');
    }
};

// Previous Trade-in step
App.prevTradeInStep = function() {
    if (this.tradeInState.currentStep > 1) {
        const formSteps = document.querySelectorAll('.form-step');
        formSteps[this.tradeInState.currentStep - 1].classList.remove('active');
        this.tradeInState.currentStep--;
        formSteps[this.tradeInState.currentStep - 1].classList.add('active');
    }
};

// Calculate Trade-in price
App.calculateTradeInPrice = function() {
    if (!this.tradeInState.selectedDevice || !this.tradeInState.selectedCondition) return;

    const basePrice = this.tradeInState.selectedDevice.basePrice;
    const multiplier = this.conditionMultipliers[this.tradeInState.selectedCondition];
    const finalPrice = Math.round(basePrice * multiplier);

    // Update result display
    const resultDeviceImage = document.getElementById('result-device-image');
    const resultDeviceName = document.getElementById('result-device-name');
    const resultDeviceCondition = document.getElementById('result-device-condition');
    const resultPrice = document.getElementById('result-price');

    if (resultDeviceImage) resultDeviceImage.src = this.tradeInState.selectedDevice.image;
    if (resultDeviceImage) resultDeviceImage.alt = this.tradeInState.selectedDevice.name;
    if (resultDeviceName) resultDeviceName.textContent = this.tradeInState.selectedDevice.name;
    if (resultDeviceCondition) resultDeviceCondition.textContent = this.getConditionText(this.tradeInState.selectedCondition);
    if (resultPrice) resultPrice.textContent = this.formatPrice(finalPrice);
};

// Get condition text
App.getConditionText = function(condition) {
    const conditionTexts = {
        excellent: 'Отличное состояние',
        good: 'Хорошее состояние',
        fair: 'Удовлетворительное состояние',
        poor: 'Плохое состояние'
    };
    return conditionTexts[condition] || '';
};

// Installment page module
App.initInstallment = function() {
    this.setupInstallmentEventListeners();
    this.calculateInstallment();
};

// Setup installment event listeners
App.setupInstallmentEventListeners = function() {
    const productPriceInput = document.getElementById('product-price');
    const installmentPeriodSelect = document.getElementById('installment-period');
    const initialPaymentSelect = document.getElementById('initial-payment');

    if (productPriceInput) {
        productPriceInput.addEventListener('input', () => this.calculateInstallment());
    }
    if (installmentPeriodSelect) {
        installmentPeriodSelect.addEventListener('change', () => this.calculateInstallment());
    }
    if (initialPaymentSelect) {
        initialPaymentSelect.addEventListener('change', () => this.calculateInstallment());
    }
};

// Calculate installment
App.calculateInstallment = function() {
    const productPriceInput = document.getElementById('product-price');
    const installmentPeriodSelect = document.getElementById('installment-period');
    const initialPaymentSelect = document.getElementById('initial-payment');
    const monthlyPaymentSpan = document.getElementById('monthly-payment');
    const totalAmountSpan = document.getElementById('total-amount');
    const overpaymentSpan = document.getElementById('overpayment');

    if (!productPriceInput || !installmentPeriodSelect || !initialPaymentSelect) return;

    const productPrice = parseFloat(productPriceInput.value) || 0;
    const installmentPeriod = parseInt(installmentPeriodSelect.value);
    const initialPaymentPercent = parseInt(initialPaymentSelect.value);
    
    // Calculate initial payment amount
    const initialPaymentAmount = (productPrice * initialPaymentPercent) / 100;
    
    // Calculate remaining amount
    const remainingAmount = productPrice - initialPaymentAmount;
    
    // Calculate monthly payment
    const monthlyPayment = remainingAmount / installmentPeriod;
    
    // Calculate total amount (no overpayment for 0% installment)
    const totalAmount = productPrice;
    const overpayment = 0;

    // Update display
    if (monthlyPaymentSpan) monthlyPaymentSpan.textContent = this.formatPrice(monthlyPayment);
    if (totalAmountSpan) totalAmountSpan.textContent = this.formatPrice(totalAmount);
    if (overpaymentSpan) overpaymentSpan.textContent = this.formatPrice(overpayment);

    // Update initial payment display
    this.updateInitialPaymentDisplay(initialPaymentAmount);
};

// Update initial payment display
App.updateInitialPaymentDisplay = function(amount) {
    const initialPaymentSelect = document.getElementById('initial-payment');
    if (!initialPaymentSelect) return;

    const productPriceInput = document.getElementById('product-price');
    const productPrice = parseFloat(productPriceInput?.value) || 0;

    const initialPaymentOptions = initialPaymentSelect.querySelectorAll('option');
    initialPaymentOptions.forEach(option => {
        const percent = parseInt(option.value);
        const calculatedAmount = (productPrice * percent) / 100;
        option.textContent = `${percent}% (${this.formatPrice(calculatedAmount)})`;
    });
};

// Delivery page module
App.initDelivery = function() {
    // Delivery page specific functionality is handled by common FAQ and animations
    console.log('Delivery page initialized');
};

// Make App globally accessible
window.App = App;

// Wire simple auth: save user on login/register and redirect to profile
document.addEventListener('submit', (e) => {
    const form = e.target;
    if (form.matches('.auth-form')) {
        const email = form.querySelector('input[type="email"]')?.value;
        const nameInput = form.querySelector('#reg-name');
        const pwd = form.querySelector('input[type="password"]')?.value;
        if (!email || !pwd) return;
        const user = {
            name: nameInput?.value || email.split('@')[0],
            email
        };
        try { localStorage.setItem('aagadgets_user', JSON.stringify(user)); } catch {}
        App.showNotification('Добро пожаловать!', 'success');
        e.preventDefault();
        setTimeout(()=> App.navigateTo('profile.html'), 600);
    }
}, true);
