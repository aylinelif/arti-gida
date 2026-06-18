# ArtıGıda - Teknik Ürün Gereksinim Dokümanı (PRD)

## 1. Teknoloji Yığını (Tech Stack)
* **Frontend:** Angular veya React (Web tabanlı kullanıcı arayüzü)
* **Backend:** .NET Core Web API (RESTful mimari)
* **Veritabanı:** PostgreSQL (İlişkisel veri yönetimi)

## 2. Veritabanı Tabloları ve Nitelikleri (Database Schema)

**Table: Users (Kullanıcılar)**
* `Id` (UUID, Primary Key)
* `FullName` (String)
* `Email` (String, Unique)
* `PasswordHash` (String)
* `RoleId` (Int, Foreign Key) -> (1: İşletme, 2: Müşteri)
* `CreatedAt` (DateTime)

**Table: Establishments (İşletme Detayları)**
* `Id` (UUID, Primary Key)
* `UserId` (UUID, Foreign Key)
* `BusinessName` (String)
* `Address` (String)
* `ContactNumber` (String)

**Table: FoodListings (Gıda İlanları)**
* `Id` (UUID, Primary Key)
* `EstablishmentId` (UUID, Foreign Key)
* `Title` (String) - Örn: "3 Adet Karışık Sandviç"
* `Description` (String)
* `Quantity` (Int)
* `PickupTimeStart` (Time)
* `PickupTimeEnd` (Time)
* `IsActive` (Boolean) - Varsayılan: True

**Table: Reservations (Rezervasyonlar)**
* `Id` (UUID, Primary Key)
* `ListingId` (UUID, Foreign Key)
* `CustomerId` (UUID, Foreign Key - Users tablosundan)
* `ReservedAt` (DateTime)
* `Status` (String) - (Pending, Completed, Cancelled)

## 3. Temel Uç Noktalar (API Endpoints)

**Auth & Users**
* `POST /api/auth/register` : Yeni kullanıcı/işletme kaydı.
* `POST /api/auth/login` : Sisteme giriş ve JWT (JSON Web Token) üretimi.

**Listings (İlanlar)**
* `POST /api/listings` : (Sadece İşletmeler) Yeni gıda ilanı oluşturur.
* `GET /api/listings/active` : (Tüm Kullanıcılar) Aktif ve stoğu olan gıda ilanlarını listeler.
* `PUT /api/listings/{id}` : (Sadece İşletmeler) İlan detaylarını/stoğunu günceller.

**Reservations (Rezervasyonlar)**
* `POST /api/reservations` : (Sadece Müşteriler) Belirli bir ilanı rezerve eder (Stok kontrolü yapılır).
* `GET /api/reservations/my-reservations` : Kullanıcının kendi geçmiş ve aktif rezervasyonlarını getirir.

## 4. Ekran Akışları (Screen Flows)

**Müşteri (Öğrenci) Akışı:**
1. Login/Register Ekranı -> Başarılı giriş.
2. Ana Sayfa (Dashboard) -> Aktif ilanların kartlar halinde (Firma adı, ürün, saat aralığı) listelenmesi.
3. İlan Detay Ekranı -> Ürün içeriği inceleme -> "Rezerve Et" butonuna tıklama.
4. Başarı Ekranı -> "Rezervasyon başarılı, ürününüzü [Saat] ile [Saat] arasında alabilirsiniz" bildirimi.

**İşletme Akışı:**
1. Login Ekranı -> Başarılı giriş.
2. İşletme Paneli -> "Yeni İlan Ekle" butonu.
3. Form Ekranı -> Ürün adı, adet ve teslim saati girilip kaydedilmesi.
4. Aktif İlanlarım Ekranı -> Kalan stok miktarını ve rezerve eden kişileri görüntüleme.