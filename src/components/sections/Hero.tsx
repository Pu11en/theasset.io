'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ArrowRight } from 'lucide-react';
import Button from '@/components/ui/Button';
import { motion } from 'framer-motion';

const Hero: React.FC = () => {
  const [iframeSrc, setIframeSrc] = useState('');
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const [shouldLoadVideo, setShouldLoadVideo] = useState(false);
  const [loadingState, setLoadingState] = useState<'idle' | 'loading' | 'loaded' | 'error'>('idle');
  const videoRef = useRef<HTMLVideoElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Optimized Cloudinary URL with quality and format parameters
  const optimizedVideoUrl = "https://res.cloudinary.com/dmdjagtkx/video/upload/v1760393206/defipullen_A_continuation-style_digital_background_designed_f_4dae005a-f881-4411-826d-3b42be6cd65b_0_qnghsc.mp4?q=auto:f_auto:low&cs_srgb=true&b_rgb:000000";

  // Check connection speed and data saver preference
  const shouldLoadVideoBasedOnConnection = useCallback(() => {
    if (typeof window !== 'undefined') {
      // Check for data saver preference
      if ('connection' in navigator && (navigator as any).connection.saveData) {
        return false;
      }
      
      // Check for slow connection
      if ('connection' in navigator) {
        const connection = (navigator as any).connection;
        const slowConnections = ['slow-2g', '2g', '3g'];
        if (slowConnections.includes(connection.effectiveType)) {
          return false;
        }
      }
    }
    return true;
  }, []);

  // Set up intersection observer for lazy loading
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && shouldLoadVideoBasedOnConnection()) {
            setShouldLoadVideo(true);
            setLoadingState('loading');
            observer.disconnect();
          }
        });
      },
      {
        rootMargin: '200px 0px', // Start loading 200px before the hero section is in view
        threshold: 0.1
      }
    );

    if (heroRef.current) {
      observer.observe(heroRef.current);
      observerRef.current = observer;
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [shouldLoadVideoBasedOnConnection]);

  useEffect(() => {
    // Set the iframe src with a timestamp only on the client side
    setIframeSrc(`https://www.youtube.com/embed/4K4xOtBcuTo?cb=${Date.now()}`);
  }, []);

  const handleVideoError = () => {
    setVideoError(true);
    setLoadingState('error');
  };

  const handleVideoLoadedData = () => {
    setVideoLoaded(true);
    setLoadingState('loaded');
  };

  const handleVideoCanPlay = () => {
    if (videoRef.current) {
      videoRef.current.play().catch(error => {
        console.error('Video autoplay failed:', error);
        setVideoError(true);
        setLoadingState('error');
      });
    }
  };

  return (
    <section ref={heroRef} id="home" className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Video with Fallbacks */}
      <div
        className="absolute inset-0 z-0 w-full h-full"
        style={{ backgroundColor: '#0a0a0a' }} // Dark fallback color
      >
        {/* Loading indicator */}
        {loadingState === 'loading' && (
          <div className="absolute inset-0 z-10 flex items-center justify-center">
            <div className="w-12 h-12 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}
        
        {!videoError && shouldLoadVideo && (
          <video
            ref={videoRef}
            className="absolute inset-0 z-0 w-full h-full object-cover"
            preload="metadata"
            autoPlay
            loop
            muted
            playsInline
            aria-label="Background video showing digital marketing animation"
            onError={handleVideoError}
            onLoadedData={handleVideoLoadedData}
            onCanPlay={handleVideoCanPlay}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              opacity: videoLoaded ? 1 : 0,
              transition: 'opacity 0.5s ease-in-out'
            }}
          >
            <source src={optimizedVideoUrl} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        )}
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