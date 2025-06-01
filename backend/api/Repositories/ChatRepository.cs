using api.Interfaces;
using api.Models;
using api.Dtos.Chat;
using Google.Cloud.Firestore;

namespace api.Repositories
{
    public class ChatRepository : IChatRepository
    {
        private readonly FirestoreDb _db;
        private readonly IUserRepository _userRepository;

        public ChatRepository(FirestoreDb db, IUserRepository userRepository)
        {
            _db = db;
            _userRepository = userRepository;
        }

        public async Task<Chat> CreateChatAsync(CreateChatDto createChatDto, string currentUserId)
        {
            var chat = new Chat
            {
                ChatId = Guid.NewGuid().ToString(),
                Participants = createChatDto.Participants.Contains(currentUserId)
                    ? createChatDto.Participants
                    : createChatDto.Participants.Concat(new[] { currentUserId }).ToList(),
                ChatType = createChatDto.ChatType,
                CreatedAt = DateTime.UtcNow,
                IsActive = true
            };

            // Initialize unread counts for all participants
            foreach (var participant in chat.Participants)
            {
                chat.UnreadCounts[participant] = 0;
            }

            var docRef = _db.Collection("chats").Document(chat.ChatId);
            await docRef.SetAsync(chat);

            // Send initial message if provided
            if (!string.IsNullOrEmpty(createChatDto.InitialMessage))
            {
                var user = await _userRepository.GetByIdAsync(currentUserId);
                await SendMessageAsync(new SendMessageDto
                {
                    ChatId = chat.ChatId,
                    Content = createChatDto.InitialMessage,
                    MessageType = "text"
                }, currentUserId, user?.Name ?? "Unknown User");
            }

            return chat;
        }

        public async Task<Chat?> GetChatByIdAsync(string chatId)
        {
            var docRef = _db.Collection("chats").Document(chatId);
            var snapshot = await docRef.GetSnapshotAsync();

            if (!snapshot.Exists)
                return null;

            return snapshot.ConvertTo<Chat>();
        }

        public async Task<List<Chat>> GetUserChatsAsync(string userId)
        {
            var query = _db.Collection("chats")
                .WhereArrayContains("participants", userId)
                .WhereEqualTo("isActive", true)
                .OrderByDescending("lastMessageTime");

            var snapshot = await query.GetSnapshotAsync();
            return snapshot.Documents.Select(doc => doc.ConvertTo<Chat>()).ToList();
        }
        public async Task<Chat?> GetOrCreateChatAsync(List<string> participants, string chatType = "user_seller", string? currentUserId = null)
        {
            // Add current user to participants if provided and not already included
            if (!string.IsNullOrEmpty(currentUserId) && !participants.Contains(currentUserId))
            {
                participants = participants.Concat(new[] { currentUserId }).ToList();
            }

            // Sort participants to ensure consistent ordering
            var sortedParticipants = participants.OrderBy(p => p).ToList();

            // Try to find existing chat with these participants
            var query = _db.Collection("chats")
                .WhereEqualTo("chatType", chatType)
                .WhereEqualTo("isActive", true);

            var snapshot = await query.GetSnapshotAsync();

            foreach (var doc in snapshot.Documents)
            {
                var chat = doc.ConvertTo<Chat>();
                var sortedChatParticipants = chat.Participants.OrderBy(p => p).ToList();

                if (sortedChatParticipants.SequenceEqual(sortedParticipants))
                {
                    return chat;
                }
            }

            // Create new chat if none exists
            var createChatDto = new CreateChatDto
            {
                Participants = participants,
                ChatType = chatType
            };

            // Use currentUserId if provided, otherwise use first participant
            var creatorUserId = !string.IsNullOrEmpty(currentUserId) ? currentUserId : participants.First();
            return await CreateChatAsync(createChatDto, creatorUserId);
        }

        public async Task<(Chat?, bool isNewChat)> GetOrCreateChatWithStatusAsync(List<string> participants, string chatType = "user_seller", string? currentUserId = null)
        {
            // Add current user to participants if provided and not already included
            if (!string.IsNullOrEmpty(currentUserId) && !participants.Contains(currentUserId))
            {
                participants = participants.Concat(new[] { currentUserId }).ToList();
            }

            // Sort participants to ensure consistent ordering
            var sortedParticipants = participants.OrderBy(p => p).ToList();

            // Try to find existing chat with these participants
            var query = _db.Collection("chats")
                .WhereEqualTo("chatType", chatType)
                .WhereEqualTo("isActive", true);

            var snapshot = await query.GetSnapshotAsync();

            foreach (var doc in snapshot.Documents)
            {
                var chat = doc.ConvertTo<Chat>();
                var sortedChatParticipants = chat.Participants.OrderBy(p => p).ToList();

                if (sortedChatParticipants.SequenceEqual(sortedParticipants))
                {
                    return (chat, false); // Existing chat found
                }
            }

            // Create new chat if none exists
            var createChatDto = new CreateChatDto
            {
                Participants = participants,
                ChatType = chatType
            };

            // Use currentUserId if provided, otherwise use first participant
            var creatorUserId = !string.IsNullOrEmpty(currentUserId) ? currentUserId : participants.First();
            var newChat = await CreateChatAsync(createChatDto, creatorUserId);
            return (newChat, true); // New chat created
        }

        public async Task<bool> AddParticipantAsync(string chatId, string userId)
        {
            var docRef = _db.Collection("chats").Document(chatId);

            return await _db.RunTransactionAsync(async transaction =>
            {
                var snapshot = await transaction.GetSnapshotAsync(docRef);
                if (!snapshot.Exists)
                    return false;

                var chat = snapshot.ConvertTo<Chat>();
                if (!chat.Participants.Contains(userId))
                {
                    chat.Participants.Add(userId);
                    chat.UnreadCounts[userId] = 0;
                    transaction.Update(docRef, "participants", chat.Participants);
                    transaction.Update(docRef, "unreadCounts", chat.UnreadCounts);
                }
                return true;
            });
        }

        public async Task<bool> RemoveParticipantAsync(string chatId, string userId)
        {
            var docRef = _db.Collection("chats").Document(chatId);

            return await _db.RunTransactionAsync(async transaction =>
            {
                var snapshot = await transaction.GetSnapshotAsync(docRef);
                if (!snapshot.Exists)
                    return false;

                var chat = snapshot.ConvertTo<Chat>();
                if (chat.Participants.Contains(userId))
                {
                    chat.Participants.Remove(userId);
                    chat.UnreadCounts.Remove(userId);
                    transaction.Update(docRef, "participants", chat.Participants);
                    transaction.Update(docRef, "unreadCounts", chat.UnreadCounts);
                }
                return true;
            });
        }

        public async Task<bool> UpdateLastMessageAsync(string chatId, string message, string senderId, DateTime timestamp)
        {
            var docRef = _db.Collection("chats").Document(chatId);

            var updates = new Dictionary<string, object>
            {
                { "lastMessage", message },
                { "lastMessageSender", senderId },
                { "lastMessageTime", timestamp }
            };

            await docRef.UpdateAsync(updates);
            return true;
        }

        public async Task<Message> SendMessageAsync(SendMessageDto sendMessageDto, string senderId, string senderName)
        {
            var message = new Message
            {
                MessageId = Guid.NewGuid().ToString(),
                ChatId = sendMessageDto.ChatId,
                SenderId = senderId,
                SenderName = senderName,
                Content = sendMessageDto.Content,
                MessageType = sendMessageDto.MessageType,
                Timestamp = DateTime.UtcNow,
                ReplyToMessageId = sendMessageDto.ReplyToMessageId
            };

            // Get chat to initialize read status for all participants
            var chat = await GetChatByIdAsync(sendMessageDto.ChatId);
            if (chat == null)
                throw new ArgumentException("Chat not found");

            // Initialize read status - mark as read for sender, unread for others
            foreach (var participant in chat.Participants)
            {
                message.IsRead[participant] = participant == senderId;
            }

            var docRef = _db.Collection("messages").Document(message.MessageId);
            await docRef.SetAsync(message);

            // Update chat's last message info and unread counts
            await _db.RunTransactionAsync(async transaction =>
            {
                var chatRef = _db.Collection("chats").Document(sendMessageDto.ChatId);
                var chatSnapshot = await transaction.GetSnapshotAsync(chatRef);

                if (chatSnapshot.Exists)
                {
                    var chatData = chatSnapshot.ConvertTo<Chat>();

                    // Update unread counts for all participants except sender
                    foreach (var participant in chatData.Participants)
                    {
                        if (participant != senderId)
                        {
                            chatData.UnreadCounts[participant] = (chatData.UnreadCounts.GetValueOrDefault(participant, 0)) + 1;
                        }
                    }

                    var updates = new Dictionary<string, object>
                    {
                        { "lastMessage", message.Content },
                        { "lastMessageSender", senderId },
                        { "lastMessageTime", message.Timestamp },
                        { "unreadCounts", chatData.UnreadCounts }
                    };

                    transaction.Update(chatRef, updates);
                }
            });

            return message;
        }

        public async Task<List<Message>> GetChatMessagesAsync(string chatId, int limit = 50, string? cursor = null)
        {
            var query = _db.Collection("messages")
                .WhereEqualTo("chatId", chatId)
                .OrderByDescending("timestamp")
                .Limit(limit);

            if (!string.IsNullOrEmpty(cursor))
            {
                // In a real implementation, you'd decode the cursor and use StartAfter
                // For now, we'll implement basic pagination
            }

            var snapshot = await query.GetSnapshotAsync();
            var messages = snapshot.Documents.Select(doc => doc.ConvertTo<Message>()).ToList();

            // Return in chronological order (oldest first)
            return messages.OrderBy(m => m.Timestamp).ToList();
        }

        public async Task<bool> MarkMessageAsReadAsync(string messageId, string userId)
        {
            var docRef = _db.Collection("messages").Document(messageId);

            return await _db.RunTransactionAsync(async transaction =>
            {
                var snapshot = await transaction.GetSnapshotAsync(docRef);
                if (!snapshot.Exists)
                    return false;

                var message = snapshot.ConvertTo<Message>();
                message.IsRead[userId] = true;

                transaction.Update(docRef, "isRead", message.IsRead);
                return true;
            });
        }

        public async Task<bool> MarkChatAsReadAsync(string chatId, string userId)
        {
            // Mark all unread messages in the chat as read
            var query = _db.Collection("messages")
                .WhereEqualTo("chatId", chatId);

            var snapshot = await query.GetSnapshotAsync();

            var batch = _db.StartBatch();
            bool hasUpdates = false;

            foreach (var doc in snapshot.Documents)
            {
                var message = doc.ConvertTo<Message>();
                if (!message.IsRead.GetValueOrDefault(userId, false))
                {
                    message.IsRead[userId] = true;
                    batch.Update(doc.Reference, "isRead", message.IsRead);
                    hasUpdates = true;
                }
            }

            if (hasUpdates)
            {
                await batch.CommitAsync();
            }

            // Reset unread count for this user in the chat
            var chatRef = _db.Collection("chats").Document(chatId);
            await _db.RunTransactionAsync(async transaction =>
            {
                var chatSnapshot = await transaction.GetSnapshotAsync(chatRef);
                if (chatSnapshot.Exists)
                {
                    var chat = chatSnapshot.ConvertTo<Chat>();
                    chat.UnreadCounts[userId] = 0;
                    transaction.Update(chatRef, "unreadCounts", chat.UnreadCounts);
                }
            });

            return true;
        }

        public async Task<Message?> GetMessageByIdAsync(string messageId)
        {
            var docRef = _db.Collection("messages").Document(messageId);
            var snapshot = await docRef.GetSnapshotAsync();

            if (!snapshot.Exists)
                return null;

            return snapshot.ConvertTo<Message>();
        }

        public async Task<bool> DeleteMessageAsync(string messageId, string userId)
        {
            var docRef = _db.Collection("messages").Document(messageId);
            var snapshot = await docRef.GetSnapshotAsync();

            if (!snapshot.Exists)
                return false;

            var message = snapshot.ConvertTo<Message>();

            // Only allow deletion by the sender
            if (message.SenderId != userId)
                return false;

            await docRef.DeleteAsync();
            return true;
        }

        public async Task<bool> EditMessageAsync(string messageId, string newContent, string userId)
        {
            var docRef = _db.Collection("messages").Document(messageId);

            return await _db.RunTransactionAsync(async transaction =>
            {
                var snapshot = await transaction.GetSnapshotAsync(docRef);
                if (!snapshot.Exists)
                    return false;

                var message = snapshot.ConvertTo<Message>();

                // Only allow editing by the sender
                if (message.SenderId != userId)
                    return false;

                var updates = new Dictionary<string, object>
                {
                    { "content", newContent },
                    { "editedAt", DateTime.UtcNow }
                };

                transaction.Update(docRef, updates);
                return true;
            });
        }

        public async Task<int> GetUnreadCountAsync(string chatId, string userId)
        {
            var chat = await GetChatByIdAsync(chatId);
            return chat?.UnreadCounts.GetValueOrDefault(userId, 0) ?? 0;
        }

        public async Task<int> GetTotalUnreadCountAsync(string userId)
        {
            var chats = await GetUserChatsAsync(userId);
            return chats.Sum(chat => chat.UnreadCounts.GetValueOrDefault(userId, 0));
        }

        public async Task<bool> IsChatParticipantAsync(string chatId, string userId)
        {
            var chat = await GetChatByIdAsync(chatId);
            return chat?.Participants.Contains(userId) ?? false;
        }
    }
}
