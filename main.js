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

  /* ── Scroll-reveal (simple intersection observer) ──────────── */
  const revealEls = document.querySelectorAll('.reveal');
  if (revealEls.length) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('revealed');
          observer.unobserve(e.target);
        }
      });
    }, { threshold: 0.12 });
    revealEls.forEach(el => observer.observe(el));
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

  /* ── Contact form feedback ─────────────────────────────────── */
  const form = document.getElementById('contact-form');
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const btn = form.querySelector('.form-submit');
      const originalText = btn.textContent;
      btn.textContent = 'Sending…';
      btn.disabled = true;
      try {
        const res = await fetch(form.action, {
          method: 'POST',
          body: new FormData(form),
          headers: { 'Accept': 'application/json' }
        });
        if (res.ok) {
          form.innerHTML = `
            <div style="text-align:center;padding:48px 0;">
              <div style="width:64px;height:64px;border-radius:50%;background:var(--teal-lt);color:var(--teal);
                          display:flex;align-items:center;justify-content:center;
                          font-size:28px;margin:0 auto 20px;">
                <i class="fa-solid fa-check"></i>
              </div>
              <h3 style="color:var(--navy);margin-bottom:12px;">Message sent!</h3>
              <p style="color:var(--gray);font-size:15px;">
                Thank you for reaching out. We'll be in touch within one business day.
              </p>
            </div>`;
        } else {
          btn.textContent = 'Try again';
          btn.disabled = false;
        }
      } catch {
        btn.textContent = originalText;
        btn.disabled = false;
      }
    });
  }
});
