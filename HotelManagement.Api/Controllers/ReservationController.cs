using HotelManagement.Api.Entities;
using HotelManagement.Api.Services;
using Microsoft.AspNetCore.Mvc;

namespace HotelManagement.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ReservationController : ControllerBase
{
    private readonly IReservationService _service;

    public ReservationController(IReservationService service)
    {
        _service = service;
    }

    // GET: api/Reservation
    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var reservations = await _service.GetAllReservationsAsync();

        return Ok(reservations);
    }

    // GET: api/Reservation/1
    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var reservation = await _service.GetReservationByIdAsync(id);

        if (reservation == null)
            return NotFound();

        return Ok(reservation);
    }

    // POST: api/Reservation
    [HttpPost]
[HttpPost]
public async Task<IActionResult> Create(Reservation reservation)
{
    try
    {
        var createdReservation =
            await _service.CreateReservationAsync(reservation);

        return CreatedAtAction(
            nameof(GetById),
            new { id = createdReservation.Id },
            createdReservation);
    }
    catch (ArgumentException ex)
    {
        return BadRequest(new
        {
            message = ex.Message
        });
    }
}

    // PUT: api/Reservation/1/pre-checkin
    [HttpPut("{id}/pre-checkin")]
    public async Task<IActionResult> PreCheckIn(int id)
    {
        var result = await _service.MoveToPreCheckInAsync(id);

        if (!result)
            return BadRequest("Reservation cannot be moved to pre-check-in.");

        return Ok(new
        {
            message = "Reservation moved to PRE_CHECKIN successfully."
        });
    }

    // PUT: api/Reservation/1/checkin
    [HttpPut("{id}/checkin")]
public async Task<IActionResult> CheckIn(int id)
{
    try
    {
        var result = await _service.CheckInAsync(id);

        if (!result)
            return BadRequest(new
            {
                message = "Reservation cannot be checked in."
            });

        return Ok(new
        {
            message = "Guest checked in successfully."
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

    // PUT: api/Reservation/1/checkout
    [HttpPut("{id}/checkout")]
    public async Task<IActionResult> CheckOut(int id)
    {
        var result = await _service.CheckOutAsync(id);

        if (!result)
            return BadRequest("Reservation cannot be checked out.");

        return Ok(new
        {
            message = "Guest checked out successfully."
        });
    }
}