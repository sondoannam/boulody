# Boulody

An exploratory Electron + React (Vite) audio visualization playground. It features a synthetic (fake) audio engine driven from the Electron main process via IPC plus an optional live microphone source processed in the renderer with the Web Audio API. A shared TypeScript package unifies message contracts between processes so visualizer components can consume a stable, typed data stream.

## Monorepo Structure
```
boulody/
  boulody-electron/
    package.json              # Root scripts (dev, build, start, package)
    pnpm-workspace.yaml       # Declares workspaces (main, renderer, shared)
    packages/
      shared/                 # Shared type library (@boulody/shared)
        src/audio.ts          # Canonical audio frame / status / metrics / control types & channels
      main/                   # Electron main process code
        src/index.ts          # App bootstrap, BrowserWindow, permission handling, engine start
        src/preload.ts        # ContextBridge exposing audioFrames IPC API
        src/audio/engine.ts   # FakeAudioEngine generating synthetic spectral frames
      renderer/               # React + Vite frontend
        src/hooks/useAudioFrames.ts     # IPC consumer hook (fake engine)
        src/hooks/useMicAudioFrames.ts  # Web Audio microphone hook
        src/components/visualizers/*    # Bars / Wave / Circle / Debug visualizers
        src/App.tsx           # UI shell, source & mode selection
```

## Key Features
- **Shared Contracts**: `@boulody/shared` centralizes `AudioFrame`, engine config, status, metrics, and IPC channel names.
- **Synthetic Engine** (main process): Deterministic noise + transient simulation producing frequency bins at configurable FPS, smoothing and bin count; broadcasts frames, status, metrics over IPC.
- **Preload Bridge**: Secure `contextBridge` surface (`window.audioFrames`) with listener registration (`onFrame`, `onStatus`, `onMetrics`) and control commands (`start`, `stop`, `updateConfig`).
- **Renderer Hooks**:
  - `useAudioFrames` subscribes to IPC feed (fake engine).
  - `useMicAudioFrames` captures microphone with Web Audio, downsamples frequency data, computes RMS/volume, mirrors fake engine frame shape.
- **Visualizers**: Multiple interchangeable components (Bars, Waveform, Radial Circle, Debug view) driven by the latest frame.
- **Source Switching**: Toggle between Fake Engine (IPC) and Microphone (Web Audio) seamlessly; shared UI controls adapt by source.
- **Permission Handling**: Main process auto-allows media/microphone requests; renderer mic hook handles suspended AudioContext resume on user gesture.
- **Developer Diagnostics**: Extensive console logging in engine, preload, and hooks to aid early-stage debugging (attach events, frame counts, permission requests, etc.).

## Development Scripts
Root (within `boulody-electron`):
- `pnpm dev` – Concurrently launches renderer (Vite), main TypeScript watcher, then Electron.
- `pnpm build` – Builds main (tsc) + renderer (Vite build + tsc project refs).
- `pnpm start` – Runs packaged Electron app pointing to built assets.
- `pnpm package` – (Placeholder script using `electron-builder` entry script) generate distributables.

Renderer (`packages/renderer`):
- `pnpm dev` – Standalone Vite dev server.
- `pnpm build` – Type check then produce production bundle.

Shared (`packages/shared`):
- `pnpm build` – Compile type definitions and JS (CommonJS) into `dist`.

## Data Flow Overview
1. Electron main boots, creates `BrowserWindow`, instantiates `FakeAudioEngine`, and starts frame generation.
2. Preload exposes `audioFrames` API and fires an `audio-bridge-ready` event.
3. Renderer `useAudioFrames` waits (if necessary) for bridge readiness, attaches IPC listeners, optionally issues a `start` command.
4. Frames (with frequency bins, volume, rms) flow to React state; visualizers re-render.
5. Microphone path bypasses IPC: `useMicAudioFrames` builds a Web Audio graph (MediaStream -> AnalyserNode), down-samples frequency bins to match requested `bins`, and emits frames on animation frames.

## Frame / Status Shape (Simplified)
```
FrameMessage {
  type: 'frame';
  timestamp: number;
  frequencies: Uint8Array; // 0-255 normalized magnitudes
  volume: number;           // 0-255 derived from RMS
  rms?: number;             // 0..1 root mean square
  sampleRate?: number;
  binSizeHz?: number;
  latencyEstimateMs?: number;
}
AudioEngineStatus {
  type: 'status';
  running: boolean;
  config: { fps; bins; smoothing; simulateLatencyMs; seed? }
  startedAt: number;
  framesGenerated: number;
}
```

## Current Implementation Notes
- **StrictMode Safe**: Hooks avoid stopping the global engine or re-starting mic endlessly during React 19 double effects.
- **Mic Hook Guards**: `startingRef` prevents overlapping calls; config updates restart cleanly.
- **Engine Smoothing**: Custom attack/decay smoothing; mic uses AnalyserNode smoothingTimeConstant plus separate decimation.
- **Potential Enhancements** (see Roadmap) intentionally deferred for clarity.

## Getting Started
Prerequisites: Node + pnpm.
```
cd boulody-electron
pnpm install
pnpm dev
```
In Electron window:
- Use dropdown to switch between Fake Engine and Microphone.
- Allow microphone access if prompted (or ensure OS permissions are enabled).

## Packaging (Prototype)
Run `pnpm build` then `pnpm start` for a production-like launch. `pnpm package` script scaffolds for future use with `electron-builder` (not fully configured yet: add appId, icons, platform targets).

## Roadmap Ideas
- Device selection (enumerate & switch input devices).
- Recording / export (PCM/WAV) and playback loopback.
- GPU-accelerated visualizers (WebGL / WebGPU) for higher bin counts.
- Persisted user settings (smoothing, bins, last source) in storage.
- Metrics panel with real-time generation & render timings.
- Latency estimation for microphone path.
- Crossfade transitions between sources.
- Test suite (unit tests for downsampling, engine math, hook behavior).

## Contributing / Dev Notes
- Shared types live in `@boulody/shared`; always update there first to keep IPC schema single-sourced.
- Keep preload surface minimal for security; never expose raw `ipcRenderer` to renderer.
- Prefer adding visualization modes as isolated components receiving only `FrameMessage`.
- If adding new outbound events, extend `AudioOutboundMessage` in shared package.

## License
Currently unspecified (default internal). Add an explicit license before external distribution.

---
Generated README reflecting repository state as of initial prototype milestone.
