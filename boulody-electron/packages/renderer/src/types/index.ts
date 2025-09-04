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
