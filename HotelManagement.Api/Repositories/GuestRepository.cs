using HotelManagement.Api.Data;
using HotelManagement.Api.Entities;
using Microsoft.EntityFrameworkCore;

namespace HotelManagement.Api.Repositories;

public class GuestRepository : IGuestRepository
{
    private readonly HotelDbContext _context;

    public GuestRepository(HotelDbContext context)
    {
        _context = context;
    }

    public async Task<Guest> CreateAsync(Guest guest)
    {
        _context.Guests.Add(guest);

        await _context.SaveChangesAsync();

        return guest;
    }

    public async Task<List<Guest>> GetAllAsync()
    {
        return await _context.Guests.ToListAsync();
    }
}