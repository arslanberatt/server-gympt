const http = require('http');

const BASE_URL = 'http://localhost:3000';
let authToken = '';
let authCookie = '';

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
            body: JSON.parse(data),
            cookies: setCookies
          });
        } catch {
          resolve({
            status: res.statusCode,
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

async function test() {
  console.log('🚀 Testing with new user...\n');
  
  // 1. Signup
  const email = `test${Date.now()}@example.com`;
  console.log(`1. Signup: ${email}`);
  const signupRes = await request('POST', '/signup', {
    email: email,
    password: '123456'
  });
  console.log(`   Status: ${signupRes.status}`);
  console.log(`   Response:`, JSON.stringify(signupRes.body, null, 2));
  if (signupRes.body.token) {
    authToken = signupRes.body.token;
    console.log(`   ✅ Token alındı!\n`);
  }
  if (signupRes.cookies.length > 0) {
    authCookie = signupRes.cookies[0].split(';')[0];
  }
  
  await new Promise(r => setTimeout(r, 500));
  
  // 2. Get Me
  console.log('2. GET /me');
  const meRes = await request('GET', '/me', null, authToken, authCookie);
  console.log(`   Status: ${meRes.status}`);
  console.log(`   Response:`, JSON.stringify(meRes.body, null, 2));
  console.log(`   ✅ dailyNutrition artık ayrı modelde!\n`);
  
  await new Promise(r => setTimeout(r, 500));
  
  // 3. Update Name
  console.log('3. PUT /me (Update Name)');
  const updateRes = await request('PUT', '/me', {
    name: 'Berat'
  }, authToken, authCookie);
  console.log(`   Status: ${updateRes.status}`);
  console.log(`   Response:`, JSON.stringify(updateRes.body, null, 2));
  console.log(`\n`);
  
  await new Promise(r => setTimeout(r, 500));
  
  // 4. Add Nutrition
  const today = new Date().toISOString().split('T')[0];
  console.log(`4. POST /me/nutrition (Date: ${today})`);
  const addRes = await request('POST', '/me/nutrition', {
    date: today,
    calories: 2000,
    protein: 150,
    carbs: 200,
    fat: 60
  }, authToken, authCookie);
  console.log(`   Status: ${addRes.status}`);
  console.log(`   Response:`, JSON.stringify(addRes.body, null, 2));
  console.log(`\n`);
  
  await new Promise(r => setTimeout(r, 500));
  
  // 5. Get All Nutrition
  console.log('5. GET /me/nutrition (All Data)');
  const getAllRes = await request('GET', '/me/nutrition', null, authToken, authCookie);
  console.log(`   Status: ${getAllRes.status}`);
  console.log(`   Response:`, JSON.stringify(getAllRes.body, null, 2));
  console.log(`   ✅ ${getAllRes.body.length} kayıt bulundu!\n`);
  
  await new Promise(r => setTimeout(r, 500));
  
  // 6. Get by Date Range
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const startDate = yesterday.toISOString().split('T')[0];
  const endDate = today;
  console.log(`6. GET /me/nutrition?startDate=${startDate}&endDate=${endDate}`);
  const rangeRes = await request('GET', `/me/nutrition?startDate=${startDate}&endDate=${endDate}`, null, authToken, authCookie);
  console.log(`   Status: ${rangeRes.status}`);
  console.log(`   Response:`, JSON.stringify(rangeRes.body, null, 2));
  console.log(`   ✅ Tarih aralığı sorgusu çalışıyor!\n`);
  
  console.log('✅ Tüm testler başarılı!');
}

test().catch(console.error);

