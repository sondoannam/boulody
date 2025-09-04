import React, { useEffect, useRef, useCallback } from 'react';
import type { FrameMessage } from '@boulody/shared';

interface Props {
  frame: FrameMessage | null;
  size?: number;
  color?: string;
  radius?: number;
  lineWidth?: number;
  maxBars?: number;
  rotationSpeed?: number;
  showCenter?: boolean;
}

export const CircleVisualizer: React.FC<Props> = ({
  frame,
  size,
  color = '#0ff',
  radius = 80,
  lineWidth = 2,
  maxBars = 128,
  rotationSpeed = 0.5,
  showCenter = true,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const lastFrame = useRef<FrameMessage | null>(null);
  const animationId = useRef<number>(undefined);
  const startTime = useRef<number>(Date.now());

  // Update frame reference
  useEffect(() => {
    if (frame) lastFrame.current = frame;
  }, [frame]);

  // Canvas drawing function with enhancements
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    const f = lastFrame.current;
    // Use the logical canvas size (after DPR scaling)
    const canvasWidth = canvas.width / (window.devicePixelRatio || 1);
    const canvasHeight = canvas.height / (window.devicePixelRatio || 1);
    const canvasSize = Math.min(canvasWidth, canvasHeight);
    const center = canvasSize / 2;
    
    // Scale radius proportionally, ensuring it fits within canvas
    const actualRadius = Math.min(radius, canvasSize * 0.15); // Max 15% of canvas size for inner radius
    
    // Clear canvas
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);

    // Calculate rotation
    const elapsed = Date.now() - startTime.current;
    const rotation = (elapsed * rotationSpeed) / 1000;

    // Draw center circle if requested
    if (showCenter) {
      ctx.strokeStyle = color + '40'; // 25% opacity
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(center, center, actualRadius, 0, Math.PI * 2);
      ctx.stroke();
    }

    if (f) {
      const data = f.frequencies;
      const bars = Math.min(maxBars, data.length);
      const angleStep = (Math.PI * 2) / bars;
      
      // Set line properties
      ctx.strokeStyle = color;
      ctx.lineWidth = lineWidth;
      ctx.lineCap = 'round';

      // Calculate max outer radius to ensure bars don't get clipped
      const maxOuter = (canvasSize / 2) - 10; // Leave 10px margin

      for (let i = 0; i < bars; i++) {
        const angle = (i * angleStep) + rotation;
        const mag = data[Math.floor((i / bars) * data.length)] / 255;
        
        // Calculate positions
        const inner = actualRadius;
        const outer = inner + mag * (maxOuter - inner);
        
        const x1 = center + Math.cos(angle) * inner;
        const y1 = center + Math.sin(angle) * inner;
        const x2 = center + Math.cos(angle) * outer;
        const y2 = center + Math.sin(angle) * outer;
        
        // Color variation based on frequency and magnitude
        const hue = (i / bars) * 360;
        const saturation = 70 + mag * 30;
        const lightness = 50 + mag * 30;
        ctx.strokeStyle = `hsl(${hue}, ${saturation}%, ${lightness}%)`;
        
        // Draw line
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
      }
    }

    animationId.current = requestAnimationFrame(draw);
  }, [color, radius, lineWidth, maxBars, rotationSpeed, showCenter]);

  // Handle canvas resize
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const resizeObserver = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry) {
        const { width: containerWidth, height: containerHeight } = entry.contentRect;
        // Ensure we have enough space for the full circle including maximum bar extensions
        const actualSize = size || Math.min(containerWidth, containerHeight);
        
        // Set canvas size with device pixel ratio for crisp rendering
        const dpr = window.devicePixelRatio || 1;
        canvas.width = actualSize * dpr;
        canvas.height = actualSize * dpr;
        canvas.style.width = `${actualSize}px`;
        canvas.style.height = `${actualSize}px`;
        
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.scale(dpr, dpr);
        }
      }
    });

    resizeObserver.observe(container);
    return () => resizeObserver.disconnect();
  }, [size]);

  // Start animation loop
  useEffect(() => {
    startTime.current = Date.now();
    draw();
    return () => {
      if (animationId.current) {
        cancelAnimationFrame(animationId.current);
      }
    };
  }, [draw]);

  const containerSize = size || '100%';

  return (
    <div 
      ref={containerRef} 
      style={{ 
        width: containerSize, 
        height: containerSize,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minWidth: 200,
        minHeight: 200,
        aspectRatio: '1 / 1', // Ensure square container
        margin: '0 auto' // Center horizontally if needed
      }}
    >
      <canvas 
        ref={canvasRef} 
        style={{ 
          display: 'block',
          maxWidth: '100%',
          maxHeight: '100%'
        }} 
      />
    </div>
  );
};
