using api.Interfaces;
using api.Models;
using Google.Cloud.Firestore;

namespace api.Repositories
{
    public class SellerRepository : ISellerRepository
    {
        private readonly FirestoreDb _firestoreDb;
        private readonly ILogger<SellerRepository> _logger;

        public SellerRepository(FirestoreDb firestoreDb, ILogger<SellerRepository> logger)
        {
            _firestoreDb = firestoreDb;
            _logger = logger;
        }

        public async Task<SellerApplication> CreateApplicationAsync(SellerApplication seller)
        {
            try
            {
                seller.ApplicationId = Guid.NewGuid().ToString();
                await _firestoreDb.Collection("SellerApplications")
                    .Document(seller.ApplicationId)
                    .SetAsync(seller);
                return seller;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating seller application for user: {UserId}", seller.UserId);
                throw;
            }
        }

        public async Task<Seller> CreateAsync(Seller seller)
        {
            try
            {
                seller.SellerId = DateTime.UtcNow.Ticks.ToString() + "-" + Guid.NewGuid().ToString("N").Substring(0, 8);
                await _firestoreDb.Collection("Sellers")
                    .Document(seller.SellerId)
                    .SetAsync(seller);
                return seller;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating seller: {UserId}", seller.UserId);
                throw;
            }
        }

        public async Task<SellerApplication?> GetApplicationByIdAsync(string id)
        {
            try
            {
                var snapshot = await _firestoreDb.Collection("SellerApplications")
                    .Document(id)
                    .GetSnapshotAsync();
                return snapshot.Exists ? snapshot.ConvertTo<SellerApplication>() : null;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting seller application: {Id}", id);
                throw;
            }
        }

        public async Task<SellerApplication?> GetApplicationByUserIdAsync(string userId)
        {
            try
            {
                var query = _firestoreDb.Collection("SellerApplications")
                    .WhereEqualTo("UserId", userId);
                var snapshot = await query.GetSnapshotAsync();
                return snapshot.Documents.FirstOrDefault()?.ConvertTo<SellerApplication>();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting seller application for user: {UserId}", userId);
                throw;
            }
        }

        public async Task<IEnumerable<SellerApplication>> GetAllApplicationsAsync(string status = "")
        {
            try
            {
                Query query = _firestoreDb.Collection("SellerApplications");
                if (!string.IsNullOrEmpty(status))
                {
                    query = query.WhereEqualTo("Status", status);
                }
                var snapshot = await query.GetSnapshotAsync();
                return snapshot.Documents.Select(d => d.ConvertTo<SellerApplication>());
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting seller applications");
                throw;
            }
        }

        public async Task<bool> UpdateApplicationAsync(SellerApplication seller)
        {
            try
            {
                await _firestoreDb.Collection("SellerApplications")
                    .Document(seller.ApplicationId)
                    .SetAsync(seller, SetOptions.MergeAll);
                await DeleteFieldAsync("SellerApplications", seller.ApplicationId, "IdentificationUrl");
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating seller application: {Id}", seller.ApplicationId);
                throw;
            }
        }

        public async Task<bool> DeleteFieldAsync(string collection, string document, string field)
        {
            try
            {
                await _firestoreDb.Collection(collection).Document(document).UpdateAsync(new Dictionary<string, object>
                {
                    { field, FieldValue.Delete }
                });
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting field: {Collection} {Document} {Field}", collection, document, field);
                return false;
            }
        }

        public async Task<IEnumerable<Seller>> GetAllAsync()
        {
            try
            {
                var query = _firestoreDb.Collection("Sellers");
                var snapshot = await query.GetSnapshotAsync();
                return snapshot.Documents.Select(d => d.ConvertTo<Seller>());
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting sellers");
                throw;
            }
        }

        public async Task<IEnumerable<object>> GetStoreNamesAsync()
        {
            try
            {
                var query = _firestoreDb.Collection("Sellers");
                var snapshot = await query.GetSnapshotAsync();
                return snapshot.Documents.Select(d => new { 
                    sellerId = d.Id, 
                    storeName = d.GetValue<string>("StoreName"),
                    storeImageUrl = d.GetValue<string>("StoreImageUrl"),
                    description = d.GetValue<string>("Description") ?? string.Empty,
                    deliveryTimeEstimate = d.GetValue<string>("DeliveryTimeEstimate") ?? string.Empty
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting store names");
                throw;
            }
        }

        public async Task<bool> UpdateSellerAsync(Seller seller)
        {
            try
            {
                await _firestoreDb.Collection("Sellers")
                    .Document(seller.SellerId)
                    .SetAsync(seller, SetOptions.MergeAll);
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating seller: {Id}", seller.SellerId);
                throw;
            }
        }

        public async Task<object?> GetStoreByIdAsync(string sellerId)
        {
            try
            {
                _logger.LogInformation("Fetching store details for sellerId: {SellerId}", sellerId);
                var snapshot = await _firestoreDb.Collection("Sellers")
                    .Document(sellerId)
                    .GetSnapshotAsync();
                
                if (!snapshot.Exists)
                {
                    _logger.LogWarning("Store not found for sellerId: {SellerId}", sellerId);
                    return null;
                }

                var storeData = snapshot.ConvertTo<Seller>();
                
                return new 
                { 
                    sellerId = sellerId,
                    storeName = storeData.StoreName,
                    storeImageUrl = storeData.StoreImageUrl,
                    status = storeData.Status,
                    description = storeData.Description,
                    deliveryTimeEstimate = storeData.DeliveryTimeEstimate,
                    createdAt = storeData.CreatedAt
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching store details for sellerId: {SellerId}", sellerId);
                throw;
            }
        }

        public async Task<Seller?> GetSellerByUserIdAsync(string userId)
        {
            try
            {
                _logger.LogInformation("Fetching seller by userId: {UserId}", userId);
                var query = _firestoreDb.Collection("Sellers")
                    .WhereEqualTo("UserId", userId);
                var snapshot = await query.GetSnapshotAsync();
                
                var seller = snapshot.Documents.FirstOrDefault()?.ConvertTo<Seller>();
                if (seller == null)
                {
                    _logger.LogWarning("Seller not found for userId: {UserId}", userId);
                }
                
                return seller;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching seller for userId: {UserId}", userId);
                throw;
            }
        }
    }
}