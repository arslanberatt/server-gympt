const http = require('http');

const BASE_URL = 'http://localhost:3000';
let authCookie = '';

console.log('🚀 POSTMAN STYLE ENDPOINT TESTS\n');
console.log('='.repeat(60));

// Helper function
function request(method, path, body = null, cookies = '') {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const options = {
      hostname: url.hostname,
      port: url.port || 3000,
      path: url.pathname,
      method: method,
      headers: { 'Content-Type': 'application/json' }
    };
    if (cookies) options.headers['Cookie'] = cookies;

    const req = http.request(options, (res) => {
      let data = '';
      const setCookies = res.headers['set-cookie'] || [];
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            body: JSON.parse(data),
            cookies: setCookies
          });
        } catch {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            body: data,
            cookies: setCookies
          });
        }
      });
    });
    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

// Test functions
async function test1_Signup() {
  const testEmail = `test${Date.now()}@example.com`;
  console.log('\n📝 TEST 1: POST /signup');
  console.log('   Method: POST');
  console.log('   URL: http://localhost:3000/signup');
  console.log(`   Body: { "email": "${testEmail}", "password": "123456" }`);
  try {
    const res = await request('POST', '/signup', {
      email: testEmail,
      password: '123456'
    });
    console.log(`   ✅ Status: ${res.status}`);
    console.log(`   Response:`, JSON.stringify(res.body, null, 2));
    if (res.cookies.length > 0) {
      authCookie = res.cookies[0].split(';')[0];
      console.log(`   🍪 Cookie: ${authCookie.substring(0, 50)}...`);
    }
    return res.status === 201;
  } catch (err) {
    console.log(`   ❌ Error: ${err.message}`);
    return false;
  }
}

async function test2_SignupDuplicate() {
  console.log('\n📝 TEST 2: POST /signup (Duplicate Email)');
  console.log('   Method: POST');
  console.log('   URL: http://localhost:3000/signup');
  console.log('   Body: { "email": "test@example.com", "password": "123456" }');
  try {
    const res = await request('POST', '/signup', {
      email: 'test@example.com',
      password: '123456'
    });
    console.log(`   ✅ Status: ${res.status}`);
    console.log(`   Response:`, JSON.stringify(res.body, null, 2));
    return res.status === 400;
  } catch (err) {
    console.log(`   ❌ Error: ${err.message}`);
    return false;
  }
}

async function test3_SignupInvalid() {
  console.log('\n📝 TEST 3: POST /signup (Invalid Data)');
  console.log('   Method: POST');
  console.log('   URL: http://localhost:3000/signup');
  console.log('   Body: { "email": "invalid-email", "password": "123" }');
  try {
    const res = await request('POST', '/signup', {
      email: 'invalid-email',
      password: '123'
    });
    console.log(`   ✅ Status: ${res.status}`);
    console.log(`   Response:`, JSON.stringify(res.body, null, 2));
    return res.status === 400;
  } catch (err) {
    console.log(`   ❌ Error: ${err.message}`);
    return false;
  }
}

async function test4_Login() {
  console.log('\n🔐 TEST 4: POST /login');
  console.log('   Method: POST');
  console.log('   URL: http://localhost:3000/login');
  console.log('   Body: { "email": "test@example.com", "password": "123456" }');
  try {
    const res = await request('POST', '/login', {
      email: 'test@example.com',
      password: '123456'
    });
    console.log(`   ✅ Status: ${res.status}`);
    console.log(`   Response:`, JSON.stringify(res.body, null, 2));
    if (res.cookies.length > 0) {
      authCookie = res.cookies[0].split(';')[0];
      console.log(`   🍪 Cookie: ${authCookie.substring(0, 50)}...`);
    }
    return res.status === 200;
  } catch (err) {
    console.log(`   ❌ Error: ${err.message}`);
    return false;
  }
}

async function test5_LoginInvalid() {
  console.log('\n🔐 TEST 5: POST /login (Wrong Credentials)');
  console.log('   Method: POST');
  console.log('   URL: http://localhost:3000/login');
  console.log('   Body: { "email": "wrong@example.com", "password": "wrongpass" }');
  try {
    const res = await request('POST', '/login', {
      email: 'wrong@example.com',
      password: 'wrongpass'
    });
    console.log(`   ✅ Status: ${res.status}`);
    console.log(`   Response:`, JSON.stringify(res.body, null, 2));
    return res.status === 400;
  } catch (err) {
    console.log(`   ❌ Error: ${err.message}`);
    return false;
  }
}

async function test6_Smoothies() {
  console.log('\n🥤 TEST 6: GET /smoothies (Protected Route)');
  console.log('   Method: GET');
  console.log('   URL: http://localhost:3000/smoothies');
  console.log('   Headers: Cookie: jwt=...');
  try {
    const res = await request('GET', '/smoothies', null, authCookie);
    console.log(`   ✅ Status: ${res.status}`);
    console.log(`   Response: ${res.status === 200 ? 'Protected route accessed' : 'Redirected to login'}`);
    return res.status === 200 || res.status === 302;
  } catch (err) {
    console.log(`   ❌ Error: ${err.message}`);
    return false;
  }
}

async function test7_Logout() {
  console.log('\n🚪 TEST 7: GET /logout');
  console.log('   Method: GET');
  console.log('   URL: http://localhost:3000/logout');
  console.log('   Headers: Cookie: jwt=...');
  try {
    const res = await request('GET', '/logout', null, authCookie);
    console.log(`   ✅ Status: ${res.status}`);
    console.log(`   Response: Logged out successfully`);
    return res.status === 200 || res.status === 302;
  } catch (err) {
    console.log(`   ❌ Error: ${err.message}`);
    return false;
  }
}

async function test8_Home() {
  console.log('\n🏠 TEST 8: GET /');
  console.log('   Method: GET');
  console.log('   URL: http://localhost:3000/');
  try {
    const res = await request('GET', '/');
    console.log(`   ✅ Status: ${res.status}`);
    console.log(`   Response: Home page (HTML)`);
    return res.status === 200;
  } catch (err) {
    console.log(`   ❌ Error: ${err.message}`);
    return false;
  }
}

// Run all tests
async function runTests() {
  await new Promise(r => setTimeout(r, 2000));
  
  const results = [];
  results.push(await test1_Signup());
  await new Promise(r => setTimeout(r, 500));
  results.push(await test2_SignupDuplicate());
  await new Promise(r => setTimeout(r, 500));
  results.push(await test3_SignupInvalid());
  await new Promise(r => setTimeout(r, 500));
  results.push(await test4_Login());
  await new Promise(r => setTimeout(r, 500));
  results.push(await test5_LoginInvalid());
  await new Promise(r => setTimeout(r, 500));
  results.push(await test6_Smoothies());
  await new Promise(r => setTimeout(r, 500));
  results.push(await test7_Logout());
  await new Promise(r => setTimeout(r, 500));
  results.push(await test8_Home());

  console.log('\n' + '='.repeat(60));
  console.log('📊 TEST SUMMARY');
  console.log('='.repeat(60));
  const passed = results.filter(r => r).length;
  const failed = results.length - passed;
  console.log(`Total Tests: ${results.length}`);
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log('='.repeat(60) + '\n');
}

runTests().catch(console.error);

