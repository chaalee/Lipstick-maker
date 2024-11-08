import React, { useRef, useEffect } from 'react';
import { useSkinTone } from '../context/SkinToneContext';

const WebcamCapture = ({ onCapture }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const { setError } = useSkinTone();

  useEffect(() => {
    const startVideo = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { width: 640, height: 480, facingMode: 'user' }
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        setError("Could not access camera. Please ensure camera permissions are granted.");
        console.error("Error accessing webcam:", err);
      }
    };
    startVideo();
  }, [setError]);

  return (
    <div className="relative">
      <video 
        ref={videoRef}
        autoPlay 
        playsInline
        className="w-full rounded-xl transform scale-x-[-1]"
      />
      <canvas 
        ref={canvasRef} 
        width="640" 
        height="480" 
        className="hidden"
      />
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-80 border-2 border-white rounded-full"/>
    </div>
  );
};