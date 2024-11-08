// src/components/SkinToneAnalyzer/components/AnalysisResults.js
import React from 'react';
import { Camera, History, RefreshCw, Info, Palette } from 'lucide-react';
import { useSkinTone } from '../context/SkinToneContext';
import { exportAnalysisData } from '../../../utils/dataExport';
import { SEASONAL_LIP_COLORS } from '../constants/colors';

const LipColorPalette = ({ colors }) => (
  <div className="grid grid-cols-3 gap-4">
    {colors.map((color, i) => (
      <div key={i} className="text-center">
        <div 
          className="w-12 h-12 rounded-full mx-auto mb-2 shadow-md border-2 border-white transition-transform hover:scale-110"
          style={{ backgroundColor: color.color }}
          title={color.name}
        />
        <span className="text-xs">{color.name}</span>
      </div>
    ))}
  </div>
);

const AnalysisMetrics = ({ analysis }) => (
  <div className="space-y-1 text-sm">
    <p>Undertone: <span className="font-medium">{analysis.undertone}</span></p>
    <p>Lightness: <span className="font-medium">{analysis.lightness}</span></p>
    <p>Fitzpatrick Scale: <span className="font-medium">{analysis.fitzpatrickType}</span></p>
    <p>Lab Values: L*: {analysis.labValues.L}, a*: {analysis.labValues.a}, b*: {analysis.labValues.b}</p>
    <p>Analysis Time: {analysis.performanceMetrics.analysisTime.toFixed(2)}ms</p>
  </div>
);

const AnalysisResults = () => {
  const { analysis, lightCondition } = useSkinTone();

  if (!analysis) return null;

  const getLightingAdvice = () => {
    switch(lightCondition) {
      case 'dark': return 'Lighting is too dark. Move to a brighter area for better results.';
      case 'bright': return 'Lighting is too bright. Reduce direct light for more accurate results.';
      case 'good': return 'Lighting conditions are optimal.';
      default: return 'Analyzing lighting conditions...';
    }
  };

  return (
    <div className="lg:w-96">
      <div className="bg-white rounded-3xl shadow-lg p-6">
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Palette className="w-6 h-6" />
            <h2 className="text-xl font-semibold">Analysis Results</h2>
          </div>
        </div>
        
        <div className="space-y-8">
          {/* Seasons */}
          <div>
            <h2 className="text-3xl font-serif mb-2">{analysis.seasons[0]}</h2>
            <p className="text-sm text-gray-600">
              {analysis.seasons.length > 1 
                ? `Also compatible with ${analysis.seasons.slice(1).join(', ')}`
                : 'Primary season'}
            </p>
          </div>

          {/* Lighting Condition */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Info className="w-5 h-5 text-gray-600" />
              <span className="font-medium">Lighting Status</span>
            </div>
            <p className="text-sm">{getLightingAdvice()}</p>
          </div>

          {/* Lip Colors */}
          <div>
            <h3 className="font-bold mb-3">Recommended Lip Colors:</h3>
            <LipColorPalette colors={SEASONAL_LIP_COLORS[analysis.seasons[0]]} />
          </div>

          {/* Analysis Details */}
          <div>
            <h3 className="font-bold mb-2">Analysis Details:</h3>
            <AnalysisMetrics analysis={analysis} />
          </div>

          {/* Export Button */}
          <button
            onClick={exportAnalysisData}
            className="w-full bg-blue-100 hover:bg-blue-200 text-blue-600 px-6 py-3 rounded-full flex items-center justify-center gap-2 transition-colors"
          >
            <History className="w-5 h-5" />
            Export Analysis Data
          </button>
        </div>
      </div>
    </div>
  );
};

export default AnalysisResults;