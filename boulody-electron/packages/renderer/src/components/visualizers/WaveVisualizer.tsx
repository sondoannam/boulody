import React, { useEffect, useRef, useCallback } from 'react';
import type { FrameMessage } from '@boulody/shared';

interface Props {
  frame: FrameMessage | null;
  width?: number;
  height?: number;
  color?: string;
  lineWidth?: number;
  smoothing?: boolean;
  fillArea?: boolean;
}

export const WaveVisualizer: React.FC<Props> = ({
  frame,
  width,
  height = 120,
  color = '#0af',
  lineWidth = 2,
  smoothing = true,
  fillArea = false,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const lastFrame = useRef<FrameMessage | null>(null);
  const animationId = useRef<number>(undefined);

  // Update frame reference
  useEffect(() => {
    if (frame) lastFrame.current = frame;
  }, [frame]);

  // Canvas drawing function with optimizations
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    const f = lastFrame.current;
    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);

    if (!f) {
      animationId.current = requestAnimationFrame(draw);
      return;
    }

    const data = f.frequencies;
    if (data.length === 0) {
      animationId.current = requestAnimationFrame(draw);
      return;
    }

    // Set line properties
    ctx.strokeStyle = color;
    ctx.lineWidth = lineWidth;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // Begin path
    ctx.beginPath();

    // Draw the waveform
    for (let i = 0; i < data.length; i++) {
      const x = (i / (data.length - 1)) * canvasWidth;
      const y = canvasHeight - (data[i] / 255) * canvasHeight;
      
      if (i === 0) {
        ctx.moveTo(x, y);
      } else if (smoothing && i > 0 && i < data.length - 1) {
        // Smooth curve using quadratic bezier
        const prevX = ((i - 1) / (data.length - 1)) * canvasWidth;
        const prevY = canvasHeight - (data[i - 1] / 255) * canvasHeight;
        const cpX = (prevX + x) / 2;
        const cpY = (prevY + y) / 2;
        ctx.quadraticCurveTo(cpX, cpY, x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }

    // Stroke the path
    ctx.stroke();

    // Fill area under curve if requested
    if (fillArea) {
      ctx.lineTo(canvasWidth, canvasHeight);
      ctx.lineTo(0, canvasHeight);
      ctx.closePath();
      
      // Create gradient for fill
      const gradient = ctx.createLinearGradient(0, 0, 0, canvasHeight);
      gradient.addColorStop(0, color + '40'); // 25% opacity
      gradient.addColorStop(1, color + '10'); // 6% opacity
      
      ctx.fillStyle = gradient;
      ctx.fill();
    }

    animationId.current = requestAnimationFrame(draw);
  }, [color, lineWidth, smoothing, fillArea]);

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
