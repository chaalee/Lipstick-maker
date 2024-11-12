// src/pages/Lipstick.js
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Edit2 } from 'lucide-react';

const LipstickPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  // You can pass the shade data through navigation state
  const shadeData = location.state?.shade || {
    colorType: 'Coral Pink',
    description: 'jhhi',
    color: '#FF6B6B' // Default coral pink color
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-pink-50 to-pink-100">
      {/* Main content container */}
      <div className="min-h-screen flex flex-col items-center justify-center p-6">
        {/* White card container */}
        <div className="bg-white rounded-3xl shadow-lg p-8 max-w-4xl w-full mx-auto">
          <div className="flex flex-col md:flex-row gap-8 items-center">
            {/* Left side - Color Circle */}
            <div className="relative">
              <div 
                className="w-64 h-64 rounded-full shadow-lg"
                style={{ 
                  backgroundColor: shadeData.color,
                  boxShadow: '0 0 30px rgba(0,0,0,0.1)'
                }}
              />
              <div className="absolute inset-0 rounded-full border-4 border-white"/>
            </div>

            {/* Right side - Content */}
            <div className="flex-1 text-center md:text-left">
              {/* Shade Found Label */}
              <div className="flex items-center justify-center md:justify-start gap-2 mb-4">
                <Edit2 className="w-5 h-5 text-gray-500" />
                <span className="text-gray-500">Selected Shade</span>
              </div>

              {/* Shade Name */}
              <h1 className="font-playfair italic text-4xl md:text-5xl mb-4">
                {shadeData.colorType}
              </h1>

              {/* Description */}
              <p className="text-gray-600 text-lg mb-8 max-w-md">
                {shadeData.description}
              </p>

              {/* Try it on Button */}
              <button
                onClick={() => {
                  // Add your try-on functionality here
                  console.log('Trying on shade:', shadeData.colorType);
                }}
                className="font-serif italic bg-red-500 hover:bg-red-600 text-white 
                         text-xl px-12 py-3 rounded-full transform transition-all
                         hover:scale-105 active:scale-95"
              >
                try it on
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LipstickPage;