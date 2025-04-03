'use client';

import { useState } from 'react';

interface ControlsProps {
  maxIterations: number;
  setMaxIterations: (value: number) => void;
  currentColor: string;
  setCurrentColor: (value: string) => void;
  onReset: () => void;
}

const colorOptions = [
  { value: 'grayscale', label: 'Grayscale' },
  { value: 'rainbow', label: 'Rainbow' },
  { value: 'fire', label: 'Fire' },
  { value: 'ocean', label: 'Ocean' },
  { value: 'forest', label: 'Forest' },
  { value: 'plasma', label: 'Plasma' },
  { value: 'aurora', label: 'Aurora' },
];

export default function Controls({
  maxIterations,
  setMaxIterations,
  currentColor,
  setCurrentColor,
  onReset,
}: ControlsProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  const handleColorChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setCurrentColor(e.target.value);
  };

  const handleIterationsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMaxIterations(Number(e.target.value));
  };

  return (
    <div className="absolute top-4 left-4 z-10 bg-gray-800/90 backdrop-blur-sm p-3 rounded-lg shadow-lg">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-medium text-gray-200">Settings</h3>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-gray-400 hover:text-gray-200 transition-colors text-xs"
        >
          {isExpanded ? '▼' : '▶'}
        </button>
      </div>

      {isExpanded && (
        <div className="space-y-3">
          <div className="space-y-1">
            <label className="block text-xs font-medium text-gray-300">
              Color Palette
            </label>
            <select
              value={currentColor}
              onChange={handleColorChange}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-2 py-1 text-white text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              {colorOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-medium text-gray-300">
              Max Iterations: {maxIterations}
            </label>
            <input
              type="range"
              min="50"
              max="1000"
              step="50"
              value={maxIterations}
              onChange={handleIterationsChange}
              className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-xs text-gray-400">
              <span>50</span>
              <span>1000</span>
            </div>
          </div>

          <button
            onClick={onReset}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium py-1 px-2 rounded-lg transition-colors"
          >
            Reset View
          </button>
        </div>
      )}
    </div>
  );
} 