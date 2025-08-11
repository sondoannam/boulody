import React, { useEffect, useRef } from 'react';
import type { FrameMessage } from '@boulody/shared';

interface Props {
  frame: FrameMessage | null;
  size?: number;
  color?: string;
  radius?: number;
}

export const CircleVisualizer: React.FC<Props> = ({
  frame,
  size = 260,
  color = '#0ff',
  radius = 80,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const last = useRef<FrameMessage | null>(null);
  useEffect(() => {
    if (frame) last.current = frame;
  }, [frame]);

  useEffect(() => {
    let raf: number;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;
    const center = size / 2;
    function draw() {
      const f = last.current;
      ctx!.clearRect(0, 0, size, size);
      if (f) {
        const data = f.frequencies;
        const bars = Math.min(128, data.length);
        for (let i = 0; i < bars; i++) {
          const angle = (i / bars) * Math.PI * 2;
          const mag = data[i] / 255;
          const inner = radius;
          const outer = radius + mag * (size / 2 - radius - 10);
          const x1 = center + Math.cos(angle) * inner;
          const y1 = center + Math.sin(angle) * inner;
          const x2 = center + Math.cos(angle) * outer;
          const y2 = center + Math.sin(angle) * outer;
          ctx!.strokeStyle = color;
          ctx!.lineWidth = 2;
          ctx!.beginPath();
          ctx!.moveTo(x1, y1);
          ctx!.lineTo(x2, y2);
          ctx!.stroke();
        }
      }
      raf = requestAnimationFrame(draw);
    }
    draw();
    return () => cancelAnimationFrame(raf);
  }, [size, color, radius]);

  return <canvas ref={canvasRef} width={size} height={size} style={{ display: 'block' }} />;
};
