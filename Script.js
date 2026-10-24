/* ============================================
   Portfolio interactions
   ============================================ */
(function () {
  'use strict';

  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Footer year */
  var year = $('#year');
  if (year) year.textContent = new Date().getFullYear();

  /* Scroll progress and navbar state */
  var bar = $('#scrollProgress');
  var nav = $('#navbar');
  function onScroll() {
    var doc = document.documentElement;
    var max = doc.scrollHeight - doc.clientHeight;
    if (bar && max > 0) bar.style.transform = 'scaleX(' + (doc.scrollTop / max) + ')';
    if (nav) nav.classList.toggle('scrolled', window.scrollY > 24);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* Mobile menu */
  var burger = $('#hamburger');
  var mobile = $('#mobileNav');
  function setMenu(open) {
    burger.classList.toggle('active', open);
    burger.setAttribute('aria-expanded', String(open));
    mobile.classList.toggle('open', open);
    document.body.style.overflow = open ? 'hidden' : '';
  }
  if (burger && mobile) {
    burger.addEventListener('click', function () { setMenu(!mobile.classList.contains('open')); });
    $$('a', mobile).forEach(function (a) { a.addEventListener('click', function () { setMenu(false); }); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') setMenu(false); });
  }

  /* Active nav link */
  var links = $$('.nav-link');
  var targets = links.map(function (l) { return $(l.getAttribute('href')); });
  function setActive() {
    var y = window.scrollY + 140;
    var current = -1;
    targets.forEach(function (t, i) { if (t && t.offsetTop <= y) current = i; });
    links.forEach(function (l, i) { l.classList.toggle('active', i === current); });
  }
  window.addEventListener('scroll', setActive, { passive: true });
  setActive();

  /* Scroll reveal */
  var reveals = $$('.reveal');
  if ('IntersectionObserver' in window && !reduceMotion) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('visible'); io.unobserve(e.target); }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });
    reveals.forEach(function (el, i) {
      el.style.transitionDelay = ((i % 3) * 70) + 'ms';
      io.observe(el);
    });
  } else {
    reveals.forEach(function (el) { el.classList.add('visible'); });
  }

  /* Stat counters */
  var counters = $$('[data-count]');
  function runCounter(el) {
    var target = parseInt(el.getAttribute('data-count'), 10);
    if (reduceMotion) { el.textContent = target; return; }
    var dur = 1400, start = performance.now();
    (function tick(now) {
      var p = Math.min((now - start) / dur, 1);
      el.textContent = Math.round((1 - Math.pow(1 - p, 3)) * target);
      if (p < 1) requestAnimationFrame(tick);
    })(start);
  }
  var statsEl = $('.stats');
  if (statsEl && 'IntersectionObserver' in window) {
    var so = new IntersectionObserver(function (entries) {
      if (entries[0].isIntersecting) { counters.forEach(runCounter); so.disconnect(); }
    }, { threshold: 0.4 });
    so.observe(statsEl);
  } else {
    counters.forEach(runCounter);
  }

  /* Project filters */
  var filters = $$('.filter');
  var cards = $$('.project');
  filters.forEach(function (btn) {
    btn.addEventListener('click', function () {
      var f = btn.getAttribute('data-filter');
      filters.forEach(function (b) { b.classList.toggle('active', b === btn); });
      cards.forEach(function (c) {
        var cats = (c.getAttribute('data-cat') || '').split(' ');
        c.classList.toggle('is-hidden', f !== 'all' && cats.indexOf(f) === -1);
        if (!c.classList.contains('is-hidden')) c.classList.add('visible');
      });
    });
  });

  /* Contact form (Formsubmit via fetch) */
  var form = $('#contactForm');
  var btn = $('#submitBtn');
  var status = $('#formStatus');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      btn.disabled = true;
      btn.textContent = 'Sending...';
      status.className = 'form-status';
      status.textContent = '';

      fetch(form.action, {
        method: 'POST',
        body: new FormData(form),
        headers: { 'Accept': 'application/json' }
      }).then(function (res) {
        if (!res.ok) throw new Error('failed');
        status.textContent = 'Message sent. I will get back to you soon.';
        status.className = 'form-status success';
        form.reset();
      }).catch(function () {
        status.textContent = 'Could not send the message. Please email me directly or try again from a hosted (non file://) page.';
        status.className = 'form-status error';
      }).finally(function () {
        btn.disabled = false;
        btn.textContent = 'Send message';
      });
    });
  }
})();
