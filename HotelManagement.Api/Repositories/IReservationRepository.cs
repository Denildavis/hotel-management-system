using HotelManagement.Api.Entities;

namespace HotelManagement.Api.Repositories;

public interface IReservationRepository
{
    Task<Reservation> CreateAsync(Reservation reservation);

    Task<List<Reservation>> GetAllAsync();

    Task<Reservation?> GetByIdAsync(int id);

    Task UpdateAsync(Reservation reservation);
}