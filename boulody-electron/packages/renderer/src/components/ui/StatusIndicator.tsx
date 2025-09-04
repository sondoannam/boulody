import React from 'react';
import type { AudioEngineStatus } from '@boulody/shared';

interface StatusIndicatorProps {
  status: AudioEngineStatus | null;
  volume: number;
}

export const StatusIndicator: React.FC<StatusIndicatorProps> = ({ status, volume }) => (
  <div className="flex items-center gap-4">
    {/* Status Indicator */}
    <div className="flex items-center gap-2">
      <div className={`w-3 h-3 rounded-full ${status?.running ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`} />
      <span className="text-sm text-gray-300">
        {status?.running ? 'Live' : 'Stopped'}
      </span>
    </div>

    {/* Volume Indicator */}
    <div className="flex items-center gap-2">
      <span className="text-xs text-gray-400">Vol:</span>
      <div className="w-16 h-2 bg-gray-700 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-green-400 to-blue-500 transition-all duration-100"
          style={{ width: `${Math.min(100, (volume / 255) * 100)}%` }}
        />
      </div>
      <span className="text-xs text-gray-400 w-8">{volume}</span>
    </div>
  </div>
);
