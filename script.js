/* The Longevity Lab: load sequence, navigation, scroll-linked hero, reveals,
   heading splits, growth-ring canvas, live clock, magnetic buttons, form. */
(function () {
  'use strict';

  var html = document.documentElement;
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var canHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  /* ---------- heading splits: words in masks, staggered by line ---------- */
  function splitWords(el) {
    var words = el.textContent.trim().split(/\s+/);
    el.textContent = '';
    var frag = document.createDocumentFragment();
    words.forEach(function (w, i) {
      var outer = document.createElement('span');
      outer.className = 'sw';
      var inner = document.createElement('span');
      inner.className = 'si';
      inner.textContent = w;
      outer.appendChild(inner);
      frag.appendChild(outer);
      if (i < words.length - 1) frag.appendChild(document.createTextNode(' '));
    });
    el.appendChild(frag);
    var line = -1, lastTop = null;
    Array.prototype.forEach.call(el.querySelectorAll('.sw'), function (sw) {
      if (sw.offsetTop !== lastTop) { line++; lastTop = sw.offsetTop; }
      sw.style.setProperty('--l', line);
    });
    el.classList.add('is-split');
  }
  function initSplits() {
    if (reduceMotion) return;
    Array.prototype.forEach.call(document.querySelectorAll('[data-split]'), splitWords);
  }

  /* ---------- load sequence: wait briefly for fonts so nothing swaps mid-animation ---------- */
  function markLoaded() {
    initSplits();
    html.classList.add('is-loaded');
  }
  if (document.fonts && document.fonts.ready) {
    Promise.race([document.fonts.ready, new Promise(function (r) { setTimeout(r, 1200); })])
      .then(function () { requestAnimationFrame(markLoaded); });
  } else {
    markLoaded();
  }

  /* ---------- scroll: nav state, hero parallax, progress line ---------- */
  var nav = document.getElementById('nav');
  var hero = document.querySelector('.hero');
  var progress = document.getElementById('progress');
  var ticking = false;
  function onScrollFrame() {
    ticking = false;
    var y = window.scrollY;
    nav.classList.toggle('is-scrolled', y > 24);
    if (hero && !reduceMotion) {
      var hp = Math.min(Math.max(y / (hero.offsetHeight * 0.85), 0), 1);
      hero.style.setProperty('--hp', hp.toFixed(3));
    }
    if (progress) {
      var max = html.scrollHeight - html.clientHeight;
      progress.style.setProperty('--sp', max > 0 ? (y / max).toFixed(4) : 0);
    }
  }
  function onScroll() {
    if (!ticking) { ticking = true; requestAnimationFrame(onScrollFrame); }
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  onScrollFrame();

  /* ---------- mobile menu ---------- */
  var toggle = document.querySelector('.nav__toggle');
  var menu = document.getElementById('menu');
  function setMenu(open) {
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    menu.hidden = !open;
    html.classList.toggle('is-open', open);
    if (open) nav.classList.add('is-scrolled'); else onScrollFrame();
  }
  toggle.addEventListener('click', function () {
    setMenu(toggle.getAttribute('aria-expanded') !== 'true');
  });
  menu.addEventListener('click', function (e) {
    if (e.target.closest('a')) setMenu(false);
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && !menu.hidden) { setMenu(false); toggle.focus(); }
  });
  window.matchMedia('(min-width: 901px)').addEventListener('change', function (e) {
    if (e.matches && !menu.hidden) setMenu(false);
  });

  /* ---------- current section: nav marker and the vertical readout ---------- */
  var navLinks = Array.prototype.slice.call(document.querySelectorAll('.nav__links a'));
  var hud = document.getElementById('hud');
  var hudIndex = document.getElementById('hud-index');
  var hudName = document.getElementById('hud-name');
  var tracked = [
    { id: 'philosophy', name: 'Philosophy' },
    { id: 'method', name: 'Method' },
    { id: 'for', name: 'Who this is for' },
    { id: 'coach', name: 'The coach' },
    { id: 'contact', name: 'Contact' }
  ];
  if ('IntersectionObserver' in window) {
    var current = null;
    var sectionIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) current = entry.target.id;
        else if (current === entry.target.id) current = null;
      });
      navLinks.forEach(function (a) {
        if (a.getAttribute('href') === '#' + current) a.setAttribute('aria-current', 'true');
        else a.removeAttribute('aria-current');
      });
      var idx = -1;
      tracked.forEach(function (t, i) { if (t.id === current) idx = i; });
      if (hud) {
        if (idx >= 0) {
          hudIndex.textContent = (idx + 1 < 10 ? '0' : '') + (idx + 1);
          hudName.textContent = tracked[idx].name;
          hud.classList.add('is-visible');
        } else {
          hud.classList.remove('is-visible');
        }
      }
    }, { rootMargin: '-45% 0px -45% 0px', threshold: 0 });
    tracked.forEach(function (t) {
      var el = document.getElementById(t.id);
      if (el) sectionIO.observe(el);
    });
  }

  /* ---------- pull quote: words for the staggered reveal ---------- */
  var quote = document.getElementById('quote');
  if (quote && !reduceMotion) {
    var qp = quote.querySelector('p');
    var qwords = qp.textContent.trim().split(/\s+/);
    qp.textContent = '';
    qwords.forEach(function (w, i) {
      var span = document.createElement('span');
      span.className = 'w';
      span.style.setProperty('--i', i);
      span.textContent = w;
      qp.appendChild(span);
      if (i < qwords.length - 1) qp.appendChild(document.createTextNode(' '));
    });
  }

  /* ---------- method numerals count in ---------- */
  function countSteps() {
    Array.prototype.forEach.call(document.querySelectorAll('.step__num[data-count]'), function (el, i) {
      var target = parseInt(el.getAttribute('data-count'), 10);
      var start = null;
      var dur = 700;
      function frame(now) {
        if (start === null) start = now;
        var t = Math.min((now - start) / dur, 1);
        var eased = 1 - Math.pow(1 - t, 3);
        var v = Math.round(eased * target);
        el.textContent = (v < 10 ? '0' : '') + v;
        if (t < 1) requestAnimationFrame(frame);
      }
      setTimeout(function () { requestAnimationFrame(frame); }, 200 + i * 160);
    });
  }

  /* ---------- scroll reveals ---------- */
  var revealTargets = Array.prototype.slice.call(
    document.querySelectorAll('.reveal, .steps, .quote, .coach__figure')
  );
  if (reduceMotion || !('IntersectionObserver' in window)) {
    revealTargets.forEach(function (el) { el.classList.add('in'); });
  } else {
    var revealIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          if (entry.target.classList.contains('steps')) countSteps();
          revealIO.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.1 });

    revealTargets.forEach(function (el) {
      var rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight * 0.92 && rect.bottom > 0) {
        // Already on screen at load: show it at rest rather than animating in.
        el.classList.add('no-anim', 'in');
        requestAnimationFrame(function () {
          requestAnimationFrame(function () { el.classList.remove('no-anim'); });
        });
      } else {
        revealIO.observe(el);
      }
    });
  }

  /* ---------- growth rings behind the logotype ---------- */
  var canvas = document.getElementById('rings');
  if (canvas && canvas.getContext && hero) {
    var ctx = canvas.getContext('2d');
    var W = 0, H = 0, dpr = 1;
    var t = 0, last = 0, running = false, visible = true, raf = null;
    var pointer = { x: 0, y: 0 }, drift = { x: 0, y: 0 };

    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = hero.clientWidth; H = hero.clientHeight;
      canvas.width = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      draw();
    }

    function draw() {
      var narrow = W < 720;
      var cx = W * 0.5 + drift.x;
      var cy = H * 0.47 + drift.y;
      ctx.clearRect(0, 0, W, H);

      var glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.max(W, H) * 0.5);
      glow.addColorStop(0, 'rgba(47, 74, 58, 0.30)');
      glow.addColorStop(0.5, 'rgba(47, 74, 58, 0.08)');
      glow.addColorStop(1, 'rgba(47, 74, 58, 0)');
      ctx.fillStyle = glow;
      ctx.fillRect(0, 0, W, H);

      var maxR = Math.hypot(W, H) * 0.62;
      var N = narrow ? 30 : 44;
      for (var i = 0; i < N; i++) {
        var base = 70 + i * 18 + i * i * 0.5;
        if (base > maxR) break;
        var brass = (i % 7 === 3);
        var alpha = brass ? 0.16 : 0.04 + 0.10 * (1 - i / N);
        ctx.strokeStyle = brass ? 'rgba(185, 154, 94, ' + alpha + ')' : 'rgba(141, 164, 142, ' + alpha + ')';
        ctx.lineWidth = brass ? 1 : 0.8;
        ctx.beginPath();
        var steps = 140 + i * 6;
        for (var s = 0; s <= steps; s++) {
          var a = (s / steps) * Math.PI * 2;
          var wobble = 1
            + 0.026 * Math.sin(3 * a + i * 0.9 + t * 0.35)
            + 0.015 * Math.sin(7 * a - i * 0.4 - t * 0.22)
            + 0.008 * Math.sin(13 * a + i * 1.7 + t * 0.5);
          var r = base * wobble;
          var x = cx + Math.cos(a) * r;
          var y = cy + Math.sin(a) * r;
          if (s === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.stroke();
      }
    }

    function frame(now) {
      raf = null;
      if (!running) return;
      var dt = last ? Math.min((now - last) / 1000, 0.1) : 0;
      last = now;
      t += dt;
      drift.x += (pointer.x - drift.x) * 0.04;
      drift.y += (pointer.y - drift.y) * 0.04;
      draw();
      raf = requestAnimationFrame(frame);
    }
    function start() {
      if (reduceMotion || running || !visible || document.hidden) return;
      running = true; last = 0;
      raf = requestAnimationFrame(frame);
    }
    function stop() {
      running = false;
      if (raf) { cancelAnimationFrame(raf); raf = null; }
    }

    var resizeTimer;
    window.addEventListener('resize', function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(resize, 120);
    });
    if (canHover) {
      hero.addEventListener('pointermove', function (e) {
        var r = hero.getBoundingClientRect();
        pointer.x = ((e.clientX - r.left) / r.width - 0.5) * -34;
        pointer.y = ((e.clientY - r.top) / r.height - 0.5) * -22;
      });
      hero.addEventListener('pointerleave', function () { pointer.x = 0; pointer.y = 0; });
    }
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) {
        visible = entries[0].isIntersecting;
        if (visible) start(); else stop();
      }, { threshold: 0.02 }).observe(hero);
    }
    document.addEventListener('visibilitychange', function () {
      if (document.hidden) stop(); else start();
    });

    resize();
    start();
  }

  /* ---------- live London clock in the hero corner ---------- */
  var clock = document.getElementById('clock');
  if (clock && window.Intl && Intl.DateTimeFormat) {
    try {
      var fmt = new Intl.DateTimeFormat('en-GB', {
        timeZone: 'Europe/London', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false
      });
      var tick = function () { clock.textContent = fmt.format(new Date()); };
      tick();
      setInterval(tick, 1000);
    } catch (e) { clock.textContent = ''; }
  }

  /* ---------- magnetic buttons, pointer devices only ---------- */
  if (canHover && !reduceMotion) {
    Array.prototype.forEach.call(document.querySelectorAll('.btn'), function (btn) {
      btn.addEventListener('pointermove', function (e) {
        var r = btn.getBoundingClientRect();
        var dx = (e.clientX - (r.left + r.width / 2)) / r.width;
        var dy = (e.clientY - (r.top + r.height / 2)) / r.height;
        btn.style.transform = 'translate(' + (dx * 8).toFixed(1) + 'px, ' + (dy * 6).toFixed(1) + 'px)';
      });
      btn.addEventListener('pointerleave', function () { btn.style.transform = ''; });
    });
  }

  /* ---------- consultation form ---------- */
  var form = document.querySelector('.form');
  if (form) {
    var note = document.getElementById('form-note');
    var submit = document.getElementById('submit');
    var fallback = 'That didn\'t send. Email Saran directly at <a href="mailto:Saran.Kalsi@equinox.com">Saran.Kalsi@equinox.com</a>.';
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!form.checkValidity()) {
        note.textContent = 'Please add your name, an email address and a few words about your goal.';
        var firstInvalid = form.querySelector(':invalid');
        if (firstInvalid) firstInvalid.focus();
        return;
      }
      submit.disabled = true;
      note.textContent = 'Sending…';
      var body = new URLSearchParams(new FormData(form)).toString();
      fetch(form.getAttribute('action') || '/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: body
      }).then(function (res) {
        if (!res.ok) throw new Error('HTTP ' + res.status);
        form.classList.add('is-sent');
        note.textContent = 'Thanks. Your message has been sent.';
      }).catch(function () {
        submit.disabled = false;
        note.innerHTML = fallback;
      });
    });
  }

  /* ---------- footer year ---------- */
  var year = document.getElementById('year');
  if (year) year.textContent = String(new Date().getFullYear());
})();
