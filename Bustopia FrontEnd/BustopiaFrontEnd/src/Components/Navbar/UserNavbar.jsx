import { Link } from "react-router-dom";
import assets from "../../assets/assets";
import "./Navbar.css";

export function UserNavbar({name}) {
  return (
    <div
      className="d-flex flex-column bg-dark text-white vh-100 p-3"
      style={{ width: "250px", position: "fixed" }}
    >
      {/* Logo + Title */}
      <Link
        to="/"
        className="mb-1 ms-3 d-flex align-items-center justify-content-center text-white text-decoration-none"
      >
        <img src={assets.logo} alt="Logo" height="164" className="me-2" />
      </Link>

      <hr />

      {/* User Navigation */}
      <ul className="nav nav-pills flex-column mb-auto">
        <li>
          <Link to="/profile" className="nav-link text-white hover-effect">
            <i className="fas fa-user-circle me-2"></i> Profile
          </Link>
        </li>
        <li className="mt-1">
          <Link to="/logout" className="nav-link text-danger hover-effect">
            <i className="fas fa-sign-out-alt me-2"></i> Logout
          </Link>
        </li>
      </ul>

      {/* Footer */}
      <div className="text-white-50 small mt-auto">
        <hr className="text-white" />
        <p className="mb-1 text-center">Logged in as {name}</p>
      </div>
    </div>
  );
}
