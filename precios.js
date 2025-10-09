/* ...existing code... */
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
  const plans = document.querySelector('.plans');
  if(plans && window.matchMedia('(pointer:fine)').matches){
    window.addEventListener('mousemove', (e)=>{
      const rect = plans.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width; // 0 - 1
      const y = (e.clientY - rect.top) / rect.height;
      // gentle transform on plans layer elements instead of background
      const px = (x - 0.5) * 8; // small shift in px
      const py = (y - 0.5) * 4;
      plans.style.transform = `translate3d(${px}px, ${py}px, 0)`;
    });
    plans.addEventListener('mouseleave', ()=> { plans.style.transform = ''; });
  }

  // Note: Built-in auth modal removed; header buttons link directly to sesion.html and registro.html
});

/* Removed Three.js particle/canvas block because the plans section and canvas were deleted.
   If you later re-add a canvas container, reintroduce the Three.js code safely. */