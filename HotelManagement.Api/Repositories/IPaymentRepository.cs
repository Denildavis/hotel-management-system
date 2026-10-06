using HotelManagement.Api.Entities;

namespace HotelManagement.Api.Repositories;

public interface IPaymentRepository
{
    Task<Payment> CreateAsync(Payment payment);

    Task<Payment?> GetByReservationIdAsync(
        int reservationId);

    Task<Payment?> GetByIdAsync(int id);

    Task<List<Payment>> GetAllAsync();

    Task UpdateAsync(Payment payment);
}