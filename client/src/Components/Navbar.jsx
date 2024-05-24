import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../CSS/Navbar.css';

const Navbar = () => {
  const [loggedIn, setLoggedIn] = useState(false);
  const [userName, setUserName] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  

  useEffect(() => {
    const token = localStorage.getItem('userToken');
    if (token) {
      const decodedToken = parseJwt(token);
      setUserName(decodedToken.user_name);
      setLoggedIn(true);
      setIsAdmin(decodedToken.user_email === 'admin@admin.com');
    }
  }, []);

  const parseJwt = (token) => {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => `%${('00' + c.charCodeAt(0).toString(16)).slice(-2)}`)
        .join('')
    );
    return JSON.parse(jsonPayload);
  };

  const handleLogout = () => {
    localStorage.removeItem('userToken');
    setLoggedIn(false);
    setUserName('');
    setIsAdmin(false);
  };

  return (
    <nav>
      <ul className="left-side">
        <li>
          <Link to="/">Nepflicks</Link>
        </li>
        <li>
          <Link to="/">Home</Link>
        </li>
        <li>
          <Link to="/search">Search</Link>
        </li>
        {isAdmin && (
          <li>
            <Link to="/admin">Admin</Link>
          </li>
        )}
        <li>
          <Link to="/movies">Movies</Link>
        </li>
      </ul>
      <ul className="right-side">
        {loggedIn ? (
          <>
            <li>
              <Link to="/userprofile">{userName}</Link>
            </li>
            <li>
              <button onClick={handleLogout}>Logout</button>
            </li>
          </>
        ) : (
          <li>
            <Link to="/login">Login</Link>
          </li>
        )}
      </ul>
    </nav>
  );
};

export default Navbar;
