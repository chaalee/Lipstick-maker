// src/pages/Start.js
import React from 'react';
import { useNavigate } from 'react-router-dom';

const Start = () => {
  const navigate = useNavigate();

  return (
    <div className="relative h-screen bg-[#FDE8E9] overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <img
          src="/images/bg_page1.png"
          alt="Background"
          className="object-cover w-full h-full"
        />
      </div>

      {/* Main Content Container - using h-screen and flex to ensure everything fits */}
      <div className="relative h-full flex flex-col justify-between items-center px-2 py-16">
        {/* Image Container with oval shape - adjusted max heights */}
        <div className="w-full max-w-lg flex-1 flex items-center max-h-[45vh]">
          <div className="relative w-full aspect-[3/4] max-w-[320px] mx-auto">
            <div className="absolute inset-0 rounded-[45%] overflow-hidden">
              <img
                src="/images/pic_page1.png"
                alt="Lips"
                className="object-cover w-full h-full"
              />
            </div>
          </div>
        </div>

        <div className="z-20 flex-shrink-0 flex flex-col items-center">
          {/* Text Container */}
          <div className="text-center mb-6">
            <h1 className="z-10 text-4xl md:text-8xl font-playfair italic text-rose-500 tracking-wider leading-tight">
              FIND YOUR
            </h1>
            <h1 className="text-4xl md:text-8xl font-playfair italic text-rose-500 tracking-wider leading-tight">
              RIGHT SHADE
            </h1>
          </div>

          {/* Button Container */}
          <div className="mb-6">
            <button 
              onClick={() => navigate('/analyze')}
              className="font-serif italic bg-rose-500 hover:bg-rose-600 text-white 
                       text-xl px-12 py-4 rounded-full transform transition-all
                       hover:scale-105 active:scale-95"
            >
              Get Started
            </button>
          </div>
        </div>  
      </div>
    </div>
  );
};

export default Start;