/*
 * Google Analytics (GA4). O ID de métricas fica em assets/js/config.js → analytics.id.
 * Eventos enviados (nenhum dado pessoal do visitante é incluído):
 *   click_whatsapp  → clique em qualquer botão ou link de WhatsApp (parâmetros: botao, secao)
 *   click_email     → clique no e-mail de contato
 *   generate_lead   → envio do formulário de avaliação gratuita (evento recomendado do GA4 para contatos)
 * Em localhost nada é enviado, para os testes não entrarem nos relatórios.
 */
(() => {
  'use strict';

  const id = String((window.SITE_CONFIG && window.SITE_CONFIG.analytics && window.SITE_CONFIG.analytics.id) || '').trim();
  const local = ['localhost', '127.0.0.1', '[::1]', ''].includes(location.hostname) || location.hostname.endsWith('.localhost');
  if (!/^G-[A-Z0-9]{6,}$/.test(id) || local) return;

  window.dataLayer = window.dataLayer || [];
  function gtag() { window.dataLayer.push(arguments); }
  window.gtag = gtag;
  gtag('js', new Date());
  gtag('config', id);

  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(id)}`;
  document.head.appendChild(script);

  document.addEventListener('click', (event) => {
    const link = event.target instanceof Element ? event.target.closest('a') : null;
    if (!link) return;
    const section = link.closest('section, header, footer');
    const where = section ? (section.id || section.className.split(' ')[0] || section.tagName.toLowerCase()) : 'pagina';

    if (link.hasAttribute('data-whatsapp')) {
      gtag('event', 'click_whatsapp', { botao: link.dataset.whatsapp, secao: where });
    } else if (link.href && link.href.startsWith('mailto:')) {
      gtag('event', 'click_email', { secao: where });
    }
  });

  document.addEventListener('avaliacao:enviada', () => {
    gtag('event', 'generate_lead', { formulario: 'avaliacao' });
  });
})();
