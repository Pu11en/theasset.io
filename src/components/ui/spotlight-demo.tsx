'use client';

import React from 'react';
import SpotlightCard from './spotlight-card';

const SpotlightDemo: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-8">
      <div className="max-w-6xl w-full">
        <h1 className="text-4xl font-bold text-white text-center mb-12">
          Spotlight Card Demo
        </h1>
        
        <div className="flex flex-col lg:flex-row gap-8 justify-center items-center">
          {/* Blue Spotlight Card */}
          <SpotlightCard glowColor="blue" size="lg">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-500 rounded-full mx-auto mb-4 flex items-center justify-center">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Blue Lightning</h3>
              <p className="text-gray-300 text-sm">
                Experience the power of blue spotlight effects with smooth hover animations and glowing interactions.
              </p>
            </div>
          </SpotlightCard>

          {/* Purple Spotlight Card */}
          <SpotlightCard glowColor="purple" size="lg">
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-500 rounded-full mx-auto mb-4 flex items-center justify-center">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Purple Innovation</h3>
              <p className="text-gray-300 text-sm">
                Discover the elegance of purple spotlight effects that create a premium feel for your content.
              </p>
            </div>
          </SpotlightCard>

          {/* Green Spotlight Card */}
          <SpotlightCard glowColor="green" size="lg">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-500 rounded-full mx-auto mb-4 flex items-center justify-center">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Green Success</h3>
              <p className="text-gray-300 text-sm">
                Embrace the freshness of green spotlight effects that highlight your achievements and growth.
              </p>
            </div>
          </SpotlightCard>
        </div>

        <div className="mt-12 text-center">
          <p className="text-gray-400 text-sm">
            Hover over the cards to see the interactive spotlight effects in action
          </p>
        </div>
      </div>
    </div>
  );
};

export default SpotlightDemo;