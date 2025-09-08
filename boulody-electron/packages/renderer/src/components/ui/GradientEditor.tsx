import React, { useState, useRef, useCallback } from 'react';
import { HexColorPicker } from 'react-colorful';
import type { GradientConfig, GradientStop } from '../../types';

interface GradientEditorProps {
  value: GradientConfig;
  onChange: (gradient: GradientConfig) => void;
}

export const GradientEditor: React.FC<GradientEditorProps> = ({ value, onChange }) => {
  const [selectedStopIndex, setSelectedStopIndex] = useState<number>(0);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const timelineRef = useRef<HTMLDivElement>(null);

  // Generate CSS gradient string for preview
  const generateGradientCSS = useCallback((gradient: GradientConfig): string => {
    const stops = gradient.stops
      .sort((a, b) => a.position - b.position)
      .map(stop => `${stop.color} ${stop.position}%`)
      .join(', ');
    
    if (gradient.type === 'linear') {
      return `linear-gradient(${gradient.angle}deg, ${stops})`;
    } else {
      return `radial-gradient(circle, ${stops})`;
    }
  }, []);

  // Add new gradient stop
  const addStop = useCallback(() => {
    const newPosition = value.stops.length > 0 
      ? Math.min(100, Math.max(...value.stops.map(s => s.position)) + 20)
      : 50;
    
    const newStop: GradientStop = {
      color: '#ffffff',
      position: newPosition
    };

    onChange({
      ...value,
      stops: [...value.stops, newStop]
    });
  }, [value, onChange]);

  // Remove gradient stop
  const removeStop = useCallback((index: number) => {
    if (value.stops.length <= 2) return; // Keep minimum 2 stops
    
    const newStops = value.stops.filter((_, i) => i !== index);
    onChange({
      ...value,
      stops: newStops
    });

    // Adjust selected index if needed
    if (selectedStopIndex >= newStops.length) {
      setSelectedStopIndex(Math.max(0, newStops.length - 1));
    }
  }, [value, onChange, selectedStopIndex]);

  // Update stop color
  const updateStopColor = useCallback((index: number, color: string) => {
    const newStops = [...value.stops];
    newStops[index] = { ...newStops[index], color };
    onChange({
      ...value,
      stops: newStops
    });
  }, [value, onChange]);

  // Update stop position
  const updateStopPosition = useCallback((index: number, position: number) => {
    const clampedPosition = Math.max(0, Math.min(100, position));
    const newStops = [...value.stops];
    newStops[index] = { ...newStops[index], position: clampedPosition };
    onChange({
      ...value,
      stops: newStops
    });
  }, [value, onChange]);

  // Handle timeline click to move stop
  const handleTimelineClick = useCallback((event: React.MouseEvent<HTMLDivElement>) => {
    if (!timelineRef.current) return;
    
    const rect = timelineRef.current.getBoundingClientRect();
    const position = ((event.clientX - rect.left) / rect.width) * 100;
    updateStopPosition(selectedStopIndex, position);
  }, [selectedStopIndex, updateStopPosition]);

  const selectedStop = value.stops[selectedStopIndex];

  return (
    <div className="space-y-4">
      {/* Gradient Preview */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">Preview</label>
        <div 
          className="w-full h-12 rounded-lg border border-gray-300"
          style={{ background: generateGradientCSS(value) }}
        />
      </div>

      {/* Gradient Type */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">Type</label>
        <div className="flex gap-2">
          <button
            onClick={() => onChange({ ...value, type: 'linear' })}
            className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
              value.type === 'linear'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Linear
          </button>
          <button
            onClick={() => onChange({ ...value, type: 'radial' })}
            className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
              value.type === 'radial'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Radial
          </button>
        </div>
      </div>

      {/* Angle (for linear gradients) */}
      {value.type === 'linear' && (
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Angle: {value.angle}°
          </label>
          <input
            type="range"
            min="0"
            max="360"
            value={value.angle}
            onChange={(e) => onChange({ ...value, angle: parseInt(e.target.value) })}
            className="w-full"
          />
        </div>
      )}

      {/* Timeline */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">Color Stops</label>
        <div 
          ref={timelineRef}
          onClick={handleTimelineClick}
          className="relative w-full h-8 bg-gray-200 rounded cursor-pointer"
          style={{ background: generateGradientCSS(value) }}
        >
          {value.stops.map((stop, index) => (
            <div
              key={index}
              onClick={(e) => {
                e.stopPropagation();
                setSelectedStopIndex(index);
              }}
              className={`absolute top-0 w-4 h-8 cursor-pointer transform -translate-x-2 ${
                selectedStopIndex === index
                  ? 'bg-blue-500 border-2 border-white'
                  : 'bg-white border border-gray-400'
              } rounded-sm shadow-sm hover:shadow-md transition-shadow`}
              style={{ 
                left: `${stop.position}%`,
                backgroundColor: selectedStopIndex === index ? undefined : stop.color
              }}
            />
          ))}
        </div>
      </div>

      {/* Stop Controls */}
      {selectedStop && (
        <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-gray-700">Stop {selectedStopIndex + 1}</h4>
            <div className="flex gap-2">
              <button
                onClick={addStop}
                className="px-2 py-1 text-sm bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
              >
                Add
              </button>
              {value.stops.length > 2 && (
                <button
                  onClick={() => removeStop(selectedStopIndex)}
                  className="px-2 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                >
                  Remove
                </button>
              )}
            </div>
          </div>

          {/* Position Input */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Position: {selectedStop.position}%
            </label>
            <input
              type="range"
              min="0"
              max="100"
              value={selectedStop.position}
              onChange={(e) => updateStopPosition(selectedStopIndex, parseInt(e.target.value))}
              className="w-full"
            />
          </div>

          {/* Color Picker Toggle */}
          <div className="space-y-2">
            <button
              onClick={() => setShowColorPicker(!showColorPicker)}
              className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              <div 
                className="w-6 h-6 rounded border border-gray-300"
                style={{ backgroundColor: selectedStop.color }}
              />
              <span className="text-sm font-medium">{selectedStop.color}</span>
            </button>

            {showColorPicker && (
              <div className="mt-2">
                <HexColorPicker
                  color={selectedStop.color}
                  onChange={(color) => updateStopColor(selectedStopIndex, color)}
                />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
