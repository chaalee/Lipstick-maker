// src/pages/Lipstick.js
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Edit2 } from 'lucide-react';
import { wsService } from '../services/websocket';

const ProcessingAnimation = ({ currentBox, isProcessing }) => {
  if (!isProcessing) return null;

  return (
    <div className="min-h-screen bg-[#FDE8E9] flex flex-col items-center justify-center p-6">
      <h1 className="font-playfair italic text-red-500 text-5xl mb-16 tracking-widest">
        Processing...
      </h1>
      
      <div className="flex gap-8 justify-center items-center w-full max-w-3xl">
        {[0, 1, 2].map((boxIndex) => (
          <div
            key={boxIndex}
            className={`w-64 h-80 rounded-3xl transition-all duration-300 
                      ${boxIndex === currentBox ? 'border-2 border-red-500' : 'border border-[#FFF1F2]'}
                      bg-[#FDF6E9]`}
          />
        ))}
      </div>
    </div>
  );
};

const LipstickPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentBox, setCurrentBox] = useState(0);
  
  const shadeData = location.state?.shade || {
    colorType: 'Coral Pink',
    description: 'Light Spring is warm-neutral, quite bright and characterised by extremely high levels of lightness.',
    color: '#FF6B6B'
  };

  useEffect(() => {
    wsService.connect().catch(console.error);
    
    wsService.onStatus((status) => {
      if (status.startsWith('moving_')) {
        const position = parseInt(status.split('_')[1]) - 1;
        setCurrentBox(position);
      } else if (status === 'done') {
        // Add delay before finishing
        setTimeout(() => {
          setIsProcessing(false);
        }, 1000);
      }
    });

    return () => wsService.disconnect();
  }, []);

  const handleTryOn = async () => {
    setIsProcessing(true);
    try {
      await wsService.moveConveyor();
    } catch (error) {
      console.error('Error controlling conveyor:', error);
      setIsProcessing(false);
    }
  };

  if (isProcessing) {
    return <ProcessingAnimation currentBox={currentBox} isProcessing={isProcessing} />;
  }

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-pink-50 to-pink-100">
      <div className="min-h-screen flex flex-col items-center justify-center p-6">
              {/* Background */}
      <div className="z-0 absolute inset-0">
        <img
          src="/images/bg_page1.png"
          alt="Background"
          className="object-cover w-full h-full"
        />
      </div>
        <div className="z-20 bg-white rounded-3xl shadow-lg p-8 max-w-4xl w-full mx-auto">
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
              <div className="flex items-center justify-center md:justify-start gap-2 mb-4">
                <Edit2 className="w-5 h-5 text-gray-500" />
                <span className="text-gray-500">Selected Shade</span>
              </div>

              <h1 className="font-playfair italic text-4xl md:text-5xl mb-4">
                {shadeData.colorType}
              </h1>

              <p className="text-gray-600 text-lg mb-8 max-w-md">
                {shadeData.description}
              </p>

              <button
                onClick={handleTryOn}
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