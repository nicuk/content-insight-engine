import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Navbar.css';

const Navbar: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();

  // This would normally check a JWT token in localStorage
  // For now, we'll just simulate login state
  const handleLogout = () => {
    setIsLoggedIn(false);
    navigate('/');
  };

  return (
    <nav className="navbar">
      <div className="container navbar-container">
        <Link to="/" className="navbar-logo">
          Content Insight Engine
        </Link>
        <ul className="navbar-menu">
          <li className="navbar-item">
            <Link to="/" className="navbar-link">Home</Link>
          </li>
          <li className="navbar-item">
            <Link to="/submit" className="navbar-link">Analyze Content</Link>
          </li>
          {isLoggedIn ? (
            <>
              <li className="navbar-item">
                <button onClick={handleLogout} className="navbar-link navbar-button">
                  Logout
                </button>
              </li>
            </>
          ) : (
            <>
              <li className="navbar-item">
                <Link to="/login" className="navbar-link">Login</Link>
              </li>
              <li className="navbar-item">
                <Link to="/register" className="navbar-link">Register</Link>
              </li>
            </>
          )}
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
