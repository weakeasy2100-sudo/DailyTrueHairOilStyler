/* ══════════════════════════════════════════
   DAILYTRUE — script.js  (fixed)
══════════════════════════════════════════ */

(function () {
    'use strict';

    /* ── HEADER: scroll shadow ── */
    const header = document.getElementById('mainHeader');
    const onScroll = () => {
        header.classList.toggle('scrolled', window.scrollY > 40);
    };
    window.addEventListener('scroll', onScroll, { passive: true });

    /* ── MOBILE MENU ── */
    const hamburger   = document.getElementById('hamburger');
    const mobileMenu  = document.getElementById('mobileMenu');
    const mobileLinks = document.querySelectorAll('.mobile-link, .mobile-cta');

    const openMenu  = () => {
        hamburger.classList.add('open');
        mobileMenu.classList.add('open');
        document.body.style.overflow = 'hidden';
    };
    const closeMenu = () => {
        hamburger.classList.remove('open');
        mobileMenu.classList.remove('open');
        document.body.style.overflow = '';
    };
    const toggleMenu = () => mobileMenu.classList.contains('open') ? closeMenu() : openMenu();

    hamburger.addEventListener('click', toggleMenu);
    mobileLinks.forEach(link => link.addEventListener('click', closeMenu));
    document.addEventListener('keydown', e => { if (e.key === 'Escape') closeMenu(); });

    /* ── SCROLL REVEAL ── */
    // FIX #2: inside-row 有自己的 translateX 进场动画，不能混入 reveal（translateY）
    // 因此分开两个 observer：一个处理通用 .reveal，一个专门处理 .inside-row

    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                const siblings = Array.from(entry.target.parentElement.children);
                const idx = siblings.indexOf(entry.target);
                entry.target.style.transitionDelay = `${idx * 0.1}s`;
                entry.target.classList.add('in-view');
                revealObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.15 });

    // inside-row 专属 observer（不加 .reveal class，避免动画冲突）
    const insideRowObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                const siblings = Array.from(entry.target.parentElement.children);
                const idx = siblings.indexOf(entry.target);
                entry.target.style.transitionDelay = `${idx * 0.12}s`;
                entry.target.classList.add('in-view');
                insideRowObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.15 });

    document.querySelectorAll('.inside-row').forEach(el => insideRowObserver.observe(el));

    /* ── REASONS: add reveal class ── */
    document.querySelectorAll('.reasons-cell--title, .reasons-cell').forEach(el => {
        el.classList.add('reveal');
        revealObserver.observe(el);
    });

    /* ── INNO CARDS: reveal ── */
    document.querySelectorAll('.inno-card, .innovation-left').forEach(el => {
        el.classList.add('reveal');
        revealObserver.observe(el);
    });

    /* ── ABOUT: reveal ── */
    document.querySelectorAll('.about-left, .about-right').forEach(el => {
        el.classList.add('reveal');
        revealObserver.observe(el);
    });

    /* ── HOW TO USE: steps reveal ── */
    document.querySelectorAll('.step').forEach(el => {
        el.classList.add('reveal');
        revealObserver.observe(el);
    });

    /* ── TICKER: pause on hover ── */
    const ticker     = document.querySelector('.ticker');
    const tickerWrap = document.querySelector('.ticker-wrap');
    if (ticker && tickerWrap) {
        tickerWrap.addEventListener('mouseenter', () => { ticker.style.animationPlayState = 'paused'; });
        tickerWrap.addEventListener('mouseleave', () => { ticker.style.animationPlayState = 'running'; });
    }

    /* ── HERO IMAGE: parallax on scroll ── */
    const heroImg = document.querySelector('.hero-img-col img');
    if (heroImg && window.matchMedia('(min-width: 900px)').matches) {
        window.addEventListener('scroll', () => {
            const y = window.scrollY;
            heroImg.style.transform = `scale(1) translateY(${y * 0.08}px)`;
        }, { passive: true });
    }

    /* ── EMAIL FORM VALIDATION ── */
    const form       = document.getElementById('subscribeForm');
    const emailInput = document.getElementById('emailInput');
    const formError  = document.getElementById('formError');

    const formSuccess = document.createElement('p');
    formSuccess.className = 'form-success';
    formSuccess.textContent = '✓ You\'re on the list. We\'ll reach out from Lund.';
    form.insertAdjacentElement('afterend', formSuccess);

    const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim());

    const showError = (msg) => {
        formError.textContent = msg;
        emailInput.style.borderColor = 'rgba(196,64,90,0.6)';
    };
    const clearError = () => {
        formError.textContent = '';
        emailInput.style.borderColor = '';
    };

    emailInput.addEventListener('input', clearError);

    const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbytY92l7ye-yemhsGIvLVu8T4HuQ234ErD_RB7Sxv928WBllizZZ5Nskx70BCGgxqIz/exec';

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        clearError();

        const email = emailInput.value.trim();

        if (!email) {
            showError('Please enter your email address.');
            emailInput.focus();
            return;
        }
        if (!isValidEmail(email)) {
            showError('Please enter a valid email address.');
            emailInput.focus();
            return;
        }

        const submitBtn = form.querySelector('button[type="submit"]');
        const originalBtnText = submitBtn.textContent;
        submitBtn.textContent = 'Sending…';
        submitBtn.disabled = true;

        try {
            await fetch(GOOGLE_SCRIPT_URL, {
                method: 'POST',
                mode: 'no-cors',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });

            form.style.display = 'none';
            formSuccess.classList.add('show');

            setTimeout(() => {
                form.style.removeProperty('display');
                formSuccess.classList.remove('show');
                emailInput.value = '';
            }, 6000);

        } catch (err) {
            showError('Something went wrong. Please try again.');
        } finally {
            submitBtn.textContent = originalBtnText;
            submitBtn.disabled = false;
        }
    });

    /* ── SMOOTH ANCHOR SCROLL with header offset ──
       FIX #7: CSS 里已移除 scroll-behavior: smooth，由此处统一处理，避免 Firefox 双重缓动 */
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', (e) => {
            const target = document.querySelector(anchor.getAttribute('href'));
            if (!target) return;
            e.preventDefault();
            const offset = header.offsetHeight + 20;
            const top = target.getBoundingClientRect().top + window.scrollY - offset;
            window.scrollTo({ top, behavior: 'smooth' });
        });
    });

    /* ── STEP NUMBERS: hover active state ── */
    document.querySelectorAll('.step').forEach(step => {
        step.addEventListener('mouseenter', () => {
            step.querySelector('.step-num').style.opacity = '1';
        });
        step.addEventListener('mouseleave', () => {
            step.querySelector('.step-num').style.opacity = '';
        });
    });

    /* ── CTA GLOW: mouse parallax ── */
    const ctaSection = document.querySelector('.cta');
    if (ctaSection) {
        ctaSection.addEventListener('mousemove', (e) => {
            const rect = ctaSection.getBoundingClientRect();
            const x = ((e.clientX - rect.left) / rect.width  - 0.5) * 30;
            const y = ((e.clientY - rect.top)  / rect.height - 0.5) * 20;
            ctaSection.style.backgroundPosition = `${50 + x * 0.3}% ${50 + y * 0.3}%`;
        });
    }

    /* ── REASONS CELLS: cursor dot ── */
    const reasonCells = document.querySelectorAll('.reasons-cell');
    reasonCells.forEach(cell => {
        const dot = document.createElement('div');
        dot.style.cssText = `
            position: absolute; width: 10px; height: 10px;
            border-radius: 50%; background: rgba(255,255,255,0.6);
            pointer-events: none; z-index: 10; opacity: 0;
            transform: translate(-50%, -50%);
            transition: opacity 0.2s;
        `;
        cell.style.position = 'relative';
        cell.appendChild(dot);

        cell.addEventListener('mouseenter', () => { dot.style.opacity = '1'; });
        cell.addEventListener('mouseleave', () => { dot.style.opacity = '0'; });
        cell.addEventListener('mousemove', (e) => {
            const rect = cell.getBoundingClientRect();
            dot.style.left = (e.clientX - rect.left) + 'px';
            dot.style.top  = (e.clientY - rect.top)  + 'px';
        });
    });

})();
