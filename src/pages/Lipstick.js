// src/pages/Lipstick.js
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Edit2 } from 'lucide-react';
import { wsService } from '../services/websocket';

const ProcessingAnimation = ({ isProcessing }) => {
  const [activeBox, setActiveBox] = useState(0);

  useEffect(() => {
    if (isProcessing) {
      const timer = setInterval(() => {
        setActiveBox((prev) => (prev + 1) % 3);
      }, 2000); // Move every 2 seconds

      return () => clearInterval(timer);
    }
  }, [isProcessing]);

  if (!isProcessing) return null;

  return (
    <div className="min-h-screen bg-[#FDE8E9] flex flex-col items-center justify-center p-6">
      {/* Background */}
      <div className="absolute inset-0">
        <img
          src="/images/bg_page1.png"
          alt="Background"
          className="object-cover w-full h-full"
        />
      </div>
      <h1 className="z-20 font-playfair italic text-red-500 text-5xl mb-16 tracking-widest">
        Processing...
      </h1>
      
      <div className="z-20 flex gap-8 justify-center items-center w-full max-w-3xl">
        {[0, 1, 2].map((boxIndex) => (
          <div
            key={boxIndex}
            style={{ 
              transition: 'all 0.7s ease-in-out'
            }}
            className={`w-64 h-80 rounded-3xl 
                      ${boxIndex === activeBox ? 
                        'border-2 border-red-500 shadow-lg shadow-red-200 scale-105' : 
                        'border border-[#FFF1F2]'}
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
  
  const shadeData = location.state?.shade || {
    colorType: 'Coral Pink',
    description: 'Light Spring is warm-neutral, quite bright and characterised by extremely high levels of lightness.',
    color: '#FF6B6B'
  };

  useEffect(() => {
    wsService.connect().catch(console.error);
    
    wsService.onStatus((data) => {
      console.log('Received status:', data);
      
      if (data === 'sequence_complete') {
        setTimeout(() => {
          setIsProcessing(false);
        }, 2000);
      }
    });
  
    return () => wsService.disconnect();
  }, []);

  const handleTryOn = async () => {
    setIsProcessing(true);
    try {
      console.log('Selected shade data:', shadeData);
      await wsService.moveConveyor(shadeData.colorType);
    } catch (error) {
      console.error('Error controlling conveyor:', error);
      setIsProcessing(false);
    }
  };

  if (isProcessing) {
    return <ProcessingAnimation isProcessing={isProcessing} />;
  }

  return (
    <div className="relative min-h-screen">
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
                className="font-serif italic bg-rose-500 hover:bg-rose-600 text-white 
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