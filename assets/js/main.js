/* ============================================================
   LinuxDrive — shared scripts
   ============================================================ */
(function () {
  'use strict';

  /* ---------- header scroll state ---------- */
  var header = document.getElementById('site-header');
  function onScroll() {
    if (!header) return;
    header.classList.toggle('scrolled', window.scrollY > 12);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- mobile menu ---------- */
  var burger = document.getElementById('burger');
  var menu = document.getElementById('mobile-menu');
  if (burger && menu) {
    burger.addEventListener('click', function () {
      var open = menu.classList.toggle('open');
      burger.setAttribute('aria-expanded', open ? 'true' : 'false');
      var icon = burger.querySelector('i');
      if (icon) icon.className = open ? 'fa-solid fa-xmark' : 'fa-solid fa-bars';
    });
    menu.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () {
        menu.classList.remove('open');
        burger.setAttribute('aria-expanded', 'false');
        var icon = burger.querySelector('i');
        if (icon) icon.className = 'fa-solid fa-bars';
      });
    });
  }

  /* ---------- scroll reveal ---------- */
  var revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && revealEls.length) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add('is-visible');
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    revealEls.forEach(function (el, i) {
      el.style.transitionDelay = (Math.min(i % 4, 3) * 90) + 'ms';
      io.observe(el);
    });
  } else {
    revealEls.forEach(function (el) { el.classList.add('is-visible'); });
  }

  /* ---------- animated Ventoy boot menu (hero) ---------- */
  var termList = document.getElementById('term-list');
  if (termList) {
    var items = Array.prototype.slice.call(termList.querySelectorAll('.term-item'));
    var current = 0;
    var STEP_MS = 1100;

    function select(idx) {
      items.forEach(function (it, i) { it.classList.toggle('sel', i === idx); });
      var el = items[idx];
      // keep selection visible inside fixed-height window
      var listH = termList.clientHeight;
      var elTop = el.offsetTop;
      var elBottom = elTop + el.offsetHeight;
      if (elTop < termList.scrollTop + 4) {
        termList.scrollTop = elTop - 8;
      } else if (elBottom > termList.scrollTop + listH - 4) {
        termList.scrollTop = elBottom - listH + 8;
      }
    }

    function tick() {
      current = (current + 1) % items.length;
      select(current);
      if (current === 0) {
        // "boot" flash once per full cycle
        items[items.length - 1].classList.add('booting');
        setTimeout(function () { items[items.length - 1].classList.remove('booting'); }, 550);
      }
      termTimer = setTimeout(tick, STEP_MS);
    }

    var termTimer = null;
    var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!reduce && items.length) {
      select(0);
      // start when visible
      if ('IntersectionObserver' in window) {
        var tio = new IntersectionObserver(function (entries) {
          entries.forEach(function (e) {
            if (e.isIntersecting) { if (!termTimer) termTimer = setTimeout(tick, 900); }
            else { clearTimeout(termTimer); termTimer = null; }
          });
        }, { threshold: 0.25 });
        tio.observe(termList);
      } else {
        termTimer = setTimeout(tick, 900);
      }
      // pause on hover — let the user "choose"
      termList.parentElement.addEventListener('mouseenter', function () { clearTimeout(termTimer); termTimer = null; });
      termList.parentElement.addEventListener('mouseleave', function () { if (!termTimer && !reduce) termTimer = setTimeout(tick, 600); });
    } else if (items.length) {
      select(0);
    }
  }

  /* ---------- hero typewriter ---------- */
  var tw = document.getElementById('typewriter');
  if (tw) {
    var phrases = (tw.dataset.phrases ? JSON.parse(tw.dataset.phrases) : []);
    var pi = 0, ci = 0, deleting = false;
    var reduceTw = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    function typeLoop() {
      if (!phrases.length) return;
      var full = phrases[pi];
      if (!deleting) {
        ci++;
        tw.textContent = full.slice(0, ci);
        if (ci === full.length) { deleting = true; setTimeout(typeLoop, 2200); return; }
        setTimeout(typeLoop, 42);
      } else {
        ci -= 2;
        if (ci <= 0) { ci = 0; deleting = false; pi = (pi + 1) % phrases.length; setTimeout(typeLoop, 350); return; }
        tw.textContent = full.slice(0, ci);
        setTimeout(typeLoop, 22);
      }
    }
    if (reduceTw) { tw.textContent = phrases[0] || ''; }
    else { setTimeout(typeLoop, 900); }
  }

  /* ---------- count-up stats ---------- */
  var counters = document.querySelectorAll('[data-count]');
  if (counters.length && 'IntersectionObserver' in window) {
    var cio = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        cio.unobserve(e.target);
        var el = e.target;
        var target = parseFloat(el.dataset.count);
        var dur = 1400, start = null;
        function frame(ts) {
          if (!start) start = ts;
          var p = Math.min((ts - start) / dur, 1);
          var eased = 1 - Math.pow(1 - p, 3);
          el.textContent = Math.round(target * eased).toString();
          if (p < 1) requestAnimationFrame(frame);
        }
        requestAnimationFrame(frame);
      });
    }, { threshold: 0.6 });
    counters.forEach(function (el) { cio.observe(el); });
  }

  /* ---------- vertical demo video: graceful fallback ---------- */
  var video = document.getElementById('demo-video');
  var fallback = document.getElementById('video-fallback');
  if (video && fallback) {
    function showFallback() { fallback.classList.add('show'); video.style.display = 'none'; }
    video.addEventListener('error', showFallback);
    // source-level error (no file on server yet)
    var src = video.querySelector('source');
    if (src) src.addEventListener('error', showFallback);
    // if metadata never loads within 4s, assume the file is not uploaded yet
    setTimeout(function () {
      if (video.readyState === 0 && video.networkState !== 2) showFallback();
    }, 4000);
  }

  /* ---------- current year in footer ---------- */
  document.querySelectorAll('[data-year]').forEach(function (el) {
    el.textContent = new Date().getFullYear();
  });
})();
