/* ...existing code... */
// Prevent pinch and double-tap zoom on mobile
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

  // Subtle parallax on mousemove for the plans background (desktop only)
  // remove parallax mousemove behavior to prevent page shifting on mouse movement
  // const plans = document.querySelector('.plans');
  // if(plans && window.matchMedia('(pointer:fine)').matches){
  //   window.addEventListener('mousemove', (e)=>{
  //     const rect = plans.getBoundingClientRect();
  //     const x = (e.clientX - rect.left) / rect.width; // 0 - 1
  //     const y = (e.clientY - rect.top) / rect.height;
  //     const px = (x - 0.5) * 8; // small shift in px
  //     const py = (y - 0.5) * 4;
  //     plans.style.transform = `translate3d(${px}px, ${py}px, 0)`;
  //   });
  //   plans.addEventListener('mouseleave', ()=> { plans.style.transform = ''; });
  // }

  // Note: Built-in auth modal removed; header buttons link directly to sesion.html and registro.html

  // Currency detection + selector
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
  if(currencySelect){
    // remove native <select> initialization (replaced by custom dropdown)
    // currencySelect.innerHTML = "";
    // Object.entries(CURRENCIES).forEach(([code, meta])=>{ /* ... */ });
    // const initial = guessCurrency();
    // currencySelect.value = initial;
    // updatePrices(initial);
    // currencySelect.addEventListener('change', ()=> updatePrices(currencySelect.value));
  }
  // expose currency helpers for the custom dropdown
  window.BlockHostCurrency = { CURRENCIES, amounts, formatCurrency, updatePrices, guessCurrency };

  /* Removed Three.js particle/canvas block because the plans section and canvas were deleted.
     If you later re-add a canvas container, reintroduce the Three.js code safely. */
});
