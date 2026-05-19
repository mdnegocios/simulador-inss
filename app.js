const STORAGE_KEY = "inss-sim-v1-local";

const state = loadState();
let toastTimer = 0;

const el = {
  toast: document.getElementById("toast"),
  saveButton: document.getElementById("saveButton"),
  printButton: document.getElementById("printButton"),
  benefitBase: document.getElementById("benefitBase"),
  committedMargin: document.getElementById("committedMargin"),
  limitWarning: document.getElementById("limitWarning"),
  newMargin: document.getElementById("newMargin"),
  availableMetric: document.getElementById("availableMetric"),
  availableMargin: document.getElementById("availableMargin"),
};

bindEvents();
render();

function bindEvents() {
  el.benefitBase.addEventListener("input", (event) => {
    state.benefitBase = parseCurrency(event.target.value);
    render();
  });

  el.committedMargin.addEventListener("input", (event) => {
    const rawValue = parseCurrency(event.target.value);
    state.committedMarginTouched = event.target.value.replace(/\D/g, "").length > 0;
    state.committedMargin = clampCommittedMargin(rawValue);
    render();
  });

  el.saveButton.addEventListener("click", saveState);
  el.printButton.addEventListener("click", () => window.print());
}

function render() {
  const summary = calculateSummary();

  syncInputs();
  renderSummary(summary);
}

function syncInputs() {
  el.benefitBase.value = state.benefitBase ? currencyInputValue(state.benefitBase) : "";
  el.committedMargin.value = state.committedMarginTouched ? currencyInputValue(state.committedMargin) : "";
}

function renderSummary(summary) {
  el.newMargin.textContent = formatCurrency(summary.totalNewMargin);
  el.availableMargin.textContent = formatCurrency(summary.availableLoanMargin);
  el.availableMetric.classList.toggle("metric--success", summary.availableLoanMargin > 0);
  el.availableMetric.classList.toggle("metric--danger", summary.availableLoanMargin < 0);
  el.limitWarning.hidden = !summary.exceedsLoanLimit;
}

function calculateSummary() {
  const committedMargin = state.committedMarginTouched ? state.committedMargin : 0;
  const totalNewMargin = state.benefitBase * 0.4;
  const rmcValue = state.benefitBase * 0.05;
  const rccValue = state.benefitBase * 0.05;
  const loanLimit = state.benefitBase * 0.4;
  const usedLoanMargin = committedMargin;
  const exceedsLoanLimit = state.benefitBase > 0 && usedLoanMargin > loanLimit;
  const effectiveUsedLoanMargin = state.benefitBase > 0 ? Math.min(usedLoanMargin, loanLimit) : usedLoanMargin;
  const availableLoanMargin = totalNewMargin - rmcValue - rccValue - effectiveUsedLoanMargin;

  return {
    totalNewMargin,
    rmcValue,
    rccValue,
    loanLimit,
    usedLoanMargin,
    exceedsLoanLimit,
    availableLoanMargin,
    effectiveUsedLoanMargin,
  };
}

function clampCommittedMargin(value) {
  const summary = calculateSummary();
  if (state.benefitBase <= 0) return value;
  const maxAvailable = Math.max(0, summary.loanLimit);
  if (value > maxAvailable) {
    showToast(`Margem ajustada ao limite de ${formatCurrency(maxAvailable)}.`);
    return maxAvailable;
  }
  return value;
}

function parseCurrency(value) {
  const digits = String(value).replace(/\D/g, "");
  return digits ? Number.parseInt(digits, 10) / 100 : 0;
}

function currencyInputValue(value) {
  return formatCurrency(value).replace("R$", "").trim();
}

function formatCurrency(value) {
  return Number(value || 0).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  showToast("Simulacao salva no navegador.");
}

function loadState() {
  const fallback = {
    benefitBase: 0,
    committedMargin: 0,
    committedMarginTouched: false,
    // RMC and RCC are applied automatically (5% each)
  };

  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
    return saved ? { ...fallback, ...saved } : fallback;
  } catch {
    return fallback;
  }
}

function showToast(message) {
  window.clearTimeout(toastTimer);
  el.toast.textContent = message;
  el.toast.classList.add("is-visible");
  toastTimer = window.setTimeout(() => {
    el.toast.classList.remove("is-visible");
  }, 2600);
}
