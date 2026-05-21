using System;
using System.Collections.Generic;
using System.Linq;
using ArtiGida.API.Models;

namespace ArtiGida.API.Data
{
    public static class DbInitializer
    {
        public static void Seed(AppDbContext context)
        {
            if (context.Users.Any())
            {
                return; // DB has been seeded
            }

            var passwordHash = BCrypt.Net.BCrypt.HashPassword("Artigida123!");

            // 1. Seed Customer
            var customer = new User
            {
                Name = "Ayşe Öğrenci",
                Email = "ogrenci@artigida.local",
                PasswordHash = passwordHash,
                Role = UserRole.user,
                CreatedAt = DateTime.UtcNow
            };
            context.Users.Add(customer);

            // 2. Seed Businesses
            var fırın = new User
            {
                Name = "Kampüs Fırın",
                Email = "isletme@artigida.local",
                PasswordHash = passwordHash,
                Role = UserRole.business,
                CreatedAt = DateTime.UtcNow
            };
            context.Users.Add(fırın);

            var lokanta = new User
            {
                Name = "Ev Yemekleri Lokantası",
                Email = "evyemekleri@artigida.local",
                PasswordHash = passwordHash,
                Role = UserRole.business,
                CreatedAt = DateTime.UtcNow
            };
            context.Users.Add(lokanta);

            var coffee = new User
            {
                Name = "Campus Coffee & Bowl",
                Email = "campuscoffee@artigida.local",
                PasswordHash = passwordHash,
                Role = UserRole.business,
                CreatedAt = DateTime.UtcNow
            };
            context.Users.Add(coffee);

            var market = new User
            {
                Name = "Yeşil Market Köşesi",
                Email = "yesilmarket@artigida.local",
                PasswordHash = passwordHash,
                Role = UserRole.business,
                CreatedAt = DateTime.UtcNow
            };
            context.Users.Add(market);

            var tatlıcı = new User
            {
                Name = "Tatlıcı Ayşe",
                Email = "tatlici@artigida.local",
                PasswordHash = passwordHash,
                Role = UserRole.business,
                CreatedAt = DateTime.UtcNow
            };
            context.Users.Add(tatlıcı);

            context.SaveChanges();

            // 3. Seed Listings
            var now = DateTime.UtcNow;

            var listings = new List<FoodListing>
            {
                // Kampüs Fırın
                new FoodListing
                {
                    Title = "Peynirli Poğaça ve Simit Paketi",
                    Description = "Gün sonu taze simit ve poğaça karışık paket.",
                    Category = "Unlu Mamül",
                    Quantity = 8,
                    PickupTime = now.AddHours(3),
                    AiShelfLife = "12 Saat",
                    ImageUrl = "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=500",
                    BusinessId = fırın.Id,
                    IsActive = true,
                    CreatedAt = now
                },
                new FoodListing
                {
                    Title = "Taze Ekmek ve Börek Tepsisi",
                    Description = "Fırından yeni çıkmış ekmek ve börek çeşitleri.",
                    Category = "Unlu Mamül",
                    Quantity = 6,
                    PickupTime = now.AddHours(4),
                    AiShelfLife = "10 Saat",
                    ImageUrl = "https://images.unsplash.com/photo-1549931319-a545dcf3bc73?w=500",
                    BusinessId = fırın.Id,
                    IsActive = true,
                    CreatedAt = now
                },
                new FoodListing
                {
                    Title = "Kruvasan ve Kurabiye Kutusu",
                    Description = "Tatlı fırın ürünleri karma kutu.",
                    Category = "Tatlı",
                    Quantity = 4,
                    PickupTime = now.AddHours(5),
                    AiShelfLife = "8 Saat",
                    ImageUrl = "https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=500",
                    BusinessId = fırın.Id,
                    IsActive = true,
                    CreatedAt = now
                },

                // Ev Yemekleri Lokantası
                new FoodListing
                {
                    Title = "Kalan Sulu Yemek Porsiyonları",
                    Description = "Günlük ev yapımı sulu yemek porsiyonları.",
                    Category = "Yemek",
                    Quantity = 5,
                    PickupTime = now.AddHours(2),
                    AiShelfLife = "24 Saat",
                    ImageUrl = "https://images.unsplash.com/photo-1547592180-85f173990554?w=500",
                    BusinessId = lokanta.Id,
                    IsActive = true,
                    CreatedAt = now
                },
                new FoodListing
                {
                    Title = "Mercimek Çorbası ve Pilav Seti",
                    Description = "Sıcak çorba ve pilav ikili paket.",
                    Category = "Yemek",
                    Quantity = 6,
                    PickupTime = now.AddHours(3),
                    AiShelfLife = "18 Saat",
                    ImageUrl = "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=500",
                    BusinessId = lokanta.Id,
                    IsActive = true,
                    CreatedAt = now
                },
                new FoodListing
                {
                    Title = "Izgara Köfte ve Salata Tabağı",
                    Description = "Protein ağırlıklı akşam paketi.",
                    Category = "Yemek",
                    Quantity = 3,
                    PickupTime = now.AddHours(4),
                    AiShelfLife = "12 Saat",
                    ImageUrl = "https://images.unsplash.com/photo-1529042410759-befb1204bda8?w=500",
                    BusinessId = lokanta.Id,
                    IsActive = true,
                    CreatedAt = now
                },

                // Campus Coffee & Bowl
                new FoodListing
                {
                    Title = "Kahvaltı Bowl ve Smoothie",
                    Description = "Yoğurt, meyve ve granola kasesi.",
                    Category = "Tatlı",
                    Quantity = 4,
                    PickupTime = now.AddHours(2),
                    AiShelfLife = "6 Saat",
                    ImageUrl = "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=500",
                    BusinessId = coffee.Id,
                    IsActive = true,
                    CreatedAt = now
                },
                new FoodListing
                {
                    Title = "Sandviç ve Salata Paketi",
                    Description = "Taze hazırlanmış sandviç + yeşil salata.",
                    Category = "Unlu Mamül",
                    Quantity = 7,
                    PickupTime = now.AddHours(3),
                    AiShelfLife = "8 Saat",
                    ImageUrl = "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=500",
                    BusinessId = coffee.Id,
                    IsActive = true,
                    CreatedAt = now
                },

                // Yeşil Market Köşesi
                new FoodListing
                {
                    Title = "Meyve Tabağı (Karışık)",
                    Description = "Günlük taze kesilmiş meyve tabağı.",
                    Category = "Meyve/Sebze",
                    Quantity = 5,
                    PickupTime = now.AddHours(2),
                    AiShelfLife = "3 Saat",
                    ImageUrl = "https://images.unsplash.com/photo-1610831187509-42b9089aaada?w=500",
                    BusinessId = market.Id,
                    IsActive = true,
                    CreatedAt = now
                },
                new FoodListing
                {
                    Title = "Sebze Paketi — Akşam İndirimi",
                    Description = "Domates, biber, salatalık karışık paket.",
                    Category = "Meyve/Sebze",
                    Quantity = 10,
                    PickupTime = now.AddHours(4),
                    AiShelfLife = "2 Gün",
                    ImageUrl = "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=500",
                    BusinessId = market.Id,
                    IsActive = true,
                    CreatedAt = now
                },
                new FoodListing
                {
                    Title = "Organik Yeşillik Seti",
                    Description = "Marul, roka ve maydanoz taze set.",
                    Category = "Meyve/Sebze",
                    Quantity = 6,
                    PickupTime = now.AddHours(5),
                    AiShelfLife = "1 Gün",
                    ImageUrl = "https://images.unsplash.com/photo-1622206151226-18ca2c9ab4a1?w=500",
                    BusinessId = market.Id,
                    IsActive = true,
                    CreatedAt = now
                },

                // Tatlıcı Ayşe
                new FoodListing
                {
                    Title = "Baklava ve Künefe Kutusu",
                    Description = "Gün sonu tatlı paketi, 4-6 porsiyon.",
                    Category = "Tatlı",
                    Quantity = 3,
                    PickupTime = now.AddHours(3),
                    AiShelfLife = "24 Saat",
                    ImageUrl = "https://images.unsplash.com/photo-1598110756568-713f90644e5f?w=500",
                    BusinessId = tatlıcı.Id,
                    IsActive = true,
                    CreatedAt = now
                },
                new FoodListing
                {
                    Title = "Cheesecake Dilimleri",
                    Description = "Çilekli ve limonlu cheesecake karışık.",
                    Category = "Tatlı",
                    Quantity = 5,
                    PickupTime = now.AddHours(4),
                    AiShelfLife = "12 Saat",
                    ImageUrl = "https://images.unsplash.com/photo-1524351199679-941f07020c0b?w=500",
                    BusinessId = tatlıcı.Id,
                    IsActive = true,
                    CreatedAt = now
                }
            };

            context.Listings.AddRange(listings);
            context.SaveChanges();
        }
    }
}
