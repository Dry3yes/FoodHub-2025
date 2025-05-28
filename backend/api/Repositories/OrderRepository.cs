using api.Interfaces;
using api.Models;
using Google.Cloud.Firestore;
using Microsoft.Extensions.Logging;

namespace api.Repositories
{
    public class OrderRepository : IOrderRepository
    {
        private readonly FirestoreDb _firestoreDb;
        private readonly ILogger<OrderRepository> _logger;
        private const string COLLECTION_NAME = "Orders";

        public OrderRepository(FirestoreDb firestoreDb, ILogger<OrderRepository> logger)
        {
            _firestoreDb = firestoreDb;
            _logger = logger;
        }

        public async Task<Order?> GetOrderByIdAsync(string orderId)
        {
            try
            {
                DocumentReference docRef = _firestoreDb.Collection(COLLECTION_NAME).Document(orderId);
                DocumentSnapshot snapshot = await docRef.GetSnapshotAsync();

                if (snapshot.Exists)
                {
                    return snapshot.ConvertTo<Order>();
                }

                return null;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting order {OrderId}", orderId);
                throw;
            }
        }

        public async Task<List<Order>> GetOrdersByUserIdAsync(string userId)
        {
            try
            {
                Query query = _firestoreDb.Collection(COLLECTION_NAME)
                    .WhereEqualTo("UserId", userId)
                    .OrderByDescending("CreatedAt");

                QuerySnapshot querySnapshot = await query.GetSnapshotAsync();

                var orders = new List<Order>();
                foreach (DocumentSnapshot documentSnapshot in querySnapshot.Documents)
                {
                    if (documentSnapshot.Exists)
                    {
                        var order = documentSnapshot.ConvertTo<Order>();
                        order.Id = documentSnapshot.Id;
                        orders.Add(order);
                    }
                }

                return orders;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting orders for user {UserId}", userId);
                throw;
            }
        }

        public async Task<List<Order>> GetOrdersBySellerIdAsync(string sellerId)
        {
            try
            {
                Query query = _firestoreDb.Collection(COLLECTION_NAME)
                    .WhereEqualTo("SellerId", sellerId)
                    .OrderByDescending("CreatedAt");

                QuerySnapshot querySnapshot = await query.GetSnapshotAsync();

                var orders = new List<Order>();
                foreach (DocumentSnapshot documentSnapshot in querySnapshot.Documents)
                {
                    if (documentSnapshot.Exists)
                    {
                        var order = documentSnapshot.ConvertTo<Order>();
                        order.Id = documentSnapshot.Id;
                        orders.Add(order);
                    }
                }

                return orders;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting orders for seller {SellerId}", sellerId);
                throw;
            }
        }

        public async Task<Order> CreateOrderAsync(Order order)
        {
            try
            {
                // Set timestamps
                order.CreatedAt = DateTime.UtcNow;
                order.UpdatedAt = DateTime.UtcNow;

                // Update total with fee service
                order.Total += 2000;

                // Add document to Firestore
                DocumentReference docRef = _firestoreDb.Collection(COLLECTION_NAME).Document();
                await docRef.SetAsync(order);

                // Update the order with the document ID
                order.Id = docRef.Id;

                return order;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating order for user {UserId}", order.UserId);
                throw;
            }
        }

        public async Task<Order?> UpdateOrderStatusAsync(string orderId, OrderStatus status)
        {
            try
            {
                DocumentReference docRef = _firestoreDb.Collection(COLLECTION_NAME).Document(orderId);
                DocumentSnapshot snapshot = await docRef.GetSnapshotAsync();

                if (!snapshot.Exists)
                {
                    return null;
                }

                var order = snapshot.ConvertTo<Order>();
                order.Id = snapshot.Id;
                order.Status = status;
                order.UpdatedAt = DateTime.UtcNow;

                await docRef.UpdateAsync(new Dictionary<string, object>
                {
                    { "Status", status },
                    { "UpdatedAt", DateTime.UtcNow }
                });

                return order;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating order status {OrderId}", orderId);
                throw;
            }
        }

        public async Task<Order?> UpdateOrderPaymentProofAsync(string orderId, string paymentProofUrl)
        {
            try
            {
                DocumentReference docRef = _firestoreDb.Collection(COLLECTION_NAME).Document(orderId);
                DocumentSnapshot snapshot = await docRef.GetSnapshotAsync();

                if (!snapshot.Exists)
                {
                    return null;
                }

                var order = snapshot.ConvertTo<Order>();
                order.Id = snapshot.Id;
                order.PaymentProofUrl = paymentProofUrl;
                order.UpdatedAt = DateTime.UtcNow;

                await docRef.UpdateAsync(new Dictionary<string, object>
                {
                    { "PaymentProofUrl", paymentProofUrl },
                    { "UpdatedAt", DateTime.UtcNow }
                });

                return order;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating order payment proof {OrderId}", orderId);
                throw;
            }
        }

        public async Task<bool> DeleteOrderAsync(string orderId)
        {
            try
            {
                DocumentReference docRef = _firestoreDb.Collection(COLLECTION_NAME).Document(orderId);
                DocumentSnapshot snapshot = await docRef.GetSnapshotAsync();

                if (!snapshot.Exists)
                {
                    return false;
                }

                await docRef.DeleteAsync();
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting order {OrderId}", orderId);
                throw;
            }
        }
    }
}
