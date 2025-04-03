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
  plasma: (iterations: number, maxIterations: number): ColorPalette => {
    if (iterations === maxIterations) return { r: 0, g: 0, b: 0 };
    const intensity = iterations / maxIterations;
    return {
      r: Math.round(255 * Math.sin(intensity * Math.PI)),
      g: Math.round(255 * Math.sin(intensity * Math.PI + 2 * Math.PI / 3)),
      b: Math.round(255 * Math.sin(intensity * Math.PI + 4 * Math.PI / 3)),
    };
  },
  aurora: (iterations: number, maxIterations: number): ColorPalette => {
    if (iterations === maxIterations) return { r: 0, g: 0, b: 0 };
    const intensity = iterations / maxIterations;
    return {
      r: Math.round(255 * Math.exp(-intensity * 2)),
      g: Math.round(255 * Math.exp(-intensity * 1.5)),
      b: Math.round(255 * Math.exp(-intensity)),
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
  const [showCoordinates, setShowCoordinates] = useState(true);
  const [showFPS, setShowFPS] = useState(true);
  const [fps, setFps] = useState(0);
  const lastFrameTime = useRef(performance.now());
  const frameCount = useRef(0);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [canvasSize, setCanvasSize] = useState({ width: 920, height: 690 });
  const resizeObserverRef = useRef<ResizeObserver | null>(null);
  const [renderingProgress, setRenderingProgress] = useState(0);
  const [totalChunks, setTotalChunks] = useState(0);
  const [renderedChunks, setRenderedChunks] = useState(0);
  const chunkSize = 1000000; // Increased chunk size for better performance
  const animationFrameRef = useRef<number>();
  const isRenderingRef = useRef(false);
  const renderTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastRenderTimeRef = useRef(0);
  const renderThrottleTime = 50; // ms between renders

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

  // Add resize observer to handle container size changes
  useEffect(() => {
    if (containerRef.current) {
      resizeObserverRef.current = new ResizeObserver((entries) => {
        for (const entry of entries) {
          const { width, height } = entry.contentRect;
          setCanvasSize({
            width: Math.floor(width),
            height: Math.floor(height)
          });
        }
      });
      
      resizeObserverRef.current.observe(containerRef.current);
    }

    return () => {
      if (resizeObserverRef.current) {
        resizeObserverRef.current.disconnect();
      }
    };
  }, []);

  const renderMandelbrot = () => {
    const canvas = canvasRef.current;
    if (!canvas || !workerRef.current) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Cancel any ongoing rendering
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    if (isRenderingRef.current) {
      isRenderingRef.current = false;
    }
    if (renderTimeoutRef.current) {
      clearTimeout(renderTimeoutRef.current);
    }

    // Throttle rendering to prevent stuttering
    const now = performance.now();
    if (now - lastRenderTimeRef.current < renderThrottleTime) {
      renderTimeoutRef.current = setTimeout(() => {
        renderMandelbrot();
      }, renderThrottleTime - (now - lastRenderTimeRef.current));
      return;
    }
    
    lastRenderTimeRef.current = now;
    setIsLoading(true);
    setRenderingProgress(0);
    setRenderedChunks(0);
    
    const { width, height } = canvas;
    const imageData = ctx.createImageData(width, height);
    const totalPixels = width * height;
    const totalChunks = Math.ceil(totalPixels / chunkSize);
    setTotalChunks(totalChunks);
    
    // Clear the canvas
    ctx.clearRect(0, 0, width, height);
    
    // Process chunks
    let currentChunk = 0;
    isRenderingRef.current = true;
    
    const processNextChunk = () => {
      if (!isRenderingRef.current || currentChunk >= totalChunks) {
        setIsLoading(false);
        return;
      }
      
      workerRef.current?.postMessage({
        width,
        height,
        maxIterations,
        ...viewport,
        chunkSize,
        chunkIndex: currentChunk
      });
      
      currentChunk++;
    };
    
    workerRef.current.onmessage = (e) => {
      if (!isRenderingRef.current) return;
      
      const { result, chunkIndex, totalChunks } = e.data;
      const data = imageData.data;
      
      // Calculate the start index for this chunk
      const startIndex = chunkIndex * chunkSize;
      
      // Update the image data with the results from this chunk
      for (let i = 0; i < result.length; i++) {
        const pixelIndex = startIndex + i;
        if (pixelIndex >= totalPixels) continue;
        
        const iteration = result[i];
        const color = colorPalettes[currentColor as keyof typeof colorPalettes](
          iteration,
          maxIterations
        );
        
        const idx = pixelIndex * 4;
        data[idx] = color.r;     // R
        data[idx + 1] = color.g; // G
        data[idx + 2] = color.b; // B
        data[idx + 3] = 255;     // A
      }
      
      // Update the canvas with the current progress
      ctx.putImageData(imageData, 0, 0);
      
      // Update progress
      setRenderedChunks(prev => {
        const newCount = prev + 1;
        setRenderingProgress(Math.round((newCount / totalChunks) * 100));
        return newCount;
      });
      
      // Schedule next chunk processing with a small delay to prevent UI blocking
      setTimeout(() => {
        if (isRenderingRef.current) {
          animationFrameRef.current = requestAnimationFrame(processNextChunk);
        }
      }, 5);
    };
    
    // Start processing chunks
    processNextChunk();
  };

  // Clean up animation frame on unmount
  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (renderTimeoutRef.current) {
        clearTimeout(renderTimeoutRef.current);
      }
      isRenderingRef.current = false;
    };
  }, []);

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

    // Reduce zoom sensitivity
    const zoomFactor = e.deltaY > 0 ? 0.98 : 1.02;
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

    // Reduce pan sensitivity
    const sensitivityFactor = 0.5;

    setViewport({
      xMin: viewport.xMin - (width * dx * sensitivityFactor) / canvas.width,
      xMax: viewport.xMax - (width * dx * sensitivityFactor) / canvas.width,
      yMin: viewport.yMin - (height * dy * sensitivityFactor) / canvas.height,
      yMax: viewport.yMax - (height * dy * sensitivityFactor) / canvas.height,
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

  // Add FPS calculation
  useEffect(() => {
    const updateFPS = () => {
      const now = performance.now();
      const delta = now - lastFrameTime.current;
      frameCount.current++;

      if (delta >= 1000) {
        setFps(Math.round((frameCount.current * 1000) / delta));
        frameCount.current = 0;
        lastFrameTime.current = now;
      }
    };

    const interval = setInterval(updateFPS, 1000);
    return () => clearInterval(interval);
  }, []);

  // Add double-click handler to reset view
  const handleDoubleClick = () => {
    const originalViewport = {
      xMin: -2,
      xMax: 1,
      yMin: -1.5,
      yMax: 1.5,
    };
    
    // Start animation
    const startViewport = { ...viewport };
    const startTime = performance.now();
    const duration = 2000; // 2 second animation (slower)
    
    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Ease out cubic function for smooth deceleration
      const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);
      const easedProgress = easeOut(progress);
      
      // Interpolate between start and original viewport
      const newViewport = {
        xMin: startViewport.xMin + (originalViewport.xMin - startViewport.xMin) * easedProgress,
        xMax: startViewport.xMax + (originalViewport.xMax - startViewport.xMax) * easedProgress,
        yMin: startViewport.yMin + (originalViewport.yMin - startViewport.yMin) * easedProgress,
        yMax: startViewport.yMax + (originalViewport.yMax - startViewport.yMax) * easedProgress,
      };
      
      setViewport(newViewport);
      
      // Continue animation if not complete
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    
    requestAnimationFrame(animate);
  };

  // Add fullscreen handler
  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
      setIsFullScreen(true);
    } else {
      document.exitFullscreen();
      setIsFullScreen(false);
    }
  };

  // Handle fullscreen change
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullScreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  return (
    <div className="relative w-full h-full" ref={containerRef}>
      <Controls
        maxIterations={maxIterations}
        setMaxIterations={setMaxIterations}
        currentColor={currentColor}
        setCurrentColor={setCurrentColor}
        onReset={handleDoubleClick}
      />
      <div className="relative w-full h-full">
        <canvas
          ref={canvasRef}
          width={1920}
          height={1080}
          className="w-full h-full cursor-crosshair"
          onWheel={handleWheel}
          onMouseDown={handleMouseDown}
          onMouseMove={(e) => {
            handleMouseMove(e);
            handleMouseMoveCoordinates(e);
          }}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onDoubleClick={handleDoubleClick}
        />
        {isLoading && (
          <div className="absolute inset-0 bg-gray-900/50 flex items-center justify-center">
            <div className="flex flex-col items-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
              <div className="text-white text-lg">Rendering: {renderingProgress}%</div>
            </div>
          </div>
        )}
        <div className="absolute top-4 right-4 flex flex-col gap-2">
          <button
            onClick={() => setShowCoordinates(!showCoordinates)}
            className="bg-gray-800/80 hover:bg-gray-700/80 text-white px-3 py-1 rounded-lg text-sm transition-colors"
          >
            {showCoordinates ? 'Hide' : 'Show'} Coordinates
          </button>
          <button
            onClick={() => setShowFPS(!showFPS)}
            className="bg-gray-800/80 hover:bg-gray-700/80 text-white px-3 py-1 rounded-lg text-sm transition-colors"
          >
            {showFPS ? 'Hide' : 'Show'} FPS
          </button>
          <button
            onClick={toggleFullScreen}
            className="bg-gray-800/80 hover:bg-gray-700/80 text-white px-3 py-1 rounded-lg text-sm transition-colors"
          >
            {isFullScreen ? 'Exit Fullscreen' : 'Fullscreen'}
          </button>
        </div>
        <div className="absolute bottom-4 left-4 bg-gray-800/80 text-white p-2 rounded-lg text-sm">
          {showCoordinates && (
            <div>
              X: {coordinates.x.toFixed(6)} | Y: {coordinates.y.toFixed(6)}
            </div>
          )}
          {showFPS && (
            <div className="mt-1">
              FPS: {fps} | Iterations: {maxIterations}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 