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
  const [isMobile, setIsMobile] = useState(false);
  const [screenSize, setScreenSize] = useState<'mobile' | 'tablet' | 'desktop' | 'ultrawide'>('desktop');
  const videoRef = useRef<HTMLVideoElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Optimized Cloudinary URLs for different screen sizes
  const videoUrls = {
    mobile: "https://res.cloudinary.com/dmdjagtkx/video/upload/v1760393206/defipullen_A_continuation-style_digital_background_designed_f_4dae005a-f881-4411-826d-3b42be6cd65b_0_qnghsc.mp4?q=auto:f_auto:low&cs_srgb=true&b_rgb:000000&w_640&h_360&c_fill",
    tablet: "https://res.cloudinary.com/dmdjagtkx/video/upload/v1760393206/defipullen_A_continuation-style_digital_background_designed_f_4dae005a-f881-4411-826d-3b42be6cd65b_0_qnghsc.mp4?q=auto:f_auto:low&cs_srgb=true&b_rgb:000000&w_1024&h_576&c_fill",
    desktop: "https://res.cloudinary.com/dmdjagtkx/video/upload/v1760393206/defipullen_A_continuation-style_digital_background_designed_f_4dae005a-f881-4411-826d-3b42be6cd65b_0_qnghsc.mp4?q=auto:f_auto:low&cs_srgb=true&b_rgb:000000&w_1920&h_1080&c_fill",
    ultrawide: "https://res.cloudinary.com/dmdjagtkx/video/upload/v1760393206/defipullen_A_continuation-style_digital_background_designed_f_4dae005a-f881-4411-826d-3b42be6cd65b_0_qnghsc.mp4?q=auto:f_auto:low&cs_srgb=true&b_rgb:000000&w_2560&h_1080&c_fill"
  };

  // Static image fallback for mobile
  const staticImageFallback = "/hero-bg.png";

  // Get the appropriate video URL based on screen size
  const getVideoUrl = useCallback(() => {
    return videoUrls[screenSize];
  }, [screenSize]);

  // Detect screen size and device type
  const detectScreenSize = useCallback(() => {
    if (typeof window !== 'undefined') {
      const width = window.innerWidth;
      
      // Update screen size
      if (width < 768) {
        setScreenSize('mobile');
        setIsMobile(true);
      } else if (width >= 768 && width < 1024) {
        setScreenSize('tablet');
        setIsMobile(false);
      } else if (width >= 1024 && width < 1920) {
        setScreenSize('desktop');
        setIsMobile(false);
      } else {
        setScreenSize('ultrawide');
        setIsMobile(false);
      }
    }
  }, []);

  // Check connection speed and data saver preference
  const shouldLoadVideoBasedOnConnection = useCallback(() => {
    if (typeof window !== 'undefined') {
      // Always disable video on mobile to save data and improve performance
      if (isMobile) {
        return false;
      }
      
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
      
      // Check battery level if available
      if ('getBattery' in navigator) {
        (navigator as any).getBattery().then((battery: any) => {
          if (battery.level < 0.2) {
            return false;
          }
        });
      }
    }
    return true;
  }, [isMobile]);

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

  // Set up screen size detection
  useEffect(() => {
    detectScreenSize();
    
    const handleResize = () => {
      detectScreenSize();
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [detectScreenSize]);

  return (
    <section ref={heroRef} id="home" className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Video with Fallbacks */}
      <div
        className="absolute inset-0 z-0 w-full h-full"
        style={{ backgroundColor: '#0a0a0a' }} // Dark fallback color
      >
        {/* Static image fallback for mobile or when video fails */}
        {(isMobile || videoError) && (
          <div
            className="absolute inset-0 z-0 w-full h-full bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: `url(${staticImageFallback})`,
              backgroundSize: 'cover',
              backgroundPosition: screenSize === 'mobile' ? 'center' : 'center center'
            }}
          />
        )}
        
        {/* Loading indicator */}
        {loadingState === 'loading' && !isMobile && (
          <div className="absolute inset-0 z-10 flex items-center justify-center">
            <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 border-2 sm:border-3 md:border-4 border-yellow-400 border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}
        
        {/* Video for non-mobile devices */}
        {!videoError && shouldLoadVideo && !isMobile && (
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
              objectPosition: screenSize === 'ultrawide' ? 'center center' : 'center',
              opacity: videoLoaded ? 1 : 0,
              transition: 'opacity 0.5s ease-in-out'
            }}
          >
            <source src={getVideoUrl()} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        )}
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 md:py-20 lg:py-24">
        <div className="text-center">
          <motion.h1
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-white mb-4 sm:mb-6 px-2"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            Double your sells in <span className="text-yellow-400">90 days</span> or it&apos;s free
          </motion.h1>

          <motion.p
            className="text-lg sm:text-xl md:text-2xl text-gray-100 mb-6 sm:mb-8 max-w-3xl mx-auto px-4"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            High preforming marketing campaigns for brands
          </motion.p>

          {/* Hide video on very small mobile screens to improve performance */}
          {screenSize !== 'mobile' && (
            <motion.div
              className="mb-8 sm:mb-10 max-w-4xl mx-auto px-4"
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
          )}

          <motion.div
            className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center px-4"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <a
              href="#contact"
              className="inline-flex items-center justify-center px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base font-medium rounded-md transition-all duration-200 hover:opacity-90"
              style={{
                color: 'black',
                backgroundColor: '#FFD700'
              }}
            >
              Book Call
              <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" style={{ color: 'black' }} />
            </a>
            <Button variant="outline" size="lg" href="#solutions" className="border-white text-white hover:bg-black hover:text-white text-sm sm:text-base">
              Learn More
            </Button>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Hero;