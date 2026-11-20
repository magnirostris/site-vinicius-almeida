# Site — Vinicius Almeida · Design e marketing

Página única, sem etapa de build. Tudo o que vai para o ar está na pasta `site/`.

## Como ver

- **Mais simples:** abra `site/index.html` no navegador (dois cliques).
- **Como ficará publicado:** na pasta do projeto, rode `node .claude/servidor-local.mjs` e acesse
  http://localhost:4173. Precisa do Node.js, que já está instalado neste computador.

## Arquivos

```
README.md                     este guia (não vai para o ar)
.claude/                      servidor de revisão local (não vai para o ar)
netlify.toml                  diz ao Netlify que o site é a pasta site (não vai para o ar)
.gitignore, .gitattributes    regras do Git (não vão para o ar)
site/                         ← a pasta que é publicada
  index.html                  conteúdo da página, título e descrição para busca e compartilhamento
  favicon.svg                 ícone da aba do navegador
  assets/css/styles.css       visual: cores, tipografia, espaçamentos e versão para celular
  assets/js/config.js         ← CONFIGURAÇÕES: WhatsApp, mensagens prontas, aviso no topo e formulário
  assets/js/main.js           comportamento: links de WhatsApp, menu, aviso, validação e envio do formulário
  assets/img/                 retrato otimizado (WebP), imagem de compartilhamento e ícone para celular
```

A cor principal (azul `#1A65F5`) fica nas variáveis `--accent` no início de `site/assets/css/styles.css`.
O ícone da aba (`favicon.svg`), o ícone para celular e a imagem de compartilhamento usam a mesma cor:
se ela mudar, esses três arquivos precisam ser refeitos.

## Situação atual

- **WhatsApp:** configurado em `site/assets/js/config.js` → `whatsapp`. Os botões “Entrar em contato” e os dos
  pacotes abrem a conversa com uma mensagem pronta, que pode ser editada em `mensagensWhatsApp`.
- **Formulário:** `formulario.endpoint` está em `"netlify"`. As solicitações aparecem no painel do Netlify,
  em *Forms*, no formulário “avaliacao”.

| Ainda pendente | Onde ajustar | Como o site se comporta agora |
| --- | --- | --- |
| Aviso de cada solicitação por e-mail | No painel do Netlify (passo 2 abaixo) | As solicitações ficam guardadas em *Forms*, mas ninguém é avisado. O e-mail fica fora do código para não ficar exposto no navegador. |
| Site aberto ao público | Netlify → configurações do projeto → acesso de visitantes (*Visitor access*) | A proteção do time está ligada: quem abre o link vê “This site is private” e só membros do time do Netlify, conectados, veem a página. |
| Domínio | Netlify → *Domain management* e as três linhas de endereço no `<head>` do `site/index.html` | O site funciona em https://darling-griffin-170881.netlify.app. Com domínio próprio, troque esse endereço nas três linhas. |
| Condição de Black Friday | `site/assets/js/config.js` → `avisoTopo` | Aviso no topo pronto e desligado; nenhuma condição foi inventada. |

## Publicação: GitHub + Netlify

O código fica no repositório privado https://github.com/magnirostris/site-vinicius-almeida. Ligado a ele, o
Netlify publica sozinho cada nova versão enviada para a branch `main`, em cerca de um minuto; o `netlify.toml`
indica que o site é a pasta `site`. Escolhi o Netlify porque o plano gratuito hospeda sites como este e, desde
abril de 2026, os envios de formulário são gratuitos e ilimitados nos planos atuais. Os nomes dos menus podem
mudar um pouco no painel do Netlify.

1. **Ligar o GitHub ao Netlify (uma vez só):** nas configurações do projeto no Netlify, em *Build & deploy* →
   *Continuous deployment*, clique em *Link repository*, escolha GitHub, autorize o acesso só a este repositório
   e selecione `site-vinicius-almeida`, branch `main`. Deixe o comando de build vazio: a pasta de publicação
   vem do `netlify.toml`.
2. **Aviso por e-mail:** nas configurações do projeto, procure as notificações de formulário
   (*Form submission notifications*) e adicione uma notificação por e-mail para o formulário “avaliacao”.
   Segundo o próprio Netlify, o endereço precisa ser de alguém do time da conta.
3. **Testar:** envie uma solicitação pelo site publicado e confira se ela aparece em *Forms* e chega ao e-mail.
   Clique também em cada botão de WhatsApp.
4. **Domínio próprio (opcional, recomendado):** registre o domínio (para `.com.br`, no registro.br) e
   adicione-o no Netlify, em *Domain management*, seguindo as instruções de DNS. O HTTPS é automático.
5. **Compartilhamento:** o `<head>` do `site/index.html` usa o endereço completo do site em três linhas
   (`canonical`, `og:url` e `og:image`), hoje com `https://darling-griffin-170881.netlify.app`. Com domínio
   próprio, troque o endereço nessas três linhas.

A detecção de formulários já está ativada no projeto. Documentação: https://docs.netlify.com/manage/forms/setup

A versão oficial é a que está no GitHub. Alterações que não passam pelo repositório, como as feitas direto no
painel do Netlify, somem na próxima publicação.

Cuidado no plano gratuito: se a conta passar dos limites mensais de uso, o Netlify pausa o site até o mês
seguinte (e, pausado, ele também não recebe formulários). Um site como este costuma ficar bem abaixo.

### Alternativa sem Netlify

Em qualquer outra hospedagem, use um serviço de formulários como o Formspree (o plano gratuito tem um
limite de envios por mês, em torno de 50): crie o formulário lá, cadastre o e-mail no painel deles e cole
em `formulario.endpoint` o endereço `https://...` que eles fornecerem. O site envia os dados em JSON:

```json
{
  "nome": "Maria Silva",
  "empresa": "Doceria Exemplo",
  "whatsapp": "(11) 98765-4321",
  "cidade": "Campinas",
  "instagram": "@doceriaexemplo",
  "origem": "Site · avaliação gratuita"
}
```

Em qualquer modo, a confirmação “Solicitação recebida!” só aparece quando o serviço responde com sucesso.
Em caso de falha, a pessoa vê uma mensagem de erro e os dados continuam preenchidos.

## Aviso no topo (Black Friday)

Quando a condição de Black Friday estiver definida, preencha `avisoTopo` em `site/assets/js/config.js`:

```js
avisoTopo: {
  ativo: true,
  texto: "Escreva aqui a condição de Black Friday.",
  textoLink: "Ver os pacotes",   // opcional
  link: "#pacotes",              // "#pacotes", "#avaliacao", "whatsapp" ou um endereço https://
  ate: "2026-11-30",             // opcional: depois desse dia, o aviso some sozinho
},
```

O aviso aparece numa faixa azul acima do menu, no computador e no celular. Com `ativo: false`
(o padrão), nada aparece.

## Seção “Trabalhos e resultados” (oculta)

A seção já está pronta no `site/index.html`, com os projetos previstos (Dalice, Kareuóka e Estela Geromini),
mas sem imagens, descrições ou resultados. Para exibir:

1. Preencha cada card com conteúdo real (as linhas comentadas indicam onde).
2. Remova o atributo `hidden` da `<section id="trabalhos">`.
3. Acrescente `<li><a href="#trabalhos">Trabalhos</a></li>` no menu principal e no rodapé.

## Testes locais do formulário

O servidor de revisão (`node .claude/servidor-local.mjs`) não envia nada de verdade:

- Com `formulario.endpoint` em `"netlify"` (a configuração atual), o envio local mostra erro, porque esse modo
  só funciona no site publicado. Para simular o Netlify, inicie o servidor assim (PowerShell):
  `$env:SIMULAR_NETLIFY='1'; node .claude/servidor-local.mjs`
- Para ver a tela de sucesso localmente, use temporariamente `"/__teste/ok"` (ou `"/__teste/erro"` para a de
  erro) e volte ao valor anterior depois.

## Checklist de publicação

- [x] Criar a conta no Netlify e enviar a primeira versão.
- [x] Preencher o WhatsApp e ligar o formulário ao Netlify.
- [x] Guardar o código no repositório privado do GitHub.
- [x] Ligar o repositório ao projeto no Netlify.
- [x] Usar o endereço completo do site na imagem de compartilhamento, no `canonical` e no `og:url`.
- [ ] Desligar a proteção do time no Netlify e testar cada botão de WhatsApp no site publicado.
- [ ] Cadastrar o aviso por e-mail e confirmar que o envio de teste chegou.
- [ ] Registrar o domínio próprio e trocar o endereço nas três linhas do `<head>`.
- [ ] Compartilhar o link no WhatsApp e conferir a pré-visualização.
