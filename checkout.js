const SOFTWARE_OPTIONS = {
  Java: [
    { value: 'Vanilla', label: 'Vanilla', desc: 'Minecraft puro sin modificaciones' },
    { value: 'Paper', label: 'Paper', desc: 'Optimizado para rendimiento' },
    { value: 'Spigot', label: 'Spigot', desc: 'Compatible con plugins' },
    { value: 'Fabric', label: 'Fabric', desc: 'Modding ligero y moderno' },
    { value: 'Forge', label: 'Forge', desc: 'Mods completos y complejos' },
    { value: 'Sponge', label: 'Sponge', desc: 'API avanzada para plugins' },
    { value: 'Archlight', label: 'Archlight', desc: 'Forge + Bukkit híbrido' }
  ],
  Bedrock: [
    { value: 'Vanilla', label: 'Vanilla', desc: 'Bedrock oficial' },
    { value: 'Pocketmine', label: 'PocketMine-MP', desc: 'Servidor en PHP con plugins' },
    { value: 'Nukkit', label: 'Nukkit', desc: 'Servidor en Java para Bedrock' }
  ]
};

const PLAN_DATA = {
  'Mini': { name: 'Mini', price: 3.50, ram: 4, storage: 25, players: '15-25' },
  'Básico': { name: 'Básico', price: 5.50, ram: 6, storage: 50, players: '25-35' },
  'Estándar': { name: 'Estándar', price: 7.50, ram: 8, storage: 75, players: '35-50' },
  'Plus': { name: 'Plus', price: 9.50, ram: 10, storage: 100, players: '50-70' }
};

const PAY_LINKS = {
  'Mini': 'https://buy.stripe.com/28E8wP2gS3Hf8Lb6Dw4wM00',
  'Básico': 'https://buy.stripe.com/8x2aEXbRs4Lj2mN8LE4wM01',
  'Estándar': 'https://buy.stripe.com/dRm14ncVw6TraTj2ng4wM02',
  'Plus': 'https://buy.stripe.com/5kQ28raNob9HaTjd1U4wM03'
};

let currentStep = 1;
let selectedPlan = PLAN_DATA.Mini;
let formData = { version: null, software: null, region: null, email: null };

// --- Función para verificar email en tu API de Pterodactyl ---
async function checkUserEmail(email) {
  try {
    const res = await fetch('https://api-registro.mc-blockhost.workers.dev/verificar_usuario', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });
    const data = await res.json();
    return data.existe; // true si el usuario existe en Pterodactyl
  } catch (err) {
    console.error('Error al verificar email:', err);
    return false;
  }
}

function getPlanFromURL() {
  const params = new URLSearchParams(window.location.search);
  const planParam = params.get('plan');
  return PLAN_DATA[planParam] || PLAN_DATA.Mini;
}

function calculateTotal() {
  const subtotal = selectedPlan.price;
  const tax = subtotal * 0.21;
  const total = subtotal + tax;
  return { subtotal, tax, total };
}

function formatCurrency(value) {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR'
  }).format(value);
}

function updateSummary() {
  document.getElementById('plan-title').textContent = `Plan ${selectedPlan.name}`;
  document.getElementById('spec-ram').textContent = `${selectedPlan.ram}GB`;
  document.getElementById('spec-storage').textContent = `${selectedPlan.storage} GB SSD`;
  document.getElementById('spec-players').textContent = selectedPlan.players;

  document.getElementById('summary-version').textContent = formData.version || '-';
  document.getElementById('summary-software').textContent = formData.software || '-';
  document.getElementById('summary-region').textContent = formData.region || '-';
  document.getElementById('summary-email').textContent = formData.email || '-';

  const { subtotal, tax, total } = calculateTotal();
  document.getElementById('price-subtotal').textContent = formatCurrency(subtotal);
  document.getElementById('price-tax').textContent = formatCurrency(tax);
  document.getElementById('price-total').textContent = formatCurrency(total);
}

function updateStepIndicator() {
  document.querySelectorAll('.step').forEach((step, index) => {
    const stepNum = index + 1;
    step.classList.toggle('active', stepNum === currentStep);
    step.classList.toggle('completed', stepNum < currentStep);
  });
}

function showSection(stepNum) {
  document.querySelectorAll('.form-section').forEach(s => s.classList.remove('active'));
  const section = document.querySelector(`[data-section="${stepNum}"]`);
  if (section) section.classList.add('active');

  const btnBack = document.getElementById('btn-back');
  const btnNext = document.getElementById('btn-next');
  const paymentSection = document.getElementById('payment-section');

  btnBack.style.display = stepNum > 1 ? 'block' : 'none';
  btnNext.style.display = stepNum < 4 ? 'block' : 'none';

  if (stepNum === 4) {
    paymentSection.style.display = 'block';
    paymentSection.innerHTML = `
      <div style="text-align:center; margin-top:1.5rem;">
        <button id="btn-pay" class="btn highlight" disabled>Pagar ahora</button>
        <p id="email-status" style="font-size:0.9rem; margin-top:0.5rem; display:none;"></p>
      </div>
    `;

    const payBtn = document.getElementById('btn-pay');
    const emailInput = document.getElementById('email');
    const statusMsg = document.getElementById('email-status');

    async function updatePayButtonState() {
      const email = emailInput.value.trim();
      if (!emailInput.checkValidity() || email === '') {
        payBtn.disabled = true;
        statusMsg.style.display = 'none';
        return;
      }

      statusMsg.textContent = 'Verificando usuario...';
      statusMsg.style.color = '#999';
      statusMsg.style.display = 'block';
      const exists = await checkUserEmail(email);
      if (exists) {
        payBtn.disabled = false;
        statusMsg.textContent = '✔ Usuario encontrado, puedes pagar.';
        statusMsg.style.color = '#4caf50';
      } else {
        payBtn.disabled = true;
        statusMsg.textContent = '✖ El correo no existe en nuestra base de usuarios.';
        statusMsg.style.color = '#ff4444';
      }
    }

    emailInput.addEventListener('input', () => {
      updatePayButtonState();
    });

    payBtn.addEventListener('click', () => {
      const url = PAY_LINKS[selectedPlan.name] || PAY_LINKS['Mini'];
      window.location.href = url;
    });

    updatePayButtonState(); // chequeo inicial
  } else {
    paymentSection.style.display = 'none';
  }
}

function populateSoftwareOptions(version) {
  const container = document.getElementById('software-options');
  container.innerHTML = '';
  const options = SOFTWARE_OPTIONS[version] || [];
  options.forEach(opt => {
    const label = document.createElement('label');
    label.className = 'option-card';
    label.innerHTML = `
      <input type="radio" name="software" value="${opt.value}" required>
      <div class="option-content">
        <span class="option-title">${opt.label}</span>
        <span class="option-desc">${opt.desc}</span>
      </div>`;
    container.appendChild(label);
  });

  document.querySelectorAll('input[name="software"]').forEach(radio => {
    radio.addEventListener('change', e => {
      formData.software = e.target.value;
      updateSummary();
    });
  });
}

function validateCurrentStep() {
  switch (currentStep) {
    case 1: return !!document.querySelector('input[name="version"]:checked');
    case 2: return !!document.querySelector('input[name="software"]:checked');
    case 3: return !!document.querySelector('input[name="region"]:checked');
    case 4:
      const emailInput = document.getElementById('email');
      return emailInput.value.trim() !== '' && emailInput.checkValidity();
    default: return false;
  }
}

function nextStep() {
  if (!validateCurrentStep()) {
    alert('Por favor completa todos los campos requeridos.');
    return;
  }

  if (currentStep < 4) {
    currentStep++;
    showSection(currentStep);
    updateStepIndicator();
  }
}

function previousStep() {
  if (currentStep > 1) {
    currentStep--;
    showSection(currentStep);
    updateStepIndicator();
  }
}

document.addEventListener('DOMContentLoaded', () => {
  selectedPlan = getPlanFromURL();
  updateSummary();
  showSection(currentStep);
  updateStepIndicator();

  document.querySelectorAll('input[name="version"]').forEach(r => {
    r.addEventListener('change', e => {
      formData.version = e.target.value;
     
