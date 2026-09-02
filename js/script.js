/* =========================================================
   script.js — interactividad del portfolio (JS vanilla ES6+)
   - Toggle de tema claro/oscuro con persistencia (localStorage)
   - Menú móvil hamburguesa
   - Scroll suave + cierre de menú al navegar
   - Header con sombra al hacer scroll
   - Efecto de escritura en la terminal del hero
   - Animaciones al entrar en viewport (IntersectionObserver)
   - Validación y estado de envío del formulario de contacto
   - Año dinámico en el footer
   ========================================================= */

(function () {
  'use strict';

  document.addEventListener('DOMContentLoaded', init);

  function init() {
    setupTheme();
    setupMobileMenu();
    setupSmoothScroll();
    setupHeaderScroll();
    setupTerminalTyping();
    setupScrollReveal();
    setupContactForm();
    setYear();
  }

  /* ---------------------------------------------------------
     Tema claro / oscuro
     --------------------------------------------------------- */
  function setupTheme() {
    const toggle = document.getElementById('theme-toggle');
    if (!toggle) return;

    toggle.addEventListener('click', function () {
      const isDark = document.documentElement.classList.toggle('dark');
      try {
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
      } catch (e) {}
      document
        .querySelector('meta[name="theme-color"]')
        ?.setAttribute('content', isDark ? '#0f172a' : '#ffffff');
    });
  }

  /* ---------------------------------------------------------
     Menú móvil
     --------------------------------------------------------- */
  function setupMobileMenu() {
    const btn = document.getElementById('menu-toggle');
    const menu = document.getElementById('mobile-menu');
    const iconHamburger = document.getElementById('icon-hamburger');
    const iconClose = document.getElementById('icon-close');
    if (!btn || !menu) return;

    function setOpen(open) {
      menu.classList.toggle('hidden', !open);
      btn.setAttribute('aria-expanded', String(open));
      btn.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
      iconHamburger?.classList.toggle('hidden', open);
      iconClose?.classList.toggle('hidden', !open);
    }

    btn.addEventListener('click', function () {
      setOpen(menu.classList.contains('hidden'));
    });

    // Cerrar al pulsar un enlace del menú
    menu.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        setOpen(false);
      });
    });

    // Cerrar con Escape
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') setOpen(false);
    });

    // Volver a estado desktop si se agranda la ventana
    window.addEventListener('resize', function () {
      if (window.innerWidth >= 768) setOpen(false);
    });
  }

  /* ---------------------------------------------------------
     Scroll suave para los enlaces internos
     (respaldo por si el navegador no soporta scroll-behavior)
     --------------------------------------------------------- */
  function setupSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
      anchor.addEventListener('click', function (e) {
        const id = anchor.getAttribute('href');
        if (!id || id === '#') return;
        const target = document.querySelector(id);
        if (!target) return;
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        history.replaceState(null, '', id);
      });
    });
  }

  /* ---------------------------------------------------------
     Header: sombra/fondo al hacer scroll
     --------------------------------------------------------- */
  function setupHeaderScroll() {
    const header = document.getElementById('header');
    if (!header) return;
    function onScroll() {
      header.classList.toggle('scrolled', window.scrollY > 8);
    }
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  /* ---------------------------------------------------------
     Efecto de escritura en la terminal
     --------------------------------------------------------- */
  function setupTerminalTyping() {
    const el = document.getElementById('terminal-text');
    const output = document.getElementById('terminal-output');
    if (!el) return;

    const command = 'git clone https://github.com/kaleblepe/portfolio.git';
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (reduceMotion) {
      el.textContent = command;
      output?.classList.remove('hidden');
      return;
    }

    let i = 0;
    function type() {
      if (i <= command.length) {
        el.textContent = command.slice(0, i);
        i++;
        setTimeout(type, 45 + Math.random() * 45);
      } else {
        setTimeout(function () {
          output?.classList.remove('hidden');
        }, 350);
      }
    }
    // Pequeño retraso inicial para que se note el efecto
    setTimeout(type, 600);
  }

  /* ---------------------------------------------------------
     Animaciones al entrar en viewport
     --------------------------------------------------------- */
  function setupScrollReveal() {
    const items = document.querySelectorAll('.reveal, .skill-card');
    if (!('IntersectionObserver' in window) || !items.length) {
      items.forEach(function (el) {
        el.classList.add('in-view');
      });
      return;
    }

    const observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('in-view');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
    );

    items.forEach(function (el) {
      observer.observe(el);
    });
  }

  /* ---------------------------------------------------------
     Formulario de contacto: validación + estado de envío
     Preparado para conectar con Formspree / EmailJS
     --------------------------------------------------------- */
  function setupContactForm() {
    const form = document.getElementById('contact-form');
    if (!form) return;

    const btn = document.getElementById('submit-btn');
    const label = document.getElementById('submit-label');

    const validators = {
      name: function (v) {
        if (!v.trim()) return 'Escribe tu nombre.';
        if (v.trim().length < 2) return 'El nombre es muy corto.';
        return '';
      },
      email: function (v) {
        if (!v.trim()) return 'Escribe tu email.';
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return 'El formato del email no es válido.';
        return '';
      },
      message: function (v) {
        if (!v.trim()) return 'Escribe un mensaje.';
        if (v.trim().length < 10) return 'Cuéntame un poco más (mín. 10 caracteres).';
        return '';
      },
    };

    function showError(field, msg) {
      const input = form.elements[field];
      const errorEl = form.querySelector('[data-error-for="' + field + '"]');
      if (errorEl) errorEl.textContent = msg;
      if (input) {
        input.classList.toggle('invalid', Boolean(msg));
        input.setAttribute('aria-invalid', msg ? 'true' : 'false');
      }
      return !msg;
    }

    // Validación en vivo al salir de cada campo
    Object.keys(validators).forEach(function (field) {
      const input = form.elements[field];
      if (!input) return;
      input.addEventListener('blur', function () {
        showError(field, validators[field](input.value));
      });
      input.addEventListener('input', function () {
        if (input.classList.contains('invalid')) {
          showError(field, validators[field](input.value));
        }
      });
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();

      let valid = true;
      Object.keys(validators).forEach(function (field) {
        const ok = showError(field, validators[field](form.elements[field].value));
        if (!ok) valid = false;
      });
      if (!valid) {
        const firstInvalid = form.querySelector('.invalid');
        firstInvalid?.focus();
        return;
      }

      // --- Simulación de envío (frontend) ---
      // Para producción, reemplazar este bloque por una llamada real:
      //
      //   fetch('https://formspree.io/f/TU_ID', {
      //     method: 'POST',
      //     headers: { 'Accept': 'application/json' },
      //     body: new FormData(form),
      //   }).then(...)
      //
      // o EmailJS: emailjs.sendForm('service_id', 'template_id', form)

      btn.disabled = true;
      label.textContent = 'Enviando...';

      setTimeout(function () {
        btn.classList.add('is-success');
        label.textContent = '¡Mensaje enviado! ✓';
        form.reset();

        setTimeout(function () {
          btn.classList.remove('is-success');
          btn.disabled = false;
          label.textContent = 'Enviar mensaje';
        }, 3500);
      }, 900);
    });
  }

  /* ---------------------------------------------------------
     Año dinámico
     --------------------------------------------------------- */
  function setYear() {
    const el = document.getElementById('year');
    if (el) el.textContent = String(new Date().getFullYear());
  }
})();
