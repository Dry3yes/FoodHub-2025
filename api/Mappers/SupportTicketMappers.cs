using api.Dtos.Support;
using api.Models;

namespace api.Mappers
{
    public static class SupportTicketMappers
    {
        public static SupportTicketDto ToSupportTicketDto(this SupportTicket supportTicket)
        {
            return new SupportTicketDto
            {
                TicketId = supportTicket.TicketId,
                UserId = supportTicket.UserId,
                Name = supportTicket.Name,
                Email = supportTicket.Email,
                UserType = supportTicket.UserType,
                Category = supportTicket.Category,
                Subject = supportTicket.Subject,
                Description = supportTicket.Description,
                Status = supportTicket.Status,
                AdminResponse = supportTicket.AdminResponse,
                CreatedAt = supportTicket.CreatedAt,
                UpdatedAt = supportTicket.UpdatedAt
            };
        }

        public static SupportTicket ToSupportTicketFromCreateDto(this CreateSupportTicketDto createDto)
        {
            return new SupportTicket
            {
                Name = createDto.Name,
                Email = createDto.Email,
                UserType = createDto.UserType,
                Category = createDto.Category,
                Subject = createDto.Subject,
                Description = createDto.Description,
            };
        }
    }
}
