/* Alpha CR Solutions — Main JS */

document.addEventListener('DOMContentLoaded', () => {

  /* ── Mobile nav toggle ─────────────────────────────────────── */
  const burger = document.getElementById('nav-burger');
  const mobileNav = document.getElementById('nav-mobile');
  if (burger && mobileNav) {
    burger.addEventListener('click', () => {
      burger.classList.toggle('open');
      mobileNav.classList.toggle('open');
    });
    // Close when link clicked
    mobileNav.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => {
        burger.classList.remove('open');
        mobileNav.classList.remove('open');
      });
    });
  }

  /* ── Highlight active nav link ─────────────────────────────── */
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-menu a, .nav-mobile a').forEach(link => {
    const href = link.getAttribute('href');
    if (href && href.includes(currentPage) && currentPage !== '') {
      link.closest('li')?.classList.add('active');
      link.style.color = '#fff';
    }
  });

  /* ── Scroll-reveal: sections settle in as they enter view ──── */
  const prefersReduced = window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!prefersReduced) {
    // Only tag content that starts below the fold, so nothing above it flickers.
    const belowFold = (el) => el.getBoundingClientRect().top > window.innerHeight * 0.82;
    const stagger = ['.cards-grid-2', '.cards-grid-3', '.cards-grid-4', '.enrol-pathway', '.faq-list'];
    const items = [];
    const tag = (el, delay) => {
      if (!belowFold(el)) return;
      if (delay) el.style.transitionDelay = delay + 's';
      el.classList.add('reveal');
      items.push(el);
    };

    document.querySelectorAll('section:not(.hero):not(.hero-home) .section-inner').forEach(inner => {
      Array.from(inner.children).forEach(child => {
        if (stagger.some(sel => child.matches(sel))) {
          Array.from(child.children).forEach((card, i) => tag(card, Math.min(i * 0.07, 0.35)));
        } else {
          tag(child, 0);
        }
      });
    });

    // Reveal anything at or above the viewport — robust against anchor jumps and fast scrolls.
    const reveal = () => {
      const trigger = window.innerHeight * 0.9;
      for (let i = items.length - 1; i >= 0; i--) {
        if (items[i].getBoundingClientRect().top < trigger) {
          items[i].classList.add('revealed');
          items.splice(i, 1);
        }
      }
    };
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => { reveal(); ticking = false; });
    };
    reveal();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
  }

  /* ── Animated stat counters ────────────────────────────────── */
  const counters = document.querySelectorAll('.count-up');
  if (counters.length) {
    const counterObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const el    = entry.target;
          const target = parseInt(el.dataset.target, 10);
          const suffix = el.dataset.suffix || '';
          const duration = 1600;
          const start = performance.now();
          const animate = (now) => {
            const elapsed = now - start;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            el.textContent = Math.round(eased * target) + suffix;
            if (progress < 1) requestAnimationFrame(animate);
          };
          requestAnimationFrame(animate);
          counterObserver.unobserve(el);
        }
      });
    }, { threshold: 0.5 });
    counters.forEach(c => counterObserver.observe(c));
  }

  /* ── Nav condenses after leaving the hero ──────────────────── */
  const siteNav = document.querySelector('.site-nav');
  if (siteNav) {
    const onNavScroll = () => siteNav.classList.toggle('scrolled', window.scrollY > 36);
    onNavScroll();
    window.addEventListener('scroll', onNavScroll, { passive: true });
  }

  /* Contact form is handled by an embedded Microsoft Form (see contact.html). */
});
