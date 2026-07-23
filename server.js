const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3001;
const appDir = __dirname;
const publicDir = path.join(__dirname, '..', 'public');

const mimeTypes = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon'
};

function sendFile(res, filePath) {
  fs.readFile(filePath, (error, content) => {
    if (error) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('Arquivo não encontrado');
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    res.writeHead(200, {
      'Content-Type': mimeTypes[ext] || 'application/octet-stream',
      'Cache-Control': 'no-store'
    });
    res.end(content);
  });
}

function safeResolve(baseDir, requestPath) {
  const resolvedPath = path.normalize(path.join(baseDir, requestPath));
  return resolvedPath.startsWith(baseDir) ? resolvedPath : null;
}

const server = http.createServer((req, res) => {
  const url = decodeURIComponent(req.url.split('?')[0]);

  if (url === '/' || url === '/index.html') {
    sendFile(res, path.join(appDir, 'index.html'));
    return;
  }

  if (url.startsWith('/generated/')) {
    const filePath = safeResolve(publicDir, url.replace(/^\//, ''));
    if (filePath && fs.existsSync(filePath)) {
      sendFile(res, filePath);
      return;
    }
  }

  const appFilePath = safeResolve(appDir, url.replace(/^\//, ''));
  if (appFilePath && fs.existsSync(appFilePath) && fs.statSync(appFilePath).isFile()) {
    sendFile(res, appFilePath);
    return;
  }

  const publicFilePath = safeResolve(publicDir, url.replace(/^\//, ''));
  if (publicFilePath && fs.existsSync(publicFilePath) && fs.statSync(publicFilePath).isFile()) {
    sendFile(res, publicFilePath);
    return;
  }

  res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
  res.end('Arquivo não encontrado');
});

server.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
  console.log(`Imagens disponíveis em http://localhost:${PORT}/generated/restaurante-foto-1.jpg`);
});
