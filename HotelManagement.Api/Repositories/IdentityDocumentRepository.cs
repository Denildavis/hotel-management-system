using HotelManagement.Api.Data;
using HotelManagement.Api.Entities;
using Microsoft.EntityFrameworkCore;

namespace HotelManagement.Api.Repositories;

public class IdentityDocumentRepository : IIdentityDocumentRepository
{
    private readonly HotelDbContext _context;

    public IdentityDocumentRepository(HotelDbContext context)
    {
        _context = context;
    }

    public async Task<IdentityDocument> CreateAsync(
        IdentityDocument document)
    {
        _context.IdentityDocuments.Add(document);

        await _context.SaveChangesAsync();

        return document;
    }

    public async Task<List<IdentityDocument>> GetByReservationIdAsync(
    int reservationId)
{
    var entityType = _context.Model.FindEntityType(typeof(IdentityDocument));

    if (entityType != null)
    {
        Console.WriteLine("========== EF IDENTITY DOCUMENT MAPPING ==========");

        foreach (var property in entityType.GetProperties())
        {
            Console.WriteLine(
                $"{property.Name} -> {property.GetColumnName()}");
        }

        Console.WriteLine("==================================================");
    }

    return await _context.IdentityDocuments
        .Where(x => x.ReservationId == reservationId)
        .OrderByDescending(x => x.UploadedAt)
        .ToListAsync();
}
}