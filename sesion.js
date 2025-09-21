/* ...existing code... */
const $ = sel => document.querySelector(sel);
const $$ = sel => Array.from(document.querySelectorAll(sel));

// removed tab interactivity: login is the only available action
const loginForm = $('#loginForm');

/* password toggle */
$$('.pw-toggle').forEach(btn=>{
  btn.addEventListener('click', ()=>{
    const id = btn.dataset.for;
    const inp = document.getElementById(id);
    if(!inp) return;
    if(inp.type === 'password'){
      inp.type = 'text';
      btn.textContent = 'Ocultar';
    } else {
      inp.type = 'password';
      btn.textContent = 'Mostrar';
    }
  });
});

/* form validations (minimal, client-side) */
loginForm.addEventListener('submit', (ev)=>{
  ev.preventDefault();
  const email = loginForm.email.value.trim();
  const pw = loginForm.password.value;
  if(!email || !pw){ alert('Completa todos los campos'); return; }
  if(!email.toLowerCase().endsWith('@gmail.com')){ alert('Correo inválido. Usa una cuenta @gmail.com'); return; }
  // simulate server response
  const btn = loginForm.querySelector('.btn');
  btn.disabled = true;
  btn.textContent = 'Verificando...';
  setTimeout(()=>{
    btn.disabled = false;
    btn.textContent = 'Entrar a Blockhost';
    // login simulated silently; reset form
    console.log('Inicio de sesión simulado:', email);
    loginForm.reset();
  },1000);
});

/* add subtle hover glow on primary button for polish */
document.querySelectorAll('.btn').forEach(b=>{
  b.addEventListener('mouseenter', ()=> b.style.transform='translateY(-3px) scale(1.01)');
  b.addEventListener('mouseleave', ()=> b.style.transform='');
});

const registerBtn = document.getElementById('registerBtn');
if(registerBtn){
  registerBtn.addEventListener('click', ()=> location.href = 'registro.html');
}

/* ...existing code... */
