// ===== minigame.js =====

// اگر SendNUIMessage از قبل تعریف نشده باشه، یک فانکشن خالی جایگزینش کن
if (typeof window.SendNUIMessage !== 'function') {
  window.SendNUIMessage = function() {};
}

(function() {
  let minigameLoaded = false;
  let minigameInterval = null;

  function initMinigameEvents(wrapper) {
    const dino       = wrapper.querySelector('#dino');
    const obstacle   = wrapper.querySelector('#obstacle');
    const scoreEl    = wrapper.querySelector('#score');
    const messageBox = wrapper.querySelector('#messageBox');
    const closeBtn   = wrapper.querySelector('#minigame-close-btn');

    if (!dino || !obstacle || !scoreEl) {
      console.warn('minigame: required elements missing');
      return;
    }

    let score     = 0;
    let isJumping = false;

    function jump() {
      if (isJumping) return;
      isJumping = true;
      dino.classList.add('jump');
      setTimeout(() => {
        dino.classList.remove('jump');
        isJumping = false;
      }, 500);
    }

    function startLoop() {
      if (minigameInterval) clearInterval(minigameInterval);

      let obsPos = wrapper.clientWidth;
      obstacle.style.left    = obsPos + 'px';
      obstacle.style.display = 'block';

      minigameInterval = setInterval(() => {
        obsPos -= 8;
        obstacle.style.left = obsPos + 'px';

        const dRect = dino.getBoundingClientRect();
        const oRect = obstacle.getBoundingClientRect();
        const collision = 
          oRect.left < dRect.right &&
          oRect.right > dRect.left &&
          oRect.top < dRect.bottom &&
          oRect.bottom > dRect.top;

        if (collision) {
          clearInterval(minigameInterval);
          minigameInterval = null;
          obstacle.style.display = 'none';
          alert('باختی! امتیاز نهایی: ' + score);
          if (messageBox) messageBox.style.display = 'flex';
          return;
        }

        if (obsPos < -50) {
          score++;
          scoreEl.textContent = score;
          clearInterval(minigameInterval);
          minigameInterval = null;
          setTimeout(startLoop, 800);
        }
      }, 30);
    }

    function onKey(e) {
      if (e.code === 'Space') {
        if (messageBox) messageBox.style.display = 'none';
        if (!minigameInterval) startLoop();
        jump();
      }
    }

    document.addEventListener('keydown', onKey);

    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        // فراخوانی SendNUIMessage جهت بستن
        window.SendNUIMessage({ action: 'closeMinigame' });
      });
    }

    // تابع cleanup برای پاکسازی eventها
    wrapper._minigameCleanup = () => {
      document.removeEventListener('keydown', onKey);
      if (minigameInterval) {
        clearInterval(minigameInterval);
        minigameInterval = null;
      }
    };
  }

  function openMinigameUI() {
    if (minigameLoaded || document.getElementById('minigame-ui')) return;

    document.body.classList.add('desktop-open');

    fetch('minigame.html')
      .then(res => res.text())
      .then(html => {
        const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
        const wrapper   = document.createElement('div');
        wrapper.id      = 'minigame-ui';
        wrapper.innerHTML = bodyMatch ? bodyMatch[1] : html;

        Object.assign(wrapper.style, {
          position: 'fixed',
          top:      '0',
          left:     '0',
          width:    '100vw',
          height:   '100vh',
          zIndex:   '10000',
          overflow: 'hidden',
          background: 'transparent'
        });
        document.body.appendChild(wrapper);

        // لود کردن CSS در صورت نبود
        if (!document.getElementById('minigame-css')) {
          const link       = document.createElement('link');
          link.id          = 'minigame-css';
          link.rel         = 'stylesheet';
          link.href        = 'style/minigame.css';
          document.head.appendChild(link);
        }

        // اگر المنت‌های حیاتی موجود نبودن، fallback بساز
        if (!wrapper.querySelector('#score')) {
          const hud = document.createElement('div');
          hud.id = 'hud';
          hud.innerHTML = '<span>امتیاز: <span id="score">0</span></span>';
          wrapper.appendChild(hud);
        }
        if (!wrapper.querySelector('#game')) {
          const gameDiv = document.createElement('div');
          gameDiv.id = 'game';
          gameDiv.innerHTML = `
            <div id="dino"></div>
            <div id="obstacle" style="display:none"></div>
          `;
          wrapper.appendChild(gameDiv);
        }
        if (!wrapper.querySelector('#messageBox')) {
          const msg = document.createElement('div');
          msg.id = 'messageBox';
          msg.innerHTML = `
            <div class="start-card">
              <h1>به بازی دایناسور خوش آمدی</h1>
              <p>برای شروع، کلید <span class="key">Space</span> را فشار بده</p>
            </div>`;
          wrapper.appendChild(msg);
        }
        if (!wrapper.querySelector('#minigame-close-btn')) {
          const btn = document.createElement('button');
          btn.id = 'minigame-close-btn';
          btn.textContent = 'بازگشت';
          wrapper.appendChild(btn);
        }

        initMinigameEvents(wrapper);
        minigameLoaded = true;
      })
      .catch(err => {
        console.error('openMinigameUI fetch error:', err);
        document.body.classList.remove('desktop-open');
      });
  }

  function closeMinigameUI() {
    const ui = document.getElementById('minigame-ui');
    if (ui) {
      if (ui._minigameCleanup) {
        try { ui._minigameCleanup(); } catch(e) {}
      }
      ui.remove();
    }
    const css = document.getElementById('minigame-css');
    if (css) css.remove();

    minigameLoaded = false;
    document.body.classList.remove('desktop-open');
    document.body.classList.add('show-ui');
  }

  // اکسپورت توابع به گلوبال
  window.openMinigameUI  = openMinigameUI;
  window.closeMinigameUI = closeMinigameUI;
})();
