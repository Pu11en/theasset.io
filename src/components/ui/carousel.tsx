import React, { useState, useEffect, useRef, useCallback, Children, cloneElement, ReactNode, MouseEvent, TouchEvent } from 'react';

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
}

// Default breakpoints
const defaultBreakpoints = {
  320: {  // Extra small devices
    slidesPerView: 1,
    spaceBetween: 10
  },
  640: {  // Small devices
    slidesPerView: 1.2,
    spaceBetween: 15
  },
  768: {  // Medium devices (tablets)
    slidesPerView: 1.5,
    spaceBetween: 20
  },
  1024: { // Large devices (desktops)
    slidesPerView: 2,
    spaceBetween: 25
  },
  1280: { // Extra large devices
    slidesPerView: 2.5,
    spaceBetween: 30
  },
  1536: { // 2XL devices
    slidesPerView: 3,
    spaceBetween: 35
  }
};

// Sub-components
const CarouselContainer: React.FC<{ children: ReactNode; className?: string }> = ({ children, className }) => (
  <div className={`carousel ${className || ''}`} role="region" aria-roledescription="carousel">
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
  }
>(({ children, className, onMouseDown, onMouseUp, onMouseEnter, onMouseLeave, onTouchStart, onTouchMove, onTouchEnd }, ref) => (
  <div
    ref={ref}
    className={`carousel__viewport ${className || ''}`}
    aria-live="polite"
    onMouseDown={onMouseDown}
    onMouseUp={onMouseUp}
    onMouseEnter={onMouseEnter}
    onMouseLeave={onMouseLeave}
    onTouchStart={onTouchStart}
    onTouchMove={onTouchMove}
    onTouchEnd={onTouchEnd}
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
  }
>(({ children, transform, transition, className }, ref) => (
  <div
    ref={ref}
    className={`carousel__track ${className || ''}`}
    style={{ transform, transition }}
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
}> = ({ children, isActive, index, totalSlides, aspectRatio, lazy, className, style }) => {
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
      aria-label={`${index + 1} of ${totalSlides}`}
      data-index={index}
    >
      {children}
    </div>
  );
};

const NavigationButton: React.FC<{
  direction: 'prev' | 'next';
  onClick: () => void;
  disabled: boolean;
  className?: string;
  children?: ReactNode;
}> = ({ direction, onClick, disabled, className, children }) => (
  <button
    className={`carousel__arrow carousel__arrow--${direction} ${disabled ? 'carousel__arrow--disabled' : ''} ${className || ''}`}
    onClick={onClick}
    disabled={disabled}
    aria-label={`Go to ${direction} slide`}
  >
    {children || (
      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        {direction === 'prev' ? (
          <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        ) : (
          <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        )}
      </svg>
    )}
  </button>
);

const PaginationBullets: React.FC<{
  currentIndex: number;
  totalSlides: number;
  onClick: (index: number) => void;
  className?: string;
}> = ({ currentIndex, totalSlides, onClick, className }) => (
  <div className={`carousel__pagination carousel__pagination--bullets ${className || ''}`}>
    {Array.from({ length: totalSlides }).map((_, index) => (
      <button
        key={index}
        className={`carousel__pagination-bullet ${index === currentIndex ? 'carousel__pagination-bullet--active' : ''}`}
        onClick={() => onClick(index)}
        aria-label={`Go to slide ${index + 1}`}
        aria-current={index === currentIndex ? 'true' : 'false'}
      />
    ))}
  </div>
);

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
  preloadImages = true,
  a11y = true,
  className = '',
  theme,
  onSlideChange,
  onInit,
  onDestroy
}) => {
  const [state, setState] = useState<CarouselState>({
    currentIndex: initialSlide,
    isAnimating: false,
    isAutoplay: typeof autoplay === 'object' ? autoplay.delay > 0 : autoplay === true,
    isPaused: false,
    touchStart: null,
    isDragging: false,
    visibleSlides: []
  });
  
  const [containerWidth, setContainerWidth] = useState(0);
  const [currentBreakpoint, setCurrentBreakpoint] = useState<Partial<CarouselProps>>({});
  
  const containerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const autoplayTimerRef = useRef<NodeJS.Timeout | null>(null);
  
  // Get responsive config based on container width
  const getResponsiveConfig = useCallback(() => {
    let config = { slidesPerView, spaceBetween };
    
    // Find matching breakpoint
    const sortedBreakpoints = Object.keys(breakpoints)
      .map(bp => parseInt(bp))
      .sort((a, b) => b - a); // Sort in descending order
      
    for (const bp of sortedBreakpoints) {
      if (containerWidth >= bp) {
        config = { ...config, ...(breakpoints as any)[bp] };
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
  
  // Touch handlers
  const handleTouchStart = useCallback((e: TouchEvent) => {
    setState(prev => ({
      ...prev,
      touchStart: { x: e.touches[0].clientX, y: e.touches[0].clientY },
      isDragging: true
    }));
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
      if (diffX > 0) {
        slidePrev(); // Swipe right - go to previous
      } else {
        slideNext(); // Swipe left - go to next
      }
    }
    
    setState(prev => ({
      ...prev,
      touchStart: null,
      isDragging: false
    }));
  }, [state.touchStart, state.isDragging, slidePrev, slideNext]);
  
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
        <img
          src={slide.src}
          alt={slide.alt || slide.title || `Slide ${index + 1}`}
          loading={lazy ? 'lazy' : 'eager'}
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
    <CarouselContainer className={`${grabCursor && state.isDragging ? 'carousel--grabbing' : ''} ${grabCursor ? 'carousel--grab' : ''} ${className}`}>
      <CarouselViewport
        ref={containerRef}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <CarouselTrack
          ref={trackRef}
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
              style={{
                width: `${slideWidth}px`,
                marginRight: index < slides.length - 1 ? `${currentSpaceBetween}px` : '0'
              } as React.CSSProperties}
            >
              {renderSlideContent(slide, index)}
              {slide.caption && (
                <div className="carousel__slide-caption">
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
            direction="prev"
            onClick={slidePrev}
            disabled={isPrevDisabled}
          />
          <NavigationButton
            direction="next"
            onClick={slideNext}
            disabled={isNextDisabled}
          />
        </>
      )}
      
      {pagination && (
        <PaginationBullets
          currentIndex={state.currentIndex}
          totalSlides={slides.length}
          onClick={slideTo}
        />
      )}
    </CarouselContainer>
  );
};

export default Carousel;