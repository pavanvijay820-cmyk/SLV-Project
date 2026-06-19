const http = require('http');

function post(url, data) {
  return new Promise((resolve, reject) => {
    const u = new URL(url);
    const body = JSON.stringify(data);
    const req = http.request({
      hostname: u.hostname,
      port: u.port,
      path: u.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body)
      }
    }, (res) => {
      let raw = '';
      res.on('data', chunk => raw += chunk);
      res.on('end', () => {
        try { resolve(JSON.parse(raw)); } catch(e) { reject(new Error('Parse error: ' + raw)); }
      });
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

function get(url, token) {
  return new Promise((resolve, reject) => {
    const u = new URL(url);
    const req = http.request({
      hostname: u.hostname,
      port: u.port,
      path: u.pathname,
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    }, (res) => {
      let raw = '';
      res.on('data', chunk => raw += chunk);
      res.on('end', () => {
        try { resolve(JSON.parse(raw)); } catch(e) { reject(new Error('Parse error: ' + raw)); }
      });
    });
    req.on('error', reject);
    req.end();
  });
}

async function getDashboard() {
  try {
    const loginRes = await post('http://localhost:5000/api/auth/login', {
      email: 'admin@slvevents.com',
      password: 'admin123'
    });
    
    const token = loginRes.token;
    console.log('Login successful! Token acquired.');
    
    const dashboardRes = await get('http://localhost:5000/api/reports/dashboard', token);
    console.log('Dashboard Response summary:', JSON.stringify(dashboardRes.summary, null, 2));
  } catch (err) {
    console.error('Error fetching dashboard via API:', err.message);
  }
}

getDashboard();
