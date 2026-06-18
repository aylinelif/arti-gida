# ArtıGıda - AI Developer Planlama Dokümanı (plan.md)

## Proje Bağlamı (Context for LLM)
Bu proje, gıda israfını önlemeye yönelik bir web platformudur. İşletmeler ellerinde kalan yemekleri sisteme ekler, kullanıcılar ise bu gıdaları rezerve eder.
**Mimari:** İki ayrı servis olarak tasarlanmıştır. Backend (.NET Core Web API) ve Frontend (Angular). Veritabanı PostgreSQL'dir. Merkezde gıda ilanlarının raf ömrünü ve kategorisini tahmin eden bir AI Logiği (OpenRouter API) kullanılacaktır.

## Aşama 1: Ortam Kurulumları (Environment Setup)
- [x] Task 1.1: `backend` dizini altında .NET Core Web API projesinin başlatılması.
- [x] Task 1.2: `frontend` dizini altında Angular projesinin oluşturulması.
- [ ] Task 1.3: Backend tarafında Entity Framework Core ve PostgreSQL paketlerinin projeye dahil edilmesi.
- [ ] Task 1.4: `appsettings.json` içerisine veritabanı bağlantı dizesinin eklenmesi.

## Aşama 2: Veritabanı Şeması ve Modeller
- [ ] Task 2.1: Entity sınıflarının PRD.md'ye uygun şekilde kodlanması.
- [ ] Task 2.2: Entity framework migration işleminin yapılması ve veritabanının güncellenmesi.

## Aşama 3: Core AI Logiği Entegrasyonu (OpenRouter)
- [ ] Task 3.1: OpenRouter API ile iletişim kuracak bir `AIService` sınıfının oluşturulması.
- [ ] Task 3.2: AI Servisi içine tüketim saati ve kategori tahmin promptunun kodlanması.
- [ ] Task 3.3: Sisteme ilan eklenirken AI çıktısının veritabanına kaydedilmesi.

## Aşama 4: Backend Uç Noktaları (API Endpoints)
- [ ] Task 4.1: Auth Controller (Kayıt/Giriş).
- [ ] Task 4.2: Listings Controller (İlan ekleme/listeleme).
- [ ] Task 4.3: Reservations Controller (Rezervasyon ve stok).

## Aşama 5: Frontend Entegrasyonu (Angular)
- [ ] Task 5.1: HTTP Client yapılandırması.
- [ ] Task 5.2: İşletme paneli (Yeni ilan formu).
- [ ] Task 5.3: Kullanıcı paneli (İlan listesi ve AI Raf Ömrü rozeti).