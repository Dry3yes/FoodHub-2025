using api.Interfaces;
using api.Models;
using Google.Cloud.Firestore;

namespace api.Repositories
{
    public class MenuRepository : IMenuRepository
    {
        private readonly FirestoreDb _firestoreDb;
        public MenuRepository(FirestoreDb firestoreDb)
        {
            _firestoreDb = firestoreDb;
        }

        public async Task<Menu> CreateMenuAsync(Menu menu)
        {
            var docRef = _firestoreDb.Collection("Menus").Document();
            menu.Id = docRef.Id;
            await docRef.SetAsync(menu);
            return menu;
        }

        public async Task<bool> DeleteMenuAsync(string id)
        {
            var menuRef = _firestoreDb.Collection("Menus").Document(id);
            var snapshot = await menuRef.GetSnapshotAsync();
            if (snapshot.Exists)
            {
                await menuRef.DeleteAsync();
                return true;
            }
            return false;
        }

        public async Task<IEnumerable<Menu>> GetAllMenusAsync()
        {
            var snapshot = await _firestoreDb.Collection("Menus").GetSnapshotAsync();
            return snapshot.Documents
                .Where(u => u.Exists && u.Id != "init")
                .Select(u => u.ConvertTo<Menu>())
                .ToList();
        }

        public async Task<Menu?> GetMenuByIdAsync(string id)
        {
            var menuRef = _firestoreDb.Collection("Menus").Document(id);
            var snapshot = await menuRef.GetSnapshotAsync();
            if (snapshot.Exists)
            {
                return snapshot.ConvertTo<Menu>();
            }
            return null;
        }

        public async Task<IEnumerable<Menu>> GetMenusByCategoryAsync(string category)
        {
            var query = _firestoreDb.Collection("Menus").WhereEqualTo("Category", category);
            var snapshot = await query.GetSnapshotAsync();
            return snapshot.Documents.Select(doc => doc.ConvertTo<Menu>()).ToList();
        }

        public async Task<IEnumerable<Menu>> GetMenusBySellerIdAsync(string sellerId)
        {
            var query = _firestoreDb.Collection("Menus").WhereEqualTo("SellerId", sellerId);
            var snapshot = await query.GetSnapshotAsync();
            return snapshot.Documents.Select(doc => doc.ConvertTo<Menu>()).ToList();
        }

        public async Task<IEnumerable<Menu>> SearchMenusByNameAsync(string query)
        {
            // Get all menus and filter by item name containing the search query
            var allMenusSnapshot = await _firestoreDb.Collection("Menus").GetSnapshotAsync();
            var allMenus = allMenusSnapshot.Documents
                .Where(u => u.Exists && u.Id != "init")
                .Select(u => u.ConvertTo<Menu>())
                .ToList();

            // Filter menus where ItemName contains the search query (case-insensitive)
            return allMenus.Where(menu =>
                menu.ItemName.Contains(query, StringComparison.OrdinalIgnoreCase))
                .ToList();
        }

        public async Task<Menu> UpdateMenuAsync(Menu menu)
        {
            var menuRef = _firestoreDb.Collection("Menus").Document(menu.Id);
            var snapshot = await menuRef.GetSnapshotAsync();
            if (snapshot.Exists)
            {
                await menuRef.SetAsync(menu, SetOptions.MergeAll);
                return menu;
            }
            throw new Exception("Menu not found");
        }
    }
}