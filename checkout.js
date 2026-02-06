// checkout.js — versión final (email + ip + servername + backups mensual)
const sections = document.querySelectorAll(".form-section");
const steps = document.querySelectorAll(".step");
const btnNext = document.getElementById("btn-next");
const btnBack = document.getElementById("btn-back");

const summaryVersion = document.getElementById("summary-version");
const summarySoftware = document.getElementById("summary-software");
const summaryRegion = document.getElementById("summary-region");
const summaryEmail = document.getElementById("summary-email");
const summaryDomain = document.getElementById("summary-domain");
const summaryIp = document.getElementById("summary-ip");

// NUEVO (para resumen)
const summaryBilling = document.getElementById("summary-billing");
const summaryBackups = document.getElementById("summary-backups");

const priceSubtotalEl = document.getElementById("price-subtotal");
const priceTaxEl = document.getElementById("price-tax");
const priceTotalEl = document.getElementById("price-total");
const totalLabelEl = document.getElementById("total-label");

let currentStep = 1;

// Enlaces de Stripe (solo para Addons/Setups)
const stripeLinks = {
  Addons: "https://buy.stripe.com/bJe8wP2gSelT2mN3rk4wM0b",
  Setups: "https://buy.stripe.com/6oU6oH5t40v30eF7HA4wM0d",
};

// Precios base (EUR / mes) para pintar el resumen
const planPrices = {
  Mini: 3.5,
  Basico: 5.5,
  Estandar: 7.5,
  Plus: 9.5,
  Pro: 14.5,
};

// ✅ CAMBIA ESTE PRECIO al real de backups mensual
const BACKUPS_MONTHLY_PRICE = 1.0;

const TAX_RATE = 0.21;

// -------------------------
// Helpers validación
// -------------------------
function isValidEmailClient(email) {
  if (typeof email !== "string") return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

// IPv4 simple + IPv6 razonable (práctico)
function isValidIP(ip) {
  if (typeof ip !== "string") return false;
  const v = ip.trim();

  const ipv4 =
    /^(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}$/;

  const ipv6 =
    /^(([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}|(([0-9a-fA-F]{1,4}:){1,7}:)|(:{2}([0-9a-fA-F]{1,4}:){0,6}[0-9a-fA-F]{1,4})|(([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4})|(([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2})|(([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3})|(([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4})|(([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5})|([0-9a-fA-F]{1,4}:)((:[0-9a-fA-F]{1,4}){1,6}))$/;

  return ipv4.test(v) || ipv6.test(v);
}

// Obtener el plan desde la URL
function getPlanFromURL() {
  const params = new URLSearchParams(window.location.search);
  const plan = params.get("plan");
  if (!plan) return "Mini";
  const fixed = plan.charAt(0).toUpperCase() + plan.slice(1).toLowerCase();
  const valid = ["Mini", "Basico", "Estandar", "Plus", "Pro", "Addons", "Setups"];
  return valid.includes(fixed) ? fixed : "Mini";
}

let selectedPlan = getPlanFromURL();

// Si el plan es Addons o Setups, redirigir directamente
if (selectedPlan === "Addons" || selectedPlan === "Setups") {
  window.location.href = stripeLinks[selectedPlan];
} else {
  // --- Flujo normal ---
  const planTitleEl = document.getElementById("plan-title");
  const specRam = document.getElementById("spec-ram");
  const specStorage = document.getElementById("spec-storage");
  const specPlayers = document.getElementById("spec-players");

  const planDataMap = {
    Mini: { ram: 4, storage: 25, players: "15-25" },
    Basico: { ram: 6, storage: 50, players: "25-35" },
    Estandar: { ram: 8, storage: 75, players: "35-50" },
    Plus: { ram: 10, storage: 100, players: "50-70" },
    Pro: { ram: 15, storage: 150, players: "70-100" },
  };

  function updatePlanDisplay() {
    const d = planDataMap[selectedPlan] || planDataMap.Mini;
    planTitleEl.textContent = `Plan ${selectedPlan}`;
    specRam.textContent = `${d.ram} GB`;
    specStorage.textContent = `${d.storage} GB SSD`;
    specPlayers.textContent = d.players;
  }

  function goToStep(step) {
    if (step < 1 || step > sections.length) return;
    sections.forEach((s) => s.classList.remove("active"));
    steps.forEach((st) => st.classList.remove("active"));
    sections[step - 1].classList.add("active");
    steps[step - 1].classList.add("active"));
    currentStep = step;
    btnBack.style.display = step > 1 ? "inline-block" : "none";
    btnNext.textContent = step === sections.length ? "Pagar ahora" : "Siguiente →";
  }

  function validateStep() {
    const activeSection = sections[currentStep - 1];

    // Radios requeridos
    const requiredRadios = activeSection.querySelectorAll('input[type="radio"][required]');
    for (const r of requiredRadios) {
      const checked = activeSection.querySelector(`input[name="${r.name}"]:checked`);
      if (!checked) {
        r.classList.add("error");
        r.focus();
        return false;
      }
    }

    // Inputs/select/textarea requeridos
    const requiredInputs = activeSection.querySelectorAll(
      'input[required]:not([type="radio"]), select[required], textarea[required]'
    );

    for (const input of requiredInputs) {
      input.classList.remove("error");

      if (!input.value || !input.value.trim()) {
        input.classList.add("error");
        input.focus();
        return false;
      }
      if (typeof input.checkValidity === "function" && !input.checkValidity()) {
        input.classList.add("error");
        input.focus();
        return false;
      }
    }

    // Validación extra específica (solo en step 4)
    if (currentStep === 4) {
      const email = document.getElementById("email")?.value?.trim();
      const ip = document.getElementById("ip")?.value?.trim();

      if (!isValidEmailClient(email)) {
        alert("Correo inválido. Revisa el formato.");
        document.getElementById("email")?.focus();
        return false;
      }
      if (!isValidIP(ip)) {
        alert("IP inválida. Introduce una IPv4 o IPv6 válida.");
        document.getElementById("ip")?.focus();
        return false;
      }
    }

    return true;
  }

  function formatEUR(n) {
    return n.toFixed(2).replace(".", ",") + " €";
  }

  function billingLabel(billing) {
    if (billing === "3m") return "Cada 3 meses";
    if (billing === "6m") return "Cada 6 meses";
    if (billing === "year") return "Anual";
    return "Mensual";
  }

  function billingMultiplier(billing) {
    if (billing === "3m") return 3;
    if (billing === "6m") return 6;
    if (billing === "year") return 12;
    return 1;
  }

  function syncBackupsAvailability() {
    const billing = document.getElementById("billing")?.value || "monthly";
    const backupsCheck = document.getElementById("addon-backups");
    if (!backupsCheck) return;

    const allowed = billing === "monthly";
    backupsCheck.disabled = !allowed;
    if (!allowed) backupsCheck.checked = false;
  }

  function updateSummary() {
    const version = document.querySelector('input[name="version"]:checked');
    const software = document.querySelector('input[name="software"]:checked');
    const region = document.querySelector('input[name="region"]:checked');
    const emailEl = document.getElementById("email");
    const servernameEl = document.getElementById("servername");
    const ipEl = document.getElementById("ip");

    const billing = document.getElementById("billing")?.value || "monthly";
    const backups = document.getElementById("addon-backups")?.checked;

    summaryVersion.textContent = version ? version.value : "-";
    summarySoftware.textContent = software ? software.value : "-";
    summaryRegion.textContent = region ? region.value : "-";
    summaryEmail.textContent = emailEl && emailEl.value.trim() ? emailEl.value.trim() : "-";

    if (summaryDomain) {
      const s = servernameEl && servernameEl.value.trim() ? servernameEl.value.trim() : "-";
      summaryDomain.textContent = s === "-" ? "-" : `${s}.blockhost.es`;
    }

    if (summaryIp) summaryIp.textContent = ipEl && ipEl.value.trim() ? ipEl.value.trim() : "-";

    // Solo si existen en el HTML
    if (summaryBilling) summaryBilling.textContent = billingLabel(billing);
    if (summaryBackups) summaryBackups.textContent = backups ? "Sí (mensual)" : "No";

    // Totales del resumen
    const baseMonthly = planPrices[selectedPlan] ?? planPrices.Mini;
    const mult = billingMultiplier(billing);

    let subtotal = baseMonthly * mult;

    // Backups solo mensual
    if (backups && billing === "monthly") subtotal += BACKUPS_MONTHLY_PRICE;

    const tax = subtotal * TAX_RATE;
    const total = subtotal + tax;

    if (priceSubtotalEl) priceSubtotalEl.textContent = formatEUR(subtotal);
    if (priceTaxEl) priceTaxEl.textContent = formatEUR(tax);
    if (priceTotalEl) priceTotalEl.textContent = formatEUR(total);

    if (totalLabelEl) {
      totalLabelEl.textContent = `Total ${billingLabel(billing).toLowerCase()}:`;
    }
  }

  async function redirectToStripe() {
    const version = document.querySelector('input[name="version"]:checked')?.value;
    const software = document.querySelector('input[name="software"]:checked')?.value;
    const region = document.querySelector('input[name="region"]:checked')?.value;

    const email = document.getElementById("email")?.value?.trim();
    const servername = document.getElementById("servername")?.value?.trim();
    const ip = document.getElementById("ip")?.value?.trim();

    const billing = document.getElementById("billing")?.value || "monthly";
    const backups = document.getElementById("addon-backups")?.checked ? "1" : "0";

    if (backups === "1" && billing !== "monthly") {
      alert("Los backups solo están disponibles en facturación mensual.");
      return;
    }

    if (!isValidEmailClient(email)) {
      alert("Correo inválido. Revisa el formato.");
      return;
    }
    if (!isValidIP(ip)) {
      alert("IP inválida. Introduce una IPv4 o IPv6 válida.");
      return;
    }

    const res = await fetch(
      "https://pagosblockhost.miguelangelruizbarroso915.workers.dev/create-checkout-session",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          plan: selectedPlan,
          version,
          software,
          region,
          email,
          servername, // ✅ NUEVO
          ip,         // ✅ NUEVO
          billing,
          backups,
        }),
      }
    );

    const data = await res.json();
    if (!res.ok) {
      alert("Error iniciando el pago: " + (data?.error || "desconocido"));
      return;
    }
    if (!data?.url) {
      alert("Stripe no devolvió una URL de pago.");
      return;
    }

    window.location.href = data.url;
  }

  btnNext.addEventListener("click", async () => {
    if (!validateStep()) return;

    syncBackupsAvailability();
    updateSummary();

    if (currentStep < sections.length) {
      goToStep(currentStep + 1);
    } else {
      await redirectToStripe();
    }
  });

  btnBack.addEventListener("click", () => {
    if (currentStep > 1) goToStep(currentStep - 1);
  });

  // Software dinámico
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
        </div>`;
      softwareContainer.appendChild(label);
    });

    softwareContainer
      .querySelectorAll('input[name="software"]')
      .forEach((r) => r.addEventListener("change", updateSummary));
  }

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

  const servernameInput = document.getElementById("servername");
  if (servernameInput) servernameInput.addEventListener("input", updateSummary);

  const ipInput = document.getElementById("ip");
  if (ipInput) ipInput.addEventListener("input", updateSummary);

  const billingSelect = document.getElementById("billing");
  if (billingSelect)
    billingSelect.addEventListener("change", () => {
      syncBackupsAvailability();
      updateSummary();
    });

  const backupsCheck = document.getElementById("addon-backups");
  if (backupsCheck) backupsCheck.addEventListener("change", updateSummary);

  updatePlanDisplay();
  goToStep(1);
  syncBackupsAvailability();
  updateSummary();
}
