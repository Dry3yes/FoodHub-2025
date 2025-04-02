import './Login-Regis.css';
import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { loginUser } from '../services/api';

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const user = localStorage.getItem('user');
        if (user) {
            navigate('/HomePage');
        }
    }, [navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        
        if(!email || !password) {
            setError('Please fill in all fields');
            return;
        }

        if (!email.includes('@binus.ac.id')) {
            setError('Email must contain @binus.ac.id');
            return;
        }
        
        try {
            const response = await loginUser(email, password);
            console.log('Login successful:', response);
            
            localStorage.setItem('user', JSON.stringify({
                email: response.data.email,
                role: response.data.role,
                token: response.token
            }));

            navigate('/HomePage');
            
        } catch (error) {
            setError(error.message || 'Login failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className='LoginPage_Left'>
            <img src="/Images/MainLogo.png" alt='Main Logo' className='MainLogo' />
            <form width="50%" display="flex" flexdirection="column" className='LoginForm' onSubmit={handleSubmit}>
                <h3>Welcome Back, Fubbies</h3>
                <h6>Filll in your details to continue your jouney with us!</h6>
                <div>
                    <button className='GoogleButton' type="button">
                        <img src="/Images/GoogleLogo.png" alt='Google' className='GoogleLogo'></img>
                        <h5>Continue with Google</h5>
                    </button>
                </div>
                <label>Email</label>
                <div>
                    <input 
                    type='Email' 
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
                    <button type="submit" className='SubmitButton' disabled={loading}>
                    {loading ? 'Loging in...' : 'Log in'}</button>
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
