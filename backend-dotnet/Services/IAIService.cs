using System.Threading.Tasks;

namespace ArtiGida.API.Services
{
    public interface IAIService
    {
        Task<(string Category, string ShelfLife)> PredictListingDetailsAsync(string title, string description);
    }
}
