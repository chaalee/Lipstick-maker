// src/components/SkinToneAnalyzer/components/SkinToneAnalyzerView.js
import React, { useRef } from 'react';
import { Camera } from 'lucide-react';
import { useSkinTone } from '../context/SkinToneContext';
import { useColorAnalysis } from '../hooks/useColorAnalysis';
import AnalysisResults from './AnalysisResults';

// Import any background images if needed
import pinkBg from '../assets/pink_gradient_bg.jpg';

const WebcamCapture = ({ onCapture, isAnalyzing }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const { setError } = useSkinTone();

  React.useEffect(() => {
    const startVideo = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { 
            width: 640, 
            height: 480, 
            facingMode: 'user',
            // Optional: add constraints for better quality
            aspectRatio: 4/3,
            frameRate: { ideal: 30 }
          } 
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

    // Cleanup function
    return () => {
      if (videoRef.current?.srcObject) {
        videoRef.current.srcObject.getTracks().forEach(track => track.stop());
      }
    };
  }, [setError]);

  const handleCapture = () => {
    if (isAnalyzing) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    // Flip the image horizontally for mirror effect
    context.save();
    context.scale(-1, 1);
    context.translate(-canvas.width, 0);
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    context.restore();

    onCapture(context);
  };

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
      {/* Oval Guide */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-80 border-2 border-white rounded-full"/>
      
      <button
        onClick={handleCapture}
        disabled={isAnalyzing}
        className="absolute bottom-4 left-1/2 transform -translate-x-1/2 
                   bg-red-100 hover:bg-red-200 text-red-600 px-6 py-3 rounded-full 
                   flex items-center gap-2 disabled:opacity-50 transition-colors"
      >
        <Camera size={20} />
        {isAnalyzing ? 'Analyzing...' : 'Analyze'}
      </button>
    </div>
  );
};

const SkinToneAnalyzerView = () => {
  const { 
    error, 
    isAnalyzing,
    lightCondition 
  } = useSkinTone();
  
  const { analyzeSkinTone } = useColorAnalysis();

  const handleAnalysis = async (context) => {
    try {
      await analyzeSkinTone(context);
    } catch (err) {
      console.error('Error during analysis:', err);
    }
  };

  const getLightingAdvice = () => {
    switch(lightCondition) {
      case 'dark': 
        return {
          message: 'Lighting is too dark. Move to a brighter area for better results.',
          color: 'text-amber-600'
        };
      case 'bright':
        return {
          message: 'Lighting is too bright. Reduce direct light for more accurate results.',
          color: 'text-amber-600'
        };
      case 'good':
        return {
          message: 'Lighting conditions are optimal.',
          color: 'text-green-600'
        };
      default:
        return {
          message: 'Analyzing lighting conditions...',
          color: 'text-gray-600'
        };
    }
  };

  const lightingStatus = getLightingAdvice();

  return (
    <div       
        style={{
            backgroundImage: `url(${pinkBg})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            minHeight: '100vh',
            width: '100%'
      }}>
      <div className="max-w-6xl mx-auto p-4">
        {/* Title */}
        <h1 className="text-4xl font-light italic text-red-500 mb-8 text-center">
          Extracting Your Colors...
        </h1>

        {/* Error Display */}
        {error && (
          <div className="mb-4 p-4 bg-white/80 border border-red-400 text-red-700 rounded-3xl">
            <p>{error}</p>
          </div>
        )}

        {/* Lighting Status */}
        <div className={`mb-4 text-center ${lightingStatus.color}`}>
          <p>{lightingStatus.message}</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left Panel - Camera */}
          <div className="flex-1">
            <div className="bg-white rounded-3xl p-6 shadow-lg">
              <p className="text-center text-xl mb-4">
                Place your face in the guide and ensure good lighting.
              </p>
              
              <WebcamCapture 
                onCapture={handleAnalysis}
                isAnalyzing={isAnalyzing}
              />
            </div>
          </div>

          {/* Right Panel - Results */}
          <AnalysisResults />
        </div>

        {/* Instructions or Tips */}
        <div className="mt-8 p-6 bg-white rounded-3xl shadow-lg">
          <h2 className="text-2xl font-light mb-4">Tips for Best Results:</h2>
          <ul className="space-y-2 text-gray-700">
            <li>• Ensure your face is well-lit with natural light</li>
            <li>• Remove any makeup for most accurate results</li>
            <li>• Face the camera directly within the oval guide</li>
            <li>• Avoid strong colored lighting or reflections</li>
            <li>• Keep still during the analysis</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default SkinToneAnalyzerView;