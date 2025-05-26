using api.Models;

namespace api.Interfaces
{
    public interface ISupportTicketRepository
    {
        Task<SupportTicket> CreateTicketAsync(SupportTicket ticket);
        Task<SupportTicket?> GetTicketByIdAsync(string ticketId);
        Task<IEnumerable<SupportTicket>> GetAllTicketsAsync(string status = "", string category = "", string priority = "");
        Task<IEnumerable<SupportTicket>> GetTicketsByUserIdAsync(string userId);
        Task<bool> UpdateTicketAsync(SupportTicket ticket);
        Task<bool> DeleteTicketAsync(string ticketId);
    }
}
