'use client';

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { ArrowRight, Play, Pause, Volume2, VolumeX } from 'lucide-react';
import Button from '@/components/ui/Button';
import { motion } from 'framer-motion';
import '@/styles/hero-button-styles.css';

// Type definitions for browser APIs that don't have proper TypeScript definitions
interface NetworkInformation {
  saveData: boolean;
  effectiveType: 'slow-2g' | '2g' | '3g' | '4g';
}

interface NavigatorWithConnection extends Navigator {
  connection?: NetworkInformation;
  getBattery?: () => Promise<BatteryManager>;
}

interface BatteryManager {
  level: number;
  charging: boolean;
  chargingTime: number;
  dischargingTime: number;
  addEventListener: (type: string, listener: EventListener) => void;
  removeEventListener: (type: string, listener: EventListener) => void;
}

const Hero: React.FC = () => {
  const [iframeSrc, setIframeSrc] = useState('');
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const [shouldLoadVideo, setShouldLoadVideo] = useState(false);
  const [loadingState, setLoadingState] = useState<'idle' | 'loading' | 'loaded' | 'error'>('idle');
  const [isMobile, setIsMobile] = useState(false);
  const [screenSize, setScreenSize] = useState<'mobile' | 'tablet' | 'desktop' | 'ultrawide'>('desktop');
  const [isVideoPlaying, setIsVideoPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [showVideoControls, setShowVideoControls] = useState(false);
  
  // Mobile-specific video state
  const [mobileVideoLoaded, setMobileVideoLoaded] = useState(false);
  const [mobileVideoError, setMobileVideoError] = useState(false);
  const [shouldLoadMobileVideo, setShouldLoadMobileVideo] = useState(false);
  const [mobileLoadingState, setMobileLoadingState] = useState<'idle' | 'loading' | 'loaded' | 'error'>('idle');
  const [isMobileVideoPlaying, setIsMobileVideoPlaying] = useState(true);
  const [showMobileVideoControls, setShowMobileVideoControls] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const mobileVideoRef = useRef<HTMLVideoElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const mobileObserverRef = useRef<IntersectionObserver | null>(null);
  const skipLinkRef = useRef<HTMLAnchorElement>(null);

  // Optimized Cloudinary URLs for different screen sizes
  const videoUrls = useMemo(() => ({
    mobile: "https://res.cloudinary.com/dmdjagtkx/video/upload/v1760393206/defipullen_A_continuation-style_digital_background_designed_f_4dae005a-f881-4411-826d-3b42be6cd65b_0_qnghsc.mp4?q=auto:f_auto:low&cs_srgb=true&b_rgb:000000&w_640&h_360&c_fill",
    tablet: "https://res.cloudinary.com/dmdjagtkx/video/upload/v1760393206/defipullen_A_continuation-style_digital_background_designed_f_4dae005a-f881-4411-826d-3b42be6cd65b_0_qnghsc.mp4?q=auto:f_auto:low&cs_srgb=true&b_rgb:000000&w_1024&h_576&c_fill",
    desktop: "https://res.cloudinary.com/dmdjagtkx/video/upload/v1760393206/defipullen_A_continuation-style_digital_background_designed_f_4dae005a-f881-4411-826d-3b42be6cd65b_0_qnghsc.mp4?q=auto:f_auto:low&cs_srgb=true&b_rgb:000000&w_1920&h_1080&c_fill",
    ultrawide: "https://res.cloudinary.com/dmdjagtkx/video/upload/v1760393206/defipullen_A_continuation-style_digital_background_designed_f_4dae005a-f881-4411-826d-3b42be6cd65b_0_qnghsc.mp4?q=auto:f_auto:low&cs_srgb=true&b_rgb:000000&w_2560&h_1080&c_fill"
  }), []);

  // Mobile-specific video URL
  const mobileVideoUrl = useMemo(() =>
    "https://res.cloudinary.com/dmdjagtkx/video/upload/v1760404471/social_defipullen_A_continuation-style_digital_background_designed_f_41c365bc-4f40-49b8-b75c-c69d883435a2_0_wdoxfx.mp4?q=auto:f_auto:low&cs_srgb=true&b_rgb:000000&w_640&h_360&c_fill",
  []);
  
  // Mobile video poster frame
  const mobileVideoPoster = useMemo(() =>
    "https://res.cloudinary.com/dmdjagtkx/video/upload/v1760404471/social_defipullen_A_continuation-style_digital_background_designed_f_41c365bc-4f40-49b8-b75c-c69d883435a2_0_wdoxfx.jpg?w_640&h_360&c_fill&f_auto&q_auto:low",
  []);

  // Static image fallback for mobile
  const staticImageFallback = "/hero-bg.png";

  // Get the appropriate video URL based on screen size
  const getVideoUrl = useCallback(() => {
    return videoUrls[screenSize];
  }, [screenSize, videoUrls]);

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

  // Check for user's motion preferences
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      setPrefersReducedMotion(mediaQuery.matches);
      
      const handleChange = (e: MediaQueryListEvent) => {
        setPrefersReducedMotion(e.matches);
      };
      
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, []);

  // Check connection speed and data saver preference for desktop video
  const shouldLoadVideoBasedOnConnection = useCallback(() => {
    if (typeof window !== 'undefined') {
      // Always disable desktop video on mobile to save data and improve performance
      if (isMobile) {
        return false;
      }
      
      // Check for data saver preference
      if ('connection' in navigator && (navigator as NavigatorWithConnection).connection?.saveData) {
        return false;
      }
      
      // Check for slow connection
      if ('connection' in navigator) {
        const connection = (navigator as NavigatorWithConnection).connection;
        const slowConnections = ['slow-2g', '2g', '3g'];
        if (connection && slowConnections.includes(connection.effectiveType)) {
          return false;
        }
      }
      
      // Check battery level if available
      if ('getBattery' in navigator) {
        (navigator as NavigatorWithConnection).getBattery?.().then((battery: BatteryManager) => {
          if (battery.level < 0.2) {
            return false;
          }
        });
      }
    }
    return true;
  }, [isMobile]);

  // Check if mobile video should be loaded based on connection and device capabilities
  const shouldLoadMobileVideoBasedOnConnection = useCallback(() => {
    if (typeof window !== 'undefined') {
      // Only load mobile video on mobile devices
      if (!isMobile) {
        return false;
      }
      
      // Check for data saver preference
      if ('connection' in navigator && (navigator as NavigatorWithConnection).connection?.saveData) {
        return false;
      }
      
      // Check for very slow connections
      if ('connection' in navigator) {
        const connection = (navigator as NavigatorWithConnection).connection;
        const verySlowConnections = ['slow-2g', '2g'];
        if (connection && verySlowConnections.includes(connection.effectiveType)) {
          return false;
        }
      }
      
      // Check battery level if available
      if ('getBattery' in navigator) {
        (navigator as NavigatorWithConnection).getBattery?.().then((battery: BatteryManager) => {
          if (battery.level < 0.1) {
            return false;
          }
        });
      }
    }
    return true;
  }, [isMobile]);

  // Set up intersection observer for lazy loading (desktop video)
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

  // Set up intersection observer for mobile video lazy loading
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && shouldLoadMobileVideoBasedOnConnection()) {
            setShouldLoadMobileVideo(true);
            setMobileLoadingState('loading');
            observer.disconnect();
          }
        });
      },
      {
        rootMargin: '100px 0px', // Start loading 100px before the hero section is in view for mobile
        threshold: 0.1
      }
    );

    if (heroRef.current) {
      observer.observe(heroRef.current);
      mobileObserverRef.current = observer;
    }

    return () => {
      if (mobileObserverRef.current) {
        mobileObserverRef.current.disconnect();
      }
    };
  }, [shouldLoadMobileVideoBasedOnConnection]);

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

  // Mobile video event handlers
  const handleMobileVideoError = () => {
    setMobileVideoError(true);
    setMobileLoadingState('error');
  };

  const handleMobileVideoLoadedData = () => {
    setMobileVideoLoaded(true);
    setMobileLoadingState('loaded');
  };

  const handleMobileVideoCanPlay = () => {
    if (mobileVideoRef.current) {
      mobileVideoRef.current.play().catch(error => {
        console.error('Mobile video autoplay failed:', error);
        setMobileVideoError(true);
        setMobileLoadingState('error');
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

  // Video control functions
  const toggleVideoPlay = useCallback(() => {
    if (videoRef.current) {
      if (isVideoPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play().catch(error => {
          console.error('Video play failed:', error);
        });
      }
      setIsVideoPlaying(!isVideoPlaying);
    }
  }, [isVideoPlaying]);

  const toggleMute = useCallback(() => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  }, [isMuted]);

  // Mobile video control functions
  const toggleMobileVideoPlay = useCallback(() => {
    if (mobileVideoRef.current) {
      if (isMobileVideoPlaying) {
        mobileVideoRef.current.pause();
      } else {
        mobileVideoRef.current.play().catch(error => {
          console.error('Mobile video play failed:', error);
        });
      }
      setIsMobileVideoPlaying(!isMobileVideoPlaying);
    }
  }, [isMobileVideoPlaying]);

  const toggleMobileMute = useCallback(() => {
    if (mobileVideoRef.current) {
      mobileVideoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  }, [isMuted]);

  // Handle keyboard navigation for video controls
  const handleVideoKeyDown = useCallback((e: React.KeyboardEvent) => {
    switch (e.key) {
      case ' ':
      case 'Enter':
        e.preventDefault();
        toggleVideoPlay();
        break;
      case 'm':
      case 'M':
        e.preventDefault();
        toggleMute();
        break;
      case 'Escape':
        e.preventDefault();
        setShowVideoControls(false);
        break;
    }
  }, [toggleVideoPlay, toggleMute]);

  // Handle keyboard navigation for mobile video controls
  const handleMobileVideoKeyDown = useCallback((e: React.KeyboardEvent) => {
    switch (e.key) {
      case ' ':
      case 'Enter':
        e.preventDefault();
        toggleMobileVideoPlay();
        break;
      case 'm':
      case 'M':
        e.preventDefault();
        toggleMobileMute();
        break;
      case 'Escape':
        e.preventDefault();
        setShowMobileVideoControls(false);
        break;
    }
  }, [toggleMobileVideoPlay, toggleMobileMute]);

  // Focus management for skip link
  useEffect(() => {
    const handleFocus = () => {
      if (skipLinkRef.current) {
        skipLinkRef.current.focus();
      }
    };

    document.addEventListener('keydown', handleFocus);
    return () => document.removeEventListener('keydown', handleFocus);
  }, []);

  return (
    <>
      {/* Skip to main content link for screen readers */}
      <a
        ref={skipLinkRef}
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-electric-blue text-white px-4 py-2 rounded-md z-50 focus:outline-none focus:ring-2 focus:ring-white"
      >
        Skip to main content
      </a>
      
      <section
        ref={heroRef}
        id="home"
        className="hero relative min-h-screen flex items-center justify-center overflow-hidden"
        aria-labelledby="hero-heading"
        role="banner"
      >
      {/* Background Video with Fallbacks */}
      <div
        className="absolute inset-0 z-0 w-full h-full"
        style={{ backgroundColor: '#0a0a0a' }} // Dark fallback color
      >
        {/* Removed semi-transparent overlay to maintain full video brightness */}
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
          <>
            <video
              ref={videoRef}
              className="absolute inset-0 z-0 w-full h-full object-cover"
              preload="metadata"
              autoPlay={!prefersReducedMotion}
              loop
              muted={isMuted}
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
                transition: prefersReducedMotion ? 'none' : 'opacity 0.5s ease-in-out'
              }}
            >
              <source src={getVideoUrl()} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
            
            {/* Video controls for accessibility */}
            <div
              className="absolute bottom-4 right-4 z-20 flex gap-2"
              onMouseEnter={() => setShowVideoControls(true)}
              onMouseLeave={() => setShowVideoControls(false)}
              onFocus={() => setShowVideoControls(true)}
              onBlur={() => setShowVideoControls(false)}
            >
              <button
                type="button"
                className={`p-2 rounded-full bg-black/50 text-white transition-opacity ${showVideoControls ? 'opacity-100' : 'opacity-0'} focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-white`}
                onClick={toggleVideoPlay}
                aria-label={isVideoPlaying ? 'Pause background video' : 'Play background video'}
                aria-pressed={!isVideoPlaying}
                onKeyDown={handleVideoKeyDown}
              >
                {isVideoPlaying ? <Pause size={16} /> : <Play size={16} />}
              </button>
              
              <button
                type="button"
                className={`p-2 rounded-full bg-black/50 text-white transition-opacity ${showVideoControls ? 'opacity-100' : 'opacity-0'} focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-white`}
                onClick={toggleMute}
                aria-label={isMuted ? 'Unmute background video' : 'Mute background video'}
                aria-pressed={!isMuted}
                onKeyDown={handleVideoKeyDown}
              >
                {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
              </button>
            </div>
          </>
        )}
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 md:py-20 lg:py-24">
        <div className="text-center">
          <motion.h1
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-black mb-4 sm:mb-6 px-2"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            Double your sales in <span className="text-yellow-400">90 days</span> or it&apos;s free
          </motion.h1>

          <motion.p
            className="text-lg sm:text-xl md:text-2xl text-black mb-6 sm:mb-8 max-w-3xl mx-auto px-4"
            style={{
              textShadow: '0 1px 2px rgba(255, 255, 255, 0.8), 0 2px 4px rgba(255, 255, 255, 0.5)',
            }}
            initial={prefersReducedMotion ? {} : { opacity: 0, y: 30 }}
            animate={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
            transition={prefersReducedMotion ? {} : { duration: 0.8, delay: 0.2 }}
          >
            High-performing marketing campaigns for brands
          </motion.p>

          {/* YouTube video - now visible on all screen sizes including mobile */}
          <motion.div
            className="mb-6 sm:mb-8 md:mb-10 max-w-4xl mx-auto px-4"
            initial={prefersReducedMotion ? {} : { opacity: 0, y: 30 }}
            animate={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
            transition={prefersReducedMotion ? {} : { duration: 0.8, delay: 0.3 }}
          >
            <div className="relative w-full h-0 pb-[56.25%] rounded-lg overflow-hidden shadow-xl">
              {iframeSrc && (
                <iframe
                  className="absolute top-0 left-0 w-full h-full"
                  src={iframeSrc}
                  title="Demonstration video of the marketing platform"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  aria-label="Demonstration video showing how the marketing platform works"
                ></iframe>
              )}
            </div>
          </motion.div>

          <motion.div
            className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center px-4"
            initial={prefersReducedMotion ? {} : { opacity: 0, y: 30 }}
            animate={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
            transition={prefersReducedMotion ? {} : { duration: 0.8, delay: 0.4 }}
          >
            <a
              href="#contact"
              className="inline-flex items-center justify-center px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base font-medium rounded-md transition-all duration-200 hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-yellow-300 focus:ring-offset-2 focus:ring-offset-black"
              style={{
                color: 'black',
                backgroundColor: '#FFD700'
              }}
              aria-label="Book a call with our team"
            >
              Book Call
              <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" style={{ color: 'black' }} aria-hidden="true" />
            </a>
            <a
              href="#solutions"
              className="btn-learn-more inline-flex items-center justify-center px-6 py-3 text-lg font-semibold rounded-lg border-2 border-black bg-black text-white hover:bg-white transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 focus:ring-offset-white"
              aria-label="Learn more about our solutions"
            >
              Learn More
            </a>
          </motion.div>
        </div>
      </div>
    </section>
    </>
  );
};

export default Hero;