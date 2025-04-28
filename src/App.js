import './App.css';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './Login-Register/LoginPage';
import RegisterPage from './Login-Register/RegisterPage';
import LoginRegis_RightSide from './Login-Register/LoginRegis_RightSide';
import Header from './Header/Header';
import HomePage from './HomePage/HomePage';
import Footer from './Footer/Footer';
import AboutUs from './AboutuUsPage/Aboutus';
import Menu from './FindStorePage/FindStorePage';
import Settings from './SettingsPage/Settings'; // Import the new combined Settings component
import StorePage from './StorePage/StorePage';

function App() {
  return (
    <BrowserRouter>
      <div className="App">
        <Routes>
          <Route path="/" element={<Navigate to="/HomePage" />} />
          <Route path="/HomePage" element={
            <div className="page-container">
              <Header />
              <div className="content-container">
                <HomePage />
              </div>
              <Footer />
            </div>
          } />
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
          <Route path="/AboutUs" element={
            <div className="page-container">
              <Header />
              <div className="content-container">
                <AboutUs />
              </div>
              <Footer />
            </div>
          } />
          <Route path="/FindStore" element={
            <div className="page-container">
              <Header />
              <div className="content-container">
                <Menu />
              </div>
              <Footer />
            </div>
          } />
          
          {/* Both settings routes now use the same component */}
          <Route path="/settings/user" element={
            <div className="page-container">
              <Header />
              <div className="content-container">
                <Settings />
              </div>
              <Footer />
            </div>
          } />
          <Route path="/settings/seller" element={
            <div className="page-container">
              <Header />
              <div className="content-container">
                <Settings />
              </div>
              <Footer />
            </div>
          } />
          <Route path="/StorePage" element={
            <div className="page-container">
              <Header />
              <div className="content-container">
                <StorePage />
              </div>
              <Footer />
            </div>
          } />

          {/* Default settings route */}
          <Route path="/settings" element={<Navigate to="/settings/user" />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
