import './Login-Regis.css';
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const RegisterPage = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const validateEmail = (email) => {
        // Simple regex for email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setError('');

        // Check for empty fields
        if (!name || !email || !password || !confirmPassword) {
            setError('All fields are required');
            return;
        }

        // Validate email format
        if (!validateEmail(email)) {
            setError('Please enter a valid email address');
            return;
        }

        // Check password length
        if (password.length < 5) {
            setError('Password must be at least 5 characters long');
            return;
        }

        // Check if passwords match
        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        // If all validations pass, you can proceed (e.g., API call to register)
        console.log('Registration successful', { name, email });
        
        // Navigate to homepage or login page after successful registration
        navigate('/HomePage');
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
                        placeholder='Enter Your Name' 
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />
                </div>
                
                <label>Email</label>
                <div>
                    <input 
                        type="email" 
                        placeholder='Enter Your Email Address' 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                </div>
                
                <label>Password</label>
                <div>
                    <input 
                        type="password" 
                        placeholder='Enter Your Password' 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                </div>
                
                <label>Confirm Password</label>
                <div>
                    <input 
                        type="password" 
                        placeholder='Confirm Your Password' 
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                </div>
                
                {error && <div className="error-message" style={{color: 'red', margin: '10px 0'}}>{error}</div>}
                
                <div>
                    <button type="submit" className='SubmitButton'>Sign Up</button>
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
