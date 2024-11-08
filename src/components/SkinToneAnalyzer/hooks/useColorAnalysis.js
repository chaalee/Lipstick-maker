import { useCallback } from 'react';
import { useSkinTone } from '../context/SkinToneContext';
import { useAnalytics } from '../../../hooks/useAnalytics';

export const useColorAnalysis = () => {
  const { 
    setAnalysis, 
    setIsAnalyzing, 
    setHistory, 
    setLightCondition 
  } = useSkinTone();
  const { startAnalysisTracking, trackAnalysis } = useAnalytics();

  const getFitzpatrickScale = (L) => {
    if (L > 80) return 'Type I';
    if (L > 70) return 'Type II';
    if (L > 60) return 'Type III';
    if (L > 50) return 'Type IV';
    if (L > 40) return 'Type V';
    return 'Type VI';
  };

  const getSeasonsRecommendation = (undertone, lightness) => {
    if (undertone === 'Warm') {
      return lightness === 'High' ? ['Spring', 'Autumn'] : ['Autumn'];
    } else if (undertone === 'Cool') {
      return lightness === 'High' ? ['Summer', 'Winter'] : ['Winter'];
    }
    return lightness === 'High' ? ['Spring', 'Summer'] : ['Autumn', 'Winter'];
  };

  const analyzeSkinTone = useCallback(async (canvasContext) => {
    const startTime = performance.now();
    setIsAnalyzing(true);
    startAnalysisTracking();

    try {
      // Sample areas for analysis
      const sampleAreas = [
        { x: 270, y: 190, w: 100, h: 100 },  // Center
        { x: 220, y: 190, w: 50, h: 50 },    // Left
        { x: 370, y: 190, w: 50, h: 50 }     // Right
      ];

      let totalR = 0, totalG = 0, totalB = 0, totalPixels = 0;
      let totalBrightness = 0;

      // Analyze each sample area
      for (const area of sampleAreas) {
        const imageData = canvasContext.getImageData(area.x, area.y, area.w, area.h);
        
        for (let i = 0; i < imageData.data.length; i += 4) {
          const r = imageData.data[i];
          const g = imageData.data[i + 1];
          const b = imageData.data[i + 2];
          
          totalR += r;
          totalG += g;
          totalB += b;
          totalBrightness += (r + g + b) / 3;
          totalPixels++;
        }
      }

      // Calculate averages
      const avgR = totalR / totalPixels;
      const avgG = totalG / totalPixels;
      const avgB = totalB / totalPixels;
      const avgBrightness = totalBrightness / totalPixels;

      // Determine lighting condition
      let lightCondition = 'good';
      if (avgBrightness < 85) lightCondition = 'dark';
      else if (avgBrightness > 170) lightCondition = 'bright';
      setLightCondition(lightCondition);

      // Convert RGB to Lab
      let rgb = [avgR/255, avgG/255, avgB/255];
      rgb = rgb.map(v => v > 0.04045 ? Math.pow((v + 0.055) / 1.055, 2.4) : v / 12.92);
      
      const X = rgb[0] * 0.4124 + rgb[1] * 0.3576 + rgb[2] * 0.1805;
      const Y = rgb[0] * 0.2126 + rgb[1] * 0.7152 + rgb[2] * 0.0722;
      const Z = rgb[0] * 0.0193 + rgb[1] * 0.1192 + rgb[2] * 0.9505;

      const Xn = 0.95047, Yn = 1.00000, Zn = 1.08883;
      const xyz = [X/Xn, Y/Yn, Z/Zn].map(v => 
        v > 0.008856 ? Math.pow(v, 1/3) : (7.787 * v) + 16/116
      );

      const L = (116 * xyz[1]) - 16;
      const a = 500 * (xyz[0] - xyz[1]);
      const b = 200 * (xyz[1] - xyz[2]);

      // Determine undertone and lightness
      const hueAngle = Math.atan2(b, a) * (180/Math.PI);
      const undertone = hueAngle > 65 ? 'Warm' : hueAngle < 55 ? 'Cool' : 'Neutral';
      const lightness = L > 70 ? 'High' : L > 50 ? 'Medium' : 'Low';

      // Generate analysis results
      const newAnalysis = {
        undertone,
        lightness,
        fitzpatrickType: getFitzpatrickScale(L),
        seasons: getSeasonsRecommendation(undertone, lightness),
        labValues: { L: L.toFixed(1), a: a.toFixed(1), b: b.toFixed(1) },
        rgbValues: { r: Math.round(avgR), g: Math.round(avgG), b: Math.round(avgB) },
        lightCondition,
        timestamp: new Date().toISOString(),
        performanceMetrics: {
          analysisTime: performance.now() - startTime,
          lightingCondition: lightCondition,
          sampleSize: totalPixels
        }
      };

      setAnalysis(newAnalysis);
      setHistory(prev => [...prev.slice(-4), newAnalysis]);
      await trackAnalysis(newAnalysis);

      return newAnalysis;
    } catch (error) {
      console.error('Error during skin tone analysis:', error);
      throw error;
    } finally {
      setIsAnalyzing(false);
    }
  }, [setAnalysis, setIsAnalyzing, setHistory, setLightCondition, startAnalysisTracking, trackAnalysis]);

  return { analyzeSkinTone };
};