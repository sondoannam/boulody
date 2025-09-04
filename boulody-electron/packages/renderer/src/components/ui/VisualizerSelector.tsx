import React from 'react';
import type { VisualizerType } from '../../types';

interface VisualizerSelectorProps {
  visualizerType: VisualizerType;
  setVisualizerType: (type: VisualizerType) => void;
}

export const VisualizerSelector: React.FC<VisualizerSelectorProps> = ({ 
  visualizerType, 
  setVisualizerType 
}) => (
  <div className="flex items-center gap-3">
    <span className="text-sm font-medium text-gray-300">Visualizer:</span>
    <select
      value={visualizerType}
      onChange={(e) => setVisualizerType(e.target.value as VisualizerType)}
      className="px-3 py-2 bg-gray-700 text-white rounded-md border border-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none text-sm"
    >
      <option value="bars">📊 Bars</option>
      <option value="wave">🌊 Wave</option>
      <option value="circle">⭕ Circle</option>
      <option value="debug">🔧 Debug</option>
    </select>
  </div>
);
