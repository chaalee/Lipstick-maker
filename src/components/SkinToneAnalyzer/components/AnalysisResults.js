// src/components/SkinToneAnalyzer/components/AnalysisResults.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, Info, Palette } from 'lucide-react';
import { useSkinTone } from '../context/SkinToneContext';

const LipColorPalette = ({ colors, onSelectColor }) => (
  <div className="grid grid-cols-3 gap-4">
    {colors.map((color, i) => (
      <div 
        key={i} 
        className="text-center cursor-pointer group"
        onClick={() => onSelectColor(color)}
      >
        <div 
          className="w-12 h-12 rounded-full mx-auto mb-2 shadow-md border-2 border-white 
                     transition-all group-hover:scale-110 group-hover:shadow-lg"
          style={{ backgroundColor: color.color }}
          title={color.name}
        />
        <span className="text-xs">{color.name}</span>
      </div>
    ))}
  </div>
);

const AnalysisMetrics = ({ analysis }) => (
  <div className="space-y-1.5 text-sm">
    <p>Undertone: <span className="font-medium">{analysis.undertone}</span></p>
    <p>Lightness: <span className="font-medium">{analysis.lightness}</span></p>
    <p>Lab Values: L*: {analysis.labValues.L}, a*: {analysis.labValues.a}, b*: {analysis.labValues.b}</p>
  </div>
);

const AnalysisResults = () => {
  const navigate = useNavigate();
  const { analysis, lightCondition } = useSkinTone();
  const [seasonalColors, setSeasonalColors] = useState([]);
  const [seasonalDescription, setSeasonalDescription] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (analysis?.seasons?.[0]) {
          // Fetch all data at once
          const [lipstickResponse, seasonResponse] = await Promise.all([
            fetch('http://localhost:5001/api/lipsticks'),
            fetch('http://localhost:5001/api/ingredients')
          ]);

          const allLipsticks = await lipstickResponse.json();
          const seasonalData = await seasonResponse.json();

          // Filter lipsticks by season
          const seasonColors = allLipsticks.filter(
            lipstick => lipstick.season === analysis.seasons[0]
          );
          setSeasonalColors(seasonColors);

          // Find season description
          const seasonInfo = seasonalData.find(s => s.season === analysis.seasons[0]);
          if (seasonInfo) {
            setSeasonalDescription(seasonInfo.description);
          }
        }
      } catch (err) {
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [analysis?.seasons]);

  if (!analysis) return null;
  const season = analysis.seasons[0];

  const handleColorSelect = (color) => {
    const shadeData = {
      colorType: color.name,
      description: seasonalDescription || `${season} Collection: ${color.name} shade`,
      color: color.color
    };

    navigate('/lipstick', { state: { shade: shadeData } });
  };

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
        
        <div className="space-y-6">
          {/* Seasons */}
          <div>
            <h2 className="text-3xl font-serif mb-2">{season}</h2>
            {analysis.seasons.length > 1 && (
              <p className="text-sm text-gray-500 mt-2">
                Also compatible with {analysis.seasons.slice(1).join(', ')}
              </p>
            )}
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
            <p className="text-sm text-gray-600 mb-4">Click on a shade to try it on</p>
            {loading ? (
              <div className="text-center text-gray-500">Loading recommendations...</div>
            ) : (
              <LipColorPalette 
                colors={seasonalColors} 
                onSelectColor={handleColorSelect}
              />
            )}
          </div>

          {/* Analysis Details */}
          <div>
            <h3 className="font-bold mb-2">Analysis Details:</h3>
            <AnalysisMetrics analysis={analysis} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalysisResults;