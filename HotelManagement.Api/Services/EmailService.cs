using MailKit.Net.Smtp;
using MailKit.Security;
using MimeKit;

namespace HotelManagement.Api.Services;

public interface IEmailService
{
    Task SendTestEmailAsync(string toEmail);

    Task SendReservationConfirmationAsync(
        string toEmail,
        int reservationId,
        string guestName,
        string roomNumber,
        DateTime checkInDate,
        DateTime checkOutDate
    );
}

public class EmailService : IEmailService
{
    private readonly IConfiguration _configuration;

    public EmailService(IConfiguration configuration)
    {
        _configuration = configuration;
    }

    // =========================================================
    // TEST EMAIL
    // =========================================================

    public async Task SendTestEmailAsync(string toEmail)
    {
        var smtpHost = _configuration["Email:SmtpHost"];
        var smtpPortValue = _configuration["Email:SmtpPort"];
        var username = _configuration["Email:Username"];
        var password = _configuration["Email:Password"];

        ValidateEmailConfiguration(
            smtpHost,
            smtpPortValue,
            username,
            password);

        var smtpPort = int.Parse(smtpPortValue!);

        var email = new MimeMessage();

        email.From.Add(
            new MailboxAddress(
                "Hotel Management",
                username!
            )
        );

        email.To.Add(
            MailboxAddress.Parse(toEmail)
        );

        email.Subject =
            "Hotel Management - Test Email";

        email.Body = new TextPart("html")
        {
            Text = """
                <html>
                <body style="font-family: Arial, sans-serif;">

                    <h2 style="color:#1f4e79;">
                        🏨 Hotel Management
                    </h2>

                    <p>
                        This is a test email.
                    </p>

                    <p>
                        Email sending is working successfully.
                    </p>

                    <hr>

                    <p>
                        Hotel Management System
                    </p>

                </body>
                </html>
                """
        };

        await SendEmailAsync(
            email,
            smtpHost!,
            smtpPort,
            username!,
            password!);
    }

    // =========================================================
    // RESERVATION CONFIRMATION EMAIL
    // =========================================================

    public async Task SendReservationConfirmationAsync(
        string toEmail,
        int reservationId,
        string guestName,
        string roomNumber,
        DateTime checkInDate,
        DateTime checkOutDate)
    {
        var smtpHost = _configuration["Email:SmtpHost"];
        var smtpPortValue = _configuration["Email:SmtpPort"];
        var username = _configuration["Email:Username"];
        var password = _configuration["Email:Password"];

        ValidateEmailConfiguration(
            smtpHost,
            smtpPortValue,
            username,
            password);

        var smtpPort = int.Parse(smtpPortValue!);

        var email = new MimeMessage();

        // -----------------------------------------------------
        // FROM
        // -----------------------------------------------------

        email.From.Add(
            new MailboxAddress(
                "Hotel Management",
                username!
            )
        );

        // -----------------------------------------------------
        // TO
        // -----------------------------------------------------

        email.To.Add(
            MailboxAddress.Parse(toEmail)
        );

        // -----------------------------------------------------
        // SUBJECT
        // -----------------------------------------------------

        email.Subject =
            $"🏨 Reservation Confirmation - #{reservationId}";

        // -----------------------------------------------------
        // EMAIL BODY
        // -----------------------------------------------------

        email.Body = new TextPart("html")
        {
            Text = $"""
                <!DOCTYPE html>

                <html>

                <head>

                    <meta charset="UTF-8">

                    <meta name="viewport"
                          content="width=device-width, initial-scale=1.0">

                    <title>
                        Reservation Confirmation
                    </title>

                </head>

                <body style="
                    margin:0;
                    padding:0;
                    background:#f4f6f9;
                    font-family:Arial,Helvetica,sans-serif;
                ">

                    <div style="
                        max-width:650px;
                        margin:30px auto;
                        background:#ffffff;
                        border-radius:12px;
                        overflow:hidden;
                        box-shadow:0 4px 15px rgba(0,0,0,0.08);
                    ">

                        <!-- HEADER -->

                        <div style="
                            background:#173f5f;
                            color:#ffffff;
                            padding:25px;
                            text-align:center;
                        ">

                            <div style="
                                font-size:34px;
                                margin-bottom:8px;
                            ">
                                🏨
                            </div>

                            <h1 style="
                                margin:0;
                                font-size:25px;
                            ">
                                Hotel Management
                            </h1>

                            <p style="
                                margin:8px 0 0;
                                font-size:14px;
                                opacity:0.9;
                            ">
                                Reservation Confirmation
                            </p>

                        </div>


                        <!-- CONTENT -->

                        <div style="
                            padding:30px;
                        ">

                            <h2 style="
                                color:#173f5f;
                                margin-top:0;
                            ">
                                Reservation Confirmed 🎉
                            </h2>

                            <p style="
                                font-size:16px;
                                color:#333333;
                            ">
                                Dear <strong>{guestName}</strong>,
                            </p>

                            <p style="
                                font-size:15px;
                                line-height:1.6;
                                color:#555555;
                            ">
                                Thank you for choosing
                                <strong>Hotel Management</strong>.
                                Your reservation has been successfully
                                created.
                            </p>


                            <!-- RESERVATION DETAILS -->

                            <h3 style="
                                color:#173f5f;
                                margin-top:28px;
                            ">
                                Reservation Details
                            </h3>

                            <table style="
                                width:100%;
                                border-collapse:collapse;
                                font-size:14px;
                            ">

                                <tr>

                                    <td style="
                                        padding:12px;
                                        border:1px solid #e1e5ea;
                                        background:#f8f9fa;
                                        font-weight:bold;
                                        width:40%;
                                    ">
                                        Reservation ID
                                    </td>

                                    <td style="
                                        padding:12px;
                                        border:1px solid #e1e5ea;
                                    ">
                                        #{reservationId}
                                    </td>

                                </tr>


                                <tr>

                                    <td style="
                                        padding:12px;
                                        border:1px solid #e1e5ea;
                                        background:#f8f9fa;
                                        font-weight:bold;
                                    ">
                                        Guest Name
                                    </td>

                                    <td style="
                                        padding:12px;
                                        border:1px solid #e1e5ea;
                                    ">
                                        {guestName}
                                    </td>

                                </tr>


                                <tr>

                                    <td style="
                                        padding:12px;
                                        border:1px solid #e1e5ea;
                                        background:#f8f9fa;
                                        font-weight:bold;
                                    ">
                                        Room Number
                                    </td>

                                    <td style="
                                        padding:12px;
                                        border:1px solid #e1e5ea;
                                    ">
                                        {roomNumber}
                                    </td>

                                </tr>


                                <tr>

                                    <td style="
                                        padding:12px;
                                        border:1px solid #e1e5ea;
                                        background:#f8f9fa;
                                        font-weight:bold;
                                    ">
                                        Check-in
                                    </td>

                                    <td style="
                                        padding:12px;
                                        border:1px solid #e1e5ea;
                                    ">
                                        {checkInDate:dd MMM yyyy, hh:mm tt}
                                    </td>

                                </tr>


                                <tr>

                                    <td style="
                                        padding:12px;
                                        border:1px solid #e1e5ea;
                                        background:#f8f9fa;
                                        font-weight:bold;
                                    ">
                                        Check-out
                                    </td>

                                    <td style="
                                        padding:12px;
                                        border:1px solid #e1e5ea;
                                    ">
                                        {checkOutDate:dd MMM yyyy, hh:mm tt}
                                    </td>

                                </tr>


                                <tr>

                                    <td style="
                                        padding:12px;
                                        border:1px solid #e1e5ea;
                                        background:#f8f9fa;
                                        font-weight:bold;
                                    ">
                                        Status
                                    </td>

                                    <td style="
                                        padding:12px;
                                        border:1px solid #e1e5ea;
                                        color:#198754;
                                        font-weight:bold;
                                    ">
                                        ✓ Confirmed
                                    </td>

                                </tr>

                            </table>


                            <!-- IMPORTANT INFORMATION -->

                            <div style="
                                margin-top:25px;
                                padding:18px;
                                background:#eef6ff;
                                border-left:4px solid #0d6efd;
                                border-radius:6px;
                            ">

                                <h4 style="
                                    margin:0 0 10px;
                                    color:#173f5f;
                                ">
                                    📋 Check-in Information
                                </h4>

                                <p style="
                                    margin:0;
                                    color:#555555;
                                    line-height:1.5;
                                    font-size:14px;
                                ">
                                    Please provide a valid identity
                                    document before check-in.
                                </p>

                            </div>


                            <!-- FOOTER MESSAGE -->

                            <p style="
                                margin-top:28px;
                                color:#555555;
                                font-size:15px;
                                line-height:1.6;
                            ">
                                Please keep this email for your records.
                                We look forward to welcoming you!
                            </p>

                        </div>


                        <!-- FOOTER -->

                        <div style="
                            background:#f8f9fa;
                            padding:20px;
                            text-align:center;
                            border-top:1px solid #e5e5e5;
                        ">

                            <p style="
                                margin:0;
                                color:#173f5f;
                                font-weight:bold;
                            ">
                                Hotel Management Team
                            </p>

                            <p style="
                                margin:6px 0 0;
                                color:#888888;
                                font-size:12px;
                            ">
                                Thank you for choosing us.
                            </p>

                        </div>

                    </div>

                </body>

                </html>
                """
        };

        // -----------------------------------------------------
        // SEND
        // -----------------------------------------------------

        await SendEmailAsync(
            email,
            smtpHost!,
            smtpPort,
            username!,
            password!);
    }

    // =========================================================
    // COMMON EMAIL SENDER
    // =========================================================

    private async Task SendEmailAsync(
        MimeMessage email,
        string smtpHost,
        int smtpPort,
        string username,
        string password)
    {
        using var smtp = new SmtpClient();

        await smtp.ConnectAsync(
            smtpHost,
            smtpPort,
            SecureSocketOptions.StartTls
        );

        await smtp.AuthenticateAsync(
            username,
            password
        );

        await smtp.SendAsync(email);

        await smtp.DisconnectAsync(true);
    }

    // =========================================================
    // VALIDATE CONFIGURATION
    // =========================================================

    private static void ValidateEmailConfiguration(
        string? smtpHost,
        string? smtpPortValue,
        string? username,
        string? password)
    {
        if (string.IsNullOrWhiteSpace(smtpHost))
        {
            throw new InvalidOperationException(
                "Email SMTP host is not configured."
            );
        }

        if (!int.TryParse(
                smtpPortValue,
                out _))
        {
            throw new InvalidOperationException(
                "Email SMTP port is invalid."
            );
        }

        if (string.IsNullOrWhiteSpace(username))
        {
            throw new InvalidOperationException(
                "Email username is not configured."
            );
        }

        if (string.IsNullOrWhiteSpace(password))
        {
            throw new InvalidOperationException(
                "Email password is not configured."
            );
        }
    }
}