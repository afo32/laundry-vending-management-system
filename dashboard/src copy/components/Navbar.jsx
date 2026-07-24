import { Link, useNavigate } from "react-router-dom";

export default function Navbar() {
  const navigate = useNavigate();

  function logout() {
    localStorage.removeItem("token");
    navigate("/login");
  }

  return (
    <nav className="navbar navbar-dark bg-dark px-3">
      <Link to="/dashboard" className="navbar-brand">
        Dashboard
      </Link>

      <button className="btn btn-outline-light" onClick={logout}>
        Logout
      </button>
    </nav>
  );
}
