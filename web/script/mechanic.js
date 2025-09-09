// mechanic.js - نسخه بازنویسی‌شده

const SendNUIMessage = window.SendNUIMessage || function () {};
let locales = {};
let currentLang = 'fa';
let availableLangs = [];

const panelConfig = {
  engine: [
    { key: 'engine-health', max: 1000, repairable: true },
    { key: 'oil-level', max: 100, repairable: true },
    { key: 'oil-pressure', max: 100, repairable: false },
    { key: 'coolant-temp', max: 120, repairable: false },
    { key: 'ignition-timing', max: null, repairable: false },
    { key: 'spark-wear', max: null, repairable: true }
  ],
  // سایر پنل‌ها مشابه تعریف می‌شن...
};

// ترجمه کلید
function t(section, key) {
  return locales[currentLang]?.[section]?.[key] || key;
}

// ساخت پنل‌ها
function buildPanels() {
  for (const [panelId, fields] of Object.entries(panelConfig)) {
    const container = document.getElementById(panelId);
    if (!container) continue;
    container.innerHTML = '';

    const summary = document.createElement('div');
    summary.className = 'summary-cards';

    const detail = document.createElement('div');
    detail.className = 'detail-grid';

    fields.forEach(f => {
      const elementId = `${panelId}-${f.key}`;

      if (f.max !== null) {
        const card = document.createElement('div');
        card.className = 'card gauge-card';
        card.dataset.param = f.key;
        card.dataset.max = f.max;
        card.innerHTML = `
          <div class="gauge">
            <div class="gauge-fill"></div>
            <div class="gauge-cover"><span id="${elementId}">–</span></div>
          </div>
          <div class="card-label">${t(panelId, f.key)}</div>`;
        summary.appendChild(card);
      } else {
        const row = document.createElement('div');
        row.className = 'param-row';
        row.dataset.param = f.key;
        row.innerHTML = `
          <strong>${t(panelId, f.key)}:</strong>
          <span id="${elementId}">–</span>
          <div class="actions">
            ${f.repairable ? `<button class="action-btn repair" data-action="repairParam" data-param="${f.key}">${t('button','repair')}</button>` : ''}
            <button class="action-btn install" data-action="toggleInstall" data-param="${f.key}">${t('button','install')}</button>
          </div>`;
        detail.appendChild(row);
      }
    });

    container.append(summary, detail);
  }
}

// تب‌ها
function initTabs() {
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.onclick = () => {
      document.querySelectorAll('.tab-btn').forEach(x => x.classList.remove('active'));
      btn.classList.add('active');

      document.querySelectorAll('.panel').forEach(p => p.classList.add('hidden'));
      document.getElementById(btn.dataset.tab)?.classList.remove('hidden');

      SendNUIMessage({ action: 'getPanelData', panel: btn.dataset.tab });
    };
  });
}

// دکمه‌ها
function initActions() {
  document.body.addEventListener('click', ev => {
    if (!ev.target.matches('.action-btn')) return;
    const panel = document.querySelector('.tab-btn.active')?.dataset.tab;
    const param = ev.target.dataset.param;
    const act = ev.target.dataset.action;
    SendNUIMessage({ action: act, panel, param });
  });
}

// بروزرسانی داده‌ها
function updatePanel(panel, data) {
  for (const [key, value] of Object.entries(data)) {
    const span = document.getElementById(`${panel}-${key}`);
    if (!span) continue;
    span.innerText = value;
    span.classList.add('pop');
    setTimeout(() => span.classList.remove('pop'), 400);

    const card = document.querySelector(`#${panel} .gauge-card[data-param="${key}"]`);
    if (card) {
      const pct = Math.min(100, Math.round(value / card.dataset.max * 100));
      card.querySelector('.gauge-fill').style.setProperty('--fill', pct + '%');
    }
  }
}

// نصب/حذف
function setInstallState(panel, param, installed) {
  const card = document.querySelector(`#${panel} .card[data-param="${param}"]`);
  if (card) card.classList.toggle('inactive', !installed);
}

// ترجمه UI
function translateUI() {
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const [sec, key] = el.dataset.i18n.split('.');
    el.innerText = t(sec, key);
  });
}

// پیام‌های NUI
window.addEventListener('message', ev => {
  const d = ev.data;
  switch (d.action) {
    case 'openUI':
      openMechanicUI(d);
      break;
    case 'updatePanel':
      updatePanel(d.panel, d.values);
      break;
    case 'setInstallState':
      setInstallState(d.panel, d.param, d.installed);
      break;
    case 'openPanel':
      document.body.classList.add('show-ui');
      document.querySelector(`.tab-btn[data-tab="${d.panel}"]`)?.click();
      break;
    case 'openDesktop':
      if (window.openDesktopUI) window.openDesktopUI();
      break;
    case 'openMinigame':
      if (window.openMinigameUI) window.openMinigameUI();
      break;
  }
});

// راه‌اندازی UI مکانیک
function openMechanicUI(data) {
  closeAllPages();
  document.body.classList.add('show-ui');

  locales = data.locales;
  currentLang = data.currentLang;
  availableLangs = data.availableLangs;

  const sel = document.getElementById('lang-select');
  sel.innerHTML = availableLangs.map(l => `<option value="${l}">${l.toUpperCase()}</option>`).join('');
  sel.value = currentLang;
  sel.onchange = () => {
    currentLang = sel.value;
    translateUI();
  };

  translateUI();
  buildPanels();
  initTabs();
  initActions();

  SendNUIMessage({ action: 'getPanelData', panel: 'engine' });
}

// بستن صفحات
function closeAllPages() {
  document.body.classList.remove('show-ui', 'desktop-open');
  if (typeof window.closeDesktopUI === 'function') window.closeDesktopUI();
  if (typeof window.closeMinigameUI === 'function') window.closeMinigameUI();
}

// هندل ESC
document.addEventListener('keydown', function (e) {
  if (e.key === 'Escape') {
    document.body.classList.remove('show-ui');
    if (typeof fetch !== 'undefined' && typeof GetParentResourceName === 'function') {
      fetch('https://' + GetParentResourceName() + '/closeUI', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      }).catch(() => {});
    }
  }
});