import React from 'react';
import type { AudioSource, AudioState, AudioControls, VisualizerType, VisualizerColors } from '../types';
import { BarsVisualizer } from './visualizers/BarsVisualizer';
import { WaveVisualizer } from './visualizers/WaveVisualizer';
import { CircleVisualizer } from './visualizers/CircleVisualizer';
import { DebugVisualizer } from './visualizers/DebugVisualizer';
import { AudioSourceSelector } from './ui/AudioSourceSelector';
import { VisualizerSelector } from './ui/VisualizerSelector';
import { StatusIndicator } from './ui/StatusIndicator';
import { MicControls } from './ui/MicControls';
import { ErrorDisplay } from './ui/ErrorDisplay';
import { ColorControls } from './ui/ColorControls';
import { DEFAULT_VISUALIZER_COLORS } from '../constants/colors';

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
  const [colors, setColors] = React.useState<VisualizerColors>(DEFAULT_VISUALIZER_COLORS);
  const [showColorControls, setShowColorControls] = React.useState(false);
  const { frame, volume, status, error } = audioState;
  const { start, stop } = audioControls;

  return (
    <div className="w-full h-full max-w-screen flex flex-col h-full hidden-scrollbar">
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
            <button
              onClick={() => setShowColorControls(!showColorControls)}
              className={`px-4 py-2 rounded-md font-medium transition-colors ${
                showColorControls
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              🎨 Colors
            </button>
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

      {/* Main Content Area */}
      <div className="w-full flex gap-0">
        {/* Visualizer Display */}
        <div className="flex-1 flex items-center justify-center p-6 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
          <div className="w-full">
            {visualizerType === 'bars' && <BarsVisualizer frame={frame} />}
            {visualizerType === 'wave' && <WaveVisualizer frame={frame} />}
            {visualizerType === 'circle' && <CircleVisualizer frame={frame} />}
            {visualizerType === 'debug' && <DebugVisualizer frame={frame} />}
          </div>
        </div>

        {/* Color Controls Sidebar */}
        {showColorControls && (
          <div className="w-80 bg-gray-50 border-l border-gray-200 overflow-y-auto flex-shrink-0">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-800">Customize Colors</h2>
                <button
                  onClick={() => setShowColorControls(false)}
                  className="py-2 px-3 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded-md transition-colors"
                >
                  ✕
                </button>
              </div>
              <ColorControls
                colors={colors}
                onChange={setColors}
                showSecondary={visualizerType === 'bars'} // Example: only show secondary for bars
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
