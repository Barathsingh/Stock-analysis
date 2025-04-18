// App.js
import React, { useState, useEffect } from 'react';
import { Routes, Route, BrowserRouter as Router, Navigate } from 'react-router-dom';
import './App.css';
import Explore from './Explore';
import Watchlist from './Watchlist';
import Portfolio from './Portfolio';
import Symboldetail from './Symboldetails';
import Home from './Home';
import Navbar from './components/Navbar'; // Import Navbar component
import Footer from './components/Footer';

function App() {
  const [username, setUsername] = useState(sessionStorage.getItem('username') || '');

  useEffect(() => {
    if (username) {
      sessionStorage.setItem('username', username);
    } else {
      sessionStorage.removeItem('username');
    }
  }, [username]);

  const handleLogout = () => {
    setUsername('');
  };

  return (
    <div className="app-container">
      <Navbar username={username} logout={handleLogout} />
      <main className="content">
        <Routes>
          <Route path="/" element={<Navigate to="/Home" />} />
          <Route path='/Home' element={<Home setUsername={setUsername} />} />
          <Route path="/Explore" element={<Explore />} />
          <Route path="/Watchlist" element={<Watchlist username={username} />} />
          <Route path="/Portfolio" element={<Portfolio username={username} />} />
          <Route path='/Symboldetails/:id' element={<Symboldetail />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App;
