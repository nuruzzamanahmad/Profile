(function () {
    var body = document.body;
    var header = document.querySelector('.header');
    var themeBtn = document.querySelector('.btn-theme');
    var navLinks = Array.prototype.slice.call(document.querySelectorAll('.nav-link'));
    var sections = navLinks.map(function (l) { return document.querySelector(l.getAttribute('href')); });

    function store(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
    function load(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }

    function applyTheme(mode) {
        var light = mode === 'light';
        body.classList.toggle('light-mode', light);
        themeBtn.textContent = light ? 'Dark Mode' : 'Light Mode';
        themeBtn.setAttribute('aria-pressed', light);
    }

    var saved = load('theme');
    applyTheme(saved || 'dark');

    themeBtn.addEventListener('click', function () {
        var next = body.classList.contains('light-mode') ? 'dark' : 'light';
        applyTheme(next);
        store('theme', next);
    });

    var progress = document.createElement('div');
    progress.className = 'progress-bar';
    body.appendChild(progress);

    var toTop = document.createElement('button');
    toTop.className = 'to-top';
    toTop.setAttribute('aria-label', 'Top');
    toTop.innerHTML = '&uarr;';
    body.appendChild(toTop);
    toTop.addEventListener('click', function () {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    var lastY = 0;
    function onScroll() {
        var y = window.scrollY || document.documentElement.scrollTop;
        var max = document.documentElement.scrollHeight - window.innerHeight;
        progress.style.width = (max > 0 ? (y / max) * 100 : 0) + '%';
        header.classList.toggle('scrolled', y > 10);
        header.classList.toggle('hide', y > lastY && y > 300 && window.innerWidth > 768);
        lastY = y;
        toTop.classList.toggle('show', y > 400);

        var current = 0;
        sections.forEach(function (sec, i) {
            if (sec && sec.getBoundingClientRect().top <= window.innerHeight * 0.35) current = i;
        });
        if (max > 0 && y >= max - 5) current = sections.length - 1;
        navLinks.forEach(function (l, i) { l.classList.toggle('active', i === current); });
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    onScroll();

    function goTo(id) {
        var el = document.querySelector(id);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    document.querySelectorAll('a[href^="#"]').forEach(function (a) {
        a.addEventListener('click', function (e) {
            var id = a.getAttribute('href');
            if (id.length > 1 && document.querySelector(id)) {
                e.preventDefault();
                goTo(id);
                history.replaceState(null, '', id);
            }
        });
    });

    document.querySelector('.btn-primary').addEventListener('click', function () { goTo('#portfolio'); });
    document.querySelector('.btn-outline').addEventListener('click', function () { goTo('#contact'); });

    var revealTargets = document.querySelectorAll('.hero-title, .hero-desc, .btn-group, .about-img, .about-content, .hobbies-content, .hobbies-item, .section-title, .portfolio-card, .contact-left, .contact-box, .contact-right, .footer-container');
    var io = 'IntersectionObserver' in window ? new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
            if (en.isIntersecting) {
                en.target.classList.add('visible');
                io.unobserve(en.target);
            }
        });
    }, { threshold: 0.12 }) : null;
    revealTargets.forEach(function (el, i) {
        el.classList.add('reveal');
        el.style.transitionDelay = ((i % 3) * 0.1) + 's';
        if (io) io.observe(el); else el.classList.add('visible');
    });

    var heroHighlight = document.querySelector('.text-highlight');
    if (heroHighlight) {
        var words = ['Future', 'Web', 'Interface', 'Intelligence'];
        var wi = 0, ci = words[0].length, deleting = true;
        (function tick() {
            var w = words[wi];
            if (deleting) {
                ci--;
                if (ci <= 0) { deleting = false; wi = (wi + 1) % words.length; ci = 0; }
            } else {
                ci++;
                if (ci >= words[wi].length) { deleting = true; heroHighlight.textContent = words[wi]; return setTimeout(tick, 2200); }
            }
            heroHighlight.textContent = words[wi].slice(0, ci) || ' ';
            setTimeout(tick, deleting ? 60 : 110);
        })();
    }

    var modal = document.createElement('div');
    modal.className = 'modal';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.innerHTML = '<div class="modal-box"><button class="modal-close" aria-label="Close">&times;</button><img alt=""><div class="modal-body"><h3></h3><p></p><div class="portfolio-tags"></div></div></div>';
    body.appendChild(modal);
    var mImg = modal.querySelector('img');
    var mTitle = modal.querySelector('h3');
    var mDesc = modal.querySelector('p');
    var mTags = modal.querySelector('.portfolio-tags');
    var lastFocus = null;

    function openModal(card) {
        lastFocus = document.activeElement;
        var img = card.querySelector('.portfolio-img');
        mImg.src = img.getAttribute('src');
        mImg.alt = img.alt;
        mTitle.textContent = card.querySelector('.portfolio-title').textContent;
        mDesc.textContent = card.querySelector('.portfolio-desc').textContent;
        mTags.innerHTML = card.querySelector('.portfolio-tags').innerHTML;
        modal.classList.add('open');
        body.style.overflow = 'hidden';
        modal.querySelector('.modal-close').focus();
    }
    function closeModal() {
        modal.classList.remove('open');
        body.style.overflow = '';
        if (lastFocus) lastFocus.focus();
    }
    document.querySelectorAll('.portfolio-card .btn-link').forEach(function (b) {
        b.addEventListener('click', function (e) {
            e.preventDefault();
            e.stopPropagation();
            openModal(b.closest('.portfolio-card'));
        });
    });
    modal.addEventListener('click', function (e) {
        if (e.target === modal || e.target.classList.contains('modal-close')) closeModal();
    });
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && modal.classList.contains('open')) closeModal();
    });

    var toast = document.createElement('div');
    toast.className = 'toast';
    toast.setAttribute('role', 'status');
    body.appendChild(toast);
    var toastTimer;
    function showToast(msg) {
        toast.textContent = msg;
        toast.classList.add('show');
        clearTimeout(toastTimer);
        toastTimer = setTimeout(function () { toast.classList.remove('show'); }, 3200);
    }

    var form = document.querySelector('.contact-form');
    var fields = {
        nama: { el: document.getElementById('nama'), check: function (v) { return v.length >= 2 ? '' : 'Nama minimal 2 karakter'; } },
        email: { el: document.getElementById('email'), check: function (v) { return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v) ? '' : 'Format email tidak valid'; } },
        message: { el: document.getElementById('message'), check: function (v) { return v.length >= 10 ? '' : 'Pesan minimal 10 karakter'; } }
    };

    function validate(key) {
        var f = fields[key];
        var msg = f.check(f.el.value.trim());
        var err = f.el.parentNode.querySelector('.field-error');
        if (!err) {
            err = document.createElement('small');
            err.className = 'field-error';
            f.el.parentNode.appendChild(err);
        }
        err.textContent = msg;
        f.el.classList.toggle('invalid', !!msg);
        f.el.setAttribute('aria-invalid', !!msg);
        return !msg;
    }

    Object.keys(fields).forEach(function (k) {
        fields[k].el.addEventListener('blur', function () { validate(k); });
        fields[k].el.addEventListener('input', function () {
            if (fields[k].el.classList.contains('invalid')) validate(k);
        });
    });

    form.addEventListener('submit', function (e) {
        e.preventDefault();
        var ok = true, first = null;
        Object.keys(fields).forEach(function (k) {
            if (!validate(k)) { ok = false; if (!first) first = fields[k].el; }
        });
        if (!ok) { first.focus(); return; }
        var btn = form.querySelector('.btn-submit');
        var label = btn.textContent;
        btn.disabled = true;
        btn.textContent = 'Sending...';
        setTimeout(function () {
            form.reset();
            btn.disabled = false;
            btn.textContent = label;
            showToast('Pesan berhasil terkirim!');
        }, 900);
    });
})();
