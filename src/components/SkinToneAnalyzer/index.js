// src/components/SkinToneAnalyzer/index.js
import React from 'react';
import { SkinToneProvider } from './context/SkinToneContext';
import SkinToneAnalyzerView from './components/SkinToneAnalyzerView';

const SkinToneAnalyzer = () => (
  <SkinToneProvider>
    <SkinToneAnalyzerView />
  </SkinToneProvider>
);

export default SkinToneAnalyzer;