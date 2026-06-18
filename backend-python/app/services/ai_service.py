import os
import re
import json
import httpx
import logging

logger = logging.getLogger(__name__)

def predict_mock(title: str, description: str) -> dict:
    text = f"{title} {description}".lower()
    category = "Diğer"
    shelf_life = "24 Saat"
    allergens = "Yok"
    carbon_saved = 1.5

    contains_et = bool(re.search(r"\b(et|eti|etler|etli)\b", text))
    contains_su = bool(re.search(r"\b(su|suyu|sular)\b", text))

    if any(k in text for k in ["ekmek", "simit", "poğaça", "börek", "kurabiye", "açma", "fırın", "unlu"]):
        category = "Unlu Mamül"
        shelf_life = "12 Saat"
        allergens = "Gluten, Yumurta"
        carbon_saved = 0.8
    elif any(k in text for k in ["çorba", "pilav", "makarna", "tavuk", "köfte", "sebze yemeği", "pide", "pizza", "döner", "sandviç"]) or contains_et:
        category = "Yemek"
        shelf_life = "24 Saat"
        allergens = "Gluten, Kırmızı/Beyaz Et" if any(k in text for k in ["tavuk", "köfte"]) or contains_et else "Gluten"
        carbon_saved = 3.4 if any(k in text for k in ["köfte"]) or contains_et else (2.2 if "tavuk" in text else 1.4)
    elif any(k in text for k in ["pasta", "kek", "baklava", "sütlaç", "çikolata", "tatlı"]):
        category = "Tatlı"
        shelf_life = "48 Saat"
        allergens = "Gluten, Süt, Şeker"
        carbon_saved = 1.1
    elif any(k in text for k in ["süt", "peynir", "yoğurt", "tereyağı"]):
        category = "Süt Ürünü"
        shelf_life = "3 Gün"
        allergens = "Süt Ürünü (Laktoz)"
        carbon_saved = 1.8
    elif any(k in text for k in ["meyve", "sebze", "elma", "muz", "domates", "salata"]):
        category = "Meyve/Sebze"
        shelf_life = "3 Gün"
        allergens = "Yok"
        carbon_saved = 0.5
    elif any(k in text for k in ["çay", "kahve", "meyve suyu", "kola", "soda"]) or contains_su:
        category = "İçecek"
        shelf_life = "5 Gün"
        allergens = "Yok"
        carbon_saved = 0.3

    return {
        "category": category,
        "shelfLife": shelf_life,
        "allergens": allergens,
        "carbonSaved": carbon_saved
    }

async def predict_listing_details(title: str, description: str) -> dict:
    api_key = os.getenv("OPENROUTER_API_KEY")
    model = os.getenv("OPENROUTER_MODEL", "google/gemini-2.5-flash")

    if not api_key:
        logger.info("OPENROUTER_API_KEY bulunamadı, Mock AI tahmini kullanılıyor.")
        return predict_mock(title, description)

    try:
        prompt = f"""Gıda kurtarma platformu (ArtıGıda) için bir yapay zeka asistanısın. 
Aşağıdaki ilanın başlığı ve açıklamasını analiz ederek şu bilgileri çıkar:
1. Gıdanın kategorisi (Şunlardan biri olmalı: "Unlu Mamül", "Yemek", "Tatlı", "Meyve/Sebze", "Süt Ürünü", "İçecek", "Diğer")
2. Tahmini tüketim ömrü / güvenli raf ömrü (Türkçe olarak örn: "12 Saat", "24 Saat", "48 Saat", "3 Gün", "5 Gün").
3. Alerjen bilgileri (İçerebileceği temel alerjen maddeler Türkçe olarak örn: "Gluten", "Süt Ürünü (Laktoz)", "Kuruyemiş", "Yumurta" veya alerjen yoksa "Yok").
4. Bu porsiyonun kurtarılmasıyla sağlanacak tahmini karbon tasarrufu (CO2 salınım tasarrufu - double tipinde kg olarak örn: 1.8, 2.5, 3.2. Genellikle kırmızı et içeren yemekler için 3.0-4.0, tavuk/balık için 2.0-2.8, sebze/meyveler için 0.5-1.2, unlu mamüller/tatlılar için 0.8-1.5 arasındadır).

Yanıtı SADECE aşağıdaki JSON formatında ver. Başka hiçbir metin, açıklama veya markdown bloğu (```json gibi) ekleme.

{{
  "category": "kategori adı",
  "shelf_life": "raf ömrü",
  "allergens": "alerjen bilgileri",
  "carbon_saved": 2.5
}}

İlan Başlığı: {title}
İlan Açıklaması: {description}"""

        headers = {
            "Authorization": f"Bearer {api_key}",
            "HTTP-Referer": "https://github.com/aylinelif/ArtiGida",
            "X-Title": "ArtiGida Social Project"
        }
        
        data = {
            "model": model,
            "messages": [{"role": "user", "content": prompt}]
        }

        async with httpx.AsyncClient() as client:
            response = await client.post("https://openrouter.ai/api/v1/chat/completions", json=data, headers=headers, timeout=15.0)
            response.raise_for_status()
            res_json = response.json()
            ai_text = res_json["choices"][0]["message"]["content"]

        logger.info(f"AI Raw Response: {ai_text}")
        
        # Clean markdown
        ai_text = re.sub(r"```json\s*", "", ai_text)
        ai_text = re.sub(r"```\s*", "", ai_text)
        ai_text = ai_text.strip()

        prediction = json.loads(ai_text)
        return {
            "category": prediction.get("category", "Diğer"),
            "shelfLife": prediction.get("shelf_life", "24 Saat"),
            "allergens": prediction.get("allergens", "Yok"),
            "carbonSaved": float(prediction.get("carbon_saved", 1.5))
        }
    except Exception as e:
        logger.error(f"OpenRouter API çağrısı başarısız: {e}, Mock tahmine dönülüyor.")
        return predict_mock(title, description)
