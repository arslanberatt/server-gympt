# Express Node.js Authentication API

JWT tabanlı authentication ve günlük beslenme takibi API'si.

## Özellikler

- 🔐 JWT Authentication (Signup, Login, Logout)
- 👤 Kullanıcı profil yönetimi
- 📊 Günlük beslenme takibi (kalori, protein, karbonhidrat, yağ)
- 📅 Tarih bazlı ve tarih aralığı sorguları

## Teknolojiler

- Node.js
- Express.js
- MongoDB (Mongoose)
- JWT
- bcrypt

## Kurulum

### Local Development

1. Bağımlılıkları yükleyin:
```bash
npm install
```

2. `.env` dosyası oluşturun:
```bash
# .env.example dosyasını kopyalayın
cp .env.example .env
```

3. `.env` dosyasını düzenleyin:
```env
MONGODB_URI=mongodb://localhost:27017/node-auth
PORT=3000
JWT_SECRET=your-super-secret-jwt-key
```

**Not:** Detaylı kurulum için `ENV_SETUP.md` dosyasına bakın.

4. Uygulamayı başlatın:
```bash
npm start
```

## Railway Deployment

### Gereksinimler

1. Railway hesabı (https://railway.app)
2. MongoDB Atlas hesabı (veya Railway MongoDB servisi)

### Deployment Adımları

1. **GitHub'a push edin:**
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin <your-github-repo-url>
git push -u origin main
```

2. **Railway'de yeni proje oluşturun:**
   - Railway dashboard'a gidin
   - "New Project" tıklayın
   - "Deploy from GitHub repo" seçin
   - Repository'nizi seçin

3. **MongoDB servisi ekleyin:**
   - Railway dashboard'da "New" → "Database" → "MongoDB" seçin
   - MongoDB connection string'i otomatik oluşturulur

4. **Environment Variables ayarlayın:**
   - Railway projenizde "Variables" sekmesine gidin
   - Şu değişkenleri ekleyin:
     ```
     MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/node-auth
     JWT_SECRET=your-production-secret-key
     ```
   - **Not:** `PORT` değişkeni Railway tarafından otomatik ayarlanır, eklemeyin

5. **Deploy:**
   - Railway otomatik olarak deploy edecektir
   - Logs sekmesinden deploy durumunu takip edebilirsiniz

## API Endpoints

### Authentication

- `POST /signup` - Kullanıcı kaydı
- `POST /login` - Giriş yap
- `GET /logout` - Çıkış yap

### User Profile

- `GET /me` - Kullanıcı profilini getir
- `PUT /me` - Kullanıcı profilini güncelle (isim)

### Nutrition

- `GET /me/nutrition` - Tüm günlük beslenme verilerini getir
- `GET /me/nutrition?date=2025-12-29` - Belirli bir günün verilerini getir
- `GET /me/nutrition?startDate=2025-12-28&endDate=2025-12-29` - Tarih aralığı sorgusu
- `POST /me/nutrition` - Yeni günlük beslenme verisi ekle
- `PUT /me/nutrition/:date` - Belirli bir günün verilerini güncelle

## Environment Variables

- `MONGODB_URI` - MongoDB connection string
- `PORT` - Server port (Railway otomatik ayarlar, local için varsayılan 3000)
- `JWT_SECRET` - JWT token imzalama için secret key (güçlü bir key kullanın!)

Detaylı kurulum için `ENV_SETUP.md` dosyasına bakın.

## Lisans

ISC

