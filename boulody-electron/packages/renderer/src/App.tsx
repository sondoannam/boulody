import React from 'react';
import { useAudioFrames } from './hooks/useAudioFrames';
import { useMicAudioFrames } from './hooks/useMicAudioFrames';
import type { UseMicAudioFramesResult } from './hooks/useMicAudioFrames';
import { BarsVisualizer } from './components/visualizers/BarsVisualizer';
import { WaveVisualizer } from './components/visualizers/WaveVisualizer';
import { CircleVisualizer } from './components/visualizers/CircleVisualizer';
import { DebugVisualizer } from './components/visualizers/DebugVisualizer';

const App: React.FC = () => {
  const [source, setSource] = React.useState<'fake' | 'mic'>('fake');
  const fake = useAudioFrames(source === 'fake');
  const mic = useMicAudioFrames(source === 'mic');
  const active:
    | (ReturnType<typeof useAudioFrames> & { error?: string | null })
    | UseMicAudioFramesResult = source === 'mic' ? mic : fake;
  const { frame, volume, status, updateConfig } = active;
  const start = (active as UseMicAudioFramesResult).start;
  const stop = (active as UseMicAudioFramesResult).stop;
  const error = (active as UseMicAudioFramesResult).error ?? null;
  interface AudioFramesWindow {
    audioFrames?: unknown;
  }
  const bridgePresent = typeof (window as unknown as AudioFramesWindow).audioFrames !== 'undefined';
  const [frameCount, setFrameCount] = React.useState(0);
  const [statusCount, setStatusCount] = React.useState(0);
  const lastFrameTimeRef = React.useRef<number | null>(null);

  React.useEffect(() => {
    if (frame) {
      setFrameCount((c) => c + 1);
      lastFrameTimeRef.current = performance.now();
    }
  }, [frame]);
  React.useEffect(() => {
    if (status) setStatusCount((c) => c + 1);
  }, [status]);
  const [localSmoothing, setLocalSmoothing] = React.useState<number | undefined>(undefined);

  const [mode, setMode] = React.useState<'bars' | 'wave' | 'circle' | 'debug'>('bars');

  return (
    <div
      style={{
        padding: 16,
        fontFamily: 'system-ui',
        color: '#eee',
        background: '#111',
        minHeight: '100vh',
      }}
    >
      <h1 style={{ marginTop: 0 }}>
        Boulody Visualizer ({source === 'mic' ? 'Microphone' : 'Fake Engine'})
      </h1>
      <div style={{ fontSize: 12, opacity: 0.7 }}>
        Source: {source} | Status: {status?.running ? 'running' : 'stopped'} | Bins:{' '}
        {status?.config.bins} | FPS Target: {status?.config.fps}
      </div>
      <div style={{ fontSize: 12, opacity: 0.7 }}>
        Volume: {volume} | Frames: {status?.framesGenerated}
      </div>
      {source === 'fake' && (
        <div style={{ fontSize: 11, opacity: 0.6 }}>
          Bridge: {bridgePresent ? 'yes' : 'no'} | Local frame msgs: {frameCount} | Status msgs:{' '}
          {statusCount} | Last frame age:{' '}
          {lastFrameTimeRef.current
            ? ((performance.now() - lastFrameTimeRef.current) | 0) + 'ms'
            : 'n/a'}
        </div>
      )}
      {source === 'mic' && error && (
        <div style={{ color: '#f55', fontSize: 12, marginTop: 4 }}>Mic Error: {error}</div>
      )}
      <div style={{ fontSize: 12, opacity: 0.7 }}>
        Smoothing (engine): {status?.config.smoothing?.toFixed(2)}{' '}
        {localSmoothing !== undefined && `(last set ${localSmoothing.toFixed(2)})`}
      </div>
      <div style={{ marginTop: 16 }}>
        {mode === 'bars' && <BarsVisualizer frame={frame} />}
        {mode === 'wave' && <WaveVisualizer frame={frame} />}
        {mode === 'circle' && <CircleVisualizer frame={frame} />}
        {mode === 'debug' && <DebugVisualizer frame={frame} />}
      </div>
      <div style={{ marginTop: 24 }}>
        {source === 'fake' && (
          <>
            <button
              onClick={() => {
                const s = Math.random() * 0.9;
                setLocalSmoothing(s);
                updateConfig({ smoothing: s });
              }}
            >
              Randomize Smoothing
            </button>
            <button
              style={{ marginLeft: 8 }}
              onClick={() => updateConfig({ bins: 64 + Math.floor(Math.random() * 128) })}
            >
              Randomize Bins
            </button>
            <button
              style={{ marginLeft: 8 }}
              onClick={() => updateConfig({ fps: 30 + Math.floor(Math.random() * 45) })}
            >
              Randomize FPS
            </button>
          </>
        )}
        {source === 'mic' && (
          <>
            <button
              onClick={() => {
                const s = Math.random() * 0.9;
                setLocalSmoothing(s);
                updateConfig({ smoothing: s });
              }}
            >
              Randomize Smoothing (Mic)
            </button>
            <button
              style={{ marginLeft: 8 }}
              onClick={() => updateConfig({ bins: 64 + Math.floor(Math.random() * 128) })}
            >
              Randomize Bins (Mic)
            </button>
            {!status?.running && (
              <button style={{ marginLeft: 8 }} onClick={() => start()}>
                Start Mic
              </button>
            )}
            {status?.running && (
              <button style={{ marginLeft: 8 }} onClick={() => stop()}>
                Stop Mic
              </button>
            )}
          </>
        )}
        <select
          style={{ marginLeft: 16 }}
          value={mode}
          onChange={(e) => setMode(e.target.value as 'bars' | 'wave' | 'circle' | 'debug')}
        >
          <option value="bars">Bars</option>
          <option value="wave">Wave</option>
          <option value="circle">Circle</option>
          <option value="debug">Debug</option>
        </select>
        <select
          style={{ marginLeft: 16 }}
          value={source}
          onChange={(e) => setSource(e.target.value as 'fake' | 'mic')}
        >
          <option value="fake">Fake Engine</option>
          <option value="mic">Microphone</option>
        </select>
      </div>
      <div style={{ marginTop: 16, fontSize: 11, fontFamily: 'monospace', whiteSpace: 'pre' }}>
        {frame ? `First8: ${Array.from(frame.frequencies.slice(0, 8)).join(', ')}` : 'No frame yet'}
      </div>
    </div>
  );
};

export default App;
