import MandelbrotCanvas from '@/components/MandelbrotCanvas';

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-800 mb-8">Mandlebrot - Mandelbrot Set Visualizer</h1>
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <MandelbrotCanvas />
          <div className="mt-6 text-gray-600 space-y-2">
            <h2 className="text-lg font-semibold text-gray-800">How to Use</h2>
            <ul className="list-disc list-inside space-y-1">
              <li>Use the mouse wheel to zoom in/out</li>
              <li>Click and drag to pan around</li>
              <li>Select different color palettes from the dropdown</li>
              <li>Adjust max iterations to control detail level</li>
              <li>Coordinates are displayed at the bottom left</li>
            </ul>
          </div>
        </div>
      </div>
    </main>
  );
} 