using HotelManagement.Api.Entities;
using Microsoft.EntityFrameworkCore;

namespace HotelManagement.Api.Data;

public class HotelDbContext : DbContext
{
    public HotelDbContext(DbContextOptions<HotelDbContext> options)
        : base(options)
    {
    }

    public DbSet<Guest> Guests { get; set; }

    public DbSet<Reservation> Reservations { get; set; }

    public DbSet<IdentityDocument> IdentityDocuments { get; set; }
    public DbSet<Payment> Payments { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<Guest>(entity =>
        {
            entity.ToTable("Guests");

            entity.HasKey(x => x.Id);
        });

        modelBuilder.Entity<Reservation>(entity =>
        {
            entity.ToTable("Reservations");

            entity.HasKey(x => x.Id);
        });

        modelBuilder.Entity<IdentityDocument>(entity =>
    {
        entity.ToTable("IDENTITY_DOCUMENTS", "SYSTEM");

        entity.HasKey(x => x.Id);

        entity.Property(x => x.Id)
            .HasColumnName("ID");

        entity.Property(x => x.ReservationId)
            .HasColumnName("RESERVATION_ID");

        entity.Property(x => x.FileName)
            .HasColumnName("FILE_NAME");

        entity.Property(x => x.FilePath)
            .HasColumnName("FILE_PATH");

        entity.Property(x => x.DocumentType)
            .HasColumnName("DOCUMENT_TYPE");

        entity.Property(x => x.UploadedAt)
            .HasColumnName("UPLOADED_AT");
    });
    modelBuilder.Entity<Payment>(entity =>
{
    entity.ToTable("PAYMENTS");

    entity.HasKey(p => p.Id);

    entity.Property(p => p.Id)
        .HasColumnName("ID");

    entity.Property(p => p.ReservationId)
        .HasColumnName("RESERVATION_ID");

    entity.Property(p => p.Amount)
        .HasColumnName("AMOUNT")
        .HasPrecision(10, 2);

    entity.Property(p => p.PaymentLink)
        .HasColumnName("PAYMENT_LINK")
        .HasMaxLength(500);

    entity.Property(p => p.PaymentReference)
        .HasColumnName("PAYMENT_REFERENCE")
        .HasMaxLength(100);

    entity.Property(p => p.Status)
        .HasColumnName("STATUS")
        .HasMaxLength(30)
        .IsRequired();

    entity.Property(p => p.CreatedAt)
        .HasColumnName("CREATED_AT");

    entity.Property(p => p.PaidAt)
        .HasColumnName("PAID_AT");

    entity.HasOne(p => p.Reservation)
        .WithMany()
        .HasForeignKey(p => p.ReservationId);
});
    }
}