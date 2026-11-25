/*
 * Comportamentos da página: links de WhatsApp, menu, formulário e detalhes.
 * Os valores editáveis (WhatsApp, mensagens e envio do formulário) ficam em assets/js/config.js.
 */
(() => {
  'use strict';

  const cfg = window.SITE_CONFIG || {};
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

  /* ---------- Telefone (Brasil) ---------- */
  const onlyDigits = (value) => String(value ?? '').replace(/\D/g, '');
  // DDD + celular (9 + 8 dígitos) ou DDD + fixo (8 dígitos)
  const BR_PHONE = /^[1-9][1-9](?:9\d{8}|[2-8]\d{7})$/;

  // Devolve DDD + número (10 ou 11 dígitos) ou '' quando o número não é válido.
  const normalizePhone = (value) => {
    let digits = onlyDigits(value);
    if (digits.length > 11 && digits.startsWith('55')) digits = digits.slice(2); // +55
    if (digits.length > 10 && digits.startsWith('0')) digits = digits.slice(1);  // 0 + DDD
    return BR_PHONE.test(digits) ? digits : '';
  };

  const formatPhone = (digits) => (digits.length === 11
    ? `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`
    : `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`);

  /* ---------- WhatsApp ---------- */
  const waNumber = normalizePhone(cfg.whatsapp);
  const waReady = waNumber !== '';
  const waMessages = cfg.mensagensWhatsApp || {};
  const waUrl = (key) => {
    const text = waMessages[key];
    return `https://wa.me/55${waNumber}${text ? `?text=${encodeURIComponent(text)}` : ''}`;
  };
  const waLink = (key, label) => `<a href="${waUrl(key)}" target="_blank" rel="noopener">${label}</a>`;

  /* ---------- Aviso flutuante ---------- */
  const toastEl = $('#toast');
  let toastTimer;
  const showToast = (message) => {
    if (!toastEl) return;
    clearTimeout(toastTimer);
    toastEl.textContent = '';
    window.requestAnimationFrame(() => {
      toastEl.textContent = message;
      toastEl.classList.add('is-visible');
    });
    toastTimer = setTimeout(() => {
      toastEl.classList.remove('is-visible');
      toastTimer = setTimeout(() => { toastEl.textContent = ''; }, 300);
    }, 5000);
  };

  const WA_PENDING = 'O contato por WhatsApp está em configuração. Em breve este botão abrirá a conversa.';

  $$('[data-whatsapp]').forEach((el) => {
    if (waReady) {
      el.href = waUrl(el.dataset.whatsapp);
      el.target = '_blank';
      el.rel = 'noopener';
      el.insertAdjacentHTML('beforeend', '<span class="sr-only"> (abre o WhatsApp)</span>');
      return;
    }
    // Número ainda não configurado: nenhum link é gerado, o botão só explica a situação.
    el.setAttribute('role', 'button');
    el.setAttribute('tabindex', '0');
    el.setAttribute('aria-disabled', 'true');
    const warn = (event) => {
      event.preventDefault();
      showToast(WA_PENDING);
    };
    el.addEventListener('click', warn);
    el.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') warn(event);
    });
  });

  if (!waReady) console.info('[site] WhatsApp ainda não configurado em assets/js/config.js.');

  /* ---------- Contatos exibidos (lidos de config.js) ---------- */
  $$('[data-whatsapp-numero]').forEach((el) => {
    if (waReady) el.firstChild.textContent = formatPhone(waNumber);
    else el.closest('li')?.setAttribute('hidden', '');
  });

  const mailAddress = String(cfg.email || '').trim();
  const validMail = /^[^\s@<>"']+@[^\s@<>"']+\.[^\s@<>"']+$/.test(mailAddress);
  $$('[data-email]').forEach((el) => {
    if (validMail) {
      el.href = `mailto:${mailAddress}`;
      el.textContent = mailAddress;
    } else {
      el.closest('li')?.setAttribute('hidden', '');
    }
  });

  /* ---------- Aviso no topo (ex.: Black Friday) ---------- */
  const topCfg = cfg.avisoTopo || {};
  const topBar = $('#aviso-topo');
  const topText = String(topCfg.texto || '').trim();

  if (topBar && topCfg.ativo === true && topText) {
    const until = String(topCfg.ate || '').trim();
    const expired = /^\d{4}-\d{2}-\d{2}$/.test(until) && new Date(`${until}T23:59:59`) < new Date();

    if (!expired) {
      $('.announcement__text', topBar).textContent = topText;

      const target = String(topCfg.link || '').trim();
      const label = String(topCfg.textoLink || '').trim();
      let href = '';
      if (target === 'whatsapp') href = waReady ? waUrl('contato') : ''; // sem número, o link não aparece
      else if (/^#[\w-]+$/.test(target)) href = target;
      else if (/^https:\/\/\S+$/i.test(target)) href = target;

      if (href && label) {
        const link = $('.announcement__link', topBar);
        link.href = href;
        link.textContent = label;
        if (!href.startsWith('#')) {
          link.target = '_blank';
          link.rel = 'noopener';
        }
        link.hidden = false;
      }
      topBar.hidden = false;
    }
  }

  /* ---------- Menu (celular e tablet) ---------- */
  const toggle = $('.nav-toggle');
  const nav = $('#site-nav');

  if (toggle && nav) {
    const toggleLabel = $('.sr-only', toggle);
    const isOpen = () => toggle.getAttribute('aria-expanded') === 'true';
    const setMenu = (open) => {
      toggle.setAttribute('aria-expanded', String(open));
      nav.classList.toggle('is-open', open);
      toggleLabel.textContent = open ? 'Fechar menu' : 'Abrir menu';
    };

    toggle.addEventListener('click', () => setMenu(!isOpen()));
    nav.addEventListener('click', (event) => {
      if (event.target.closest('a')) setMenu(false);
    });
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && isOpen()) {
        setMenu(false);
        toggle.focus();
      }
    });
    document.addEventListener('click', (event) => {
      if (isOpen() && !event.target.closest('.site-header')) setMenu(false);
    });
    window.matchMedia('(min-width: 1080px)').addEventListener('change', () => setMenu(false));
  }

  /* ---------- Item do menu destacado conforme a rolagem ---------- */
  const navLinks = $$('.site-nav__list a[href^="#"]');

  if ('IntersectionObserver' in window && navLinks.length) {
    const linkById = new Map(navLinks.map((link) => [link.hash.slice(1), link]));
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        navLinks.forEach((link) => link.classList.remove('is-active'));
        linkById.get(entry.target.id)?.classList.add('is-active');
      });
    }, { rootMargin: '-45% 0px -50% 0px' });

    ['inicio', ...linkById.keys(), 'contato'].forEach((id) => {
      const section = document.getElementById(id);
      if (section) observer.observe(section);
    });
  }

  /* ---------- Formulário de avaliação gratuita ---------- */
  const form = $('#lead-form');

  if (form) {
    const formCfg = cfg.formulario || {};
    const endpoint = String(formCfg.endpoint || '').trim();
    // "netlify" (formulários do Netlify), um endereço https:// ou um caminho do próprio site (ex.: /api/avaliacao).
    const useNetlify = endpoint.toLowerCase() === 'netlify';
    const formReady = useNetlify || /^https:\/\/\S+$/i.test(endpoint) || /^\/(?!\/)\S*$/.test(endpoint);

    const notice = $('#form-notice');
    const noticeText = $('#form-notice-text');
    const status = $('#form-status');
    const success = $('#form-success');
    const submit = $('.lead-form__submit', form);
    const submitLabel = $('.lead-form__label', form);
    const field = (name) => form.elements.namedItem(name);

    if (!formReady) {
      notice.hidden = false;
      if (waReady) noticeText.innerHTML = `Enquanto isso, você pode ${waLink('avaliacao', 'pedir sua avaliação pelo WhatsApp')}.`;
      console.info('[site] Envio do formulário ainda não configurado em assets/js/config.js.');
    }

    const rules = {
      nome: (value) => (value.trim().length >= 2 ? '' : 'Informe seu nome.'),
      empresa: (value) => (value.trim() ? '' : 'Informe o nome da empresa.'),
      whatsapp: (value) => {
        if (!value.trim()) return 'Informe seu WhatsApp com DDD.';
        return normalizePhone(value) ? '' : 'Confira o número: informe DDD e número, por exemplo (11) 98765-4321.';
      },
      cidade: (value) => (value.trim() ? '' : 'Informe sua cidade.'),
    };

    const setError = (name, message) => {
      const input = field(name);
      const wrapper = input.closest('.field');
      wrapper.classList.toggle('is-invalid', Boolean(message));
      wrapper.querySelector('.field__error').textContent = message;
      if (message) input.setAttribute('aria-invalid', 'true');
      else input.removeAttribute('aria-invalid');
    };

    const validate = (name) => {
      const message = rules[name](field(name).value);
      setError(name, message);
      return !message;
    };

    Object.keys(rules).forEach((name) => {
      const input = field(name);
      const isInvalid = () => input.closest('.field').classList.contains('is-invalid');
      input.addEventListener('blur', () => {
        if (input.value.trim() || isInvalid()) validate(name);
      });
      input.addEventListener('input', () => {
        if (isInvalid()) validate(name);
      });
    });

    // Formata o WhatsApp ao sair do campo: (11) 98765-4321
    field('whatsapp').addEventListener('blur', (event) => {
      const digits = normalizePhone(event.target.value);
      if (digits) event.target.value = formatPhone(digits);
    });

    const scrollBehavior = () => (window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth');

    const showStatus = (html) => {
      status.innerHTML = '';
      window.setTimeout(() => {
        status.innerHTML = html;
        status.scrollIntoView({ block: 'nearest', behavior: scrollBehavior() });
      }, 60);
    };

    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      status.innerHTML = '';

      const invalid = Object.keys(rules).filter((name) => !validate(name));
      if (invalid.length) {
        field(invalid[0]).focus();
        return;
      }

      if (field('_gotcha').value) return; // campo anti-spam preenchido: provável robô

      if (!formReady) {
        showStatus(`O envio está temporariamente indisponível, por isso sua solicitação não foi enviada. ${
          waReady ? `Você pode ${waLink('avaliacao', 'pedir sua avaliação pelo WhatsApp')}.` : 'Tente novamente em breve.'}`);
        return;
      }

      const data = {
        nome: field('nome').value.trim(),
        empresa: field('empresa').value.trim(),
        whatsapp: formatPhone(normalizePhone(field('whatsapp').value)),
        cidade: field('cidade').value.trim(),
        instagram: field('instagram').value.trim(),
        origem: 'Site · avaliação gratuita',
        ...(formCfg.camposExtras || {}),
      };

      const originalLabel = submitLabel.textContent;
      submit.disabled = true;
      submit.setAttribute('aria-busy', 'true');
      submitLabel.textContent = 'Enviando…';

      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 15000);

      try {
        // Netlify: envio "de formulário" para a própria página, com o nome do formulário.
        // Outros serviços: JSON para o endereço configurado.
        const request = useNetlify
          ? {
            url: '/',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({ 'form-name': form.getAttribute('name') || 'avaliacao', ...data }).toString(),
          }
          : {
            url: endpoint,
            headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
            body: JSON.stringify(data),
          };
        const response = await fetch(request.url, {
          method: 'POST',
          headers: request.headers,
          body: request.body,
          signal: controller.signal,
        });
        let body = null;
        try { body = await response.json(); } catch (_) { /* resposta sem JSON */ }
        const rejected = body && (body.success === false || body.success === 'false' || body.ok === false);
        if (!response.ok || rejected) throw new Error(`Falha no envio (HTTP ${response.status})`);

        form.hidden = true;
        notice.hidden = true;
        success.hidden = false;
        success.scrollIntoView({ block: 'center', behavior: scrollBehavior() });
        success.focus({ preventScroll: true });
        document.dispatchEvent(new CustomEvent('avaliacao:enviada')); // medição (analytics.js); não leva dados do formulário
      } catch (error) {
        console.error('[site]', error);
        showStatus(`Não foi possível enviar sua solicitação agora. Verifique sua conexão e tente novamente.${
          waReady ? ` Se preferir, ${waLink('avaliacao', 'fale comigo pelo WhatsApp')}.` : ''}`);
      } finally {
        clearTimeout(timeout);
        submit.disabled = false;
        submit.removeAttribute('aria-busy');
        submitLabel.textContent = originalLabel;
      }
    });
  }

  /* ---------- Ano do rodapé ---------- */
  const year = $('[data-year]');
  if (year) year.textContent = String(new Date().getFullYear());
})();
