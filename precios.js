// --- Conversión de Monedas: EUR ↔ USD ---
document.addEventListener('DOMContentLoaded', () => {
  const CURRENCIES = {
    EUR: { rate: 1, label: 'Euros (€)' },
    USD: { rate: 1.08, label: 'Dólares (USD)' } // 1 EUR ≈ 1.08 USD
  };

  const currencySelect = document.getElementById('currency-select');
  const amounts = Array.from(document.querySelectorAll('.amount[data-eur]'));

  function guessCurrency() {
    const lang = navigator.language || 'es-ES';
    if (lang.startsWith('en') || lang.startsWith('es-US')) return 'USD';
    return 'EUR';
  }

  function formatCurrency(valueEur, code) {
    const { rate } = CURRENCIES[code] || CURRENCIES.USD;
    const converted = valueEur * rate;
    return new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency: code,
      maximumFractionDigits: 2
    }).format(converted);
  }

  function updatePrices(code) {
    amounts.forEach(el => {
      const eur = parseFloat(el.dataset.eur);
      el.textContent = formatCurrency(eur, code);
    });
  }

  if (currencySelect) {
    currencySelect.innerHTML = '';

    Object.entries(CURRENCIES).forEach(([code, meta]) => {
      const opt = document.createElement('option');
      opt.value = code;
      opt.textContent = meta.label;
      currencySelect.appendChild(opt);
    });

    const initial = guessCurrency();
    currencySelect.value = initial;
    updatePrices(initial);

    currencySelect.addEventListener('change', () => {
      updatePrices(currencySelect.value);
    });
  }
});
