using HotelManagement.Api.Entities;

namespace HotelManagement.Api.Services;

public interface IGuestService
{
    Task<Guest> CreateGuestAsync(Guest guest);

    Task<List<Guest>> GetAllGuestsAsync();
}