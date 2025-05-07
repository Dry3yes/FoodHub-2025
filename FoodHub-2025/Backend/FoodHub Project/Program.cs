using FoodHubProject.Services;

var builder = WebApplication.CreateBuilder(args);

// Tambahkan FirebaseService ke DI (Dependency Injection)
builder.Services.AddSingleton<FirebaseService>();

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

// Izinkan mengakses file statis (di wwwroot)
app.UseStaticFiles();

app.UseAuthorization();

app.MapControllers();

app.Run();
