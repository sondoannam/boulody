import React from 'react';
import type { AudioSource, DisplayStats } from '../../types';
import type { AudioEngineStatus } from '@boulody/shared';

interface StatsDisplayProps {
  source: AudioSource;
  status: AudioEngineStatus | null;
  volume: number;
  bridgePresent: boolean;
  frameCount: number;
  statusCount: number;
  lastFrameTime: number | null;
  error: string | null;
  localSmoothing: number | undefined;
}

export const StatsDisplay: React.FC<StatsDisplayProps> = React.memo(({ 
  source, 
  status, 
  volume, 
  bridgePresent, 
  frameCount, 
  statusCount, 
  lastFrameTime, 
  error, 
  localSmoothing 
}) => (
  <div className="space-y-1">
    <div className="text-xs opacity-70 font-mono">
      <span className="inline-block px-2 py-1 bg-gray-800 rounded text-xs mr-2">
        {source === 'mic' ? '🎤 Microphone' : '🔊 Fake Engine'}
      </span>
      Status: <span className={status?.running ? 'text-green-400' : 'text-red-400'}>
        {status?.running ? 'running' : 'stopped'}
      </span> | 
      Bins: {status?.config?.bins} | 
      FPS: {status?.config?.fps}
    </div>
    <div className="text-xs opacity-70 font-mono">
      Volume: <span className="text-blue-400">{volume}</span> | 
      Frames: <span className="text-green-400">{status?.framesGenerated}</span>
    </div>
    {source === 'fake' && (
      <div className="text-xs opacity-60 font-mono">
        Bridge: <span className={bridgePresent ? 'text-green-400' : 'text-red-400'}>
          {bridgePresent ? 'connected' : 'disconnected'}
        </span> | 
        Local msgs: {frameCount} | Status msgs: {statusCount} | 
        Frame age: {lastFrameTime ? ((performance.now() - lastFrameTime) | 0) + 'ms' : 'n/a'}
      </div>
    )}
    {source === 'mic' && error && (
      <div className="text-red-400 text-xs mt-1 p-2 bg-red-900/20 rounded">
        🚫 Mic Error: {error}
      </div>
    )}
    <div className="text-xs opacity-70 font-mono">
      Smoothing: <span className="text-purple-400">{status?.config?.smoothing?.toFixed(2)}</span>
      {localSmoothing !== undefined && (
        <span className="text-gray-500"> (last set {localSmoothing.toFixed(2)})</span>
      )}
    </div>
  </div>
));
