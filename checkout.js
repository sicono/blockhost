import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';
import { config } from './config.js';

const supabase = createClient(config.supabase.url, config.supabase.anonKey);

// --- CONFIGURACIÓN ---
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
  Mini: { name: 'Mini', price: 3.5, ram: 4, storage: 25, players: '15-25' },
  Basico: { name: 'Básico', price: 5.5, ram: 6, storage: 50, players: '25-35' },
  Estandar: { name: 'Estándar', price: 7.5, ram: 8, storage: 75, players: '35-50' },
  Plus: { name: 'Plus', price: 9.5, ram: 10, storage: 100, players: '50-70' }
};

// --- VARIABLES ---
let currentStep = 1;
let selectedPlan = PLAN_DATA.Mini;
let selectedCurrency = 'EUR';
let currentOrderId = null;

let formData = {
  version: null,
  software: null,
  region: null,
  email: null
};

// --- FUNCIONES AUXILIARES ---
function getPlanFromURL() {
  const params = new URLSearchParams(window.location.search);
  const planParam = params.get('plan');
  return PLAN_DATA[planParam] || PLAN_DATA.Mini;
}

function calculateTotal() {
  const subtotal = selectedPlan.price;
  const tax = subtotal * 0.21;
  return { subtotal, tax, total: subtotal + tax };
}

function formatCurrency(value) {
  return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(value);
}

function updateSummary() {
  document.getElementById('plan-title').textContent = `Plan ${selectedPlan.name}`;
  document.getElementById('spec-ram').textContent = `${selectedPlan.ram} GB`;
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

function showSection(step) {
  document.querySelectorAll('.form-section').forEach(s => s.classList.remove('active'));
  document.querySelector(`[data-section="${step}"]`)?.classList.add('active');

  document.getElementById('btn-back').style.display = step > 1 ? 'block' : 'none';
  document.getElementById('btn-next').style.display = step < 4 ? 'block' : 'none';
  document.getElementById('payment-section').style.display = step === 4 ? 'block' : 'none';
}

function updateStepIndicator() {
  document.querySelectorAll('.step').forEach((stepEl, idx) => {
    const num = idx + 1;
    stepEl.classList.toggle('active', num === currentStep);
    stepEl.classList.toggle('completed', num < currentStep);
  });
}

function populateSoftwareOptions(version) {
  const container = document.getElementById('software-options');
  container.innerHTML = '';
  (SOFTWARE_OPTIONS[version] || []).forEach(opt => {
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
  container.querySelectorAll('input[name="software"]').forEach(radio => {
    radio.addEventListener('change', e => {
      formData.software = e.target.value;
      updateSummary();
    });
  });
}

function validateStep() {
  switch (currentStep) {
    case 1: return !!document.querySelector('input[name="version"]:checked');
    case 2: return !!document.querySelector('input[name="software"]:checked');
    case 3: return !!document.querySelector('input[name="region"]:checked');
    case 4:
      const email = document.getElementById('email').value.trim();
      return email !== '' && /\S+@\S+\.\S+/.test(email);
    default: return false;
  }
}

// --- FLUJO DE PASOS ---
async function nextStep() {
  if (!validateStep()) {
    alert('Por favor completa los campos requeridos.');
    return;
  }

  if (currentStep === 4) {
    formData.email = document.getElementById('email').value.trim();
    updateSummary();
    await createOrder();
    alert('Pedido registrado correctamente. Redirigiendo a PayPal...');
    // Aquí podrías redirigir a tu pasarela de pago.
    return;
  }

  currentStep++;
  showSection(currentStep);
  updateStepIndicator();
}

function prevStep() {
  if (currentStep > 1) {
    currentStep--;
    showSection(currentStep);
    updateStepIndicator();
  }
}

// --- CREAR PEDIDO EN SUPABASE ---
async function createOrder() {
  const { total } = calculateTotal();
  const { data, error } = await supabase.from('orders').insert([{
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
    payment_status: 'pending',
    total_eur: total
  }]).select().maybeSingle();

  if (error) console.error('Error al crear el pedido:', error);
  else console.log('Pedido creado:', data);
}

// --- INICIALIZACIÓN ---
document.addEventListener('DOMContentLoaded', () => {
  selectedPlan = getPlanFromURL();
  updateSummary();
  showSection(currentStep);
  updateStepIndicator();

  document.querySelectorAll('input[name="version"]').forEach(radio => {
    radio.addEventListener('change', e => {
      formData.version = e.target.value;
      formData.software = null;
      populateSoftwareOptions(formData.version);
      updateSummary();
    });
  });

  document.querySelectorAll('input[name="region"]').forEach(radio => {
    radio.addEventListener('change', e => {
      formData.region = e.target.value;
      updateSummary();
    });
  });

  document.getElementById('email').addEventListener('input', e => {
    formData.email = e.target.value.trim();
    updateSummary();
  });

  document.getElementById('btn-next').addEventListener('click', nextStep);
  document.getElementById('btn-back').addEventListener('click', prevStep);
});
