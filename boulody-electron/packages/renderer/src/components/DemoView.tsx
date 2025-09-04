import React from 'react';
import type { 
  AudioSource, 
  AudioState, 
  AudioControls, 
  DisplayStats, 
  VisualizerType 
} from '../types';
// AudioEngineConfig is used in the audioControls.updateConfig call
import { BarsVisualizer } from './visualizers/BarsVisualizer';
import { WaveVisualizer } from './visualizers/WaveVisualizer';
import { CircleVisualizer } from './visualizers/CircleVisualizer';
import { DebugVisualizer } from './visualizers/DebugVisualizer';
import { StatsDisplay } from './ui/StatsDisplay';
import { SelectMenu } from './ui/SelectMenu';

interface DemoViewProps {
  audioState: AudioState;
  source: AudioSource;
  setSource: (source: AudioSource) => void;
  audioControls: AudioControls;
  displayStats: DisplayStats;
  bridgePresent: boolean;
  localSmoothing: number | undefined;
  setLocalSmoothing: (value: number | undefined) => void;
}

export const DemoView: React.FC<DemoViewProps> = ({ 
  audioState,
  source, 
  setSource, 
  audioControls,
  displayStats, 
  bridgePresent, 
  localSmoothing, 
  setLocalSmoothing 
}) => {
  const [mode, setMode] = React.useState<VisualizerType>('bars');
  const { frame, status, error } = audioState;
  const { start, stop, updateConfig } = audioControls;

  return (
    <div className="space-y-6">
      <StatsDisplay
        source={source}
        status={status}
        volume={displayStats.volume}
        bridgePresent={bridgePresent}
        frameCount={displayStats.frameCount}
        statusCount={displayStats.statusCount}
        lastFrameTime={displayStats.lastFrameTime}
        error={error}
        localSmoothing={localSmoothing}
      />
      
      <div className="flex justify-center">
        <div className="w-full max-w-4xl">
          {mode === 'bars' && <BarsVisualizer frame={frame} />}
          {mode === 'wave' && <WaveVisualizer frame={frame} />}
          {mode === 'circle' && <CircleVisualizer frame={frame} />}
          {mode === 'debug' && <DebugVisualizer frame={frame} />}
        </div>
      </div>
      
      <div className="space-y-4">
        {source === 'fake' && (
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => {
                const s = Math.random() * 0.9;
                setLocalSmoothing(s);
                updateConfig({ smoothing: s });
              }}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-md transition-colors duration-200 font-medium"
            >
              🎛️ Randomize Smoothing
            </button>
            <button
              onClick={() => updateConfig({ bins: 64 + Math.floor(Math.random() * 128) })}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors duration-200 font-medium"
            >
              📊 Randomize Bins
            </button>
            <button
              onClick={() => updateConfig({ fps: 30 + Math.floor(Math.random() * 45) })}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md transition-colors duration-200 font-medium"
            >
              ⚡ Randomize FPS
            </button>
          </div>
        )}
        {source === 'mic' && (
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => {
                const s = Math.random() * 0.9;
                setLocalSmoothing(s);
                updateConfig({ smoothing: s });
              }}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-md transition-colors duration-200 font-medium"
            >
              🎛️ Randomize Smoothing
            </button>
            <button
              onClick={() => updateConfig({ bins: 64 + Math.floor(Math.random() * 128) })}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors duration-200 font-medium"
            >
              📊 Randomize Bins
            </button>
            {!status?.running && (
              <button 
                onClick={start}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md transition-colors duration-200 font-medium"
              >
                🎤 Start Mic
              </button>
            )}
            {status?.running && (
              <button 
                onClick={stop}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors duration-200 font-medium"
              >
                ⏹️ Stop Mic
              </button>
            )}
          </div>
        )}
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-300">Visualizer:</label>
            <SelectMenu
              value={mode}
              onChange={(value) => setMode(value as VisualizerType)}
              options={[
                { value: 'bars', label: 'Bars', icon: '📊' },
                { value: 'wave', label: 'Wave', icon: '🌊' },
                { value: 'circle', label: 'Circle', icon: '⭕' },
                { value: 'debug', label: 'Debug', icon: '🔧' },
              ]}
              placeholder="Select visualizer"
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-300">Audio Source:</label>
            <SelectMenu
              value={source}
              onChange={(value) => setSource(value as AudioSource)}
              options={[
                { value: 'fake', label: 'Demo Audio', icon: '🔊' },
                { value: 'mic', label: 'Microphone', icon: '🎤' },
              ]}
              placeholder="Select audio source"
            />
          </div>
        </div>
      </div>
      
      <div className="p-3 bg-gray-800/50 rounded-md">
        <div className="text-xs font-mono text-gray-400">
          <span className="text-gray-500">Raw Data:</span>{' '}
          {frame ? (
            <span className="text-green-400">
              First8: [{Array.from(frame.frequencies.slice(0, 8)).join(', ')}]
            </span>
          ) : (
            <span className="text-red-400">No frame data yet</span>
          )}
        </div>
      </div>
    </div>
  );
};
