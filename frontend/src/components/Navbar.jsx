import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Navbar.css';
import 'bootstrap/dist/css/bootstrap.min.css';

function Navbar({ username, logout }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/Home');
  };

  return (
    <nav className='nav'>
      <h1 className='logo'>STOCK SAGE AI</h1>
      <ul className='ul'>
        <li className='addpad'><Link to="/Home">Home</Link></li>
        <li className='addpad'><Link to="/Explore">Explore</Link></li>
        <li className='addpad'><Link to="/Watchlist">Watchlist</Link></li>
        <li className='addpad'><Link to="/Portfolio">Portfolio</Link></li>
        {username ? (
          <li>
            <button onClick={handleLogout} className='btn btn-warning'>Logout</button>
          </li>
        ) : null}
      </ul>
      {username ? (
        <p>Welcome, <span className='username'>{username}</span></p>
      ) : (
        <p className='jass'>Investing Made Easy</p>
      )}
    </nav>
  );
}

export default Navbar;
