'use client';

import React, { useState, useEffect, useCallback, TouchEvent } from 'react';
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
  forceAutoplay?: boolean; // New prop for continuous autoplay without controls
  isStaticImage?: boolean; // New prop to render static image instead of video
}

// Inner component for video functionality
const VideoCardContent: React.FC<VideoCardProps & {
  isInView: boolean;
  isLoaded: boolean;
  isLoading: boolean;
  hasError: boolean;
  videoRef: React.RefObject<HTMLVideoElement | null>;
  containerRef: React.RefObject<HTMLDivElement | null>;
  pauseVideo: () => void;
  playVideo: () => void;
}> = ({
  src,
  poster,
  title,
  description,
  caption,
  className = '',
  aspectRatio = '3/4',
  muted = true,
  loop = true,
  lazy = true,
  sources,
  fallbackImage,
  enableTouchGestures = true,
  enableFullscreenOnMobile = true,
  forceAutoplay = false,
  isStaticImage = false,
  isInView,
  isLoaded,
  isLoading,
  hasError,
  videoRef,
  containerRef,
  pauseVideo,
  playVideo
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [showFallback, setShowFallback] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [touchGesture, setTouchGesture] = useState<TouchGestureState | null>(null);
  const [showControls, setShowControls] = useState(false);
  const videoId = `video-${title.replace(/\s+/g, '-').toLowerCase()}`;

  useEffect(() => {
    const video = videoRef.current;
    if (!video || isStaticImage) return;

    const handlePlay = () => {
      setIsPlaying(true);
    };

    const handlePause = () => {
      setIsPlaying(false);
    };

    const handleError = (e: Event) => {
      console.error(`Video error for ${title}:`, e);
      setShowFallback(true);
    };

    const handleStalled = () => {
      console.warn(`Video stalled for ${title}, attempting to restart...`);
      if (forceAutoplay && video) {
        setTimeout(() => {
          video.play().catch(err => {
            console.error('Failed to restart stalled video:', err);
          });
        }, 500);
      }
    };

    const handleSuspend = () => {
      console.warn(`Video suspended for ${title}`);
      if (forceAutoplay && video) {
        setTimeout(() => {
          video.play().catch(err => {
            console.error('Failed to resume suspended video:', err);
          });
        }, 300);
      }
    };

    const handleEnded = () => {
      // For forceAutoplay videos, restart immediately when ended
      if (forceAutoplay && video) {
        // Always restart for forceAutoplay videos, regardless of loop attribute
        setTimeout(() => {
          video.currentTime = 0;
          video.play().catch(err => {
            console.error('Failed to restart video after end:', err);
            // Try again after a short delay
            setTimeout(() => {
              video.currentTime = 0;
              video.play().catch(err2 => {
                console.error('Second attempt to restart video failed:', err2);
              });
            }, 500);
          });
        }, 100); // Small delay to ensure the video is ready to restart
      }
    };

    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);
    video.addEventListener('error', handleError);
    video.addEventListener('stalled', handleStalled);
    video.addEventListener('suspend', handleSuspend);
    video.addEventListener('ended', handleEnded);

    // Start performance monitoring when video is ready
    if (isLoaded) {
      videoPerformanceMonitor.startMonitoring(videoId, video);
    }

    return () => {
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
      video.removeEventListener('error', handleError);
      video.removeEventListener('stalled', handleStalled);
      video.removeEventListener('suspend', handleSuspend);
      video.removeEventListener('ended', handleEnded);
      
      // Stop monitoring when component unmounts
      if (isLoaded) {
        videoPerformanceMonitor.stopMonitoring(videoId);
      }
    };
  }, [isLoaded, videoId, videoRef, title, forceAutoplay, loop, isStaticImage]);

  // Show fallback image if video fails to load
  useEffect(() => {
    if (isStaticImage) return;
    
    if (hasError && fallbackImage) {
      setShowFallback(true);
      
      // Log error for debugging
      console.error(`Video failed to load: ${title} (${videoId})`);
    }
  }, [hasError, fallbackImage, title, videoId, isStaticImage]);

  // Force autoplay videos to start playing immediately when loaded
  useEffect(() => {
    if (isStaticImage) return;
    
    if (forceAutoplay && isLoaded && videoRef.current) {
      const video = videoRef.current;
      
      // Ensure video is muted for autoplay compatibility
      video.muted = true;
      
      // Set a flag to ensure video plays continuously
      const ensurePlayback = () => {
        if (!video.paused) return;
        
        video.play().catch(err => {
          console.warn(`Initial autoplay failed for ${title}, trying fallback...`, err);
          
          // Fallback strategies for autoplay
          setTimeout(() => {
            // Try again with a small delay
            video.play().catch(err2 => {
              console.error(`Fallback autoplay failed for ${title}`, err2);
              
              // Last resort: try to play with user interaction simulation
              const simulateUserInteraction = () => {
                video.play().catch(err3 => {
                  console.error(`Simulated interaction autoplay failed for ${title}`, err3);
                });
              };
              
              // Add a one-time click listener to the document as last resort
              const enableAutoplay = () => {
                simulateUserInteraction();
                document.removeEventListener('click', enableAutoplay);
                document.removeEventListener('touchstart', enableAutoplay);
              };
              
              document.addEventListener('click', enableAutoplay, { once: true });
              document.addEventListener('touchstart', enableAutoplay, { once: true });
            });
          }, 100);
        });
      };
      
      // Try to play immediately
      ensurePlayback();
      
      // Set up additional attempts to ensure playback
      const playAttempts = setInterval(() => {
        if (video.paused && !video.ended) {
          ensurePlayback();
        } else if (!video.paused) {
          clearInterval(playAttempts);
        }
      }, 1000);
      
      // Clear interval after 10 seconds to prevent infinite attempts
      setTimeout(() => {
        clearInterval(playAttempts);
      }, 10000);
      
      return () => clearInterval(playAttempts);
    }
  }, [forceAutoplay, isLoaded, title, videoRef, isStaticImage]);

  // Enhanced video click handler with mobile considerations
  const handleVideoClick = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    // Check if this is a mobile device
    const isMobile = typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches;
    
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
    if (isMobile && typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate(5);
    }
  }, [isPlaying, pauseVideo, playVideo, videoRef]);

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
      if (video && enableFullscreenOnMobile && typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches) {
        // Toggle fullscreen on double tap for mobile
        if (!isFullscreen) {
          if (video.requestFullscreen) {
            video.requestFullscreen().catch(() => {
              // Ignore fullscreen errors
            });
          }
        } else {
          if (typeof document !== 'undefined' && document.exitFullscreen) {
            document.exitFullscreen().catch(() => {
              // Ignore fullscreen errors
            });
          }
        }
        setIsFullscreen(!isFullscreen);
        
        // Provide haptic feedback
        if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
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
  }, [enableTouchGestures, touchGesture, isFullscreen, enableFullscreenOnMobile, videoRef]);

  // Handle fullscreen change events
  useEffect(() => {
    if (isStaticImage) return;
    
    // Only add event listeners on client side
    if (typeof document !== 'undefined') {
      const handleFullscreenChange = () => {
        setIsFullscreen(!!document.fullscreenElement);
      };

      document.addEventListener('fullscreenchange', handleFullscreenChange);
      return () => {
        document.removeEventListener('fullscreenchange', handleFullscreenChange);
      };
    }
  }, [isStaticImage]);

  // Auto-hide controls on mobile when playing
  useEffect(() => {
    if (isStaticImage) return;
    
    if (isPlaying && typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches) {
      const timer = setTimeout(() => {
        setShowControls(false);
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [isPlaying, isStaticImage]);

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

      {/* Render either video or static image based on isStaticImage prop */}
      {isStaticImage ? (
        <Image
          src={src}
          alt={title}
          fill
          style={{ objectFit: 'cover' }}
          className="opacity-100 transition-opacity duration-300"
          loading="eager"
          priority={true}
        />
      ) : (
        <video
          ref={videoRef}
          className={`w-full h-full object-cover ${lazy && !isLoaded ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300 ${enableTouchGestures ? 'touch-manipulation' : ''} ${forceAutoplay ? 'pointer-events-none' : ''}`}
          preload={lazy && !isInView ? 'none' : 'auto'}
          src={src}
          poster={poster}
          muted={forceAutoplay ? true : muted}
          loop={forceAutoplay ? true : loop}
          playsInline
          controls={forceAutoplay ? false : (showControls && typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches)}
          onClick={forceAutoplay ? undefined : handleVideoClick}
          onTouchStart={forceAutoplay ? undefined : handleTouchStart}
          onTouchMove={forceAutoplay ? undefined : handleTouchMove}
          onTouchEnd={forceAutoplay ? undefined : handleTouchEnd}
          autoPlay={forceAutoplay ? true : undefined}
          x-webkit-airplay="deny"
          x5-video-player-type="h5"
          x5-video-player-fullscreen="true"
          x5-video-orientation="portraint"
          style={{
            cursor: forceAutoplay ? 'default' : 'pointer',
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
      )}

      {/* Enhanced Play/Pause overlay with mobile optimizations - hidden for forceAutoplay and static images */}
      {isLoaded && !hasError && !forceAutoplay && !isStaticImage && (
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

      {/* Mobile-specific controls overlay - hidden for forceAutoplay and static images */}
      {isLoaded && !hasError && !forceAutoplay && !isStaticImage && typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches && (
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
                    if (typeof document !== 'undefined') {
                      document.exitFullscreen?.();
                    }
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

      {/* Touch gesture hints for mobile - hidden for forceAutoplay and static images */}
      {enableTouchGestures && !forceAutoplay && !isStaticImage && typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches && !isPlaying && (
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

      {/* Text overlay - positioned at the top as primary focal point - only show if title or description exists */}
      {(title || description) && (
        <div className="absolute top-0 left-0 right-0 bg-gradient-to-b from-black/80 via-black/60 to-transparent p-4 sm:p-6">
          <h3 className="text-white font-bold text-xl sm:text-2xl md:text-3xl mb-2 drop-shadow-lg">{title}</h3>
          <p className="text-white/95 text-sm sm:text-base md:text-lg drop-shadow-md">{description}</p>
          {caption && (
            <p className="text-white/90 text-xs sm:text-sm mt-2 drop-shadow-md">{caption}</p>
          )}
        </div>
      )}
    </div>
  );
};

// Main VideoCard component that handles conditional rendering
const VideoCard: React.FC<VideoCardProps> = (props) => {
  const { isStaticImage, forceAutoplay = false } = props;
  
  // Always call hooks unconditionally at the top level
  const containerRef = React.useRef<HTMLDivElement>(null);
  const videoHook = useVideoLazyLoad({
    threshold: 0.1,
    rootMargin: '50px',
    preloadNext: true,
    pauseWhenNotVisible: !forceAutoplay,
    forceAutoplay
  });
  
  // For static images, render a simple image component without video functionality
  if (isStaticImage) {
    const {
      src,
      title,
      description,
      caption,
      className = '',
      aspectRatio = '3/4'
    } = props;
    
    return (
      <div
        ref={containerRef}
        className={`relative w-full h-full overflow-hidden rounded-lg bg-gray-100 ${className}`}
        style={{ aspectRatio }}
      >
        <Image
          src={src}
          alt={title}
          fill
          style={{ objectFit: 'cover' }}
          className="opacity-100 transition-opacity duration-300"
          loading="eager"
          priority={true}
        />
        
        {/* Text overlay - positioned at the top as primary focal point */}
        {(title || description) && (
          <div className="absolute top-0 left-0 right-0 bg-gradient-to-b from-black/80 via-black/60 to-transparent p-4 sm:p-6">
            <h3 className="text-white font-bold text-xl sm:text-2xl md:text-3xl mb-2 drop-shadow-lg">{title}</h3>
            <p className="text-white/95 text-sm sm:text-base md:text-lg drop-shadow-md">{description}</p>
            {caption && (
              <p className="text-white/90 text-xs sm:text-sm mt-2 drop-shadow-md">{caption}</p>
            )}
          </div>
        )}
      </div>
    );
  }
  
  // For videos, render the video content with full functionality
  return (
    <VideoCardContent
      {...props}
      isInView={videoHook?.isInView || false}
      isLoaded={videoHook?.isLoaded || false}
      isLoading={videoHook?.isLoading || false}
      hasError={videoHook?.hasError || false}
      videoRef={videoHook?.videoRef || { current: null }}
      containerRef={videoHook?.containerRef || containerRef}
      pauseVideo={videoHook?.pauseVideo || (() => {})}
      playVideo={videoHook?.playVideo || (() => {})}
    />
  );
};

export default VideoCard;