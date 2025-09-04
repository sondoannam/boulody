import React from 'react';
import type { VisualizerType } from '../../types';
import { SelectMenu } from './SelectMenu';

interface VisualizerSelectorProps {
  visualizerType: VisualizerType;
  setVisualizerType: (type: VisualizerType) => void;
}

const visualizerOptions = [
  { value: 'bars', label: 'Bars', icon: '📊' },
  { value: 'wave', label: 'Wave', icon: '🌊' },
  { value: 'circle', label: 'Circle', icon: '⭕' },
  { value: 'debug', label: 'Debug', icon: '🔧' },
];

export const VisualizerSelector: React.FC<VisualizerSelectorProps> = ({ 
  visualizerType, 
  setVisualizerType 
}) => (
  <div className="flex items-center gap-3">
    <span className="text-sm font-medium text-gray-300">Visualizer:</span>
    <SelectMenu
      value={visualizerType}
      onChange={(value) => setVisualizerType(value as VisualizerType)}
      options={visualizerOptions}
      placeholder="Select visualizer"
    />
  </div>
);
