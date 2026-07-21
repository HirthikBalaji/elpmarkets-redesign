/* 
   ELP Markets - Premium JavaScript Interactions (app.js)
   Fully lightweight, vanilla JS for blazing fast load times (PageSpeed 90+).
   Provides interactive ticker tape simulation, client-side calculator, testimonial slider,
   scroll animations via IntersectionObserver, and accessible mobile menu.
*/

document.addEventListener('DOMContentLoaded', () => {
    initHeaderScroll();
    initMobileNav();
    initTickerTape();
    initScrollAnimations();
    initTestimonialSlider();
    initTradingCalculator();
    initSmoothAnchors();
});

/* 1. Header scroll effect */
function initHeaderScroll() {
    const header = document.querySelector('.header');
    if (!header) return;
    
    const handleScroll = () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Check initially
}

/* 2. Mobile navigation toggle & trap focus */
function initMobileNav() {
    const toggleBtn = document.querySelector('.mobile-nav-toggle');
    const mobilePanel = document.querySelector('.mobile-nav');
    const overlay = document.querySelector('.overlay');
    const closeBtn = document.querySelector('.mobile-nav-close');
    
    if (!toggleBtn || !mobilePanel || !overlay) return;
    
    const openMenu = () => {
        mobilePanel.classList.add('open');
        overlay.classList.add('open');
        toggleBtn.setAttribute('aria-expanded', 'true');
        document.body.style.overflow = 'hidden';
        // Trap focus to close button
        if (closeBtn) closeBtn.focus();
    };
    
    const closeMenu = () => {
        mobilePanel.classList.remove('open');
        overlay.classList.remove('open');
        toggleBtn.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
    };
    
    toggleBtn.addEventListener('click', openMenu);
    if (closeBtn) closeBtn.addEventListener('click', closeMenu);
    overlay.addEventListener('click', closeMenu);
    
    // Close menu on pressing Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && mobilePanel.classList.contains('open')) {
            closeMenu();
        }
    });
}

/* 3. Live Ticker Tape Simulator */
function initTickerTape() {
    const tickers = [
        { symbol: 'EUR/USD', price: 1.0924, change: 0.12 },
        { symbol: 'GBP/USD', price: 1.2741, change: -0.08 },
        { symbol: 'USD/JPY', price: 154.68, change: 0.35 },
        { symbol: 'AUD/USD', price: 0.6653, change: -0.15 },
        { symbol: 'USD/CHF', price: 0.8872, change: 0.04 },
        { symbol: 'XAU/USD', price: 2384.50, change: 1.12 },
        { symbol: 'XAG/USD', price: 29.15, change: -0.84 },
        { symbol: 'SPX 500', price: 5432.10, change: 0.45 },
        { symbol: 'US 100', price: 19542.80, change: 0.62 },
        { symbol: 'BRENT CRUDE', price: 81.42, change: -1.25 }
    ];
    
    const tickerScroll = document.querySelector('.ticker-scroll');
    if (!tickerScroll) return;
    
    // Create dual sets for infinite scroll
    const createTickerHTML = (itemList) => {
        return itemList.map(ticker => {
            const isUp = ticker.change >= 0;
            const changeSign = isUp ? '+' : '';
            return `
                <div class="ticker-item">
                    <span class="ticker-symbol">${ticker.symbol}</span>
                    <span class="ticker-price" data-symbol="${ticker.symbol}">${ticker.price.toFixed(ticker.symbol.includes('JPY') ? 2 : ticker.symbol.includes('USD') && !ticker.symbol.includes('XAU') ? 4 : 2)}</span>
                    <span class="ticker-change ${isUp ? 'up' : 'down'}" data-change="${ticker.symbol}">${changeSign}${ticker.change.toFixed(2)}%</span>
                </div>
            `;
        }).join('');
    };
    
    const tickerItemsHTML = createTickerHTML(tickers);
    // Duplicate the items to allow seamless infinite looping
    tickerScroll.innerHTML = tickerItemsHTML + tickerItemsHTML;
    
    // Periodically update rates simulation to convey "active live markets"
    setInterval(() => {
        document.querySelectorAll('.ticker-price').forEach(el => {
            const symbol = el.getAttribute('data-symbol');
            const ticker = tickers.find(t => t.symbol === symbol);
            if (ticker) {
                // Simulate minor price fluctuation
                const fluctuationPercent = (Math.random() - 0.5) * 0.04; // max +/-0.02%
                ticker.price += ticker.price * fluctuationPercent;
                // Fluctuate the percent change too
                ticker.change += (Math.random() - 0.5) * 0.05;
                
                const decimals = symbol.includes('JPY') ? 2 : symbol.includes('USD') && !symbol.includes('XAU') ? 4 : 2;
                el.textContent = ticker.price.toFixed(decimals);
                
                const changeEl = document.querySelector(`[data-change="${symbol}"]`);
                if (changeEl) {
                    const isUp = ticker.change >= 0;
                    changeEl.className = `ticker-change ${isUp ? 'up' : 'down'}`;
                    changeEl.textContent = `${isUp ? '+' : ''}${ticker.change.toFixed(2)}%`;
                }
            }
        });
    }, 4000);
}

/* 4. Intersection Observer scroll animations */
function initScrollAnimations() {
    const animElements = document.querySelectorAll('.animate-on-scroll');
    if (animElements.length === 0) return;
    
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };
    
    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-fade-in-up');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);
    
    animElements.forEach(el => observer.observe(el));
}

/* 5. Accessible, touch-friendly testimonial slider */
function initTestimonialSlider() {
    const sliderWrapper = document.querySelector('.testimonial-slider-track');
    const slides = document.querySelectorAll('.testimonial-slide');
    const prevBtn = document.querySelector('.slider-btn-prev');
    const nextBtn = document.querySelector('.slider-btn-next');
    const dotsContainer = document.querySelector('.slider-dots');
    
    if (!sliderWrapper || slides.length === 0) return;
    
    let currentIndex = 0;
    const totalSlides = slides.length;
    let autoPlayTimer;
    
    // Create indicator dots dynamically
    if (dotsContainer) {
        dotsContainer.innerHTML = '';
        slides.forEach((_, idx) => {
            const dot = document.createElement('button');
            dot.classList.add('slider-dot');
            if (idx === 0) dot.classList.add('active');
            dot.setAttribute('aria-label', `Go to testimonial slide ${idx + 1}`);
            dot.addEventListener('click', () => {
                goToSlide(idx);
                resetAutoplay();
            });
            dotsContainer.appendChild(dot);
        });
    }
    
    const updateSlider = () => {
        // Calculate offset (percentage shifts)
        const offset = -currentIndex * 100;
        sliderWrapper.style.transform = `translateX(${offset}%)`;
        
        // Update dots state
        if (dotsContainer) {
            const dots = dotsContainer.querySelectorAll('.slider-dot');
            dots.forEach((dot, idx) => {
                if (idx === currentIndex) {
                    dot.classList.add('active');
                    dot.setAttribute('aria-current', 'true');
                } else {
                    dot.classList.remove('active');
                    dot.removeAttribute('aria-current');
                }
            });
        }
        
        // Update slides visibility/ARIA
        slides.forEach((slide, idx) => {
            if (idx === currentIndex) {
                slide.setAttribute('aria-hidden', 'false');
                // Ensure focusable child elements inside active slide can be tabbed to
                slide.querySelectorAll('a, button').forEach(el => el.removeAttribute('tabindex'));
            } else {
                slide.setAttribute('aria-hidden', 'true');
                slide.querySelectorAll('a, button').forEach(el => el.setAttribute('tabindex', '-1'));
            }
        });
    };
    
    const nextSlide = () => {
        currentIndex = (currentIndex + 1) % totalSlides;
        updateSlider();
    };
    
    const prevSlide = () => {
        currentIndex = (currentIndex - 1 + totalSlides) % totalSlides;
        updateSlider();
    };
    
    if (nextBtn) nextBtn.addEventListener('click', () => { nextSlide(); resetAutoplay(); });
    if (prevBtn) prevBtn.addEventListener('click', () => { prevSlide(); resetAutoplay(); });
    
    // Touch gestures support
    let startX = 0;
    let endX = 0;
    
    sliderWrapper.addEventListener('touchstart', (e) => {
        startX = e.touches[0].clientX;
    }, { passive: true });
    
    sliderWrapper.addEventListener('touchmove', (e) => {
        endX = e.touches[0].clientX;
    }, { passive: true });
    
    sliderWrapper.addEventListener('touchend', () => {
        const threshold = 50;
        if (startX - endX > threshold) {
            nextSlide();
            resetAutoplay();
        } else if (endX - startX > threshold) {
            prevSlide();
            resetAutoplay();
        }
    });
    
    // Autoplay implementation
    const startAutoplay = () => {
        autoPlayTimer = setInterval(nextSlide, 6000);
    };
    
    const resetAutoplay = () => {
        clearInterval(autoPlayTimer);
        startAutoplay();
    };
    
    startAutoplay();
    updateSlider(); // Initial state
}

/* 6. Live Interactive Trading spreads/pip calculator */
function initTradingCalculator() {
    const selectInstrument = document.getElementById('calc-instrument');
    const inputLots = document.getElementById('calc-lots');
    const resultSpread = document.getElementById('calc-result-spread');
    const resultPip = document.getElementById('calc-result-pip');
    const calculateBtn = document.getElementById('calc-trigger');
    
    if (!selectInstrument || !inputLots || !resultSpread || !resultPip || !calculateBtn) return;
    
    // Instrument specifications (Spread in Pips, Pip value for 1 Lot in USD)
    const instrumentSpecs = {
        eurusd: { spread: 0.2, pipVal: 10 },
        gbpusd: { spread: 0.4, pipVal: 10 },
        usdjpy: { spread: 0.5, pipVal: 6.45 },
        xauusd: { spread: 1.2, pipVal: 10 },
        xagusd: { spread: 1.5, pipVal: 50 },
        spx500: { spread: 0.45, pipVal: 10 }
    };
    
    const runCalculation = () => {
        const key = selectInstrument.value;
        const lots = parseFloat(inputLots.value) || 0;
        
        if (lots <= 0) {
            resultSpread.textContent = '$0.00';
            resultPip.textContent = '$0.00';
            return;
        }
        
        const spec = instrumentSpecs[key];
        if (!spec) return;
        
        // Cost = Spread Pips * Lot Size * Pip Value
        const spreadCost = spec.spread * lots * spec.pipVal;
        // Pip Value = Lot Size * Pip Value Base
        const pipCost = lots * spec.pipVal;
        
        // Add subtle animation when changing values
        resultSpread.style.opacity = '0.5';
        resultPip.style.opacity = '0.5';
        
        setTimeout(() => {
            resultSpread.textContent = `$${spreadCost.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
            resultPip.textContent = `$${pipCost.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
            resultSpread.style.opacity = '1';
            resultPip.style.opacity = '1';
        }, 150);
    };
    
    calculateBtn.addEventListener('click', runCalculation);
    inputLots.addEventListener('input', runCalculation);
    selectInstrument.addEventListener('change', runCalculation);
    runCalculation(); // Run initial calculation
}

/* 7. Smooth scrolling for internal anchor links */
function initSmoothAnchors() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetEl = document.querySelector(targetId);
            if (targetEl) {
                e.preventDefault();
                const headerOffset = 90;
                const elementPosition = targetEl.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
                
                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
                
                // Set keyboard focus for accessibility
                targetEl.setAttribute('tabindex', '-1');
                targetEl.focus({ preventScroll: true });
            }
        });
    });
}
