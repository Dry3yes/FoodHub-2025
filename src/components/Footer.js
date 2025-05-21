
import "../styles/Footer.css"
import logo from "../assets/logo.png"


function Footer() {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-section">
          <div className="footer-logo">
            <img src={logo || "/FW.png"} alt="FoodHub" className="logo" />
            <h3>FoodHub</h3>
          </div>
          <p>Delivering happiness to your doorstep</p>
        </div>

        <div className="footer-section">
          <h3>Company</h3>
          <ul>
            <li>
              <a href="#about">About Us</a>
            </li>
            <li>
              <a href="#careers">Careers</a>
            </li>
            <li>
              <a href="#partners">Partner With Us</a>
            </li>
            <li>
              <a href="#blog">Blog</a>
            </li>
          </ul>
        </div>

        <div className="footer-section">
          <h3>Contact</h3>
          <ul>
            <li>Help & Support</li>
            <li>Partner With Us</li>
            <li>Ride With Us</li>
          </ul>
        </div>

        <div className="footer-section">
          <h3>Legal</h3>
          <ul>
            <li>
              <a href="#terms">Terms & Conditions</a>
            </li>
            <li>
              <a href="#privacy">Privacy Policy</a>
            </li>
            <li>
              <a href="#cookies">Cookie Policy</a>
            </li>
          </ul>
        </div>

        <div className="footer-section">
          <h3>Scan & Download Our App</h3>
          <div className="qr-code">
            {/* <img src="/placeholder.svg?height=100&width=100" alt="QR Code" /> */}
            <img src="/QRcode.png" alt="QR code"></img>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <p>&copy; {new Date().getFullYear()} FoodHub. All rights reserved.</p>
        <div className="social-icons">
          {/* <a href="#facebook" className="social-icon">
             <img src="/F.png" alt="X" />
          </a> */}
          
          <a href="#twitter" className="social-icon">
             <img src="/X.webp" alt="X" />
          </a>
          <a href="#instagram" className="social-icon">
          <img src="/I.webp" alt="X" />
          </a>
        </div>
      </div>
    </footer>
  )
}

export default Footer
