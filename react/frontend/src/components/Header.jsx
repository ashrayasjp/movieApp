import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useUser } from "./UserContext";

function Header() {
  const { user, logout } = useUser();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/home");
  };

  const handleLinkClick = (resetEventName, path) => {
    window.dispatchEvent(new CustomEvent(resetEventName));
    if (window.location.pathname === path) window.location.href = path;
  };

  return (
    <div className="header">
      <span className="logo">
        <h1>Absolute Cinema</h1>
      </span>

      <ul className="nav-links">
        <li>
          <Link to="/home" onClick={() => handleLinkClick("resetHomeSearch", "/home")}>
            Home
          </Link>
        </li>

        {user ? (
          <>
            <li>
              <Link to="/diary" onClick={() => handleLinkClick("resetDiarySearch", "/diary")}>
                Diary
              </Link>
            </li>
            <li>
              <Link to="/watchlist" onClick={() => handleLinkClick("resetWatchlistSearch", "/watchlist")}>
                Watchlist
              </Link>
            </li>
            <li>
              <span onClick={handleLogout} style={{ cursor: "pointer" , fontSize:'20px' }}>
                Logout
              </span>
            </li>
          </>
        ) : (
          <li>
            <Link to="/login">Login</Link>
          </li>
        )}
      </ul>
    </div>
  );
}

export default Header;
