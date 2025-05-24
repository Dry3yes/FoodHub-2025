using Microsoft.AspNetCore.SignalR;
using Microsoft.AspNetCore.Authorization;
using api.Interfaces;
using api.Dtos.Chat;
using api.Models;
using System.Collections.Concurrent;

namespace api.Hubs
{
    [Authorize]
    public class ChatHub : Hub
    {
        private readonly IChatRepository _chatRepository;
        private readonly IUserRepository _userRepository;
        private static readonly ConcurrentDictionary<string, string> _userConnections = new();
        private static readonly ConcurrentDictionary<string, HashSet<string>> _chatGroups = new();

        public ChatHub(IChatRepository chatRepository, IUserRepository userRepository)
        {
            _chatRepository = chatRepository;
            _userRepository = userRepository;
        }
        public override async Task OnConnectedAsync()
        {
            try
            {
                var userId = GetUserId();
                if (!string.IsNullOrEmpty(userId))
                {
                    _userConnections[userId] = Context.ConnectionId;

                    // Join all user's chat groups
                    var userChats = await _chatRepository.GetUserChatsAsync(userId);
                    foreach (var chat in userChats)
                    {
                        await Groups.AddToGroupAsync(Context.ConnectionId, $"chat_{chat.ChatId}");

                        // Track chat groups
                        _chatGroups.AddOrUpdate(chat.ChatId,
                            new HashSet<string> { userId },
                            (key, existing) => { existing.Add(userId); return existing; });
                    }

                    // Notify other users that this user is online
                    await Clients.All.SendAsync("UserOnline", userId);
                }

                await base.OnConnectedAsync();
            }
            catch (Exception ex)
            {
                // Log the error but don't throw to avoid transport issues
                Console.WriteLine($"Error in OnConnectedAsync: {ex.Message}");
                // Still call base method
                await base.OnConnectedAsync();
            }
        }
        public override async Task OnDisconnectedAsync(Exception? exception)
        {
            try
            {
                var userId = GetUserId();
                if (!string.IsNullOrEmpty(userId))
                {
                    _userConnections.TryRemove(userId, out _);

                    // Remove from chat groups
                    var userChats = await _chatRepository.GetUserChatsAsync(userId);
                    foreach (var chat in userChats)
                    {
                        if (_chatGroups.TryGetValue(chat.ChatId, out var group))
                        {
                            group.Remove(userId);
                            if (group.Count == 0)
                            {
                                _chatGroups.TryRemove(chat.ChatId, out _);
                            }
                        }
                    }

                    // Notify other users that this user is offline
                    await Clients.All.SendAsync("UserOffline", userId);
                }
            }
            catch (Exception ex)
            {
                // Log the error but don't throw to avoid transport issues
                Console.WriteLine($"Error in OnDisconnectedAsync: {ex.Message}");
            }
            finally
            {
                await base.OnDisconnectedAsync(exception);
            }
        }

        public async Task JoinChat(string chatId)
        {
            var userId = GetUserId();
            if (string.IsNullOrEmpty(userId))
                return;

            // Verify user is a participant in this chat
            var isParticipant = await _chatRepository.IsChatParticipantAsync(chatId, userId);
            if (!isParticipant)
                return;

            await Groups.AddToGroupAsync(Context.ConnectionId, $"chat_{chatId}");

            // Track chat groups
            _chatGroups.AddOrUpdate(chatId,
                new HashSet<string> { userId },
                (key, existing) => { existing.Add(userId); return existing; });

            await Clients.Caller.SendAsync("JoinedChat", chatId);
        }

        public async Task LeaveChat(string chatId)
        {
            var userId = GetUserId();
            if (string.IsNullOrEmpty(userId))
                return;

            await Groups.RemoveFromGroupAsync(Context.ConnectionId, $"chat_{chatId}");

            // Update chat groups
            if (_chatGroups.TryGetValue(chatId, out var group))
            {
                group.Remove(userId);
                if (group.Count == 0)
                {
                    _chatGroups.TryRemove(chatId, out _);
                }
            }

            await Clients.Caller.SendAsync("LeftChat", chatId);
        }
        public async Task SendMessage(SendMessageDto sendMessageDto)
        {
            var userId = GetUserId();
            var userName = await GetUserNameAsync();

            if (string.IsNullOrEmpty(userId) || string.IsNullOrEmpty(userName))
                return;

            try
            {
                // Verify user is a participant in this chat
                var isParticipant = await _chatRepository.IsChatParticipantAsync(sendMessageDto.ChatId, userId);
                if (!isParticipant)
                {
                    await Clients.Caller.SendAsync("Error", "You are not a participant in this chat");
                    return;
                }

                // Save message to database
                var message = await _chatRepository.SendMessageAsync(sendMessageDto, userId, userName);

                // Convert to DTO for response
                var messageDto = new MessageDto
                {
                    MessageId = message.MessageId,
                    ChatId = message.ChatId,
                    SenderId = message.SenderId,
                    SenderName = message.SenderName,
                    Content = message.Content,
                    MessageType = message.MessageType,
                    Timestamp = message.Timestamp,
                    IsRead = false, // For the recipient's perspective
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

                // Send to all participants in the chat
                await Clients.Group($"chat_{sendMessageDto.ChatId}").SendAsync("ReceiveMessage", messageDto);

                // Send push notification to offline users (if needed)
                await NotifyOfflineUsers(sendMessageDto.ChatId, message, userId);
            }
            catch (Exception ex)
            {
                await Clients.Caller.SendAsync("Error", $"Failed to send message: {ex.Message}");
            }
        }

        public async Task MarkMessageAsRead(string messageId)
        {
            var userId = GetUserId();
            if (string.IsNullOrEmpty(userId))
                return;

            try
            {
                var success = await _chatRepository.MarkMessageAsReadAsync(messageId, userId);
                if (success)
                {
                    var message = await _chatRepository.GetMessageByIdAsync(messageId);
                    if (message != null)
                    {
                        // Notify other participants that the message was read
                        await Clients.Group($"chat_{message.ChatId}")
                            .SendAsync("MessageRead", messageId, userId);
                    }
                }
            }
            catch (Exception ex)
            {
                await Clients.Caller.SendAsync("Error", $"Failed to mark message as read: {ex.Message}");
            }
        }

        public async Task MarkChatAsRead(string chatId)
        {
            var userId = GetUserId();
            if (string.IsNullOrEmpty(userId))
                return;

            try
            {
                var success = await _chatRepository.MarkChatAsReadAsync(chatId, userId);
                if (success)
                {
                    // Notify other participants that the chat was read
                    await Clients.Group($"chat_{chatId}")
                        .SendAsync("ChatRead", chatId, userId);

                    // Send updated unread count to the user
                    var totalUnreadCount = await _chatRepository.GetTotalUnreadCountAsync(userId);
                    await Clients.Caller.SendAsync("UnreadCountUpdate", totalUnreadCount);
                }
            }
            catch (Exception ex)
            {
                await Clients.Caller.SendAsync("Error", $"Failed to mark chat as read: {ex.Message}");
            }
        }
        public async Task StartTyping(string chatId)
        {
            var userId = GetUserId();
            var userName = await GetUserNameAsync();

            if (string.IsNullOrEmpty(userId) || string.IsNullOrEmpty(userName))
                return;

            // Verify user is a participant in this chat
            var isParticipant = await _chatRepository.IsChatParticipantAsync(chatId, userId);
            if (!isParticipant)
                return;

            // Notify other participants that user is typing
            await Clients.OthersInGroup($"chat_{chatId}")
                .SendAsync("UserTyping", chatId, userId, userName);
        }

        public async Task StopTyping(string chatId)
        {
            var userId = GetUserId();

            if (string.IsNullOrEmpty(userId))
                return;

            // Notify other participants that user stopped typing
            await Clients.OthersInGroup($"chat_{chatId}")
                .SendAsync("UserStoppedTyping", chatId, userId);
        }

        public static bool IsUserOnline(string userId)
        {
            return _userConnections.ContainsKey(userId);
        }

        public static List<string> GetOnlineUsersInChat(string chatId)
        {
            return _chatGroups.GetValueOrDefault(chatId, new HashSet<string>()).ToList();
        }
        private string GetUserId()
        {
            // Get Firebase UID from JWT claims
            var firebaseUid = Context.User?.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value ??
                             Context.User?.FindFirst("uid")?.Value;

            if (string.IsNullOrEmpty(firebaseUid))
                return string.Empty;

            // Get the User document ID from Firestore using Firebase UID
            // This should be cached or optimized in production
            try
            {
                var users = _userRepository.GetAllAsync().Result;
                var user = users.FirstOrDefault(u => u.FirebaseUid == firebaseUid);
                return user?.UserId ?? string.Empty;
            }
            catch
            {
                return string.Empty;
            }
        }
        private string GetUserName()
        {
            return Context.User?.FindFirst("name")?.Value ??
                   Context.User?.Identity?.Name ??
                   "Unknown User";
        }

        private async Task<string> GetUserNameAsync()
        {
            var userId = GetUserId();
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

        private async Task NotifyOfflineUsers(string chatId, Message message, string senderId)
        {
            try
            {
                var chat = await _chatRepository.GetChatByIdAsync(chatId);
                if (chat == null) return;

                var offlineUsers = chat.Participants
                    .Where(p => p != senderId && !IsUserOnline(p))
                    .ToList();

                // Here you could integrate with a push notification service
                // For now, we'll just log the offline users that should be notified
                foreach (var offlineUserId in offlineUsers)
                {
                    // TODO: Send push notification to offline user
                    Console.WriteLine($"Should notify offline user {offlineUserId} about new message in chat {chatId}");
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error notifying offline users: {ex.Message}");
            }
        }
    }
}
