using HotelManagement.Api.Entities;
using HotelManagement.Api.Repositories;

namespace HotelManagement.Api.Services;

public class PaymentService : IPaymentService
{
    private readonly IPaymentRepository _paymentRepository;
    private readonly IReservationRepository _reservationRepository;

    public PaymentService(
        IPaymentRepository paymentRepository,
        IReservationRepository reservationRepository)
    {
        _paymentRepository = paymentRepository;
        _reservationRepository = reservationRepository;
    }

    public async Task<Payment> CreatePaymentAsync(
        int reservationId,
        decimal amount)
    {
        if (reservationId <= 0)
        {
            throw new ArgumentException(
                "Invalid reservation ID.");
        }

        if (amount <= 0)
        {
            throw new ArgumentException(
                "Payment amount must be greater than zero.");
        }

        var reservation =
            await _reservationRepository.GetByIdAsync(
                reservationId);

        if (reservation == null)
        {
            throw new ArgumentException(
                "Reservation not found.");
        }

        var existingPayment =
            await _paymentRepository
                .GetByReservationIdAsync(reservationId);

        if (existingPayment != null &&
            existingPayment.Status != "PAID")
        {
            return existingPayment;
        }

        if (existingPayment != null &&
            existingPayment.Status == "PAID")
        {
            throw new InvalidOperationException(
                "This reservation has already been paid.");
        }

        var paymentReference =
            $"PAY-{Guid.NewGuid():N}"
                .Substring(0, 16)
                .ToUpper();

        var paymentLink =
            $"http://localhost:5173/payment/{paymentReference}";

        var payment = new Payment
        {
            ReservationId = reservationId,
            Amount = amount,
            PaymentLink = paymentLink,
            PaymentReference = paymentReference,
            Status = "PENDING",
            CreatedAt = DateTime.Now
        };

        return await _paymentRepository
            .CreateAsync(payment);
    }

    public async Task<Payment?>
        GetPaymentByReservationIdAsync(
            int reservationId)
    {
        return await _paymentRepository
            .GetByReservationIdAsync(reservationId);
    }

    public async Task<Payment?>
        GetPaymentByIdAsync(int id)
    {
        return await _paymentRepository
            .GetByIdAsync(id);
    }

    public async Task<List<Payment>>
        GetAllPaymentsAsync()
    {
        return await _paymentRepository
            .GetAllAsync();
    }

    public async Task<bool>
        MarkPaymentAsPaidAsync(int paymentId)
    {
        var payment =
            await _paymentRepository
                .GetByIdAsync(paymentId);

        if (payment == null)
        {
            return false;
        }

        if (payment.Status == "PAID")
        {
            return true;
        }

        payment.Status = "PAID";
        payment.PaidAt = DateTime.Now;

        await _paymentRepository
            .UpdateAsync(payment);

        return true;
    }
}