/* =========================================================
   script.js — interactividad del portfolio (JS vanilla ES6+)
   - Toggle de tema claro/oscuro con persistencia (localStorage)
   - Menú móvil hamburguesa
   - Scroll suave + cierre de menú al navegar
   - Header con sombra al hacer scroll
   - Efecto de escritura en la terminal del hero
   - Animaciones al entrar en viewport (IntersectionObserver)
   - Validación y envío real del formulario de contacto (Web3Forms)
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
     Formulario de contacto — envío real por Web3Forms
     ---------------------------------------------------------
     Web3Forms (https://web3forms.com) es gratis y NO requiere
     crear cuenta ni contraseña:

       1. Entra a https://web3forms.com
       2. Escribe tu correo (kalebyeredlepesanchez16@gmail.com)
       3. Pulsa "Create Access Key"
       4. Copia la clave que te llega por email
       5. Pégala abajo en WEB3FORMS_ACCESS_KEY

     Mientras la clave siga siendo el texto de ejemplo, el
     formulario avisa en pantalla y NO finge que envió nada.
     --------------------------------------------------------- */
  var WEB3FORMS_ACCESS_KEY = 'b27f91b7-7952-48b5-b738-990f76babb34';
  var CONTACT_FALLBACK_EMAIL = 'kalebyeredlepesanchez16@gmail.com';

  function setupContactForm() {
    const form = document.getElementById('contact-form');
    if (!form) return;

    const btn = document.getElementById('submit-btn');
    const label = document.getElementById('submit-label');
    const statusEl = document.getElementById('form-status');
    const keyReady =
      typeof WEB3FORMS_ACCESS_KEY === 'string' &&
      WEB3FORMS_ACCESS_KEY.length > 20 &&
      !/PEGA-AQUI/i.test(WEB3FORMS_ACCESS_KEY);

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

    function setStatus(msg, kind) {
      if (!statusEl) return;
      if (!msg) {
        statusEl.hidden = true;
        statusEl.textContent = '';
        statusEl.className = 'form-status';
        return;
      }
      statusEl.hidden = false;
      statusEl.className = 'form-status' + (kind ? ' form-status--' + kind : '');
      statusEl.textContent = msg;
    }

    function resetButton() {
      btn.classList.remove('is-success', 'is-error');
      btn.disabled = false;
      label.textContent = 'Enviar mensaje';
    }

    function mailtoFallback(data) {
      const body = data.message + '\n\n— ' + data.name + ' (' + data.email + ')';
      return (
        'mailto:' +
        CONTACT_FALLBACK_EMAIL +
        '?subject=' +
        encodeURIComponent('Contacto desde el portfolio') +
        '&body=' +
        encodeURIComponent(body)
      );
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      setStatus('');

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

      // Honeypot: si un bot marcó la casilla oculta, cortamos en silencio.
      if (form.elements.botcheck && form.elements.botcheck.checked) return;

      const data = {
        name: form.elements.name.value.trim(),
        email: form.elements.email.value.trim(),
        message: form.elements.message.value.trim(),
      };

      // Sin clave configurada: avisamos con honestidad, no fingimos el envío.
      if (!keyReady) {
        console.warn(
          '[Portfolio] El formulario no está conectado todavía. ' +
            'Consigue una Access Key gratis en https://web3forms.com y pégala ' +
            'en WEB3FORMS_ACCESS_KEY (js/script.js).'
        );
        btn.classList.add('is-error');
        label.textContent = 'Formulario sin conectar';
        setStatus(
          'El formulario aún no está conectado. Mientras tanto, escríbeme a ' +
            CONTACT_FALLBACK_EMAIL + '.',
          'error'
        );
        setTimeout(resetButton, 4500);
        return;
      }

      btn.disabled = true;
      btn.classList.remove('is-error');
      label.textContent = 'Enviando...';

      fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          access_key: WEB3FORMS_ACCESS_KEY,
          subject: 'Nuevo mensaje de ' + data.name + ' — Portfolio',
          from_name: 'Portfolio Kaleb Lepe',
          name: data.name,
          email: data.email,
          message: data.message,
        }),
      })
        .then(function (res) {
          return res.json().catch(function () {
            return {};
          });
        })
        .then(function (json) {
          if (!json || !json.success) {
            throw new Error((json && json.message) || 'Respuesta no válida');
          }
          btn.classList.add('is-success');
          label.textContent = '¡Mensaje enviado! ✓';
          setStatus('Gracias, te responderé pronto.', 'ok');
          form.reset();
          setTimeout(function () {
            resetButton();
            setStatus('');
          }, 4500);
        })
        .catch(function (err) {
          console.error('[Portfolio] Error al enviar el formulario:', err);
          btn.disabled = false;
          btn.classList.add('is-error');
          label.textContent = 'No se pudo enviar';
          if (statusEl) {
            statusEl.hidden = false;
            statusEl.className = 'form-status form-status--error';
            statusEl.innerHTML =
              'No se pudo enviar. <a class="underline" href="' +
              mailtoFallback(data) +
              '">Escríbeme por correo</a> o inténtalo de nuevo.';
          }
          setTimeout(function () {
            resetButton();
            setStatus('');
          }, 7000);
        });
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
