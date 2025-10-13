"use client";

import { FlickeringGrid } from "@/components/ui/flickering-grid";

export function FlickeringGridDemo() {
  return (
    <div className="relative w-full h-screen bg-gray-900 overflow-hidden">
      <div className="absolute inset-0">
        <FlickeringGrid
          squareSize={4}
          gridGap={6}
          flickerChance={0.3}
          color="rgb(59, 130, 246)"
          maxOpacity={0.3}
          className="w-full h-full"
        />
      </div>
      
      <div className="relative z-10 flex flex-col items-center justify-center h-full text-white">
        <h1 className="text-6xl font-bold mb-4">Flickering Grid Demo</h1>
        <p className="text-xl max-w-2xl text-center mb-8">
          A beautiful animated grid background with customizable squares that flicker at random intervals
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl px-6">
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
            <h3 className="text-xl font-semibold mb-2">Customizable</h3>
            <p className="text-sm opacity-80">
              Adjust square size, grid gap, colors, and animation speed
            </p>
          </div>
          
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
            <h3 className="text-xl font-semibold mb-2">Performance Optimized</h3>
            <p className="text-sm opacity-80">
              Uses Canvas API and intersection observer for smooth performance
            </p>
          </div>
          
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
            <h3 className="text-xl font-semibold mb-2">Responsive</h3>
            <p className="text-sm opacity-80">
              Automatically adapts to container size and screen resolution
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}