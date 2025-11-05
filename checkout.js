// checkout.js — versión final con detección de plan correcta
const sections = document.querySelectorAll(".form-section");
const steps = document.querySelectorAll(".step");
const btnNext = document.getElementById("btn-next");
const btnBack = document.getElementById("btn-back");

const summaryVersion = document.getElementById("summary-version");
const summarySoftware = document.getElementById("summary-software");
const summaryRegion = document.getElementById("summary-region");
const summaryEmail = document.getElementById("summary-email");

let currentStep = 1;

// Enlaces Stripe según plan
const stripeLinks = {
  Mini: "https://buy.stripe.com/14A5kD1cO0v38Lb2ng4wM04",
  Basico: "https://buy.stripe.com/9B6dR95t491z9Pf5zs4wM05",
  Estandar: "https://buy.stripe.com/28E00j8Fggu1bXn0f84wM06",
  Plus: "https://buy.stripe.com/00w6oHg7IelT3qR7HA4wM07",
};

// --- Funciones base ---
function normalizePlanName(raw) {
  if (!raw) return "Mini";
  raw = raw.replace(/^Plan\s*/i, "").trim();
  raw = raw.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  return raw.charAt(0).toUpperCase() + raw.slice(1).toLowerCase();
}

function getPlanFromURL() {
  const params = new URLSearchParams(window.location.search);
  const plan = params.get("plan");
  if (!plan) return "Mini";
  const fixed = plan.charAt(0).toUpperCase() + plan.slice(1).toLowerCase();
  return ["Mini", "Basico", "Estandar", "Plus"].includes(fixed)
    ? fixed
    : "Mini";
}

let selectedPlan = getPlanFromURL();

function updatePlanDisplay() {
  const planTitle = document.getElementById("plan-title");
  const specRam = document.getElementById("spec-ram");
  const specStorage = document.getElementById("spec-storage");
  const specPlayers = document.getElementById("spec-players");

  const plans = {
    Mini: { ram: 4, storage: 25, players: "15-25" },
    Basico: { ram: 6, storage: 50, players: "25-35" },
    Estandar: { ram: 8, storage: 75, players: "35-50" },
    Plus: { ram: 10, storage: 100, players: "50-70" },
  };

  const planData = plans[selectedPlan] || plans.Mini;
  planTitle.textContent = `Plan ${selectedPlan}`;
  specRam.textContent = `${planData.ram}GB`;
  specStorage.textContent = `${planData.storage} GB SSD`;
  specPlayers.textContent = planData.players;
}

function goToStep(step) {
  if (step < 1 || step > sections.length) return;
  sections.forEach((s) => s.classList.remove("active"));
  steps.forEach((st) => st.classList.remove("active"));
  sections[step - 1].classList.add("active");
  steps[step - 1].classList.add("active");

  currentStep = step;
  btnBack.style.display = step > 1 ? "inline-block" : "none";
  btnNext.textContent = step === sections.length ? "Pagar ahora" : "Siguiente →";
}

function validateStep() {
  const activeSection = sections[currentStep - 1];
  const requiredInputs = activeSection.querySelectorAll("input[required]");
  for (const input of requiredInputs) {
    if (
      (input.type === "radio" &&
        !activeSection.querySelector(`input[name="${input.name}"]:checked`)) ||
      (input.type !== "radio" && !input.value.trim())
    ) {
      input.classList.add("error");
      input.focus();
      return false;
    }
  }
  return true;
}

function updateSummary() {
  const version = document.querySelector('input[name="version"]:checked');
  const software = document.querySelector('input[name="software"]:checked');
  const region = document.querySelector('input[name="region"]:checked');
  const email = document.getElementById("email");

  summaryVersion.textContent = version ? version.value : "-";
  summarySoftware.textContent = software ? software.value : "-";
  summaryRegion.textContent = region ? region.value : "-";
  summaryEmail.textContent = email && email.value.trim() ? email.value.trim() : "-";
}

function redirectToStripe() {
  const link = stripeLinks[selectedPlan] || stripeLinks.Mini;
  window.location.href = link;
}

// --- Botones de navegación ---
btnNext.addEventListener("click", () => {
  if (!validateStep()) return;
  updateSummary();
  if (currentStep < sections.length) {
    goToStep(currentStep + 1);
  } else {
    redirectToStripe();
  }
});

btnBack.addEventListener("click", () => {
  if (currentStep > 1) goToStep(currentStep - 1);
});

// --- Software dinámico según versión ---
const softwareContainer = document.getElementById("software-options");
const versionRadios = document.querySelectorAll('input[name="version"]');

const softwareByVersion = {
  Java: [
    { value: "Vanilla", label: "Vanilla", desc: "Minecraft puro" },
    { value: "Paper", label: "Paper", desc: "Optimizado para rendimiento" },
    { value: "Spigot", label: "Spigot", desc: "Compatible con plugins" },
    { value: "Fabric", label: "Fabric", desc: "Modding ligero" },
    { value: "Forge", label: "Forge", desc: "Mods complejos" },
  ],
  Bedrock: [
    { value: "Vanilla", label: "Vanilla", desc: "Bedrock oficial" },
    { value: "PocketMine", label: "PocketMine-MP", desc: "Servidor en PHP" },
    { value: "Nukkit", label: "Nukkit", desc: "Servidor Java para Bedrock" },
  ],
};

function populateSoftware(version) {
  softwareContainer.innerHTML = "";
  const list = softwareByVersion[version] || [];
  list.forEach((sw) => {
    const label = document.createElement("label");
    label.className = "option-card";
    label.innerHTML = `
      <input type="radio" name="software" value="${sw.value}" required>
      <div class="option-content">
        <span class="option-title">${sw.label}</span>
        <span class="option-desc">${sw.desc}</span>
      </div>
    `;
    softwareContainer.appendChild(label);
  });
  softwareContainer
    .querySelectorAll('input[name="software"]')
    .forEach((r) => r.addEventListener("change", updateSummary));
}

// --- Listeners ---
versionRadios.forEach((r) =>
  r.addEventListener("change", (e) => {
    populateSoftware(e.target.value);
    updateSummary();
  })
);
document
  .querySelectorAll('input[name="region"]')
  .forEach((r) => r.addEventListener("change", updateSummary));

const emailInput = document.getElementById("email");
if (emailInput) emailInput.addEventListener("input", updateSummary);

// --- Inicialización ---
updatePlanDisplay();
goToStep(1);
updateSummary();
