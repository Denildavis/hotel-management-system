using HotelManagement.Api.Entities;

namespace HotelManagement.Api.Services;

public interface IPaymentService
{
    Task<Payment> CreatePaymentAsync(
        int reservationId,
        decimal amount);

    Task<Payment?> GetPaymentByReservationIdAsync(
        int reservationId);

    Task<Payment?> GetPaymentByIdAsync(
        int id);

    Task<List<Payment>> GetAllPaymentsAsync();

    Task<bool> MarkPaymentAsPaidAsync(
        int paymentId);
}