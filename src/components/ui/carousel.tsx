import React, { useState, useEffect, useRef, useCallback, ReactNode, TouchEvent, KeyboardEvent } from 'react';
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
}

// Default breakpoints - optimized for 3 video cards display
const defaultBreakpoints = {
  320: {  // Extra small devices
    slidesPerView: 1,
    spaceBetween: 10
  },
  480: {  // Small devices
    slidesPerView: 1.2,
    spaceBetween: 15
  },
  640: {  // Medium devices
    slidesPerView: 1.5,
    spaceBetween: 15
  },
  768: {  // Large tablets - fixed problematic range
    slidesPerView: 1.8,
    spaceBetween: 20
  },
  896: {  // Small desktops - additional breakpoint
    slidesPerView: 2.2,
    spaceBetween: 20
  },
  1024: { // Desktops
    slidesPerView: 2.5,
    spaceBetween: 25
  },
  1280: { // Large desktops
    slidesPerView: 2.8,
    spaceBetween: 30
  },
  1440: { // Extra large desktops
    slidesPerView: 3,
    spaceBetween: 35
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
    focusedElement: null
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
    let config = { slidesPerView, spaceBetween };
    
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
  
  // Navigation functions
  const slideTo = useCallback((index: number) => {
    if (state.isAnimating) return;
    
    const newIndex = loop
      ? (index + slides.length) % slides.length
      : Math.max(0, Math.min(index, slides.length - 1));
    
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
  
  // Touch handlers with enhanced accessibility
  const handleTouchStart = useCallback((e: TouchEvent) => {
    setState(prev => ({
      ...prev,
      touchStart: { x: e.touches[0].clientX, y: e.touches[0].clientY },
      isDragging: true
    }));
    
    // Provide haptic feedback if available
    if ('vibrate' in navigator) {
      navigator.vibrate(10);
    }
  }, []);
  
  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!state.touchStart || !state.isDragging) return;
    
    // Prevent default to enable smooth swiping
    e.preventDefault();
  }, [state.touchStart, state.isDragging]);
  
  const handleTouchEnd = useCallback((e: TouchEvent) => {
    if (!state.touchStart || !state.isDragging) return;
    
    const touchEnd = { x: e.changedTouches[0].clientX, y: e.changedTouches[0].clientY };
    const diffX = touchEnd.x - state.touchStart.x;
    const diffY = touchEnd.y - state.touchStart.y;
    
    // Determine if it's a horizontal swipe
    if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 50) {
      // Provide haptic feedback for successful swipe
      if ('vibrate' in navigator) {
        navigator.vibrate(20);
      }
      
      if (diffX > 0) {
        slidePrev(); // Swipe right - go to previous
        announceSlideChange(state.currentIndex - 1);
      } else {
        slideNext(); // Swipe left - go to next
        announceSlideChange(state.currentIndex + 1);
      }
    }
    
    setState(prev => ({
      ...prev,
      touchStart: null,
      isDragging: false
    }));
  }, [state.touchStart, state.isDragging, slidePrev, slideNext, state.currentIndex, announceSlideChange]);
  
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
  
  // Render slide content
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
      return (
        <video
          src={slide.src}
          poster={slide.poster}
          loop={slide.loop}
          muted={slide.muted}
          autoPlay={slide.autoplay}
          playsInline
          controls
        />
      );
    }
    
    if (slide.type === 'iframe') {
      return (
        <iframe
          src={slide.src}
          title={slide.title || `Slide ${index + 1}`}
          frameBorder="0"
          allowFullScreen
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
          {slides.map((slide, index) => (
            <CarouselSlide
              key={slide.id}
              isActive={index === state.currentIndex}
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
            >
              {renderSlideContent(slide, index)}
              {slide.caption && (
                <div className="carousel__slide-caption" id={`slide-desc-${slide.id}`}>
                  {slide.caption}
                </div>
              )}
            </CarouselSlide>
          ))}
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