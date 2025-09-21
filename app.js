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

/* live password match indicator */
const pw = document.getElementById('login_pw');
const confirmPw = document.getElementById('confirm_pw');
const pwHelp = document.getElementById('pwHelp');
function checkMatch(){
  if(!pw || !confirmPw || !pwHelp) return;
  if(confirmPw.value === '') { pwHelp.textContent = ''; return; }
  if(pw.value === confirmPw.value){
    pwHelp.style.color = '#8ef5a1';
    pwHelp.textContent = 'Las contraseñas coinciden';
  } else {
    pwHelp.style.color = '#ff9b9b';
    pwHelp.textContent = 'No coinciden';
  }
}
if(pw && confirmPw){
  pw.addEventListener('input', checkMatch);
  confirmPw.addEventListener('input', checkMatch);
}

/* form validations (minimal, client-side) */
loginForm.addEventListener('submit', (ev)=>{
  ev.preventDefault();
  const first = loginForm.first_name.value.trim();
  const last = loginForm.last_name.value.trim();
  const email = loginForm.email.value.trim();
  const pwVal = loginForm.password.value;
  const confirmVal = loginForm.confirm_password.value;
  if(!first || !last || !email || !pwVal || !confirmVal){ alert('Completa todos los campos'); return; }
  if(pwVal !== confirmVal){ alert('Las contraseñas no coinciden'); return; }
  // optional email check (kept simple)
  // simulate server response (registration)
  const btn = loginForm.querySelector('.btn');
  btn.disabled = true;
  btn.textContent = 'Registrando...';
  setTimeout(()=>{
    btn.disabled = false;
    btn.textContent = 'Registrarse';
    console.log('Registro simulado:', {first,last,email});
    loginForm.reset();
    pwHelp.textContent = '';
  },1000);
});

/* add subtle hover glow on primary button for polish */
document.querySelectorAll('.btn').forEach(b=>{
  b.addEventListener('mouseenter', ()=> b.style.transform='translateY(-3px) scale(1.01)');
  b.addEventListener('mouseleave', ()=> b.style.transform='');
});

const registerBtn = document.getElementById('registerBtn');
if(registerBtn){
  registerBtn.addEventListener('click', ()=> { location.href = 'sesion.html'; });
}

/* ...existing code... */
