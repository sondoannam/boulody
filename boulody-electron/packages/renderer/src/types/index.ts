import type { FrameMessage, AudioEngineStatus, AudioEngineConfig } from '@boulody/shared';

export type TabType = 'visualizer' | 'demo';

export type AudioSource = 'fake' | 'mic';

export type VisualizerType = 'bars' | 'wave' | 'circle' | 'debug';

export interface AudioState {
  frame: FrameMessage | null;
  volume: number;
  status: AudioEngineStatus | null;
  error: string | null;
}

export interface AudioControls {
  start: () => void;
  stop: () => void;
  updateConfig: (config: AudioEngineConfig) => void;
}

export interface DisplayStats {
  frameCount: number;
  statusCount: number;
  lastFrameTime: number | null;
  volume: number;
}

export interface SelectOption<T = string> {
  value: T;
  label: string;
  icon?: string;
}

// Color system types
export type ColorMode = 'solid' | 'gradient';

export interface GradientStop {
  color: string;
  position: number; // 0-100
}

export interface GradientConfig {
  type: 'linear' | 'radial';
  angle: number; // degrees for linear gradients
  stops: GradientStop[];
}

export interface ColorConfig {
  mode: ColorMode;
  solidColor: string;
  gradient: GradientConfig;
}

export interface VisualizerColors {
  primary: ColorConfig;
  secondary?: ColorConfig; // For visualizers that support multiple colors
}
