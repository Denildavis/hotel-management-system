using HotelManagement.Api.Data;
using HotelManagement.Api.Entities;
using Microsoft.EntityFrameworkCore;

namespace HotelManagement.Api.Repositories;

public class ReservationRepository : IReservationRepository
{
    private readonly HotelDbContext _context;

    public ReservationRepository(HotelDbContext context)
    {
        _context = context;
    }

    public async Task<Reservation> CreateAsync(Reservation reservation)
    {
        _context.Reservations.Add(reservation);

        await _context.SaveChangesAsync();

        return reservation;
    }

    public async Task<List<Reservation>> GetAllAsync()
    {
        return await _context.Reservations
            .Include(r => r.Guest)
            .ToListAsync();
    }

    public async Task<Reservation?> GetByIdAsync(int id)
    {
        return await _context.Reservations
            .Include(r => r.Guest)
            .FirstOrDefaultAsync(r => r.Id == id);
    }

    public async Task UpdateAsync(Reservation reservation)
    {
        _context.Reservations.Update(reservation);

        await _context.SaveChangesAsync();
    }
}