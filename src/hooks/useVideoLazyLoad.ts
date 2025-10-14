'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

interface VideoLazyLoadOptions {
  threshold?: number;
  rootMargin?: string;
  preloadNext?: boolean;
  pauseWhenNotVisible?: boolean;
}

interface VideoLazyLoadState {
  isInView: boolean;
  isLoaded: boolean;
  isLoading: boolean;
  hasError: boolean;
  isVisible: boolean;
}

interface VideoLazyLoadReturn extends VideoLazyLoadState {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  containerRef: React.RefObject<HTMLDivElement | null>;
  loadVideo: () => void;
  pauseVideo: () => void;
  playVideo: () => void;
  preloadVideo: () => void;
}

export const useVideoLazyLoad = (
  options: VideoLazyLoadOptions & { forceAutoplay?: boolean } = {}
): VideoLazyLoadReturn => {
  const {
    threshold = 0.1,
    rootMargin = '50px',
    pauseWhenNotVisible = true,
    forceAutoplay = false
  } = options;

  const [state, setState] = useState<VideoLazyLoadState>({
    isInView: false,
    isLoaded: false,
    isLoading: false,
    hasError: false,
    isVisible: false
  });

  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadingStartTimeRef = useRef<number>(0);

  // Load video when it enters the viewport
  const loadVideo = useCallback(() => {
    if (state.isLoaded || state.isLoading) return;

    setState(prev => ({ ...prev, isLoading: true, hasError: false }));
    loadingStartTimeRef.current = Date.now();

    const video = videoRef.current;
    if (!video) return;

    // Set preload to auto and load the video
    video.preload = 'auto';
    video.load();

    // Track loading performance
    const handleLoadStart = () => {
      loadingStartTimeRef.current = Date.now();
    };

    const handleCanPlay = () => {
      const loadTime = Date.now() - loadingStartTimeRef.current;
      console.log(`Video loaded in ${loadTime}ms`);
      
      setState(prev => ({
        ...prev,
        isLoaded: true,
        isLoading: false,
        hasError: false
      }));

      // Auto-play if in viewport or if forceAutoplay is enabled
      if (state.isInView || forceAutoplay) {
        video.play().catch(err => {
          console.warn('Video autoplay failed:', err);
          // For forceAutoplay videos, try alternative methods
          if (forceAutoplay) {
            // Try to play with user interaction simulation
            setTimeout(() => {
              video.muted = true; // Ensure muted for autoplay
              video.play().catch(err => {
                console.error('Force autoplay failed even with fallback:', err);
              });
            }, 100);
          }
        });
      }
    };

    const handleError = () => {
      console.error('Video failed to load');
      setState(prev => ({
        ...prev,
        hasError: true,
        isLoading: false
      }));
    };

    video.addEventListener('loadstart', handleLoadStart);
    video.addEventListener('canplay', handleCanPlay);
    video.addEventListener('error', handleError);

    return () => {
      video.removeEventListener('loadstart', handleLoadStart);
      video.removeEventListener('canplay', handleCanPlay);
      video.removeEventListener('error', handleError);
    };
  }, [state.isLoaded, state.isLoading, state.isInView]);

  // Preload video without playing
  const preloadVideo = useCallback(() => {
    if (state.isLoaded || state.isLoading) return;

    const video = videoRef.current;
    if (!video) return;

    video.preload = 'metadata';
    video.load();
  }, [state.isLoaded, state.isLoading]);

  // Pause video
  const pauseVideo = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    video.pause();
  }, []);

  // Play video
  const playVideo = useCallback(() => {
    const video = videoRef.current;
    if (!video || !state.isLoaded) return;

    video.play().catch(err => {
      console.warn('Video play failed:', err);
    });
  }, [state.isLoaded]);

  // Set up Intersection Observer
  useEffect(() => {
    // Only create IntersectionObserver on client side
    if (typeof window === 'undefined' || typeof IntersectionObserver === 'undefined' || !containerRef.current) return;

    const options = {
      threshold,
      rootMargin
    };

    observerRef.current = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        const isIntersecting = entry.isIntersecting;
        const isVisible = entry.intersectionRatio > 0;

        setState(prev => ({
          ...prev,
          isInView: isIntersecting,
          isVisible
        }));

        // Load video when it enters the viewport
        if (isIntersecting && !state.isLoaded) {
          loadVideo();
        }

        // Handle video playback based on visibility
        const video = videoRef.current;
        if (video) {
          if (isIntersecting && state.isLoaded) {
            // Play video when it becomes visible
            video.play().catch(err => {
              console.warn('Video autoplay failed:', err);
              // For forceAutoplay videos, try alternative methods
              if (forceAutoplay) {
                setTimeout(() => {
                  video.muted = true; // Ensure muted for autoplay
                  video.play().catch(err => {
                    console.error('Force autoplay failed even with fallback:', err);
                  });
                }, 100);
              }
            });
          } else if (!isIntersecting && pauseWhenNotVisible && state.isLoaded && !forceAutoplay) {
            // Don't pause forceAutoplay videos when not visible
            video.pause();
          }
        }
      });
    }, options);

    observerRef.current.observe(containerRef.current);

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [threshold, rootMargin, loadVideo, pauseWhenNotVisible, state.isLoaded]);

  // Cleanup on unmount
  useEffect(() => {
    const currentVideo = videoRef.current;
    return () => {
      if (currentVideo) {
        currentVideo.pause();
        currentVideo.src = '';
        currentVideo.load();
      }
    };
  }, []);

  return {
    ...state,
    videoRef,
    containerRef,
    loadVideo,
    pauseVideo,
    playVideo,
    preloadVideo
  };
};

export default useVideoLazyLoad;