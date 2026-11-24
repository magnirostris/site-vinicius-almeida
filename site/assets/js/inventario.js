/* Página de inventário: monta a lista, formata os preços em R$ e soma os totais. */
(function () {
  "use strict";

  // Lista do PDF "inventario.pdf". qtd: null = sem quantidade ("--").
  var SECOES = [
    { titulo: "1. Salão", grupos: [
      { titulo: "Mesas e assentos", itens: [
        [4, "Mesas retangulares de madeira"], [2, "Mesas quadradas de madeira"], [3, "Mesas redondas de madeira"],
        [14, "Cadeiras de madeira Tramontina"], [6, "Cadeiras azuis Tramontina"],
        [1, "Bancada de madeira (2,73 m de comprimento)"], [3, "Banquetas altas (tipo bar)"],
        [4, "Estofados de parede (azul - 1,20 m cada)"] ] },
      { titulo: "Vitrines e balcões", itens: [
        [1, "Vitrine refrigerada Refrimate com iluminação (1,29 m altura x 96 cm largura x 61 cm comprimento)"],
        [1, "Vitrine quente Refrimate com iluminação (1,28 m altura x 56 cm largura x 61 cm comprimento)"],
        [1, "Vitrine expositora (1,14 m altura x 1,13 m comprimento x 61 cm largura)"],
        [1, "Balcão vitrine ripado (1,20 m)"], [1, "Balcão com tampo de mármore (91 cm, com divisória)"],
        [1, "Balcão (42 cm, com 4 divisórias)"] ] },
      { titulo: "Iluminação e itens gerais", itens: [
        [8, "Lâmpadas (luz amarela)"], [12, "Luminárias"], [1, "Espelho grande"], [4, "Espelhos médios"],
        [2, "Extintores"], [1, "Gaveteiro com 3 gavetas (51 cm)"] ] }
    ] },
    { titulo: "2. Utensílios", itens: [
      [22, "Copos americanos"], [12, "Xícaras americanas"], [12, "Copos grandes"], [17, "Taças de sobremesa"],
      [9, "Copos para milkshake"], [5, "Xícaras gourmet"], [18, "Xícaras grandes com pires"],
      [4, "Xícaras pequenas com pires"], [33, "Pratos grandes"], [9, "Pratos fundos"], [57, "Pratos de sobremesa"],
      [55, "Garfos"], [46, "Colheres"], [29, "Facas"], [null, "Panelas"],
      [20, "Mix de taças (vinho, espumante, martini)"], [6, "Copos para drink"], [48, "Cumbucas de barro"],
      [null, "Mix de panelas, bandejas, travessas e demais itens de cozinha"] ] },
    { titulo: "3. Eletrodomésticos e equipamentos", itens: [
      [2, "Geladeiras"], [1, "Freezer horizontal uma porta"], [1, "Fogão industrial (4 bocas)"], [1, "Forno Progás"],
      [1, "Fritadeira elétrica industrial"], [1, "Air fryer"], [1, "Coifa"], [2, "Cilindro de gás"],
      [1, "Cilindro para massa (laminadora)"], [1, "Cutter (processador industrial)"], [1, "Liquidificador"],
      [1, "Máquina de milkshake"], [1, "Micro-ondas"] ] },
    { titulo: "4. Outros", itens: [
      [2, "Mesa inox"], [1, "Mesa com tampo de vidro e 4 cadeiras de plástico"], [1, "Prateleira (4 divisões)"],
      [1, "Escada de ferro"], [1, "Mesa de escritório montável"], [1, "Impressora térmica"],
      [null, "Pranchetas, porta-velas e porta-guardanapos"], [2, "Estantes de alumínio"],
      [4, "Prateleiras de madeira"], [1, "Ar-condicionado split"], [1, "Gelágua"],
      [1, "Armário com divisórias para funcionários"] ] },
    { titulo: "Itens à parte", itens: [
      [12, "Cadeiras Tolix Iron Industrial"], [2, "Freezer conversível"], [1, "Fogão industrial inox 8 bocas Venâncio"],
      [1, "Forno elétrico miniconv Prática"], [1, "Sorveteira FortFrio"],
      [24, "Pratos fundos Porto Brasil Bio Breeze 22,5cm"], [24, "Pratos rasos Porto Brasil Bio Titanium 27,5cm"] ] }
  ];

  var CHAVE = "monkberry-inventario-v1";
  var brl = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
  var tbody = document.querySelector("#inventario tbody");
  var linhas = [];
  var estado = {};

  try { estado = JSON.parse(localStorage.getItem(CHAVE)) || {}; } catch (e) { estado = {}; }
  function salvar() { try { localStorage.setItem(CHAVE, JSON.stringify(estado)); } catch (e) {} }

  // Aceita "1.600", "1600,50", "R$ 1.600,50".
  function lerValor(texto) {
    var t = String(texto).replace(/[^\d,.-]/g, "");
    if (!t) return 0;
    if (t.indexOf(",") !== -1) t = t.replace(/\./g, "").replace(",", ".");
    else if (/^\d{1,3}(\.\d{3})+$/.test(t)) t = t.replace(/\./g, "");
    var n = parseFloat(t);
    return isFinite(n) && n > 0 ? n : 0;
  }

  function celula(tag, classe, conteudo) {
    var el = document.createElement(tag);
    if (classe) el.className = classe;
    if (conteudo != null) el.textContent = conteudo;
    return el;
  }

  function cabecalho(texto, classe) {
    var tr = celula("tr", classe);
    var th = celula("th", null, texto);
    th.colSpan = 4;
    th.scope = "colgroup";
    tr.appendChild(th);
    tbody.appendChild(tr);
  }

  var seq = 0;
  function item(qtd, nome) {
    var id = "i" + (++seq);
    var tr = celula("tr");
    var tdCheck = celula("td", "c-check");
    var cb = document.createElement("input");
    cb.type = "checkbox";
    cb.id = "cb-" + id;
    cb.checked = !!(estado[id] && estado[id].c);
    cb.setAttribute("aria-label", "Marcar: " + nome);
    tdCheck.appendChild(cb);

    var tdItem = celula("td", "c-item");
    var label = celula("label", null, nome);
    label.htmlFor = cb.id;
    tdItem.appendChild(label);

    var tdPreco = celula("td", "c-preco");
    var inp = document.createElement("input");
    inp.type = "text";
    inp.inputMode = "decimal";
    inp.className = "inv-price";
    inp.placeholder = "R$ 0,00";
    inp.autocomplete = "off";
    inp.setAttribute("aria-label", "Preço em reais: " + nome);
    if (estado[id] && estado[id].p) inp.value = brl.format(estado[id].p);
    tdPreco.appendChild(inp);

    tr.appendChild(tdCheck);
    tr.appendChild(celula("td", "c-qtd", qtd == null ? "—" : qtd));
    tr.appendChild(tdItem);
    tr.appendChild(tdPreco);
    tbody.appendChild(tr);

    var l = { id: id, tr: tr, cb: cb, inp: inp };
    linhas.push(l);

    cb.addEventListener("change", function () { atualizar(l); });
    inp.addEventListener("input", function () { atualizar(l); });
    inp.addEventListener("blur", function () {
      var v = lerValor(inp.value);
      inp.value = v ? brl.format(v) : "";
    });
    inp.addEventListener("focus", function () { inp.select(); });
  }

  function atualizar(l) {
    if (l) {
      var p = lerValor(l.inp.value);
      if (l.cb.checked || p) estado[l.id] = { c: l.cb.checked ? 1 : 0, p: p };
      else delete estado[l.id];
      salvar();
    }
    totais();
  }

  function totais() {
    var total = 0, marcados = 0;
    linhas.forEach(function (l) {
      var p = lerValor(l.inp.value);
      total += p;
      if (l.cb.checked) marcados += p;
      l.tr.classList.toggle("is-checked", l.cb.checked);
    });
    document.querySelectorAll("[data-total]").forEach(function (el) { el.textContent = brl.format(total); });
    document.querySelectorAll("[data-sel]").forEach(function (el) { el.textContent = brl.format(marcados); });
  }

  SECOES.forEach(function (s) {
    cabecalho(s.titulo, "inv-section");
    if (s.grupos) {
      s.grupos.forEach(function (g) {
        cabecalho(g.titulo, "inv-sub");
        g.itens.forEach(function (i) { item(i[0], i[1]); });
      });
    } else {
      s.itens.forEach(function (i) { item(i[0], i[1]); });
    }
  });

  document.getElementById("limpar").addEventListener("click", function () {
    if (!window.confirm("Limpar todas as marcações e preços?")) return;
    estado = {};
    salvar();
    linhas.forEach(function (l) { l.cb.checked = false; l.inp.value = ""; });
    totais();
  });

  totais();
})();
