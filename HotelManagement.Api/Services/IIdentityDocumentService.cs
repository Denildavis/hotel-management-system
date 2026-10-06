using HotelManagement.Api.Entities;
using Microsoft.AspNetCore.Http;

namespace HotelManagement.Api.Services;

public interface IIdentityDocumentService
{
    Task<IdentityDocument> SaveDocumentAsync(
        int reservationId,
        IFormFile file,
        string documentType);

    Task<List<IdentityDocument>> GetDocumentsAsync(
        int reservationId);
}