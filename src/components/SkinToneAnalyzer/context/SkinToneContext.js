// src/components/SkinToneAnalyzer/context/SkinToneContext.js
import React, { createContext, useContext, useState } from 'react';

const SkinToneContext = createContext();

export const SkinToneProvider = ({ children }) => {
  const [analysis, setAnalysis] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [history, setHistory] = useState([]);
  const [lightCondition, setLightCondition] = useState('unknown');
  const [error, setError] = useState(null);

  return (
    <SkinToneContext.Provider value={{
      analysis,
      setAnalysis,
      isAnalyzing,
      setIsAnalyzing,
      history,
      setHistory,
      lightCondition,
      setLightCondition,
      error,
      setError
    }}>
      {children}
    </SkinToneContext.Provider>
  );
};

export const useSkinTone = () => {
  const context = useContext(SkinToneContext);
  if (!context) {
    throw new Error('useSkinTone must be used within a SkinToneProvider');
  }
  return context;
};