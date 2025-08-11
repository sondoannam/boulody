import { BrowserWindow, ipcMain } from 'electron';
import {
  AudioChannels,
  AudioEngineConfig,
  AudioEngineStatus,
  AudioFrame,
  FrameMessage,
  AudioMetrics,
  ResolvedAudioEngineConfig,
} from '@boulody/shared';

// Simple deterministic PRNG (Mulberry32) for optional seeding
function makeRng(seed: number) {
  let t = seed >>> 0;
  return function rng() {
    t += 0x6d2b79f5;
    let x = t;
    x = Math.imul(x ^ (x >>> 15), x | 1);
    x ^= x + Math.imul(x ^ (x >>> 7), x | 61);
    return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
  };
}

interface InternalState {
  config: ResolvedAudioEngineConfig;
  intervalId?: NodeJS.Timeout;
  running: boolean;
  startedAt: number;
  framesGenerated: number;
  framesSent: number;
  lastFrame?: AudioFrame;
  // perf metrics
  genDurations: number[]; // circular-ish small buffer
  worstGenerationMs: number;
  rng: () => number;
  frequencies: Uint8Array; // reused buffer
  working: Float32Array; // for smoothing math (0..1 space)
}

const DEFAULTS: ResolvedAudioEngineConfig = {
  fps: 60,
  bins: 128,
  smoothing: 0.7,
  simulateLatencyMs: 0,
};

export class FakeAudioEngine {
  private state: InternalState;
  private winProvider: () => BrowserWindow | undefined;

  constructor(winProvider: () => BrowserWindow | undefined) {
    this.winProvider = winProvider;
    this.state = this.createState(DEFAULTS);
    this.registerIpc();
  }

  private createState(config: ResolvedAudioEngineConfig, seed?: number): InternalState {
    return {
      config: { ...config, seed },
      running: false,
      intervalId: undefined,
      startedAt: 0,
      framesGenerated: 0,
      framesSent: 0,
      lastFrame: undefined,
      genDurations: [],
      worstGenerationMs: 0,
      rng: seed != null ? makeRng(seed) : Math.random,
      frequencies: new Uint8Array(config.bins),
      working: new Float32Array(config.bins),
    };
  }

  private resolveConfig(partial?: AudioEngineConfig): ResolvedAudioEngineConfig {
    return {
      fps: partial?.fps ?? DEFAULTS.fps,
      bins: partial?.bins ?? DEFAULTS.bins,
      smoothing: Math.min(0.99, Math.max(0, partial?.smoothing ?? DEFAULTS.smoothing)),
      simulateLatencyMs: Math.max(0, partial?.simulateLatencyMs ?? DEFAULTS.simulateLatencyMs),
      seed: partial?.seed,
    } as ResolvedAudioEngineConfig; // seed allowed on resolved for tracking
  }

  start(config?: AudioEngineConfig) {
    if (this.state.running) return; // guard double start
    const resolved = this.resolveConfig(config);
    // recreate state with possible new bin length & seed
    this.state = this.createState(resolved, config?.seed);
    this.state.running = true;
    this.state.startedAt = Date.now();
    const frameIntervalMs = 1000 / resolved.fps;
    console.log('[FakeAudioEngine] start', {
      fps: resolved.fps,
      bins: resolved.bins,
      smoothing: resolved.smoothing,
    });

    this.state.intervalId = setInterval(() => this.tick(), frameIntervalMs);
    this.broadcastStatus();
  }

  stop() {
    if (!this.state.running) return;
    if (this.state.intervalId) clearInterval(this.state.intervalId);
    this.state.intervalId = undefined;
    this.state.running = false;
    this.broadcastStatus();
  }

  updateConfig(patch: AudioEngineConfig) {
    const merged: AudioEngineConfig = { ...this.state.config, ...patch };
    const wasRunning = this.state.running;
    if (wasRunning) this.stop();
    this.start(merged);
  }

  getLastFrame() {
    return this.state.lastFrame;
  }

  private tick() {
    const start = performance.now();
    const { config, working, frequencies, rng } = this.state;
    const bins = config.bins;

    // Generate base spectrum shape + noise
    for (let i = 0; i < bins; i++) {
      const pos = i / (bins - 1); // 0..1
      // Base curve: stronger lows, rolled highs (simple exponential falloff)
      const base = Math.pow(1 - pos, 0.6);
      const slowNoise = 0.6 + 0.4 * Math.sin(Date.now() / 600 + pos * 6.28); // gentle movement
      const random = rng() * 0.3; // jitter
      // Kick / transient simulation occasionally influences low bins
      let transient = 0;
      if (i < bins * 0.15) {
        const phase = (Date.now() % 1200) / 1200; // 0..1 repeating ~1.2s
        if (phase < 0.05) transient = 1 - phase / 0.05; // quick decay
      }
      const raw = Math.min(1, Math.max(0, base * slowNoise + random + transient));
      // Smoothing: different attack vs decay (for responsiveness)
      const prev = working[i];
      const smoothing = config.smoothing;
      const attack = 0.25; // faster rise
      const next =
        raw > prev ? prev + (raw - prev) * attack : prev * smoothing + raw * (1 - smoothing);
      working[i] = next;
      frequencies[i] = Math.round(next * 255);
    }

    // Compute RMS & volume mapping
    let sumSquares = 0;
    for (let i = 0; i < bins; i++) {
      const v = working[i];
      sumSquares += v * v;
    }
    const rms = Math.sqrt(sumSquares / bins); // 0..1
    const volume = Math.min(255, Math.round(rms * 255));

    const frame: FrameMessage = {
      type: 'frame',
      timestamp: Date.now(),
      frequencies: frequencies.slice(0), // copy so renderer doesn't mutate shared buffer
      volume,
      rms,
      binSizeHz: undefined,
      sampleRate: undefined,
      latencyEstimateMs: config.simulateLatencyMs || 0,
    };

    this.state.lastFrame = frame;
    this.state.framesGenerated++;
    if (this.state.framesGenerated === 1) {
      console.log('[FakeAudioEngine] first frame generated', {
        volume,
        first8: Array.from(frame.frequencies.slice(0, 8)),
      });
    } else if (this.state.framesGenerated % 60 === 0) {
      console.log('[FakeAudioEngine] frame', this.state.framesGenerated, { volume });
    }

    // Simulate latency if configured
    if (config.simulateLatencyMs > 0) {
      setTimeout(() => this.pushFrame(frame), config.simulateLatencyMs);
    } else {
      this.pushFrame(frame);
    }

    const dur = performance.now() - start;
    this.state.genDurations.push(dur);
    if (this.state.genDurations.length > 120) this.state.genDurations.shift();
    if (dur > this.state.worstGenerationMs) this.state.worstGenerationMs = dur;
  }

  private pushFrame(frame: FrameMessage) {
    const win = this.winProvider();
    if (win && !win.isDestroyed()) {
      win.webContents.send(AudioChannels.frame, frame);
      this.state.framesSent++;
    }
  }

  private averageGenerationMs(): number {
    const arr = this.state.genDurations;
    if (!arr.length) return 0;
    return arr.reduce((a, b) => a + b, 0) / arr.length;
  }

  private broadcastStatus() {
    const win = this.winProvider();
    if (!win || win.isDestroyed()) return;
    const status: AudioEngineStatus = {
      type: 'status',
      running: this.state.running,
      config: this.state.config,
      startedAt: this.state.startedAt,
      framesGenerated: this.state.framesGenerated,
    };
    win.webContents.send(AudioChannels.status, status);
  }

  private broadcastMetrics() {
    const win = this.winProvider();
    if (!win || win.isDestroyed()) return;
    const metrics: AudioMetrics = {
      type: 'metrics',
      framesGenerated: this.state.framesGenerated,
      framesSent: this.state.framesSent,
      avgGenerationMs: this.averageGenerationMs(),
      worstGenerationMs: this.state.worstGenerationMs,
      lastFrameTimestamp: this.state.lastFrame?.timestamp,
      driftMs: undefined,
    };
    win.webContents.send(AudioChannels.metrics, metrics);
  }

  private registerIpc() {
    ipcMain.on(AudioChannels.control, (_event, msg) => {
      switch (msg?.type) {
        case 'start':
          this.start(msg.config);
          break;
        case 'stop':
          this.stop();
          break;
        case 'update-config':
          this.updateConfig(msg.patch || {});
          break;
        default:
          console.warn('[FakeAudioEngine] Unknown control message', msg);
      }
    });
  }

  // Can be called from devtools for debugging metrics
  exposeDevHelpers() {
    (global as any).__FAKE_AUDIO_ENGINE__ = {
      getState: () => ({ ...this.state, frequencies: undefined, working: undefined }),
      metrics: () => this.broadcastMetrics(),
      lastFrame: () => this.state.lastFrame,
    };
  }
}
