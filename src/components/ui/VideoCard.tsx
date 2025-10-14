'use client';

import React, { useState, useRef, useEffect, useCallback, TouchEvent } from 'react';
import Image from 'next/image';
import useVideoLazyLoad from '@/hooks/useVideoLazyLoad';
import videoPerformanceMonitor from '@/utils/videoPerformanceMonitor';

interface VideoSource {
  src: string;
  type: string;
  media?: string;
}

interface TouchGestureState {
  startX: number;
  startY: number;
  startTime: number;
  isDragging: boolean;
  isSwipe: boolean;
}

interface VideoCardProps {
  src: string;
  poster?: string;
  title: string;
  description: string;
  caption?: string;
  className?: string;
  aspectRatio?: string;
  autoPlay?: boolean;
  muted?: boolean;
  loop?: boolean;
  lazy?: boolean;
  sources?: VideoSource[];
  fallbackImage?: string;
  enableTouchGestures?: boolean;
  enableFullscreenOnMobile?: boolean;
}

const VideoCard: React.FC<VideoCardProps> = ({
  src,
  poster,
  title,
  description,
  caption,
  className = '',
  aspectRatio = '3/4',
  autoPlay = true,
  muted = true,
  loop = true,
  lazy = true,
  sources,
  fallbackImage,
  enableTouchGestures = true,
  enableFullscreenOnMobile = true
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [showFallback, setShowFallback] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [touchGesture, setTouchGesture] = useState<TouchGestureState | null>(null);
  const [showControls, setShowControls] = useState(false);
  const videoId = `video-${title.replace(/\s+/g, '-').toLowerCase()}`;
  
  // Use our custom lazy loading hook
  const {
    isInView,
    isLoaded,
    isLoading,
    hasError,
    isVisible,
    videoRef,
    containerRef,
    loadVideo,
    pauseVideo,
    playVideo
  } = useVideoLazyLoad({
    threshold: 0.1,
    rootMargin: '50px',
    preloadNext: true,
    pauseWhenNotVisible: true
  });

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handlePlay = () => {
      setIsPlaying(true);
    };

    const handlePause = () => {
      setIsPlaying(false);
    };

    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);

    // Start performance monitoring when video is ready
    if (isLoaded) {
      videoPerformanceMonitor.startMonitoring(videoId, video);
    }

    return () => {
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
      
      // Stop monitoring when component unmounts
      if (isLoaded) {
        videoPerformanceMonitor.stopMonitoring(videoId);
      }
    };
  }, [isLoaded, videoId]);

  // Show fallback image if video fails to load
  useEffect(() => {
    if (hasError && fallbackImage) {
      setShowFallback(true);
      
      // Log error for debugging
      console.error(`Video failed to load: ${title} (${videoId})`);
    }
  }, [hasError, fallbackImage, title, videoId]);

  // Enhanced video click handler with mobile considerations
  const handleVideoClick = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    // Check if this is a mobile device
    const isMobile = window.matchMedia('(pointer: coarse)').matches;
    
    if (isPlaying) {
      pauseVideo();
      // On mobile, show controls when pausing
      if (isMobile) {
        setShowControls(true);
        setTimeout(() => setShowControls(false), 3000);
      }
    } else {
      playVideo();
      // On mobile, hide controls when playing
      if (isMobile) {
        setShowControls(false);
      }
    }
    
    // Provide haptic feedback on mobile
    if (isMobile && 'vibrate' in navigator) {
      navigator.vibrate(5);
    }
  }, [isPlaying, pauseVideo, playVideo]);

  // Touch gesture handlers for mobile interactions
  const handleTouchStart = useCallback((e: TouchEvent) => {
    if (!enableTouchGestures) return;
    
    const touch = e.touches[0];
    setTouchGesture({
      startX: touch.clientX,
      startY: touch.clientY,
      startTime: Date.now(),
      isDragging: false,
      isSwipe: false
    });
  }, [enableTouchGestures]);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!enableTouchGestures || !touchGesture) return;
    
    const touch = e.touches[0];
    const deltaX = Math.abs(touch.clientX - touchGesture.startX);
    const deltaY = Math.abs(touch.clientY - touchGesture.startY);
    const deltaTime = Date.now() - touchGesture.startTime;
    
    // Detect if this is a swipe gesture
    if (deltaX > 30 || deltaY > 30) {
      setTouchGesture(prev => prev ? { ...prev, isDragging: true, isSwipe: true } : null);
    }
  }, [enableTouchGestures, touchGesture]);

  const handleTouchEnd = useCallback((e: TouchEvent) => {
    if (!enableTouchGestures || !touchGesture) return;
    
    const touch = e.changedTouches[0];
    const deltaX = touch.clientX - touchGesture.startX;
    const deltaY = touch.clientY - touchGesture.startY;
    const deltaTime = Date.now() - touchGesture.startTime;
    
    // Check for double tap (quick tap twice)
    if (!touchGesture.isSwipe && deltaTime < 300) {
      const video = videoRef.current;
      if (video && enableFullscreenOnMobile && window.matchMedia('(pointer: coarse)').matches) {
        // Toggle fullscreen on double tap for mobile
        if (!isFullscreen) {
          if (video.requestFullscreen) {
            video.requestFullscreen().catch(() => {
              // Ignore fullscreen errors
            });
          }
        } else {
          if (document.exitFullscreen) {
            document.exitFullscreen().catch(() => {
              // Ignore fullscreen errors
            });
          }
        }
        setIsFullscreen(!isFullscreen);
        
        // Provide haptic feedback
        if ('vibrate' in navigator) {
          navigator.vibrate([10, 50, 10]);
        }
      }
    }
    
    // Check for vertical swipe (volume control on mobile)
    if (touchGesture.isSwipe && Math.abs(deltaY) > Math.abs(deltaX) && Math.abs(deltaY) > 50) {
      const video = videoRef.current;
      if (video) {
        // Adjust volume based on swipe direction
        const volumeChange = deltaY > 0 ? -0.1 : 0.1;
        video.volume = Math.max(0, Math.min(1, video.volume + volumeChange));
        
        // Show volume indicator
        setShowControls(true);
        setTimeout(() => setShowControls(false), 2000);
      }
    }
    
    setTouchGesture(null);
  }, [enableTouchGestures, touchGesture, isFullscreen, enableFullscreenOnMobile]);

  // Handle fullscreen change events
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  // Auto-hide controls on mobile when playing
  useEffect(() => {
    if (isPlaying && window.matchMedia('(pointer: coarse)').matches) {
      const timer = setTimeout(() => {
        setShowControls(false);
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [isPlaying]);

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-full overflow-hidden rounded-lg bg-gray-100 ${className}`}
      style={{ aspectRatio }}
    >
      {/* Loading state */}
      {isLoading && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-gray-200">
          <div className="flex flex-col items-center">
            <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-2 text-sm text-gray-600">Loading video...</p>
          </div>
        </div>
      )}

      {/* Error state with fallback */}
      {hasError && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-gray-200">
          {showFallback && fallbackImage ? (
            <Image
              src={fallbackImage}
              alt={title}
              fill
              style={{ objectFit: 'cover' }}
            />
          ) : (
            <div className="flex flex-col items-center text-center p-4">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mb-2">
                <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <p className="text-sm text-gray-600">Failed to load video</p>
            </div>
          )}
        </div>
      )}

      {/* Video element with lazy loading and enhanced mobile support */}
      <video
        ref={videoRef}
        className={`w-full h-full object-cover ${lazy && !isLoaded ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300 ${enableTouchGestures ? 'touch-manipulation' : ''}`}
        preload={lazy && !isInView ? 'none' : 'auto'}
        src={src}
        poster={poster}
        muted={muted}
        loop={loop}
        playsInline
        controls={showControls && window.matchMedia('(pointer: coarse)').matches}
        onClick={handleVideoClick}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{
          cursor: 'pointer',
          // Ensure proper touch handling on mobile
          touchAction: enableTouchGestures ? 'pan-y' : 'auto',
          // Optimize for mobile playback
          WebkitUserSelect: 'none',
          KhtmlUserSelect: 'none',
          MozUserSelect: 'none',
          msUserSelect: 'none',
          userSelect: 'none',
          WebkitTapHighlightColor: 'transparent'
        }}
      >
        {/* Responsive sources for different viewports */}
        {sources && sources.map((source, index) => (
          <source
            key={index}
            src={source.src}
            type={source.type}
            media={source.media}
          />
        ))}
      </video>

      {/* Enhanced Play/Pause overlay with mobile optimizations */}
      {isLoaded && !hasError && (
        <div
          className={`absolute inset-0 flex items-center justify-center pointer-events-none transition-opacity duration-300 ${
            isPlaying ? 'opacity-0' : 'opacity-70'
          }`}
        >
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-black bg-opacity-50 flex items-center justify-center backdrop-blur-sm">
            <svg className="w-8 h-8 sm:w-10 sm:h-10 text-white ml-1" fill="currentColor" viewBox="0 0 20 20">
              {isPlaying ? (
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
              ) : (
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
              )}
            </svg>
          </div>
        </div>
      )}

      {/* Mobile-specific controls overlay */}
      {isLoaded && !hasError && window.matchMedia('(pointer: coarse)').matches && (
        <div
          className={`absolute top-4 right-4 flex flex-col gap-2 transition-opacity duration-300 ${
            showControls ? 'opacity-100' : 'opacity-0'
          }`}
        >
          {/* Fullscreen button for mobile */}
          {enableFullscreenOnMobile && (
            <button
              className="w-10 h-10 rounded-full bg-black bg-opacity-50 text-white flex items-center justify-center backdrop-blur-sm pointer-events-auto"
              onClick={(e) => {
                e.stopPropagation();
                const video = videoRef.current;
                if (video) {
                  if (!isFullscreen) {
                    video.requestFullscreen?.();
                  } else {
                    document.exitFullscreen?.();
                  }
                }
              }}
              aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isFullscreen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 9V4.5M9 9H4.5M9 9L3.75 3.75M9 15v4.5M9 15H4.5M9 15l-5.25 5.25M15 9h4.5M15 9V4.5M15 9l5.25-5.25M15 15h4.5M15 15v4.5m0-4.5l5.25 5.25" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                )}
              </svg>
            </button>
          )}
          
          {/* Volume indicator */}
          <div className="w-10 h-10 rounded-full bg-black bg-opacity-50 text-white flex items-center justify-center backdrop-blur-sm">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
            </svg>
          </div>
        </div>
      )}

      {/* Touch gesture hints for mobile */}
      {enableTouchGestures && window.matchMedia('(pointer: coarse)').matches && !isPlaying && (
        <div className="absolute bottom-4 left-4 right-4 text-center">
          <p className="text-white text-xs bg-black bg-opacity-50 rounded-full px-3 py-1 backdrop-blur-sm">
            Tap to play • Double tap for fullscreen
          </p>
        </div>
      )}

      {/* Performance indicator (for development) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="absolute top-2 left-2 z-20 bg-black/50 text-white text-xs px-2 py-1 rounded">
          {isInView ? 'In View' : 'Out of View'} | {isLoaded ? 'Loaded' : 'Not Loaded'}
          {hasError && ' | Error'}
        </div>
      )}

      {/* Text overlay */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
        <h3 className="text-white font-semibold text-lg mb-1">{title}</h3>
        <p className="text-white/90 text-sm">{description}</p>
        {caption && (
          <p className="text-white/80 text-xs mt-1">{caption}</p>
        )}
      </div>
    </div>
  );
};

export default VideoCard;