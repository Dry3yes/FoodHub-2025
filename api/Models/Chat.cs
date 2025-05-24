using Google.Cloud.Firestore;

namespace api.Models
{
    [FirestoreData]
    public class Chat
    {
        [FirestoreDocumentId]
        public string ChatId { get; set; } = string.Empty;

        [FirestoreProperty("participants")]
        public List<string> Participants { get; set; } = new List<string>();

        [FirestoreProperty("lastMessage")]
        public string LastMessage { get; set; } = string.Empty;

        [FirestoreProperty("lastMessageTime")]
        public DateTime LastMessageTime { get; set; } = DateTime.UtcNow;

        [FirestoreProperty("lastMessageSender")]
        public string LastMessageSender { get; set; } = string.Empty;

        [FirestoreProperty("createdAt")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        [FirestoreProperty("isActive")]
        public bool IsActive { get; set; } = true;

        [FirestoreProperty("chatType")]
        public string ChatType { get; set; } = "user_seller"; // user_seller, support, group

        [FirestoreProperty("unreadCounts")]
        public Dictionary<string, int> UnreadCounts { get; set; } = new Dictionary<string, int>();
    }

    [FirestoreData]
    public class Message
    {
        [FirestoreDocumentId]
        public string MessageId { get; set; } = string.Empty;

        [FirestoreProperty("chatId")]
        public string ChatId { get; set; } = string.Empty;

        [FirestoreProperty("senderId")]
        public string SenderId { get; set; } = string.Empty;

        [FirestoreProperty("senderName")]
        public string SenderName { get; set; } = string.Empty;

        [FirestoreProperty("content")]
        public string Content { get; set; } = string.Empty;

        [FirestoreProperty("messageType")]
        public string MessageType { get; set; } = "text"; // text, image, file, system

        [FirestoreProperty("timestamp")]
        public DateTime Timestamp { get; set; } = DateTime.UtcNow;

        [FirestoreProperty("isRead")]
        public Dictionary<string, bool> IsRead { get; set; } = new Dictionary<string, bool>();

        [FirestoreProperty("editedAt")]
        public DateTime? EditedAt { get; set; }

        [FirestoreProperty("replyToMessageId")]
        public string? ReplyToMessageId { get; set; }
    }
}
