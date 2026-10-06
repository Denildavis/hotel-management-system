using System.ComponentModel.DataAnnotations.Schema;

namespace HotelManagement.Api.Entities;

[Table("IDENTITY_DOCUMENTS", Schema = "SYSTEM")]
public class IdentityDocument
{
    [Column("ID")]
    public int Id { get; set; }

    [Column("RESERVATION_ID")]
    public int ReservationId { get; set; }

    [Column("FILE_NAME")]
    public string FileName { get; set; } = string.Empty;

    [Column("FILE_PATH")]
    public string FilePath { get; set; } = string.Empty;

    [Column("DOCUMENT_TYPE")]
    public string DocumentType { get; set; } = string.Empty;

    [Column("UPLOADED_AT")]
    public DateTime UploadedAt { get; set; } = DateTime.UtcNow;

    public Reservation? Reservation { get; set; }
}