/* ...existing code... */
const $ = sel => document.querySelector(sel);
const $$ = sel => Array.from(document.querySelectorAll(sel));

/* Add audio assets for error and success feedback */
const errorSnd = new Audio('/error_sound.mp3');
errorSnd.preload = 'auto';
errorSnd.volume = 0.9;
const successSnd = new Audio('/success_sound.mp3');
successSnd.preload = 'auto';
successSnd.volume = 0.9;

// removed tab interactivity: login is the only available action
const registroForm = document.getElementById('registroForm');
// success banner (index page)
const successBanner = document.getElementById('successBanner');

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

/* Utility: show inline semi-transparent message near the confirm-password field.
   Reuse existing #pwMismatch if present (registro.html), otherwise create a transient box. */
function showPwMismatchMessage(form, message = 'Las contraseñas no coinciden'){
  // try to find existing small inline element first
  let inline = form.querySelector('#pwMismatch');
  if(inline){
    inline.textContent = message;
    inline.style.display = 'block';
    inline.classList.remove('shake');
    void inline.offsetWidth;
    inline.classList.add('shake');
    return;
  }

  // else check if a created helper already exists
  let helper = form.querySelector('#pwMismatchBox');
  if(!helper){
    // try to find the confirm input to insert after it
    const confirmInput = form.querySelector('#reg_pw_confirm') || form.querySelector('[name="password_confirm"]');
    helper = document.createElement('div');
    helper.id = 'pwMismatchBox';
    helper.setAttribute('role','alert');
    helper.setAttribute('aria-live','polite');
    helper.style.display = 'none';
    helper.style.marginTop = '10px';
    helper.style.padding = '10px 12px';
    helper.style.borderRadius = '10px';
    helper.style.background = 'linear-gradient(135deg, rgba(255,120,120,0.12), rgba(255,80,80,0.10))';
    helper.style.color = '#fff';
    helper.style.fontWeight = '700';
    helper.style.backdropFilter = 'blur(4px)';
    helper.style.border = '1px solid rgba(255,90,90,0.12)';
    helper.style.boxShadow = '0 8px 20px rgba(0,0,0,0.12)';
    helper.style.transition = 'transform .12s ease, opacity .12s ease';
    // simple shake animation via class
    helper.classList.add('pw-mismatch-inline');
    // minimal CSS for shake (inlined class animation)
    const styleId = 'pwMismatchBox-styles';
    if(!document.getElementById(styleId)){
      const style = document.createElement('style');
      style.id = styleId;
      style.textContent = `
        @keyframes pwInlineShake { 0%{transform:translateX(0)}20%{transform:translateX(-6px)}40%{transform:translateX(6px)}60%{transform:translateX(-4px)}80%{transform:translateX(4px)}100%{transform:translateX(0)} }
        .pw-mismatch-inline.shake { animation: pwInlineShake .42s ease-in-out; }
      `;
      document.head.appendChild(style);
    }

    if(confirmInput && confirmInput.parentElement){
      // insert after the confirm input's wrapper if exists, otherwise after the input
      const parent = confirmInput.parentElement;
      // try to find an appropriate sibling spot (after the input element wrapper)
      parent.insertAdjacentElement('afterend', helper);
    } else {
      // fallback: append to the form top
      form.insertAdjacentElement('afterbegin', helper);
    }
  }

  helper.textContent = message;
  helper.style.display = 'block';
  helper.classList.remove('shake');
  void helper.offsetWidth;
  helper.classList.add('shake');

  // auto-hide after 4.2s
  clearTimeout(helper._hideTimeout);
  helper._hideTimeout = setTimeout(()=> {
    helper.style.display = 'none';
    helper.classList.remove('shake');
  }, 4200);
}

// ensure registro behavior degrades gracefully if index contains registro form
if(registroForm){
  registroForm.addEventListener('submit', async (ev)=>{
    ev.preventDefault();
    if(!registroForm.checkValidity()){ registroForm.reportValidity(); return; }
    const pw = document.getElementById('reg_pw')?.value;
    const pwc = document.getElementById('reg_pw_confirm')?.value;
    if(typeof pw !== 'undefined' && pw !== pwc){
      // replace default alert with inline semi-transparent message box
      showPwMismatchMessage(registroForm, 'Las contraseñas no coinciden');
      // play error sound for feedback
      try { errorSnd.currentTime = 0; errorSnd.play(); } catch(e){ /* ignore playback errors */ }
      // focus the first password field for convenience
      const firstPw = document.getElementById('reg_pw') || registroForm.querySelector('[name="password"]');
      if(firstPw) firstPw.focus();
      return;
    }
    const datos = Object.fromEntries(new FormData(registroForm));
    const btn = document.getElementById('registroBtn') || registroForm.querySelector('.btn');
    const dots = btn?.querySelector('.dots');
    const successBanner = document.getElementById('successBanner');
    try {
      if(btn){ btn.disabled = true; btn.setAttribute('aria-busy','true'); if(dots) dots.style.display='inline-block'; }
      const res = await fetch('https://api-registro.mc-blockhost.workers.dev/crear_usuario', {
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body: JSON.stringify(datos)
      });
      const data = await res.json();
      if(res.ok){
        if(successBanner) successBanner.style.display='block';
        // play success sound then redirect
        try { successSnd.currentTime = 0; await successSnd.play(); } catch(e){ /* ignore autoplay restrictions */ }
        setTimeout(()=> window.location.href = 'https://panel.blockhost.es', 1400);
      } else {
        // show API error inline if possible
        try { errorSnd.currentTime = 0; errorSnd.play(); } catch(e){ /* ignore */ }
        const formMsg = registroForm.querySelector('.msg-banner') || registroForm.querySelector('#formMessage');
        if(formMsg){
          formMsg.textContent = data.mensaje || 'Error en el registro.';
          formMsg.classList.add('show','error');
        } else {
          alert(data.mensaje || 'Error en el registro.');
        }
      }
    } catch(err){
      console.error(err);
      try { errorSnd.currentTime = 0; errorSnd.play(); } catch(e){ /* ignore */ }
      const formMsg = registroForm.querySelector('.msg-banner') || registroForm.querySelector('#formMessage');
      if(formMsg){
        formMsg.textContent = 'Error al conectar con el servidor';
        formMsg.classList.add('show','error');
      } else {
        alert('Error al conectar con el servidor.');
      }
    } finally {
      if(btn){ btn.disabled = false; btn.removeAttribute('aria-busy'); if(dots) dots.style.display='none'; }
    }
  });
}

/* add subtle hover glow on primary button for polish */
document.querySelectorAll('.btn').forEach(b=>{
  b.addEventListener('mouseenter', ()=> b.style.transform='translateY(-3px) scale(1.01)');
  b.addEventListener('mouseleave', ()=> b.style.transform='');
});
