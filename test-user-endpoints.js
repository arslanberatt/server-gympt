const http = require('http');

const BASE_URL = 'http://localhost:3000';
let authToken = '';
let authCookie = '';

console.log('🚀 USER & NUTRITION ENDPOINT TESTS\n');
console.log('='.repeat(60));

// Helper function
function request(method, path, body = null, token = '', cookie = '') {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const options = {
      hostname: url.hostname,
      port: url.port || 3000,
      path: url.pathname + (url.search || ''),
      method: method,
      headers: { 'Content-Type': 'application/json' }
    };
    if (token) options.headers['Authorization'] = `Bearer ${token}`;
    if (cookie) options.headers['Cookie'] = cookie;

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
async function test1_Login() {
  console.log('\n🔐 TEST 1: POST /login');
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
    if (res.body.token) {
      authToken = res.body.token;
      console.log(`   🔑 Token alındı!`);
    }
    if (res.cookies.length > 0) {
      authCookie = res.cookies[0].split(';')[0];
    }
    return res.status === 200 && res.body.token;
  } catch (err) {
    console.log(`   ❌ Error: ${err.message}`);
    return false;
  }
}

async function test2_GetMe() {
  console.log('\n👤 TEST 2: GET /me');
  console.log('   Method: GET');
  console.log('   URL: http://localhost:3000/me');
  console.log('   Headers: Authorization: Bearer token');
  try {
    const res = await request('GET', '/me', null, authToken, authCookie);
    console.log(`   ✅ Status: ${res.status}`);
    console.log(`   Response:`, JSON.stringify(res.body, null, 2));
    // Artık dailyNutrition user içinde değil, ayrı modelde
    if (!res.body.dailyNutrition) {
      console.log(`   ✅ dailyNutrition artık ayrı modelde!`);
    }
    return res.status === 200;
  } catch (err) {
    console.log(`   ❌ Error: ${err.message}`);
    return false;
  }
}

async function test3_UpdateMe() {
  console.log('\n✏️  TEST 3: PUT /me (Update Name)');
  console.log('   Method: PUT');
  console.log('   URL: http://localhost:3000/me');
  console.log('   Body: { "name": "Berat" }');
  try {
    const res = await request('PUT', '/me', {
      name: 'Berat'
    }, authToken, authCookie);
    console.log(`   ✅ Status: ${res.status}`);
    console.log(`   Response:`, JSON.stringify(res.body, null, 2));
    return res.status === 200;
  } catch (err) {
    console.log(`   ❌ Error: ${err.message}`);
    return false;
  }
}

async function test4_GetMeAgain() {
  console.log('\n👤 TEST 4: GET /me (After Update)');
  console.log('   Method: GET');
  console.log('   URL: http://localhost:3000/me');
  try {
    const res = await request('GET', '/me', null, authToken, authCookie);
    console.log(`   ✅ Status: ${res.status}`);
    console.log(`   Response:`, JSON.stringify(res.body, null, 2));
    if (res.body.name === 'Berat') {
      console.log(`   ✅ İsim güncellendi!`);
    }
    return res.status === 200;
  } catch (err) {
    console.log(`   ❌ Error: ${err.message}`);
    return false;
  }
}

async function test5_AddNutrition() {
  console.log('\n🍎 TEST 5: POST /me/nutrition (Add Daily Nutrition)');
  console.log('   Method: POST');
  console.log('   URL: http://localhost:3000/me/nutrition');
  const today = new Date().toISOString().split('T')[0];
  console.log(`   Body: { "date": "${today}", "calories": 2000, "protein": 150, "carbs": 200, "fat": 60 }`);
  try {
    const res = await request('POST', '/me/nutrition', {
      date: today,
      calories: 2000,
      protein: 150,
      carbs: 200,
      fat: 60
    }, authToken, authCookie);
    console.log(`   ✅ Status: ${res.status}`);
    console.log(`   Response:`, JSON.stringify(res.body, null, 2));
    return res.status === 200;
  } catch (err) {
    console.log(`   ❌ Error: ${err.message}`);
    return false;
  }
}

async function test6_GetNutrition() {
  console.log('\n📊 TEST 6: GET /me/nutrition');
  console.log('   Method: GET');
  console.log('   URL: http://localhost:3000/me/nutrition');
  try {
    const res = await request('GET', '/me/nutrition', null, authToken, authCookie);
    console.log(`   ✅ Status: ${res.status}`);
    console.log(`   Response:`, JSON.stringify(res.body, null, 2));
    return res.status === 200;
  } catch (err) {
    console.log(`   ❌ Error: ${err.message}`);
    return false;
  }
}

async function test7_GetNutritionByDate() {
  console.log('\n📅 TEST 7: GET /me/nutrition?date=...');
  console.log('   Method: GET');
  const today = new Date().toISOString().split('T')[0];
  console.log(`   URL: http://localhost:3000/me/nutrition?date=${today}`);
  try {
    const res = await request('GET', `/me/nutrition?date=${today}`, null, authToken, authCookie);
    console.log(`   ✅ Status: ${res.status}`);
    console.log(`   Response:`, JSON.stringify(res.body, null, 2));
    return res.status === 200;
  } catch (err) {
    console.log(`   ❌ Error: ${err.message}`);
    return false;
  }
}

async function test8_UpdateNutrition() {
  console.log('\n✏️  TEST 8: PUT /me/nutrition/:date (Update Nutrition)');
  console.log('   Method: PUT');
  const today = new Date().toISOString().split('T')[0];
  console.log(`   URL: http://localhost:3000/me/nutrition/${today}`);
  console.log(`   Body: { "calories": 2500, "protein": 180 }`);
  try {
    const res = await request('PUT', `/me/nutrition/${today}`, {
      calories: 2500,
      protein: 180
    }, authToken, authCookie);
    console.log(`   ✅ Status: ${res.status}`);
    console.log(`   Response:`, JSON.stringify(res.body, null, 2));
    return res.status === 200;
  } catch (err) {
    console.log(`   ❌ Error: ${err.message}`);
    return false;
  }
}

async function test9_AddNutritionAnotherDay() {
  console.log('\n🍎 TEST 9: POST /me/nutrition (Another Day)');
  console.log('   Method: POST');
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const dateStr = yesterday.toISOString().split('T')[0];
  console.log(`   URL: http://localhost:3000/me/nutrition`);
  console.log(`   Body: { "date": "${dateStr}", "calories": 1800, "protein": 120, "carbs": 180, "fat": 50 }`);
  try {
    const res = await request('POST', '/me/nutrition', {
      date: dateStr,
      calories: 1800,
      protein: 120,
      carbs: 180,
      fat: 50
    }, authToken, authCookie);
    console.log(`   ✅ Status: ${res.status}`);
    console.log(`   Response:`, JSON.stringify(res.body, null, 2));
    return res.status === 200;
  } catch (err) {
    console.log(`   ❌ Error: ${err.message}`);
    return false;
  }
}

async function test10_GetAllNutrition() {
  console.log('\n📊 TEST 10: GET /me/nutrition (All Data)');
  console.log('   Method: GET');
  console.log('   URL: http://localhost:3000/me/nutrition');
  try {
    const res = await request('GET', '/me/nutrition', null, authToken, authCookie);
    console.log(`   ✅ Status: ${res.status}`);
    console.log(`   Response:`, JSON.stringify(res.body, null, 2));
    if (Array.isArray(res.body) && res.body.length >= 2) {
      console.log(`   ✅ Birden fazla günlük veri var!`);
    }
    return res.status === 200;
  } catch (err) {
    console.log(`   ❌ Error: ${err.message}`);
    return false;
  }
}

async function test11_GetNutritionByDateRange() {
  console.log('\n📅 TEST 11: GET /me/nutrition?startDate=...&endDate=...');
  console.log('   Method: GET');
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const startDate = yesterday.toISOString().split('T')[0];
  const endDate = today.toISOString().split('T')[0];
  console.log(`   URL: http://localhost:3000/me/nutrition?startDate=${startDate}&endDate=${endDate}`);
  try {
    const res = await request('GET', `/me/nutrition?startDate=${startDate}&endDate=${endDate}`, null, authToken, authCookie);
    console.log(`   ✅ Status: ${res.status}`);
    console.log(`   Response:`, JSON.stringify(res.body, null, 2));
    if (Array.isArray(res.body)) {
      console.log(`   ✅ Tarih aralığı sorgusu çalışıyor! ${res.body.length} kayıt bulundu`);
    }
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
  results.push(await test1_Login());
  await new Promise(r => setTimeout(r, 500));
  results.push(await test2_GetMe());
  await new Promise(r => setTimeout(r, 500));
  results.push(await test3_UpdateMe());
  await new Promise(r => setTimeout(r, 500));
  results.push(await test4_GetMeAgain());
  await new Promise(r => setTimeout(r, 500));
  results.push(await test5_AddNutrition());
  await new Promise(r => setTimeout(r, 500));
  results.push(await test6_GetNutrition());
  await new Promise(r => setTimeout(r, 500));
  results.push(await test7_GetNutritionByDate());
  await new Promise(r => setTimeout(r, 500));
  results.push(await test8_UpdateNutrition());
  await new Promise(r => setTimeout(r, 500));
  results.push(await test9_AddNutritionAnotherDay());
  await new Promise(r => setTimeout(r, 500));
  results.push(await test10_GetAllNutrition());
  await new Promise(r => setTimeout(r, 500));
  results.push(await test11_GetNutritionByDateRange());

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

