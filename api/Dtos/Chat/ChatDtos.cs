namespace api.Dtos.Chat
{
    public class CreateChatDto
    {
        public List<string> Participants { get; set; } = new List<string>();
        public string ChatType { get; set; } = "user_seller";
        public string? InitialMessage { get; set; }
    }

    public class ChatDto
    {
        public string ChatId { get; set; } = string.Empty;
        public List<string> Participants { get; set; } = new List<string>();
        public string LastMessage { get; set; } = string.Empty;
        public DateTime LastMessageTime { get; set; }
        public string LastMessageSender { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
        public string ChatType { get; set; } = string.Empty;
        public int UnreadCount { get; set; } = 0;
        public List<ChatParticipantDto> ParticipantDetails { get; set; } = new List<ChatParticipantDto>();
    }

    public class ChatParticipantDto
    {
        public string UserId { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string Role { get; set; } = string.Empty;
        public bool IsOnline { get; set; } = false;
    }

    public class SendMessageDto
    {
        public string ChatId { get; set; } = string.Empty;
        public string Content { get; set; } = string.Empty;
        public string MessageType { get; set; } = "text";
        public string? ReplyToMessageId { get; set; }
    }

    public class MessageDto
    {
        public string MessageId { get; set; } = string.Empty;
        public string ChatId { get; set; } = string.Empty;
        public string SenderId { get; set; } = string.Empty;
        public string SenderName { get; set; } = string.Empty;
        public string Content { get; set; } = string.Empty;
        public string MessageType { get; set; } = string.Empty;
        public DateTime Timestamp { get; set; }
        public bool IsRead { get; set; }
        public DateTime? EditedAt { get; set; }
        public string? ReplyToMessageId { get; set; }
        public MessageDto? ReplyToMessage { get; set; }
    }

    public class MarkAsReadDto
    {
        public string ChatId { get; set; } = string.Empty;
        public string? MessageId { get; set; }
    }

    public class ChatListResponseDto
    {
        public List<ChatDto> Chats { get; set; } = new List<ChatDto>();
        public int TotalUnreadCount { get; set; } = 0;
    }
}
