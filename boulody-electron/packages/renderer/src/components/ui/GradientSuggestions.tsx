import React, { useState } from 'react';
import { GRADIENT_PRESETS, GradientGenerator } from '../../constants/gradientPresets';
import type { GradientConfig } from '../../types';

interface GradientSuggestionsProps {
  onSelect: (gradient: GradientConfig) => void;
  currentGradient?: GradientConfig;
}

export const GradientSuggestions: React.FC<GradientSuggestionsProps> = ({
  onSelect,
  currentGradient,
}) => {
  const [activeTab, setActiveTab] = useState<'presets' | 'random'>('presets');

  // Generate CSS gradient string for preview
  const gradientToCSS = (gradient: GradientConfig): string => {
    const stops = gradient.stops
      .sort((a, b) => a.position - b.position)
      .map((stop) => `${stop.color} ${stop.position}%`)
      .join(', ');
    
    return `linear-gradient(${gradient.angle}deg, ${stops})`;
  };

  // Generate random gradients based on current gradient or completely random
  const generateRandomGradients = (): Array<{ name: string; gradient: GradientConfig }> => {
    const baseColor = currentGradient?.stops[0]?.color || '#3b82f6';
    
    return [
      {
        name: 'Analogous',
        gradient: GradientGenerator.generateAnalogous(baseColor),
      },
      {
        name: 'Complementary', 
        gradient: GradientGenerator.generateComplementary(baseColor),
      },
      {
        name: 'Triadic',
        gradient: GradientGenerator.generateTriadic(baseColor),
      },
      {
        name: 'Monochromatic',
        gradient: GradientGenerator.generateMonochromatic(baseColor),
      },
      {
        name: 'Random Harmony',
        gradient: GradientGenerator.generateRandom(),
      },
      {
        name: 'Random Harmony',
        gradient: GradientGenerator.generateRandom(),
      },
    ];
  };

  const [randomGradients, setRandomGradients] = useState(() => generateRandomGradients());

  const refreshRandomGradients = () => {
    setRandomGradients(generateRandomGradients());
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-800">Gradient Suggestions</h3>
        <div className="flex bg-gray-100 rounded-md p-1">
          <button
            onClick={() => setActiveTab('presets')}
            className={`px-3 py-1 text-sm font-medium rounded transition-colors ${
              activeTab === 'presets'
                ? 'bg-white text-gray-800 shadow-sm'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            Presets
          </button>
          <button
            onClick={() => setActiveTab('random')}
            className={`px-3 py-1 text-sm font-medium rounded transition-colors ${
              activeTab === 'random'
                ? 'bg-white text-gray-800 shadow-sm'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            Generate
          </button>
        </div>
      </div>

      {activeTab === 'presets' ? (
        <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto">
          {GRADIENT_PRESETS.map((preset, index) => (
            <button
              key={index}
              onClick={() => onSelect(preset.gradient)}
              className="group relative overflow-hidden rounded-lg border border-gray-200 hover:border-gray-300 transition-all duration-200 hover:shadow-md"
              title={preset.name}
            >
              <div
                className="h-12 w-full"
                style={{ background: gradientToCSS(preset.gradient) }}
              />
              <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-10 transition-all duration-200" />
              <div className="absolute bottom-0 left-0 right-0 bg-black opacity-60 text-white text-xs px-2 py-1 group-hover:opacity-100 transition-opacity duration-200">
                {preset.name}
              </div>
            </button>
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Based on current colors</span>
            <button
              onClick={refreshRandomGradients}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors"
            >
              🎲 Refresh
            </button>
          </div>
          
          <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto">
            {randomGradients.map((item, index) => (
              <button
                key={index}
                onClick={() => onSelect(item.gradient)}
                className="group relative overflow-hidden rounded-lg border border-gray-200 hover:border-gray-300 transition-all duration-200 hover:shadow-md"
                title={item.name}
              >
                <div
                  className="h-12 w-full"
                  style={{ background: gradientToCSS(item.gradient) }}
                />
                <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-5 transition-all duration-200" />
                <div className="absolute bottom-0 left-0 right-0 bg-black opacity-60 text-white text-xs px-2 py-1 group-hover:opacity-100 transition-opacity duration-200">
                  {item.name}
                </div>
              </button>
            ))}
          </div>
          
          <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
            💡 <strong>Tip:</strong> Random gradients use color theory (analogous, complementary, triadic, monochromatic) to create harmonious combinations.
          </div>
        </div>
      )}
    </div>
  );
};
