using api.Interfaces;
using api.Models;
using Google.Cloud.Firestore;

namespace api.Repositories
{
    public class SellerApplicationRepository : ISellerApplicationRepository
    {
        private readonly FirestoreDb _firestoreDb;
        private readonly ILogger<SellerApplicationRepository> _logger;

        public SellerApplicationRepository(FirestoreDb firestoreDb, ILogger<SellerApplicationRepository> logger)
        {
            _firestoreDb = firestoreDb;
            _logger = logger;
        }

        public async Task<SellerApplication> CreateApplicationAsync(SellerApplication application)
        {
            try
            {
                application.ApplicationId = Guid.NewGuid().ToString();
                await _firestoreDb.Collection("SellerApplications")
                    .Document(application.ApplicationId)
                    .SetAsync(application);
                return application;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating seller application for user: {UserId}", application.UserId);
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

        public async Task<bool> UpdateApplicationAsync(SellerApplication application)
        {
            try
            {
                await _firestoreDb.Collection("SellerApplications")
                    .Document(application.ApplicationId)
                    .SetAsync(application, SetOptions.MergeAll);
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating seller application: {Id}", application.ApplicationId);
                throw;
            }
        }
    }
}