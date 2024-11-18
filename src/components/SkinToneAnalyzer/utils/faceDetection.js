import * as faceLandmarksDetection from '@tensorflow-models/face-landmarks-detection';

let model = null;

export const initializeFaceDetection = async () => {
  if (!model) {
    model = await faceLandmarksDetection.load(
      faceLandmarksDetection.SupportedPackages.mediapipeFacemesh,
      { maxFaces: 1 }
    );
  }
  return model;
};

export const detectFacialLandmarks = async (videoElement) => {
  const detectionModel = await initializeFaceDetection();
  const predictions = await detectionModel.estimateFaces({
    input: videoElement
  });
  
  if (!predictions || predictions.length === 0) {
    throw new Error('No face detected in the image');
  }
  
  return predictions[0];
};

export const getSamplePoints = (landmarks) => {
  const leftCheek = landmarks.leftCheek[0];
  const rightCheek = landmarks.rightCheek[0];
  const forehead = landmarks.midwayBetweenEyes[0];
  
  return [
    {
      x: forehead.x - 25,
      y: forehead.y - 25,
      w: 50,
      h: 50
    },
    {
      x: leftCheek.x - 25,
      y: leftCheek.y - 25,
      w: 50,
      h: 50
    },
    {
      x: rightCheek.x - 25,
      y: rightCheek.y - 25,
      w: 50,
      h: 50
    }
  ];
};