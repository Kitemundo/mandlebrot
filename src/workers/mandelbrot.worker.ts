interface MandelbrotParams {
  width: number;
  height: number;
  maxIterations: number;
  xMin: number;
  xMax: number;
  yMin: number;
  yMax: number;
}

function mandelbrot(x: number, y: number, maxIterations: number): number {
  let zx = 0;
  let zy = 0;
  let iteration = 0;

  while (zx * zx + zy * zy < 4 && iteration < maxIterations) {
    const temp = zx * zx - zy * zy + x;
    zy = 2 * zx * zy + y;
    zx = temp;
    iteration++;
  }

  return iteration;
}

function generateMandelbrotSet(params: MandelbrotParams): number[] {
  const { width, height, maxIterations, xMin, xMax, yMin, yMax } = params;
  const result = new Array(width * height);
  
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const real = xMin + (x * (xMax - xMin)) / width;
      const imag = yMin + (y * (yMax - yMin)) / height;
      result[y * width + x] = mandelbrot(real, imag, maxIterations);
    }
  }

  return result;
}

self.onmessage = (e: MessageEvent<MandelbrotParams>) => {
  const result = generateMandelbrotSet(e.data);
  self.postMessage(result);
}; 