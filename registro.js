document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('loginForm');
  const pw = document.getElementById('login_pw');
  const confirmPw = document.getElementById('confirm_pw');
  const pwHelp = document.getElementById('pwHelp');

  // Mostrar/Ocultar contraseña
  document.querySelectorAll('.pw-toggle').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.for;
      const inp = document.getElementById(id);
      if (!inp) return;
      inp.type = inp.type === 'password' ? 'text' : 'password';
      btn.textContent = inp.type === 'password' ? 'Mostrar' : 'Ocultar';
    });
  });

  // Verificación de contraseñas en tiempo real
  function checkMatch() {
    if (confirmPw.value === '') { pwHelp.textContent = ''; return; }
    if (pw.value === confirmPw.value) {
      pwHelp.style.color = '#8ef5a1';
      pwHelp.textContent = 'Las contraseñas coinciden';
    } else {
      pwHelp.style.color = '#ff9b9b';
      pwHelp.textContent = 'No coinciden';
    }
  }
  pw.addEventListener('input', checkMatch);
  confirmPw.addEventListener('input', checkMatch);

  // Enviar datos al servidor PHP
  loginForm.addEventListener('submit', async (ev) => {
    ev.preventDefault();

    const data = {
      first_name: loginForm.first_name.value.trim(),
      last_name: loginForm.last_name.value.trim(),
      email: loginForm.email.value.trim(),
      password: loginForm.password.value,
      confirm_password: loginForm.confirm_password.value
    };

    if (!data.first_name || !data.last_name || !data.email || !data.password || !data.confirm_password) {
      alert('Completa todos los campos');
      return;
    }
    if (data.password !== data.confirm_password) {
      alert('Las contraseñas no coinciden');
      return;
    }

    try {
      const response = await fetch('registrar_usuario.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      const result = await response.json();

      if (result.status === 'exists') {
        alert('Ya existe una cuenta con estas credenciales');
      } else if (result.status === 'success') {
        alert('Cuenta creada correctamente');
        loginForm.reset();
        pwHelp.textContent = '';
      } else {
        alert('Error al registrar: ' + result.message);
      }
    } catch (error) {
      alert('Error de conexión con el servidor');
      console.error(error);
    }
  });
});
