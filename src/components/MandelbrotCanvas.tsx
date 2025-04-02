'use client';

import { useEffect, useRef, useState } from 'react';
import Controls from './Controls';

interface Viewport {
  xMin: number;
  xMax: number;
  yMin: number;
  yMax: number;
}

interface ColorPalette {
  r: number;
  g: number;
  b: number;
}

const colorPalettes = {
  grayscale: (iterations: number, maxIterations: number): ColorPalette => {
    const intensity = iterations === maxIterations ? 0 : (iterations * 255) / maxIterations;
    return { r: intensity, g: intensity, b: intensity };
  },
  rainbow: (iterations: number, maxIterations: number): ColorPalette => {
    if (iterations === maxIterations) return { r: 0, g: 0, b: 0 };
    const hue = (iterations * 360) / maxIterations;
    const c = 1;
    const x = c * (1 - Math.abs(((hue / 60) % 2) - 1));
    const m = 0;
    const r = 0;
    const g = 0;
    const b = 0;
    let rgb: ColorPalette = { r: 0, g: 0, b: 0 };

    if (hue < 60) rgb = { r: c, g: x, b: 0 };
    else if (hue < 120) rgb = { r: x, g: c, b: 0 };
    else if (hue < 180) rgb = { r: 0, g: c, b: x };
    else if (hue < 240) rgb = { r: 0, g: x, b: c };
    else if (hue < 300) rgb = { r: x, g: 0, b: c };
    else rgb = { r: c, g: 0, b: x };

    return {
      r: Math.round((rgb.r + m) * 255),
      g: Math.round((rgb.g + m) * 255),
      b: Math.round((rgb.b + m) * 255),
    };
  },
  fire: (iterations: number, maxIterations: number): ColorPalette => {
    if (iterations === maxIterations) return { r: 0, g: 0, b: 0 };
    const intensity = iterations / maxIterations;
    return {
      r: Math.round(255 * intensity),
      g: Math.round(100 * intensity),
      b: Math.round(50 * intensity),
    };
  },
  ocean: (iterations: number, maxIterations: number): ColorPalette => {
    if (iterations === maxIterations) return { r: 0, g: 0, b: 0 };
    const intensity = iterations / maxIterations;
    return {
      r: Math.round(50 * intensity),
      g: Math.round(100 * intensity),
      b: Math.round(255 * intensity),
    };
  },
  forest: (iterations: number, maxIterations: number): ColorPalette => {
    if (iterations === maxIterations) return { r: 0, g: 0, b: 0 };
    const intensity = iterations / maxIterations;
    return {
      r: Math.round(50 * intensity),
      g: Math.round(255 * intensity),
      b: Math.round(50 * intensity),
    };
  },
};

export default function MandelbrotCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [viewport, setViewport] = useState<Viewport>({
    xMin: -2,
    xMax: 1,
    yMin: -1.5,
    yMax: 1.5,
  });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [maxIterations, setMaxIterations] = useState(100);
  const [currentColor, setCurrentColor] = useState('grayscale');
  const [isLoading, setIsLoading] = useState(false);
  const [coordinates, setCoordinates] = useState({ x: 0, y: 0 });
  const workerRef = useRef<Worker | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      workerRef.current = new Worker(
        new URL('../workers/mandelbrot.worker.ts', import.meta.url)
      );
    }

    return () => {
      workerRef.current?.terminate();
    };
  }, []);

  const renderMandelbrot = () => {
    const canvas = canvasRef.current;
    if (!canvas || !workerRef.current) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    setIsLoading(true);
    const { width, height } = canvas;
    const imageData = ctx.createImageData(width, height);

    workerRef.current.onmessage = (e) => {
      const iterations = e.data;
      const data = imageData.data;

      for (let i = 0; i < iterations.length; i++) {
        const iteration = iterations[i];
        const color = colorPalettes[currentColor as keyof typeof colorPalettes](
          iteration,
          maxIterations
        );
        
        const idx = i * 4;
        data[idx] = color.r;     // R
        data[idx + 1] = color.g; // G
        data[idx + 2] = color.b; // B
        data[idx + 3] = 255;     // A
      }

      ctx.putImageData(imageData, 0, 0);
      setIsLoading(false);
    };

    workerRef.current.postMessage({
      width,
      height,
      maxIterations,
      ...viewport,
    });
  };

  useEffect(() => {
    renderMandelbrot();
  }, [viewport, maxIterations, currentColor]);

  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // More controlled zoom factor
    const zoomFactor = e.deltaY > 0 ? 0.95 : 1.05;
    const width = viewport.xMax - viewport.xMin;
    const height = viewport.yMax - viewport.yMin;

    const newWidth = width * zoomFactor;
    const newHeight = height * zoomFactor;

    const xRatio = x / canvas.width;
    const yRatio = y / canvas.height;

    setViewport({
      xMin: viewport.xMin + width * (1 - zoomFactor) * xRatio,
      xMax: viewport.xMax - width * (1 - zoomFactor) * (1 - xRatio),
      yMin: viewport.yMin + height * (1 - zoomFactor) * yRatio,
      yMax: viewport.yMax - height * (1 - zoomFactor) * (1 - yRatio),
    });
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging) return;

    const dx = e.clientX - dragStart.x;
    const dy = e.clientY - dragStart.y;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const width = viewport.xMax - viewport.xMin;
    const height = viewport.yMax - viewport.yMin;

    setViewport({
      xMin: viewport.xMin - (width * dx) / canvas.width,
      xMax: viewport.xMax - (width * dx) / canvas.width,
      yMin: viewport.yMin - (height * dy) / canvas.height,
      yMax: viewport.yMax - (height * dy) / canvas.height,
    });

    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseMoveCoordinates = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const realX = viewport.xMin + (x * (viewport.xMax - viewport.xMin)) / canvas.width;
    const realY = viewport.yMin + (y * (viewport.yMax - viewport.yMin)) / canvas.height;

    setCoordinates({ x: realX, y: realY });
  };

  return (
    <div className="relative">
      <Controls
        onColorChange={setCurrentColor}
        onIterationsChange={setMaxIterations}
        currentIterations={maxIterations}
        currentColor={currentColor}
      />
      <div className="relative">
        <canvas
          ref={canvasRef}
          width={800}
          height={600}
          className="border border-gray-300 rounded-lg"
          onWheel={handleWheel}
          onMouseDown={handleMouseDown}
          onMouseMove={(e) => {
            handleMouseMove(e);
            handleMouseMoveCoordinates(e);
          }}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        />
        {isLoading && (
          <div className="absolute top-4 right-4 bg-black bg-opacity-50 text-white px-4 py-2 rounded-lg">
            Rendering...
          </div>
        )}
        <div className="absolute bottom-4 left-4 bg-black bg-opacity-50 text-white px-4 py-2 rounded-lg">
          X: {coordinates.x.toFixed(6)}, Y: {coordinates.y.toFixed(6)}
        </div>
      </div>
    </div>
  );
} 