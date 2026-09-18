/*!
    Hassan Al-Hayawi — Personal Portfolio
    https://github.com/Hassan9001/Hassan9001.github.io

    Interaction layer: theme, navigation, active-section tracking, scroll reveal.
    Vanilla JS, no dependencies.
*/

(function () {
    'use strict';

    var root = document.documentElement;

    /* ---------- Theme ---------- */

    var themeToggle = document.getElementById('theme-toggle');

    function currentTheme() {
        var set = root.getAttribute('data-theme');
        if (set === 'light' || set === 'dark') return set;
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }

    function syncThemeLabel() {
        if (!themeToggle) return;
        var next = currentTheme() === 'dark' ? 'light' : 'dark';
        themeToggle.setAttribute('aria-label', 'Switch to ' + next + ' theme');
    }

    if (themeToggle) {
        themeToggle.addEventListener('click', function () {
            var next = currentTheme() === 'dark' ? 'light' : 'dark';
            root.setAttribute('data-theme', next);
            try { localStorage.setItem('theme', next); } catch (e) {}
            syncThemeLabel();
        });
        syncThemeLabel();
    }

    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', syncThemeLabel);

    /* ---------- Mobile navigation ---------- */

    var navToggle = document.getElementById('nav-toggle');
    var navList = document.getElementById('nav-list');
    // The open menu covers the page, so everything behind it is taken out of the
    // tab order and the accessibility tree rather than left reachable but hidden.
    var behindNav = [document.getElementById('main'), document.querySelector('.site-footer')]
        .filter(Boolean);

    function setNavOpen(open) {
        if (!navList || !navToggle) return;
        navList.classList.toggle('is-open', open);
        navToggle.setAttribute('aria-expanded', String(open));
        navToggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
        document.body.classList.toggle('is-locked', open);
        behindNav.forEach(function (el) { el.inert = open; });
    }

    function closeNav() { setNavOpen(false); }

    if (navToggle && navList) {
        navToggle.addEventListener('click', function () {
            setNavOpen(!navList.classList.contains('is-open'));
        });

        navList.addEventListener('click', function (e) {
            if (e.target.closest('a')) closeNav();
        });

        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape' && navList.classList.contains('is-open')) {
                closeNav();
                navToggle.focus();
            }
        });

        window.addEventListener('resize', function () {
            if (window.innerWidth > 940) closeNav();
        });
    }

    /* ---------- Header: shadow at the top edge, hide on scroll down ---------- */

    var header = document.getElementById('site-header');

    if (header) {
        var lastY = window.scrollY;
        var ticking = false;

        var onScroll = function () {
            var y = window.scrollY;

            header.classList.toggle('is-stuck', y > 8);

            var menuOpen = navList && navList.classList.contains('is-open');
            if (!menuOpen && y > 200 && y > lastY + 6) {
                header.classList.add('is-hidden');
            } else if (y < lastY - 6 || y <= 200) {
                header.classList.remove('is-hidden');
            }

            lastY = y;
            ticking = false;
        };

        window.addEventListener('scroll', function () {
            if (!ticking) {
                ticking = true;
                window.requestAnimationFrame(onScroll);
            }
        }, { passive: true });

        onScroll();
    }

    /* ---------- Active section in the nav ---------- */

    var links = Array.prototype.slice.call(document.querySelectorAll('.nav__link'));
    var sections = links
        .map(function (a) { return document.querySelector(a.getAttribute('href')); })
        .filter(Boolean);

    if ('IntersectionObserver' in window && sections.length) {
        var visible = new Set();

        var spy = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) visible.add(entry.target.id);
                else visible.delete(entry.target.id);
            });

            var active = null;
            for (var i = 0; i < sections.length; i++) {
                if (visible.has(sections[i].id)) { active = sections[i].id; break; }
            }

            links.forEach(function (a) {
                if (active && a.getAttribute('href') === '#' + active) {
                    a.setAttribute('aria-current', 'true');
                } else {
                    a.removeAttribute('aria-current');
                }
            });
        }, { rootMargin: '-25% 0px -60% 0px', threshold: 0 });

        sections.forEach(function (s) { spy.observe(s); });
    }

    /* ---------- Scroll reveal ---------- */

    var revealables = document.querySelectorAll('.reveal');

    if (root.classList.contains('js-reveal')) {
        var revealer = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (!entry.isIntersecting) return;
                entry.target.classList.add('is-visible');
                revealer.unobserve(entry.target);
            });
        }, { rootMargin: '0px 0px -8% 0px', threshold: 0.04 });

        revealables.forEach(function (el) { revealer.observe(el); });
    }
    // Otherwise the head script left .js-reveal off and the sections are already visible.

    /* ---------- Footer year ---------- */

    var year = document.getElementById('year');
    if (year) year.textContent = String(new Date().getFullYear());

})();
