import React, { useEffect, useRef } from 'react';
import type { FrameMessage } from '@boulody/shared';

interface Props {
  frame: FrameMessage | null;
  width?: number;
  height?: number;
  color?: string;
}

export const WaveVisualizer: React.FC<Props> = ({
  frame,
  width = 400,
  height = 120,
  color = '#0af',
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
    function draw() {
      const f = last.current;
      ctx!.clearRect(0, 0, width, height);
      if (f) {
        const data = f.frequencies;
        ctx!.beginPath();
        for (let i = 0; i < data.length; i++) {
          const x = (i / (data.length - 1)) * width;
          const y = height - (data[i] / 255) * height;
          if (i === 0) ctx!.moveTo(x, y);
          else ctx!.lineTo(x, y);
        }
        ctx!.strokeStyle = color;
        ctx!.lineWidth = 2;
        ctx!.stroke();
      }
      raf = requestAnimationFrame(draw);
    }
    draw();
    return () => cancelAnimationFrame(raf);
  }, [width, height, color]);

  return <canvas ref={canvasRef} width={width} height={height} style={{ display: 'block' }} />;
};
