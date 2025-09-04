import React, { useEffect, useRef, useCallback } from 'react';
import type { FrameMessage } from '@boulody/shared';

interface Props {
  frame: FrameMessage | null;
  bins?: number;
  height?: number;
  width?: number;
  gap?: number;
  color?: string;
  gradientEnd?: string;
}

export const BarsVisualizer: React.FC<Props> = ({ 
  frame, 
  bins = 64, 
  height = 160, 
  width,
  gap = 1,
  color = '#3ff',
  gradientEnd = '#09f'
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const lastFrame = useRef<FrameMessage | null>(null);
  const animationId = useRef<number | undefined>(undefined);
  const gradientCache = useRef<CanvasGradient | null>(null);

  // Update frame reference
  useEffect(() => {
    if (frame) lastFrame.current = frame;
  }, [frame]);

  // Downsample data efficiently
  const downsample = useCallback((data: Uint8Array, targetBins: number): number[] => {
    if (data.length <= targetBins) return Array.from(data);
    const stride = data.length / targetBins;
    const result: number[] = [];
    for (let i = 0; i < targetBins; i++) {
      const start = Math.floor(i * stride);
      const end = Math.floor((i + 1) * stride);
      let sum = 0;
      for (let j = start; j < end; j++) sum += data[j];
      result.push(sum / (end - start));
    }
    return result;
  }, []);

  // Canvas drawing function
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    const f = lastFrame.current;
    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);

    if (!f) return;

    // Downsample data
    const data = downsample(f.frequencies, bins);
    const barWidth = Math.max(1, (canvasWidth - gap * (bins - 1)) / bins);
    const barSpacing = barWidth + gap;

    // Create or reuse gradient
    if (!gradientCache.current) {
      gradientCache.current = ctx.createLinearGradient(0, canvasHeight, 0, 0);
      gradientCache.current.addColorStop(0, gradientEnd);
      gradientCache.current.addColorStop(1, color);
    }

    ctx.fillStyle = gradientCache.current;

    // Draw bars
    for (let i = 0; i < data.length; i++) {
      const barHeight = (data[i] / 255) * canvasHeight;
      const x = i * barSpacing;
      const y = canvasHeight - barHeight;
      
      ctx.fillRect(x, y, barWidth, barHeight);
    }

    animationId.current = requestAnimationFrame(draw);
  }, [bins, gap, color, gradientEnd, downsample]);

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
        
        // Clear gradient cache when canvas changes
        gradientCache.current = null;
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
    <div ref={containerRef} style={{ width: width || '100%', height }}>
      <canvas 
        ref={canvasRef} 
        style={{ 
          display: 'block',
          width: '100%',
          height: '100%'
        }} 
      />
    </div>
  );
};
