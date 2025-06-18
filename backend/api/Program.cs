using AspNetCoreRateLimit;
using api.Interfaces;
using api.Middlewares;
using api.Repositories;
using api.Services;
using FirebaseAdmin;
using Google.Apis.Auth.OAuth2;
using Google.Cloud.Firestore;
using FluentValidation;
using FluentValidation.AspNetCore;
using Microsoft.AspNetCore.SignalR;

var builder = WebApplication.CreateBuilder(args);
var credentialPath = Path.Combine(Directory.GetCurrentDirectory(), "serviceAccountKey.json");
Environment.SetEnvironmentVariable("GOOGLE_APPLICATION_CREDENTIALS", credentialPath);

// Add services to the container.
builder.Services.AddControllers();
builder.Services.AddValidatorsFromAssemblyContaining<Program>();
builder.Services.AddFluentValidationAutoValidation();
builder.Services.AddEndpointsApiExplorer();

// Add SignalR
builder.Services.AddSignalR(options =>
{
    options.EnableDetailedErrors = builder.Environment.IsDevelopment();
    options.KeepAliveInterval = TimeSpan.FromSeconds(30);
    options.ClientTimeoutInterval = TimeSpan.FromSeconds(60);
    options.HandshakeTimeout = TimeSpan.FromSeconds(15);
});

// Configure SignalR User ID Provider
builder.Services.AddSingleton<IUserIdProvider, CustomUserIdProvider>();

// Add Response Compression
builder.Services.AddResponseCompression(options =>
{
    options.EnableForHttps = true;
    options.Providers.Add<Microsoft.AspNetCore.ResponseCompression.BrotliCompressionProvider>();
    options.Providers.Add<Microsoft.AspNetCore.ResponseCompression.GzipCompressionProvider>();
});

builder.Services.Configure<Microsoft.AspNetCore.ResponseCompression.BrotliCompressionProviderOptions>(options =>
{
    options.Level = System.IO.Compression.CompressionLevel.Fastest;
});

builder.Services.Configure<Microsoft.AspNetCore.ResponseCompression.GzipCompressionProviderOptions>(options =>
{
    options.Level = System.IO.Compression.CompressionLevel.Fastest;
});

// Add Health Checks
builder.Services.AddHealthChecks()
    .AddCheck("API", () => Microsoft.Extensions.Diagnostics.HealthChecks.HealthCheckResult.Healthy())
    .AddCheck("Database", () =>
    {
        try
        {
            var projectId = builder.Configuration["Firebase:ProjectId"];
            var db = FirestoreDb.Create(projectId);
            return Microsoft.Extensions.Diagnostics.HealthChecks.HealthCheckResult.Healthy("Database is healthy");
        }
        catch (Exception ex)
        {
            return Microsoft.Extensions.Diagnostics.HealthChecks.HealthCheckResult.Unhealthy("Database is unhealthy", ex);
        }
    });

// Add Response Caching
builder.Services.AddResponseCaching();
builder.Services.AddMemoryCache();

// Configure caching options
builder.Services.Configure<api.Configuration.CachingOptions>(
    builder.Configuration.GetSection(api.Configuration.CachingOptions.SectionName));

// Add custom caching services
builder.Services.AddSingleton<ICacheService, MemoryCacheService>();
builder.Services.AddScoped<ICachedReviewService, CachedReviewService>();
builder.Services.AddScoped<ICachedSellerService, CachedSellerService>();
builder.Services.AddScoped<ICachedMenuService, CachedMenuService>();

builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new Microsoft.OpenApi.Models.OpenApiInfo
    {
        Title = "FoodHub API",
        Version = "v1",
        Description = "FoodHub API with Firebase Authentication"
    });

    c.AddSecurityDefinition("Bearer", new Microsoft.OpenApi.Models.OpenApiSecurityScheme
    {
        Description = "JWT Authorization header using the Bearer scheme. Enter 'Bearer' [space] and then your token",
        Name = "Authorization",
        In = Microsoft.OpenApi.Models.ParameterLocation.Header,
        Type = Microsoft.OpenApi.Models.SecuritySchemeType.ApiKey,
        Scheme = "Bearer"
    });

    c.AddSecurityRequirement(new Microsoft.OpenApi.Models.OpenApiSecurityRequirement
    {
        {
            new Microsoft.OpenApi.Models.OpenApiSecurityScheme
            {
                Reference = new Microsoft.OpenApi.Models.OpenApiReference
                {
                    Type = Microsoft.OpenApi.Models.ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });
});

// Configure rate limiting from appsettings.json
builder.Services.Configure<IpRateLimitOptions>(
    builder.Configuration.GetSection("IpRateLimiting")
);
builder.Services.AddSingleton<IIpPolicyStore, MemoryCacheIpPolicyStore>();
builder.Services.AddSingleton<IRateLimitCounterStore, MemoryCacheRateLimitCounterStore>();
builder.Services.AddSingleton<IRateLimitConfiguration, RateLimitConfiguration>();
builder.Services.AddSingleton<IProcessingStrategy, AsyncKeyLockProcessingStrategy>();
builder.Services.AddInMemoryRateLimiting();

// Add API Versioning
builder.Services.AddApiVersioning(options =>
{
    options.DefaultApiVersion = new Microsoft.AspNetCore.Mvc.ApiVersion(1, 0);
    options.AssumeDefaultVersionWhenUnspecified = true;
    options.ReportApiVersions = true;
});

// Add JWT Authentication (for Firebase tokens)
builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = Microsoft.AspNetCore.Authentication.JwtBearer.JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = Microsoft.AspNetCore.Authentication.JwtBearer.JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    var projectId = builder.Configuration["Firebase:ProjectId"];
    options.Authority = $"https://securetoken.google.com/{projectId}";
    options.TokenValidationParameters = new Microsoft.IdentityModel.Tokens.TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidIssuer = $"https://securetoken.google.com/{projectId}",
        ValidateAudience = true,
        ValidAudience = projectId,
        ValidateLifetime = true,
        ClockSkew = TimeSpan.Zero
    }; options.Events = new Microsoft.AspNetCore.Authentication.JwtBearer.JwtBearerEvents
    {
        OnTokenValidated = context =>
        {
            var token = context.SecurityToken as System.IdentityModel.Tokens.Jwt.JwtSecurityToken;
            if (token?.Claims != null)
            {
                var roleClaim = token.Claims.FirstOrDefault(c => c.Type == "role");
                if (roleClaim != null)
                {
                    var claims = new List<System.Security.Claims.Claim>
                    {
                        new System.Security.Claims.Claim(System.Security.Claims.ClaimTypes.Role, roleClaim.Value)
                    };
                    var appIdentity = new System.Security.Claims.ClaimsIdentity(claims);
                    context.Principal?.AddIdentity(appIdentity);
                }
            }
            return Task.CompletedTask;
        },
        OnMessageReceived = context =>
        {
            // For SignalR connections, get token from query string
            var accessToken = context.Request.Query["access_token"];
            var path = context.HttpContext.Request.Path;

            if (!string.IsNullOrEmpty(accessToken) && path.StartsWithSegments("/chathub"))
            {
                context.Token = accessToken;
            }

            return Task.CompletedTask;
        }
    };
});

// Initialize Firebase
FirebaseApp.Create(new AppOptions
{
    Credential = GoogleCredential.GetApplicationDefault()
});

// Add Firestore DB
var projectId = builder.Configuration["Firebase:ProjectId"];
builder.Services.AddSingleton(FirestoreDb.Create(projectId));
builder.Services.AddSingleton<FirebaseAuthService>();

// Register repositories
builder.Services.AddScoped<IUserRepository, UserRepository>();
builder.Services.AddScoped<IMenuRepository, MenuRepository>();
builder.Services.AddScoped<ISellerRepository, SellerRepository>();
builder.Services.AddScoped<IChatRepository, ChatRepository>();
builder.Services.AddScoped<ICartRepository, CartRepository>();
builder.Services.AddScoped<IOrderRepository, OrderRepository>();
builder.Services.AddScoped<ISupportTicketRepository, SupportTicketRepository>();
builder.Services.AddScoped<IReviewRepository, ReviewRepository>();
builder.Services.AddScoped<IImageService, ImageService>();

builder.Services.AddSingleton<CloudflareClient>(sp =>
{
    var config = sp.GetRequiredService<IConfiguration>();
    var accountId = config["R2:ACCOUNT_ID"] ?? throw new ArgumentNullException("R2:ACCOUNT_ID", "R2:ACCOUNT_ID cannot be null");
    var accessKey = config["R2:ACCESS_KEY"] ?? throw new ArgumentNullException("R2:ACCESS_KEY", "R2:ACCESS_KEY cannot be null");
    var accessSecret = config["R2:SECRET_KEY"] ?? throw new ArgumentNullException("R2:SECRET_KEY", "R2:SECRET_KEY cannot be null");
    return new CloudflareClient(accountId, accessKey, accessSecret);
});

// Configure CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("DefaultPolicy", policy =>
    {
        if (builder.Environment.IsDevelopment())
        {
            // Allow any origin in development
            policy
                .SetIsOriginAllowed(_ => true)
                .AllowAnyMethod()
                .AllowAnyHeader()
                .AllowCredentials()
                .WithExposedHeaders("Access-Control-Allow-Origin")
                .SetPreflightMaxAge(TimeSpan.FromMinutes(10));
        }
        else
        {
            // Restrictive policy for production
            policy
                .WithOrigins(
                    "https://foodhub.marcelpeterson.me",
                    "https://www.foodhub.marcelpeterson.me",
                    "https://foodhub-project.vercel.app",
                    "http://localhost:3000", // For local testing
                    "http://localhost:3001"  // For local testing
                )
                .AllowAnyMethod()
                .AllowAnyHeader()
                .AllowCredentials()
                .WithExposedHeaders("Access-Control-Allow-Origin")
                .SetPreflightMaxAge(TimeSpan.FromMinutes(10));
        }
    });
});

var app = builder.Build();

// Configure the HTTP request pipeline.
app.UseSwagger();
app.UseSwaggerUI(c =>
{
    c.SwaggerEndpoint("/swagger/v1/swagger.json", "API v1");
    // Enable Swagger UI at both HTTP and HTTPS endpoints
    c.RoutePrefix = "swagger";
});

// Only use HTTPS redirection in development or when explicitly configured
if (app.Environment.IsDevelopment() || app.Configuration.GetValue<bool>("ForceHttpsRedirection"))
{
    app.UseHttpsRedirection();
}

app.UseMiddleware<RequestTimeoutMiddleware>();
app.UseMiddleware<RequestValidationMiddleware>();
app.UseMiddleware<ErrorHandlingMiddleware>();

// Add response caching before authentication
app.UseResponseCaching();

// Add forwarded headers support for reverse proxy
app.UseForwardedHeaders(new ForwardedHeadersOptions
{
    ForwardedHeaders = Microsoft.AspNetCore.HttpOverrides.ForwardedHeaders.XForwardedFor |
                      Microsoft.AspNetCore.HttpOverrides.ForwardedHeaders.XForwardedProto |
                      Microsoft.AspNetCore.HttpOverrides.ForwardedHeaders.XForwardedHost
});

app.UseIpRateLimiting();

// Use custom CORS middleware for better reverse proxy compatibility
app.UseMiddleware<CorsMiddleware>();
app.UseCors("DefaultPolicy");

app.UseAuthentication();
app.UseAuthorization();

app.UseMiddleware<RequestLoggingMiddleware>();

app.MapControllers();
app.MapHealthChecks("/health");
app.MapHealthChecks("/health/ready", new Microsoft.AspNetCore.Diagnostics.HealthChecks.HealthCheckOptions
{
    Predicate = healthCheck => healthCheck.Tags.Contains("ready")
});
app.MapHealthChecks("/health/live", new Microsoft.AspNetCore.Diagnostics.HealthChecks.HealthCheckOptions
{
    Predicate = _ => false
});

// Map SignalR hub
app.MapHub<api.Hubs.ChatHub>("/chathub");

app.Run();