'use strict';

const http = require('http');
const fs   = require('fs');
const path = require('path');

const PORT = process.env.PORT || 8080;
const DIST = path.join(__dirname, 'dist');

const MIME = {
  '.html':  'text/html; charset=utf-8',
  '.js':    'application/javascript',
  '.mjs':   'application/javascript',
  '.css':   'text/css',
  '.json':  'application/json',
  '.png':   'image/png',
  '.jpg':   'image/jpeg',
  '.jpeg':  'image/jpeg',
  '.gif':   'image/gif',
  '.svg':   'image/svg+xml',
  '.ico':   'image/x-icon',
  '.woff':  'font/woff',
  '.woff2': 'font/woff2',
  '.ttf':   'font/ttf',
  '.webp':  'image/webp',
};

http.createServer((req, res) => {
  const urlPath  = decodeURIComponent(req.url.split('?')[0]);
  const candidate = path.normalize(path.join(DIST, urlPath));

  // Security: prevent path traversal outside DIST
  if (!candidate.startsWith(DIST + path.sep) && candidate !== DIST) {
    res.writeHead(403);
    return res.end();
  }

  fs.stat(candidate, (err, stat) => {
    // If the file doesn't exist, fall back to index.html (SPA routing)
    const target      = (!err && stat.isFile()) ? candidate : path.join(DIST, 'index.html');
    const contentType = MIME[path.extname(target).toLowerCase()] || 'application/octet-stream';

    fs.readFile(target, (readErr, data) => {
      if (readErr) {
        res.writeHead(500);
        return res.end('Internal Server Error');
      }
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(data);
    });
  });
}).listen(PORT, () => {
  console.log(`Serving dist/ on port ${PORT}`);
});
