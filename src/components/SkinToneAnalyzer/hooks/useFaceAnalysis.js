import { useCallback, useRef } from 'react';
import * as tf from '@tensorflow/tfjs-core';
import '@tensorflow/tfjs-converter';
import '@tensorflow/tfjs-backend-webgl';
import * as faceLandmarksDetection from '@tensorflow-models/face-landmarks-detection';
import '@mediapipe/face_mesh';
import { useSkinTone } from '../context/SkinToneContext';
import { useAnalytics } from '../../../hooks/useAnalytics';
import { calculateLabValues, detectLighting } from '../utils/colorAnalysis';

let model = null;

export const useFaceAnalysis = () => {
  const { 
    setAnalysis, 
    setIsAnalyzing, 
    setHistory, 
    setLightCondition,
    setError 
  } = useSkinTone();
  const { startAnalysisTracking, trackAnalysis } = useAnalytics();
  const modelLoadingPromise = useRef(null);

  // Fitzpatrick Scale classification based on L value
  const getFitzpatrickScale = (L) => {
    if (L > 80) return 'Type I';
    if (L > 70) return 'Type II';
    if (L > 60) return 'Type III';
    if (L > 50) return 'Type IV';
    if (L > 40) return 'Type V';
    return 'Type VI';
  };

  // Season recommendations based on undertone and lightness
  const getSeasonsRecommendation = (undertone, lightness) => {
    if (undertone === 'Warm') {
      return lightness === 'High' ? ['Spring', 'Autumn'] : ['Autumn'];
    } else if (undertone === 'Cool') {
      return lightness === 'High' ? ['Summer', 'Winter'] : ['Winter'];
    }
    return lightness === 'High' ? ['Spring', 'Summer'] : ['Autumn', 'Winter'];
  };

  const initializeModel = async () => {
    if (!model) {
      if (!modelLoadingPromise.current) {
        modelLoadingPromise.current = (async () => {
          try {
            await tf.setBackend('webgl');
            await tf.ready();
            
            model = await faceLandmarksDetection.createDetector(
              faceLandmarksDetection.SupportedModels.MediaPipeFaceMesh,
              {
                runtime: 'tfjs',
                refineLandmarks: true,
                maxFaces: 1,
                shouldLoadIrisModel: false
              }
            );
          } catch (error) {
            modelLoadingPromise.current = null;
            throw error;
          }
        })();
      }
      await modelLoadingPromise.current;
    }
    return model;
  };

  const detectFaceWithRetry = async (detector, videoElement, maxAttempts = 3) => {
    let lastError;
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      try {
        // Create a tensor from the video element
        const videoTensor = tf.browser.fromPixels(videoElement);
        
        // Ensure the video dimensions are valid
        if (videoTensor.shape[0] === 0 || videoTensor.shape[1] === 0) {
          videoTensor.dispose();
          throw new Error('Invalid video dimensions');
        }

        // Attempt detection
        const predictions = await detector.estimateFaces(videoTensor);
        videoTensor.dispose();

        if (predictions && predictions.length > 0 && predictions[0].keypoints) {
          return predictions[0];
        }

        // If we didn't find a face, wait briefly before trying again
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (error) {
        lastError = error;
        console.warn(`Face detection attempt ${attempt + 1} failed:`, error);
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }
    throw new Error(lastError?.message || 'No face detected after multiple attempts. Please ensure your face is clearly visible and well-lit.');
  };

  const getSamplePoints = (landmarks) => {
    try {
      // Get the face bounding box
      const keypoints = landmarks.keypoints;
      const faceBox = {
        xMin: Math.min(...keypoints.map(k => k.x)),
        xMax: Math.max(...keypoints.map(k => k.x)),
        yMin: Math.min(...keypoints.map(k => k.y)),
        yMax: Math.max(...keypoints.map(k => k.y))
      };

      // Calculate face dimensions
      const faceWidth = faceBox.xMax - faceBox.xMin;
      const faceHeight = faceBox.yMax - faceBox.yMin;
      
      // Sample size based on face dimensions
      const sampleSize = Math.min(faceWidth, faceHeight) * 0.15;

      // Find specific landmark points for cheeks and forehead
      const leftCheek = keypoints[234] || keypoints.find(k => k.name === 'leftCheek');
      const rightCheek = keypoints[454] || keypoints.find(k => k.name === 'rightCheek');
      const forehead = keypoints[151] || keypoints.find(k => k.name === 'foreheadCenter');

      if (!leftCheek || !rightCheek || !forehead) {
        throw new Error('Required facial landmarks not found');
      }

      return [
        {
          x: forehead.x - sampleSize / 2,
          y: forehead.y - sampleSize / 2,
          w: sampleSize,
          h: sampleSize
        },
        {
          x: leftCheek.x - sampleSize / 2,
          y: leftCheek.y - sampleSize / 2,
          w: sampleSize,
          h: sampleSize
        },
        {
          x: rightCheek.x - sampleSize / 2,
          y: rightCheek.y - sampleSize / 2,
          w: sampleSize,
          h: sampleSize
        }
      ];
    } catch (error) {
      console.error('Error getting sample points:', error);
      throw new Error('Failed to determine facial sampling points');
    }
  };

  const analyzeSkinTone = useCallback(async (canvasContext, videoElement) => {
    const startTime = performance.now();
    setIsAnalyzing(true);
    setError(null);
    startAnalysisTracking();

    try {
      // Ensure video is ready
      if (!videoElement.videoWidth || !videoElement.videoHeight) {
        throw new Error('Video feed not ready');
      }

      // Initialize model and detect face
      const detector = await initializeModel();
      const faceLandmarks = await detectFaceWithRetry(detector, videoElement);

      // Get sample points for skin tone analysis
      const sampleAreas = getSamplePoints(faceLandmarks);

      let totalR = 0, totalG = 0, totalB = 0, totalPixels = 0;
      let totalBrightness = 0;
      let validSamples = 0;

      // Analyze each sample area
      for (const area of sampleAreas) {
        try {
          const imageData = canvasContext.getImageData(
            Math.round(area.x), 
            Math.round(area.y), 
            Math.round(area.w), 
            Math.round(area.h)
          );
          
          for (let i = 0; i < imageData.data.length; i += 4) {
            const r = imageData.data[i];
            const g = imageData.data[i + 1];
            const b = imageData.data[i + 2];
            
            // Skip pixels that are too bright (possible reflections) or too dark (shadows)
            const brightness = (r + g + b) / 3;
            if (brightness > 240 || brightness < 20) continue;
            
            totalR += r;
            totalG += g;
            totalB += b;
            totalBrightness += brightness;
            totalPixels++;
          }
          validSamples++;
        } catch (error) {
          console.warn('Error sampling area:', error);
        }
      }

      if (validSamples === 0 || totalPixels === 0) {
        throw new Error('Could not sample skin tone from detected face');
      }

      // Calculate averages
      const avgR = totalR / totalPixels;
      const avgG = totalG / totalPixels;
      const avgB = totalB / totalPixels;
      
      const lightCondition = detectLighting({ 
        data: new Uint8ClampedArray([avgR, avgG, avgB]), 
        length: 3 
      });
      setLightCondition(lightCondition);

      const { L, a, b } = calculateLabValues(avgR, avgG, avgB);
      const hueAngle = Math.atan2(b, a) * (180/Math.PI);
      const undertone = hueAngle > 60 ? 'Warm' : hueAngle < 60 ? 'Cool' : 'Neutral';
      const lightness = L > 66 ? 'High' : L > 45 ? 'Medium' : 'Low';

      const newAnalysis = {
        undertone,
        lightness,
        fitzpatrickType: getFitzpatrickScale(L),
        seasons: getSeasonsRecommendation(undertone, lightness),
        labValues: { L: L.toFixed(1), a: a.toFixed(1), b: b.toFixed(1) },
        rgbValues: { r: Math.round(avgR), g: Math.round(avgG), b: Math.round(avgB) },
        lightCondition,
        facialFeatures: {
          detected: true,
          confidence: faceLandmarks.box?.score || 0.9,
          samplePoints: sampleAreas
        },
        timestamp: new Date().toISOString(),
        performanceMetrics: {
          analysisTime: performance.now() - startTime,
          lightingCondition: lightCondition,
          sampleSize: totalPixels,
          validSamples
        }
      };

      setAnalysis(newAnalysis);
      setHistory(prev => [...prev.slice(-4), newAnalysis]);
      await trackAnalysis(newAnalysis);

      return newAnalysis;
    } catch (error) {
      console.error('Error during face detection and skin tone analysis:', error);
      setError(error.message);
      throw error;
    } finally {
      setIsAnalyzing(false);
    }
  }, [setAnalysis, setIsAnalyzing, setHistory, setLightCondition, setError, startAnalysisTracking, trackAnalysis]);

  return { analyzeSkinTone };
};