using Firebase.Auth;

namespace api.Services
{
    public class FirebaseAuthService
    {
        private readonly FirebaseAuthProvider _authProvider;
        public FirebaseAuthService()
        {
            _authProvider = new FirebaseAuthProvider(new FirebaseConfig("AIzaSyDKGpHiqyMbMyO2yv8nMZC3tviY7-NvulM"));
        }

        public async Task<string> RegisterUserAsync(string email, string password)
        {
            var auth = await _authProvider.CreateUserWithEmailAndPasswordAsync(email, password);
            return auth.FirebaseToken;
        }

        public async Task<string> LoginUserAsync(string email, string password)
        {
            var auth = await _authProvider.SignInWithEmailAndPasswordAsync(email, password);
            return auth.FirebaseToken;
        }
    }
}