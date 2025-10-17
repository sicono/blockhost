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
let formData = {
  version: null,
  software: null,
  region: null,
  email: null
};

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
  if (planParam && PLAN_DATA[planParam]) {
    return PLAN_DATA[planParam];
  }
  return PLAN_DATA.Mini;
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
      const versionRadio = document.querySelector('input[name="version"]:checked');
      return versionRadio !== null;
    case 2:
      const softwareRadio = document.querySelector('input[name="software"]:checked');
      return softwareRadio !== null;
    case 3:
      const regionRadio = document.querySelector('input[name="region"]:checked');
      return regionRadio !== null;
    case 4:
      const emailInput = document.getElementById('email');
      return emailInput.value.trim() !== '' && emailInput.checkValidity();
    default:
      return false;
  }
}

async function nextStep() {
  if (!validateCurrentStep()) {
    alert('Por favor completa todos los campos requeridos.');
    return;
  }

  if (currentStep === 4) {
    const emailInput = document.getElementById('email');
    formData.email = emailInput.value.trim();
    const order = await createPendingOrder();
    if (order) {
      initPayPal();
    }
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
    const { total } = calculateTotal();
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
      alert('Hubo un error al crear el pedido. Por favor intenta de nuevo.');
      return null;
    }

    currentOrderId = data.id;
    return data;
  } catch (err) {
    console.error('Unexpected error:', err);
    alert('Hubo un error inesperado. Por favor intenta de nuevo.');
    return null;
  }
}

async function updateOrderPaymentStatus(orderId, status, paymentDetails = {}) {
  try {
    const { error } = await supabase
      .from('orders')
      .update({
        payment_status: status,
        status: status === 'completed' ? 'processing' : 'pending',
        updated_at: new Date().toISOString()
      })
      .eq('id', orderId);

    if (error) {
      console.error('Error updating order:', error);
    }
  } catch (err) {
    console.error('Unexpected error updating order:', err);
  }
}

function initPayPal() {
  const container = document.getElementById('paypal-button-container');
  container.innerHTML = '';

  const { total } = calculateTotal();

  paypal.Buttons({
    style: {
      layout: 'vertical',
      color: 'blue',
      shape: 'rect',
      label: 'paypal'
    },
    createOrder: function(data, actions) {
      return actions.order.create({
        purchase_units: [{
          description: `BlockHost - Plan ${selectedPlan.name}`,
          amount: {
            currency_code: 'EUR',
            value: total.toFixed(2),
            breakdown: {
              item_total: {
                currency_code: 'EUR',
                value: selectedPlan.price.toFixed(2)
              },
              tax_total: {
                currency_code: 'EUR',
                value: (total - selectedPlan.price).toFixed(2)
              }
            }
          }
        }],
        application_context: {
          brand_name: 'BlockHost',
          locale: 'es-ES',
          shipping_preference: 'NO_SHIPPING'
        }
      });
    },
    onApprove: async function(data, actions) {
      const order = await actions.order.capture();

      if (currentOrderId) {
        await updateOrderPaymentStatus(currentOrderId, 'completed', {
          paypal_order_id: order.id,
          payer_email: order.payer.email_address
        });
      }

      alert('¡Pago completado exitosamente! Recibirás un correo con los detalles de tu servidor.');
      window.location.href = '/';
    },
    onError: function(err) {
      console.error('PayPal error:', err);
      alert('Hubo un error al procesar el pago. Por favor intenta de nuevo.');

      if (currentOrderId) {
        updateOrderPaymentStatus(currentOrderId, 'failed');
      }
    },
    onCancel: function(data) {
      alert('Pago cancelado. Puedes intentar de nuevo cuando estés listo.');

      if (currentOrderId) {
        updateOrderPaymentStatus(currentOrderId, 'cancelled');
      }
    }
  }).render('#paypal-button-container');
}

document.addEventListener('DOMContentLoaded', () => {
  selectedPlan = getPlanFromURL();
  selectedCurrency = guessCurrency();
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
});
