# Modern Carousel Architecture Design Specification

## Overview

This document outlines a comprehensive design for a modern, highly accessible, and performant carousel component built with React and TypeScript. The design addresses all issues identified in the current implementation while following modern web development best practices.

## Table of Contents

1. [Component Architecture](#component-architecture)
2. [Props Interface](#props-interface)
3. [Responsive Behavior](#responsive-behavior)
4. [Accessibility Features](#accessibility-features)
5. [Performance Optimizations](#performance-optimizations)
6. [Navigation Controls](#navigation-controls)
7. [CSS Architecture](#css-architecture)
8. [Plugin/Extensibility System](#pluginextensibility-system)
9. [Implementation Guidelines](#implementation-guidelines)
10. [Migration Strategy](#migration-strategy)

## Component Architecture

### Core Structure

The carousel follows a composite component pattern with clear separation of concerns:

```
Carousel (main container)
├── CarouselViewport (visible area)
│   ├── CarouselTrack (slide container)
│   │   ├── CarouselSlide (individual slides)
│   │   │   ├── SlideContent (image/video/custom)
│   │   │   └── SlideOverlay (text/content overlay)
│   ├── NavigationControls
│   │   ├── PreviousButton
│   │   └── NextButton
│   └── PaginationIndicators
├── TouchGestureHandler (mobile interactions)
└── AccessibilityLayer (ARIA, keyboard, focus)
```

### Component Responsibilities

1. **Carousel**: Main component that manages state and orchestrates all sub-components
2. **CarouselViewport**: Defines the visible area and handles overflow
3. **CarouselTrack**: Manages slide positioning and animations
4. **CarouselSlide**: Individual slide wrapper with aspect ratio management
5. **NavigationControls**: Handles all navigation interactions
6. **TouchGestureHandler**: Processes touch/swipe gestures
7. **AccessibilityLayer**: Manages ARIA attributes and keyboard navigation

### State Management

Using React hooks for efficient state management:

```typescript
// Core state interface
interface CarouselState {
  currentIndex: number;
  isAnimating: boolean;
  isAutoplay: boolean;
  isPaused: boolean;
  touchStart: { x: number; y: number } | null;
  isDragging: boolean;
  visibleSlides: number[];
}
```

## Props Interface

### Main Carousel Props

```typescript
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
```

### Slide Data Interface

```typescript
interface SlideData {
  id: string;
  type: 'image' | 'video' | 'custom' | 'iframe';
  src: string;
  alt?: string;
  caption?: string;
  title?: string;
  description?: string;
  
  // Media-specific options
  poster?: string; // For video
  loop?: boolean;  // For video
  muted?: boolean; // For video
  autoplay?: boolean; // For video
  
  // Custom content
  content?: React.ReactNode;
  
  // Lazy loading
  lazy?: boolean;
  
  // Accessibility
  ariaLabel?: string;
  ariaDescription?: string;
}
```

### Configuration Options

```typescript
// Autoplay options
interface AutoplayOptions {
  delay: number;
  disableOnInteraction?: boolean;
  pauseOnMouseEnter?: boolean;
  stopOnLastSlide?: boolean;
}

// Navigation options
interface NavigationOptions {
  hideOnClick?: boolean;
  disabledClass?: string;
  hiddenClass?: string;
}

// Pagination options
interface PaginationOptions {
  type?: 'bullets' | 'fraction' | 'progressbar' | 'custom';
  clickable?: boolean;
  dynamicBullets?: boolean;
  renderBullet?: (index: number, className: string) => React.ReactNode;
}

// Breakpoint options
interface BreakpointOptions {
  [width: number]: Partial<CarouselProps>;
}

// Lazy loading options
interface LazyOptions {
  loadPrevNext?: boolean;
  loadPrevNextAmount?: number;
  loadOnTransitionStart?: boolean;
  elementClass?: string;
  loadingClass?: string;
  loadedClass?: string;
}

// Accessibility options
interface A11yOptions {
  prevSlideMessage?: string;
  nextSlideMessage?: string;
  firstSlideMessage?: string;
  lastSlideMessage?: string;
  paginationBulletMessage?: string;
  notificationClass?: string;
}

// Theme options
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
```

## Responsive Behavior

### Breakpoint System

The carousel uses a mobile-first responsive design with these default breakpoints:

```typescript
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
```

### Aspect Ratio Management

The carousel maintains consistent aspect ratios across all viewports:

```css
/* CSS Custom Properties for aspect ratios */
:root {
  --carousel-aspect-ratio: 3/4; /* Default */
  --carousel-aspect-ratio-mobile: 3/4;
  --carousel-aspect-ratio-tablet: 3/4;
  --carousel-aspect-ratio-desktop: 3/4;
}

.carousel-slide {
  aspect-ratio: var(--carousel-aspect-ratio);
}

@media (min-width: 768px) {
  .carousel-slide {
    aspect-ratio: var(--carousel-aspect-ratio-tablet);
  }
}

@media (min-width: 1024px) {
  .carousel-slide {
    aspect-ratio: var(--carousel-aspect-ratio-desktop);
  }
}
```

### Responsive Sizing Strategy

1. **Fluid Widths**: Cards use percentage-based widths that adapt to viewport
2. **Consistent Ratios**: Aspect ratios remain constant across breakpoints
3. **Appropriate Spacing**: Space between cards scales with viewport size
4. **Touch-Friendly**: Minimum touch targets maintained on mobile

## Accessibility Features

### ARIA Implementation

```typescript
// ARIA attributes managed by the component
const ariaAttributes = {
  'aria-label': 'Carousel',
  'aria-roledescription': 'carousel',
  'aria-live': 'polite',
  'aria-atomic': 'false'
};

// For individual slides
const slideAriaAttributes = {
  'role': 'group',
  'aria-roledescription': 'slide',
  'aria-label': `${index + 1} of ${totalSlides}`
};
```

### Keyboard Navigation

Supported keyboard interactions:

| Key | Action |
|-----|--------|
| Arrow Left | Go to previous slide |
| Arrow Right | Go to next slide |
| Home | Go to first slide |
| End | Go to last slide |
| Space | Toggle autoplay (if enabled) |
| Escape | Exit carousel focus |

### Focus Management

1. **Focus Trapping**: When carousel receives focus, it stays within carousel controls
2. **Visible Focus**: All interactive elements have visible focus indicators
3. **Skip Links**: Option to add skip links for keyboard users
4. **Announcements**: Screen reader announcements for slide changes

### Reduced Motion Support

```css
@media (prefers-reduced-motion: reduce) {
  .carousel-track {
    transition: none !important;
    animation: none !important;
  }
  
  .carousel-slide {
    transition: none !important;
    animation: none !important;
  }
}
```

## Performance Optimizations

### Lazy Loading Strategy

1. **Intersection Observer**: Uses modern Intersection Observer API
2. **Preloading**: Preloads adjacent slides for smoother transitions
3. **Progressive Loading**: Loads low-quality placeholders first
4. **Video Optimization**: Delays video loading until slide is active

```typescript
// Lazy loading implementation
const useLazyLoading = (slides: SlideData[]) => {
  const [loadedSlides, setLoadedSlides] = useState<Set<number>>(new Set());
  
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const slideIndex = parseInt(entry.target.dataset.index || '0');
            setLoadedSlides((prev) => new Set(prev).add(slideIndex));
            observer.unobserve(entry.target);
          }
        });
      },
      { rootMargin: '50%' }
    );
    
    // Observe slide elements
    const slideElements = document.querySelectorAll('.carousel-slide[data-lazy]');
    slideElements.forEach((el) => observer.observe(el));
    
    return () => observer.disconnect();
  }, [slides]);
  
  return loadedSlides;
};
```

### Animation Optimizations

1. **GPU Acceleration**: Uses CSS transforms for smooth animations
2. **Will Change Property**: Strategically applies will-change for performance
3. **Throttled Events**: Throttles resize and scroll events
4. **Request Animation Frame**: Uses RAF for smooth animations

```css
/* Performance optimizations */
.carousel-track {
  transform: translateZ(0); /* GPU acceleration */
  will-change: transform; /* Hint for browser optimization */
  backface-visibility: hidden; /* Prevent flickering */
}

.carousel-slide {
  transform: translateZ(0);
  backface-visibility: hidden;
  perspective: 1000px;
}
```

### State Management Optimizations

1. **Memoization**: Uses React.memo and useMemo for expensive calculations
2. **Debounced Resize**: Debounces resize event handlers
3. **Efficient Re-renders**: Minimizes unnecessary component re-renders
4. **Virtual Scrolling**: Option for virtual scrolling with many slides

## Navigation Controls

### Navigation Arrows

```typescript
interface NavigationArrowProps {
  direction: 'prev' | 'next';
  onClick: () => void;
  disabled: boolean;
  className?: string;
  children?: React.ReactNode;
}
```

Features:
- Smart positioning based on content
- Automatic hiding on first/last slides (when not looping)
- Keyboard accessible
- Touch-friendly sizing
- Customizable appearance

### Pagination Indicators

Three types of pagination:

1. **Bullets**: Traditional dot indicators
2. **Fraction**: Current/total display (e.g., "1 / 5")
3. **Progress Bar**: Visual progress bar

```typescript
interface PaginationIndicatorProps {
  type: 'bullets' | 'fraction' | 'progressbar';
  currentIndex: number;
  totalSlides: number;
  onClick: (index: number) => void;
}
```

### Autoplay Functionality

```typescript
interface AutoplayOptions {
  delay: number; // in milliseconds
  disableOnInteraction: boolean;
  pauseOnMouseEnter: boolean;
  stopOnLastSlide: boolean;
}
```

Features:
- Pause on hover
- Pause on user interaction
- Visual progress indicator
- Respect for reduced motion preferences

## CSS Architecture

### Custom Properties System

```css
:root {
  /* Colors */
  --carousel-bg: #ffffff;
  --carousel-text: #1f2937;
  --carousel-overlay: rgba(0, 0, 0, 0.5);
  --carousel-nav-bg: rgba(255, 255, 255, 0.9);
  --carousel-nav-hover: #6366f1;
  
  /* Spacing */
  --carousel-gap: 1rem;
  --carousel-padding: 1rem;
  --carousel-nav-size: 3rem;
  
  /* Transitions */
  --carousel-transition-duration: 0.3s;
  --carousel-transition-easing: cubic-bezier(0.4, 0, 0.2, 1);
  
  /* Borders */
  --carousel-border-radius: 0.5rem;
  --carousel-nav-radius: 50%;
  
  /* Shadows */
  --carousel-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  --carousel-nav-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
}
```

### CSS Class Structure

```css
/* Base carousel */
.carousel { /* Main container */ }
.carousel__viewport { /* Visible area */ }
.carousel__track { /* Slide container */ }
.carousel__slide { /* Individual slide */ }
.carousel__slide--active { /* Active slide */ }
.carousel__slide--prev { /* Previous slide */ }
.carousel__slide--next { /* Next slide */ }

/* Navigation */
.carousel__navigation { /* Navigation container */ }
.carousel__navigation--disabled { /* Disabled state */ }
.carousel__arrow { /* Arrow buttons */ }
.carousel__arrow--prev { /* Previous arrow */ }
.carousel__arrow--next { /* Next arrow */ }

/* Pagination */
.carousel__pagination { /* Pagination container */ }
.carousel__pagination--bullets { /* Bullet style */ }
.carousel__pagination--fraction { /* Fraction style */ }
.carousel__pagination--progressbar { /* Progress bar style */ }
.carousel__pagination-bullet { /* Individual bullet */ }
.carousel__pagination-bullet--active { /* Active bullet */ }

/* Touch */
.carousel--grab { /* Grab cursor */ }
.carousel--grabbing { /* Grabbing cursor */ }

/* Lazy loading */
.carousel__slide--lazy { /* Lazy slide */ }
.carousel__slide--loading { /* Loading state */ }
.carousel__slide--loaded { /* Loaded state */ }

/* Accessibility */
.carousel__sr-only { /* Screen reader only */ }
.carousel__focus-trap { /* Focus trap */ }
```

### Animation and Transitions

```css
/* Smooth slide transitions */
.carousel__track {
  transition: transform var(--carousel-transition-duration) var(--carousel-transition-easing);
}

/* Navigation animations */
.carousel__arrow {
  transition: all 0.2s ease;
}

.carousel__arrow:hover {
  transform: scale(1.1);
  box-shadow: var(--carousel-nav-shadow);
}

/* Pagination animations */
.carousel__pagination-bullet {
  transition: all 0.2s ease;
}

.carousel__pagination-bullet--active {
  transform: scale(1.2);
}

/* Touch feedback */
@media (hover: hover) {
  .carousel__slide:hover {
    transform: scale(1.02);
  }
}
```

## Plugin/Extensibility System

### Plugin Architecture

The carousel supports a plugin system for extending functionality:

```typescript
interface CarouselPlugin {
  name: string;
  version: string;
  install: (carousel: CarouselInstance) => void;
  uninstall?: (carousel: CarouselInstance) => void;
}

interface CarouselInstance {
  // Core methods
  slideTo: (index: number, speed?: number) => void;
  slideNext: (speed?: number) => void;
  slidePrev: (speed?: number) => void;
  
  // Lifecycle hooks
  on: (event: string, handler: Function) => void;
  off: (event: string, handler: Function) => void;
  emit: (event: string, ...args: any[]) => void;
  
  // Properties
  params: CarouselProps;
  currentIndex: number;
  isBeginning: boolean;
  isEnd: boolean;
  slides: HTMLElement[];
}
```

### Built-in Plugins

1. **Autoplay**: Automatic slide advancement
2. **Keyboard**: Enhanced keyboard navigation
3. **Mousewheel**: Mouse wheel navigation
4. **Zoom**: Image zoom functionality
5. **Thumbnails**: Thumbnail navigation
6. **Parallax**: Parallax effects on slides

### Custom Plugin Example

```typescript
const ParallaxPlugin: CarouselPlugin = {
  name: 'parallax',
  version: '1.0.0',
  install(carousel) {
    const handleProgress = (progress: number) => {
      const slides = carousel.slides;
      slides.forEach((slide, index) => {
        const slideProgress = Math.abs(index - carousel.currentIndex);
        const parallax = slideProgress * 50;
        slide.style.transform = `translateY(${parallax}px)`;
      });
    };
    
    carousel.on('progress', handleProgress);
    
    // Store handler for cleanup
    carousel._parallaxHandler = handleProgress;
  },
  uninstall(carousel) {
    carousel.off('progress', carousel._parallaxHandler);
    delete carousel._parallaxHandler;
  }
};
```

## Implementation Guidelines

### Best Practices

1. **Progressive Enhancement**: Ensure carousel works without JavaScript
2. **Mobile-First**: Design for mobile devices first
3. **Performance First**: Prioritize performance in all decisions
4. **Accessibility**: Build with accessibility in mind from the start
5. **Semantic HTML**: Use appropriate HTML elements
6. **Error Boundaries**: Handle errors gracefully
7. **Testing**: Comprehensive testing for all features

### Code Organization

```
src/components/carousel/
├── index.ts                 # Main exports
├── Carousel.tsx            # Main component
├── components/             # Sub-components
│   ├── CarouselViewport.tsx
│   ├── CarouselTrack.tsx
│   ├── CarouselSlide.tsx
│   ├── Navigation.tsx
│   └── Pagination.tsx
├── hooks/                  # Custom hooks
│   ├── useCarouselState.ts
│   ├── useLazyLoading.ts
│   ├── useTouchGestures.ts
│   └── useKeyboardNavigation.ts
├── utils/                  # Utility functions
│   ├── animations.ts
│   ├── breakpoints.ts
│   └── accessibility.ts
├── plugins/                # Plugin system
│   ├── index.ts
│   ├── Autoplay.ts
│   ├── Keyboard.ts
│   └── Parallax.ts
├── types/                  # TypeScript types
│   └── index.ts
└── styles/                 # CSS styles
    ├── index.css
    ├── carousel.css
    ├── navigation.css
    └── pagination.css
```

### Testing Strategy

1. **Unit Tests**: Test individual components and hooks
2. **Integration Tests**: Test component interactions
3. **Accessibility Tests**: Test with screen readers
4. **Performance Tests**: Measure animation performance
5. **Visual Regression**: Ensure consistent appearance
6. **Cross-browser**: Test across browsers
7. **Device Testing**: Test on actual devices

## Migration Strategy

### From Current Implementation

1. **API Compatibility**: Maintain compatibility with existing props
2. **Gradual Migration**: Allow gradual replacement of current carousel
3. **Feature Parity**: Ensure all current features are available
4. **Performance Improvements**: Highlight performance benefits
5. **Documentation**: Provide migration guide

### Migration Steps

1. **Phase 1**: Implement core carousel with basic functionality
2. **Phase 2**: Add accessibility features and keyboard navigation
3. **Phase 3**: Implement touch gestures and mobile optimization
4. **Phase 4**: Add performance optimizations and lazy loading
5. **Phase 5**: Implement plugin system and advanced features
6. **Phase 6**: Complete migration and remove old implementation

### Backward Compatibility

```typescript
// Adapter for backward compatibility
const CarouselAdapter = (props: LegacyCarouselProps) => {
  const adaptedProps: CarouselProps = {
    slides: props.slides.map(slide => ({
      id: slide.id,
      type: slide.isVideo ? 'video' : 'image',
      src: slide.src,
      title: slide.title,
      description: slide.description
    })),
    aspectRatio: '3/4',
    navigation: true,
    pagination: true,
    loop: true,
    autoplay: false
  };
  
  return <Carousel {...adaptedProps} />;
};
```

## Conclusion

This carousel architecture design provides a comprehensive solution that addresses all issues identified in the current implementation while following modern web development best practices. The component is built with accessibility, performance, and extensibility in mind, ensuring it will serve the project's needs well into the future.

The modular architecture allows for easy customization and extension, while the comprehensive prop interface provides flexibility for different use cases. The performance optimizations ensure smooth animations and efficient resource usage, even with large numbers of slides.

The plugin system opens up possibilities for future enhancements without requiring changes to the core component, and the migration strategy ensures a smooth transition from the current implementation.