using api.Dtos.Support;
using api.Dtos.Chat;
using api.Interfaces;
using api.Mappers;
using api.Hubs;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using System.Security.Claims;

namespace api.Controllers
{
    [Route("api/v{version:apiVersion}")]
    [ApiVersion("1.0")]
    [ApiController]
    public class SupportController : ControllerBase
    {
        private readonly ISupportTicketRepository _supportTicketRepository;
        private readonly IUserRepository _userRepository;
        private readonly IChatRepository _chatRepository;
        private readonly ISellerRepository _sellerRepository;
        private readonly IHubContext<ChatHub> _hubContext;
        private readonly ILogger<SupportController> _logger; public SupportController(
            ISupportTicketRepository supportTicketRepository,
            IUserRepository userRepository,
            IChatRepository chatRepository,
            ISellerRepository sellerRepository,
            IHubContext<ChatHub> hubContext,
            ILogger<SupportController> logger)
        {
            _supportTicketRepository = supportTicketRepository;
            _userRepository = userRepository;
            _chatRepository = chatRepository;
            _sellerRepository = sellerRepository;
            _hubContext = hubContext;
            _logger = logger;
        }

        [HttpPost]
        [Route("tickets")]
        [AllowAnonymous] // Allow both authenticated and anonymous users to submit tickets
        public async Task<IActionResult> CreateSupportTicket([FromBody] CreateSupportTicketDto ticketDto)
        {
            try
            {
                _logger.LogInformation("Creating support ticket for user: {Email}", ticketDto.Email);

                // Get current user ID if authenticated
                string? userId = null;
                var firebaseUid = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (!string.IsNullOrEmpty(firebaseUid))
                {
                    var users = await _userRepository.GetAllAsync();
                    var user = users.FirstOrDefault(u => u.FirebaseUid == firebaseUid);
                    userId = user?.UserId;
                }

                var supportTicket = ticketDto.ToSupportTicketFromCreateDto();
                supportTicket.UserId = userId; // Will be null for anonymous users
                supportTicket.CreatedAt = DateTime.UtcNow;
                supportTicket.Status = "Open";
                supportTicket.TicketId = Guid.NewGuid().ToString();

                await _supportTicketRepository.CreateTicketAsync(supportTicket);

                _logger.LogInformation("Support ticket created successfully with ID: {TicketId}", supportTicket.TicketId);

                return Ok(new
                {
                    success = true,
                    message = "Support ticket submitted successfully",
                    data = new
                    {
                        ticketId = supportTicket.TicketId,
                        status = supportTicket.Status
                    }
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating support ticket");
                return StatusCode(500, new { success = false, message = "Error creating support ticket" });
            }
        }

        [HttpGet]
        [Route("tickets")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetAllTickets(
            [FromQuery] string status = "",
            [FromQuery] string category = "",
            [FromQuery] string priority = "",
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 10)
        {
            try
            {
                var tickets = await _supportTicketRepository.GetAllTicketsAsync(status, category, priority);

                // Apply pagination
                var totalTickets = tickets.Count();
                var paginatedTickets = tickets
                    .Skip((page - 1) * pageSize)
                    .Take(pageSize)
                    .Select(t => t.ToSupportTicketDto())
                    .ToList();

                var totalPages = (int)Math.Ceiling(totalTickets / (double)pageSize);

                return Ok(new
                {
                    success = true,
                    data = new
                    {
                        tickets = paginatedTickets,
                        pagination = new
                        {
                            currentPage = page,
                            pageSize = pageSize,
                            totalPages = totalPages,
                            totalItems = totalTickets
                        }
                    }
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving support tickets");
                return StatusCode(500, new { success = false, message = "Error retrieving support tickets" });
            }
        }

        [HttpGet]
        [Route("tickets/{ticketId}")]
        [Authorize]
        public async Task<IActionResult> GetTicketById(string ticketId)
        {
            try
            {
                var ticket = await _supportTicketRepository.GetTicketByIdAsync(ticketId);
                if (ticket == null)
                {
                    return NotFound(new { success = false, message = "Support ticket not found" });
                }

                // Check if user has permission to view this ticket
                var firebaseUid = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                var users = await _userRepository.GetAllAsync();
                var currentUser = users.FirstOrDefault(u => u.FirebaseUid == firebaseUid);

                // Allow admin to view all tickets, or user to view their own tickets
                if (currentUser?.Role != "Admin" && ticket.UserId != currentUser?.UserId)
                {
                    return Forbid();
                }

                var ticketDto = ticket.ToSupportTicketDto();
                return Ok(new { success = true, data = ticketDto });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving support ticket {TicketId}", ticketId);
                return StatusCode(500, new { success = false, message = "Error retrieving support ticket" });
            }
        }

        [HttpGet]
        [Route("my-tickets")]
        [Authorize]
        public async Task<IActionResult> GetMyTickets()
        {
            try
            {
                var firebaseUid = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(firebaseUid))
                {
                    return Unauthorized(new { success = false, message = "User not authenticated" });
                }

                var users = await _userRepository.GetAllAsync();
                var user = users.FirstOrDefault(u => u.FirebaseUid == firebaseUid);
                if (user == null)
                {
                    return NotFound(new { success = false, message = "User not found" });
                }

                var tickets = await _supportTicketRepository.GetTicketsByUserIdAsync(user.UserId);
                var ticketDtos = tickets.Select(t => t.ToSupportTicketDto()).ToList();

                return Ok(new { success = true, data = ticketDtos });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving user tickets");
                return StatusCode(500, new { success = false, message = "Error retrieving your tickets" });
            }
        }
        [HttpPut]
        [Route("tickets/{ticketId}/status")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> UpdateTicketStatus(string ticketId, [FromBody] UpdateTicketStatusDto statusDto)
        {
            try
            {
                var ticket = await _supportTicketRepository.GetTicketByIdAsync(ticketId);
                if (ticket == null)
                {
                    return NotFound(new { success = false, message = "Support ticket not found" });
                }

                ticket.Status = statusDto.Status;
                ticket.AdminResponse = statusDto.AdminResponse;
                ticket.UpdatedAt = DateTime.UtcNow;

                await _supportTicketRepository.UpdateTicketAsync(ticket);

                // If admin provided a response and ticket has a user, send a chat message
                if (!string.IsNullOrEmpty(statusDto.AdminResponse) && !string.IsNullOrEmpty(ticket.UserId))
                {
                    try
                    {
                        // Get admin user
                        var adminFirebaseUid = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                        var allUsers = await _userRepository.GetAllAsync();
                        var adminUser = allUsers.FirstOrDefault(u => u.FirebaseUid == adminFirebaseUid);
                        if (adminUser != null)
                        {
                            // Get or create chat between admin and user
                            var participants = new List<string> { adminUser.UserId, ticket.UserId };
                            var (chat, isNewChat) = await _chatRepository.GetOrCreateChatWithStatusAsync(participants, "support");

                            if (chat != null)
                            {
                                // Send message with support ticket context
                                var messageContent = $"Support Ticket Response:\n\nSubject: {ticket.Subject}\nTicket ID: {ticket.TicketId}\nStatus: {ticket.Status}\n\nResponse: {statusDto.AdminResponse}";

                                // Get proper display name for admin
                                var adminDisplayName = await GetDisplayNameAsync(adminUser.UserId);

                                var sendMessageDto = new SendMessageDto
                                {
                                    ChatId = chat.ChatId,
                                    Content = messageContent,
                                    MessageType = "text"
                                };

                                var message = await _chatRepository.SendMessageAsync(sendMessageDto, adminUser.UserId, adminDisplayName);

                                // If this is a new chat, notify the user about the new chat
                                if (isNewChat)
                                {
                                    await _hubContext.Clients.User(ticket.UserId).SendAsync("NewChat", chat.ChatId);
                                }

                                // Notify the user about the new message via SignalR
                                await _hubContext.Clients.Group($"chat_{chat.ChatId}").SendAsync("ReceiveMessage", new MessageDto
                                {
                                    MessageId = message.MessageId,
                                    ChatId = message.ChatId,
                                    SenderId = message.SenderId,
                                    SenderName = message.SenderName,
                                    Content = message.Content,
                                    MessageType = message.MessageType,
                                    Timestamp = message.Timestamp,
                                    IsRead = false
                                });
                            }
                        }
                    }
                    catch (Exception chatEx)
                    {
                        _logger.LogWarning(chatEx, "Failed to send chat notification for support ticket {TicketId}", ticketId);
                        // Continue with the response even if chat fails
                    }
                }

                _logger.LogInformation("Support ticket {TicketId} status updated to {Status}", ticketId, statusDto.Status);

                return Ok(new
                {
                    success = true,
                    message = "Ticket status updated successfully",
                    data = ticket.ToSupportTicketDto()
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating support ticket status {TicketId}", ticketId);
                return StatusCode(500, new { success = false, message = "Error updating ticket status" });
            }
        }

        [HttpDelete]
        [Route("tickets/{ticketId}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeleteTicket(string ticketId)
        {
            try
            {
                var ticket = await _supportTicketRepository.GetTicketByIdAsync(ticketId);
                if (ticket == null)
                {
                    return NotFound(new { success = false, message = "Support ticket not found" });
                }

                await _supportTicketRepository.DeleteTicketAsync(ticketId);

                _logger.LogInformation("Support ticket {TicketId} deleted", ticketId);

                return Ok(new { success = true, message = "Ticket deleted successfully" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting support ticket {TicketId}", ticketId);
                return StatusCode(500, new { success = false, message = "Error deleting ticket" });
            }
        }

        private async Task<string> GetDisplayNameAsync(string userId)
        {
            if (string.IsNullOrEmpty(userId))
                return "Unknown User";

            try
            {
                var user = await _userRepository.GetByIdAsync(userId);
                if (user == null)
                    return "Unknown User";

                // If the user is an admin, return "Support Team"
                if (user.Role == "Admin")
                {
                    return "Support Team";
                }

                // If the user is a seller, return store name instead of user name
                if (user.Role == "Seller")
                {
                    var seller = await _sellerRepository.GetSellerByUserIdAsync(userId);
                    if (seller != null && !string.IsNullOrEmpty(seller.StoreName))
                    {
                        return seller.StoreName;
                    }
                }

                return user.Name ?? "Unknown User";
            }
            catch
            {
                return "Unknown User";
            }
        }
    }
}
