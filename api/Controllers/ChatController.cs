using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using api.Interfaces;
using api.Dtos.Chat;
using api.Hubs;
using Microsoft.AspNetCore.SignalR;
using System.Security.Claims;

namespace api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class ChatController : ControllerBase
    {
        private readonly IChatRepository _chatRepository;
        private readonly IUserRepository _userRepository;
        private readonly IHubContext<ChatHub> _hubContext;

        public ChatController(
            IChatRepository chatRepository,
            IUserRepository userRepository,
            IHubContext<ChatHub> hubContext)
        {
            _chatRepository = chatRepository;
            _userRepository = userRepository;
            _hubContext = hubContext;
        }

        [HttpGet]
        public async Task<ActionResult<ChatListResponseDto>> GetUserChats()
        {
            try
            {
                var userId = GetCurrentUserId();
                if (string.IsNullOrEmpty(userId))
                    return Unauthorized();

                var chats = await _chatRepository.GetUserChatsAsync(userId);
                var chatDtos = new List<ChatDto>();

                foreach (var chat in chats)
                {
                    var participantDetails = new List<ChatParticipantDto>();

                    // Get details for other participants
                    foreach (var participantId in chat.Participants.Where(p => p != userId))
                    {
                        var participant = await _userRepository.GetByIdAsync(participantId);
                        if (participant != null)
                        {
                            participantDetails.Add(new ChatParticipantDto
                            {
                                UserId = participant.UserId,
                                Name = participant.Name,
                                Role = participant.Role,
                                IsOnline = ChatHub.IsUserOnline(participantId)
                            });
                        }
                    }

                    chatDtos.Add(new ChatDto
                    {
                        ChatId = chat.ChatId,
                        Participants = chat.Participants,
                        LastMessage = chat.LastMessage,
                        LastMessageTime = chat.LastMessageTime,
                        LastMessageSender = chat.LastMessageSender,
                        CreatedAt = chat.CreatedAt,
                        ChatType = chat.ChatType,
                        UnreadCount = chat.UnreadCounts.GetValueOrDefault(userId, 0),
                        ParticipantDetails = participantDetails
                    });
                }

                var totalUnreadCount = await _chatRepository.GetTotalUnreadCountAsync(userId);

                return Ok(new ChatListResponseDto
                {
                    Chats = chatDtos.OrderByDescending(c => c.LastMessageTime).ToList(),
                    TotalUnreadCount = totalUnreadCount
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while retrieving chats", error = ex.Message });
            }
        }

        [HttpPost]
        public async Task<ActionResult<ChatDto>> CreateChat([FromBody] CreateChatDto createChatDto)
        {
            try
            {
                var userId = GetCurrentUserId();
                if (string.IsNullOrEmpty(userId))
                    return Unauthorized();                // Validate participants exist
                foreach (var participantId in createChatDto.Participants)
                {
                    var participant = await _userRepository.GetByIdAsync(participantId);
                    if (participant == null)
                        return BadRequest($"User with ID {participantId} not found");
                }

                var chat = await _chatRepository.CreateChatAsync(createChatDto, userId);

                // Notify all participants about the new chat
                foreach (var participantId in chat.Participants)
                {
                    await _hubContext.Clients.User(participantId).SendAsync("NewChat", chat.ChatId);
                }

                return Ok(new ChatDto
                {
                    ChatId = chat.ChatId,
                    Participants = chat.Participants,
                    LastMessage = chat.LastMessage,
                    LastMessageTime = chat.LastMessageTime,
                    LastMessageSender = chat.LastMessageSender,
                    CreatedAt = chat.CreatedAt,
                    ChatType = chat.ChatType,
                    UnreadCount = 0
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while creating the chat", error = ex.Message });
            }
        }

        [HttpGet("{chatId}")]
        public async Task<ActionResult<ChatDto>> GetChat(string chatId)
        {
            try
            {
                var userId = GetCurrentUserId();
                if (string.IsNullOrEmpty(userId))
                    return Unauthorized();

                var chat = await _chatRepository.GetChatByIdAsync(chatId);
                if (chat == null)
                    return NotFound("Chat not found");

                // Verify user is a participant
                if (!chat.Participants.Contains(userId))
                    return Forbid("You are not a participant in this chat"); var participantDetails = new List<ChatParticipantDto>();

                // Get details for all participants
                foreach (var participantId in chat.Participants)
                {
                    var participant = await _userRepository.GetByIdAsync(participantId);
                    if (participant != null)
                    {
                        participantDetails.Add(new ChatParticipantDto
                        {
                            UserId = participant.UserId,
                            Name = participant.Name,
                            Role = participant.Role,
                            IsOnline = ChatHub.IsUserOnline(participantId)
                        });
                    }
                }

                return Ok(new ChatDto
                {
                    ChatId = chat.ChatId,
                    Participants = chat.Participants,
                    LastMessage = chat.LastMessage,
                    LastMessageTime = chat.LastMessageTime,
                    LastMessageSender = chat.LastMessageSender,
                    CreatedAt = chat.CreatedAt,
                    ChatType = chat.ChatType,
                    UnreadCount = chat.UnreadCounts.GetValueOrDefault(userId, 0),
                    ParticipantDetails = participantDetails
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while retrieving the chat", error = ex.Message });
            }
        }

        [HttpGet("{chatId}/messages")]
        public async Task<ActionResult<List<MessageDto>>> GetChatMessages(string chatId, [FromQuery] int limit = 50, [FromQuery] string? cursor = null)
        {
            try
            {
                var userId = GetCurrentUserId();
                if (string.IsNullOrEmpty(userId))
                    return Unauthorized();

                // Verify user is a participant
                var isParticipant = await _chatRepository.IsChatParticipantAsync(chatId, userId);
                if (!isParticipant)
                    return Forbid("You are not a participant in this chat");

                var messages = await _chatRepository.GetChatMessagesAsync(chatId, limit, cursor);
                var messageDtos = new List<MessageDto>();

                foreach (var message in messages)
                {
                    var messageDto = new MessageDto
                    {
                        MessageId = message.MessageId,
                        ChatId = message.ChatId,
                        SenderId = message.SenderId,
                        SenderName = message.SenderName,
                        Content = message.Content,
                        MessageType = message.MessageType,
                        Timestamp = message.Timestamp,
                        IsRead = message.IsRead.GetValueOrDefault(userId, false),
                        EditedAt = message.EditedAt,
                        ReplyToMessageId = message.ReplyToMessageId
                    };

                    // If this is a reply, get the original message
                    if (!string.IsNullOrEmpty(message.ReplyToMessageId))
                    {
                        var replyToMessage = await _chatRepository.GetMessageByIdAsync(message.ReplyToMessageId);
                        if (replyToMessage != null)
                        {
                            messageDto.ReplyToMessage = new MessageDto
                            {
                                MessageId = replyToMessage.MessageId,
                                SenderId = replyToMessage.SenderId,
                                SenderName = replyToMessage.SenderName,
                                Content = replyToMessage.Content,
                                MessageType = replyToMessage.MessageType,
                                Timestamp = replyToMessage.Timestamp
                            };
                        }
                    }

                    messageDtos.Add(messageDto);
                }

                return Ok(messageDtos);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while retrieving messages", error = ex.Message });
            }
        }

        [HttpPost("{chatId}/messages")]
        public async Task<ActionResult<MessageDto>> SendMessage(string chatId, [FromBody] SendMessageDto sendMessageDto)
        {
            try
            {
                var userId = GetCurrentUserId();
                var userName = await GetCurrentUserNameAsync();

                if (string.IsNullOrEmpty(userId) || string.IsNullOrEmpty(userName))
                    return Unauthorized();

                // Set the chat ID from the route
                sendMessageDto.ChatId = chatId;

                // Verify user is a participant
                var isParticipant = await _chatRepository.IsChatParticipantAsync(chatId, userId);
                if (!isParticipant)
                    return Forbid("You are not a participant in this chat");

                var message = await _chatRepository.SendMessageAsync(sendMessageDto, userId, userName);

                var messageDto = new MessageDto
                {
                    MessageId = message.MessageId,
                    ChatId = message.ChatId,
                    SenderId = message.SenderId,
                    SenderName = message.SenderName,
                    Content = message.Content,
                    MessageType = message.MessageType,
                    Timestamp = message.Timestamp,
                    IsRead = true, // Always read for the sender
                    ReplyToMessageId = message.ReplyToMessageId
                };

                // If this is a reply, get the original message
                if (!string.IsNullOrEmpty(message.ReplyToMessageId))
                {
                    var replyToMessage = await _chatRepository.GetMessageByIdAsync(message.ReplyToMessageId);
                    if (replyToMessage != null)
                    {
                        messageDto.ReplyToMessage = new MessageDto
                        {
                            MessageId = replyToMessage.MessageId,
                            SenderId = replyToMessage.SenderId,
                            SenderName = replyToMessage.SenderName,
                            Content = replyToMessage.Content,
                            MessageType = replyToMessage.MessageType,
                            Timestamp = replyToMessage.Timestamp
                        };
                    }
                }

                // Send real-time notification via SignalR
                await _hubContext.Clients.Group($"chat_{chatId}").SendAsync("ReceiveMessage", messageDto);

                return Ok(messageDto);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while sending the message", error = ex.Message });
            }
        }

        [HttpPost("{chatId}/read")]
        public async Task<ActionResult> MarkChatAsRead(string chatId)
        {
            try
            {
                var userId = GetCurrentUserId();
                if (string.IsNullOrEmpty(userId))
                    return Unauthorized();

                // Verify user is a participant
                var isParticipant = await _chatRepository.IsChatParticipantAsync(chatId, userId);
                if (!isParticipant)
                    return Forbid("You are not a participant in this chat");

                var success = await _chatRepository.MarkChatAsReadAsync(chatId, userId);
                if (!success)
                    return BadRequest("Failed to mark chat as read");

                // Notify other participants via SignalR
                await _hubContext.Clients.Group($"chat_{chatId}").SendAsync("ChatRead", chatId, userId);

                var totalUnreadCount = await _chatRepository.GetTotalUnreadCountAsync(userId);
                await _hubContext.Clients.User(userId).SendAsync("UnreadCountUpdate", totalUnreadCount);

                return Ok();
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while marking chat as read", error = ex.Message });
            }
        }

        [HttpGet("unread-count")]
        public async Task<ActionResult<int>> GetUnreadCount()
        {
            try
            {
                var userId = GetCurrentUserId();
                if (string.IsNullOrEmpty(userId))
                    return Unauthorized();

                var unreadCount = await _chatRepository.GetTotalUnreadCountAsync(userId);
                return Ok(unreadCount);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while retrieving unread count", error = ex.Message });
            }
        }

        [HttpPost("find-or-create")]
        public async Task<ActionResult<ChatDto>> FindOrCreateChat([FromBody] CreateChatDto createChatDto)
        {
            try
            {
                var userId = GetCurrentUserId();
                if (string.IsNullOrEmpty(userId))
                    return Unauthorized(); var chat = await _chatRepository.GetOrCreateChatAsync(createChatDto.Participants, createChatDto.ChatType, userId);
                if (chat == null)
                    return StatusCode(500, "Failed to create or find chat");

                return Ok(new ChatDto
                {
                    ChatId = chat.ChatId,
                    Participants = chat.Participants,
                    LastMessage = chat.LastMessage,
                    LastMessageTime = chat.LastMessageTime,
                    LastMessageSender = chat.LastMessageSender,
                    CreatedAt = chat.CreatedAt,
                    ChatType = chat.ChatType,
                    UnreadCount = chat.UnreadCounts.GetValueOrDefault(userId, 0)
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while finding or creating chat", error = ex.Message });
            }
        }
        private string GetCurrentUserId()
        {
            // Get Firebase UID from JWT claims
            var firebaseUid = User.FindFirst(ClaimTypes.NameIdentifier)?.Value ??
                             User.FindFirst("uid")?.Value;

            if (string.IsNullOrEmpty(firebaseUid))
                return string.Empty;

            // Get the User document ID from Firestore using Firebase UID
            // This should be cached or optimized in production
            var users = _userRepository.GetAllAsync().Result;
            var user = users.FirstOrDefault(u => u.FirebaseUid == firebaseUid);

            return user?.UserId ?? string.Empty;
        }
        private string GetCurrentUserName()
        {
            return User.FindFirst("name")?.Value ??
                   User.Identity?.Name ??
                   "Unknown User";
        }

        private async Task<string> GetCurrentUserNameAsync()
        {
            var userId = GetCurrentUserId();
            if (string.IsNullOrEmpty(userId))
                return "Unknown User";

            try
            {
                var user = await _userRepository.GetByIdAsync(userId);
                return user?.Name ?? "Unknown User";
            }
            catch
            {
                return "Unknown User";
            }
        }
    }
}
