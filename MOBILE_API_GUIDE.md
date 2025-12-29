# 📱 Mobil Uygulama API Kullanım Rehberi

## 🚀 Railway API URL

```
https://server-gympt-production.up.railway.app
```

## 🔐 CORS Ayarları (Railway'de)

Railway dashboard'da **Variables** sekmesine gidin ve şu değişkenleri ekleyin:

```env
CORS_ORIGIN=true
CORS_CREDENTIALS=true
CORS_METHODS=GET,POST,PUT,DELETE,OPTIONS,PATCH
CORS_ALLOWED_HEADERS=Content-Type,Authorization,X-Requested-With
```

**Önemli:** `CORS_ORIGIN=true` mobil uygulamalar için tüm origin'lere izin verir.

## 📋 API Endpoints

### Base URL
```
https://server-gympt-production.up.railway.app
```

### 1. Kullanıcı Kaydı (Signup)
```http
POST https://server-gympt-production.up.railway.app/signup
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "123456"
}
```

**Response:**
```json
{
  "user": "user_id",
  "token": "jwt_token_here"
}
```

### 2. Giriş Yap (Login)
```http
POST https://server-gympt-production.up.railway.app/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "123456"
}
```

**Response:**
```json
{
  "token": "jwt_token_here"
}
```

### 3. Kullanıcı Profili (GET)
```http
GET https://server-gympt-production.up.railway.app/me
Authorization: Bearer YOUR_JWT_TOKEN
```

**Response:**
```json
{
  "id": "user_id",
  "email": "user@example.com",
  "name": "User Name"
}
```

### 4. Kullanıcı Profili Güncelle (PUT)
```http
PUT https://server-gympt-production.up.railway.app/me
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "name": "New Name"
}
```

### 5. Günlük Beslenme Verisi Ekle (POST)
```http
POST https://server-gympt-production.up.railway.app/me/nutrition
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "date": "2025-12-29",
  "calories": 2000,
  "protein": 150,
  "carbs": 200,
  "fat": 60
}
```

### 6. Tüm Beslenme Verilerini Getir (GET)
```http
GET https://server-gympt-production.up.railway.app/me/nutrition
Authorization: Bearer YOUR_JWT_TOKEN
```

### 7. Belirli Tarih için Beslenme Verisi (GET)
```http
GET https://server-gympt-production.up.railway.app/me/nutrition?date=2025-12-29
Authorization: Bearer YOUR_JWT_TOKEN
```

### 8. Tarih Aralığı Sorgusu (GET)
```http
GET https://server-gympt-production.up.railway.app/me/nutrition?startDate=2025-12-28&endDate=2025-12-29
Authorization: Bearer YOUR_JWT_TOKEN
```

### 9. Beslenme Verisi Güncelle (PUT)
```http
PUT https://server-gympt-production.up.railway.app/me/nutrition/2025-12-29
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "calories": 2500,
  "protein": 180
}
```

## 🔑 Authentication

Tüm korumalı endpoint'ler için `Authorization` header'ı kullanın:

```http
Authorization: Bearer YOUR_JWT_TOKEN
```

Token'ı login veya signup response'undan alın ve saklayın.

## 📱 Mobil Uygulama Örnekleri

### React Native (Axios)
```javascript
import axios from 'axios';

const API_URL = 'https://server-gympt-production.up.railway.app';

// Login
const login = async (email, password) => {
  try {
    const response = await axios.post(`${API_URL}/login`, {
      email,
      password
    });
    
    const token = response.data.token;
    // Token'ı AsyncStorage veya SecureStore'a kaydedin
    await AsyncStorage.setItem('token', token);
    
    return token;
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};

// Authenticated Request
const getProfile = async () => {
  const token = await AsyncStorage.getItem('token');
  
  const response = await axios.get(`${API_URL}/me`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  return response.data;
};
```

### Flutter (Dio)
```dart
import 'package:dio/dio.dart';

final dio = Dio(BaseOptions(
  baseUrl: 'https://server-gympt-production.up.railway.app',
  headers: {
    'Content-Type': 'application/json',
  },
));

// Login
Future<String> login(String email, String password) async {
  try {
    final response = await dio.post('/login', data: {
      'email': email,
      'password': password,
    });
    
    final token = response.data['token'];
    // Token'ı SharedPreferences'e kaydedin
    await SharedPreferences.getInstance().then((prefs) {
      prefs.setString('token', token);
    });
    
    return token;
  } catch (e) {
    throw Exception('Login failed: $e');
  }
}

// Authenticated Request
Future<Map<String, dynamic>> getProfile() async {
  final prefs = await SharedPreferences.getInstance();
  final token = prefs.getString('token');
  
  dio.options.headers['Authorization'] = 'Bearer $token';
  
  final response = await dio.get('/me');
  return response.data;
}
```

## 🧪 Postman Test

Postman'de istek atarken:

1. **Method:** POST, GET, PUT, DELETE
2. **URL:** `https://server-gympt-production.up.railway.app/endpoint`
3. **Headers:**
   - `Content-Type: application/json`
   - `Authorization: Bearer YOUR_TOKEN` (korumalı endpoint'ler için)
4. **Body:** (POST/PUT için) JSON formatında

**Not:** Postman CORS'u bypass eder, bu yüzden Postman'den istek atamıyorsanız CORS sorunu değil, başka bir sorun olabilir (URL, token, vb.)

## ⚠️ Sorun Giderme

### Postman'den İstek Atamıyorum

1. **URL Kontrolü:**
   - `https://server-gympt-production.up.railway.app` doğru mu?
   - Railway'de servis çalışıyor mu? (Logs sekmesinden kontrol edin)

2. **Token Kontrolü:**
   - Token'ı doğru aldınız mı?
   - `Authorization: Bearer TOKEN` formatı doğru mu?

3. **Content-Type:**
   - `Content-Type: application/json` header'ı var mı?

4. **MongoDB Bağlantısı:**
   - Railway'de MongoDB servisi çalışıyor mu?
   - `MONGODB_URI` environment variable doğru mu?

### CORS Hatası (Browser'dan)

Browser console'da CORS hatası görüyorsanız:
- Railway'de `CORS_ORIGIN=true` ayarlandığından emin olun
- Deploy'u yeniden yapın

## 📝 Railway Environment Variables

Railway dashboard'da şu değişkenlerin olduğundan emin olun:

```env
MONGODB_URI=mongodb+srv://...
JWT_SECRET=your-secret-key
CORS_ORIGIN=true
CORS_CREDENTIALS=true
CORS_METHODS=GET,POST,PUT,DELETE,OPTIONS,PATCH
CORS_ALLOWED_HEADERS=Content-Type,Authorization,X-Requested-With
```

**Not:** `PORT` değişkenini eklemeyin, Railway otomatik ayarlar.

## ✅ Test Checklist

- [ ] Railway'de servis çalışıyor
- [ ] MongoDB bağlantısı başarılı
- [ ] CORS_ORIGIN=true ayarlandı
- [ ] Postman'den login endpoint'i çalışıyor
- [ ] Token alınabiliyor
- [ ] /me endpoint'i token ile çalışıyor
- [ ] Mobil uygulamadan istek atılabiliyor
