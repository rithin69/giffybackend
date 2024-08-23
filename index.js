const http = require('http');
const push = require('./push');

const PORT = process.env.PORT || 3333;

// Create HTTP Server
http.createServer((request, response) => {
  // Enable CORS
  response.setHeader('Access-Control-Allow-Origin', '*');
  response.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  response.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight requests
  if (request.method === 'OPTIONS') {
    response.writeHead(204); // No Content
    response.end();
    return;
  }

  // Get request vars
  const { url, method } = request;

  // Subscribe
  if (method === 'POST' && url.match(/^\/subscribe\/?/)) {
    let body = [];

    // Read body stream
    request.on('data', (chunk) => body.push(chunk)).on('end', () => {
      let subscription = JSON.parse(body.toString());
      push.addSubscription(subscription);
      response.end('Subscribed');
    });

  // Public Key
  } else if (url.match(/^\/key\/?/)) {
    response.end(push.getKey());

  // Push Notification
  } else if (method === 'POST' && url.match(/^\/push\/?/)) {
    let body = [];

    // Read body stream
    request.on('data', (chunk) => body.push(chunk)).on('end', () => {
      push.send(body.toString());
      response.end('Push Sent');
    });

  // Not Found
  } else {
    response.writeHead(404, {
      'Content-Type': 'text/plain'
    });
    response.end('Error: Unknown Request');
  }

}).listen(PORT, () => {
  console.log('Server Running');
});
