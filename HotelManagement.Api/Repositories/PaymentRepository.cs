using HotelManagement.Api.Data;
using HotelManagement.Api.Entities;
using Microsoft.EntityFrameworkCore;

namespace HotelManagement.Api.Repositories;

public class PaymentRepository : IPaymentRepository
{
    private readonly HotelDbContext _context;

    public PaymentRepository(
        HotelDbContext context)
    {
        _context = context;
    }

    // =========================================================
    // CREATE
    // =========================================================

    public async Task<Payment> CreateAsync(
        Payment payment)
    {
        _context.Payments.Add(payment);

        await _context.SaveChangesAsync();

        return payment;
    }

    // =========================================================
    // GET BY RESERVATION
    // =========================================================

    public async Task<Payment?>
        GetByReservationIdAsync(
            int reservationId)
    {
        return await _context.Payments
            .AsNoTracking()
            .FirstOrDefaultAsync(
                x => x.ReservationId == reservationId);
    }

    // =========================================================
    // GET BY ID
    // =========================================================

    public async Task<Payment?>
        GetByIdAsync(int id)
    {
        return await _context.Payments
            .FirstOrDefaultAsync(
                x => x.Id == id);
    }

    // =========================================================
    // GET ALL
    // =========================================================

    public async Task<List<Payment>>
        GetAllAsync()
    {
        return await _context.Payments
            .AsNoTracking()
            .OrderByDescending(
                x => x.CreatedAt)
            .ToListAsync();
    }

    // =========================================================
    // UPDATE
    // =========================================================

    public async Task UpdateAsync(
        Payment payment)
    {
        _context.Payments.Update(payment);

        await _context.SaveChangesAsync();
    }
}