"""Örnek kullanıcı ve ilan verilerini yükler. Çalıştırma: python -m app.seed.seed_data"""

from datetime import datetime, timedelta, timezone

from sqlmodel import Session, select

from app.core.security import hash_password
from app.database import engine
from app.models.listing import Listing
from app.models.user import User, UserRole

SEED_CUSTOMER_EMAIL = "ogrenci@artigida.local"
DEFAULT_PASSWORD = "Artigida123!"

BUSINESSES = [
    {
        "name": "Kampüs Fırın",
        "email": "isletme@artigida.local",
        "listings": [
            {
                "title": "Peynirli Poğaça ve Simit Paketi",
                "description": "Gün sonu taze simit ve poğaça karışık paket.",
                "category": "Unlu Mamül",
                "quantity": 8,
                "hours": 3,
                "ai_shelf_life": "12 Saat",
                "image_url": "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=500",
            },
            {
                "title": "Taze Ekmek ve Börek Tepsisi",
                "description": "Fırından yeni çıkmış ekmek ve börek çeşitleri.",
                "category": "Unlu Mamül",
                "quantity": 6,
                "hours": 4,
                "ai_shelf_life": "10 Saat",
                "image_url": "https://images.unsplash.com/photo-1549931319-a545dcf3bc73?w=500",
            },
            {
                "title": "Kruvasan ve Kurabiye Kutusu",
                "description": "Tatlı fırın ürünleri karma kutu.",
                "category": "Tatlı & Pasta",
                "quantity": 4,
                "hours": 5,
                "ai_shelf_life": "8 Saat",
                "image_url": "https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=500",
            },
        ],
    },
    {
        "name": "Ev Yemekleri Lokantası",
        "email": "evyemekleri@artigida.local",
        "listings": [
            {
                "title": "Kalan Sulu Yemek Porsiyonları",
                "description": "Günlük ev yapımı sulu yemek porsiyonları.",
                "category": "Ana Yemek",
                "quantity": 5,
                "hours": 2,
                "ai_shelf_life": "24 Saat",
                "image_url": "https://images.unsplash.com/photo-1547592180-85f173990554?w=500",
            },
            {
                "title": "Mercimek Çorbası ve Pilav Seti",
                "description": "Sıcak çorba ve pilav ikili paket.",
                "category": "Ev Yemeği",
                "quantity": 6,
                "hours": 3,
                "ai_shelf_life": "18 Saat",
                "image_url": "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=500",
            },
            {
                "title": "Izgara Köfte ve Salata Tabağı",
                "description": "Protein ağırlıklı akşam paketi.",
                "category": "Ana Yemek",
                "quantity": 3,
                "hours": 4,
                "ai_shelf_life": "12 Saat",
                "image_url": "https://images.unsplash.com/photo-1529042410759-befb1204bda8?w=500",
            },
        ],
    },
    {
        "name": "Campus Coffee & Bowl",
        "email": "campuscoffee@artigida.local",
        "listings": [
            {
                "title": "Kahvaltı Bowl ve Smoothie",
                "description": "Yoğurt, meyve ve granola kasesi.",
                "category": "Tatlı & Pasta",
                "quantity": 4,
                "hours": 2,
                "ai_shelf_life": "6 Saat",
                "image_url": "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=500",
            },
            {
                "title": "Sandviç ve Salata Paketi",
                "description": "Taze hazırlanmış sandviç + yeşil salata.",
                "category": "Unlu Mamül",
                "quantity": 7,
                "hours": 3,
                "ai_shelf_life": "8 Saat",
                "image_url": "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=500",
            },
        ],
    },
    {
        "name": "Yeşil Market Köşesi",
        "email": "yesilmarket@artigida.local",
        "listings": [
            {
                "title": "Meyve Tabağı (Karışık)",
                "description": "Günlük taze kesilmiş meyve tabağı.",
                "category": "Taze Sebze/Meyve",
                "quantity": 5,
                "hours": 2,
                "ai_shelf_life": "3 Saat",
                "image_url": "https://images.unsplash.com/photo-1610831187509-42b9089aaada?w=500",
            },
            {
                "title": "Sebze Paketi — Akşam İndirimi",
                "description": "Domates, biber, salatalık karışık paket.",
                "category": "Taze Sebze/Meyve",
                "quantity": 10,
                "hours": 4,
                "ai_shelf_life": "2 Gün",
                "image_url": "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=500",
            },
            {
                "title": "Organik Yeşillik Seti",
                "description": "Marul, roka ve maydanoz taze set.",
                "category": "Taze Sebze/Meyve",
                "quantity": 6,
                "hours": 5,
                "ai_shelf_life": "1 Gün",
                "image_url": "https://images.unsplash.com/photo-1622206151226-18ca2c9ab4a1?w=500",
            },
        ],
    },
    {
        "name": "Tatlıcı Ayşe",
        "email": "tatlici@artigida.local",
        "listings": [
            {
                "title": "Baklava ve Künefe Kutusu",
                "description": "Gün sonu tatlı paketi, 4-6 porsiyon.",
                "category": "Tatlı & Pasta",
                "quantity": 3,
                "hours": 3,
                "ai_shelf_life": "24 Saat",
                "image_url": "https://images.unsplash.com/photo-1598110756568-713f90644e5f?w=500",
            },
            {
                "title": "Cheesecake Dilimleri",
                "description": "Çilekli ve limonlu cheesecake karışık.",
                "category": "Tatlı & Pasta",
                "quantity": 5,
                "hours": 4,
                "ai_shelf_life": "12 Saat",
                "image_url": "https://images.unsplash.com/photo-1524351199679-941f07020c0b?w=500",
            },
        ],
    },
]


def _get_or_create_business(session: Session, name: str, email: str, password_hash: str) -> User:
    business = session.exec(select(User).where(User.email == email)).first()
    if business:
        return business
    business = User(
        name=name,
        email=email,
        password_hash=password_hash,
        role=UserRole.BUSINESS,
    )
    session.add(business)
    session.commit()
    session.refresh(business)
    return business


def _listing_exists(session: Session, business_id: int, title: str) -> bool:
    return (
        session.exec(
            select(Listing).where(
                Listing.business_id == business_id,
                Listing.title == title,
            )
        ).first()
        is not None
    )


def seed() -> None:
    with Session(engine) as session:
        password_hash = hash_password(DEFAULT_PASSWORD)

        for user in session.exec(select(User)).all():
            if not user.password_hash:
                user.password_hash = password_hash
                session.add(user)
        session.commit()

        customer = session.exec(
            select(User).where(User.email == SEED_CUSTOMER_EMAIL)
        ).first()
        if customer is None:
            customer = User(
                name="Ayşe Öğrenci",
                email=SEED_CUSTOMER_EMAIL,
                password_hash=password_hash,
                role=UserRole.USER,
            )
            session.add(customer)
            session.commit()

        now = datetime.now(timezone.utc)
        added = 0

        for biz_data in BUSINESSES:
            business = _get_or_create_business(
                session, biz_data["name"], biz_data["email"], password_hash
            )
            for item in biz_data["listings"]:
                if _listing_exists(session, business.id, item["title"]):
                    continue
                session.add(
                    Listing(
                        title=item["title"],
                        description=item["description"],
                        category=item["category"],
                        quantity=item["quantity"],
                        pickup_time=now + timedelta(hours=item["hours"]),
                        image_url=item["image_url"],
                        ai_shelf_life=item["ai_shelf_life"],
                        business_id=business.id,
                    )
                )
                added += 1

        session.commit()
        total = len(session.exec(select(Listing)).all())

        print(f"Seed tamamlandı. {added} yeni ilan eklendi. Toplam ilan: {total}")
        print(f"  Müşteri: {SEED_CUSTOMER_EMAIL} / {DEFAULT_PASSWORD}")
        print("  İşletmeler (hepsi aynı şifre):")
        for biz in BUSINESSES:
            print(f"    - {biz['email']}")


if __name__ == "__main__":
    seed()
