import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';
import { config } from './config.js';

const supabase = createClient(config.supabase.url, config.supabase.anonKey);

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
  'Mini': { name: 'Mini', price: 3.50, ram: 4, storage: 25, players: '15-25', stripePriceId: 'price_1SJLIKDQaOEVVvuYAmHk3s4s' },
  'Basico': { name: 'Básico', price: 5.50, ram: 6, storage: 50, players: '25-35', stripePriceId: 'price_1SJLJ0DQaOEVVvuYWgdpZ7Y7' },
  'Estandar': { name: 'Estándar', price: 7.50, ram: 8, storage: 75, players: '35-50', stripePriceId: 'price_1SJLJVDQaOEVVvuYJNoHVGPI' },
  'Plus': { name: 'Plus', price: 9.50, ram: 10, storage: 100, players: '50-70', stripePriceId: 'price_1SJLJsDQaOEVVvuYyh4r2T6S' }
};

const CURRENCIES = {
  USD: { rate: 1.08, locales: ['en-US','es-PA'], label: 'USD', symbol: '$' },
  PEN: { rate: 4.04, locales: ['es-PE'], label: 'PEN', symbol: 'S/' },
  MXN: { rate: 19.5, locales: ['es-MX'], label: 'MXN', symbol: '$' },
  COP: { rate: 4390, locales: ['es-CO'], label: 'COP', symbol: '$' },
  ARS: { rate: 980, locales: ['es-AR'], label: 'ARS', symbol: '$' },
  VES: { rate: 39, locales: ['es-VE'], label: 'VES', symbol: 'Bs' },
  BOB: { rate: 7.4, locales: ['es-BO'], label: 'BOB', symbol: 'Bs' },
  EUR: { rate: 1, locales: ['es-ES'], label: 'EUR', symbol: '€' },
};

let currentStep = 1;
let selectedPlan = PLAN_DATA.Mini;
let currentOrderId = null;
let selectedCurrency = 'EUR';
let formData = { version: null, software: null, region: null, email: null };

function guessCurrency() {
  const lang = navigator.language || 'es-ES';
  const match = Object.entries(CURRENCIES).find(([,v]) => v.locales.some(l => lang.startsWith(l)));
  return match ? match[0] : 'EUR';
}

function formatCurrency(valueEur, code) {
  const { rate } = CURRENCIES[code] || CURRENCIES.EUR;
  const converted = valueEur * rate;
  return new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency: code,
    maximumFractionDigits: code === 'COP' || code === 'ARS' || code === 'VES' ? 0 : 2
  }).format(converted);
}

function getPlanFromURL() {
  const params = new URLSearchParams(window.location.search);
  const planParam = params.get('plan');
  return planParam && PLAN_DATA[planParam] ? PLAN_DATA[planParam] : PLAN_DATA.Mini;
}

function calculateTotal() {
  const subtotal = selectedPlan.price;
  const tax = subtotal * 0.21;
  const total = subtotal + tax;
  return { subtotal, tax, total };
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

  document.getElementById('price-subtotal').textContent = formatCurrency(subtotal, selectedCurrency);
  document.getElementById('price-tax').textContent = formatCurrency(tax, selectedCurrency);
  document.getElementById('price-total').textContent = formatCurrency(total, selectedCurrency);
}

function updateStepIndicator() {
  document.querySelectorAll('.step').forEach((step, index) => {
    const stepNum = index + 1;
    if (stepNum < currentStep) step.classList.add('completed'), step.classList.remove('active');
    else if (stepNum === currentStep) step.classList.add('active'), step.classList.remove('completed');
    else step.classList.remove('active', 'completed');
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
  paymentSection.style.display = stepNum === 4 ? 'block' : 'none';
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

async function nextStep() {
  if (!validateCurrentStep()) { alert('Por favor completa todos los campos requeridos.'); return; }

  if (currentStep === 4) {
    const emailInput = document.getElementById('email');
    formData.email = emailInput.value.trim();
    const order = await createPendingOrder();
    if (order) await redirectToStripeCheckout(order.id);
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

async function createPendingOrder() {
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
    const { data, error } = await supabase.from('orders').insert([orderData]).select().maybeSingle();
    if (error) { console.error(error); alert('Error al crear el pedido'); return null; }
    currentOrderId = data.id;
    return data;
  } catch (err) {
    console.error(err); alert('Error inesperado'); return null;
  }
}

async function redirectToStripeCheckout(orderId) {
  try {
    const paymentSection = document.getElementById('payment-section');
    paymentSection.innerHTML = '<p style="text-align:center;color:var(--muted)">Redirigiendo a la pasarela de pago...</p>';
    const stripe = window.Stripe(config.stripe.publishableKey);
    const response = await fetch(`${config.supabase.url}/functions/v1/stripe-checkout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${config.supabase.anonKey}` },
      body: JSON.stringify({
        price_id: selectedPlan.stripePriceId,
        mode: 'payment',
        success_url: `${window.location.origin}/success.html?order_id=${orderId}`,
        cancel_url: `${window.location.origin}/checkout.html?plan=${selectedPlan.name}`,
        metadata: { order_id: orderId }
      }),
    });
    if (!response.ok) { const e = await response.json(); throw new Error(e.error || 'Error al iniciar el pago'); }
    const { sessionId } = await response.json();
    const { error } = await stripe.redirectToCheckout({ sessionId });
    if (error) { console.error(error); alert('Error al redirigir al pago'); }
  } catch (error) {
    console.error(error); alert('Error al procesar el pago: ' + error.message);
    const paymentSection = document.getElementById('payment-section');
    paymentSection.innerHTML = `<p style="color:#ff4444;text-align:center;">Error: ${error.message}</p>
    <button class="btn primary" onclick="location.reload()">Intentar de nuevo</button>`;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  selectedPlan = getPlanFromURL();
  selectedCurrency = guessCurrency();
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
    radio.addEventListener('change', e => { formData.region = e.target.value; updateSummary(); });
  });

  // === VALIDACIÓN DEL EMAIL ===
  const emailInput = document.getElementById('email');
  if (emailInput) {
    const emailWarning = document.createElement('p');
    emailWarning.textContent = 'Ingresa un correo válido para continuar.';
    emailWarning.style.color = '#ff6666';
    emailWarning.style.fontSize = '0.9rem';
    emailWarning.style.marginTop = '0.5rem';
    emailWarning.style.display = 'none';
    emailInput.insertAdjacentElement('afterend', emailWarning);

    emailInput.addEventListener('input', () => {
      formData.email = emailInput.value.trim();
      updateSummary();
      const valid = emailInput.checkValidity() && emailInput.value.trim() !== '';
      emailWarning.style.display = valid ? 'none' : 'block';
    });
  }

  const btnNext = document.getElementById('btn-next');
  const btnBack = document.getElementById('btn-back');

  if (btnNext) btnNext.addEventListener('click', nextStep);
  if (btnBack) btnBack.addEventListener('click', previousStep);

  const stripeScript = document.createElement('script');
  stripeScript.src = 'https://js.stripe.com/v3/';
  stripeScript.async = true;
  document.head.appendChild(stripeScript);
});
