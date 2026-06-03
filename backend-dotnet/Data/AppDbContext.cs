using ArtiGida.API.Models;
using Microsoft.EntityFrameworkCore;

namespace ArtiGida.API.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
        {
        }

        public DbSet<User> Users { get; set; } = null!;
        public DbSet<FoodListing> Listings { get; set; } = null!;
        public DbSet<Reservation> Reservations { get; set; } = null!;
        public DbSet<ChatMessage> ChatMessages { get; set; } = null!;

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // User mapping
            modelBuilder.Entity<User>(entity =>
            {
                entity.ToTable("users");
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Id).HasColumnName("id");
                entity.Property(e => e.Name).HasColumnName("name").HasMaxLength(255).IsRequired();
                entity.Property(e => e.Email).HasColumnName("email").HasMaxLength(255).IsRequired();
                entity.HasIndex(e => e.Email).IsUnique();
                entity.Property(e => e.PasswordHash).HasColumnName("password_hash").HasMaxLength(255).IsRequired();
                
                entity.Property(e => e.Role)
                    .HasColumnName("role")
                    .HasMaxLength(20)
                    .HasConversion(
                        v => v.ToString(),
                        v => (UserRole)System.Enum.Parse(typeof(UserRole), v)
                    );
                entity.Property(e => e.CreatedAt)
                    .HasColumnName("created_at")
                    .HasColumnType("timestamp with time zone")
                    .IsRequired();
            });

            // FoodListing mapping
            modelBuilder.Entity<FoodListing>(entity =>
            {
                entity.ToTable("listings");
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Id).HasColumnName("id");
                entity.Property(e => e.Title).HasColumnName("title").HasMaxLength(255).IsRequired();
                entity.Property(e => e.Description).HasColumnName("description").HasColumnType("text");
                entity.Property(e => e.Category).HasColumnName("category").HasMaxLength(100).IsRequired();
                entity.Property(e => e.Quantity).HasColumnName("quantity").IsRequired();
                entity.Property(e => e.PickupTime)
                    .HasColumnName("pickup_time")
                    .HasColumnType("timestamp with time zone")
                    .IsRequired();
                entity.Property(e => e.ImageUrl).HasColumnName("image_url").HasColumnType("text");
                entity.Property(e => e.AiShelfLife).HasColumnName("ai_shelf_life").HasMaxLength(50);
                entity.Property(e => e.Allergens).HasColumnName("allergens").HasMaxLength(255);
                entity.Property(e => e.CarbonSaved).HasColumnName("carbon_saved").IsRequired();
                entity.Property(e => e.Latitude).HasColumnName("latitude");
                entity.Property(e => e.Longitude).HasColumnName("longitude");
                entity.Property(e => e.IsActive).HasColumnName("is_active").IsRequired();
                entity.Property(e => e.BusinessId).HasColumnName("business_id").IsRequired();
                entity.Property(e => e.CreatedAt)
                    .HasColumnName("created_at")
                    .HasColumnType("timestamp with time zone")
                    .IsRequired();

                entity.HasOne(d => d.Business)
                    .WithMany(p => p.Listings)
                    .HasForeignKey(d => d.BusinessId)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            // Reservation mapping
            modelBuilder.Entity<Reservation>(entity =>
            {
                entity.ToTable("reservations");
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Id).HasColumnName("id");
                entity.Property(e => e.ListingId).HasColumnName("listing_id").IsRequired();
                entity.Property(e => e.CustomerId).HasColumnName("customer_id").IsRequired();
                
                entity.Property(e => e.Status)
                    .HasColumnName("status")
                    .HasMaxLength(20)
                    .HasConversion(
                        v => v.ToString(),
                        v => (ReservationStatus)System.Enum.Parse(typeof(ReservationStatus), v)
                    );
                
                entity.Property(e => e.ReservedAt)
                    .HasColumnName("reserved_at")
                    .HasColumnType("timestamp with time zone")
                    .IsRequired();

                entity.HasOne(d => d.Listing)
                    .WithMany(p => p.Reservations)
                    .HasForeignKey(d => d.ListingId)
                    .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(d => d.Customer)
                    .WithMany(p => p.Reservations)
                    .HasForeignKey(d => d.CustomerId)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            // ChatMessage mapping
            modelBuilder.Entity<ChatMessage>(entity =>
            {
                entity.ToTable("chat_messages");
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Id).HasColumnName("id");
                entity.Property(e => e.SenderId).HasColumnName("sender_id").IsRequired();
                entity.Property(e => e.ReceiverId).HasColumnName("receiver_id").IsRequired();
                entity.Property(e => e.Content).HasColumnName("content").IsRequired();
                entity.Property(e => e.Timestamp)
                    .HasColumnName("timestamp")
                    .HasColumnType("timestamp with time zone")
                    .IsRequired();
                entity.Property(e => e.ListingId).HasColumnName("listing_id");
                entity.Property(e => e.IsRead).HasColumnName("is_read").IsRequired();

                entity.HasOne(d => d.Sender)
                    .WithMany()
                    .HasForeignKey(d => d.SenderId)
                    .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(d => d.Receiver)
                    .WithMany()
                    .HasForeignKey(d => d.ReceiverId)
                    .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(d => d.Listing)
                    .WithMany()
                    .HasForeignKey(d => d.ListingId)
                    .OnDelete(DeleteBehavior.SetNull);
            });
        }
    }
}
