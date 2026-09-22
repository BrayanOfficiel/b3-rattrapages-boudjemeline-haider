const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;
const MIN_CONFIDENCE = parseFloat(process.env.MIN_CONFIDENCE) || 0.5;
const PUBLIC_DIR = path.join(__dirname, 'public');

const MIME = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.svg': 'image/svg+xml',
};

/** Send a file from /public, 404 if it does not exist. */
function serveStatic(reqPath, res) {
  const file = reqPath === '/' ? '/index.html' : reqPath;
  const fullPath = path.join(PUBLIC_DIR, file);

  // no ../ tricks
  if (!fullPath.startsWith(PUBLIC_DIR)) {
    res.writeHead(403);
    return res.end();
  }

  fs.readFile(fullPath, (err, data) => {
    if (err) {
      res.writeHead(404);
      return res.end('Not found');
    }
    res.writeHead(200, { 'Content-Type': MIME[path.extname(file)] || 'application/octet-stream' });
    res.end(data);
  });
}

const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);

  // the front reads the threshold here, so it can change without touching the code
  if (url.pathname === '/config') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ minConfidence: MIN_CONFIDENCE }));
  }

  serveStatic(url.pathname, res);
});

server.listen(PORT, () => {
  console.log(`Picard vision running on http://localhost:${PORT} (min confidence ${MIN_CONFIDENCE})`);
});
