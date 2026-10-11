window.ONEUI_APPS = {
  phone: {
    name: 'Phone',
    color: '#3ddc84',
    emoji: '📞',
    render: function (el) {
      var num = '';
      el.innerHTML =
        '<div class="phone-pad"><div class="phone-num" id="pNum"></div>' +
        '<div class="pad-grid" id="pPad">' +
        [1,2,3,4,5,6,7,8,9,'*',0,'#'].map(function (n) {
          var sub = {2:'ABC',3:'DEF',4:'GHI',5:'JKL',6:'MNO',7:'PQRS',8:'TUV',9:'WXYZ'}[n] || '';
          return '<button type="button" data-n="' + n + '">' + n + (sub ? '<small>' + sub + '</small>' : '') + '</button>';
        }).join('') +
        '</div><button type="button" class="call-green" id="pCall">📞</button></div>';
      el.querySelector('#pPad').onclick = function (e) {
        var b = e.target.closest('button[data-n]');
        if (!b) return;
        num += b.dataset.n;
        el.querySelector('#pNum').textContent = num;
      };
      el.querySelector('#pCall').onclick = function () {
        if (!num) return;
        el.querySelector('#pNum').textContent = 'Calling ' + num + '…';
      };
    }
  },
  messages: {
    name: 'Messages',
    color: '#3e8ef7',
    emoji: '💬',
    render: function (el) {
      var chats = [
        { n: 'Mom', t: 'Are you coming home?', m: 'now', c: '#e91e63' },
        { n: 'Alex', t: 'Meeting at 3?', m: '12m', c: '#3e8ef7' },
        { n: 'Work', t: 'Sarah: Designs ready', m: '1h', c: '#3ddc84' },
        { n: 'Dad', t: 'Call when free', m: 'Yesterday', c: '#ff9800' }
      ];
      el.innerHTML =
        '<div class="list">' +
        chats.map(function (c) {
          return (
            '<div class="list-row">' +
            '<div class="avatar" style="background:' + c.c + '">' + c.n[0] + '</div>' +
            '<div class="list-main"><div class="list-title">' + c.n + '</div>' +
            '<div class="list-sub">' + c.t + '</div></div>' +
            '<div class="list-meta">' + c.m + '</div></div>'
          );
        }).join('') +
        '</div>';
    }
  },
  chrome: {
    name: 'Chrome',
    color: '#fbbc04',
    emoji: '🌐',
    render: function (el) {
      el.innerHTML =
        '<div style="height:100%;display:flex;flex-direction:column">' +
        '<div class="chrome-bar">' +
        '<input id="cUrl" value="https://www.google.com" />' +
        '<button type="button" id="cGo">Go</button></div>' +
        '<div id="cStage" style="flex:1;min-height:0;position:relative"></div></div>';
      var stage = el.querySelector('#cStage');
      var input = el.querySelector('#cUrl');
      function load() {
        var u = input.value.trim();
        if (!u) return;
        if (!/^https?:\/\//i.test(u)) u = 'https://' + u;
        input.value = u;
        /* Many sites block iframe — show launch card + optional iframe try */
        stage.innerHTML =
          '<div class="launch-card">' +
          '<div style="font-size:40px">🌐</div>' +
          '<div style="font-size:18px;font-weight:600">Chrome</div>' +
          '<p style="color:#9aa0a6;font-size:13px;max-width:260px">Open a live browser session for this page.</p>' +
          '<button type="button" id="cOpen">Open page</button></div>';
        stage.querySelector('#cOpen').onclick = function () {
          window.open(u, '_blank', 'noopener,noreferrer');
        };
      }
      el.querySelector('#cGo').onclick = load;
      input.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') load();
      });
      load();
    }
  },
  camera: {
    name: 'Camera',
    color: '#9e9e9e',
    emoji: '📷',
    render: function (el) {
      el.innerHTML =
        '<div class="cam-view"><div class="cam-preview" id="camPrev">' +
        '<video id="camVid" autoplay playsinline muted></video>' +
        '<div id="camFb" style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;color:#888">Camera</div>' +
        '</div><div class="cam-controls"><button type="button" class="cam-shutter" id="camShot"></button></div></div>';
      var v = el.querySelector('#camVid');
      var fb = el.querySelector('#camFb');
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' }, audio: false })
          .then(function (stream) {
            window.__oneuiCam = stream;
            v.srcObject = stream;
            fb.style.display = 'none';
          })
          .catch(function () {
            fb.textContent = 'Allow camera access';
          });
      }
      el.querySelector('#camShot').onclick = function () {
        var f = document.createElement('div');
        f.style.cssText = 'position:absolute;inset:0;background:#fff;opacity:0.8;z-index:2;transition:opacity .25s';
        el.querySelector('#camPrev').appendChild(f);
        setTimeout(function () { f.style.opacity = '0'; }, 40);
        setTimeout(function () { f.remove(); }, 300);
      };
    }
  },
  gallery: {
    name: 'Gallery',
    color: '#e040fb',
    emoji: '🖼️',
    render: function (el) {
      var cells = '';
      for (var i = 0; i < 15; i++) {
        cells +=
          '<div style="background:linear-gradient(' +
          (40 + i * 20) +
          'deg,hsl(' +
          (i * 24) +
          ',45%,28%),hsl(' +
          (i * 24 + 40) +
          ',40%,18%))"></div>';
      }
      el.innerHTML = '<div class="gallery-grid">' + cells + '</div>';
    }
  },
  settings: {
    name: 'Settings',
    color: '#78909c',
    emoji: '⚙️',
    render: function (el) {
      function row(ico, bg, label, val, toggle) {
        return (
          '<div class="settings-row">' +
          '<div class="s-ico" style="background:' + bg + '">' + ico + '</div>' +
          '<div class="s-label">' + label + '</div>' +
          (toggle
            ? '<button type="button" class="toggle' + (val ? ' on' : '') + '" data-tog></button>'
            : '<div class="s-val">' + (val || '') + '</div>') +
          '</div>'
        );
      }
      el.innerHTML =
        '<div class="settings-section">' +
        row('✈️', '#3e8ef7', 'Airplane mode', false, true) +
        row('📶', '#3e8ef7', 'Connections', 'Wi-Fi · 5G') +
        row('🔊', '#ff9800', 'Sounds and vibration', '') +
        '</div><div class="settings-section">' +
        row('🔔', '#f44336', 'Notifications', '') +
        row('📱', '#3ddc84', 'Display', 'Dark') +
        row('🔒', '#9c27b0', 'Lock screen', '') +
        '</div><div class="settings-section">' +
        row('ℹ️', '#607d8b', 'About phone', 'Galaxy · One UI') +
        '</div>' +
        '<p style="text-align:center;color:#9aa0a6;font-size:12px;padding:24px">One UI · Android 15</p>';
      el.querySelectorAll('[data-tog]').forEach(function (t) {
        t.onclick = function () { t.classList.toggle('on'); };
      });
    }
  },
  calculator: {
    name: 'Calculator',
    color: '#37474f',
    emoji: '🧮',
    render: function (el) {
      el.innerHTML =
        '<div class="calc"><div class="calc-display" id="cd">0</div><div class="calc-keys">' +
        '<button type="button" class="fn" data-k="AC">AC</button>' +
        '<button type="button" class="fn" data-k="+/-">+/−</button>' +
        '<button type="button" class="fn" data-k="%">%</button>' +
        '<button type="button" class="op" data-k="/">÷</button>' +
        '<button type="button" data-k="7">7</button><button type="button" data-k="8">8</button><button type="button" data-k="9">9</button>' +
        '<button type="button" class="op" data-k="*">×</button>' +
        '<button type="button" data-k="4">4</button><button type="button" data-k="5">5</button><button type="button" data-k="6">6</button>' +
        '<button type="button" class="op" data-k="-">−</button>' +
        '<button type="button" data-k="1">1</button><button type="button" data-k="2">2</button><button type="button" data-k="3">3</button>' +
        '<button type="button" class="op" data-k="+">+</button>' +
        '<button type="button" class="zero" data-k="0">0</button>' +
        '<button type="button" data-k=".">.</button>' +
        '<button type="button" class="op" data-k="=">=</button></div></div>';
      var cur = '0', prev = null, op = null, reset = false;
      var disp = el.querySelector('#cd');
      el.querySelector('.calc-keys').onclick = function (e) {
        var b = e.target.closest('button[data-k]');
        if (!b) return;
        var k = b.dataset.k;
        if (k === 'AC') { cur = '0'; prev = null; op = null; reset = false; }
        else if (k === '+/-') cur = String(parseFloat(cur) * -1);
        else if (k === '%') cur = String(parseFloat(cur) / 100);
        else if (['+', '-', '*', '/'].indexOf(k) >= 0) {
          if (op && !reset) compute();
          prev = cur; op = k; reset = true;
        } else if (k === '=') { compute(); op = null; }
        else {
          if (reset) { cur = k === '.' ? '0.' : k; reset = false; }
          else if (k === '.' && cur.indexOf('.') >= 0) return;
          else cur = cur === '0' && k !== '.' ? k : cur + k;
        }
        disp.textContent = cur.length > 12 ? parseFloat(cur).toExponential(5) : cur;
      };
      function compute() {
        if (prev == null || op == null) return;
        var a = parseFloat(prev), b = parseFloat(cur), r = 0;
        if (op === '+') r = a + b;
        if (op === '-') r = a - b;
        if (op === '*') r = a * b;
        if (op === '/') r = b ? a / b : 'Error';
        cur = String(r); prev = null; reset = true;
      }
    }
  },
  clock: {
    name: 'Clock',
    color: '#5c6bc0',
    emoji: '🕐',
    render: function (el) {
      el.innerHTML = '<div class="clock-big"><div class="t" id="clkT">00:00:00</div><div class="d" id="clkD"></div></div>';
      function tick() {
        var n = new Date();
        el.querySelector('#clkT').textContent = n.toLocaleTimeString('en-GB');
        el.querySelector('#clkD').textContent = n.toLocaleDateString('en-US', {
          weekday: 'long', month: 'long', day: 'numeric', year: 'numeric'
        });
      }
      tick();
      el._clk = setInterval(tick, 1000);
    }
  },
  contacts: {
    name: 'Contacts',
    color: '#26a69a',
    emoji: '👤',
    render: function (el) {
      var list = [
        { n: 'Mom', p: '+1 555-0101', c: '#e91e63' },
        { n: 'Dad', p: '+1 555-0102', c: '#3e8ef7' },
        { n: 'Alex Rivera', p: '+1 555-0199', c: '#3ddc84' },
        { n: 'Jamie Chen', p: '+1 555-0142', c: '#ff9800' }
      ];
      el.innerHTML =
        '<div class="list">' +
        list.map(function (c) {
          return (
            '<div class="list-row">' +
            '<div class="avatar" style="background:' + c.c + '">' + c.n[0] + '</div>' +
            '<div class="list-main"><div class="list-title">' + c.n + '</div>' +
            '<div class="list-sub">' + c.p + '</div></div></div>'
          );
        }).join('') +
        '</div>';
    }
  },
  calendar: {
    name: 'Calendar',
    color: '#ef5350',
    emoji: '📅',
    render: function (el) {
      var now = new Date();
      var y = now.getFullYear(), m = now.getMonth();
      var first = new Date(y, m, 1).getDay();
      var days = new Date(y, m + 1, 0).getDate();
      var cells = '';
      for (var i = 0; i < first; i++) cells += '<div></div>';
      for (var d = 1; d <= days; d++) {
        var on = d === now.getDate();
        cells +=
          '<div style="padding:10px;text-align:center;border-radius:50%;' +
          (on ? 'background:#3e8ef7;font-weight:600' : '') +
          '">' + d + '</div>';
      }
      el.innerHTML =
        '<div style="padding:20px">' +
        '<div style="font-size:22px;font-weight:600;margin-bottom:16px">' +
        now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) +
        '</div>' +
        '<div style="display:grid;grid-template-columns:repeat(7,1fr);gap:6px;font-size:13px;text-align:center">' +
        ['S','M','T','W','T','F','S'].map(function (x) {
          return '<div style="color:#9aa0a6">' + x + '</div>';
        }).join('') +
        cells +
        '</div></div>';
    }
  },
  weather: {
    name: 'Weather',
    color: '#29b6f6',
    emoji: '🌤️',
    render: function (el) {
      el.innerHTML =
        '<div style="padding:40px 24px;text-align:center;background:linear-gradient(180deg,#1a3a6a,#0d1520);min-height:100%">' +
        '<div style="opacity:0.8">Lagos</div>' +
        '<div style="font-size:72px;font-weight:200;margin:8px 0">77°</div>' +
        '<div style="font-size:18px">Partly cloudy</div>' +
        '<div style="opacity:0.65;margin-top:8px">H:82° · L:70°</div></div>';
    }
  },
  store: {
    name: 'Galaxy Store',
    color: '#1e88e5',
    emoji: '🛍️',
    render: function (el) {
      var apps = ['Samsung Notes', 'Good Lock', 'SmartThings', 'Samsung Health'];
      el.innerHTML =
        '<div style="padding:16px"><div style="font-size:22px;font-weight:700;margin-bottom:16px">Galaxy Store</div>' +
        apps.map(function (a) {
          return (
            '<div class="list-row" style="background:#1c1c1e;border-radius:14px;margin-bottom:10px;border:none">' +
            '<div class="avatar" style="background:#3e8ef7;border-radius:12px">' + a[0] + '</div>' +
            '<div class="list-main"><div class="list-title">' + a + '</div>' +
            '<div class="list-sub">Samsung · Free</div></div>' +
            '<button type="button" style="border:none;background:#2a2a2e;color:#3e8ef7;border-radius:16px;padding:6px 14px;font-weight:600">Get</button></div>'
          );
        }).join('') +
        '</div>';
    }
  },
  whatsapp: {
    name: 'WhatsApp',
    color: '#25d366',
    emoji: '💚',
    render: function (el) {
      el.innerHTML =
        '<div class="launch-card">' +
        '<div style="font-size:48px">💚</div>' +
        '<div style="font-size:20px;font-weight:600">WhatsApp</div>' +
        '<p style="color:#9aa0a6;font-size:14px;max-width:280px">Open WhatsApp Web and scan the QR code with your phone to chat for real.</p>' +
        '<button type="button" id="waGo">Continue to WhatsApp Web</button></div>';
      el.querySelector('#waGo').onclick = function () {
        window.open('https://web.whatsapp.com/', '_blank', 'noopener,noreferrer');
      };
    }
  }
};

window.HOME_APPS = ['phone', 'messages', 'chrome', 'camera', 'gallery', 'settings', 'calculator', 'clock'];
window.HOME_APPS_2 = ['contacts', 'calendar', 'weather', 'store', 'whatsapp'];
window.DOCK_APPS = ['phone', 'messages', 'chrome', 'camera'];
window.ALL_APP_IDS = Object.keys(window.ONEUI_APPS);
