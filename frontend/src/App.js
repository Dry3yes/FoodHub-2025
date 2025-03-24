import './App.css';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './Login-Register/LoginPage';
import RegisterPage from './Login-Register/RegisterPage';
import LoginRegis_RightSide from './Login-Register/LoginRegis_RightSide';
import Header from './Header/Header';
import HomePage from './HomePage/HomePage';

function App() {
  return (
    <BrowserRouter>
      <div className="App">
        <Routes>
          <Route path="/" element={<Navigate to="/HomePage" />} />
          <Route path="/login" element={
            <div className="Login-Register">
              <LoginPage />
              <LoginRegis_RightSide />
            </div>
          } />
          <Route path="/register" element={
            <div className="Login-Register">
              <RegisterPage />
              <LoginRegis_RightSide />
            </div>
          } />
          <Route path="/HomePage" element={
            <div>
              <Header />
              <HomePage />
            </div>
          } />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
