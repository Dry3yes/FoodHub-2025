import './Login-Regis.css';
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { registerUser } from '../services/api';

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
        setFormData(prev => ({
            ...prev,
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

        if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
            setError('All fields are required');
            return;
        }

        if (!validateEmail(formData.email)) {
            setError('Please enter a valid email address');
            return;
        }

        if (formData.password.length < 5) {
            setError('Password must be at least 5 characters long');
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        try {
            const { confirmPassword, ...userData } = formData;
            userData.createdAt = new Date().toISOString();
            
            const response = await registerUser(userData);
            console.log('Registration successful:', response);
            
            navigate('/login');
        } catch (error) {
            setError(error.message || 'Registration failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className='RegisterPage_Left'>
            <img src="/Images/MainLogo.png" alt='Main Logo' className='MainLogo' />
            <form 
                style={{ width: "50%", display: "flex", flexDirection: "column" }} 
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
                    <button type="submit" className='SubmitButton' disabled={loading}>
                    {loading ? 'Registering...' : 'Sign Up'}</button>
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
