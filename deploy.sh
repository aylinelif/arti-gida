#!/bin/bash

# --- ArtıGıda Platformu Canlıya Alma (Deployment) Scripti ---
# Bu script, uygulamanın bir Ubuntu/Debian VPS sunucusunda otomatik olarak kurulmasını sağlar.

set -e

echo "============================================="
echo "   ArtıGıda Bulut Dağıtım Sihirbazı 🚀"
echo "============================================="

# 1. Gerekli araçların kontrolü
echo -e "\n[1/5] Sistem gereksinimleri kontrol ediliyor..."

if ! [ -x "$(command -v docker)" ]; then
  echo "❌ HATA: Docker yüklü değil!"
  echo "Lütfen Docker'ı kurmak için şu komutu çalıştırın: curl -fsSL https://get.docker.com | sh"
  exit 1
fi

if ! [ -x "$(command -v docker-compose)" ] && ! docker compose version &> /dev/null; then
  echo "❌ HATA: Docker Compose yüklü değil!"
  echo "Lütfen Docker Compose'u kurun veya güncelleyin."
  exit 1
fi

echo "✅ Docker ve Docker Compose yüklü."

# 2. .env Dosyası Kontrolü ve Oluşturulması
echo -e "\n[2/5] Yapılandırma dosyaları kontrol ediliyor..."
if [ ! -f .env ]; then
  echo "⚠️ .env dosyası bulunamadı. .env.example dosyasından yeni bir tane oluşturuluyor..."
  cp .env.example .env
  
  # JWT Secret üretimi
  if [ -x "$(command -v openssl)" ]; then
    JWT_SECRET=$(openssl rand -hex 32)
    # macOS ve Linux uyumlu sed ile değiştirme
    if [[ "$OSTYPE" == "darwin"* ]]; then
      sed -i '' "s/generate_a_long_random_string_here_for_jwt_security/$JWT_SECRET/g" .env
    else
      sed -i "s/generate_a_long_random_string_here_for_jwt_security/$JWT_SECRET/g" .env
    fi
    echo "🔑 Güvenli bir JWT_SECRET_KEY otomatik olarak üretildi."
  fi
  
  echo "👉 Lütfen şimdi '.env' dosyasını düzenleyin ve OpenRouter API anahtarınızı girin!"
  echo "Komut: nano .env"
  echo "Düzenledikten sonra bu scripti tekrar çalıştırın."
  exit 0
else
  echo "✅ .env dosyası mevcut."
fi

# 3. İmajların Derlenmesi ve Servislerin Başlatılması
echo -e "\n[3/5] Docker imajları derleniyor ve servisler başlatılıyor..."
docker compose -f docker-compose.prod.yml down --remove-orphans || true
docker compose -f docker-compose.prod.yml up -d --build

# 4. Servis Durumlarının Kontrolü
echo -e "\n[4/5] Servislerin durumu kontrol ediliyor..."
sleep 5

docker compose -f docker-compose.prod.yml ps

# 5. Başarı Bildirimi ve SSL Bilgileri
echo -e "\n[5/5] Kurulum tamamlandı! 🎉"
echo "============================================="
echo "ArtıGıda platformu başarıyla ayağa kaldırıldı."
echo "Uygulamaya şuradan erişebilirsiniz:"
echo "👉 HTTP: http://localhost (veya sunucunuzun IP adresi)"
echo "👉 Swagger API Dokümantasyonu: http://localhost/swagger"
echo "============================================="
echo -e "\n🔐 SSL (HTTPS) Kurulumu İçin Öneri:"
echo "Canlı ortamda güvenli bağlantı sağlamak için Nginx Proxy Manager kullanmanızı öneririz."
echo "Detaylar için walkthrough.md kılavuzunu inceleyebilirsiniz."
