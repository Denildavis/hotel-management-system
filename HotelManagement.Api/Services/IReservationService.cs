using HotelManagement.Api.Entities;

namespace HotelManagement.Api.Services;

public interface IReservationService
{
    Task<Reservation> CreateReservationAsync(Reservation reservation);

    Task<List<Reservation>> GetAllReservationsAsync();

    Task<Reservation?> GetReservationByIdAsync(int id);

    Task<bool> MoveToPreCheckInAsync(int id);

    Task<bool> CheckInAsync(int id);

    Task<bool> CheckOutAsync(int id);
}