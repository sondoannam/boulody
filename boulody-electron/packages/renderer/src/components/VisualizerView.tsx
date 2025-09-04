import React from 'react';
import type { AudioSource, AudioState, AudioControls, VisualizerType } from '../types';
import { BarsVisualizer } from './visualizers/BarsVisualizer';
import { WaveVisualizer } from './visualizers/WaveVisualizer';
import { CircleVisualizer } from './visualizers/CircleVisualizer';
import { DebugVisualizer } from './visualizers/DebugVisualizer';
import { AudioSourceSelector } from './ui/AudioSourceSelector';
import { VisualizerSelector } from './ui/VisualizerSelector';
import { StatusIndicator } from './ui/StatusIndicator';
import { MicControls } from './ui/MicControls';
import { ErrorDisplay } from './ui/ErrorDisplay';

interface VisualizerViewProps {
  audioState: AudioState;
  source: AudioSource;
  setSource: (source: AudioSource) => void;
  audioControls: Pick<AudioControls, 'start' | 'stop'>;
}

export const VisualizerView: React.FC<VisualizerViewProps> = ({ 
  audioState, 
  source, 
  setSource, 
  audioControls 
}) => {
  const [visualizerType, setVisualizerType] = React.useState<VisualizerType>('bars');
  const { frame, volume, status, error } = audioState;
  const { start, stop } = audioControls;

  return (
    <div className="flex flex-col h-full">
      {/* Header Controls */}
      <div className="bg-gray-800/50 backdrop-blur-sm border-b border-gray-700 p-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-6">
            <AudioSourceSelector source={source} setSource={setSource} />
            <VisualizerSelector 
              visualizerType={visualizerType} 
              setVisualizerType={setVisualizerType} 
            />
          </div>

          {/* Status and Controls */}
          <div className="flex items-center gap-4">
            <StatusIndicator status={status} volume={volume} />
            <MicControls 
              source={source} 
              status={status} 
              start={start} 
              stop={stop} 
            />
          </div>
        </div>

        <ErrorDisplay source={source} error={error} />
      </div>

      {/* Visualizer Display */}
      <div className="flex-1 flex items-center justify-center p-6 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
        <div className="w-full max-w-6xl">
          {visualizerType === 'bars' && <BarsVisualizer frame={frame} />}
          {visualizerType === 'wave' && <WaveVisualizer frame={frame} />}
          {visualizerType === 'circle' && <CircleVisualizer frame={frame} />}
          {visualizerType === 'debug' && <DebugVisualizer frame={frame} />}
        </div>
      </div>
    </div>
  );
};
