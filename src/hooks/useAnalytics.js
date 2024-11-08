// src/hooks/useAnalytics.js
import { useState, useCallback } from 'react';

export const useAnalytics = () => {
  const [analysisStartTime, setAnalysisStartTime] = useState(null);

  const startAnalysisTracking = useCallback(() => {
    setAnalysisStartTime(performance.now());
  }, []);

  const trackAnalysis = useCallback(async (analysisData) => {
    const analysisEndTime = performance.now();
    const analysisMetrics = {
      ...analysisData,
      performance: {
        totalAnalysisTime: analysisEndTime - analysisStartTime,
        timeOfDay: new Date().toISOString(),
        deviceMemory: navigator?.deviceMemory,
        hardwareConcurrency: navigator?.hardwareConcurrency,
      }
    };

    // Store in local storage for now
    const history = JSON.parse(localStorage.getItem('analysisHistory') || '[]');
    history.push(analysisMetrics);
    localStorage.setItem('analysisHistory', JSON.stringify(history));

    return analysisMetrics;
  }, [analysisStartTime]);

  return { startAnalysisTracking, trackAnalysis };
};