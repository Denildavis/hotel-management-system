namespace HotelManagement.Api.Entities;

public class Reservation
{
    public int Id { get; set; }

    public int GuestId { get; set; }

    public string RoomNumber { get; set; } = string.Empty;

    public DateTime CheckInDate { get; set; }

    public DateTime CheckOutDate { get; set; }

    public string Status { get; set; } = "NEW";

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public Guest? Guest { get; set; }

    public ICollection<IdentityDocument> IdentityDocuments { get; set; }
    = new List<IdentityDocument>();
}