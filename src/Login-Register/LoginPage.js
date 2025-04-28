import './Login-Regis.css';
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from 'semantic-ui-react';

const LoginPage = () => {
    const [email, setEmail] = React.useState('');
    const [password, setPassword] = React.useState('');
    const [error, setError] = React.useState('');
    const [loading, setLoading] = React.useState(false);
    const navigate = useNavigate();

    const handleSubmit = (e) => {
        e.preventDefault();
        setError('');
        
        if(!email || !password) {
            setError('Please fill in all fields');
            return;
        }
        // Email validation
        if (!email.includes('@binus.ac.id')) {
            setError('Email must contain @binus.ac.id');
            return;
        }
        
        // Password validation
        if (password.length < 5) {
            setError('Password must be at least 5 characters long');
            return;
        }
        
        // If validation passes, navigate to register
        navigate('/register');
    };

    return (
        <div className='LoginPage_Left'>
            <img src="/Images/MainLogo.png" alt='Main Logo' className='MainLogo' />
            <form width="50%" display="flex" flexDirection="column" className='LoginForm' onSubmit={handleSubmit}>
                <Link to="/HomePage">HomePage</Link>
                <h3>Welcome Back, Fubbies</h3>
                <h6>Filll in your details to continue your jouney with us!</h6>
                <div>
                    <button className='GoogleButton' type="button">
                        <img src="/Images/GoogleLogo.png" alt='Google' className='GoogleLogo'></img>
                        <h5>Continue with Google</h5>
                    </button>
                </div>
                <div className='separator'> 
                    <span>or</span>
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
                    <Button className='SubmitButton' type="submit">
                        Submit
                    </Button>
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
