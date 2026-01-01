/* Minimal interactive behavior:
   - Smooth scroll for anchor links
   - Small CTA click feedback
*/
document.addEventListener('click', (e) => {
  const a = e.target.closest('a[href^="#"]');
  if (!a) return;
  const href = a.getAttribute('href');
  if (href === '#' || href === '#!') return;
  const target = document.querySelector(href);
  if (target) {
    e.preventDefault();
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    // small focus highlight for accessibility
    target.setAttribute('tabindex','-1');
    target.focus({ preventScroll: true });
    setTimeout(()=> target.removeAttribute('tabindex'), 2000);
  }
});

document.getElementById('startBtn')?.addEventListener('click', (ev) => {
  // simple pulse effect
  ev.currentTarget.animate([
    { transform: 'scale(1)' },
    { transform: 'scale(0.98)' },
    { transform: 'scale(1)' }
  ], { duration: 220 });
});

/* Mobile menu toggle behavior (REPLACED): now use a left sliding sidebar with outside-click and ESC close */
(function(){
  const menuToggle = document.getElementById('menuToggle');
  const sidebar = document.getElementById('sidebar');

  if (!menuToggle || !sidebar) return;

  function openMenu(){
    menuToggle.classList.add('open');
    menuToggle.setAttribute('aria-expanded','true');
    sidebar.classList.add('active'); // use 'active' per requested HTML example
    sidebar.setAttribute('aria-hidden','false');
    document.documentElement.classList.add('sidebar-open');
    document.body.classList.add('sidebar-open');
  }

  function closeMenu(){
    menuToggle.classList.remove('open');
    menuToggle.setAttribute('aria-expanded','false');
    sidebar.classList.remove('active');
    sidebar.setAttribute('aria-hidden','true');
    document.documentElement.classList.remove('sidebar-open');
    document.body.classList.remove('sidebar-open');
  }

  // global toggle (keeps onclick attribute compatibility)
  window.toggleMenu = function toggleMenu(){
    const expanded = menuToggle.getAttribute('aria-expanded') === 'true';
    if (expanded) closeMenu(); else openMenu();
  };

  // close when clicking outside the sidebar (but respect 20% right-safe area)
  document.addEventListener('click', (e) => {
    if (!sidebar.classList.contains('active')) return;
    const inside = e.target.closest('#sidebar');
    const isToggle = e.target.closest('#menuToggle');
    if (!inside && !isToggle) closeMenu();
  }, { capture: true });

  // close when a link inside sidebar is clicked (allow anchor handler to run first)
  sidebar.addEventListener('click', (e) => {
    const a = e.target.closest('a');
    if (a) {
      // allow any anchor behavior then close
      setTimeout(closeMenu, 250);
    }
  });

  // close on Escape key
  document.addEventListener('keydown', (ev) => {
    if (ev.key === 'Escape' && sidebar.classList.contains('active')) {
      closeMenu();
      menuToggle.focus();
    }
  });
})();

/* Simple carousel for plans */
(function(){
  const carousel = document.querySelector('.plans-carousel');
  if (!carousel) return;
  const track = carousel.querySelector('.plan-grid');
  const prevBtn = carousel.querySelector('[data-action="prev"]');
  const nextBtn = carousel.querySelector('[data-action="next"]');
  if (!track) return; // guard if structure changed
  const slides = Array.from(track.children);
  let index = 0;

  // if there are no slides, nothing to do
  if (!slides.length) {
    if (prevBtn) prevBtn.disabled = true;
    if (nextBtn) nextBtn.disabled = true;
    return;
  }

  function update(){
    // compute gap safely
    const gap = parseFloat(getComputedStyle(track).gap || getComputedStyle(track).gridGap || 0) || 0;
    const slideWidth = slides[0].getBoundingClientRect().width + gap;
    const maxIndex = Math.max(0, slides.length - 1);
    const clamped = Math.max(0, Math.min(index, maxIndex));
    track.style.transform = `translateX(${ -clamped * slideWidth }px)`;
    if (prevBtn) prevBtn.disabled = clamped === 0;
    if (nextBtn) nextBtn.disabled = clamped === maxIndex;
  }

  if (prevBtn) prevBtn.addEventListener('click', ()=>{ index = Math.max(0, index - 1); update(); });
  if (nextBtn) nextBtn.addEventListener('click', ()=>{ index = Math.min(slides.length - 1, index + 1); update(); });

  // allow keyboard navigation when arrows focused
  [prevBtn, nextBtn].forEach(b => {
    if (!b) return;
    b.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        b.click();
      }
    });
  });

  // recalc on resize
  window.addEventListener('resize', update);

  // initial
  setTimeout(update, 80);
})();

/* Intersection observer to reveal .feature cards with a slide-down animation and stagger */
(function(){
  if (!('IntersectionObserver' in window)) {
    // If no IntersectionObserver, reveal all immediately
    document.querySelectorAll('.feature').forEach((el) => el.classList.add('visible'));
    return;
  }

  const features = Array.from(document.querySelectorAll('.feature'));
  if (!features.length) return;

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const index = features.indexOf(el);
        // stagger delay based on index
        const delay = Math.min(420, index * 90); // slightly larger stagger for mobile feel
        el.style.transitionDelay = delay + 'ms';
        el.classList.add('visible', 'pop');
        obs.unobserve(el);
      }
    });
  }, {
    root: null,
    // extend rootMargin to trigger earlier on short mobile viewports
    rootMargin: '0px 0px -20% 0px',
    threshold: 0.12
  });

  features.forEach(f => observer.observe(f));
})();

/* NEW: Intersection observer to reveal .plan cards on mobile with a vertical rise animation (staggered) */
(function(){
  const plans = Array.from(document.querySelectorAll('.plan'));
  if (!plans.length) return;

  // On non-mobile viewports, reveal plans immediately
  if (!window.matchMedia('(max-width: 767px)').matches) {
    plans.forEach(p => p.classList.add('reveal-visible'));
    return;
  }

  // set initial hidden state
  plans.forEach(p => p.classList.add('reveal-hidden'));

  if (!('IntersectionObserver' in window)) {
    plans.forEach((p, i) => {
      setTimeout(()=> p.classList.add('reveal-visible'), i * 80);
    });
    return;
  }

  const planObserver = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const idx = plans.indexOf(el);
        const delay = Math.min(420, idx * 80);
        el.style.transitionDelay = delay + 'ms';
        el.classList.remove('reveal-hidden');
        el.classList.add('reveal-visible');
        obs.unobserve(el);
      }
    });
  }, {
    root: null,
    rootMargin: '0px 0px -20% 0px',
    threshold: 0.12
  });

  plans.forEach(p => planObserver.observe(p));
})();

/* --------------------------
   Tombstone: runtime initialization moved to /js/init.js
   The following code was removed from this file to centralize initialization:
     - performance polyfill
     - initial timestamps & globals
     - wix-essential-viewer-model JSON parsing
   -------------------------- */

/* Additional UX & utilities added:
   - prevent pinch/double-tap zoom on mobile
   - year injection
   - cookie banner logic
   - improved smooth anchor scrolling accounting for header
   - currency helper bootstrap (exposed on window.BlockHostCurrency)
*/
window.addEventListener('gesturestart', (e)=> e.preventDefault(), {passive:false});
window.addEventListener('gesturechange', (e)=> e.preventDefault(), {passive:false});
document.addEventListener('dblclick', (e)=> {
  if (matchMedia('(pointer:coarse)').matches) e.preventDefault();
}, {passive:false});

const yearEl = document.getElementById('year');
if(yearEl) yearEl.textContent = new Date().getFullYear();

/* Cookie banner logic */
const COOKIE_KEY = 'blockhost_cookie_pref';
const cookieBanner = document.getElementById('cookie-banner');
function showCookieBanner(){
  if(!cookieBanner) return;
  cookieBanner.classList.add('show');
}
function hideCookieBanner(){
  if(!cookieBanner) return;
  cookieBanner.classList.remove('show');
}
function setCookiePref(value){
  try{ localStorage.setItem(COOKIE_KEY, JSON.stringify(value)); }catch(e){}
  hideCookieBanner();
}

document.addEventListener('DOMContentLoaded', ()=>{
  try{
    const pref = JSON.parse(localStorage.getItem(COOKIE_KEY));
    if(!pref) showCookieBanner();
  }catch(e){
    showCookieBanner();
  }

  const btnAccept = document.getElementById('cookie-accept');
  const btnDecline = document.getElementById('cookie-decline');
  const btnManage = document.getElementById('cookie-manage');
  if(btnAccept) btnAccept.addEventListener('click', ()=> setCookiePref({analytics:true, functional:true, accepted:true}));
  if(btnDecline) btnDecline.addEventListener('click', ()=> setCookiePref({analytics:false, functional:false, accepted:false}));
  if(btnManage) btnManage.addEventListener('click', ()=> {
    // Simple manage action -> open políticas section
    document.getElementById('politicas')?.scrollIntoView({behavior:'smooth'});
  });

  // Smooth scroll for in-page anchors (gentle offset to account for header)
  document.querySelectorAll('a[href^="#"]').forEach(a=>{
    a.addEventListener('click', (e)=>{
      const targetId = a.getAttribute('href').slice(1);
      const target = document.getElementById(targetId);
      if(target){
        e.preventDefault();
        const headerOffset = Math.min(document.querySelector('.site-header')?.offsetHeight || 76, 120);
        const rect = target.getBoundingClientRect();
        const top = window.scrollY + rect.top - headerOffset - 12; // small breathing space
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  });

  // Currency detection + selector helpers (exposed for custom dropdowns)
  const CURRENCIES = {
    USD: { rate: 1.08, locales: ['en-US','es-PA'], label: 'Dólares (USD)' }, // Panama uses USD
    PEN: { rate: 4.04, locales: ['es-PE'], label: 'Perú — Soles (PEN)' },
    MXN: { rate: 19.5, locales: ['es-MX'], label: 'México — Pesos (MXN)' },
    COP: { rate: 4390, locales: ['es-CO'], label: 'Colombia — Pesos (COP)' },
    ARS: { rate: 980, locales: ['es-AR'], label: 'Argentina — Pesos (ARS)' },
    VES: { rate: 39, locales: ['es-VE'], label: 'Venezuela — Bolívar (VES)' },
    BOB: { rate: 7.4, locales: ['es-BO'], label: 'Bolivia — Boliviano (BOB)' },
    EUR: { rate: 1, locales: ['es-ES'], label: 'Europa — Euros (EUR)' },
  };
  const currencySelect = document.getElementById('currency-select');
  const amounts = Array.from(document.querySelectorAll('.amount[data-eur]'));

  function guessCurrency(){
    const lang = navigator.language || 'es-ES';
    const match = Object.entries(CURRENCIES).find(([,v])=> v.locales.some(l=> lang.startsWith(l)));
    return match ? match[0] : 'USD';
  }
  function formatCurrency(valueEur, code){
    const { rate } = CURRENCIES[code] || CURRENCIES.USD;
    const converted = valueEur * rate;
    return new Intl.NumberFormat(undefined, { style:'currency', currency: code, maximumFractionDigits: code==='COP'||code==='ARS'||code==='VES'?0:2 }).format(converted);
  }
  function updatePrices(code){
    amounts.forEach(el=>{
      const eur = parseFloat(el.dataset.eur);
      el.textContent = formatCurrency(eur, code);
    });
  }
  // expose currency helpers for the custom dropdown
  window.BlockHostCurrency = { CURRENCIES, amounts, formatCurrency, updatePrices, guessCurrency };

  /* Removed Three.js particle/canvas block because the plans section and canvas were deleted.
     If you later re-add a canvas container, reintroduce the Three.js code safely. */
}