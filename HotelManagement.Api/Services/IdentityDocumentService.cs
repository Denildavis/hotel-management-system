using HotelManagement.Api.Entities;
using HotelManagement.Api.Repositories;
using Microsoft.AspNetCore.Http;

namespace HotelManagement.Api.Services;

public class IdentityDocumentService : IIdentityDocumentService
{
    private readonly IIdentityDocumentRepository _repository;
    private readonly IWebHostEnvironment _environment;

    public IdentityDocumentService(
        IIdentityDocumentRepository repository,
        IWebHostEnvironment environment)
    {
        _repository = repository;
        _environment = environment;
    }

    public async Task<IdentityDocument> SaveDocumentAsync(
        int reservationId,
        IFormFile file,
        string documentType)
    {
        if (file == null || file.Length == 0)
            throw new ArgumentException("Please select a file.");

        var uploadsFolder = Path.Combine(
            _environment.ContentRootPath,
            "Uploads",
            "IdentityDocuments");

        Directory.CreateDirectory(uploadsFolder);

        var extension = Path.GetExtension(file.FileName);

        var uniqueFileName =
            $"{Guid.NewGuid()}{extension}";

        var filePath = Path.Combine(
            uploadsFolder,
            uniqueFileName);

        using (var stream = new FileStream(
            filePath,
            FileMode.Create))
        {
            await file.CopyToAsync(stream);
        }

        var document = new IdentityDocument
        {
            ReservationId = reservationId,
            FileName = file.FileName,
            FilePath = filePath,
            DocumentType = documentType,
            UploadedAt = DateTime.UtcNow
        };

        return await _repository.CreateAsync(document);
    }

    public async Task<List<IdentityDocument>> GetDocumentsAsync(
        int reservationId)
    {
        return await _repository.GetByReservationIdAsync(reservationId);
    }
}