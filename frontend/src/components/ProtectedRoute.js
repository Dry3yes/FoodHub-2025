import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, requiredRole }) => {
  const token = localStorage.getItem('token');
  const userString = localStorage.getItem('user');
  
  // Check if user is logged in
  if (!token || !userString) {
    return <Navigate to="/login" replace />;
  }
  
  try {
    const user = JSON.parse(userString);
    
    // Check if user has the required role
    if (requiredRole && user.role !== requiredRole) {
      // Redirect based on their actual role
      if (user.role === 'Seller') {
        return <Navigate to="/seller" replace />;
      } else if (user.role === 'User') {
        return <Navigate to="/" replace />;
      } else {
        return <Navigate to="/login" replace />;
      }
    }
    
    // User has correct role, render the protected component
    return children;
  } catch (error) {
    console.error('Error parsing user data:', error);
    return <Navigate to="/login" replace />;
  }
};

export default ProtectedRoute;
