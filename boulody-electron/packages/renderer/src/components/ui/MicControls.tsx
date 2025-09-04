import React from 'react';
import type { AudioSource, AudioControls } from '../../types';
import type { AudioEngineStatus } from '@boulody/shared';

interface MicControlsProps {
  source: AudioSource;
  status: AudioEngineStatus | null;
  start: AudioControls['start'];
  stop: AudioControls['stop'];
}

export const MicControls: React.FC<MicControlsProps> = ({ source, status, start, stop }) => {
  if (source !== 'mic') return null;

  return (
    <div className="flex gap-2">
      {!status?.running ? (
        <button
          onClick={start}
          className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-md text-sm font-medium transition-colors duration-200"
        >
          Start
        </button>
      ) : (
        <button
          onClick={stop}
          className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-md text-sm font-medium transition-colors duration-200"
        >
          Stop
        </button>
      )}
    </div>
  );
};
