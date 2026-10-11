(function () {
  'use strict';

  var state = {
    unlocked: false,
    page: 0,
    app: null,
    drawer: false,
    qs: false
  };

  function $(s, r) { return (r || document).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }

  function pad(n) { return n < 10 ? '0' + n : String(n); }

  function tick() {
    var n = new Date();
    var t = pad(n.getHours()) + ':' + pad(n.getMinutes());
    var tFull = t + ':' + pad(n.getSeconds());
    var dLock = n.toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long' });
    var dHome = n.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short' });
    ['#sbTime', '#lockTime', '#homeClock', '#qsTime'].forEach(function (sel) {
      var el = $(sel);
      if (el) el.textContent = sel === '#qsTime' ? tFull : t;
    });
    if ($('#lockDate')) $('#lockDate').textContent = dLock;
    if ($('#homeDate')) $('#homeDate').textContent = dHome;
  }
  setInterval(tick, 1000);
  tick();

  function makeIcon(id) {
    var app = window.ONEUI_APPS[id];
    if (!app) return document.createElement('div');
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'app-icon';
    btn.dataset.app = id;
    btn.innerHTML =
      '<div class="ico" style="background:' + app.color + '">' + app.emoji + '</div>' +
      '<div class="lbl">' + app.name + '</div>';
    btn.addEventListener('click', function (e) {
      e.stopPropagation();
      openApp(id);
    });
    return btn;
  }

  function fillGrid(el, ids) {
    if (!el) return;
    el.innerHTML = '';
    (ids || []).forEach(function (id) { el.appendChild(makeIcon(id)); });
  }

  function renderHome() {
    fillGrid($('#gridHome'), window.HOME_APPS);
    fillGrid($('#gridHome2'), window.HOME_APPS_2);
    fillGrid($('#dock'), window.DOCK_APPS);
  }

  function renderDrawer(filter) {
    var q = (filter || '').toLowerCase();
    var ids = window.ALL_APP_IDS.filter(function (id) {
      var a = window.ONEUI_APPS[id];
      return !q || a.name.toLowerCase().indexOf(q) >= 0;
    });
    fillGrid($('#drawerGrid'), ids);
  }

  function renderQs() {
    var tiles = [
      { id: 'wifi', ico: '📶', label: 'Wi-Fi', on: true },
      { id: 'bt', ico: '🔵', label: 'Bluetooth', on: true },
      { id: 'plane', ico: '✈️', label: 'Airplane', on: false },
      { id: 'data', ico: '📡', label: 'Mobile data', on: true },
      { id: 'flash', ico: '🔦', label: 'Torch', on: false },
      { id: 'rot', ico: '🔄', label: 'Auto rotate', on: true },
      { id: 'dnd', ico: '🌙', label: 'Do not disturb', on: false },
      { id: 'pow', ico: '🔋', label: 'Power saving', on: false }
    ];
    var box = $('#qsTiles');
    box.innerHTML = '';
    tiles.forEach(function (t) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'qs-tile' + (t.on ? ' on' : '');
      b.innerHTML = '<span class="qi">' + t.ico + '</span><span>' + t.label + '</span>';
      b.onclick = function () { b.classList.toggle('on'); };
      box.appendChild(b);
    });
  }

  function showLock() {
    state.unlocked = false;
    closeApp();
    closeDrawer();
    closeQs();
    $('#home').classList.remove('show');
    $('#lock').classList.add('show');
  }

  function unlock() {
    if (state.unlocked) return;
    state.unlocked = true;
    $('#lock').classList.remove('show');
    $('#home').classList.add('show');
    renderHome();
    goPage(0);
  }

  function goPage(n) {
    state.page = n;
    $$('.home-page').forEach(function (p, i) {
      p.classList.toggle('active', i === n);
    });
    $$('#pageDots span').forEach(function (d, i) {
      d.classList.toggle('on', i === n);
    });
  }

  function openDrawer() {
    if (!state.unlocked || state.app) return;
    state.drawer = true;
    renderDrawer($('#drawerSearch').value);
    var d = $('#drawer');
    d.style.display = 'flex';
    requestAnimationFrame(function () { d.classList.add('open'); });
  }

  function closeDrawer() {
    state.drawer = false;
    var d = $('#drawer');
    d.classList.remove('open');
    setTimeout(function () {
      if (!state.drawer) d.style.display = 'none';
    }, 320);
  }

  function openQs() {
    state.qs = true;
    $('#qs').classList.add('open');
  }

  function closeQs() {
    state.qs = false;
    $('#qs').classList.remove('open');
  }

  function openApp(id) {
    var app = window.ONEUI_APPS[id];
    if (!app) return;
    if (!state.unlocked) unlock();
    closeDrawer();
    closeQs();
    state.app = id;
    if (window.__oneuiCam) {
      try { window.__oneuiCam.getTracks().forEach(function (t) { t.stop(); }); } catch (e) {}
      window.__oneuiCam = null;
    }
    var host = $('#appHost');
    host.innerHTML =
      '<div class="app-top"><h1>' + app.name + '</h1></div>' +
      '<div class="app-body" id="appBody"></div>';
    host.classList.add('open');
    host.style.display = 'flex';
    var body = $('#appBody');
    try { app.render(body); } catch (err) {
      body.innerHTML = '<div style="padding:40px;text-align:center">Error loading app</div>';
    }
  }

  function closeApp() {
    if (window.__oneuiCam) {
      try { window.__oneuiCam.getTracks().forEach(function (t) { t.stop(); }); } catch (e) {}
      window.__oneuiCam = null;
    }
    state.app = null;
    var host = $('#appHost');
    host.classList.remove('open');
    host.innerHTML = '';
    host.style.display = 'none';
  }

  /* Boot */
  setTimeout(function () {
    $('#boot').classList.add('hide');
    setTimeout(function () {
      $('#boot').style.display = 'none';
      $('#lock').classList.add('show');
    }, 500);
  }, 1600);

  /* Lock swipe up */
  (function () {
    var y0 = 0;
    var lock = $('#lock');
    lock.addEventListener('touchstart', function (e) { y0 = e.touches[0].clientY; }, { passive: true });
    lock.addEventListener('touchend', function (e) {
      if (y0 - e.changedTouches[0].clientY > 40) unlock();
    }, { passive: true });
    lock.addEventListener('mousedown', function (e) { y0 = e.clientY; });
    lock.addEventListener('mouseup', function (e) {
      if (y0 - e.clientY > 40) unlock();
    });
    lock.addEventListener('click', function (e) {
      if (e.target.closest('.lock-fab')) return;
      unlock();
    });
  })();

  $('#lockPhone').onclick = function (e) { e.stopPropagation(); unlock(); setTimeout(function () { openApp('phone'); }, 200); };
  $('#lockCam').onclick = function (e) { e.stopPropagation(); unlock(); setTimeout(function () { openApp('camera'); }, 200); };

  /* Home page swipe */
  (function () {
    var x0 = 0, y0 = 0;
    var area = $('#homePages');
    function start(x, y) { x0 = x; y0 = y; }
    function end(x, y) {
      if (!state.unlocked || state.app || state.drawer) return;
      var dx = x - x0, dy = y - y0;
      if (Math.abs(dx) < 50 || Math.abs(dx) < Math.abs(dy)) return;
      if (dx < 0 && state.page < 1) goPage(1);
      if (dx > 0 && state.page > 0) goPage(0);
    }
    area.addEventListener('touchstart', function (e) { start(e.touches[0].clientX, e.touches[0].clientY); }, { passive: true });
    area.addEventListener('touchend', function (e) { end(e.changedTouches[0].clientX, e.changedTouches[0].clientY); }, { passive: true });
    area.addEventListener('mousedown', function (e) { start(e.clientX, e.clientY); });
    area.addEventListener('mouseup', function (e) { end(e.clientX, e.clientY); });
  })();

  /* Swipe up for drawer */
  (function () {
    var y0 = 0;
    var home = $('#home');
    home.addEventListener('touchstart', function (e) { y0 = e.touches[0].clientY; }, { passive: true });
    home.addEventListener('touchend', function (e) {
      if (state.app) return;
      var dy = y0 - e.changedTouches[0].clientY;
      if (dy > 60) openDrawer();
    }, { passive: true });
  })();

  /* Pull status for QS */
  (function () {
    var y0 = 0, tracking = false;
    var screen = $('#screen');
    screen.addEventListener('touchstart', function (e) {
      if (e.touches[0].clientY < 40) { y0 = e.touches[0].clientY; tracking = true; }
    }, { passive: true });
    screen.addEventListener('touchend', function (e) {
      if (!tracking) return;
      tracking = false;
      if (e.changedTouches[0].clientY - y0 > 30) openQs();
    }, { passive: true });
    $('#statusBar').style.pointerEvents = 'auto';
    $('#statusBar').addEventListener('click', function () {
      if (state.qs) closeQs(); else openQs();
    });
  })();

  $('#drawerSearch').addEventListener('input', function () {
    renderDrawer(this.value);
  });

  /* Nav */
  $('#navHome').onclick = function () {
    closeQs();
    if (state.app) closeApp();
    else if (state.drawer) closeDrawer();
    else if (state.unlocked) goPage(0);
  };
  $('#navBack').onclick = function () {
    if (state.qs) { closeQs(); return; }
    if (state.app) { closeApp(); return; }
    if (state.drawer) { closeDrawer(); return; }
  };
  $('#navRecent').onclick = function () {
    if (state.app) closeApp();
  };

  document.querySelector('.power').addEventListener('click', function () {
    if (state.unlocked) showLock();
    else unlock();
  });

  renderQs();
  renderHome();
  renderDrawer();

  window.oneui = { openApp: openApp, unlock: unlock, closeApp: closeApp };
})();
