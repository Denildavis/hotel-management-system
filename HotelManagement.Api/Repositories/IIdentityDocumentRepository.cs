using HotelManagement.Api.Entities;

namespace HotelManagement.Api.Repositories;

public interface IIdentityDocumentRepository
{
    Task<IdentityDocument> CreateAsync(IdentityDocument document);

    Task<List<IdentityDocument>> GetByReservationIdAsync(int reservationId);
}