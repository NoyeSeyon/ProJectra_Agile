const http = require('http');

const testRegistration = () => {
  const postData = JSON.stringify({
    firstName: 'John',
    lastName: 'Doe', 
    email: `test-${Date.now()}@example.com`,
    password: 'password123',
    organizationName: 'Test Company'
  });

  const options = {
    hostname: 'localhost',
    port: 5001,
    path: '/api/auth/register',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData)
    }
  };

  const req = http.request(options, (res) => {
    console.log(`Status: ${res.statusCode}`);
    console.log(`Headers: ${JSON.stringify(res.headers)}`);
    
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      console.log('Response:', data);
      try {
        const parsed = JSON.parse(data);
        if (parsed.success) {
          console.log('✅ Registration successful!');
          testLogin(parsed.data.user.email, 'password123');
        } else {
          console.log('❌ Registration failed:', parsed.message);
        }
      } catch (e) {
        console.log('❌ Failed to parse response:', e.message);
      }
    });
  });

  req.on('error', (e) => {
    console.error(`Problem with request: ${e.message}`);
  });

  req.write(postData);
  req.end();
};

const testLogin = (email, password) => {
  const postData = JSON.stringify({
    email: email,
    password: password
  });

  const options = {
    hostname: 'localhost',
    port: 5001,
    path: '/api/auth/login',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData)
    }
  };

  const req = http.request(options, (res) => {
    console.log(`\nLogin Status: ${res.statusCode}`);
    
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      console.log('Login Response:', data);
      try {
        const parsed = JSON.parse(data);
        if (parsed.success) {
          console.log('✅ Login successful!');
        } else {
          console.log('❌ Login failed:', parsed.message);
        }
      } catch (e) {
        console.log('❌ Failed to parse login response:', e.message);
      }
    });
  });

  req.on('error', (e) => {
    console.error(`Login request error: ${e.message}`);
  });

  req.write(postData);
  req.end();
};

console.log('🧪 Testing Registration and Login...');
testRegistration();
