using api.Dtos.Support;
using api.Interfaces;
using api.Mappers;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
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
        private readonly ILogger<SupportController> _logger;

        public SupportController(
            ISupportTicketRepository supportTicketRepository,
            IUserRepository userRepository,
            ILogger<SupportController> logger)
        {
            _supportTicketRepository = supportTicketRepository;
            _userRepository = userRepository;
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
    }
}
