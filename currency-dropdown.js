const initCurrencyDropdown = () => {
  const host = document.getElementById("currency-dropdown");
  if (!host || !window.BlockHostCurrency) return;
  const { CURRENCIES, updatePrices, guessCurrency } = window.BlockHostCurrency;

  const toggle = document.createElement("button");
  toggle.className = "currency-toggle";
  toggle.type = "button";

  const menu = document.createElement("ul");
  menu.className = "currency-menu";
  menu.setAttribute("role", "listbox");

  const initial = guessCurrency();
  toggle.textContent = (CURRENCIES[initial]?.label) || "Dólares (USD)";
  updatePrices(initial);

  Object.entries(CURRENCIES).forEach(([code, meta]) => {
    const li = document.createElement("li");
    li.className = "currency-item";
    li.setAttribute("role", "option");
    li.dataset.value = code;
    li.textContent = meta.label;
    if (code === initial) li.classList.add("selected");
    li.addEventListener("click", () => {
      toggle.textContent = meta.label;
      menu.querySelectorAll(".currency-item").forEach(i => i.classList.remove("selected"));
      li.classList.add("selected");
      updatePrices(code);
      host.classList.remove("open");
      toggle.setAttribute("aria-expanded", "false");
    });
    menu.appendChild(li);
  });

  toggle.addEventListener("click", () => {
    const open = host.classList.toggle("open");
    toggle.setAttribute("aria-expanded", open ? "true" : "false");
  });

  document.addEventListener("click", (e) => {
    if (!host.contains(e.target)) {
      host.classList.remove("open");
      toggle.setAttribute("aria-expanded", "false");
    }
  });

  toggle.setAttribute("aria-haspopup", "listbox");
  toggle.setAttribute("aria-expanded", "false");

  host.appendChild(toggle);
  host.appendChild(menu);
};

document.addEventListener("DOMContentLoaded", initCurrencyDropdown);
