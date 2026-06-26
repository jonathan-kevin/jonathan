const http = require('http');
const fs = require('fs');
const path = require('path');

const root = __dirname;
const port = Number(process.argv[2] || process.env.PORT || 8129);

const contentTypes = {
	'.css': 'text/css; charset=utf-8',
	'.gif': 'image/gif',
	'.html': 'text/html; charset=utf-8',
	'.jpg': 'image/jpeg',
	'.jpeg': 'image/jpeg',
	'.js': 'text/javascript; charset=utf-8',
	'.json': 'application/json; charset=utf-8',
	'.png': 'image/png',
	'.svg': 'image/svg+xml',
	'.ttf': 'font/ttf',
	'.woff2': 'font/woff2'
};

function safePath(urlPath) {
	const decoded = decodeURIComponent(urlPath.split('?')[0]);
	const requested = decoded === '/' ? '/softadmin-ai-poc.html' : decoded;
	const fullPath = path.normalize(path.join(root, requested));

	if (!fullPath.startsWith(root)) {
		return null;
	}

	return fullPath;
}

http.createServer((request, response) => {
	const filePath = safePath(request.url || '/');

	if (!filePath) {
		response.writeHead(403);
		response.end('Forbidden');
		return;
	}

	fs.readFile(filePath, (error, data) => {
		if (error) {
			response.writeHead(404);
			response.end('Not found');
			return;
		}

		response.writeHead(200, {
			'content-type': contentTypes[path.extname(filePath).toLowerCase()] || 'application/octet-stream'
		});
		response.end(data);
	});
}).listen(port, '127.0.0.1', () => {
	console.log(`Softadmin AI Mockup Demo running at http://127.0.0.1:${port}/softadmin-ai-poc.html`);
});

