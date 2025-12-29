# 🔧 Railway 502 Hatası Düzeltme Rehberi

## ❌ Sorun: MongoDB Bağlantı Hatası

```
❌ MongoDB connection error: connect ECONNREFUSED ::1:27017
```

Bu hata, Railway'de `MONGODB_URI` environment variable'ının ayarlanmadığı veya yanlış olduğu anlamına gelir.

## ✅ Çözüm Adımları

### 1. Railway'de MongoDB Servisi Ekle

**Seçenek A: Railway MongoDB (Önerilen)**
1. Railway dashboard'da projenize gidin
2. "New" butonuna tıklayın
3. "Database" → "MongoDB" seçin
4. Railway otomatik olarak MongoDB servisi oluşturacak

**Seçenek B: MongoDB Atlas**
1. https://www.mongodb.com/cloud/atlas adresine gidin
2. Ücretsiz cluster oluşturun
3. Database Access'te kullanıcı oluşturun
4. Network Access'te `0.0.0.0/0` ekleyin (tüm IP'lere izin)
5. Connect → Drivers → Connection String'i kopyalayın

### 2. Environment Variables Ayarla

Railway dashboard'da:
1. Projenizde "Variables" sekmesine gidin
2. Şu değişkenleri ekleyin:

#### MongoDB URI (Railway MongoDB kullanıyorsanız):
1. Railway MongoDB servisinde "Variables" sekmesine gidin
2. `MONGO_URL` veya `MONGODB_URI` değişkenini kopyalayın
3. Ana servisinizde (web servisi) "Variables" sekmesine gidin
4. `MONGODB_URI` olarak yapıştırın

#### MongoDB URI (MongoDB Atlas kullanıyorsanız):
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/node-auth?retryWrites=true&w=majority
```

**Önemli:** 
- `username` ve `password` kısımlarını kendi bilgilerinizle değiştirin
- `cluster` kısmını kendi cluster adresinizle değiştirin
- `node-auth` database adını değiştirebilirsiniz

#### Diğer Gerekli Variables:
```env
JWT_SECRET=your-super-secret-key-here-change-this
CORS_ORIGIN=true
CORS_CREDENTIALS=true
CORS_METHODS=GET,POST,PUT,DELETE,OPTIONS,PATCH
CORS_ALLOWED_HEADERS=Content-Type,Authorization,X-Requested-With
```

### 3. Deploy'u Yeniden Yap

1. Railway'de "Deployments" sekmesine gidin
2. "Redeploy" butonuna tıklayın
3. Veya GitHub'a push yapın (otomatik deploy)

### 4. Logları Kontrol Et

Railway'de "Logs" sekmesinden şu mesajları görmelisiniz:

```
✅ Server running on port XXXX
✅ Connected to MongoDB
```

Eğer hala hata görüyorsanız:
- `MONGODB_URI` değişkeninin doğru olduğundan emin olun
- MongoDB servisinin çalıştığından emin olun
- Connection string formatını kontrol edin

## 🧪 Test

### Health Check:
```http
GET https://server-gympt-production.up.railway.app/health
```

Response:
```json
{
  "status": "ok",
  "message": "Server is running"
}
```

### Signup Test:
```http
POST https://server-gympt-production.up.railway.app/signup
Content-Type: application/json

{
  "email": "test@example.com",
  "password": "123456"
}
```

## 📋 Checklist

- [ ] Railway'de MongoDB servisi eklendi
- [ ] `MONGODB_URI` environment variable eklendi
- [ ] `JWT_SECRET` environment variable eklendi
- [ ] CORS environment variables eklendi
- [ ] Deploy yeniden yapıldı
- [ ] Loglar kontrol edildi
- [ ] Health check endpoint çalışıyor
- [ ] Signup endpoint çalışıyor

## ⚠️ Yaygın Hatalar

### 1. Connection String Formatı Yanlış
```
❌ Yanlış: mongodb://localhost:27017/node-auth
✅ Doğru: mongodb+srv://user:pass@cluster.mongodb.net/node-auth
```

### 2. MongoDB Atlas Network Access
- MongoDB Atlas'te Network Access'te IP whitelist'i kontrol edin
- `0.0.0.0/0` ekleyin (tüm IP'lere izin)

### 3. Username/Password Yanlış
- MongoDB Atlas'te Database Access'te kullanıcı oluşturduğunuzdan emin olun
- Connection string'de username ve password'u doğru yazın

### 4. Environment Variable İsmi Yanlış
- Railway'de değişken adı tam olarak `MONGODB_URI` olmalı
- Büyük/küçük harf duyarlı!

## 💡 İpucu

Railway MongoDB kullanıyorsanız, MongoDB servisindeki `MONGO_URL` değişkenini direkt olarak web servisinizde `MONGODB_URI` olarak kullanabilirsiniz.

