# 🔐 Environment Variables Kurulumu

## .env Dosyası Oluşturma

Proje root dizininde `.env` dosyası oluşturun ve aşağıdaki değişkenleri ekleyin:

```env
# MongoDB Connection String
MONGODB_URI=mongodb://localhost:27017/node-auth

# Server Port
PORT=3000

# JWT Secret Key (Güçlü bir key kullanın!)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
```

## Windows'ta .env Dosyası Oluşturma

### Yöntem 1: PowerShell
```powershell
New-Item -Path .env -ItemType File
notepad .env
```

### Yöntem 2: VS Code
1. VS Code'da yeni dosya oluşturun
2. Dosya adını `.env` yazın
3. İçeriği yukarıdaki gibi doldurun

### Yöntem 3: Komut Satırı
```bash
echo. > .env
```

Sonra bir text editor ile açıp içeriği ekleyin.

## Güçlü JWT Secret Oluşturma

### Windows PowerShell:
```powershell
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Minimum 0 -Maximum 256 }))
```

### Linux/Mac:
```bash
openssl rand -base64 32
```

## Railway Deployment İçin

Railway'de "Variables" sekmesine gidin ve şu değişkenleri ekleyin:

```
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/node-auth
JWT_SECRET=your-production-secret-key
```

**Not:** `PORT` değişkenini Railway'de eklemeyin, otomatik ayarlanır.

## Önemli Notlar

1. ✅ `.env` dosyası `.gitignore`'da olduğu için Git'e commit edilmeyecek
2. ✅ `.env.example` dosyası template olarak kullanılabilir
3. ✅ Production'da mutlaka güçlü bir `JWT_SECRET` kullanın
4. ✅ Her ortam için farklı `.env` dosyası kullanın (development, production)

