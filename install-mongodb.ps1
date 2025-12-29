# MongoDB Kurulum Script'i
# Bu script'i Administrator olarak çalıştırın

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "MongoDB Kurulum Script'i" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Chocolatey ile MongoDB kurulumu
Write-Host "MongoDB Chocolatey ile kuruluyor..." -ForegroundColor Yellow
try {
    choco install mongodb --yes --force
    Write-Host "MongoDB başarıyla kuruldu!" -ForegroundColor Green
} catch {
    Write-Host "Hata: $_" -ForegroundColor Red
    Write-Host ""
    Write-Host "Alternatif: MongoDB'yi manuel olarak kurun:" -ForegroundColor Yellow
    Write-Host "1. https://www.mongodb.com/try/download/community adresine gidin" -ForegroundColor White
    Write-Host "2. Windows için MSI installer'ı indirin" -ForegroundColor White
    Write-Host "3. İndirilen .msi dosyasını çalıştırın" -ForegroundColor White
    Write-Host "4. Kurulum sihirbazını takip edin" -ForegroundColor White
    exit 1
}

# Veri klasörünü oluştur
Write-Host ""
Write-Host "Veri klasörü oluşturuluyor..." -ForegroundColor Yellow
$dataPath = "C:\data\db"
if (-not (Test-Path $dataPath)) {
    try {
        New-Item -ItemType Directory -Path $dataPath -Force | Out-Null
        Write-Host "Veri klasörü oluşturuldu: $dataPath" -ForegroundColor Green
    } catch {
        Write-Host "Veri klasörü oluşturulamadı. Manuel olarak oluşturun: $dataPath" -ForegroundColor Red
    }
} else {
    Write-Host "Veri klasörü zaten mevcut: $dataPath" -ForegroundColor Green
}

# MongoDB servisini başlat
Write-Host ""
Write-Host "MongoDB servisi başlatılıyor..." -ForegroundColor Yellow
try {
    $service = Get-Service -Name MongoDB -ErrorAction SilentlyContinue
    if ($service) {
        if ($service.Status -ne 'Running') {
            Start-Service -Name MongoDB
            Write-Host "MongoDB servisi başlatıldı!" -ForegroundColor Green
        } else {
            Write-Host "MongoDB servisi zaten çalışıyor!" -ForegroundColor Green
        }
    } else {
        Write-Host "MongoDB servisi bulunamadı. Servis olarak kurulmamış olabilir." -ForegroundColor Yellow
        Write-Host "MongoDB'yi manuel olarak başlatmak için: mongod" -ForegroundColor White
    }
} catch {
    Write-Host "Servis başlatılamadı: $_" -ForegroundColor Red
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Kurulum tamamlandı!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "MongoDB'yi test etmek için:" -ForegroundColor Yellow
Write-Host "  mongosh" -ForegroundColor White
Write-Host ""

