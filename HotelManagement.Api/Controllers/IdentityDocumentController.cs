using HotelManagement.Api.Services;
using Microsoft.AspNetCore.Mvc;

namespace HotelManagement.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class IdentityDocumentController : ControllerBase
{
    private readonly IIdentityDocumentService _service;

    private static readonly string[] AllowedExtensions =
    {
        ".jpg",
        ".jpeg",
        ".png",
        ".pdf"
    };

    private const long MaxFileSize = 5 * 1024 * 1024;

    public IdentityDocumentController(
        IIdentityDocumentService service)
    {
        _service = service;
    }

    [HttpPost("upload/{reservationId}")]
    [Consumes("multipart/form-data")]
    public async Task<IActionResult> Upload(
        int reservationId,
        IFormFile file,
        [FromForm] string documentType)
    {
        if (file == null || file.Length == 0)
        {
            return BadRequest(new
            {
                message = "Please select a document."
            });
        }

        if (file.Length > MaxFileSize)
        {
            return BadRequest(new
            {
                message = "File size cannot exceed 5 MB."
            });
        }

        if (string.IsNullOrWhiteSpace(documentType))
        {
            return BadRequest(new
            {
                message = "Document type is required."
            });
        }

        var extension =
            Path.GetExtension(file.FileName)
                .ToLowerInvariant();

        if (!AllowedExtensions.Contains(extension))
        {
            return BadRequest(new
            {
                message =
                    "Only JPG, JPEG, PNG and PDF files are allowed."
            });
        }

        try
        {
            var savedDocument =
                await _service.SaveDocumentAsync(
                    reservationId,
                    file,
                    documentType);

            return Ok(new
            {
                message = "Identity document uploaded successfully.",
                document = savedDocument
            });
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new
            {
                message = ex.Message
            });
        }
    }

    [HttpGet("{reservationId}")]
    public async Task<IActionResult> GetDocuments(
        int reservationId)
    {
        var documents =
            await _service.GetDocumentsAsync(reservationId);

        return Ok(documents);
    }
}