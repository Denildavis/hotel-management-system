namespace HotelManagement.Api.Entities;

public class Payment
{
    public int Id { get; set; }

    public int ReservationId { get; set; }

    public decimal Amount { get; set; }

    public string? PaymentLink { get; set; }

    public string? PaymentReference { get; set; }

    public string Status { get; set; } = "PENDING";

    public DateTime CreatedAt { get; set; } = DateTime.Now;

    public DateTime? PaidAt { get; set; }

    public Reservation? Reservation { get; set; }
}