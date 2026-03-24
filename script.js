/* ═══════════════════════════════════════════════════════════
   TAMARIND RESTAURANT — script.js
   Coastal Luxury Minimal · Mombasa
═══════════════════════════════════════════════════════════ */

'use strict';

/* ─── Reduced Motion Check ───────────────────────────────── */
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
if (prefersReducedMotion) document.body.classList.add('reduced-motion');

/* ─── Helper: isMobile ───────────────────────────────────── */
const isMobile = () => window.innerWidth <= 768;
const isTouch  = () => window.matchMedia('(pointer: coarse)').matches;

/* ════════════════════════════════════════════════════════════
   1. CUSTOM CURSOR
════════════════════════════════════════════════════════════ */
(function initCursor() {
  if (isTouch()) return;

  const dot  = document.getElementById('cursorDot');
  const ring = document.getElementById('cursorRing');
  if (!dot || !ring) return;

  let mouseX = 0, mouseY = 0;
  let ringX  = 0, ringY  = 0;
  let rafId  = null;

  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    dot.style.left = `${mouseX}px`;
    dot.style.top  = `${mouseY}px`;

    // Also update shimmer on dish cards
    document.querySelectorAll('.dish-card:hover .dish-card__shimmer').forEach(shimmer => {
      const card = shimmer.closest('.dish-card');
      const rect = card.getBoundingClientRect();
      shimmer.style.left = `${e.clientX - rect.left}px`;
      shimmer.style.top  = `${e.clientY - rect.top}px`;
    });
  });

  // Smooth ring follow
  function animateRing() {
    ringX += (mouseX - ringX) * 0.12;
    ringY += (mouseY - ringY) * 0.12;
    ring.style.left = `${ringX}px`;
    ring.style.top  = `${ringY}px`;
    rafId = requestAnimationFrame(animateRing);
  }
  animateRing();

  // Hover state on interactive elements
  const hoverTargets = 'a, button, .dish-card, .carousel__slide, input, select, textarea, .nav__link';
  document.addEventListener('mouseover', (e) => {
    if (e.target.closest(hoverTargets)) ring.classList.add('hovering');
  });
  document.addEventListener('mouseout', (e) => {
    if (e.target.closest(hoverTargets)) ring.classList.remove('hovering');
  });

  document.addEventListener('mouseleave', () => { dot.style.opacity = '0'; ring.style.opacity = '0'; });
  document.addEventListener('mouseenter', () => { dot.style.opacity = '1'; ring.style.opacity = '0.6'; });
})();


/* ════════════════════════════════════════════════════════════
   2. NAVIGATION — transparent → frosted glass on scroll
════════════════════════════════════════════════════════════ */
(function initNav() {
  const nav = document.getElementById('mainNav');
  if (!nav) return;

  let lastY = 0;
  const THRESHOLD = 60;

  const update = () => {
    const y = window.scrollY;
    nav.classList.toggle('scrolled', y > THRESHOLD);
    lastY = y;
  };

  window.addEventListener('scroll', update, { passive: true });
  update(); // call once on load

  // ─── Mobile Drawer ───────────────────────────────────────
  const hamburger = document.getElementById('navHamburger');
  const drawer    = document.getElementById('navDrawer');
  const overlay   = document.getElementById('navOverlay');
  if (!hamburger || !drawer || !overlay) return;

  const openMenu  = () => {
    hamburger.classList.add('open');
    hamburger.setAttribute('aria-expanded', 'true');
    drawer.classList.add('open');
    drawer.setAttribute('aria-hidden', 'false');
    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
  };

  const closeMenu = () => {
    hamburger.classList.remove('open');
    hamburger.setAttribute('aria-expanded', 'false');
    drawer.classList.remove('open');
    drawer.setAttribute('aria-hidden', 'true');
    overlay.classList.remove('open');
    document.body.style.overflow = '';
  };

  hamburger.addEventListener('click', () => {
    hamburger.classList.contains('open') ? closeMenu() : openMenu();
  });
  overlay.addEventListener('click', closeMenu);
  document.querySelectorAll('.nav__drawer-link').forEach(link => link.addEventListener('click', closeMenu));

  // Keyboard: Escape closes drawer
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeMenu(); });
})();


/* ════════════════════════════════════════════════════════════
   3. HERO CANVAS — Floating SEA BUBBLES
════════════════════════════════════════════════════════════ */
(function initCanvas() {
  const canvas = document.getElementById('heroCanvas');
  if (!canvas || prefersReducedMotion) return;

  const ctx = canvas.getContext('2d');

  const resize = () => {
    canvas.width  = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
  };
  resize();
  window.addEventListener('resize', resize, { passive: true });

  // Bubble class
  class Bubble {
    constructor() { this.reset(true); }

    reset(init = false) {
      this.x     = Math.random() * canvas.width;
      this.y     = init ? Math.random() * canvas.height : canvas.height + 20;
      this.r     = Math.random() * 3.5 + 0.5;
      this.vy    = -(Math.random() * 0.4 + 0.15);
      this.vx    = (Math.random() - 0.5) * 0.3;
      this.alpha = Math.random() * 0.35 + 0.05;
      this.pulse = Math.random() * Math.PI * 2;
      this.pulseSpeed = Math.random() * 0.02 + 0.005;
    }

    update() {
      this.x    += this.vx;
      this.y    += this.vy;
      this.pulse += this.pulseSpeed;
      if (this.y < -10) this.reset();
    }

    draw() {
      const pulseAlpha = this.alpha + Math.sin(this.pulse) * 0.04;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(201,169,110,${pulseAlpha * 0.8})`;
      ctx.lineWidth   = 0.75;
      ctx.stroke();

      // Subtle fill
      const grad = ctx.createRadialGradient(this.x - this.r * 0.3, this.y - this.r * 0.3, 0, this.x, this.y, this.r);
      grad.addColorStop(0, `rgba(255,255,255,${pulseAlpha * 0.3})`);
      grad.addColorStop(1, `rgba(201,169,110,${pulseAlpha * 0.05})`);
      ctx.fillStyle = grad;
      ctx.fill();
    }
  }

  const COUNT   = isMobile() ? 35 : 80;
  const bubbles = Array.from({ length: COUNT }, () => new Bubble());

  let rafId;
  const animate = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    bubbles.forEach(b => { b.update(); b.draw(); });
    rafId = requestAnimationFrame(animate);
  };
  animate();

  // Pause when tab hidden
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) cancelAnimationFrame(rafId);
    else animate();
  });
})();


/* ════════════════════════════════════════════════════════════
   4. HERO PARALLAX — multi-layer depth on scroll
════════════════════════════════════════════════════════════ */
(function initParallax() {
  if (prefersReducedMotion || isMobile()) return;

  const layers = document.querySelectorAll('[data-depth]');
  if (!layers.length) return;

  let ticking = false;
  const update = () => {
    const y = window.scrollY;
    layers.forEach(layer => {
      const depth  = parseFloat(layer.dataset.depth) || 0.1;
      const offset = y * depth;
      layer.style.transform = `translate3d(0, ${offset}px, 0)`;
    });
    ticking = false;
  };

  window.addEventListener('scroll', () => {
    if (!ticking) { requestAnimationFrame(update); ticking = true; }
  }, { passive: true });
})();


/* ════════════════════════════════════════════════════════════
   5. SCROLL REVEAL — IntersectionObserver
════════════════════════════════════════════════════════════ */
(function initScrollReveal() {
  const targets = document.querySelectorAll('.reveal-up, .reveal-fade, .reveal-line, .reveal-char, .dish-card');
  if (!targets.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -60px 0px' });

  targets.forEach(el => observer.observe(el));
})();


/* ════════════════════════════════════════════════════════════
   6. HERO TEXT — staggered reveal on load
════════════════════════════════════════════════════════════ */
(function initHeroReveal() {
  const eyebrow    = document.querySelector('.hero__eyebrow');
  const lines      = document.querySelectorAll('.hero__line');
  const sub        = document.querySelector('.hero__subheadline');
  const actions    = document.querySelector('.hero__actions');

  const sequence = [
    { el: eyebrow,  delay: 200  },
    { el: lines[0], delay: 400  },
    { el: lines[1], delay: 600  },
    { el: sub,      delay: 800  },
    { el: actions,  delay: 1000 },
  ];

  sequence.forEach(({ el, delay }) => {
    if (!el) return;
    setTimeout(() => el.classList.add('visible'), delay);
  });
})();


/* ════════════════════════════════════════════════════════════
   7. 3D MAGNETIC TILT — Dish Cards
════════════════════════════════════════════════════════════ */
(function initTiltCards() {
  if (prefersReducedMotion || isTouch()) return;

  const cards = document.querySelectorAll('[data-tilt]');
  cards.forEach(card => {
    const inner = card.querySelector('.dish-card__inner');
    const shimmer = card.querySelector('.dish-card__shimmer');

    card.addEventListener('mousemove', (e) => {
      const rect   = card.getBoundingClientRect();
      const cx     = rect.left + rect.width  / 2;
      const cy     = rect.top  + rect.height / 2;
      const dx     = (e.clientX - cx) / (rect.width  / 2);
      const dy     = (e.clientY - cy) / (rect.height / 2);

      const rotY   =  dx * 10;
      const rotX   = -dy * 10;

      if (inner) {
        inner.style.transform = `perspective(800px) rotateX(${rotX}deg) rotateY(${rotY}deg) scale3d(1.02,1.02,1.02)`;
      }

      // Shimmer follow
      if (shimmer) {
        shimmer.style.left = `${e.clientX - rect.left}px`;
        shimmer.style.top  = `${e.clientY - rect.top}px`;
      }
    });

    card.addEventListener('mouseleave', () => {
      if (inner) {
        inner.style.transition = 'transform 0.6s cubic-bezier(0.16,1,0.3,1)';
        inner.style.transform  = 'perspective(800px) rotateX(0deg) rotateY(0deg) scale3d(1,1,1)';
      }
    });

    card.addEventListener('mouseenter', () => {
      if (inner) inner.style.transition = 'transform 0.15s ease';
    });
  });
})();


/* ════════════════════════════════════════════════════════════
   8. EXPERIENCE CAROUSEL
════════════════════════════════════════════════════════════ */
(function initCarousel() {
  const track    = document.getElementById('carouselTrack');
  const prevBtn  = document.getElementById('carouselPrev');
  const nextBtn  = document.getElementById('carouselNext');
  const dots     = document.querySelectorAll('.carousel__dot');
  const progressBar = document.getElementById('carouselProgressBar');
  if (!track) return;

  const slides    = track.querySelectorAll('.carousel__slide');
  const total     = slides.length;
  let current     = 0;
  let autoTimer   = null;
  const AUTO_DELAY = 5000;

  // ─── Drag / Touch ──────────────────────────────────────
  let isDragging   = false;
  let startX       = 0;
  let scrollStartX = 0;
  let dragDelta    = 0;

  const getSlideWidth = () => {
    if (slides[0]) return slides[0].offsetWidth + 24; // gap = 1.5rem = 24px
    return 0;
  };

  const goTo = (idx, smooth = true) => {
    current = ((idx % total) + total) % total;
    const offset = getSlideWidth() * current;
    track.style.transition = smooth ? 'transform 0.55s cubic-bezier(0.16,1,0.3,1)' : 'none';
    track.style.transform  = `translateX(-${offset}px)`;

    dots.forEach((d, i) => {
      d.classList.toggle('active', i === current);
      d.setAttribute('aria-selected', i === current ? 'true' : 'false');
    });

    if (progressBar) {
      progressBar.style.transition = 'none';
      progressBar.style.width = `${((current + 1) / total) * 100}%`;
    }
  };

  const next = () => goTo(current + 1);
  const prev = () => goTo(current - 1);

  // Auto-play
  const startAuto = () => {
    clearInterval(autoTimer);
    autoTimer = setInterval(next, AUTO_DELAY);

    // Progress bar animation
    if (progressBar) {
      progressBar.style.transition = `width ${AUTO_DELAY}ms linear`;
      progressBar.style.width = '100%';
    }
  };

  const stopAuto = () => {
    clearInterval(autoTimer);
    if (progressBar) {
      progressBar.style.transition = 'none';
      progressBar.style.width = `${((current + 1) / total) * 100}%`;
    }
  };

  // Button clicks
  nextBtn?.addEventListener('click', () => { next(); stopAuto(); startAuto(); });
  prevBtn?.addEventListener('click', () => { prev(); stopAuto(); startAuto(); });

  // Dot clicks
  dots.forEach((dot, i) => {
    dot.addEventListener('click', () => { goTo(i); stopAuto(); startAuto(); });
  });

  // Drag to scroll
  const carousel = document.getElementById('carousel');

  const onDragStart = (x) => {
    isDragging   = true;
    startX       = x;
    scrollStartX = current * getSlideWidth();
    track.style.transition = 'none';
    stopAuto();
  };

  const onDragMove = (x) => {
    if (!isDragging) return;
    dragDelta = x - startX;
    const newX = scrollStartX - dragDelta;
    track.style.transform = `translateX(-${newX}px)`;
  };

  const onDragEnd = () => {
    if (!isDragging) return;
    isDragging = false;
    if (Math.abs(dragDelta) > 60) {
      dragDelta < 0 ? next() : prev();
    } else {
      goTo(current);
    }
    dragDelta = 0;
    startAuto();
  };

  // Mouse events
  carousel?.addEventListener('mousedown',  (e) => onDragStart(e.clientX));
  window.addEventListener('mousemove',     (e) => { if (isDragging) onDragMove(e.clientX); });
  window.addEventListener('mouseup',       onDragEnd);

  // Touch events
  carousel?.addEventListener('touchstart', (e) => onDragStart(e.touches[0].clientX), { passive: true });
  carousel?.addEventListener('touchmove',  (e) => { if (isDragging) onDragMove(e.touches[0].clientX); }, { passive: true });
  carousel?.addEventListener('touchend',   onDragEnd);

  // Pause on hover
  carousel?.addEventListener('mouseenter', stopAuto);
  carousel?.addEventListener('mouseleave', startAuto);

  // Inner image parallax on slide hover
  if (!prefersReducedMotion && !isTouch()) {
    slides.forEach(slide => {
      const inner = slide.querySelector('.carousel__slide-img-inner');
      if (!inner) return;
      slide.addEventListener('mousemove', (e) => {
        const rect = slide.getBoundingClientRect();
        const dx = (e.clientX - rect.left - rect.width  / 2) / rect.width;
        const dy = (e.clientY - rect.top  - rect.height / 2) / rect.height;
        inner.style.transform = `translate(${dx * -12}px, ${dy * -8}px) scale(1.06)`;
      });
      slide.addEventListener('mouseleave', () => {
        inner.style.transform = 'translate(0,0) scale(1)';
      });
    });
  }

  // Init
  goTo(0, false);
  startAuto();

  // Re-calc on resize
  window.addEventListener('resize', () => goTo(current, false), { passive: true });

  // Keyboard navigation when carousel is focused
  carousel?.setAttribute('tabindex', '0');
  carousel?.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') { next(); stopAuto(); startAuto(); }
    if (e.key === 'ArrowLeft')  { prev(); stopAuto(); startAuto(); }
  });
})();


/* ════════════════════════════════════════════════════════════
   9. ABOUT — Counter Animation
════════════════════════════════════════════════════════════ */
(function initCounters() {
  const counters = document.querySelectorAll('.about__stat-num');
  if (!counters.length) return;

  const animateCounter = (el) => {
    const target  = parseInt(el.dataset.count, 10);
    const decimal = el.dataset.decimal ? parseFloat(el.dataset.decimal) : 0;
    const duration = 1800;
    const start   = performance.now();

    const step = (now) => {
      const elapsed  = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const value  = Math.round(eased * target);
      el.textContent = value;
      if (progress < 1) requestAnimationFrame(step);
      else {
        el.textContent = target;
        // Append decimal if applicable
        if (decimal) {
          const unit = el.nextElementSibling;
          if (unit && unit.textContent.startsWith('.9')) return; // already handled
        }
      }
    };
    requestAnimationFrame(step);
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  counters.forEach(el => observer.observe(el));
})();


/* ════════════════════════════════════════════════════════════
   10. RESERVATION FORM — validation + ripple + success
════════════════════════════════════════════════════════════ */
(function initReservation() {
  const form    = document.getElementById('reservationForm');
  const btn     = document.getElementById('submitBtn');
  const success = document.getElementById('reservationSuccess');
  if (!form || !btn) return;

  // Set min date to today
  const dateInput = document.getElementById('date');
  if (dateInput) {
    const today = new Date().toISOString().split('T')[0];
    dateInput.setAttribute('min', today);
  }

  // Ripple effect on submit button
  btn.addEventListener('click', (e) => {
    const ripple = btn.querySelector('.btn__ripple');
    if (!ripple) return;
    const rect = btn.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height) * 2;
    ripple.style.width  = `${size}px`;
    ripple.style.height = `${size}px`;
    ripple.style.left   = `${e.clientX - rect.left - size / 2}px`;
    ripple.style.top    = `${e.clientY - rect.top  - size / 2}px`;
    ripple.classList.remove('animate');
    void ripple.offsetWidth; // reflow
    ripple.classList.add('animate');
  });

  // Form submission
  form.addEventListener('submit', (e) => {
    e.preventDefault();

    // Basic validation — check required fields
    const required = form.querySelectorAll('[required]');
    let valid = true;
    required.forEach(field => {
      field.style.borderColor = '';
      if (!field.value.trim()) {
        valid = false;
        field.style.borderColor = '#E07070';
        field.focus();
      }
    });
    if (!valid) return;

    // Simulate submission
    btn.querySelector('.btn__text').textContent = 'Confirming…';
    btn.disabled = true;

    setTimeout(() => {
      form.style.opacity    = '0';
      form.style.transform  = 'translateY(-20px)';
      form.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
      setTimeout(() => {
        form.hidden = true;
        if (success) {
          success.removeAttribute('hidden');
          success.style.opacity   = '0';
          success.style.transform = 'translateY(20px)';
          success.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
          requestAnimationFrame(() => {
            success.style.opacity   = '1';
            success.style.transform = 'translateY(0)';
          });
        }
      }, 400);
    }, 1200);
  });

  // Field focus restore border
  form.querySelectorAll('.form__input').forEach(field => {
    field.addEventListener('input', () => { field.style.borderColor = ''; });
  });
})();


/* ════════════════════════════════════════════════════════════
   11. SMOOTH SCROLL — offset for fixed nav
════════════════════════════════════════════════════════════ */
(function initSmoothScroll() {
  const NAV_H = 80;
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', (e) => {
      const href = link.getAttribute('href');
      if (href === '#') return;
      const target = document.querySelector(href);
      if (!target) return;
      e.preventDefault();
      const top = target.getBoundingClientRect().top + window.scrollY - NAV_H;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });
})();


/* ════════════════════════════════════════════════════════════
   12. SHIMMER — track mouse across dish card grid
════════════════════════════════════════════════════════════ */
(function initShimmer() {
  if (isTouch() || prefersReducedMotion) return;

  document.querySelectorAll('.dish-card').forEach(card => {
    const shimmer = card.querySelector('.dish-card__shimmer');
    if (!shimmer) return;
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      shimmer.style.left = `${e.clientX - rect.left}px`;
      shimmer.style.top  = `${e.clientY - rect.top}px`;
    });
  });
})();


/* ════════════════════════════════════════════════════════════
   13. SECTION ENTRY — stagger children
════════════════════════════════════════════════════════════ */
(function initStagger() {
  const staggerParents = document.querySelectorAll('.dishes__header, .experience__header, .reservation__header');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.querySelectorAll('.reveal-up, .section-eyebrow, .section-headline, .section-sub').forEach((child, i) => {
          setTimeout(() => child.classList.add('visible'), i * 120);
        });
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.2 });
  staggerParents.forEach(p => observer.observe(p));
})();
