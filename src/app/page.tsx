import MandelbrotCanvas from '@/components/MandelbrotCanvas';

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white">
      <div className="container mx-auto px-4 py-8">
        <header className="mb-8">
          <h1 className="text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
            Mandelbrot Explorer
          </h1>
          <p className="text-gray-400 mt-2">Interactive visualization of the Mandelbrot set</p>
        </header>
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-3">
            <div className="bg-gray-800 rounded-xl shadow-2xl overflow-hidden border border-gray-700 h-[800px]">
              <MandelbrotCanvas />
            </div>
          </div>
          
          <div className="lg:col-span-1">
            <div className="bg-gray-800 rounded-xl shadow-2xl p-6 border border-gray-700">
              <h2 className="text-xl font-semibold mb-4 text-blue-400">Controls</h2>
              <div className="space-y-4">
                <div className="bg-gray-700 p-4 rounded-lg">
                  <h3 className="text-sm font-medium text-gray-300 mb-2">Navigation</h3>
                  <ul className="text-sm text-gray-400 space-y-1">
                    <li>🖱️ Scroll to zoom in/out</li>
                    <li>🖱️ Click & drag to pan</li>
                    <li>🖱️ Double-click to reset view</li>
                    <li>🖱️ Toggle fullscreen for immersive view</li>
                  </ul>
                </div>
                
                <div className="bg-gray-700 p-4 rounded-lg">
                  <h3 className="text-sm font-medium text-gray-300 mb-2">About</h3>
                  <p className="text-sm text-gray-400">
                    The Mandelbrot set is a complex mathematical set that exhibits an elaborate and infinitely complex boundary. 
                    Explore its intricate patterns by zooming into different regions.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
} 