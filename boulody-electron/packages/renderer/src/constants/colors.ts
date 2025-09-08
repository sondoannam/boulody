import type { VisualizerColors, ColorConfig } from '../types';

// Default color configurations
export const createDefaultColorConfig = (color: string = '#3b82f6'): ColorConfig => ({
  mode: 'solid',
  solidColor: color,
  gradient: {
    type: 'linear',
    angle: 45,
    stops: [
      { color: '#3b82f6', position: 0 },
      { color: '#8b5cf6', position: 100 }
    ]
  }
});

export const DEFAULT_VISUALIZER_COLORS: VisualizerColors = {
  primary: createDefaultColorConfig('#3b82f6')
};
