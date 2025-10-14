'use client';

import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';

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
  lazy = true
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleLoadStart = () => {
      setIsLoading(true);
      setHasError(false);
    };

    const handleCanPlay = () => {
      setIsLoading(false);
      if (autoPlay) {
        setIsPlaying(true);
      }
    };

    const handleError = () => {
      setHasError(true);
      setIsLoading(false);
    };

    const handlePlay = () => {
      setIsPlaying(true);
    };

    const handlePause = () => {
      setIsPlaying(false);
    };

    video.addEventListener('loadstart', handleLoadStart);
    video.addEventListener('canplay', handleCanPlay);
    video.addEventListener('error', handleError);
    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);

    // Attempt to play video if autoplay is enabled
    if (autoPlay) {
      video.play().catch(err => {
        console.warn('Video autoplay failed:', err);
      });
    }

    return () => {
      video.removeEventListener('loadstart', handleLoadStart);
      video.removeEventListener('canplay', handleCanPlay);
      video.removeEventListener('error', handleError);
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
    };
  }, [autoPlay]);

  const handleVideoClick = () => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.pause();
    } else {
      video.play().catch(err => {
        console.warn('Video play failed:', err);
      });
    }
  };

  return (
    <div 
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

      {/* Error state */}
      {hasError && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-gray-200">
          <div className="flex flex-col items-center text-center p-4">
            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mb-2">
              <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <p className="text-sm text-gray-600">Failed to load video</p>
          </div>
        </div>
      )}

      {/* Video element */}
      <video
        ref={videoRef}
        className="w-full h-full object-cover"
        src={src}
        poster={poster}
        muted={muted}
        loop={loop}
        playsInline
        onClick={handleVideoClick}
        style={{ cursor: 'pointer' }}
      />

      {/* Play/Pause overlay */}
      {!isLoading && !hasError && (
        <div 
          className="absolute inset-0 flex items-center justify-center pointer-events-none"
          style={{ opacity: isPlaying ? 0 : 0.7, transition: 'opacity 0.3s ease' }}
        >
          <div className="w-16 h-16 rounded-full bg-black bg-opacity-50 flex items-center justify-center">
            <svg className="w-8 h-8 text-white ml-1" fill="currentColor" viewBox="0 0 20 20">
              {isPlaying ? (
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
              ) : (
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
              )}
            </svg>
          </div>
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