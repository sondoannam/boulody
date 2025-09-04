import React from 'react';
import { useAudioFrames } from './useAudioFrames';
import { useMicAudioFrames } from './useMicAudioFrames';
import type { UseMicAudioFramesResult } from './useMicAudioFrames';
import type { AudioSource, AudioState, AudioControls, DisplayStats } from '../types';

interface UseAudioStateResult {
  audioState: AudioState;
  audioControls: AudioControls;
  displayStats: DisplayStats;
  bridgePresent: boolean;
}

export function useAudioState(source: AudioSource): UseAudioStateResult {
  const fake = useAudioFrames(source === 'fake');
  const mic = useMicAudioFrames(source === 'mic');
  
  const active:
    | (ReturnType<typeof useAudioFrames> & { error?: string | null })
    | UseMicAudioFramesResult = source === 'mic' ? mic : fake;
  
  const { frame, volume, status, updateConfig } = active;
  const start = (active as UseMicAudioFramesResult).start;
  const stop = (active as UseMicAudioFramesResult).stop;
  const error = (active as UseMicAudioFramesResult).error ?? null;
  
  interface AudioFramesWindow {
    audioFrames?: unknown;
  }
  const bridgePresent = typeof (window as unknown as AudioFramesWindow).audioFrames !== 'undefined';
  
  // Throttled counters - only update once per second to reduce re-renders
  const [displayStats, setDisplayStats] = React.useState<DisplayStats>({
    frameCount: 0,
    statusCount: 0,
    lastFrameTime: null,
    volume: 0
  });
  
  const lastFrameTimeRef = React.useRef<number | null>(null);
  const frameCountRef = React.useRef(0);
  const statusCountRef = React.useRef(0);

  React.useEffect(() => {
    if (frame) {
      frameCountRef.current++;
      lastFrameTimeRef.current = performance.now();
    }
  }, [frame]);

  React.useEffect(() => {
    if (status) statusCountRef.current++;
  }, [status]);

  // Update display stats only once per second
  React.useEffect(() => {
    const interval = setInterval(() => {
      setDisplayStats({
        frameCount: frameCountRef.current,
        statusCount: statusCountRef.current,
        lastFrameTime: lastFrameTimeRef.current,
        volume
      });
    }, 1000);
    
    return () => clearInterval(interval);
  }, [volume]);

  return {
    audioState: { frame, volume, status, error },
    audioControls: { start, stop, updateConfig },
    displayStats,
    bridgePresent
  };
}
