using System;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace ArtiGida.API.Services
{
    public class AIService : IAIService
    {
        private readonly HttpClient _httpClient;
        private readonly IConfiguration _config;
        private readonly ILogger<AIService> _logger;

        public AIService(HttpClient httpClient, IConfiguration config, ILogger<AIService> logger)
        {
            _httpClient = httpClient;
            _config = config;
            _logger = logger;
        }

        public async Task<(string Category, string ShelfLife)> PredictListingDetailsAsync(string title, string description)
        {
            var apiKey = _config["OpenRouter:ApiKey"] ?? string.Empty;
            var model = _config["OpenRouter:Model"] ?? "google/gemini-2.5-flash";

            if (string.IsNullOrWhiteSpace(apiKey))
            {
                _logger.LogInformation("OpenRouter API anahtarı bulunamadı. Mock AI tahmini kullanılıyor.");
                return PredictMock(title, description);
            }

            try
            {
                var prompt = $@"Gıda kurtarma platformu (ArtıGıda) için bir yapay zeka asistanısın. 
Aşağıdaki ilanın başlığı ve açıklamasını analiz ederek şu bilgileri çıkar:
1. Gıdanın kategorisi (Şunlardan biri olmalı: ""Unlu Mamül"", ""Yemek"", ""Tatlı"", ""Meyve/Sebze"", ""Süt Ürünü"", ""İçecek"", ""Diğer"")
2. Tahmini tüketim ömrü / güvenli raf ömrü (Türkçe olarak örn: ""12 Saat"", ""24 Saat"", ""48 Saat"", ""3 Gün"", ""5 Gün"").

Yanıtı SADECE aşağıdaki JSON formatında ver. Başka hiçbir metin, açıklama veya markdown bloğu (```json gibi) ekleme.

{{
  ""category"": ""kategori adı"",
  ""shelf_life"": ""raf ömrü""
}}

İlan Başlığı: {title}
İlan Açıklaması: {description}";

                var requestBody = new
                {
                    model = model,
                    messages = new[]
                    {
                        new { role = "user", content = prompt }
                    }
                };

                var request = new HttpRequestMessage(HttpMethod.Post, "https://openrouter.ai/api/v1/chat/completions");
                request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", apiKey);
                request.Headers.Add("HTTP-Referer", "https://github.com/aylinelif/ArtiGida"); // Referrer required by OpenRouter
                request.Headers.Add("X-Title", "ArtiGida Social Project");

                var jsonOptions = new JsonSerializerOptions { PropertyNamingPolicy = JsonNamingPolicy.CamelCase };
                request.Content = new StringContent(JsonSerializer.Serialize(requestBody), Encoding.UTF8, "application/json");

                var response = await _httpClient.SendAsync(request);
                response.EnsureSuccessStatusCode();

                var responseContent = await response.Content.ReadAsStringAsync();
                using var doc = JsonDocument.Parse(responseContent);
                var aiText = doc.RootElement
                    .GetProperty("choices")[0]
                    .GetProperty("message")
                    .GetProperty("content")
                    .GetString() ?? string.Empty;

                _logger.LogInformation($"AI Raw Response: {aiText}");

                // Clean potential markdown blocks
                aiText = Regex.Replace(aiText, @"```json\s*", "");
                aiText = Regex.Replace(aiText, @"```\s*", "");
                aiText = aiText.Trim();

                using var predictionDoc = JsonDocument.Parse(aiText);
                var category = predictionDoc.RootElement.GetProperty("category").GetString() ?? "Diğer";
                var shelfLife = predictionDoc.RootElement.GetProperty("shelf_life").GetString() ?? "24 Saat";

                return (category, shelfLife);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "OpenRouter API çağrısı sırasında hata oluştu. Mock tahmine dönülüyor.");
                return PredictMock(title, description);
            }
        }

        private (string Category, string ShelfLife) PredictMock(string title, string description)
        {
            var textToAnalyze = $"{title} {description}".ToLowerInvariant();

            string category = "Diğer";
            string shelfLife = "24 Saat";

            if (textToAnalyze.Contains("ekmek") || textToAnalyze.Contains("simit") || textToAnalyze.Contains("poğaça") || 
                textToAnalyze.Contains("börek") || textToAnalyze.Contains("kurabiye") || textToAnalyze.Contains("açma") ||
                textToAnalyze.Contains("fırın") || textToAnalyze.Contains("unlu"))
            {
                category = "Unlu Mamül";
                shelfLife = "12 Saat";
            }
            else if (textToAnalyze.Contains("çorba") || textToAnalyze.Contains("pilav") || textToAnalyze.Contains("makarna") || 
                     textToAnalyze.Contains("tavuk") || textToAnalyze.Contains("et") || textToAnalyze.Contains("köfte") ||
                     textToAnalyze.Contains("sebze yemeği") || textToAnalyze.Contains("pide") || textToAnalyze.Contains("pizza") ||
                     textToAnalyze.Contains("döner") || textToAnalyze.Contains("sandviç"))
            {
                category = "Yemek";
                shelfLife = "24 Saat";
            }
            else if (textToAnalyze.Contains("pasta") || textToAnalyze.Contains("kek") || textToAnalyze.Contains("baklava") || 
                     textToAnalyze.Contains("sütlaç") || textToAnalyze.Contains("çikolata") || textToAnalyze.Contains("tatlı"))
            {
                category = "Tatlı";
                shelfLife = "48 Saat";
            }
            else if (textToAnalyze.Contains("süt") || textToAnalyze.Contains("peynir") || textToAnalyze.Contains("yoğurt") || 
                     textToAnalyze.Contains("tereyağı"))
            {
                category = "Süt Ürünü";
                shelfLife = "3 Gün";
            }
            else if (textToAnalyze.Contains("meyve") || textToAnalyze.Contains("sebze") || textToAnalyze.Contains("elma") || 
                     textToAnalyze.Contains("muz") || textToAnalyze.Contains("domates") || textToAnalyze.Contains("salata"))
            {
                category = "Meyve/Sebze";
                shelfLife = "3 Gün";
            }
            else if (textToAnalyze.Contains("çay") || textToAnalyze.Contains("kahve") || textToAnalyze.Contains("su") || 
                     textToAnalyze.Contains("meyve suyu") || textToAnalyze.Contains("kola") || textToAnalyze.Contains("soda"))
            {
                category = "İçecek";
                shelfLife = "5 Gün";
            }

            return (category, shelfLife);
        }
    }
}
