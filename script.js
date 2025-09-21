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

  // Note: Built-in auth modal removed; header buttons link directly to sesion.html and registro.html
});

/* Simple subtle canvas animation using Three.js for a particle field */
import * as THREE from 'three';

const wrap = document.getElementById('canvas-wrap');
if (wrap) {
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(50, wrap.clientWidth / Math.max(wrap.clientHeight,1), 0.1, 1000);
  camera.position.z = 60;

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  function resizeRenderer() {
    const w = wrap.clientWidth || 300;
    const h = Math.max(wrap.clientHeight, 120);
    renderer.setSize(w, h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  renderer.setClearColor(0x000000, 0);
  wrap.appendChild(renderer.domElement);
  resizeRenderer();

  const geometry = new THREE.BufferGeometry();
  const count = 400;
  const positions = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    positions[i * 3 + 0] = (Math.random() - 0.5) * 120;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 60;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 40;
  }
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  const material = new THREE.PointsMaterial({ size: 1.8, color: 0xbda1ff, transparent: true, opacity: 0.9 });
  const points = new THREE.Points(geometry, material);
  scene.add(points);

  function onResize(){
    resizeRenderer();
  }
  // Use both resize and a ResizeObserver for dynamic layout changes on mobile
  window.addEventListener('resize', onResize);
  const ro = new ResizeObserver(resizeRenderer);
  ro.observe(wrap);

  let t = 0;
  function animate(){
    t += 0.002;
    points.rotation.y = t * 0.8;
    points.rotation.x = Math.sin(t * 0.6) * 0.08;
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  }
  animate();
}
/* ...existing code... */
