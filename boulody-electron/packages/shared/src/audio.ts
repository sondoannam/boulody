// Shared audio types between main (Electron) and renderer (React)
export interface AudioFrame {
  timestamp: number;
  frequencies: Uint8Array;
  volume: number;
  sampleRate?: number;
  binSizeHz?: number;
  rms?: number;
  peaks?: Uint8Array;
  latencyEstimateMs?: number;
}
export interface FrameMessage extends AudioFrame {
  type: 'frame';
}
export interface AudioEngineConfig {
  fps?: number;
  bins?: number;
  smoothing?: number;
  seed?: number;
  simulateLatencyMs?: number;
}
export interface ResolvedAudioEngineConfig extends Required<Omit<AudioEngineConfig, 'seed'>> {
  seed?: number;
}
export interface AudioEngineStatus {
  type: 'status';
  running: boolean;
  config: ResolvedAudioEngineConfig;
  startedAt: number;
  framesGenerated: number;
}
export interface AudioMetrics {
  type: 'metrics';
  framesGenerated: number;
  framesSent: number;
  avgGenerationMs: number;
  worstGenerationMs: number;
  lastFrameTimestamp?: number;
  driftMs?: number;
}
export type AudioOutboundMessage = FrameMessage | AudioEngineStatus | AudioMetrics;
export type AudioControlCommand =
  | { type: 'start'; config?: AudioEngineConfig }
  | { type: 'stop' }
  | { type: 'update-config'; patch: AudioEngineConfig };
export const AudioChannels = {
  frame: 'audio:frame',
  control: 'audio:control',
  status: 'audio:status',
  metrics: 'audio:metrics',
} as const;
export type AudioChannelKey = keyof typeof AudioChannels;
export type AudioChannelName = (typeof AudioChannels)[AudioChannelKey];
