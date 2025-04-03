interface MandelbrotParams {
  width: number;
  height: number;
  maxIterations: number;
  xMin: number;
  xMax: number;
  yMin: number;
  yMax: number;
  chunkSize?: number;
  chunkIndex?: number;
}

// Optimize the mandelbrot calculation
function mandelbrot(x0: number, y0: number, maxIterations: number): number {
  let x = 0;
  let y = 0;
  let x2 = 0;
  let y2 = 0;
  let iteration = 0;
  
  // Optimization: Check if point is in the main cardioid or period-2 bulb
  const q = (x0 - 0.25) * (x0 - 0.25) + y0 * y0;
  if (q * (q + (x0 - 0.25)) < 0.25 * y0 * y0) return maxIterations;
  if ((x0 + 1) * (x0 + 1) + y0 * y0 < 0.0625) return maxIterations;
  
  // Optimization: Check if point is in the period-2 bulb
  if ((x0 + 0.5) * (x0 + 0.5) + y0 * y0 < 0.0625) return maxIterations;
  
  while (x2 + y2 <= 4 && iteration < maxIterations) {
    y = 2 * x * y + y0;
    x = x2 - y2 + x0;
    x2 = x * x;
    y2 = y * y;
    iteration++;
  }
  
  return iteration;
}

function generateMandelbrotSet(params: MandelbrotParams): number[] {
  const { width, height, maxIterations, xMin, xMax, yMin, yMax, chunkSize = 1000000, chunkIndex = 0 } = params;
  
  const totalPixels = width * height;
  const totalChunks = Math.ceil(totalPixels / chunkSize);
  const startIndex = chunkIndex * chunkSize;
  const endIndex = Math.min(startIndex + chunkSize, totalPixels);
  
  const result: number[] = new Array(endIndex - startIndex);
  const xStep = (xMax - xMin) / width;
  const yStep = (yMax - yMin) / height;
  
  // Process pixels in this chunk
  for (let i = startIndex; i < endIndex; i++) {
    const x = i % width;
    const y = Math.floor(i / width);
    const x0 = xMin + x * xStep;
    const y0 = yMin + y * yStep;
    result[i - startIndex] = mandelbrot(x0, y0, maxIterations);
  }
  
  return result;
}

self.onmessage = (e: MessageEvent<MandelbrotParams>) => {
  const result = generateMandelbrotSet(e.data);
  self.postMessage({
    result,
    chunkIndex: e.data.chunkIndex,
    totalChunks: Math.ceil((e.data.width * e.data.height) / (e.data.chunkSize || 1000000))
  });
}; 