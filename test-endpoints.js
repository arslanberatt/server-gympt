const http = require('http');

// Test configuration
const BASE_URL = 'http://localhost:3000';
const testResults = [];

// Helper function to make HTTP requests
function makeRequest(method, path, data = null, cookies = '') {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const options = {
      hostname: url.hostname,
      port: url.port || 3000,
      path: url.pathname,
      method: method,
      headers: {
        'Content-Type': 'application/json',
      }
    };

    if (cookies) {
      options.headers['Cookie'] = cookies;
    }

    const req = http.request(options, (res) => {
      let body = '';
      const cookies = res.headers['set-cookie'] || [];
      
      res.on('data', (chunk) => {
        body += chunk;
      });

      res.on('end', () => {
        let parsedBody;
        try {
          parsedBody = JSON.parse(body);
        } catch (e) {
          parsedBody = body;
        }
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: parsedBody,
          cookies: cookies
        });
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (data) {
      req.write(JSON.stringify(data));
    }

    req.end();
  });
}

// Test functions
async function testSignup() {
  console.log('\n📝 Testing POST /signup...');
  try {
    const response = await makeRequest('POST', '/signup', {
      email: 'test@example.com',
      password: '123456'
    });
    
    const result = {
      endpoint: 'POST /signup',
      status: response.statusCode,
      success: response.statusCode === 201,
      response: response.body
    };
    
    testResults.push(result);
    console.log(`   Status: ${response.statusCode}`);
    console.log(`   Response:`, JSON.stringify(response.body, null, 2));
    
    return response.cookies;
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
    testResults.push({
      endpoint: 'POST /signup',
      status: 'ERROR',
      success: false,
      error: error.message
    });
    return [];
  }
}

async function testLogin() {
  console.log('\n🔐 Testing POST /login...');
  try {
    const response = await makeRequest('POST', '/login', {
      email: 'test@example.com',
      password: '123456'
    });
    
    const result = {
      endpoint: 'POST /login',
      status: response.statusCode,
      success: response.statusCode === 200,
      response: response.body
    };
    
    testResults.push(result);
    console.log(`   Status: ${response.statusCode}`);
    console.log(`   Response:`, JSON.stringify(response.body, null, 2));
    
    return response.cookies;
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
    testResults.push({
      endpoint: 'POST /login',
      status: 'ERROR',
      success: false,
      error: error.message
    });
    return [];
  }
}

async function testLoginInvalid() {
  console.log('\n❌ Testing POST /login with invalid credentials...');
  try {
    const response = await makeRequest('POST', '/login', {
      email: 'wrong@example.com',
      password: 'wrongpass'
    });
    
    const result = {
      endpoint: 'POST /login (invalid)',
      status: response.statusCode,
      success: response.statusCode === 400,
      response: response.body
    };
    
    testResults.push(result);
    console.log(`   Status: ${response.statusCode}`);
    console.log(`   Response:`, JSON.stringify(response.body, null, 2));
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
    testResults.push({
      endpoint: 'POST /login (invalid)',
      status: 'ERROR',
      success: false,
      error: error.message
    });
  }
}

async function testSignupDuplicate() {
  console.log('\n🔄 Testing POST /signup with duplicate email...');
  try {
    const response = await makeRequest('POST', '/signup', {
      email: 'test@example.com',
      password: '123456'
    });
    
    const result = {
      endpoint: 'POST /signup (duplicate)',
      status: response.statusCode,
      success: response.statusCode === 400,
      response: response.body
    };
    
    testResults.push(result);
    console.log(`   Status: ${response.statusCode}`);
    console.log(`   Response:`, JSON.stringify(response.body, null, 2));
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
    testResults.push({
      endpoint: 'POST /signup (duplicate)',
      status: 'ERROR',
      success: false,
      error: error.message
    });
  }
}

async function testSmoothies(cookies) {
  console.log('\n🥤 Testing GET /smoothies (protected route)...');
  try {
    const cookieString = cookies.map(c => c.split(';')[0]).join('; ');
    const response = await makeRequest('GET', '/smoothies', null, cookieString);
    
    const result = {
      endpoint: 'GET /smoothies',
      status: response.statusCode,
      success: response.statusCode === 200 || response.statusCode === 302,
      response: 'Protected route accessed'
    };
    
    testResults.push(result);
    console.log(`   Status: ${response.statusCode}`);
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
    testResults.push({
      endpoint: 'GET /smoothies',
      status: 'ERROR',
      success: false,
      error: error.message
    });
  }
}

async function testLogout(cookies) {
  console.log('\n🚪 Testing GET /logout...');
  try {
    const cookieString = cookies.map(c => c.split(';')[0]).join('; ');
    const response = await makeRequest('GET', '/logout', null, cookieString);
    
    const result = {
      endpoint: 'GET /logout',
      status: response.statusCode,
      success: response.statusCode === 200 || response.statusCode === 302,
      response: 'Logged out'
    };
    
    testResults.push(result);
    console.log(`   Status: ${response.statusCode}`);
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
    testResults.push({
      endpoint: 'GET /logout',
      status: 'ERROR',
      success: false,
      error: error.message
    });
  }
}

// Run all tests
async function runTests() {
  console.log('🚀 Starting endpoint tests...\n');
  console.log('⚠️  Note: Make sure the server is running on port 3000');
  console.log('⚠️  Note: MongoDB connection is required for full functionality\n');

  // Test signup
  const signupCookies = await testSignup();
  
  // Wait a bit between requests
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Test duplicate signup
  await testSignupDuplicate();
  
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Test login
  const loginCookies = await testLogin();
  
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Test invalid login
  await testLoginInvalid();
  
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Test protected route
  if (loginCookies.length > 0) {
    await testSmoothies(loginCookies);
  }
  
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Test logout
  if (loginCookies.length > 0) {
    await testLogout(loginCookies);
  }

  // Print summary
  console.log('\n' + '='.repeat(50));
  console.log('📊 TEST SUMMARY');
  console.log('='.repeat(50));
  
  const passed = testResults.filter(t => t.success).length;
  const failed = testResults.filter(t => !t.success).length;
  
  testResults.forEach(result => {
    const icon = result.success ? '✅' : '❌';
    console.log(`${icon} ${result.endpoint}: ${result.status}`);
    if (result.error) {
      console.log(`   Error: ${result.error}`);
    }
  });
  
  console.log('\n' + '='.repeat(50));
  console.log(`Total: ${testResults.length} | Passed: ${passed} | Failed: ${failed}`);
  console.log('='.repeat(50) + '\n');
}

// Run tests
runTests().catch(console.error);

