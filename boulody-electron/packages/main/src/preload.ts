import { contextBridge, ipcRenderer } from 'electron';
import {
  AudioChannels,
  FrameMessage,
  AudioEngineStatus,
  AudioMetrics,
  AudioChannelName,
} from '@boulody/shared';

// Public API surface exposed to renderer. Narrow + typed.
// Renderer obtains via: window.audioFrames.onFrame(cb)
// We keep listeners internal and allow unsubscribe for cleanup.

interface FrameListenerHandle {
  off: () => void;
}

interface AudioAPI {
  onFrame(cb: (frame: FrameMessage) => void): FrameListenerHandle;
  onStatus(cb: (status: AudioEngineStatus) => void): FrameListenerHandle;
  onMetrics(cb: (metrics: AudioMetrics) => void): FrameListenerHandle;
  start(config?: any): void; // (typed in main, kept loose here to avoid duplicating types until shared pkg)
  stop(): void;
  updateConfig(patch: any): void;
}

function makeChannelListener<T>(
  channel: AudioChannelName,
  filterType: string | null,
  cb: (data: T) => void,
): FrameListenerHandle {
  const listener = (_event: Electron.IpcRendererEvent, payload: any) => {
    if (filterType && payload?.type !== filterType) return;
    cb(payload as T);
  };
  ipcRenderer.on(channel, listener);
  return { off: () => ipcRenderer.removeListener(channel, listener) };
}

// Define channel constants BEFORE building the api object to avoid TDZ ReferenceError
const FrameChannel = AudioChannels.frame;
const ControlChannel = AudioChannels.control;
const StatusChannel = AudioChannels.status;
const MetricsChannel = AudioChannels.metrics;

let api: AudioAPI | null = null;
try {
  console.log('[preload] starting preload script');
  // quick test primitive exposure
  try {
    contextBridge.exposeInMainWorld('preloadPing', 'ok');
  } catch (e) {
    console.error('[preload] expose preloadPing failed', e);
  }
  api = {
    onFrame(cb) {
      return makeChannelListener(FrameChannel, 'frame', cb);
    },
    onStatus(cb) {
      return makeChannelListener(StatusChannel, 'status', cb);
    },
    onMetrics(cb) {
      return makeChannelListener(MetricsChannel, 'metrics', cb);
    },
    start(config) {
      ipcRenderer.send(ControlChannel, { type: 'start', config });
    },
    stop() {
      ipcRenderer.send(ControlChannel, { type: 'stop' });
    },
    updateConfig(patch) {
      ipcRenderer.send(ControlChannel, { type: 'update-config', patch });
    },
  };
  contextBridge.exposeInMainWorld('audioFrames', api);
  // Notify renderer scripts that the audio bridge is ready
  window.dispatchEvent(new Event('audio-bridge-ready'));
  console.log('[preload] audioFrames API exposed');
} catch (err) {
  console.error('[preload] failed to expose audioFrames API', err);
}

declare global {
  interface Window {
    audioFrames: AudioAPI;
  }
}
