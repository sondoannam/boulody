import React from 'react';
import type { TabType, AudioSource } from './types';
import { useAudioState } from './hooks/useAudioState';
import { Header } from './components/ui/Header';
import { VisualizerView } from './components/VisualizerView';
import { DemoView } from './components/DemoView';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = React.useState<TabType>('visualizer');
  const [source, setSource] = React.useState<AudioSource>('fake');
  const [localSmoothing, setLocalSmoothing] = React.useState<number | undefined>(undefined);
  
  const { audioState, audioControls, displayStats, bridgePresent } = useAudioState(source);

  return (
    <div className="min-h-screen bg-gray-900 text-gray-200 flex flex-col">
      <Header activeTab={activeTab} setActiveTab={setActiveTab} />

      <main className="flex-1">
        {activeTab === 'visualizer' && (
          <VisualizerView
            audioState={audioState}
            source={source}
            setSource={setSource}
            audioControls={audioControls}
          />
        )}
        
        {activeTab === 'demo' && (
          <div className="p-6">
            <DemoView
              audioState={audioState}
              source={source}
              setSource={setSource}
              audioControls={audioControls}
              displayStats={displayStats}
              bridgePresent={bridgePresent}
              localSmoothing={localSmoothing}
              setLocalSmoothing={setLocalSmoothing}
            />
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
