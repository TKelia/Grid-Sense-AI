const http = require('http');
const fs = require('fs');
const path = require('path');

const mimeTypes = {
    '.html': 'text/html',
    '.js': 'text/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon'
};

const server = http.createServer((req, res) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);

    // Handle API requests
    if (req.url.startsWith('/api')) {
        handleAPI(req, res);
        return;
    }

    // Clean up URL and map to file paths
    let url = req.url.split('?')[0];
    let filePath = path.join(__dirname, url === '/' ? 'index.html' : url);

    // Handle routes
    if (url === '/dashboard' || url === '/login') {
        filePath = path.join(__dirname, `${url}.html`);
    }

    // Get file extension
    const extname = String(path.extname(filePath)).toLowerCase();
    
    // Check if we should serve the file
    if (!extname && !url.endsWith('.html')) {
        filePath = path.join(__dirname, '404.html');
    }

    const contentType = mimeTypes[extname] || 'application/octet-stream';

    fs.readFile(filePath, (error, content) => {
        if (error) {
            if (error.code === 'ENOENT') {
                fs.readFile(path.join(__dirname, '404.html'), (err, content) => {
                    if (err) {
                        res.writeHead(500);
                        res.end('Error loading 404 page');
                        return;
                    }
                    res.writeHead(404, { 'Content-Type': 'text/html' });
                    res.end(content, 'utf-8');
                });
            } else {
                res.writeHead(500);
                res.end(`Server Error: ${error.code}`);
            }
        } else {
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content, 'utf-8');
        }
    });
});

function handleAPI(req, res) {
    const handlers = {
        '/api/auth/login': handleLogin,
        '/api/auth/signup': handleSignup,
        '/api/power/usage': handlePowerUsage
    };

    const handler = handlers[req.url];
    if (handler) {
        handler(req, res);
    } else {
        res.writeHead(404);
        res.end('API endpoint not found');
    }
}

function handleLogin(req, res) {
    if (req.method !== 'POST') {
        res.writeHead(405);
        res.end('Method not allowed');
        return;
    }

    let body = '';
    req.on('data', chunk => {
        body += chunk.toString();
    });
    req.on('end', () => {
        try {
            const { email, password } = JSON.parse(body);
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
                token: 'demo-token',
                user: { email }
            }));
        } catch (error) {
            res.writeHead(400);
            res.end('Invalid request');
        }
    });
}

function handleSignup(req, res) {
    if (req.method !== 'POST') {
        res.writeHead(405);
        res.end('Method not allowed');
        return;
    }

    let body = '';
    req.on('data', chunk => {
        body += chunk.toString();
    });
    req.on('end', () => {
        try {
            const { email, password } = JSON.parse(body);
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
                token: 'demo-token',
                user: { email }
            }));
        } catch (error) {
            res.writeHead(400);
            res.end('Invalid request');
        }
    });
}

function handlePowerUsage(req, res) {
    const data = {
        devices: [
            { name: 'TV', usage: 80 },
            { name: 'Refrigerator', usage: 150 },
            { name: 'AC', usage: 1200 },
            { name: 'Washing Machine', usage: 500 }
        ],
        totalUsage: 1930,
        recommendations: [
            'Consider using the AC at 24°C for optimal efficiency',
            'Your TV consumption is higher than usual',
            'The refrigerator is running efficiently'
        ]
    };

    res.writeHead(200, {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
    });
    res.end(JSON.stringify(data));
}

const port = 8000;
server.listen(port, () => {
    console.log(`Server running at http://localhost:${port}/`);
});
