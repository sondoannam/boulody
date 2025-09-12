import React, { useState } from 'react';
import { HexColorPicker } from 'react-colorful';
import { GradientEditor } from './GradientEditor';
import { createDefaultColorConfig } from '../../constants/colors';
import type { ColorConfig, VisualizerColors } from '../../types';

interface ColorControlsProps {
  colors: VisualizerColors;
  onChange: (colors: VisualizerColors) => void;
  showSecondary?: boolean;
}

interface ColorModeSelectorProps {
  label: string;
  config: ColorConfig;
  onUpdate: (updates: Partial<ColorConfig>) => void;
  activeColorPicker: string | null;
  setActiveColorPicker: (value: string | null) => void;
}

const ColorModeSelector: React.FC<ColorModeSelectorProps> = ({
  label,
  config,
  onUpdate,
  activeColorPicker,
  setActiveColorPicker,
}) => (
  <div className="space-y-4 p-4 bg-white border border-gray-200 rounded-lg">
    <div className="flex items-center justify-between">
      <h3 className="text-sm font-medium text-gray-800">{label}</h3>
      <div className="flex bg-gray-100 rounded-md p-1 relative z-10">
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onUpdate({ mode: 'solid' });
          }}
          className={`px-3 py-1 text-sm font-medium rounded transition-colors cursor-pointer relative z-10 ${
            config.mode === 'solid'
              ? 'bg-white text-gray-800 shadow-sm'
              : 'text-gray-600 hover:text-gray-800'
          }`}
          style={{ pointerEvents: 'all' }}
        >
          Solid
        </button>
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onUpdate({ mode: 'gradient' });
          }}
          className={`px-3 py-1 text-sm font-medium rounded transition-colors cursor-pointer relative z-10 ${
            config.mode === 'gradient'
              ? 'bg-white text-gray-800 shadow-sm'
              : 'text-gray-600 hover:text-gray-800'
          }`}
          style={{ pointerEvents: 'all' }}
        >
          Gradient
        </button>
      </div>
    </div>

    {config.mode === 'solid' ? (
      <div className="space-y-3">
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            const newValue = activeColorPicker === `${label}-solid` ? null : `${label}-solid`;
            setActiveColorPicker(newValue);
          }}
          className="flex items-center gap-3 w-full p-3 bg-gray-50 border border-gray-200 rounded-md hover:bg-gray-100 transition-colors cursor-pointer"
        >
          <div
            className="w-8 h-8 rounded border border-gray-300 shadow-sm"
            style={{ backgroundColor: config.solidColor }}
          />
          <div className="text-left">
            <div className="font-medium text-gray-800">Color</div>
            <div className="text-sm text-gray-500">{config.solidColor}</div>
          </div>
        </button>

        {activeColorPicker === `${label}-solid` && (
          <div className="mt-3 p-4 border border-gray-300 rounded-lg bg-white">
            <HexColorPicker
              color={config.solidColor}
              onChange={(color) => onUpdate({ solidColor: color })}
            />
            <div className="mt-2 text-xs text-gray-500">Current color: {config.solidColor}</div>
          </div>
        )}
      </div>
    ) : (
      <GradientEditor value={config.gradient} onChange={(gradient) => onUpdate({ gradient })} />
    )}
  </div>
);

export const ColorControls: React.FC<ColorControlsProps> = ({
  colors,
  onChange,
  showSecondary = false,
}) => {
  const [activeColorPicker, setActiveColorPicker] = useState<string | null>(null);

  const updatePrimaryColor = (updates: Partial<ColorConfig>) => {
    onChange({
      ...colors,
      primary: { ...colors.primary, ...updates },
    });
  };

  const updateSecondaryColor = (updates: Partial<ColorConfig>) => {
    const secondary = colors.secondary || createDefaultColorConfig('#f59e0b');
    onChange({
      ...colors,
      secondary: { ...secondary, ...updates },
    });
  };


  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-800">Colors</h2>
        {showSecondary && (
          <button
            onClick={() => {
              if (colors.secondary) {
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                const { secondary, ...rest } = colors;
                // Remove secondary color
                onChange(rest);
              } else {
                onChange({
                  ...colors,
                  secondary: createDefaultColorConfig('#f59e0b'),
                });
              }
            }}
            className={`px-3 py-1 text-sm font-medium rounded transition-colors ${
              colors.secondary
                ? 'bg-red-100 text-red-700 hover:bg-red-200'
                : 'bg-green-100 text-green-700 hover:bg-green-200'
            }`}
          >
            {colors.secondary ? 'Remove Secondary' : 'Add Secondary'}
          </button>
        )}
      </div>

      <ColorModeSelector
        label="Primary Color"
        config={colors.primary}
        onUpdate={updatePrimaryColor}
        activeColorPicker={activeColorPicker}
        setActiveColorPicker={setActiveColorPicker}
      />

      {colors.secondary && (
        <ColorModeSelector
          label="Secondary Color"
          config={colors.secondary}
          onUpdate={updateSecondaryColor}
          activeColorPicker={activeColorPicker}
          setActiveColorPicker={setActiveColorPicker}
        />
      )}

      {/* Color Preview */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">Preview</label>
        <div className="flex gap-2">
          <div
            className="flex-1 h-16 rounded-lg border border-gray-300 shadow-sm"
            style={{
              background:
                colors.primary.mode === 'solid'
                  ? colors.primary.solidColor
                  : `linear-gradient(${colors.primary.gradient.angle}deg, ${colors.primary.gradient.stops
                      .sort((a, b) => a.position - b.position)
                      .map((stop) => `${stop.color} ${stop.position}%`)
                      .join(', ')})`,
            }}
          />
          {colors.secondary && (
            <div
              className="flex-1 h-16 rounded-lg border border-gray-300 shadow-sm"
              style={{
                background:
                  colors.secondary.mode === 'solid'
                    ? colors.secondary.solidColor
                    : `linear-gradient(${colors.secondary.gradient.angle}deg, ${colors.secondary.gradient.stops
                        .sort((a, b) => a.position - b.position)
                        .map((stop) => `${stop.color} ${stop.position}%`)
                        .join(', ')})`,
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
};
