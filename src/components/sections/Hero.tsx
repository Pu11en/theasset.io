'use client';

import React, { useState, useEffect } from 'react';
import { ArrowRight } from 'lucide-react';
import Button from '@/components/ui/Button';
import { motion } from 'framer-motion';


const Hero: React.FC = () => {
  const [iframeSrc, setIframeSrc] = useState('');

  useEffect(() => {
    // Set the iframe src with a timestamp only on the client side
    setIframeSrc(`https://www.youtube.com/embed/4K4xOtBcuTo?cb=${Date.now()}`);
  }, []);
  return (
    <section id="home" className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: "url('/hero-bg-new.png')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          width: '100%',
          height: '100%'
        }}
      >
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="text-center">
          <motion.h1
            className="text-4xl md:text-6xl font-bold text-white mb-6"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            Double your sells in <span className="text-yellow-400">90 days</span> or it&apos;s free
          </motion.h1>

          <motion.p
            className="text-xl md:text-2xl text-gray-100 mb-8 max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            High preforming marketing campaigns for brands
          </motion.p>

          <motion.div
            className="mb-10 max-w-4xl mx-auto"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            <div className="relative w-full h-0 pb-[56.25%] rounded-lg overflow-hidden shadow-xl">
              {iframeSrc && (
                <iframe
                  className="absolute top-0 left-0 w-full h-full"
                  src={iframeSrc}
                  title="YouTube video player"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              )}
            </div>
          </motion.div>

          <motion.div
            className="flex flex-col sm:flex-row gap-4 justify-center"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <a
              href="#contact"
              className="inline-flex items-center justify-center px-6 py-3 text-base font-medium rounded-md transition-all duration-200 hover:opacity-90"
              style={{
                color: 'black',
                backgroundColor: '#FFD700'
              }}
            >
              Book Call
              <ArrowRight className="ml-2 h-5 w-5" style={{ color: 'black' }} />
            </a>
            <Button variant="outline" size="lg" href="#solutions" className="border-white text-white hover:bg-black hover:text-white">
              Learn More
            </Button>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Hero;