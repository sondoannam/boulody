import React, { useMemo } from 'react';
import type { FrameMessage } from '@boulody/shared';

interface Props {
  frame: FrameMessage | null;
  bins?: number;
  height?: number;
}

export const BarsVisualizer: React.FC<Props> = ({ frame, bins = 64, height = 160 }) => {
  const subset = useMemo(() => {
    if (!frame) return [] as number[];
    const data = frame.frequencies;
    if (data.length <= bins) return Array.from(data);
    const stride = Math.floor(data.length / bins);
    const arr: number[] = [];
    for (let i = 0; i < bins; i++) arr.push(data[i * stride]);
    return arr;
  }, [frame, bins]);

  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 2, height }}>
      {subset.map((v, i) => (
        <div
          key={i}
          style={{
            width: 4,
            background: 'linear-gradient(180deg,#3ff,#09f)',
            height: (v / 255) * height,
            transition: 'height 60ms linear',
          }}
        />
      ))}
    </div>
  );
};
