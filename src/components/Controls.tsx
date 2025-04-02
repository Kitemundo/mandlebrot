'use client';

import { useState } from 'react';

interface ControlsProps {
  onColorChange: (color: string) => void;
  onIterationsChange: (iterations: number) => void;
  currentIterations: number;
  currentColor: string;
}

const colorPalettes = [
  { name: 'Grayscale', value: 'grayscale' },
  { name: 'Rainbow', value: 'rainbow' },
  { name: 'Fire', value: 'fire' },
  { name: 'Ocean', value: 'ocean' },
  { name: 'Forest', value: 'forest' },
];

export default function Controls({
  onColorChange,
  onIterationsChange,
  currentIterations,
  currentColor,
}: ControlsProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);

  return (
    <div className="bg-white p-4 rounded-lg shadow-md mb-4">
      <div className="flex flex-wrap gap-4 items-center">
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Color Palette
          </label>
          <select
            value={currentColor}
            onChange={(e) => onColorChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {colorPalettes.map((palette) => (
              <option key={palette.value} value={palette.value}>
                {palette.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Max Iterations
          </label>
          <input
            type="range"
            min="50"
            max="500"
            step="50"
            value={currentIterations}
            onChange={(e) => onIterationsChange(Number(e.target.value))}
            className="w-full"
          />
          <div className="text-sm text-gray-600 mt-1">{currentIterations}</div>
        </div>

        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {showAdvanced ? 'Hide Advanced' : 'Show Advanced'}
        </button>
      </div>

      {showAdvanced && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Advanced Settings</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Zoom Sensitivity
              </label>
              <input
                type="range"
                min="1"
                max="10"
                step="1"
                defaultValue="5"
                className="w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Render Quality
              </label>
              <select className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 