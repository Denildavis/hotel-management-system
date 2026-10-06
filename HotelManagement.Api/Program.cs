using HotelManagement.Api.Data;
using HotelManagement.Api.Repositories;
using HotelManagement.Api.Services;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.FileProviders;

var builder = WebApplication.CreateBuilder(args);

// --------------------------------------------------
// CORS
// --------------------------------------------------

builder.Services.AddCors(options =>
{
    options.AddPolicy("ReactPolicy", policy =>
    {
        policy
            .WithOrigins(
                "http://localhost:5173",
                "http://localhost:5174",
                "http://localhost:5175",
                "http://localhost:5176",
                "http://localhost:5177"
            )
            .AllowAnyHeader()
            .AllowAnyMethod();
    });
});

// --------------------------------------------------
// Database
// --------------------------------------------------

builder.Services.AddDbContext<HotelDbContext>(options =>
    options.UseOracle(
        builder.Configuration.GetConnectionString(
            "OracleConnection"
        )
    )
);

// --------------------------------------------------
// Services
// --------------------------------------------------

builder.Services.AddScoped<IGuestService, GuestService>();

builder.Services.AddScoped<IReservationService, ReservationService>();

builder.Services.AddScoped<
    IIdentityDocumentService,
    IdentityDocumentService
>();

// EMAIL SERVICE
builder.Services.AddScoped<
    IEmailService,
    EmailService
>();

// --------------------------------------------------
// Repositories
// --------------------------------------------------

builder.Services.AddScoped<
    IGuestRepository,
    GuestRepository
>();

builder.Services.AddScoped<
    IReservationRepository,
    ReservationRepository
>();

builder.Services.AddScoped<
    IIdentityDocumentRepository,
    IdentityDocumentRepository
>();
builder.Services.AddScoped<IPaymentRepository, PaymentRepository>();
builder.Services.AddScoped<IPaymentService, PaymentService>();

// --------------------------------------------------
// Controllers
// --------------------------------------------------

builder.Services.AddControllers();

// --------------------------------------------------
// Swagger
// --------------------------------------------------

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// --------------------------------------------------
// Build
// --------------------------------------------------

var app = builder.Build();

// --------------------------------------------------
// CORS
// --------------------------------------------------

app.UseCors("ReactPolicy");

// --------------------------------------------------
// Swagger
// --------------------------------------------------



    app.UseSwagger();
    app.UseSwaggerUI();


// --------------------------------------------------
// HTTPS
// --------------------------------------------------

// Temporarily disabled while using HTTP localhost:5210.
// app.UseHttpsRedirection();

// --------------------------------------------------
// Controllers
// --------------------------------------------------

app.MapControllers();

// --------------------------------------------------
// Uploads
// --------------------------------------------------

var uploadsPath = Path.Combine(
    builder.Environment.ContentRootPath,
    "uploads"
);

if (!Directory.Exists(uploadsPath))
{
    Directory.CreateDirectory(uploadsPath);
}

app.UseStaticFiles(
    new StaticFileOptions
    {
        FileProvider =
            new PhysicalFileProvider(
                uploadsPath
            ),

        RequestPath = "/uploads"
    }
);

// --------------------------------------------------
// Run
// --------------------------------------------------

app.Run();