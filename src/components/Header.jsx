import { Link } from "react-router-dom";
import logo from "../assets/logo.png";
import "../css/Header.css";

function Header() {
  return (
    <div className="header">
      <Link to="/" className="header-link">
        <img
          src={logo}
          alt="SafeQR"
          className="header-logo"
        />
      </Link>
      <span className="header-wordmark">SAFE<span>QR</span></span>
    </div>
  );
}

export default Header;