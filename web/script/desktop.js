let desktopLoaded = false;

/**
 * راه‌اندازی رویدادهای دسکتاپ:
 * درگ و دراپ آیکون‌ها، ساعت و دوبل‌کلیک روی آیکون‌ها
 */
function initDesktopEvents(container) {
  const icons = container.querySelectorAll('.icon');
  const gridSize = 100;

  icons.forEach((icon, idx) => {
    const id = icon.id;
    const saved = JSON.parse(localStorage.getItem(id));
    icon.style.left = (saved?.x ?? 40) + 'px';
    icon.style.top  = (saved?.y ?? (60 + idx * gridSize)) + 'px';

    let dragging = false, offsetX = 0, offsetY = 0;

    icon.addEventListener('mousedown', e => {
      dragging = true;
      offsetX = e.clientX - icon.offsetLeft;
      offsetY = e.clientY - icon.offsetTop;
      icon.classList.add('dragging');
      icon.style.zIndex = 1000;

      const onMove = me => {
        if (!dragging) return;
        let x = me.clientX - offsetX;
        let y = me.clientY - offsetY;
        x = Math.max(0, Math.min(x, window.innerWidth - icon.offsetWidth));
        y = Math.max(0, Math.min(y, window.innerHeight - icon.offsetHeight - 48));
        icon.style.left = x + 'px';
        icon.style.top  = y + 'px';
      };

      const onUp = () => {
        dragging = false;
        icon.classList.remove('dragging');
        icon.style.zIndex = 10;

        let x = Math.round(icon.offsetLeft / gridSize) * gridSize;
        let y = Math.round(icon.offsetTop  / gridSize) * gridSize;

        const occupied = (tx, ty) => Array.from(icons).some(o =>
          o !== icon && Math.abs(o.offsetLeft - tx) < gridSize && Math.abs(o.offsetTop - ty) < gridSize
        );

        if (occupied(x, y)) {
          let best = {dist: Infinity, x, y}, found = false;
          for (let dx = -3; dx <= 3; dx++) {
            for (let dy = -3; dy <= 3; dy++) {
              const tx = x + dx * gridSize, ty = y + dy * gridSize;
              if (tx < 0 || ty < 0 || tx > window.innerWidth - icon.offsetWidth ||
                  ty > window.innerHeight - icon.offsetHeight - 48) continue;
              if (!occupied(tx, ty)) {
                const d = Math.hypot(tx - x, ty - y);
                if (d < best.dist) { best = {x: tx, y: ty, dist: d}; found = true; }
              }
            }
          }
          if (found) { x = best.x; y = best.y; }
          else {
            const old = JSON.parse(localStorage.getItem(id));
            if (old) {
              icon.classList.add('bounce-back');
              setTimeout(() => icon.classList.remove('bounce-back'), 300);
              x = old.x; y = old.y;
            }
          }
        }

        icon.style.left = x + 'px';
        icon.style.top  = y + 'px';
        localStorage.setItem(id, JSON.stringify({x, y}));

        document.removeEventListener('mousemove', onMove);
        document.removeEventListener('mouseup', onUp);
      };

      document.addEventListener('mousemove', onMove);
      document.addEventListener('mouseup', onUp);
    });
  });

  // ساعت و تاریخ شمسی
  setInterval(() => {
    const now = new Date();
    const time = now.toLocaleTimeString("fa-IR", {hour:'2-digit',minute:'2-digit'});
    const date = new Intl.DateTimeFormat("fa-IR-u-ca-persian", {
      weekday:'long', day:'numeric', month:'long', year:'numeric'
    }).format(now);
    const clock = container.querySelector('#taskbar-clock');
    if (clock) clock.textContent = `${time} - ${date}`;
  }, 1000);

  // دوبل‌کلیک برای باز کردن پنل‌ها
  const panels = {
    'icon-diagnostic': 'engine',
    'icon-finance': 'invoice',
    'icon-game': 'minigame'
  };

  Object.entries(panels).forEach(([id, panel]) => {
    const icon = container.querySelector(`#${id}`);
    if (icon) {
      icon.addEventListener('dblclick', () => {
        SendNUIMessage({action: 'openPanel', panel});
      });
    }
  });
}

/**
 * باز کردن UI دسکتاپ
 */
window.openDesktopUI = function() {
  if (document.getElementById('desktop-ui')) return;

  // علامت بزن که دسکتاپ باز است و از نمایش مکانیک جلوگیری کن (با CSS)
  document.body.classList.add('desktop-open');
  document.body.classList.remove('show-ui');

  fetch('desktop.html')
    .then(r => r.text())
    .then(html => {
      const bodyContent = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
      const wrapper = document.createElement('div');
      wrapper.id = 'desktop-ui';
      wrapper.innerHTML = bodyContent ? bodyContent[1] : html;
      Object.assign(wrapper.style, {
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 9999,
        overflow: 'hidden',
        background: 'transparent'
      });
      document.body.appendChild(wrapper);

      if (!document.getElementById('desktop-css')) {
        const link = document.createElement('link');
        link.id = 'desktop-css';
        link.rel = 'stylesheet';
        link.href = 'style/desktop.css';
        document.head.appendChild(link);
      }

      // مقداردهی اولیه آیکون‌ها در صورت لزوم
      wrapper.querySelectorAll('.icon').forEach((icon, idx) => {
        if (!icon.style.left) icon.style.left = (40) + 'px';
        if (!icon.style.top)  icon.style.top  = (60 + idx * 100) + 'px';
      });

      initDesktopEvents(wrapper);
      desktopLoaded = true;
    })
    .catch(err => {
      console.error('openDesktopUI fetch error:', err);
      // اگر fetch خطا داد، حذف کلاس desktop-open
      document.body.classList.remove('desktop-open');
    });
};

window.closeDesktopUI = function() {
  const d = document.getElementById('desktop-ui');
  if (d) d.remove();

  const css = document.getElementById('desktop-css');
  if (css) css.remove();

  desktopLoaded = false;

  // برداشتن کلاس desktop-open و بازگرداندن UI مکانیک (در صورت نیاز)
  document.body.classList.remove('desktop-open');
  document.body.classList.add('show-ui');
}

// هندلِ SendNUIMessage در صورت نبودن
const SendNUIMessage = window.SendNUIMessage || function() {};
