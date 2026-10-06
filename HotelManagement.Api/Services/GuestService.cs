using HotelManagement.Api.Entities;
using HotelManagement.Api.Repositories;

namespace HotelManagement.Api.Services;

public class GuestService : IGuestService
{
    private readonly IGuestRepository _guestRepository;

    public GuestService(IGuestRepository guestRepository)
    {
        _guestRepository = guestRepository;
    }

    public async Task<Guest> CreateGuestAsync(Guest guest)
    {
        return await _guestRepository.CreateAsync(guest);
    }

    public async Task<List<Guest>> GetAllGuestsAsync()
    {
        return await _guestRepository.GetAllAsync();
    }
}