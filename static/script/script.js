/* ==========================================================
   LANGUAGE SWITCHER
   ========================================================== */
let currentLanguage = 'en';

window.switchLanguage = function(lang) {
  currentLanguage = lang;
  document.querySelectorAll('[data-en]').forEach(el => {
    const text = el.getAttribute(lang === 'fr' ? 'data-fr' : 'data-en');
    if (!text) return;
    // If element has child elements, update only direct text nodes
    if (el.children.length > 0) {
      const textNodes = [...el.childNodes].filter(n => n.nodeType === Node.TEXT_NODE);
      if (textNodes.length) textNodes[0].textContent = text;
    } else {
      el.textContent = text;
    }
  });
};

/* ==========================================================
   MOBILE MENU
   ========================================================== */
window.toggleMobileMenu = function() {
  const links = document.getElementById('nav-links');
  const btn = document.getElementById('hamburger');
  links.classList.toggle('open');
  btn.classList.toggle('open');
};

document.addEventListener('DOMContentLoaded', () => {
  // Close mobile menu on link click
  document.querySelectorAll('.nav-links a').forEach(a => {
    a.addEventListener('click', () => {
      document.getElementById('nav-links').classList.remove('open');
      document.getElementById('hamburger').classList.remove('open');
    });
  });

  /* ========================================================
     HEADER SCROLL STATE
     ======================================================== */
  const header = document.getElementById('site-header');
  window.addEventListener('scroll', () => {
    header.classList.toggle('scrolled', window.scrollY > 30);
  }, { passive: true });

  /* ========================================================
     HERO CANVAS — ANIMATED GRID / NEURAL DOT FIELD
     ======================================================== */
  const canvas = document.getElementById('hero-canvas');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    let W, H, dots, mouse = { x: -9999, y: -9999 };
    const DOT_COUNT = 120;
    const MAX_DIST = 140;
    const CYAN = '0,212,255';
    const GOLD = '240,165,0';

    function resize() {
      W = canvas.width = canvas.offsetWidth;
      H = canvas.height = canvas.offsetHeight;
      initDots();
    }

    function initDots() {
      dots = Array.from({ length: DOT_COUNT }, () => ({
        x: Math.random() * W,
        y: Math.random() * H,
        vx: (Math.random() - .5) * .4,
        vy: (Math.random() - .5) * .4,
        r: Math.random() * 1.5 + .5,
      }));
    }

    function draw() {
      ctx.clearRect(0, 0, W, H);

      // Move dots
      dots.forEach(d => {
        d.x += d.vx;
        d.y += d.vy;
        if (d.x < 0 || d.x > W) d.vx *= -1;
        if (d.y < 0 || d.y > H) d.vy *= -1;
      });

      // Draw connections
      for (let i = 0; i < dots.length; i++) {
        for (let j = i + 1; j < dots.length; j++) {
          const dx = dots[i].x - dots[j].x;
          const dy = dots[i].y - dots[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < MAX_DIST) {
            const alpha = (1 - dist / MAX_DIST) * 0.18;
            ctx.beginPath();
            ctx.moveTo(dots[i].x, dots[i].y);
            ctx.lineTo(dots[j].x, dots[j].y);
            ctx.strokeStyle = `rgba(${CYAN},${alpha})`;
            ctx.lineWidth = .8;
            ctx.stroke();
          }
        }
      }

      // Draw dots (glow near mouse)
      dots.forEach(d => {
        const mx = d.x - mouse.x;
        const my = d.y - mouse.y;
        const md = Math.sqrt(mx * mx + my * my);
        const near = md < 180;
        const alpha = near ? .9 : .4;
        const color = near ? GOLD : CYAN;
        ctx.beginPath();
        ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${color},${alpha})`;
        ctx.fill();
      });

      requestAnimationFrame(draw);
    }

    canvas.addEventListener('mousemove', e => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
    });
    canvas.addEventListener('mouseleave', () => { mouse.x = -9999; mouse.y = -9999; });

    window.addEventListener('resize', resize);
    resize();
    draw();
  }

  /* ========================================================
     SCROLL REVEAL
     ======================================================== */
  const revealObs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        // Animate bar-fills when they come into view
        entry.target.querySelectorAll('.bar-fill').forEach(bar => {
          bar.style.width = bar.getAttribute('data-width') || bar.style.width;
        });
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  document.querySelectorAll('.reveal').forEach(el => revealObs.observe(el));

  // Store bar-fill widths as data attribute before zeroing them
  document.querySelectorAll('.bar-fill').forEach(bar => {
    bar.setAttribute('data-width', bar.style.width);
    bar.style.width = '0';
  });

  /* ========================================================
     SMOOTH SCROLLING
     ======================================================== */
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const target = document.querySelector(a.getAttribute('href'));
      if (target) {
        e.preventDefault();
        const offset = 80;
        const top = target.getBoundingClientRect().top + window.pageYOffset - offset;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  });

  /* ========================================================
     ACTIVE NAV HIGHLIGHT
     ======================================================== */
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-links a');

  const activeObs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        navLinks.forEach(a => a.classList.remove('active'));
        const link = document.querySelector(`.nav-links a[href="#${entry.target.id}"]`);
        if (link) link.classList.add('active');
      }
    });
  }, { rootMargin: '-40% 0px -55% 0px' });

  sections.forEach(s => activeObs.observe(s));

  /* ========================================================
     HERO TITLE FADE-IN STAGGER
     ======================================================== */
  const heroEls = document.querySelectorAll(
    '.hero-eyebrow, .hero-name, .hero-bio, .hero-cta, .hero-stats'
  );
  heroEls.forEach((el, i) => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(24px)';
    el.style.transition = `opacity .8s ease ${i * 0.12}s, transform .8s ease ${i * 0.12}s`;
    setTimeout(() => {
      el.style.opacity = '1';
      el.style.transform = 'translateY(0)';
    }, 100);
  });
});