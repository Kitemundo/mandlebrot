# Mandlebrot - Interactive Mandelbrot Set Visualizer

An interactive web application for exploring the Mandelbrot set fractal pattern. Built with Next.js, TypeScript, and Web Workers for optimal performance.

## Features

- Real-time Mandelbrot set visualization
- Interactive zooming with mouse wheel and click
- Pan functionality
- Dynamic color mapping
- Web Worker-based computation for smooth performance
- Responsive design

## Tech Stack

- Next.js 14
- TypeScript
- Tailwind CSS
- Web Workers
- HTML5 Canvas

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```
4. Open [http://localhost:3000](http://localhost:3000) in your browser

## How to Use

- Use the mouse wheel to zoom in/out
- Click and drag to pan around
- The color intensity represents the number of iterations before the point escapes the set

## Performance Considerations

- The visualization uses Web Workers to prevent UI blocking during computation
- Canvas rendering is optimized for smooth interaction
- Color mapping is done efficiently using lookup tables

## License

MIT 