/* ...existing code... */
const $ = sel =&gt; document.querySelector(sel);
const $$ = sel =&gt; Array.from(document.querySelectorAll(sel));

// removed tab interactivity: login is the only available action
const loginForm = $('#loginForm');

/* password toggle */
$$('.pw-toggle').forEach(btn=&gt;{
  btn.addEventListener('click', ()=&gt;{
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
if(pw &amp;&amp; confirmPw){
  pw.addEventListener('input', checkMatch);
  confirmPw.addEventListener('input', checkMatch);
}

/* user storage: save users in localStorage under 'blockhost_users' */
const STORAGE_KEY = 'blockhost_users';
function loadUsers(){
  try{ return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}'); }
  catch(e){ return {}; }
}
function saveUsers(obj){ localStorage.setItem(STORAGE_KEY, JSON.stringify(obj)); }

/* prefill if there is exactly one saved user, or if a lastSelectedEmail is stored */
const users = loadUsers();
const lastEmail = localStorage.getItem('blockhost_last');
if(lastEmail &amp;&amp; users[lastEmail]){
  const u = users[lastEmail];
  if($('#first_name')) $('#first_name').value = u.first || '';
  if($('#last_name')) $('#last_name').value = u.last || '';
  if($('#login_email')) $('#login_email').value = u.email || '';
}
/* if only one user exists, prefill with that too */
if(!lastEmail &amp;&amp; Object.keys(users).length === 1){
  const only = users[Object.keys(users)[0]];
  if($('#first_name')) $('#first_name').value = only.first || '';
  if($('#last_name')) $('#last_name').value = only.last || '';
  if($('#login_email')) $('#login_email').value = only.email || '';
}

/* form validations (minimal, client-side) */
loginForm.addEventListener('submit', (ev)=&gt;{
  ev.preventDefault();
  const first = loginForm.first_name ? loginForm.first_name.value.trim() : '';
  const last = loginForm.last_name ? loginForm.last_name.value.trim() : '';
  const email = loginForm.email ? loginForm.email.value.trim() : '';
  const pwVal = loginForm.password ? loginForm.password.value : '';
  const confirmVal = loginForm.confirm_password ? loginForm.confirm_password.value : '';
  if(!first || !last || !email || !pwVal || !confirmVal){ alert('Completa todos los campos'); return; }
  if(pwVal !== confirmVal){ alert('Las contraseñas no coinciden'); return; }

  const all = loadUsers();
  if(all[email]){
    alert('Usuario ya registrado previamente');
    // optionally prefill fields with stored data
    const existing = all[email];
    if($('#first_name')) $('#first_name').value = existing.first || '';
    if($('#last_name')) $('#last_name').value = existing.last || '';
    return;
  }

  // save new user
  all[email] = { first, last, email, created: Date.now() };
  saveUsers(all);
  localStorage.setItem('blockhost_last', email);

  const btn = loginForm.querySelector('.btn');
  btn.disabled = true;
  btn.textContent = 'Registrando...';
  setTimeout(()=&gt;{
    btn.disabled = false;
    btn.textContent = 'Registrarse';
    console.log('Registro guardado:', {first,last,email});
    loginForm.reset();
    if(pwHelp) pwHelp.textContent = '';
    alert('Registro completado y guardado localmente');
  },1000);
});

/* add subtle hover glow on primary button for polish */
document.querySelectorAll('.btn').forEach(b=&gt;{
  b.addEventListener('mouseenter', ()=&gt; b.style.transform='translateY(-3px) scale(1.01)');
  b.addEventListener('mouseleave', ()=&gt; b.style.transform='');
});

const registerBtn = document.getElementById('registerBtn');
if(registerBtn){
  registerBtn.addEventListener('click', ()=&gt; { location.href = 'sesion.html'; });
}

/* ...existing code... */</div>
