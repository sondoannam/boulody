import { useEffect, useRef, useState, useCallback } from 'react';
import type {
  FrameMessage,
  AudioEngineStatus,
  AudioMetrics,
  AudioEngineConfig,
} from '@boulody/shared';

// Shape returned by the hook
export interface UseAudioFramesResult {
  frame: FrameMessage | null; // latest frame (updates at IPC rate)
  volume: number; // convenience alias (0-255)
  status: AudioEngineStatus | null; // engine lifecycle status
  metrics: AudioMetrics | null; // latest metrics snapshot (if emitted)
  start: (config?: AudioEngineConfig) => void;
  stop: () => void;
  updateConfig: (patch: AudioEngineConfig) => void;
  useAnimationFrame: (cb: (latest: FrameMessage | null, dt: number) => void) => void; // rAF-driven consumer helper
}

// Small wrapper to access the exposed preload API with type safety
type BridgeAPI = {
  onFrame: (cb: (f: FrameMessage) => void) => { off: () => void };
  onStatus: (cb: (s: AudioEngineStatus) => void) => { off: () => void };
  onMetrics: (cb: (m: AudioMetrics) => void) => { off: () => void };
  start: (config?: AudioEngineConfig) => void;
  stop: () => void;
  updateConfig: (patch: AudioEngineConfig) => void;
};

declare global {
  interface Window {
    audioFrames?: BridgeAPI;
  }
}
function getAPI(): BridgeAPI | null {
  return typeof window !== 'undefined' ? (window.audioFrames ?? null) : null;
}

export function useAudioFrames(autoStart: boolean = true): UseAudioFramesResult {
  const [frame, setFrame] = useState<FrameMessage | null>(null);
  const [status, setStatus] = useState<AudioEngineStatus | null>(null);
  const [metrics, setMetrics] = useState<AudioMetrics | null>(null);
  const apiRef = useRef<ReturnType<typeof getAPI> | null>(null);
  const frameRef = useRef<FrameMessage | null>(null); // mirrors latest frame for internal checks
  const lastRafTime = useRef<number>(performance.now());
  const rafCallbacks = useRef<((f: FrameMessage | null, dt: number) => void)[]>([]);

  if (!apiRef.current) apiRef.current = getAPI();

  // Subscribe to IPC streams (allow effect to run multiple times under StrictMode without stopping engine)
  useEffect(() => {
    let frameHandle: { off: () => void } | null = null;
    let statusHandle: { off: () => void } | null = null;
    let metricsHandle: { off: () => void } | null = null;
    let started = false;
    let retryTimer: ReturnType<typeof setTimeout> | null = null;

    function attach() {
      const api = apiRef.current;
      if (!api) return;
      console.log('[useAudioFrames] attaching listeners (autoStart=' + autoStart + ')');
      frameHandle = api.onFrame((f) => {
        frameRef.current = f;
        setFrame(f);
      });
      statusHandle = api.onStatus((s) => {
        setStatus(s);
        if (!s.running) console.log('[useAudioFrames] status received running=false');
      });
      metricsHandle = api.onMetrics((m) => setMetrics(m));
      if (autoStart && !started) {
        api.start();
        started = true;
        console.log('[useAudioFrames] start command sent');
      }
      // If no frame arrives shortly, try one more start (in case race lost first status)
      const hasFrame = () => !!frameRef.current;
      retryTimer = setTimeout(() => {
        if (!hasFrame() && api) {
          console.log('[useAudioFrames] retrying start (no frame yet)');
          api.start();
        }
      }, 1500);
    }

    if (apiRef.current) {
      attach();
    } else {
      // Wait for preload ready event
      const onReady = () => {
        apiRef.current = getAPI();
        attach();
      };
      window.addEventListener('audio-bridge-ready', onReady, { once: true });
    }

    return () => {
      frameHandle?.off();
      statusHandle?.off();
      metricsHandle?.off();
      if (retryTimer) clearTimeout(retryTimer);
      // Do not auto-stop on cleanup; engine is global and StrictMode double-mount would flicker it.
    };
    // We intentionally do NOT depend on `frame` to avoid reattaching every frame.
  }, [autoStart]);

  // Mirror latest frame into ref (outside subscription closure) for any future checks
  useEffect(() => {
    frameRef.current = frame;
  }, [frame]);

  // rAF loop for visuals decoupled from IPC frequency
  useEffect(() => {
    let active = true;
    function loop(ts: number) {
      if (!active) return;
      const dt = ts - lastRafTime.current;
      lastRafTime.current = ts;
      const current = frameRef.current; // use ref, not state
      for (const cb of rafCallbacks.current) cb(current, dt);
      requestAnimationFrame(loop);
    }
    const id = requestAnimationFrame(loop);
    return () => {
      active = false;
      cancelAnimationFrame(id);
    };
  }, []); // no frame dependency to prevent rAF loop restarts

  const start = useCallback((config?: AudioEngineConfig) => apiRef.current?.start(config), []);
  const stop = useCallback(() => apiRef.current?.stop(), []);
  const updateConfig = useCallback(
    (patch: AudioEngineConfig) => apiRef.current?.updateConfig(patch),
    [],
  );

  const useAnimationFrame = useCallback((cb: (latest: FrameMessage | null, dt: number) => void) => {
    rafCallbacks.current.push(cb);
    return () => {
      const idx = rafCallbacks.current.indexOf(cb);
      if (idx >= 0) rafCallbacks.current.splice(idx, 1);
    };
  }, []);

  return {
    frame,
    volume: frame?.volume ?? 0,
    status,
    metrics,
    start,
    stop,
    updateConfig,
    useAnimationFrame,
  };
}
