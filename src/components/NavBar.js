// src/components/NavBar.js
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home } from 'lucide-react';

const NavBar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Don't show on start page
  if (location.pathname === '/') return null;

  return (
    <div className="fixed top-0 left-0 p-4 z-50">
      <button
        onClick={() => navigate('/')}
        className="bg-white/80 hover:bg-white p-2 rounded-full shadow-lg
                 transition-all hover:scale-105"
        title="Back to Home"
      >
        <Home className="text-red-500" size={24} />
      </button>
    </div>
  );
};

export default NavBar;