using HotelManagement.Api.Entities;
using HotelManagement.Api.Repositories;

namespace HotelManagement.Api.Services;

public class ReservationService : IReservationService
{
    private readonly IReservationRepository _repository;
    private readonly IIdentityDocumentRepository _identityRepository;
    private readonly IEmailService _emailService;

    public ReservationService(
        IReservationRepository repository,
        IIdentityDocumentRepository identityRepository,
        IEmailService emailService)
    {
        _repository = repository;
        _identityRepository = identityRepository;
        _emailService = emailService;
    }

    // =========================================================
    // CREATE RESERVATION
    // =========================================================

    public async Task<Reservation> CreateReservationAsync(
        Reservation reservation)
    {
        var now = DateTime.Now;

        // -----------------------------------------------------
        // Validate check-in date
        // -----------------------------------------------------

        if (reservation.CheckInDate < now)
        {
            throw new ArgumentException(
                "Check-in date and time cannot be in the past.");
        }

        // -----------------------------------------------------
        // Validate check-out date
        // -----------------------------------------------------

        if (reservation.CheckOutDate <= reservation.CheckInDate)
        {
            throw new ArgumentException(
                "Check-out date and time must be after check-in date and time.");
        }

        // -----------------------------------------------------
        // Check room availability
        // -----------------------------------------------------

        var existingReservations =
            await _repository.GetAllAsync();

        var roomAlreadyBooked =
            existingReservations.Any(r =>
                r.RoomNumber.Equals(
                    reservation.RoomNumber,
                    StringComparison.OrdinalIgnoreCase)
                &&
                r.Status != "CHECKED_OUT"
                &&
                reservation.CheckInDate < r.CheckOutDate
                &&
                reservation.CheckOutDate > r.CheckInDate
            );

        if (roomAlreadyBooked)
        {
            throw new ArgumentException(
                $"Room {reservation.RoomNumber} is already booked for the selected date and time.");
        }

        // -----------------------------------------------------
        // Set initial status
        // -----------------------------------------------------

        reservation.Status = "NEW";

        // -----------------------------------------------------
        // SAVE RESERVATION
        // -----------------------------------------------------

        var createdReservation =
            await _repository.CreateAsync(reservation);

        // -----------------------------------------------------
        // SEND CONFIRMATION EMAIL
        // -----------------------------------------------------

        try
        {
            // Make sure guest information is available.
            //
            // Depending on your repository implementation,
            // createdReservation.Guest may already be populated.
            // If it is not, load the reservation again.

            var savedReservation =
                await _repository.GetByIdAsync(
                    createdReservation.Id);

            if (savedReservation?.Guest != null)
            {
                var guest =
                    savedReservation.Guest;

                var guestName =
                    $"{guest.FirstName} {guest.LastName}".Trim();

                if (!string.IsNullOrWhiteSpace(
                    guest.Email))
                {
                    await _emailService
                        .SendReservationConfirmationAsync(
                            guest.Email,
                            createdReservation.Id,
                            guestName,
                            createdReservation.RoomNumber,
                            createdReservation.CheckInDate,
                            createdReservation.CheckOutDate
                        );
                }
            }
        }
        catch (Exception ex)
        {
            // Log the email error but DON'T cancel
            // the reservation.
            //
            // The reservation has already been successfully
            // saved to Oracle.

            Console.WriteLine(
                $"Reservation email failed: {ex.Message}");
        }

        // -----------------------------------------------------
        // RETURN RESERVATION
        // -----------------------------------------------------

        return createdReservation;
    }

    // =========================================================
    // GET ALL RESERVATIONS
    // =========================================================

    public async Task<List<Reservation>>
        GetAllReservationsAsync()
    {
        return await _repository.GetAllAsync();
    }

    // =========================================================
    // GET RESERVATION BY ID
    // =========================================================

    public async Task<Reservation?>
        GetReservationByIdAsync(int id)
    {
        return await _repository.GetByIdAsync(id);
    }

    // =========================================================
    // MOVE TO PRE CHECK-IN
    // =========================================================

    public async Task<bool>
        MoveToPreCheckInAsync(int id)
    {
        var reservation =
            await _repository.GetByIdAsync(id);

        if (reservation == null)
            return false;

        if (reservation.Status != "NEW")
            return false;

        reservation.Status = "PRE_CHECKIN";

        await _repository.UpdateAsync(
            reservation);

        return true;
    }

    // =========================================================
    // CHECK-IN
    // =========================================================

    public async Task<bool>
        CheckInAsync(int id)
    {
        var reservation =
            await _repository.GetByIdAsync(id);

        if (reservation == null)
            return false;

        if (reservation.Status != "PRE_CHECKIN")
            return false;

        // -----------------------------------------------------
        // Identity document is mandatory
        // -----------------------------------------------------

        var documents =
            await _identityRepository
                .GetByReservationIdAsync(id);

        if (documents.Count == 0)
        {
            throw new ArgumentException(
                "Identity document must be uploaded before check-in.");
        }

        // -----------------------------------------------------
        // Update status
        // -----------------------------------------------------

        reservation.Status = "CHECKED_IN";

        await _repository.UpdateAsync(
            reservation);

        return true;
    }

    // =========================================================
    // CHECK-OUT
    // =========================================================

    public async Task<bool>
        CheckOutAsync(int id)
    {
        var reservation =
            await _repository.GetByIdAsync(id);

        if (reservation == null)
            return false;

        if (reservation.Status != "CHECKED_IN")
            return false;

        reservation.Status = "CHECKED_OUT";

        await _repository.UpdateAsync(
            reservation);

        return true;
    }
}