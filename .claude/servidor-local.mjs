// Servidor local para revisar o site (sem cache). Não faz parte do site publicado.
// Uso, na pasta do projeto:  node .claude/servidor-local.mjs   →   http://localhost:4173
//
// Serve a pasta "site". Para testes do formulário, também responde a:
//   POST /__teste/ok   → sucesso         (use "/__teste/ok" em formulario.endpoint, só para testar)
//   POST /__teste/erro → erro            (use "/__teste/erro")
// Envios no modo "netlify" só funcionam depois de publicar no Netlify; aqui eles recebem erro,
// a não ser que o servidor seja iniciado com SIMULAR_NETLIFY=1 (apenas para testes).
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(process.argv[2] || path.join(here, '..', 'site'));
const port = Number(process.argv[3] || process.env.PORT || 4173);
const simulateNetlify = process.env.SIMULAR_NETLIFY === '1';

const types = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.json': 'application/json',
  '.txt': 'text/plain; charset=utf-8',
};

const readBody = (req) => new Promise((resolve) => {
  let body = '';
  req.on('data', (chunk) => { body += chunk; });
  req.on('end', () => resolve(body));
});

http.createServer(async (req, res) => {
  const url = new URL(req.url, 'http://localhost');

  if (req.method === 'POST') {
    const body = await readBody(req);
    setTimeout(() => {
      if (url.pathname.startsWith('/__teste/')) {
        const ok = url.pathname === '/__teste/ok';
        console.log(`[teste] ${url.pathname} recebeu: ${body}`);
        res.writeHead(ok ? 200 : 500, { 'content-type': 'application/json' });
        res.end(ok ? '{"ok":true}' : '{"ok":false}');
        return;
      }
      const isNetlifyForm = new URLSearchParams(body).has('form-name');
      if (isNetlifyForm && simulateNetlify) {
        console.log(`[netlify simulado] recebeu: ${body}`);
        res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' });
        res.end('<!doctype html><p>Formulário recebido (simulação local).</p>');
        return;
      }
      console.log(isNetlifyForm
        ? '[aviso] Envio no modo "netlify" recebido localmente: ele só funciona depois de publicar no Netlify.'
        : `[aviso] POST sem destino em ${url.pathname}`);
      res.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' });
      res.end('404');
    }, 700);
    return;
  }

  let requested = decodeURIComponent(url.pathname);
  if (requested.endsWith('/')) requested += 'index.html';
  const file = path.join(root, requested);
  if (file !== root && !file.startsWith(root + path.sep)) {
    res.writeHead(403);
    res.end();
    return;
  }

  fs.stat(file, (err, stat) => {
    if (err || !stat.isFile()) {
      res.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' });
      res.end('404');
      return;
    }
    res.writeHead(200, {
      'content-type': types[path.extname(file).toLowerCase()] || 'application/octet-stream',
      'cache-control': 'no-store',
    });
    fs.createReadStream(file).pipe(res);
  });
}).listen(port, '127.0.0.1', () => {
  console.log(`Site disponível em http://localhost:${port} (pasta: ${root})${simulateNetlify ? ' — simulando Netlify' : ''}`);
});
