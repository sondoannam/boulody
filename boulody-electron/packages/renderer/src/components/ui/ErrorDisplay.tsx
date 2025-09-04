import React from 'react';
import type { AudioSource } from '../../types';

interface ErrorDisplayProps {
  source: AudioSource;
  error: string | null;
}

export const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ source, error }) => {
  if (source !== 'mic' || !error) return null;

  return (
    <div className="mt-3 p-3 bg-red-900/20 border border-red-800 rounded-md">
      <div className="flex items-center gap-2 text-red-400 text-sm">
        <span>🚫</span>
        <span>Microphone Error: {error}</span>
      </div>
    </div>
  );
};
