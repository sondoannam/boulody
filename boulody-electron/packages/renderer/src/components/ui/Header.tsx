import React from 'react';
import type { TabType } from '../../types';

interface HeaderProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
}

export const Header: React.FC<HeaderProps> = ({ activeTab, setActiveTab }) => (
  <header className="bg-gray-800/80 backdrop-blur-sm border-b border-gray-700 sticky top-0 z-10">
    <div className="px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            🎵 Boulody Visualizer
          </h1>
        </div>
        
        {/* Tab Navigation */}
        <nav className="flex bg-gray-700/50 rounded-lg p-1">
          <button
            onClick={() => setActiveTab('visualizer')}
            className={`px-6 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
              activeTab === 'visualizer'
                ? 'bg-blue-600 text-white shadow-lg'
                : 'text-gray-300 hover:text-white hover:bg-gray-600'
            }`}
          >
            🎨 Visualizer
          </button>
          <button
            onClick={() => setActiveTab('demo')}
            className={`px-6 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
              activeTab === 'demo'
                ? 'bg-purple-600 text-white shadow-lg'
                : 'text-gray-300 hover:text-white hover:bg-gray-600'
            }`}
          >
            🧪 Demo
          </button>
        </nav>
      </div>
    </div>
  </header>
);
