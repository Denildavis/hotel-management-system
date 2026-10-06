using HotelManagement.Api.Entities;

namespace HotelManagement.Api.Repositories;

public interface IGuestRepository
{
    Task<Guest> CreateAsync(Guest guest);

    Task<List<Guest>> GetAllAsync();
}