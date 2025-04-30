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
            await _firestoreDb.Collection("Menus").Document(menu.ItemId.ToString()).SetAsync(menu);
            return menu;
        }

        public async Task<bool> DeleteMenuAsync(int id)
        {
            var menuRef = _firestoreDb.Collection("Menus").Document(id.ToString());
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

        public async Task<Menu?> GetMenuByIdAsync(int id)
        {
            var menuRef = _firestoreDb.Collection("Menus").Document(id.ToString());
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

        public async Task<Menu> UpdateMenuAsync(Menu menu)
        {
            var menuRef = _firestoreDb.Collection("Menus").Document(menu.ItemId.ToString());
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