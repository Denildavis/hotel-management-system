using HotelManagement.Api.Entities;
using HotelManagement.Api.Services;
using Microsoft.AspNetCore.Mvc;

namespace HotelManagement.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class GuestController : ControllerBase
{
    private readonly IGuestService _guestService;

    public GuestController(IGuestService guestService)
    {
        _guestService = guestService;
    }

    [HttpPost]
    public async Task<ActionResult<Guest>> CreateGuest(Guest guest)
    {
        var createdGuest = await _guestService.CreateGuestAsync(guest);

        return Ok(createdGuest);
    }

    [HttpGet]
    public async Task<ActionResult<List<Guest>>> GetAllGuests()
    {
        var guests = await _guestService.GetAllGuestsAsync();

        return Ok(guests);
    }
}