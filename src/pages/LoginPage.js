import "../styles/Login-Regis.css"
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { loginUser } from '../services/Api';

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        if(!email || !password) {
            setError('Please fill in all fields');
            setLoading(false);
            return;
        }
        // Email validation
        if (!email.includes('@')) {
            setError('Email must contain @');
            setLoading(false);
            return;
        }
        // Password validation
        if (password.length < 5) {
            setError('Password must be at least 5 characters long');
            setLoading(false);
            return;
        }
        try {
            const response = await loginUser({ email, password });
            if (response && response.data) {
                localStorage.setItem('token', response.data.token);
                localStorage.setItem('refreshToken', response.data.refreshToken);
                localStorage.setItem('user', JSON.stringify(response.data.user));
                localStorage.setItem('expiresIn', response.data.expiresIn);
                
                // Store seller information if available
                if (response.data.seller) {
                    localStorage.setItem('sellerInfo', JSON.stringify(response.data.seller));
                }
                
                // Check if user is a seller and redirect accordingly
                const user = response.data.user;
                if (user && user.role === 'Seller') {
                    navigate('/seller');
                } else {
                    navigate('/');
                }
            } else {
                navigate('/');
            }
        } catch (err) {
            setError('Login failed. Please check your credentials.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className='LoginPage_Left'>
            <div className="MainLogo">
                <Link to="/" className="logo-link">
                <div className="logo">
                    <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="logo-icon"
                    >
                    <path d="M12 2L2 7l10 5 10-5-10-5z" />
                    <path d="M2 17l10 5 10-5" />
                    <path d="M2 12l10 5 10-5" />
                    </svg>
                </div>
                <span className="logo-text">FoodHub</span>
                </Link>
            </div>
            <form className='LoginForm' onSubmit={handleSubmit}>
                <h3>Welcome Back, Fubbies</h3>
                <h6>Fill in your details to continue your jouney with us!</h6>
                <div>
                    <button className='GoogleButton' type="button">
                        <img src="https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg" alt='Google' className='GoogleLogo'></img>
                        <h5>Continue with Google</h5>
                    </button>
                </div>
                <div className='separator'> 
                    <span>or</span>
                </div>
                <label>Email</label>
                <div>
                    <input 
                    type='email' 
                    id='Email'
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder='Enter Your Email Address'
                    />
                </div>
                <label>Password</label>
                <div>
                    <input
                        type='password'
                        id='Password'
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder='Enter Your Password'
                    />
                </div>
                {error && <div className="error-message" style={{color: 'red'}}>{error}</div>}
                <div>
                    <button className='SubmitButton' type="submit" disabled={loading}>
                        {loading ? 'Signing In...' : 'Submit'}
                    </button>
                </div>
                <div className='DontHaveAccount'>
                    <label>Dont have account? </label>
                    <Link to="/register">Sign Up Here</Link>
                </div>
            </form>
        </div>
    )
}
export default LoginPage;
