using api.Interfaces;
using api.Models;
using Google.Cloud.Firestore;

namespace api.Repositories
{
    public class SupportTicketRepository : ISupportTicketRepository
    {
        private readonly FirestoreDb _firestoreDb;
        private readonly ILogger<SupportTicketRepository> _logger;

        public SupportTicketRepository(FirestoreDb firestoreDb, ILogger<SupportTicketRepository> logger)
        {
            _firestoreDb = firestoreDb;
            _logger = logger;
        }

        public async Task<SupportTicket> CreateTicketAsync(SupportTicket ticket)
        {
            try
            {
                var documentRef = _firestoreDb.Collection("SupportTickets").Document(ticket.TicketId);
                await documentRef.SetAsync(ticket);

                _logger.LogInformation("Support ticket created successfully: {TicketId}", ticket.TicketId);
                return ticket;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating support ticket: {TicketId}", ticket.TicketId);
                throw;
            }
        }

        public async Task<SupportTicket?> GetTicketByIdAsync(string ticketId)
        {
            try
            {
                var documentRef = _firestoreDb.Collection("SupportTickets").Document(ticketId);
                var documentSnapshot = await documentRef.GetSnapshotAsync();

                if (documentSnapshot.Exists)
                {
                    var ticket = documentSnapshot.ConvertTo<SupportTicket>();
                    ticket.Id = documentSnapshot.Id;
                    return ticket;
                }

                return null;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving support ticket: {TicketId}", ticketId);
                throw;
            }
        }

        public async Task<IEnumerable<SupportTicket>> GetAllTicketsAsync(string status = "", string category = "", string priority = "")
        {
            try
            {
                var collectionRef = _firestoreDb.Collection("SupportTickets");
                Query query = collectionRef;

                // Apply filters if provided
                if (!string.IsNullOrEmpty(status))
                {
                    query = query.WhereEqualTo("Status", status);
                }

                if (!string.IsNullOrEmpty(category))
                {
                    query = query.WhereEqualTo("Category", category);
                }

                if (!string.IsNullOrEmpty(priority))
                {
                    query = query.WhereEqualTo("Priority", priority);
                }

                // Order by creation date (newest first)
                query = query.OrderByDescending("CreatedAt");

                var querySnapshot = await query.GetSnapshotAsync();
                var tickets = new List<SupportTicket>();

                foreach (var documentSnapshot in querySnapshot.Documents)
                {
                    var ticket = documentSnapshot.ConvertTo<SupportTicket>();
                    ticket.Id = documentSnapshot.Id;
                    tickets.Add(ticket);
                }

                return tickets;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving support tickets");
                throw;
            }
        }

        public async Task<IEnumerable<SupportTicket>> GetTicketsByUserIdAsync(string userId)
        {
            try
            {
                var collectionRef = _firestoreDb.Collection("SupportTickets");
                var query = collectionRef
                    .WhereEqualTo("UserId", userId)
                    .OrderByDescending("CreatedAt");

                var querySnapshot = await query.GetSnapshotAsync();
                var tickets = new List<SupportTicket>();

                foreach (var documentSnapshot in querySnapshot.Documents)
                {
                    var ticket = documentSnapshot.ConvertTo<SupportTicket>();
                    ticket.Id = documentSnapshot.Id;
                    tickets.Add(ticket);
                }

                return tickets;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving support tickets for user: {UserId}", userId);
                throw;
            }
        }

        public async Task<bool> UpdateTicketAsync(SupportTicket ticket)
        {
            try
            {
                var documentRef = _firestoreDb.Collection("SupportTickets").Document(ticket.TicketId);
                await documentRef.SetAsync(ticket, SetOptions.MergeAll);

                _logger.LogInformation("Support ticket updated successfully: {TicketId}", ticket.TicketId);
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating support ticket: {TicketId}", ticket.TicketId);
                return false;
            }
        }

        public async Task<bool> DeleteTicketAsync(string ticketId)
        {
            try
            {
                var documentRef = _firestoreDb.Collection("SupportTickets").Document(ticketId);
                await documentRef.DeleteAsync();

                _logger.LogInformation("Support ticket deleted successfully: {TicketId}", ticketId);
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting support ticket: {TicketId}", ticketId);
                return false;
            }
        }
    }
}
