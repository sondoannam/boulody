import { useCallback, useEffect, useRef, useState } from 'react';
import type {
  FrameMessage,
  AudioEngineStatus,
  AudioMetrics,
  AudioEngineConfig,
  ResolvedAudioEngineConfig,
} from '@boulody/shared';

export interface UseMicAudioFramesResult {
  frame: FrameMessage | null;
  volume: number;
  status: AudioEngineStatus | null;
  metrics: AudioMetrics | null;
  error: string | null;
  start: (config?: AudioEngineConfig) => void;
  stop: () => void;
  updateConfig: (patch: AudioEngineConfig) => void;
  useAnimationFrame: (cb: (latest: FrameMessage | null, dt: number) => void) => void;
}

interface InternalState {
  config: ResolvedAudioEngineConfig;
  running: boolean;
  startedAt: number;
  framesGenerated: number;
  analyser?: AnalyserNode;
  audioCtx?: AudioContext;
  source?: MediaStreamAudioSourceNode;
  freqBuffer?: Uint8Array;
  timeBuffer?: Uint8Array;
  micStream?: MediaStream;
  rafId?: number;
}

const DEFAULTS: ResolvedAudioEngineConfig = {
  fps: 60,
  bins: 128,
  smoothing: 0.7,
  simulateLatencyMs: 0,
  seed: undefined,
};

function chooseFftSize(targetBins: number): number {
  const needed = targetBins * 2; // because binCount = fftSize/2
  let fft = 32;
  while (fft < needed) fft <<= 1;
  return Math.min(fft, 32768);
}

export function useMicAudioFrames(autoStart: boolean): UseMicAudioFramesResult {
  const [frame, setFrame] = useState<FrameMessage | null>(null);
  const [status, setStatus] = useState<AudioEngineStatus | null>(null);
  const [error, setError] = useState<string | null>(null);
  // Config is stored primarily inside stateRef; we mirror minimal pieces via status broadcasts.
  const stateRef = useRef<InternalState>({
    config: DEFAULTS,
    running: false,
    startedAt: 0,
    framesGenerated: 0,
  });
  const startingRef = useRef(false); // prevents concurrent / recursive starts
  const rafCallbacks = useRef<((f: FrameMessage | null, dt: number) => void)[]>([]);
  const lastRafTime = useRef<number>(performance.now());

  const broadcastStatus = useCallback(() => {
    const s: AudioEngineStatus = {
      type: 'status',
      running: stateRef.current.running,
      config: stateRef.current.config,
      startedAt: stateRef.current.startedAt,
      framesGenerated: stateRef.current.framesGenerated,
    };
    setStatus(s);
  }, []);

  const buildAnalyser = useCallback(async (conf: ResolvedAudioEngineConfig) => {
    console.log('[useMicAudioFrames] requesting user media');
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
    console.log('[useMicAudioFrames] media granted tracks=', stream.getAudioTracks().length);
    // Gracefully handle prefixed webkitAudioContext without using any in broader scope.
    const win = window as unknown as {
      AudioContext?: typeof AudioContext;
      webkitAudioContext?: typeof AudioContext;
    };
    const AC: typeof AudioContext | undefined = win.AudioContext || win.webkitAudioContext;
    if (!AC) throw new Error('Web Audio API not supported');
    const audioCtx = new AC();
    const source = audioCtx.createMediaStreamSource(stream);
    const analyser = audioCtx.createAnalyser();
    analyser.smoothingTimeConstant = Math.min(0.99, Math.max(0, conf.smoothing));
    analyser.fftSize = chooseFftSize(conf.bins);
    source.connect(analyser);
    stateRef.current.analyser = analyser;
    stateRef.current.audioCtx = audioCtx;
    stateRef.current.source = source;
    stateRef.current.micStream = stream;
    stateRef.current.freqBuffer = new Uint8Array(analyser.frequencyBinCount);
    stateRef.current.timeBuffer = new Uint8Array(analyser.fftSize);
  }, []);

  const downsample = (src: Uint8Array, targetBins: number): Uint8Array => {
    if (src.length === targetBins) return src.slice();
    const out = new Uint8Array(targetBins);
    const ratio = src.length / targetBins;
    for (let i = 0; i < targetBins; i++) {
      const start = Math.floor(i * ratio);
      const end = Math.min(src.length, Math.floor((i + 1) * ratio));
      let sum = 0;
      for (let j = start; j < end; j++) sum += src[j];
      out[i] = end > start ? Math.round(sum / (end - start)) : src[start];
    }
    return out;
  };

  const frameRef = useRef<FrameMessage | null>(null);
  useEffect(() => {
    frameRef.current = frame;
  }, [frame]);

  const tick = useCallback(() => {
    const st = stateRef.current;
    if (!st.running || !st.analyser || !st.freqBuffer || !st.timeBuffer) return;
    const { analyser, freqBuffer, timeBuffer } = st;
    // The type defs might be strict about ArrayBuffer vs ArrayBufferLike; cast for compatibility.
    // Cast via unknown to align with TypeScript definition expectations in some DOM lib versions.
    // The analyser TypeScript definitions in this project expect Uint8Array<ArrayBuffer>; our buffers satisfy runtime requirements.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    analyser.getByteFrequencyData(freqBuffer as any);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    analyser.getByteTimeDomainData(timeBuffer as any);
    let sumSquares = 0;
    for (let i = 0; i < timeBuffer.length; i++) {
      const centered = (timeBuffer[i] - 128) / 128;
      sumSquares += centered * centered;
    }
    const rms = Math.sqrt(sumSquares / timeBuffer.length);
    const volume = Math.min(255, Math.round(rms * 255));

    const freqs = downsample(freqBuffer, st.config.bins);
    const frameMsg: FrameMessage = {
      type: 'frame',
      timestamp: Date.now(),
      frequencies: freqs,
      volume,
      rms,
      binSizeHz: (st.audioCtx?.sampleRate || 0) / st.analyser!.fftSize,
      sampleRate: st.audioCtx?.sampleRate,
      latencyEstimateMs: 0,
    };
    st.framesGenerated++;
    setFrame(frameMsg);
  }, []);

  const loop = useCallback(() => {
    const st = stateRef.current;
    if (!st.running) return;
    const targetFrameMs = 1000 / st.config.fps;
    const now = performance.now();
    if (!lastRafTime.current || now - lastRafTime.current >= targetFrameMs) {
      const dt = now - lastRafTime.current;
      lastRafTime.current = now;
      tick();
      for (const cb of rafCallbacks.current) cb(frameRef.current, dt);
    }
    st.rafId = requestAnimationFrame(loop);
  }, [tick]);

  const start = useCallback(
    async (partial?: AudioEngineConfig) => {
      const st = stateRef.current;
      if (st.running || startingRef.current) return;
      startingRef.current = true;
      const base = st.config; // use current ref config to avoid re-creating callback when config state changes
      const resolved: ResolvedAudioEngineConfig = {
        fps: partial?.fps ?? base.fps,
        bins: partial?.bins ?? base.bins,
        smoothing: partial?.smoothing ?? base.smoothing,
        simulateLatencyMs: 0,
        seed: undefined,
      };
      console.log('[useMicAudioFrames] start() called', resolved);
      st.config = resolved;
      st.running = true;
      st.startedAt = Date.now();
      st.framesGenerated = 0;
      try {
        await buildAnalyser(resolved);
        if (stateRef.current.audioCtx?.state === 'suspended') {
          console.log('[useMicAudioFrames] audioCtx suspended, waiting for user gesture to resume');
          const resume = () => {
            stateRef.current.audioCtx?.resume().then(() => {
              console.log('[useMicAudioFrames] audioCtx resumed');
            });
            window.removeEventListener('pointerdown', resume);
            window.removeEventListener('keydown', resume);
          };
          window.addEventListener('pointerdown', resume);
          window.addEventListener('keydown', resume);
        }
        broadcastStatus();
        lastRafTime.current = performance.now();
        st.rafId = requestAnimationFrame(loop);
      } catch (err) {
        console.error('[useMicAudioFrames] microphone start failed', err);
        const e = err as unknown;
        if (typeof e === 'object' && e && 'message' in e) {
          setError(String((e as { message: unknown }).message));
        } else {
          setError(String(e));
        }
        st.running = false;
        broadcastStatus();
      } finally {
        startingRef.current = false;
      }
    },
    [buildAnalyser, broadcastStatus, loop],
  );

  const stop = useCallback(() => {
    const st = stateRef.current;
    if (!st.running) return;
    st.running = false;
    if (st.rafId) cancelAnimationFrame(st.rafId);
    st.analyser?.disconnect();
    st.source?.disconnect();
    st.audioCtx?.close();
    st.micStream?.getTracks().forEach((t) => t.stop());
    st.analyser = undefined;
    st.source = undefined;
    st.audioCtx = undefined;
    st.micStream = undefined;
    broadcastStatus();
  }, [broadcastStatus]);

  const updateConfig = useCallback(
    (patch: AudioEngineConfig) => {
      const st = stateRef.current;
      const newConf: ResolvedAudioEngineConfig = {
        fps: patch.fps ?? st.config.fps,
        bins: patch.bins ?? st.config.bins,
        smoothing: patch.smoothing ?? st.config.smoothing,
        simulateLatencyMs: 0,
        seed: undefined,
      };
      const wasRunning = st.running;
      if (wasRunning) {
        stop();
        // wait a tick to allow resources to release before restart
        setTimeout(() => start(newConf), 0);
      } else {
        start(newConf);
      }
    },
    [start, stop],
  );

  useEffect(() => {
    if (autoStart && !stateRef.current.running && !startingRef.current) {
      start();
    }
    return () => {
      stop();
    };
  }, [autoStart, start, stop]);

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
    metrics: null,
    error,
    start,
    stop,
    updateConfig,
    useAnimationFrame,
  };
}
