import React, { useState, useEffect, useRef, useCallback, ReactNode, TouchEvent, KeyboardEvent, MouseEvent } from 'react';
import Image from 'next/image';

// TypeScript interfaces
interface SlideData {
  id: string;
  type: 'image' | 'video' | 'custom' | 'iframe';
  src: string;
  alt?: string;
  caption?: string;
  title?: string;
  description?: string;
  poster?: string; // For video
  loop?: boolean;  // For video
  muted?: boolean; // For video
  autoplay?: boolean; // For video
  content?: React.ReactNode; // Custom content
  lazy?: boolean; // Lazy loading
  ariaLabel?: string;
  ariaDescription?: string;
}

// Touch gesture state interface
interface TouchGestureState {
  startX: number;
  startY: number;
  currentX: number;
  currentY: number;
  startTime: number;
  isDragging: boolean;
  hasPassedThreshold: boolean;
  velocity: number;
  pullResistance: number;
}

interface CarouselProps {
  // Core content
  slides: SlideData[];
  
  // Layout and sizing
  aspectRatio?: 'auto' | '4/3' | '16/9' | '3/4' | number;
  slidesPerView?: number | 'auto';
  spaceBetween?: number;
  loop?: boolean;
  
  // Behavior
  autoplay?: boolean | AutoplayOptions;
  initialSlide?: number;
  grabCursor?: boolean;
  
  // Navigation
  navigation?: boolean | NavigationOptions;
  pagination?: boolean | PaginationOptions;
  
  // Responsiveness
  breakpoints?: BreakpointOptions;
  
  // Performance
  lazy?: boolean | LazyOptions;
  preloadImages?: boolean;
  
  // Accessibility
  a11y?: boolean | A11yOptions;
  
  // Styling
  className?: string;
  theme?: ThemeOptions;
  
  // Events
  onSlideChange?: (index: number) => void;
  onInit?: () => void;
  onDestroy?: () => void;
}

interface AutoplayOptions {
  delay: number;
  disableOnInteraction?: boolean;
  pauseOnMouseEnter?: boolean;
  stopOnLastSlide?: boolean;
}

interface NavigationOptions {
  hideOnClick?: boolean;
  disabledClass?: string;
  hiddenClass?: string;
}

interface PaginationOptions {
  type?: 'bullets' | 'fraction' | 'progressbar' | 'custom';
  clickable?: boolean;
  dynamicBullets?: boolean;
  renderBullet?: (index: number, className: string) => ReactNode;
}

interface BreakpointOptions {
  [width: number]: Partial<CarouselProps>;
}

interface LazyOptions {
  loadPrevNext?: boolean;
  loadPrevNextAmount?: number;
  loadOnTransitionStart?: boolean;
  elementClass?: string;
  loadingClass?: string;
  loadedClass?: string;
}

interface A11yOptions {
  prevSlideMessage?: string;
  nextSlideMessage?: string;
  firstSlideMessage?: string;
  lastSlideMessage?: string;
  paginationBulletMessage?: string;
  notificationClass?: string;
  slideLabel?: string;
  containerLabel?: string;
  playLabel?: string;
  pauseLabel?: string;
  liveRegionMessage?: string;
}

interface ThemeOptions {
  colors?: {
    primary?: string;
    secondary?: string;
    background?: string;
    text?: string;
    overlay?: string;
  };
  borderRadius?: string;
  shadows?: string;
  transitions?: {
    duration?: string;
    easing?: string;
  };
}

interface CarouselState {
  currentIndex: number;
  isAnimating: boolean;
  isAutoplay: boolean;
  isPaused: boolean;
  touchStart: { x: number; y: number } | null;
  isDragging: boolean;
  visibleSlides: number[];
  isFocused: boolean;
  focusedElement: string | null;
  touchGesture: TouchGestureState | null;
  momentumScrolling: boolean;
  isVideoPaused: boolean;
}

// Default breakpoints - optimized for mobile devices with enhanced touch support
const defaultBreakpoints = {
  320: {  // Extra small devices (iPhone SE)
    slidesPerView: 1,
    spaceBetween: 8,
    touchThreshold: 15, // Lower threshold for easier swiping on small screens
    momentumRatio: 0.8, // Higher momentum for natural feel
    pullResistance: 0.3
  },
  375: {  // Small mobile devices (iPhone 12/13)
    slidesPerView: 1.1,
    spaceBetween: 10,
    touchThreshold: 20,
    momentumRatio: 0.7,
    pullResistance: 0.25
  },
  414: {  // Medium mobile devices (iPhone 12/13 Plus)
    slidesPerView: 1.2,
    spaceBetween: 12,
    touchThreshold: 25,
    momentumRatio: 0.6,
    pullResistance: 0.2
  },
  480: {  // Large mobile devices
    slidesPerView: 1.3,
    spaceBetween: 15,
    touchThreshold: 30,
    momentumRatio: 0.5,
    pullResistance: 0.15
  },
  640: {  // Medium devices (small tablets)
    slidesPerView: 1.5,
    spaceBetween: 15,
    touchThreshold: 35,
    momentumRatio: 0.4,
    pullResistance: 0.1
  },
  767: {  // Large mobile/phablet devices
    slidesPerView: 1.7,
    spaceBetween: 18,
    touchThreshold: 40,
    momentumRatio: 0.3,
    pullResistance: 0.05
  },
  768: {  // Large tablets - fixed problematic range
    slidesPerView: 1.8,
    spaceBetween: 20,
    touchThreshold: 45,
    momentumRatio: 0.2,
    pullResistance: 0
  },
  896: {  // Small desktops - additional breakpoint
    slidesPerView: 2.2,
    spaceBetween: 20,
    touchThreshold: 50,
    momentumRatio: 0.1,
    pullResistance: 0
  },
  1024: { // Desktops
    slidesPerView: 2.5,
    spaceBetween: 25,
    touchThreshold: 50,
    momentumRatio: 0.1,
    pullResistance: 0
  },
  1280: { // Large desktops
    slidesPerView: 2.8,
    spaceBetween: 30,
    touchThreshold: 50,
    momentumRatio: 0.1,
    pullResistance: 0
  },
  1440: { // Extra large desktops
    slidesPerView: 3,
    spaceBetween: 35,
    touchThreshold: 50,
    momentumRatio: 0.1,
    pullResistance: 0
  }
};

// Sub-components
const CarouselContainer: React.FC<{
  children: ReactNode;
  className?: string;
  label?: string;
  labelledBy?: string;
}> = ({ children, className, label, labelledBy }) => (
  <div
    className={`carousel ${className || ''}`}
    role="region"
    aria-roledescription="carousel"
    aria-label={label}
    aria-labelledby={labelledBy}
    tabIndex={0}
  >
    {children}
  </div>
);

const CarouselViewport = React.forwardRef<
  HTMLDivElement,
  {
    children: ReactNode;
    className?: string;
    onMouseDown?: () => void;
    onMouseUp?: () => void;
    onMouseEnter?: () => void;
    onMouseLeave?: () => void;
    onTouchStart?: (e: TouchEvent) => void;
    onTouchMove?: (e: TouchEvent) => void;
    onTouchEnd?: (e: TouchEvent) => void;
    onKeyDown?: (e: KeyboardEvent) => void;
    onFocus?: () => void;
    onBlur?: () => void;
    ariaLive?: 'polite' | 'assertive' | 'off';
  }
>(({
  children,
  className,
  onMouseDown,
  onMouseUp,
  onMouseEnter,
  onMouseLeave,
  onTouchStart,
  onTouchMove,
  onTouchEnd,
  onKeyDown,
  onFocus,
  onBlur,
  ariaLive = 'polite'
}, ref) => (
  <div
    ref={ref}
    className={`carousel__viewport ${className || ''}`}
    aria-live={ariaLive}
    aria-atomic="true"
    onMouseDown={onMouseDown}
    onMouseUp={onMouseUp}
    onMouseEnter={onMouseEnter}
    onMouseLeave={onMouseLeave}
    onTouchStart={onTouchStart}
    onTouchMove={onTouchMove}
    onTouchEnd={onTouchEnd}
    onKeyDown={onKeyDown}
    onFocus={onFocus}
    onBlur={onBlur}
    tabIndex={-1}
  >
    {children}
  </div>
));

CarouselViewport.displayName = 'CarouselViewport';

const CarouselTrack = React.forwardRef<
  HTMLDivElement,
  {
    children: ReactNode;
    transform: string;
    transition: string;
    className?: string;
    id?: string;
  }
>(({ children, transform, transition, className, id }, ref) => (
  <div
    ref={ref}
    className={`carousel__track ${className || ''}`}
    style={{ transform, transition }}
    id={id}
  >
    {children}
  </div>
));

CarouselTrack.displayName = 'CarouselTrack';

const CarouselSlide: React.FC<{
  children: ReactNode;
  isActive: boolean;
  index: number;
  totalSlides: number;
  aspectRatio?: string;
  lazy?: boolean;
  className?: string;
  style?: React.CSSProperties;
  ariaLabel?: string;
  ariaDescribedBy?: string;
}> = ({
  children,
  isActive,
  index,
  totalSlides,
  aspectRatio,
  lazy,
  className,
  style,
  ariaLabel,
  ariaDescribedBy
}) => {
  const slideStyle: React.CSSProperties = { ...style };
  
  if (aspectRatio && aspectRatio !== 'auto') {
    slideStyle.aspectRatio = aspectRatio;
  }
  
  return (
    <div
      className={`carousel__slide ${isActive ? 'carousel__slide--active' : ''} ${lazy ? 'carousel__slide--lazy' : ''} ${className || ''}`}
      style={slideStyle}
      role="group"
      aria-roledescription="slide"
      aria-label={ariaLabel || `Slide ${index + 1} of ${totalSlides}`}
      aria-describedby={ariaDescribedBy}
      data-index={index}
      aria-hidden={!isActive}
      tabIndex={isActive ? 0 : -1}
    >
      {children}
    </div>
  );
};

const NavigationButton = React.forwardRef<
  HTMLButtonElement,
  {
    direction: 'prev' | 'next';
    onClick: () => void;
    disabled: boolean;
    className?: string;
    children?: ReactNode;
    ariaLabel?: string;
    ariaDescribedBy?: string;
    tabIndex?: number;
  }
>(({
  direction,
  onClick,
  disabled,
  className,
  children,
  ariaLabel,
  ariaDescribedBy,
  tabIndex = 0
}, ref) => (
  <button
    className={`carousel__arrow carousel__arrow--${direction} ${disabled ? 'carousel__arrow--disabled' : ''} ${className || ''}`}
    onClick={onClick}
    disabled={disabled}
    aria-label={ariaLabel || `Go to ${direction} slide`}
    aria-describedby={ariaDescribedBy}
    tabIndex={tabIndex}
    aria-controls="carousel-track"
  >
    <span className="sr-only">{direction === 'prev' ? 'Previous slide' : 'Next slide'}</span>
    {children || (
      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        {direction === 'prev' ? (
          <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        ) : (
          <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        )}
      </svg>
    )}
  </button>
));

NavigationButton.displayName = 'NavigationButton';

const PaginationBullets = React.forwardRef<
  HTMLDivElement,
  {
    currentIndex: number;
    totalSlides: number;
    onClick: (index: number) => void;
    className?: string;
    ariaLabel?: string;
  }
>(({ currentIndex, totalSlides, onClick, className, ariaLabel }, ref) => (
  <div
    className={`carousel__pagination carousel__pagination--bullets ${className || ''}`}
    role="tablist"
    aria-label={ariaLabel || "Carousel slide navigation"}
  >
    {Array.from({ length: totalSlides }).map((_, index) => (
      <button
        key={index}
        className={`carousel__pagination-bullet ${index === currentIndex ? 'carousel__pagination-bullet--active' : ''}`}
        onClick={() => onClick(index)}
        aria-label={`Go to slide ${index + 1}`}
        aria-current={index === currentIndex ? 'true' : 'false'}
        aria-selected={index === currentIndex}
        role="tab"
        tabIndex={index === currentIndex ? 0 : -1}
        aria-controls={`carousel-slide-${index}`}
      />
    ))}
  </div>
));

PaginationBullets.displayName = 'PaginationBullets';

// Main Carousel Component
const Carousel: React.FC<CarouselProps> = ({
  slides,
  aspectRatio = '3/4',
  slidesPerView = 1,
  spaceBetween = 20,
  loop = false,
  autoplay = false,
  initialSlide = 0,
  grabCursor = true,
  navigation = true,
  pagination = true,
  breakpoints = defaultBreakpoints,
  lazy = false,
  a11y = true,
  className = '',
  onSlideChange,
  onInit,
  onDestroy
}) => {
  // Accessibility options with defaults
  const a11yOptions = typeof a11y === 'object' ? a11y : {};
  const {
    prevSlideMessage = 'Previous slide',
    nextSlideMessage = 'Next slide',
    firstSlideMessage = 'This is the first slide',
    lastSlideMessage = 'This is the last slide',
    paginationBulletMessage = 'Go to slide {index}',
    containerLabel = 'Image carousel',
    slideLabel = 'Slide {index} of {total}',
    playLabel = 'Play autoplay',
    pauseLabel = 'Pause autoplay',
    liveRegionMessage = 'Slide {index} of {total}'
  } = a11yOptions;
  const [state, setState] = useState<CarouselState>({
    currentIndex: initialSlide,
    isAnimating: false,
    isAutoplay: typeof autoplay === 'object' ? autoplay.delay > 0 : autoplay === true,
    isPaused: false,
    touchStart: null,
    isDragging: false,
    visibleSlides: [],
    isFocused: false,
    focusedElement: null,
    touchGesture: null,
    momentumScrolling: false,
    isVideoPaused: false
  });
  
  const [containerWidth, setContainerWidth] = useState(0);
  const [currentBreakpoint, setCurrentBreakpoint] = useState<Partial<CarouselProps>>({});
  
  const containerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const autoplayTimerRef = useRef<NodeJS.Timeout | null>(null);
  const liveRegionRef = useRef<HTMLDivElement>(null);
  const prevButtonRef = useRef<HTMLButtonElement>(null);
  const nextButtonRef = useRef<HTMLButtonElement>(null);
  const paginationRef = useRef<HTMLDivElement>(null);
  
  // Get responsive config based on container width
  const getResponsiveConfig = useCallback(() => {
    let config = {
      slidesPerView,
      spaceBetween,
      touchThreshold: 50,
      momentumRatio: 0.1,
      pullResistance: 0
    };
    
    // Find matching breakpoint
    const sortedBreakpoints = Object.keys(breakpoints)
      .map(bp => parseInt(bp))
      .sort((a, b) => b - a); // Sort in descending order
      
    for (const bp of sortedBreakpoints) {
      if (containerWidth >= bp) {
        config = { ...config, ...(breakpoints as Record<number, Partial<CarouselProps>>)[bp] };
        break;
      }
    }
    
    return config;
  }, [containerWidth, slidesPerView, spaceBetween, breakpoints]);
  
  // Update container width and breakpoint config
  useEffect(() => {
    const updateWidth = () => {
      if (containerRef.current) {
        const width = containerRef.current.offsetWidth;
        setContainerWidth(width);
        setCurrentBreakpoint(getResponsiveConfig());
      }
    };
    
    updateWidth();
    window.addEventListener('resize', updateWidth);
    
    return () => {
      window.removeEventListener('resize', updateWidth);
    };
  }, [getResponsiveConfig]);
  
  // Calculate track transform
  const getTranslateX = useCallback(() => {
    const { slidesPerView: currentSlidesPerView = 1 } = currentBreakpoint;
    const slidesPerViewNum = typeof currentSlidesPerView === 'number' ? currentSlidesPerView : 1;
    const slideWidth = containerWidth / slidesPerViewNum;
    const spacing = (currentBreakpoint.spaceBetween || spaceBetween);
    
    // Calculate offset for current slide
    let offset = state.currentIndex * (slideWidth + spacing);
    
    // Adjust for partial slides
    if (slidesPerViewNum !== Math.floor(slidesPerViewNum)) {
      const partialSlide = slidesPerViewNum - Math.floor(slidesPerViewNum);
      offset -= partialSlide * slideWidth;
    }
    
    return -offset;
  }, [state.currentIndex, containerWidth, currentBreakpoint, spaceBetween]);
  
  // Navigation functions with video management
  const slideTo = useCallback((index: number) => {
    if (state.isAnimating) return;
    
    const newIndex = loop
      ? (index + slides.length) % slides.length
      : Math.max(0, Math.min(index, slides.length - 1));
    
    // Pause videos in slides that are no longer visible
    const videosToPause = document.querySelectorAll('.carousel__slide:not(.carousel__slide--active) video');
    videosToPause.forEach(video => {
      const htmlVideo = video as HTMLVideoElement;
      if (!htmlVideo.paused) {
        htmlVideo.pause();
      }
    });
    
    setState(prev => ({
      ...prev,
      currentIndex: newIndex,
      isAnimating: true
    }));
    
    // Reset animation flag after transition
    setTimeout(() => {
      setState(prev => ({ ...prev, isAnimating: false }));
    }, 300);
    
    if (onSlideChange) {
      onSlideChange(newIndex);
    }
  }, [state.isAnimating, loop, slides.length, onSlideChange]);
  
  const slideNext = useCallback(() => {
    slideTo(state.currentIndex + 1);
  }, [state.currentIndex, slideTo]);
  
  const slidePrev = useCallback(() => {
    slideTo(state.currentIndex - 1);
  }, [state.currentIndex, slideTo]);
  
  // Autoplay functionality
  useEffect(() => {
    if (!state.isAutoplay || state.isPaused) {
      if (autoplayTimerRef.current) {
        clearInterval(autoplayTimerRef.current);
        autoplayTimerRef.current = null;
      }
      return;
    }
    
    const delay = typeof autoplay === 'object' ? autoplay.delay : 3000;
    
    autoplayTimerRef.current = setInterval(() => {
      const isLastSlide = state.currentIndex === slides.length - 1;
      const shouldStop = typeof autoplay === 'object' && autoplay.stopOnLastSlide && isLastSlide;
      
      if (shouldStop) {
        setState(prev => ({ ...prev, isAutoplay: false }));
      } else {
        slideNext();
      }
    }, delay);
    
    return () => {
      if (autoplayTimerRef.current) {
        clearInterval(autoplayTimerRef.current);
      }
    };
  }, [state.isAutoplay, state.isPaused, state.currentIndex, slides.length, autoplay, slideNext]);
  
  // Announce slide changes to screen readers
  const announceSlideChange = useCallback((newIndex: number) => {
    if (liveRegionRef.current) {
      const message = liveRegionMessage
        .replace('{index}', String(newIndex + 1))
        .replace('{total}', String(slides.length));
      
      liveRegionRef.current.textContent = message;
      
      // Clear the announcement after a delay
      setTimeout(() => {
        if (liveRegionRef.current) {
          liveRegionRef.current.textContent = '';
        }
      }, 1000);
    }
  }, [liveRegionMessage, slides.length]);
  
  // Toggle autoplay
  const toggleAutoplay = useCallback(() => {
    setState(prev => ({
      ...prev,
      isPaused: !prev.isPaused
    }));
  }, []);
  
  // Keyboard navigation handler
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowLeft':
        e.preventDefault();
        slidePrev();
        announceSlideChange(state.currentIndex - 1);
        break;
      case 'ArrowRight':
        e.preventDefault();
        slideNext();
        announceSlideChange(state.currentIndex + 1);
        break;
      case 'Home':
        e.preventDefault();
        slideTo(0);
        announceSlideChange(0);
        break;
      case 'End':
        e.preventDefault();
        slideTo(slides.length - 1);
        announceSlideChange(slides.length - 1);
        break;
      case ' ':
      case 'Enter':
        if (state.isAutoplay) {
          e.preventDefault();
          toggleAutoplay();
        }
        break;
      case 'Escape':
        // Return focus to container when escaping
        if (containerRef.current && state.isFocused) {
          containerRef.current.focus();
        }
        break;
    }
  }, [slidePrev, slideNext, slideTo, state.currentIndex, state.isAutoplay, slides.length, announceSlideChange, toggleAutoplay]);
  
  // Focus management
  const handleFocus = useCallback(() => {
    setState(prev => ({ ...prev, isFocused: true }));
  }, []);
  
  const handleBlur = useCallback(() => {
    setState(prev => ({ ...prev, isFocused: false, focusedElement: null }));
  }, []);
  
  // Enhanced touch handlers with momentum scrolling and pull resistance
  const handleTouchStart = useCallback((e: TouchEvent) => {
    const touch = e.touches[0];
    const config = getResponsiveConfig();
    
    const newGesture: TouchGestureState = {
      startX: touch.clientX,
      startY: touch.clientY,
      currentX: touch.clientX,
      currentY: touch.clientY,
      startTime: Date.now(),
      isDragging: true,
      hasPassedThreshold: false,
      velocity: 0,
      pullResistance: config.pullResistance || 0
    };
    
    setState(prev => ({
      ...prev,
      touchStart: { x: touch.clientX, y: touch.clientY },
      isDragging: true,
      touchGesture: newGesture,
      isVideoPaused: true // Pause videos during touch interaction
    }));
    
    // Pause any playing videos to prevent conflicts
    const videos = document.querySelectorAll('.carousel__slide--active video');
    videos.forEach(video => {
      const htmlVideo = video as HTMLVideoElement;
      if (!htmlVideo.paused) {
        htmlVideo.pause();
      }
    });
    
    // Provide light haptic feedback on touch start
    if ('vibrate' in navigator && window.matchMedia('(pointer: coarse)').matches) {
      navigator.vibrate(5);
    }
  }, [getResponsiveConfig]);
  
  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!state.touchGesture || !state.isDragging) return;
    
    const touch = e.touches[0];
    const config = getResponsiveConfig();
    const touchThreshold = config.touchThreshold || 50;
    
    // Update gesture state
    const deltaX = touch.clientX - state.touchGesture.startX;
    const deltaY = touch.clientY - state.touchGesture.startY;
    const deltaTime = Date.now() - state.touchGesture.startTime;
    
    // Calculate velocity for momentum scrolling
    const velocity = Math.abs(deltaX) / deltaTime;
    
    // Check if we've passed the threshold for drag initiation
    const hasPassedThreshold = Math.abs(deltaX) > touchThreshold;
    
    // Only prevent default if we're actually dragging horizontally
    if (hasPassedThreshold && Math.abs(deltaX) > Math.abs(deltaY)) {
      e.preventDefault();
      
      // Apply pull resistance at boundaries
      let adjustedDeltaX = deltaX;
      const isAtStart = state.currentIndex === 0 && deltaX > 0;
      const isAtEnd = state.currentIndex === slides.length - 1 && deltaX < 0;
      
      if ((isAtStart || isAtEnd) && config.pullResistance) {
        adjustedDeltaX = deltaX * (1 - config.pullResistance);
      }
      
      // Update track position for real-time feedback
      if (trackRef.current) {
        const currentTransform = getTranslateX();
        trackRef.current.style.transform = `translateX(${currentTransform + adjustedDeltaX}px)`;
      }
      
      setState(prev => ({
        ...prev,
        touchGesture: {
          ...prev.touchGesture!,
          currentX: touch.clientX,
          currentY: touch.clientY,
          hasPassedThreshold,
          velocity,
          pullResistance: config.pullResistance || 0
        }
      }));
    }
  }, [state.touchGesture, state.isDragging, state.currentIndex, slides.length, getResponsiveConfig, getTranslateX]);
  
  const handleTouchEnd = useCallback((e: TouchEvent) => {
    if (!state.touchGesture || !state.isDragging) return;
    
    const touch = e.changedTouches[0];
    const config = getResponsiveConfig();
    const touchThreshold = config.touchThreshold || 50;
    const momentumRatio = config.momentumRatio || 0.1;
    
    const deltaX = touch.clientX - state.touchGesture.startX;
    const deltaY = touch.clientY - state.touchGesture.startY;
    const deltaTime = Date.now() - state.touchGesture.startTime;
    const velocity = Math.abs(deltaX) / deltaTime;
    
    // Reset track position
    if (trackRef.current) {
      trackRef.current.style.transform = `translateX(${getTranslateX()}px)`;
    }
    
    // Determine if it's a horizontal swipe with momentum consideration
    const isHorizontalSwipe = Math.abs(deltaX) > Math.abs(deltaY);
    const hasPassedThreshold = Math.abs(deltaX) > touchThreshold;
    const hasMomentum = velocity > 0.3; // Minimum velocity for momentum
    
    if (isHorizontalSwipe && (hasPassedThreshold || hasMomentum)) {
      // Provide haptic feedback for successful swipe
      if ('vibrate' in navigator && window.matchMedia('(pointer: coarse)').matches) {
        navigator.vibrate(10);
      }
      
      // Determine direction based on delta and momentum
      const shouldGoNext = deltaX < 0 || (deltaX < touchThreshold && velocity > 0.5);
      
      if (shouldGoNext) {
        slideNext();
        announceSlideChange(state.currentIndex + 1);
      } else {
        slidePrev();
        announceSlideChange(state.currentIndex - 1);
      }
      
      // Apply momentum scrolling if enabled
      if (hasMomentum && momentumRatio > 0) {
        setState(prev => ({ ...prev, momentumScrolling: true }));
        setTimeout(() => {
          setState(prev => ({ ...prev, momentumScrolling: false }));
        }, 300);
      }
    }
    
    setState(prev => ({
      ...prev,
      touchStart: null,
      isDragging: false,
      touchGesture: null,
      isVideoPaused: false // Resume video playback after touch ends
    }));
    
    // Resume video playback for active slide
    setTimeout(() => {
      const activeVideo = document.querySelector('.carousel__slide--active video') as HTMLVideoElement;
      if (activeVideo && activeVideo.paused && activeVideo.autoplay) {
        activeVideo.play().catch(() => {
          // Ignore autoplay errors
        });
      }
    }, 100);
  }, [state.touchGesture, state.isDragging, state.currentIndex, slidePrev, slideNext, announceSlideChange, getResponsiveConfig, getTranslateX]);
  
  // Mouse handlers for grab cursor
  const handleMouseDown = useCallback(() => {
    if (grabCursor) {
      setState(prev => ({ ...prev, isDragging: true }));
    }
  }, [grabCursor]);
  
  const handleMouseUp = useCallback(() => {
    setState(prev => ({ ...prev, isDragging: false }));
  }, []);
  
  const handleMouseEnter = useCallback(() => {
    if (typeof autoplay === 'object' && autoplay.pauseOnMouseEnter) {
      setState(prev => ({ ...prev, isPaused: true }));
    }
  }, [autoplay]);
  
  const handleMouseLeave = useCallback(() => {
    if (typeof autoplay === 'object' && autoplay.pauseOnMouseEnter) {
      setState(prev => ({ ...prev, isPaused: false }));
    }
    setState(prev => ({ ...prev, isDragging: false }));
  }, [autoplay]);
  
  // Initialize carousel
  useEffect(() => {
    if (onInit) {
      onInit();
    }
    
    return () => {
      if (onDestroy) {
        onDestroy();
      }
    };
  }, [onInit, onDestroy]);
  
  // Update slide change handler to include announcements
  useEffect(() => {
    announceSlideChange(state.currentIndex);
  }, [state.currentIndex, announceSlideChange]);
  
  // Calculate slide width and spacing
  const { slidesPerView: currentSlidesPerView = 1, spaceBetween: currentSpaceBetween = spaceBetween } = currentBreakpoint;
  const slidesPerViewNum = typeof currentSlidesPerView === 'number' ? currentSlidesPerView : 1;
  const slideWidth = containerWidth / slidesPerViewNum;
  
  // Render slide content with enhanced video support
  const renderSlideContent = (slide: SlideData, index: number) => {
    if (slide.type === 'custom' && slide.content) {
      return slide.content;
    }
    
    if (slide.type === 'image') {
      return (
        <Image
          src={slide.src}
          alt={slide.alt || slide.title || `Slide ${index + 1}`}
          loading={lazy ? 'lazy' : 'eager'}
          fill
          style={{ objectFit: 'cover' }}
        />
      );
    }
    
    if (slide.type === 'video') {
      const isActive = index === state.currentIndex;
      const isVisible = Math.abs(index - state.currentIndex) <= 1; // Current slide and adjacent slides
      
      return (
        <video
          src={slide.src}
          poster={slide.poster}
          loop={slide.loop}
          muted={slide.muted}
          autoPlay={slide.autoplay && isActive}
          playsInline
          controls={isActive} // Only show controls on active slide
          preload={isVisible ? 'auto' : 'none'} // Preload current and adjacent slides
          className={`transition-opacity duration-300 ${isActive ? 'opacity-100' : 'opacity-75'}`}
          style={{ objectFit: 'cover' }}
        />
      );
    }
    
    if (slide.type === 'iframe') {
      const isActive = index === state.currentIndex;
      
      return (
        <iframe
          src={isActive ? slide.src : ''}
          title={slide.title || `Slide ${index + 1}`}
          frameBorder="0"
          allowFullScreen
          loading={isActive ? 'eager' : 'lazy'}
          className={isActive ? 'opacity-100' : 'opacity-0'}
        />
      );
    }
    
    return null;
  };
  
  const isPrevDisabled = !loop && state.currentIndex === 0;
  const isNextDisabled = !loop && state.currentIndex === slides.length - 1;
  
  return (
    <CarouselContainer
      className={`${grabCursor && state.isDragging ? 'carousel--grabbing' : ''} ${grabCursor ? 'carousel--grab' : ''} ${className}`}
      label={containerLabel}
    >
      {/* Screen reader live region for announcements */}
      <div
        ref={liveRegionRef}
        className="sr-only"
        aria-live="polite"
        aria-atomic="true"
      />
      
      <CarouselViewport
        ref={containerRef}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onKeyDown={handleKeyDown}
        onFocus={handleFocus}
        onBlur={handleBlur}
        ariaLive={state.isAutoplay ? 'off' : 'polite'}
      >
        <CarouselTrack
          ref={trackRef}
          id="carousel-track"
          transform={`translateX(${getTranslateX()}px)`}
          transition={state.isDragging ? 'none' : 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)'}
        >
          {slides.map((slide, index) => {
            const isActive = index === state.currentIndex;
            const isVisible = Math.abs(index - state.currentIndex) <= 1; // Current slide and adjacent slides
            
            return (
              <CarouselSlide
                key={slide.id}
                isActive={isActive}
                index={index}
                totalSlides={slides.length}
                aspectRatio={typeof aspectRatio === 'string' ? aspectRatio : aspectRatio.toString()}
                lazy={typeof lazy === 'boolean' ? lazy : lazy.elementClass !== undefined}
                ariaLabel={slide.ariaLabel || slideLabel.replace('{index}', String(index + 1)).replace('{total}', String(slides.length))}
                ariaDescribedBy={slide.ariaDescription ? `slide-desc-${slide.id}` : undefined}
                style={{
                  width: `${slideWidth}px`,
                  marginRight: index < slides.length - 1 ? `${currentSpaceBetween}px` : '0'
                } as React.CSSProperties}
                className={`transition-all duration-300 ${isActive ? 'z-10' : 'z-0'}`}
              >
                {/* Performance optimization: Only render content for visible slides */}
                {isVisible ? (
                  <>
                    {renderSlideContent(slide, index)}
                    {slide.caption && (
                      <div className="carousel__slide-caption" id={`slide-desc-${slide.id}`}>
                        {slide.caption}
                      </div>
                    )}
                  </>
                ) : (
                  /* Placeholder for non-visible slides to maintain layout */
                  <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                    {slide.poster && (
                      <Image
                        src={slide.poster}
                        alt={slide.title || `Slide ${index + 1} preview`}
                        fill
                        style={{ objectFit: 'cover' }}
                        className="opacity-50"
                      />
                    )}
                  </div>
                )}
              </CarouselSlide>
            );
          })}
        </CarouselTrack>
      </CarouselViewport>
      
      {navigation && (
        <>
          <NavigationButton
            ref={prevButtonRef}
            direction="prev"
            onClick={slidePrev}
            disabled={isPrevDisabled}
            ariaLabel={isPrevDisabled ? firstSlideMessage : prevSlideMessage}
            tabIndex={state.isFocused ? 0 : -1}
          />
          <NavigationButton
            ref={nextButtonRef}
            direction="next"
            onClick={slideNext}
            disabled={isNextDisabled}
            ariaLabel={isNextDisabled ? lastSlideMessage : nextSlideMessage}
            tabIndex={state.isFocused ? 0 : -1}
          />
        </>
      )}
      
      {pagination && (
        <PaginationBullets
          ref={paginationRef}
          currentIndex={state.currentIndex}
          totalSlides={slides.length}
          onClick={slideTo}
          ariaLabel="Carousel slide navigation"
        />
      )}
      
      {/* Autoplay controls for keyboard users */}
      {state.isAutoplay && (
        <button
          className="carousel__autoplay-control sr-only focus:not-sr-only"
          onClick={toggleAutoplay}
          aria-label={state.isPaused ? playLabel : pauseLabel}
          tabIndex={state.isFocused ? 0 : -1}
        >
          {state.isPaused ? 'Play' : 'Pause'}
        </button>
      )}
    </CarouselContainer>
  );
};

export default Carousel;