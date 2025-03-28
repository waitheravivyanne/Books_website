import React from 'react';
import { Link } from 'react-router-dom';

const Layout = ({ children }) => {
  const isLoggedIn = !!localStorage.getItem('access_token');

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    window.location.href = '/login';
  };

  return (
    <div className="app-container">
      <header>
        <h1>Book Access Website</h1>
        <nav>
          {isLoggedIn ? (
            <>
              <Link to="/books">Books</Link>
              <button onClick={handleLogout}>Logout</button>
            </>
          ) : (
            <>
              <Link to="/login">Login</Link>
              <Link to="/register">Register</Link>
            </>
          )}
        </nav>
      </header>
      <main>{children}</main>
    </div>
  );
};

export default Layout;