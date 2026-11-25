/*
 * ============================================================
 *  CONFIGURAÇÃO DO SITE — edite somente este arquivo
 *  Vinicius Almeida · IA e marketing
 * ============================================================
 *
 * Tudo aqui fica visível para quem abrir o código da página.
 * Por isso, NUNCA coloque senhas, tokens ou chaves secretas neste arquivo.
 */
window.SITE_CONFIG = {
  /*
   * WhatsApp que recebe os contatos: DDD + número, com ou sem formatação.
   * Exemplo: "(11) 98765-4321". O código do Brasil (+55) é acrescentado automaticamente.
   * Se o número ficar vazio ou inválido, nenhum link de WhatsApp é gerado:
   * os botões apenas avisam que o contato está em configuração.
   */
  whatsapp: "(82) 99831-6257",

  /*
   * Google Analytics 4: ID de métricas (começa com "G-"). Não é segredo.
   * Vazio = nada é medido. Em localhost a medição fica sempre desligada.
   */
  analytics: {
    id: "G-KR2CB3DBYP",
  },

  /* E-mail de contato exibido na seção final (link "mailto:"). Vazio = o e-mail não aparece. */
  email: "monkberry.design@gmail.com",

  /* Mensagens que já aparecem escritas quando a conversa abre no WhatsApp. */
  mensagensWhatsApp: {
    contato: "Olá, Vinicius! Vim pelo site e gostaria de conversar sobre o meu negócio.",
    presenca: "Olá, Vinicius! Quero organizar a presença digital do meu negócio.",
    marketing: "Olá, Vinicius! Quero planejar a divulgação do meu negócio.",
    sobMedida: "Olá, Vinicius! Quero conversar sobre um projeto sob medida para a minha empresa.",
    avaliacao: "Olá, Vinicius! Quero solicitar a avaliação gratuita da presença digital do meu negócio.",
  },

  /*
   * Aviso no topo da página — por exemplo, a condição de Black Friday.
   * Fica desligado até você escrever o texto e trocar "ativo" para true.
   *   texto:     a frase do aviso.
   *   textoLink: texto do link ao lado do aviso (opcional), ex.: "Ver os pacotes".
   *   link:      "#pacotes", "#avaliacao", "whatsapp" (abre a conversa) ou um endereço https://
   *   ate:       último dia do aviso, no formato AAAA-MM-DD (opcional). Depois dele, o aviso some sozinho.
   */
  avisoTopo: {
    ativo: true,
    texto: "Black Friday: seu negócio com presença digital em oferta até 30/11.",
    textoLink: "Ver oferta",
    link: "#presenca",
    ate: "2026-11-30",
  },

  /*
   * Formulário de avaliação gratuita.
   *
   * O e-mail que recebe as solicitações NÃO fica neste arquivo: ele é cadastrado
   * no painel do Netlify (ou do serviço escolhido), para não ficar exposto no navegador.
   * Veja o passo a passo no README.md.
   */
  formulario: {
    /*
     * Para onde vão as solicitações:
     *   "netlify"     → formulários do Netlify (recomendado; use depois de publicar e ativar os formulários lá).
     *   "https://..." → outro serviço de formulários, como o Formspree.
     *   "/api/..."    → uma função própria na hospedagem.
     * Vazio = o formulário aparece como temporariamente indisponível e nada é enviado.
     */
    endpoint: "netlify",

    /*
     * Campos extras exigidos por alguns serviços (opcional).
     * Exemplo: { _subject: "Nova solicitação de avaliação gratuita" }
     */
    camposExtras: {},
  },
};
