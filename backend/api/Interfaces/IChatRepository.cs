using api.Models;
using api.Dtos.Chat;

namespace api.Interfaces
{
    public interface IChatRepository
    {
        Task<Chat> CreateChatAsync(CreateChatDto createChatDto, string currentUserId);
        Task<Chat?> GetChatByIdAsync(string chatId);
        Task<List<Chat>> GetUserChatsAsync(string userId);
        Task<Chat?> GetOrCreateChatAsync(List<string> participants, string chatType = "user_seller", string? currentUserId = null);
        Task<(Chat?, bool isNewChat)> GetOrCreateChatWithStatusAsync(List<string> participants, string chatType = "user_seller", string? currentUserId = null);
        Task<bool> AddParticipantAsync(string chatId, string userId);
        Task<bool> RemoveParticipantAsync(string chatId, string userId);
        Task<bool> UpdateLastMessageAsync(string chatId, string message, string senderId, DateTime timestamp);

        Task<Message> SendMessageAsync(SendMessageDto sendMessageDto, string senderId, string senderName);
        Task<List<Message>> GetChatMessagesAsync(string chatId, int limit = 50, string? cursor = null);
        Task<bool> MarkMessageAsReadAsync(string messageId, string userId);
        Task<bool> MarkChatAsReadAsync(string chatId, string userId);
        Task<Message?> GetMessageByIdAsync(string messageId);
        Task<bool> DeleteMessageAsync(string messageId, string userId);
        Task<bool> EditMessageAsync(string messageId, string newContent, string userId);

        Task<int> GetUnreadCountAsync(string chatId, string userId);
        Task<int> GetTotalUnreadCountAsync(string userId);
        Task<bool> IsChatParticipantAsync(string chatId, string userId);
    }
}
