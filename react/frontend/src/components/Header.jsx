import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

function Header() {
  const [isLoggedIn, setIsLoggedIn] = useState(
    localStorage.getItem("username") !== null
  );

  const navigate = useNavigate();

  // Listen for login/logout changes 
  useEffect(() => {
    const handleStorageChange = () => {
      setIsLoggedIn(localStorage.getItem("username") !== null);
    };
    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsLoggedIn(localStorage.getItem("username") !== null);
    }, 100);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = async () => {
    try {
      await axios.post(
        "http://localhost:8080/api/users/logout",
        {},
        { withCredentials: true }
      );
    } catch (err) {
      console.error("Logout API failed:", err);
    }

    localStorage.removeItem("username");
    window.dispatchEvent(new Event("userAuthChange"));
    setIsLoggedIn(false);
    navigate("/home");
  };

  // Function to handle link clicks and reset search
  const handleLinkClick = (event, resetEventName, path) => {
    window.dispatchEvent(new CustomEvent(resetEventName));
    if (window.location.pathname === path) {
      window.location.href = path; 
    }
  };

  return (
    <div className="header">
      <span className="logo">
        <h1>Absolute Cinema</h1>
      </span>

      <ul className="nav-links">
        <li>
          <Link
            to="/home"
            onClick={(e) => handleLinkClick(e, "resetHomeSearch", "/home")}
          >
            Home
          </Link>
        </li>

        {isLoggedIn ? (
          <>
            <li>
              <Link
                to="/diary"
                onClick={(e) => handleLinkClick(e, "resetDiarySearch", "/diary")}
              >
                Diary
              </Link>
            </li>
            <li>
              <Link
                to="/watchlist"
                onClick={(e) =>
                  handleLinkClick(e, "resetWatchlistSearch", "/watchlist")
                }
              >
                Watchlist
              </Link>
            </li>
            <li>
              <span
                onClick={handleLogout}
                className="nav-link"
                style={{ cursor: "pointer" }}
              >
                Logout
              </span>
            </li>
          </>
        ) : (
          <li>
            <Link to="/login"   
             onClick={() => {
              if (window.location.pathname === "/login") {
                window.location.href = "/login"; 
              }
            }}>Login</Link>
          </li>
        )}
      </ul>
    </div>
  );
}

export default Header;
