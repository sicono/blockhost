// checkout.js — BlockHost
// Controla los pasos, actualiza el resumen y muestra el botón de pago de Stripe

// Referencias a elementos del DOM
const sections = document.querySelectorAll(".form-section");
const steps = document.querySelectorAll(".step");
const btnNext = document.getElementById("btn-next");
const btnBack = document.getElementById("btn-back");
const paymentSection = document.getElementById("payment-section");
const stripeButton = document.getElementById("stripe-button");

const summaryVersion = document.getElementById("summary-version");
const summarySoftware = document.getElementById("summary-software");
const summaryRegion = document.getElementById("summary-region");
const summaryEmail = document.getElementById("summary-email");

let currentStep = 1;

// 🔗 Enlaces de Stripe por plan
const stripeLinks = {
  Mini: "https://buy.stripe.com/14A5kD1cO0v38Lb2ng4wM04",
  Basico: "https://buy.stripe.com/9B6dR95t491z9Pf5zs4wM05",
  Estandar: "https://buy.stripe.com/28E00j8Fggu1bXn0f84wM06",
  Plus: "https://buy.stripe.com/00w6oHg7IelT3qR7HA4wM07",
};

// Función para cambiar de paso
function goToStep(step) {
  if (step < 1 || step > sections.length) return;

  sections.forEach((s) => s.classList.remove("active"));
  steps.forEach((st) => st.classList.remove("active"));

  sections[step - 1].classList.add("active");
  steps[step - 1].classList.add("active");

  currentStep = step;
  btnBack.style.display = step > 1 ? "inline-block" : "none";
  btnNext.textContent = step === sections.length ? "Finalizar" : "Siguiente →";
}

// Validar que se haya elegido algo antes de avanzar
function validateStep() {
  const activeSection = sections[currentStep - 1];
  const requiredInputs = activeSection.querySelectorAll("input[required]");
  for (const input of requiredInputs) {
    if (
      (input.type === "radio" && !activeSection.querySelector(`input[name="${input.name}"]:checked`)) ||
      (input.type !== "radio" && !input.value.trim())
    ) {
      input.focus();
      input.classList.add("error");
      return false;
    }
  }
  return true;
}

// Actualiza el resumen del pedido
function updateSummary() {
  const version = document.querySelector('input[name="version"]:checked');
  const software = document.querySelector('input[name="software"]:checked');
  const region = document.querySelector('input[name="region"]:checked');
  const email = document.getElementById("email");

  summaryVersion.textContent = version ? version.value : "-";
  summarySoftware.textContent = software ? software.value : "-";
  summaryRegion.textContent = region ? region.value : "-";
  summaryEmail.textContent = email.value || "-";
}

// Al hacer clic en “Siguiente”
btnNext.addEventListener("click", () => {
  if (!validateStep()) return;

  updateSummary();

  if (currentStep < sections.length) {
    goToStep(currentStep + 1);
  } else {
    // Mostrar botón de Stripe
    document.getElementById("checkout-form").style.display = "none";
    paymentSection.style.display = "block";

    const planTitle = document.getElementById("plan-title").textContent.trim();
    stripeButton.href = stripeLinks[planTitle] || stripeLinks.Mini;
  }
});

// Al hacer clic en “Atrás”
btnBack.addEventListener("click", () => {
  goToStep(currentStep - 1);
});

// Rellenar dinámicamente opciones de software según versión
const softwareContainer = document.getElementById("software-options");
const versionRadios = document.querySelectorAll('input[name="version"]');

const softwareByVersion = {
  Java: ["PaperMC", "Purpur", "Spigot", "Fabric", "Forge"],
  Bedrock: ["Oficial", "PocketMine-MP", "NukkitX"],
};

versionRadios.forEach((radio) => {
  radio.addEventListener("change", (e) => {
    const version = e.target.value;
    softwareContainer.innerHTML = "";

    softwareByVersion[version].forEach((sw) => {
      const label = document.createElement("label");
      label.classList.add("option-card");

      label.innerHTML = `
        <input type="radio" name="software" value="${sw}" required>
        <div class="option-content">
          <span class="option-title">${sw}</span>
        </div>
      `;

      softwareContainer.appendChild(label);
    });
  });
});

// Actualiza el resumen cuando el usuario cambia algo
document.querySelectorAll("input").forEach((input) => {
  input.addEventListener("change", updateSummary);
  input.addEventListener("input", updateSummary);
});

// Inicialización
goToStep(1);
updateSummary();
