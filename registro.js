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

  // --- EXISTING CODE ---
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
    document.getElementById('politicas')?.scrollIntoView({behavior:'smooth'});
  });

  document.querySelectorAll('a[href^="#"]').forEach(a=>{
    a.addEventListener('click', (e)=>{
      const targetId = a.getAttribute('href').slice(1);
      const target = document.getElementById(targetId);
      if(target){
        e.preventDefault();
        const headerOffset = Math.min(document.querySelector('.site-header')?.offsetHeight || 76, 120);
        const rect = target.getBoundingClientRect();
        const top = window.scrollY + rect.top - headerOffset - 12;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  });

  // --- Currency & other existing code ---
  const CURRENCIES = {
    USD: { rate: 1.08, locales: ['en-US','es-PA'], label: 'Dólares (USD)' },
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
  function guessCurrency(){ const lang = navigator.language || 'es-ES'; const match = Object.entries(CURRENCIES).find(([,v])=> v.locales.some(l=> lang.startsWith(l))); return match ? match[0] : 'USD'; }
  function formatCurrency(valueEur, code){ const { rate } = CURRENCIES[code] || CURRENCIES.USD; const converted = valueEur * rate; return new Intl.NumberFormat(undefined, { style:'currency', currency: code, maximumFractionDigits: code==='COP'||code==='ARS'||code==='VES'?0:2 }).format(converted); }
  function updatePrices(code){ amounts.forEach(el=>{ const eur = parseFloat(el.dataset.eur); el.textContent = formatCurrency(eur, code); }); }
  if(currencySelect){ /* removed native <select> initialization */ }
  window.BlockHostCurrency = { CURRENCIES, amounts, formatCurrency, updatePrices, guessCurrency };

  // --- REGISTER FORM LOGIC ---
  const form = document.getElementById("loginForm");
  if(form){
    form.addEventListener("submit", async (e)=>{
      e.preventDefault();

      const formData = new FormData(form);
      const firstName = formData.get("first_name").trim();
      const lastName = formData.get("last_name").trim();
      const email = formData.get("email").trim();
      const password = formData.get("password");
      const confirmPassword = formData.get("confirm_password");

      if(password !== confirmPassword){
        alert("❌ Las contraseñas no coinciden");
        return;
      }
      if(!firstName || !lastName || !email || !password){
        alert("❌ Todos los campos son obligatorios");
        return;
      }

      const username = (firstName + lastName).toLowerCase().replace(/\s+/g, "");

      try{
        const res = await fetch("https://api.panel.blockhost.es/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username, email, password }),
        });
        const data = await res.json();
        if(res.ok){
          alert(data.message || "✅ Usuario creado correctamente");
          form.reset();
        } else {
          alert(data.error || JSON.stringify(data));
        }
        console.log("Respuesta API:", data);
      } catch(err){
        console.error("Error al conectar con la API:", err);
        alert("❌ No se pudo conectar con la API. Intenta más tarde.");
      }
    });
  }

  /* Removed Three.js particle/canvas block */
});
