import React, { useMemo } from 'react';
import type { FrameMessage } from '@boulody/shared';

interface Props {
  frame: FrameMessage | null;
  limit?: number;
}

export const DebugVisualizer: React.FC<Props> = ({ frame, limit = 32 }) => {
  const values = useMemo(
    () => (frame ? Array.from(frame.frequencies).slice(0, limit) : []),
    [frame, limit],
  );
  return (
    <div
      style={{
        fontFamily: 'monospace',
        fontSize: 11,
        lineHeight: 1.4,
        background: '#222',
        padding: 8,
        borderRadius: 4,
      }}
    >
      {values.length === 0
        ? 'No data'
        : values.map((v, i) => (
            <span key={i} style={{ color: '#0cf', marginRight: 4 }}>
              {v.toString().padStart(3, ' ')}
              {(i + 1) % 8 === 0 ? '\n' : ''}
            </span>
          ))}
    </div>
  );
};
