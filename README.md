# ArtıGıda - Gıda Kurtarma ve Yerel Dayanışma Platformu

## 1. Çözülen Problem
Restoranlar, fırınlar, pastaneler ve marketlerin gün sonunda ellerinde kalan tüketilebilir, taze gıdaları çöpe atması büyük bir israf ve ekonomik kayıptır. Diğer yandan, artan yaşam maliyetleri nedeniyle özellikle üniversite öğrencileri ve dar gelirli bireyler için nitelikli ve uygun fiyatlı gıdaya ulaşmak giderek zorlaşmaktadır. Bu durum, gıda israfı ile gıda ihtiyacı arasında bir köprü kurulmasını zorunlu kılmaktadır.

## 2. Hedef Kitle ve Pilot Bölge (MVP Aşaması)
Uygulamanın ilk aşaması (MVP) spesifik bir pilot bölgede test edilecektir:
* **İşletmeler:** Başlangıç aşamasında Zonguldak Bülent Ecevit Üniversitesi kampüsü çevresindeki yerel esnaf (fırınlar, pastaneler, küçük ev yemekleri restoranları, kafeler).
* **Kullanıcılar:** Kampüs çevresinde yaşayan, bütçe dostu gıda arayan üniversite öğrencileri ve yerel halk.

## 3. Değer Önermesi (Value Proposition)
* **İşletmeler için:** Çöpe gidecek ürünleri sıfır maliyetle veya çok cüzi bir fiyata platforma yükleyerek atık maliyetlerini düşürme, israfı önleme misyonuyla marka imajını (sosyal sorumluluk) güçlendirme ve dükkanlarına fiziksel olarak yeni müşteriler çekme fırsatı.
* **Kullanıcılar için:** Günlük, taze ve kaliteli gıdaya ücretsiz veya çok düşük bir ücret karşılığında, hızlı ve güvenilir bir şekilde ulaşma imkanı.

## 4. MVP Özellik Seti (Temel İşlevler)
* **İki Farklı Kullanıcı Rolü (Role-based Authorization):** İşletme (Esnaf) ve Müşteri (Öğrenci/Vatandaş) olmak üzere iki farklı kayıt ve giriş akışı.
* **İlan Ekleme (İşletme Modülü):** İşletmelerin gün sonunda ellerinde kalan ürünün fotoğrafını, başlığını, kalan miktarını (stok) ve teslimat saat aralığını (örn: 21:00 - 22:30) sisteme girebilmesi.
* **Listeleme ve Arama (Müşteri Modülü):** Kullanıcıların, aktif ve stoğu bitmemiş gıda ilanlarını ana sayfalarında liste halinde görebilmesi.
* **Rezervasyon Sistemi ve Stok Düşme:** Kullanıcının uygun gördüğü ilanı detaylarından inceleyip "Rezerve Et" butonuna basarak kendi adına ayırtması. İşlem sonrasında ilan stoğunun otomatik olarak güncellenmesi.