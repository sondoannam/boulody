import React from 'react';
import type { AudioSource } from '../../types';

interface AudioSourceSelectorProps {
  source: AudioSource;
  setSource: (source: AudioSource) => void;
}

export const AudioSourceSelector: React.FC<AudioSourceSelectorProps> = ({ source, setSource }) => (
  <div className="flex items-center gap-3">
    <span className="text-sm font-medium text-gray-300">Audio Source:</span>
    <div className="flex bg-gray-700 rounded-lg p-1">
      <button
        onClick={() => setSource('fake')}
        className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
          source === 'fake'
            ? 'bg-blue-600 text-white shadow-lg'
            : 'text-gray-300 hover:text-white hover:bg-gray-600'
        }`}
      >
        🔊 Demo Audio
      </button>
      <button
        onClick={() => setSource('mic')}
        className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
          source === 'mic'
            ? 'bg-green-600 text-white shadow-lg'
            : 'text-gray-300 hover:text-white hover:bg-gray-600'
        }`}
      >
        🎤 Microphone
      </button>
    </div>
  </div>
);
