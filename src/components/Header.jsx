import { Link } from "react-router-dom";
import logo from "../assets/logo.png";
import "../Header.css";

function Header() {
  return (
    <div className="header">
      <Link to="/">
        <img
          src={logo}
          alt="SafeQR"
          className="header-logo"
        />
      </Link>
    </div>
  );
}

export default Header;