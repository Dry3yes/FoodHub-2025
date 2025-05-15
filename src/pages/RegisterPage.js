import "../styles/Login-Regis.css"
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { registerUser } from '../services/Api';

const RegisterPage = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: 'User'
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: value
        }));
    };

    const validateEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        const { name, email, password, confirmPassword } = formData;
        if (!name || !email || !password || !confirmPassword) {
            setError('All fields are required');
            setLoading(false);
            return;
        }
        if (!validateEmail(email)) {
            setError('Please enter a valid email address');
            setLoading(false);
            return;
        }
        if (password.length < 5) {
            setError('Password must be at least 5 characters long');
            setLoading(false);
            return;
        }
        if (password !== confirmPassword) {
            setError('Passwords do not match');
            setLoading(false);
            return;
        }
        try {
            const { confirmPassword, ...userData } = formData;
            userData.createdAt = new Date().toISOString();
            await registerUser(userData);
        } catch (error) {
            setError('Registration failed. Please try again later.');
            return;
        } finally {
            setLoading(false);
        }
        navigate('/login');
    };

    return (
        <div className='RegisterPage_Left'>
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
            <form 
                className='RegisterForm'
                onSubmit={handleSubmit}
            >
                <h3>Welcome Aboard, Fubbies</h3>
                <h6>Fill in your details to continue your journey with us!</h6>
                
                <label>Name</label>
                <div>
                    <input 
                        type="text" 
                        name="name"
                        placeholder='Enter Your Name' 
                        value={formData.name}
                        onChange={handleChange}
                    />
                </div>
                
                <label>Email</label>
                <div>
                    <input 
                        type="email" 
                        name="email"
                        placeholder='Enter Your Email Address' 
                        value={formData.email}
                        onChange={handleChange}
                    />
                </div>
                
                <label>Password</label>
                <div>
                    <input 
                        type="password" 
                        name="password"
                        placeholder='Enter Your Password' 
                        value={formData.password}
                        onChange={handleChange}
                    />
                </div>
                
                <label>Confirm Password</label>
                <div>
                    <input 
                        type="password" 
                        name="confirmPassword"
                        placeholder='Confirm Your Password' 
                        value={formData.confirmPassword}
                        onChange={handleChange}
                    />
                </div>
                
                {error && <div className="error-message" style={{color: 'red', margin: '10px 0'}}>{error}</div>}
                
                <div>
                    <button type="submit" className='SubmitButton' disabled={loading}>{loading ? 'Signing Up...' : 'Sign Up'}</button>
                </div>
                
                <div className='AlreadyHaveAccount'>
                    <label>Already have an account? </label>
                    <Link to="/login">Log In Here</Link>
                </div>
            </form>
        </div>
    );
};

export default RegisterPage;
