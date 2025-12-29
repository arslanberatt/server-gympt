# 🚂 Railway Deployment Checklist

## ✅ Yapılan Hazırlıklar

- [x] `package.json`'a `start` script eklendi
- [x] `app.js` PORT environment variable kullanıyor
- [x] `app.js` MONGODB_URI environment variable kullanıyor
- [x] `railway.json` oluşturuldu
- [x] `.gitignore` .env dosyalarını ignore ediyor

## 📋 Railway'e Deploy Adımları

### 1. GitHub'a Push Et

```bash
# Eğer git repo yoksa:
git init
git add .
git commit -m "Ready for Railway deployment"

# GitHub'da yeni repo oluştur, sonra:
git remote add origin https://github.com/KULLANICI_ADI/REPO_ADI.git
git branch -M main
git push -u origin main
```

### 2. Railway Hesabı Oluştur

1. https://railway.app adresine git
2. "Start a New Project" tıkla
3. GitHub ile giriş yap

### 3. Yeni Proje Oluştur

1. Railway dashboard'da "New Project" tıkla
2. "Deploy from GitHub repo" seç
3. Repository'ni seç
4. Railway otomatik olarak projeyi algılayacak

### 4. MongoDB Servisi Ekle

**Seçenek 1: Railway MongoDB (Önerilen)**
1. Railway projenizde "New" butonuna tıklayın
2. "Database" → "MongoDB" seçin
3. Railway otomatik olarak MongoDB servisi oluşturacak
4. MongoDB servisinde "Variables" sekmesine gidin
5. `MONGO_URL` veya `MONGODB_URI` değişkenini kopyalayın

**Seçenek 2: MongoDB Atlas**
1. https://www.mongodb.com/cloud/atlas adresine git
2. Ücretsiz cluster oluştur
3. Database Access'te kullanıcı oluştur
4. Network Access'te IP'leri ekle (0.0.0.0/0 - tüm IP'ler)
5. Connect → Drivers → Connection String'i kopyala
6. Connection string'de `<password>` ve `<dbname>` kısımlarını doldur

### 5. Environment Variables Ayarla

Railway projenizde:
1. "Variables" sekmesine gidin
2. Aşağıdaki değişkenleri ekleyin:

```
MONGODB_URI=mongodb+srv://kullanici:sifre@cluster.mongodb.net/node-auth
```

**Not:** `PORT` değişkeni Railway tarafından otomatik ayarlanır, eklemenize gerek yok.

### 6. Deploy

1. Railway otomatik olarak deploy edecektir
2. "Deployments" sekmesinden deploy durumunu takip edin
3. "Logs" sekmesinden logları görüntüleyin

### 7. Domain Ayarla (Opsiyonel)

1. Railway projenizde "Settings" → "Networking" sekmesine gidin
2. "Generate Domain" tıklayın
3. Otomatik bir domain oluşturulacak (örn: `your-app.up.railway.app`)

## 🔍 Kontrol Listesi

Deploy sonrası kontrol edin:

- [ ] Railway'de "Deployments" sekmesinde başarılı deploy görünüyor mu?
- [ ] "Logs" sekmesinde "Connected to MongoDB" mesajı var mı?
- [ ] "Logs" sekmesinde "Server running on port XXXX" mesajı var mı?
- [ ] Domain'den API endpoint'lerine erişebiliyor musunuz?
- [ ] POST /signup endpoint'i çalışıyor mu?
- [ ] POST /login endpoint'i çalışıyor mu?

## 🐛 Sorun Giderme

### MongoDB Bağlantı Hatası

- MongoDB Atlas kullanıyorsanız, Network Access'te Railway IP'lerini eklediğinizden emin olun
- Connection string'de şifre ve database adını doğru girdiğinizden emin olun
- Railway MongoDB kullanıyorsanız, `MONGO_URL` değişkenini `MONGODB_URI` olarak kopyalayın

### Port Hatası

- `PORT` environment variable'ını manuel eklemeyin, Railway otomatik ayarlar
- `app.js`'de `process.env.PORT || 3000` kullanıldığından emin olun

### Build Hatası

- `package.json`'da `start` script'inin olduğundan emin olun
- Node.js versiyonu uyumlu mu kontrol edin

## 📝 Önemli Notlar

1. **MongoDB Connection String Formatı:**
   ```
   mongodb+srv://username:password@cluster.mongodb.net/database-name
   ```

2. **Railway MongoDB Kullanıyorsanız:**
   - Railway otomatik olarak `MONGO_URL` değişkenini oluşturur
   - Bunu `MONGODB_URI` olarak kopyalayın veya kodda `MONGO_URL` kullanın

3. **Environment Variables:**
   - Railway'de environment variables'ları "Variables" sekmesinden ekleyin
   - Değişiklikler otomatik olarak yeni deploy tetikler

4. **Logs:**
   - Railway'de "Logs" sekmesinden gerçek zamanlı logları görebilirsiniz
   - Hata ayıklama için çok faydalıdır

## 🎉 Başarılı Deploy Sonrası

API endpoint'leriniz şu formatta çalışacak:
```
https://your-app.up.railway.app/signup
https://your-app.up.railway.app/login
https://your-app.up.railway.app/me
```

Postman veya başka bir HTTP client ile test edebilirsiniz!

