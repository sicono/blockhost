import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

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
  'Mini': {
    name: 'Mini',
    price: 3.50,
    ram: 4,
    storage: 25,
    players: '15-25'
  },
  'Basico': {
    name: 'Básico',
    price: 5.50,
    ram: 6,
    storage: 50,
    players: '25-35'
  },
  'Estandar': {
    name: 'Estándar',
    price: 7.50,
    ram: 8,
    storage: 75,
    players: '35-50'
  },
  'Plus': {
    name: 'Plus',
    price: 9.50,
    ram: 10,
    storage: 100,
    players: '50-70'
  }
};

let currentStep = 1;
let selectedPlan = PLAN_DATA.Mini;
let formData = {
  version: null,
  software: null,
  region: null,
  email: null
};

function getPlanFromURL() {
  const params = new URLSearchParams(window.location.search);
  const planParam = params.get('plan');
  if (planParam && PLAN_DATA[planParam]) {
    return PLAN_DATA[planParam];
  }
  return PLAN_DATA.Mini;
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

  const subtotal = selectedPlan.price;
  const tax = subtotal * 0.21;
  const total = subtotal + tax;

  document.getElementById('price-subtotal').textContent = `${subtotal.toFixed(2)} €`;
  document.getElementById('price-tax').textContent = `${tax.toFixed(2)} €`;
  document.getElementById('price-total').textContent = `${total.toFixed(2)} €`;
}

function updateStepIndicator() {
  document.querySelectorAll('.step').forEach((step, index) => {
    const stepNum = index + 1;
    if (stepNum < currentStep) {
      step.classList.add('completed');
      step.classList.remove('active');
    } else if (stepNum === currentStep) {
      step.classList.add('active');
      step.classList.remove('completed');
    } else {
      step.classList.remove('active', 'completed');
    }
  });
}

function showSection(stepNum) {
  document.querySelectorAll('.form-section').forEach(section => {
    section.classList.remove('active');
  });
  const targetSection = document.querySelector(`[data-section="${stepNum}"]`);
  if (targetSection) {
    targetSection.classList.add('active');
  }

  const btnBack = document.getElementById('btn-back');
  const btnNext = document.getElementById('btn-next');
  const btnSubmit = document.getElementById('btn-submit');

  btnBack.style.display = stepNum > 1 ? 'block' : 'none';
  btnNext.style.display = stepNum < 4 ? 'block' : 'none';
  btnSubmit.style.display = stepNum === 4 ? 'block' : 'none';
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
      </div>
    `;
    container.appendChild(label);
  });

  document.querySelectorAll('input[name="software"]').forEach(radio => {
    radio.addEventListener('change', (e) => {
      formData.software = e.target.value;
      updateSummary();
    });
  });
}

function validateCurrentStep() {
  switch (currentStep) {
    case 1:
      return formData.version !== null;
    case 2:
      return formData.software !== null;
    case 3:
      return formData.region !== null;
    case 4:
      const emailInput = document.getElementById('email');
      return emailInput.value.trim() !== '' && emailInput.checkValidity();
    default:
      return false;
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

async function submitOrder(e) {
  e.preventDefault();

  const emailInput = document.getElementById('email');
  formData.email = emailInput.value.trim();

  if (!validateCurrentStep()) {
    alert('Por favor completa todos los campos requeridos.');
    return;
  }

  const btnSubmit = document.getElementById('btn-submit');
  btnSubmit.disabled = true;
  btnSubmit.textContent = 'Procesando...';

  try {
    const orderData = {
      email: formData.email,
      plan_name: selectedPlan.name,
      price_eur: selectedPlan.price,
      ram_gb: selectedPlan.ram,
      storage_gb: selectedPlan.storage,
      max_players: selectedPlan.players,
      version: formData.version,
      software: formData.software,
      region: formData.region,
      status: 'pending',
      payment_status: 'pending'
    };

    const { data, error } = await supabase
      .from('orders')
      .insert([orderData])
      .select()
      .maybeSingle();

    if (error) {
      console.error('Error creating order:', error);
      alert('Hubo un error al procesar tu pedido. Por favor intenta de nuevo.');
      btnSubmit.disabled = false;
      btnSubmit.textContent = 'Procesar Pago';
      return;
    }

    alert('¡Pedido creado exitosamente! Te contactaremos pronto para finalizar el pago.');
    window.location.href = '/';
  } catch (err) {
    console.error('Unexpected error:', err);
    alert('Hubo un error inesperado. Por favor intenta de nuevo.');
    btnSubmit.disabled = false;
    btnSubmit.textContent = 'Procesar Pago';
  }
}

document.addEventListener('DOMContentLoaded', () => {
  selectedPlan = getPlanFromURL();
  updateSummary();
  showSection(currentStep);
  updateStepIndicator();

  document.querySelectorAll('input[name="version"]').forEach(radio => {
    radio.addEventListener('change', (e) => {
      formData.version = e.target.value;
      formData.software = null;
      populateSoftwareOptions(formData.version);
      updateSummary();
    });
  });

  document.querySelectorAll('input[name="region"]').forEach(radio => {
    radio.addEventListener('change', (e) => {
      formData.region = e.target.value;
      updateSummary();
    });
  });

  document.getElementById('email').addEventListener('input', (e) => {
    formData.email = e.target.value.trim();
    updateSummary();
  });

  document.getElementById('btn-next').addEventListener('click', nextStep);
  document.getElementById('btn-back').addEventListener('click', previousStep);
  document.getElementById('checkout-form').addEventListener('submit', submitOrder);
});
