using HotelManagement.Api.Services;
using Microsoft.AspNetCore.Mvc;

namespace HotelManagement.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class PaymentController : ControllerBase
{
    private readonly IPaymentService _paymentService;

    public PaymentController(IPaymentService paymentService)
    {
        _paymentService = paymentService;
    }

    // =========================================================
    // CREATE PAYMENT
    // POST: /api/Payment
    // =========================================================

    [HttpPost]
    public async Task<IActionResult> CreatePayment(
        [FromBody] CreatePaymentRequest request)
    {
        try
        {
            if (request.ReservationId <= 0)
            {
                return BadRequest(new
                {
                    message = "Invalid reservation ID."
                });
            }

            if (request.Amount <= 0)
            {
                return BadRequest(new
                {
                    message = "Amount must be greater than zero."
                });
            }

            var payment =
                await _paymentService.CreatePaymentAsync(
                    request.ReservationId,
                    request.Amount);

            return Ok(payment);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new
            {
                message = ex.Message
            });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new
            {
                message = ex.Message
            });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new
            {
                message = "Failed to create payment.",
                error = ex.Message
            });
        }
    }

    // =========================================================
    // GET PAYMENT BY RESERVATION
    // GET: /api/Payment/reservation/25
    // =========================================================

    [HttpGet("reservation/{reservationId}")]
    public async Task<IActionResult> GetPaymentByReservation(
        int reservationId)
    {
        try
        {
            var payment =
                await _paymentService
                    .GetPaymentByReservationIdAsync(
                        reservationId);

            if (payment == null)
            {
                return NotFound(new
                {
                    message = "Payment not found."
                });
            }

            return Ok(payment);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new
            {
                message = "Failed to get payment.",
                error = ex.Message
            });
        }
    }

    // =========================================================
    // GET PAYMENT BY ID
    // GET: /api/Payment/1
    // =========================================================

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetPayment(int id)
    {
        try
        {
            var payment =
                await _paymentService
                    .GetPaymentByIdAsync(id);

            if (payment == null)
            {
                return NotFound(new
                {
                    message = "Payment not found."
                });
            }

            return Ok(payment);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new
            {
                message = "Failed to get payment.",
                error = ex.Message
            });
        }
    }

    // =========================================================
    // GET ALL PAYMENTS
    // GET: /api/Payment
    // =========================================================

    [HttpGet]
    public async Task<IActionResult> GetAllPayments()
    {
        try
        {
            var payments =
                await _paymentService
                    .GetAllPaymentsAsync();

            return Ok(payments);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new
            {
                message = "Failed to get payments.",
                error = ex.Message
            });
        }
    }

    // =========================================================
    // COMPLETE DEMO PAYMENT
    // PUT: /api/Payment/1/pay
    // =========================================================

    [HttpPut("{id:int}/pay")]
    public async Task<IActionResult> Pay(int id)
    {
        try
        {
            var result =
                await _paymentService
                    .MarkPaymentAsPaidAsync(id);

            if (!result)
            {
                return NotFound(new
                {
                    message = "Payment not found."
                });
            }

            return Ok(new
            {
                message = "Payment completed successfully."
            });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new
            {
                message = "Failed to complete payment.",
                error = ex.Message
            });
        }
    }
}


// =========================================================
// REQUEST MODEL
// =========================================================

public class CreatePaymentRequest
{
    public int ReservationId { get; set; }

    public decimal Amount { get; set; }
}