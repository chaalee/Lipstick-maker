// src/components/NavBar.js
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Home } from 'lucide-react';
import { wsService } from '../services/websocket';

const NavBar = () => {
    const navigate = useNavigate();

    const handleHomeClick = async () => {
        try {
            // First return conveyor to home position
            await wsService.returnHome();
            // Then navigate to home page
            navigate('/');
        } catch (error) {
            console.error('Error returning home:', error);
            // Navigate anyway if there's an error
            navigate('/');
        }
    };

    return (
        <div className="fixed top-0 left-0 p-4 z-50">
            <button
                onClick={handleHomeClick}
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