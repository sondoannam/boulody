import React, { useEffect, useRef, useCallback } from 'react';
import type { FrameMessage } from '@boulody/shared';

interface Props {
  frame: FrameMessage | null;
  width?: number;
  height?: number;
  bins?: number;
  timeSlices?: number;
  colorScheme?: 'hot' | 'cool' | 'rainbow';
}

export const SpectrogramVisualizer: React.FC<Props> = ({
  frame,
  width = 600,
  height = 300,
  bins = 128,
  timeSlices = 200,
  colorScheme = 'hot'
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const lastFrame = useRef<FrameMessage | null>(null);
  const animationId = useRef<number>();
  
  // Store frequency history as a circular buffer
  const historyRef = useRef<Float32Array[]>([]);
  const historyIndex = useRef(0);

  // Color scheme functions
  const getColor = useCallback((intensity: number, scheme: string): [number, number, number] => {
    const i = Math.max(0, Math.min(1, intensity));
    
    switch (scheme) {
      case 'hot':
        if (i < 0.33) return [i * 3 * 255, 0, 0];
        if (i < 0.66) return [255, (i - 0.33) * 3 * 255, 0];
        return [255, 255, (i - 0.66) * 3 * 255];
      
      case 'cool':
        return [i * 255, i * 255, 255];
      
      case 'rainbow':
        const hue = i * 360;
        const c = 1;
        const x = c * (1 - Math.abs((hue / 60) % 2 - 1));
        const m = 0;
        let r = 0, g = 0, b = 0;
        
        if (hue < 60) [r, g, b] = [c, x, 0];
        else if (hue < 120) [r, g, b] = [x, c, 0];
        else if (hue < 180) [r, g, b] = [0, c, x];
        else if (hue < 240) [r, g, b] = [0, x, c];
        else if (hue < 300) [r, g, b] = [x, 0, c];
        else [r, g, b] = [c, 0, x];
        
        return [(r + m) * 255, (g + m) * 255, (b + m) * 255];
      
      default:
        return [i * 255, i * 255, i * 255];
    }
  }, []);

  // Initialize history buffer
  useEffect(() => {
    historyRef.current = Array.from({ length: timeSlices }, () => new Float32Array(bins));
    historyIndex.current = 0;
  }, [timeSlices, bins]);

  // Update frame reference and add to history
  useEffect(() => {
    if (frame) {
      lastFrame.current = frame;
      
      // Downsample frequency data to target bins
      const data = frame.frequencies;
      const downsampled = new Float32Array(bins);
      
      if (data.length <= bins) {
        for (let i = 0; i < Math.min(data.length, bins); i++) {
          downsampled[i] = data[i] / 255; // normalize to 0-1
        }
      } else {
        const stride = data.length / bins;
        for (let i = 0; i < bins; i++) {
          const start = Math.floor(i * stride);
          const end = Math.floor((i + 1) * stride);
          let sum = 0;
          for (let j = start; j < end; j++) sum += data[j];
          downsampled[i] = (sum / (end - start)) / 255;
        }
      }
      
      // Add to circular buffer
      historyRef.current[historyIndex.current] = downsampled;
      historyIndex.current = (historyIndex.current + 1) % timeSlices;
    }
  }, [frame, bins, timeSlices]);

  // Canvas drawing function
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);

    const history = historyRef.current;
    if (history.length === 0) return;

    // Calculate dimensions
    const sliceWidth = canvasWidth / timeSlices;
    const binHeight = canvasHeight / bins;

    // Create ImageData for efficient pixel manipulation
    const imageData = ctx.createImageData(canvasWidth, canvasHeight);
    const data = imageData.data;

    // Draw spectrogram from history
    for (let timeIndex = 0; timeIndex < timeSlices; timeIndex++) {
      // Calculate actual history index (newest on right)
      const actualIndex = (historyIndex.current - timeSlices + timeIndex + timeSlices) % timeSlices;
      const freqData = history[actualIndex];
      
      if (!freqData) continue;

      const x = Math.floor(timeIndex * sliceWidth);
      const xEnd = Math.floor((timeIndex + 1) * sliceWidth);

      for (let binIndex = 0; binIndex < bins; binIndex++) {
        const intensity = freqData[binIndex];
        const [r, g, b] = getColor(intensity, colorScheme);
        
        // Y coordinate (flip so low frequencies are at bottom)
        const y = Math.floor((bins - 1 - binIndex) * binHeight);
        const yEnd = Math.floor((bins - binIndex) * binHeight);

        // Fill the rectangle in ImageData
        for (let px = x; px < xEnd && px < canvasWidth; px++) {
          for (let py = y; py < yEnd && py < canvasHeight; py++) {
            const index = (py * canvasWidth + px) * 4;
            data[index] = r;     // R
            data[index + 1] = g; // G
            data[index + 2] = b; // B
            data[index + 3] = 255; // A
          }
        }
      }
    }

    // Draw the ImageData to canvas
    ctx.putImageData(imageData, 0, 0);

    // Draw frequency scale on the left
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.font = '10px monospace';
    ctx.textAlign = 'left';
    
    const maxFreq = lastFrame.current?.sampleRate ? lastFrame.current.sampleRate / 2 : 22050;
    const freqStep = Math.ceil(bins / 8); // Show ~8 frequency labels
    
    for (let i = 0; i < bins; i += freqStep) {
      const freq = (i / bins) * maxFreq;
      const y = canvasHeight - (i / bins) * canvasHeight;
      const freqText = freq >= 1000 ? `${(freq / 1000).toFixed(1)}k` : `${freq.toFixed(0)}`;
      ctx.fillText(freqText, 4, y - 2);
    }

    animationId.current = requestAnimationFrame(draw);
  }, [bins, timeSlices, colorScheme, getColor]);

  // Handle canvas resize
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const resizeObserver = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry) {
        const { width: containerWidth } = entry.contentRect;
        const actualWidth = width || containerWidth;
        
        // Set canvas size with device pixel ratio for crisp rendering
        const dpr = window.devicePixelRatio || 1;
        canvas.width = actualWidth * dpr;
        canvas.height = height * dpr;
        canvas.style.width = `${actualWidth}px`;
        canvas.style.height = `${height}px`;
        
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.scale(dpr, dpr);
        }
      }
    });

    resizeObserver.observe(container);
    return () => resizeObserver.disconnect();
  }, [width, height]);

  // Start animation loop
  useEffect(() => {
    draw();
    return () => {
      if (animationId.current) {
        cancelAnimationFrame(animationId.current);
      }
    };
  }, [draw]);

  return (
    <div ref={containerRef} style={{ width: width || '100%', height, position: 'relative' }}>
      <canvas 
        ref={canvasRef} 
        style={{ 
          display: 'block',
          width: '100%',
          height: '100%'
        }} 
      />
      <div style={{ 
        position: 'absolute', 
        top: 4, 
        right: 4, 
        fontSize: 10, 
        color: 'rgba(255,255,255,0.7)',
        fontFamily: 'monospace',
        textShadow: '1px 1px 2px rgba(0,0,0,0.8)'
      }}>
        Spectrogram ({colorScheme})
      </div>
    </div>
  );
};
