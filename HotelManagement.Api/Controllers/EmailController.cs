using HotelManagement.Api.Services;
using Microsoft.AspNetCore.Mvc;

namespace HotelManagement.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class EmailController : ControllerBase
{
    private readonly IEmailService _emailService;

    public EmailController(IEmailService emailService)
    {
        _emailService = emailService;
    }

    [HttpPost("test")]
    public async Task<IActionResult> TestEmail(
        [FromQuery] string email)
    {
        if (string.IsNullOrWhiteSpace(email))
        {
            return BadRequest(new
            {
                message = "Email is required."
            });
        }

        try
        {
            await _emailService.SendTestEmailAsync(email);

            return Ok(new
            {
                message = "Test email sent successfully."
            });
        }
        catch (Exception ex)
        {
            return BadRequest(new
            {
                message = "Failed to send email.",
                error = ex.Message
            });
        }
    }
}