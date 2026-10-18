/* WeddingBellOdisha — site behaviour. Plain JS, no libraries. */
(function () {
    'use strict';

    var API = /^(localhost|127\.0\.0\.1)$/.test(location.hostname)
        ? 'http://localhost:3000/api/enquiry'
        : 'https://weddingbellodisha.vercel.app/api/enquiry';
    var $ = function (s, r) { return (r || document).querySelector(s); };
    var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

    var yr = $('#yr');
    if (yr) yr.textContent = new Date().getFullYear();

    /* ---------- Header: solid after the hero, active section link ---------- */
    var nav = $('.nav');
    var hero = $('.hero');
    var dock = $('.dock');
    var book = $('#book');
    var heroVisible = true, bookVisible = false;

    function updateDock() {
        if (dock) dock.classList.toggle('is-on', !heroVisible && !bookVisible && !document.body.classList.contains('menu-open'));
    }
    if ('IntersectionObserver' in window) {
        new IntersectionObserver(function (e) {
            heroVisible = e[0].isIntersecting;
            nav.classList.toggle('is-solid', !heroVisible);
            updateDock();
        }, { rootMargin: '-80px 0px 0px 0px' }).observe(hero);

        new IntersectionObserver(function (e) { bookVisible = e[0].isIntersecting; updateDock(); }, { threshold: 0.05 }).observe(book);

        var links = $$('.nav__links a');
        var spy = new IntersectionObserver(function (entries) {
            entries.forEach(function (en) {
                if (!en.isIntersecting) return;
                links.forEach(function (a) { a.classList.toggle('is-on', a.getAttribute('href') === '#' + en.target.id); });
            });
        }, { rootMargin: '-45% 0px -50% 0px' });
        ['work', 'services', 'about', 'process', 'faq'].forEach(function (id) { var el = document.getElementById(id); if (el) spy.observe(el); });

        /* Reveal on scroll */
        var rv = new IntersectionObserver(function (entries) {
            entries.forEach(function (en) {
                if (en.isIntersecting) { en.target.classList.add('is-in'); rv.unobserve(en.target); }
            });
        }, { rootMargin: '0px 0px -8% 0px', threshold: 0.01 });
        $$('.reveal').forEach(function (el, i) {
            // stagger siblings in grids
            var sib = el.parentElement ? Array.prototype.indexOf.call(el.parentElement.children, el) : 0;
            el.style.transitionDelay = Math.min(sib % 4, 3) * 70 + 'ms';
            rv.observe(el);
        });
    } else {
        nav.classList.add('is-solid');
        $$('.reveal').forEach(function (el) { el.classList.add('is-in'); });
    }

    /* ---------- Mobile menu ---------- */
    var burger = $('.nav__burger');
    var menu = $('#menu');
    function setMenu(open) {
        burger.setAttribute('aria-expanded', open);
        burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
        document.body.classList.toggle('menu-open', open);
        document.body.style.overflow = open ? 'hidden' : '';
        if (open) { menu.hidden = false; requestAnimationFrame(function () { menu.classList.add('is-open'); }); }
        else { menu.classList.remove('is-open'); setTimeout(function () { if (!menu.classList.contains('is-open')) menu.hidden = true; }, 300); }
        updateDock();
    }
    burger.addEventListener('click', function () { setMenu(burger.getAttribute('aria-expanded') !== 'true'); });
    $$('#menu a').forEach(function (a) { a.addEventListener('click', function () { setMenu(false); }); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && document.body.classList.contains('menu-open')) setMenu(false); });

    /* ---------- Lightbox ---------- */
    var lb = $('#lb');
    var tiles = $$('.tile');
    var lbImg = $('.lb__img', lb);
    var idx = 0;
    function show(i) {
        idx = (i + tiles.length) % tiles.length;
        var t = tiles[idx];
        lbImg.classList.add('is-loading');
        lbImg.onload = function () { lbImg.classList.remove('is-loading'); };
        lbImg.src = t.getAttribute('href');
        lbImg.alt = $('img', t).alt;
        $('.lb__count', lb).textContent = (idx + 1) + ' / ' + tiles.length;
        [1, -1].forEach(function (d) { var n = tiles[(idx + d + tiles.length) % tiles.length]; (new Image()).src = n.getAttribute('href'); });
    }
    if (lb && typeof lb.showModal === 'function') {
        tiles.forEach(function (t, i) {
            t.addEventListener('click', function (e) { e.preventDefault(); show(i); lb.showModal(); });
        });
        $('.lb__close', lb).addEventListener('click', function () { lb.close(); });
        $('.lb__prev', lb).addEventListener('click', function () { show(idx - 1); });
        $('.lb__next', lb).addEventListener('click', function () { show(idx + 1); });
        lb.addEventListener('click', function (e) { if (e.target === lb) lb.close(); });
        lb.addEventListener('keydown', function (e) {
            if (e.key === 'ArrowLeft') show(idx - 1);
            if (e.key === 'ArrowRight') show(idx + 1);
        });
        var sx = null, sy = null;
        lb.addEventListener('touchstart', function (e) { sx = e.touches[0].clientX; sy = e.touches[0].clientY; }, { passive: true });
        lb.addEventListener('touchend', function (e) {
            if (sx === null) return;
            var dx = e.changedTouches[0].clientX - sx, dy = e.changedTouches[0].clientY - sy;
            if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) show(idx + (dx < 0 ? 1 : -1));
            else if (dy > 90) lb.close();
            sx = sy = null;
        }, { passive: true });
    }

    /* ---------- Enquiry form ---------- */
    var form = $('#enquiry');
    if (!form) return;
    var done = $('.done');
    var alertBox = $('.form__alert', form);
    var startedAt = Date.now();
    form.elements.t.value = String(startedAt);

    var date = form.elements.event_date;
    var today = new Date(); today.setMinutes(today.getMinutes() - today.getTimezoneOffset());
    date.min = today.toISOString().slice(0, 10);

    // "Enquire" on a service pre-selects the event and service.
    $$('.svc__go').forEach(function (a) {
        a.addEventListener('click', function () {
            if (a.dataset.event) form.elements.event_type.value = a.dataset.event;
            if (a.dataset.service) $$('input[name="services"]', form).forEach(function (c) { if (c.value === a.dataset.service) c.checked = true; });
        });
    });

    function fieldError(name, msg) {
        var input = form.elements[name];
        var wrap = input && input.closest('.field');
        var err = $('#e-' + name);
        if (wrap) wrap.classList.toggle('is-bad', !!msg);
        if (err) err.textContent = msg || '';
        if (input) input.setAttribute('aria-invalid', msg ? 'true' : 'false');
    }
    function digits(v) { return String(v || '').replace(/\D/g, '').replace(/^(91|0)(?=\d{10}$)/, ''); }
    function validate() {
        var ok = true, first = null;
        var name = form.elements.name.value.trim();
        if (name.length < 2) { fieldError('name', 'Please enter your name.'); ok = false; first = first || 'name'; } else fieldError('name');
        if (!/^[6-9]\d{9}$/.test(digits(form.elements.phone.value))) { fieldError('phone', 'Please enter a 10-digit mobile number.'); ok = false; first = first || 'phone'; } else fieldError('phone');
        var em = form.elements.email.value.trim();
        if (em && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(em)) { fieldError('email', 'Please check your email address.'); ok = false; first = first || 'email'; } else fieldError('email');
        if (first) form.elements[first].focus();
        return ok;
    }
    ['name', 'phone', 'email'].forEach(function (n) {
        form.elements[n].addEventListener('input', function () { if (this.closest('.field').classList.contains('is-bad')) validate(); });
    });

    function showAlert(msg) {
        alertBox.innerHTML = msg + ' You can also call or WhatsApp <a href="tel:+917978325313">+91 79783 25313</a>.';
        alertBox.hidden = false;
    }
    function success(name) {
        $('.done__name', done).textContent = name ? ', ' + name.split(' ')[0] : '';
        form.hidden = true;
        done.hidden = false;
        done.focus({ preventScroll: true });
        done.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    form.addEventListener('submit', function (e) {
        e.preventDefault();
        alertBox.hidden = true;
        if (!validate() || form.classList.contains('is-busy')) return;
        form.classList.add('is-busy');
        var fd = new FormData(form);
        var body = {
            name: fd.get('name'), phone: digits(fd.get('phone')), email: fd.get('email'),
            event_type: fd.get('event_type'), event_date: fd.get('event_date'), location: fd.get('location'),
            services: fd.getAll('services'), message: fd.get('message'), website: fd.get('website'), t: startedAt, source: 'website'
        };
        var ctrl = 'AbortController' in window ? new AbortController() : null;
        var timer = setTimeout(function () { if (ctrl) ctrl.abort(); }, 20000);
        fetch(API, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body), signal: ctrl ? ctrl.signal : undefined })
            .then(function (r) { return r.json().catch(function () { return { ok: false }; }); })
            .then(function (res) {
                if (res.ok) { success(body.name); form.reset(); return; }
                if (res.field) fieldError(res.field, res.error);
                showAlert(res.error || 'Sorry, that didn’t go through.');
            })
            .catch(function () { showAlert('We couldn’t reach our studio just now. Please check your connection and try again.'); })
            .then(function () { clearTimeout(timer); form.classList.remove('is-busy'); });
    });

    $('#again').addEventListener('click', function () {
        done.hidden = true; form.hidden = false; startedAt = Date.now() - 5000; form.elements.t.value = String(startedAt);
        form.elements.name.focus();
    });

    // Without JavaScript the form posts directly and the server sends people back here with ?enquiry=sent
    var q = new URLSearchParams(location.search).get('enquiry');
    if (q === 'sent') success('');
    else if (q === 'error') showAlert('Sorry, that didn’t go through.');
    if (q) history.replaceState(null, '', location.pathname + '#book');
})();
