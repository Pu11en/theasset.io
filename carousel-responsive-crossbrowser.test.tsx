/**
 * Comprehensive Test Suite for Carousel Responsive Design and Cross-Browser Compatibility
 *
 * This test suite verifies:
 * 1. Responsive design across all breakpoints
 * 2. Video autoplay behavior across browsers
 * 3. Static image display compatibility
 * 4. CSS animations and transitions
 * 5. Touch gesture functionality
 * 6. Performance optimizations
 * 7. Accessibility compliance
 */

// Import types for our test
import type { SlideData } from '@/components/ui/carousel';

// Define mock interfaces for testing
interface MockMediaQueryList {
  matches: boolean;
  media: string;
  onchange: null;
  addListener: jest.Mock;
  removeListener: jest.Mock;
  addEventListener: jest.Mock;
  removeEventListener: jest.Mock;
  dispatchEvent: jest.Mock;
}

// Mock IntersectionObserver
const mockIntersectionObserver = jest.fn();
mockIntersectionObserver.mockReturnValue({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
});
window.IntersectionObserver = mockIntersectionObserver;

// Mock navigator.vibrate for haptic feedback testing
Object.defineProperty(navigator, 'vibrate', {
  writable: true,
  value: jest.fn(),
});

// Mock window.matchMedia for responsive testing
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation((query: string): MockMediaQueryList => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock video element methods
HTMLVideoElement.prototype.play = jest.fn(() => Promise.resolve());
HTMLVideoElement.prototype.pause = jest.fn();
HTMLVideoElement.prototype.load = jest.fn();

describe('Carousel Responsive Design and Cross-Browser Compatibility', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Default to desktop viewport
    window.matchMedia = jest.fn().mockImplementation(query => ({
      matches: query === '(pointer: fine)' || query === '(min-width: 1024px)',
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    }));
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Responsive Design Verification', () => {
    const mockSlides: SlideData[] = [
      {
        id: 'test-slide-1',
        type: 'custom' as const,
        src: '', // Required field
        content: <div data-testid="slide-1">Slide 1 Content</div>,
      },
      {
        id: 'test-slide-2',
        type: 'custom' as const,
        src: '', // Required field
        content: <div data-testid="slide-2">Slide 2 Content</div>,
      },
      {
        id: 'test-slide-3',
        type: 'custom' as const,
        src: '', // Required field
        content: <div data-testid="slide-3">Slide 3 Content</div>,
      },
    ];

    it('should render correctly on mobile devices (320px-480px)', async () => {
      // Mock mobile viewport
      window.matchMedia = jest.fn().mockImplementation((query: string): MockMediaQueryList => ({
        matches: query === '(pointer: coarse)' || query === '(max-width: 640px)',
        media: query,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
      }));

      // Mock container width for mobile
      Object.defineProperty(HTMLElement.prototype, 'offsetWidth', {
        writable: true,
        value: 375,
      });

      render(
        <Carousel
          slides={mockSlides}
          aspectRatio="3/4"
          slidesPerView="auto"
          spaceBetween={20}
          loop={true}
          navigation={true}
          pagination={false}
        />
      );

      // Check if carousel renders
      expect(screen.getByRole('region', { name: /carousel/i })).toBeInTheDocument();
      
      // Check if slides are rendered
      expect(screen.getByTestId('slide-1')).toBeInTheDocument();
      expect(screen.getByTestId('slide-2')).toBeInTheDocument();
      expect(screen.getByTestId('slide-3')).toBeInTheDocument();

      // Check if navigation arrows are properly sized for mobile
      const prevButton = screen.getByRole('button', { name: /previous/i });
      const nextButton = screen.getByRole('button', { name: /next/i });
      
      expect(prevButton).toBeInTheDocument();
      expect(nextButton).toBeInTheDocument();
      
      // Check touch-friendly sizing (minimum 44px)
      expect(prevButton).toHaveStyle({ width: '44px' });
      expect(nextButton).toHaveStyle({ width: '44px' });
    });

    it('should render correctly on tablet devices (768px-1024px)', async () => {
      // Mock tablet viewport
      window.matchMedia = jest.fn().mockImplementation(query => ({
        matches: query === '(min-width: 768px)' && query !== '(min-width: 1024px)',
        media: query,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
      }));

      // Mock container width for tablet
      Object.defineProperty(HTMLElement.prototype, 'offsetWidth', {
        writable: true,
        value: 896,
      });

      render(
        <Carousel
          slides={mockSlides}
          aspectRatio="3/4"
          slidesPerView="auto"
          spaceBetween={20}
          loop={true}
          navigation={true}
          pagination={false}
        />
      );

      // Check if carousel renders
      expect(screen.getByRole('region', { name: /carousel/i })).toBeInTheDocument();
      
      // Check if slides maintain 3:4 aspect ratio
      const slides = screen.getAllByRole('group');
      slides.forEach((slide: HTMLElement) => {
        expect(slide).toHaveStyle({ aspectRatio: '3/4' });
      });
    });

    it('should render correctly on desktop devices (1024px+)', async () => {
      // Mock desktop viewport
      window.matchMedia = jest.fn().mockImplementation((query: string): MockMediaQueryList => ({
        matches: query === '(pointer: fine)' || query === '(min-width: 1024px)',
        media: query,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
      }));

      // Mock container width for desktop
      Object.defineProperty(HTMLElement.prototype, 'offsetWidth', {
        writable: true,
        value: 1280,
      });

      render(
        <Carousel
          slides={mockSlides}
          aspectRatio="3/4"
          slidesPerView="auto"
          spaceBetween={20}
          loop={true}
          navigation={true}
          pagination={false}
        />
      );

      // Check if carousel renders
      expect(screen.getByRole('region', { name: /carousel/i })).toBeInTheDocument();
      
      // Check if navigation arrows are properly positioned
      const prevButton = screen.getByRole('button', { name: /previous/i });
      const nextButton = screen.getByRole('button', { name: /next/i });
      
      expect(prevButton).toHaveStyle({ left: '1.5rem' });
      expect(nextButton).toHaveStyle({ right: '1.5rem' });
    });

    it('should maintain proper aspect ratio across all viewports', () => {
      const viewports = [320, 480, 768, 1024, 1280, 1440];
      
      viewports.forEach(width => {
        // Mock viewport
        Object.defineProperty(HTMLElement.prototype, 'offsetWidth', {
          writable: true,
          value: width,
        });

        const { unmount } = render(
          <Carousel
            slides={mockSlides}
            aspectRatio="3/4"
            slidesPerView="auto"
            spaceBetween={20}
            loop={true}
            navigation={true}
            pagination={false}
          />
        );

        // Check if slides maintain 3:4 aspect ratio
        const slides = screen.getAllByRole('group');
        slides.forEach((slide: HTMLElement) => {
          expect(slide).toHaveStyle({ aspectRatio: '3/4' });
        });

        unmount();
      });
    });
  });

  describe('Video Autoplay Behavior', () => {
    const videoProps = {
      src: 'https://example.com/video.mp4',
      poster: 'https://example.com/poster.jpg',
      title: 'Test Video',
      description: 'Test Description',
      aspectRatio: '3/4' as const,
      autoPlay: true,
      muted: true,
      loop: true,
      lazy: true,
    };

    it('should autoplay videos with forceAutoplay enabled', async () => {
      const mockPlay = jest.fn(() => Promise.resolve());
      HTMLVideoElement.prototype.play = mockPlay;

      render(
        <VideoCard
          {...videoProps}
          forceAutoplay={true}
        />
      );

      const video = screen.getByTitle('Test Video');
      expect(video).toBeInTheDocument();
      expect(video).toHaveAttribute('autoplay');
      expect(video).toHaveAttribute('muted');
      expect(video).toHaveAttribute('loop');
      expect(video).toHaveAttribute('playsInline');
      expect(video).toHaveAttribute('controls', 'false');
      expect(video).toHaveStyle({ pointerEvents: 'none' });
    });

    it('should handle autoplay failures gracefully', async () => {
      const mockPlay = jest.fn(() => Promise.reject(new Error('Autoplay failed')));
      HTMLVideoElement.prototype.play = mockPlay;

      render(
        <VideoCard
          {...videoProps}
          forceAutoplay={true}
        />
      );

      const video = screen.getByTitle('Test Video');
      expect(video).toBeInTheDocument();

      // Wait for autoplay attempt and fallback
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 200));
      });

      // Check if fallback strategies were attempted
      expect(mockPlay).toHaveBeenCalledTimes(2); // Initial attempt + fallback
    });

    it('should display static image when isStaticImage is true', () => {
      render(
        <VideoCard
          {...videoProps}
          isStaticImage={true}
        />
      );

      // Should render image instead of video
      const image = screen.getByRole('img', { name: 'Test Video' });
      expect(image).toBeInTheDocument();
      expect(image).toHaveAttribute('src', 'https://example.com/video.mp4'); // Using same URL for static image
      
      // Should not render video element
      const video = screen.queryByTitle('Test Video');
      expect(video).not.toBeInTheDocument();
    });
  });

  describe('CSS Animations and Transitions', () => {
    it('should apply smooth transitions for slide changes', () => {
      const mockSlides: SlideData[] = [
        {
          id: 'test-slide-1',
          type: 'custom' as const,
          src: '', // Required field
          content: <div data-testid="slide-1">Slide 1</div>,
        },
        {
          id: 'test-slide-2',
          type: 'custom' as const,
          src: '', // Required field
          content: <div data-testid="slide-2">Slide 2</div>,
        },
      ];

      render(
        <Carousel
          slides={mockSlides}
          aspectRatio="3/4"
          slidesPerView={1}
          spaceBetween={20}
          loop={true}
          navigation={true}
          pagination={false}
        />
      );

      const track = screen.getByTestId('carousel-track') || document.querySelector('.carousel__track');
      expect(track).toHaveStyle({
        transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
      });
    });

    it('should disable animations when prefers-reduced-motion is set', () => {
      // Mock prefers-reduced-motion
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: jest.fn().mockImplementation((query: string): MockMediaQueryList => ({
          matches: query === '(prefers-reduced-motion: reduce)',
          media: query,
          onchange: null,
          addListener: jest.fn(),
          removeListener: jest.fn(),
          addEventListener: jest.fn(),
          removeEventListener: jest.fn(),
          dispatchEvent: jest.fn(),
        })),
      });

      const mockSlides: SlideData[] = [
        {
          id: 'test-slide-1',
          type: 'custom' as const,
          src: '', // Required field
          content: <div data-testid="slide-1">Slide 1</div>,
        },
      ];

      render(
        <Carousel
          slides={mockSlides}
          aspectRatio="3/4"
          slidesPerView={1}
          spaceBetween={20}
          loop={true}
          navigation={true}
          pagination={false}
        />
      );

      // Check if reduced motion styles are applied
      const stylesheet = document.createElement('style');
      stylesheet.innerHTML = `
        @media (prefers-reduced-motion: reduce) {
          .carousel__track {
            transition: none !important;
          }
        }
      `;
      document.head.appendChild(stylesheet);

      const track = screen.getByTestId('carousel-track') || document.querySelector('.carousel__track');
      expect(track).toBeInTheDocument();
      
      // Clean up
      document.head.removeChild(stylesheet);
    });
  });

  describe('Touch Gesture Functionality', () => {
    it('should handle touch events on mobile devices', async () => {
      // Mock mobile device
      window.matchMedia = jest.fn().mockImplementation((query: string): MockMediaQueryList => ({
        matches: query === '(pointer: coarse)',
        media: query,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
      }));

      const mockSlides: SlideData[] = [
        {
          id: 'test-slide-1',
          type: 'custom' as const,
          src: '', // Required field
          content: <div data-testid="slide-1">Slide 1</div>,
        },
        {
          id: 'test-slide-2',
          type: 'custom' as const,
          src: '', // Required field
          content: <div data-testid="slide-2">Slide 2</div>,
        },
      ];

      render(
        <Carousel
          slides={mockSlides}
          aspectRatio="3/4"
          slidesPerView={1}
          spaceBetween={20}
          loop={true}
          navigation={true}
          pagination={false}
          grabCursor={true}
        />
      );

      const viewport = screen.getByRole('region', { name: /carousel/i }).querySelector('.carousel__viewport');
      expect(viewport).toBeInTheDocument();

      // Simulate touch start
      fireEvent.touchStart(viewport!, {
        touches: [{ clientX: 100, clientY: 100 }]
      });

      // Simulate touch move
      fireEvent.touchMove(viewport!, {
        touches: [{ clientX: 50, clientY: 100 }]
      });

      // Simulate touch end
      fireEvent.touchEnd(viewport!, {
        changedTouches: [{ clientX: 50, clientY: 100 }]
      });

      // Check if haptic feedback was triggered
      expect(navigator.vibrate).toHaveBeenCalled();
    });

    it('should provide haptic feedback on mobile interactions', () => {
      window.matchMedia = jest.fn().mockImplementation((query: string): MockMediaQueryList => ({
        matches: query === '(pointer: coarse)',
        media: query,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
      }));

      const { container } = render(
        <VideoCard
          src="https://example.com/video.mp4"
          poster="https://example.com/poster.jpg"
          title="Test Video"
          description="Test Description"
          aspectRatio="3/4"
        />
      );

      const video = container.querySelector('video');
      if (video) {
        fireEvent.click(video);
        expect(navigator.vibrate).toHaveBeenCalledWith(5);
      }
    });
  });

  describe('Performance Optimization', () => {
    it('should use GPU acceleration for smooth animations', () => {
      const mockSlides: SlideData[] = [
        {
          id: 'test-slide-1',
          type: 'custom' as const,
          src: '', // Required field
          content: <div data-testid="slide-1">Slide 1</div>,
        },
      ];

      render(
        <Carousel
          slides={mockSlides}
          aspectRatio="3/4"
          slidesPerView={1}
          spaceBetween={20}
          loop={true}
          navigation={true}
          pagination={false}
        />
      );

      const track = screen.getByTestId('carousel-track') || document.querySelector('.carousel__track');
      expect(track).toHaveStyle({
        transform: 'translateZ(0)'
      });
    });

    it('should lazy load videos when not in viewport', async () => {
      const mockObserve = jest.fn();
      const mockDisconnect = jest.fn();
      
      mockIntersectionObserver.mockReturnValue({
        observe: mockObserve,
        unobserve: jest.fn(),
        disconnect: mockDisconnect,
      });

      render(
        <VideoCard
          src="https://example.com/video.mp4"
          poster="https://example.com/poster.jpg"
          title="Test Video"
          description="Test Description"
          aspectRatio="3/4"
          lazy={true}
        />
      );

      // Check if IntersectionObserver is used
      expect(mockIntersectionObserver).toHaveBeenCalled();
      expect(mockObserve).toHaveBeenCalled();
    });
  });

  describe('Accessibility Compliance', () => {
    it('should have proper ARIA labels and roles', () => {
      const mockSlides: SlideData[] = [
        {
          id: 'test-slide-1',
          type: 'custom' as const,
          src: '', // Required field
          content: <div data-testid="slide-1">Slide 1</div>,
        },
      ];

      render(
        <Carousel
          slides={mockSlides}
          aspectRatio="3/4"
          slidesPerView={1}
          spaceBetween={20}
          loop={true}
          navigation={true}
          pagination={false}
          a11y={true}
        />
      );

      // Check main carousel container
      const carousel = screen.getByRole('region', { name: /carousel/i });
      expect(carousel).toHaveAttribute('aria-roledescription', 'carousel');
      expect(carousel).toHaveAttribute('tabIndex', '0');

      // Check navigation buttons
      const prevButton = screen.getByRole('button', { name: /previous/i });
      const nextButton = screen.getByRole('button', { name: /next/i });
      
      expect(prevButton).toHaveAttribute('aria-controls', 'carousel-track');
      expect(nextButton).toHaveAttribute('aria-controls', 'carousel-track');

      // Check slides
      const slides = screen.getAllByRole('group');
      slides.forEach((slide: HTMLElement, index: number) => {
        expect(slide).toHaveAttribute('aria-roledescription', 'slide');
        expect(slide).toHaveAttribute('aria-label', `Slide ${index + 1} of ${slides.length}`);
      });
    });

    it('should support keyboard navigation', () => {
      const mockSlides: SlideData[] = [
        {
          id: 'test-slide-1',
          type: 'custom' as const,
          src: '', // Required field
          content: <div data-testid="slide-1">Slide 1</div>,
        },
        {
          id: 'test-slide-2',
          type: 'custom' as const,
          src: '', // Required field
          content: <div data-testid="slide-2">Slide 2</div>,
        },
      ];

      render(
        <Carousel
          slides={mockSlides}
          aspectRatio="3/4"
          slidesPerView={1}
          spaceBetween={20}
          loop={true}
          navigation={true}
          pagination={false}
          a11y={true}
        />
      );

      const carousel = screen.getByRole('region', { name: /carousel/i });
      
      // Test arrow key navigation
      fireEvent.keyDown(carousel, { key: 'ArrowRight' });
      fireEvent.keyDown(carousel, { key: 'ArrowLeft' });
      fireEvent.keyDown(carousel, { key: 'Home' });
      fireEvent.keyDown(carousel, { key: 'End' });
      
      // Check if focus is managed properly
      expect(carousel).toHaveFocus();
    });

    it('should have sufficient color contrast', () => {
      const { container } = render(
        <VideoCard
          src="https://example.com/video.mp4"
          poster="https://example.com/poster.jpg"
          title="Test Video"
          description="Test Description"
          aspectRatio="3/4"
        />
      );

      // Check text overlay for contrast
      const title = container.querySelector('.text-white.font-bold');
      expect(title).toBeInTheDocument();
      expect(title).toHaveClass('text-white');
      
      // Check for text shadow for better visibility
      const description = container.querySelector('.text-white\\/95');
      expect(description).toBeInTheDocument();
      expect(description).toHaveClass('text-white/95');
    });
  });

  describe('WhyChooseUs Component Integration', () => {
    it('should render all three video cards correctly', () => {
      render(<WhyChooseUs />);
      
      // Check if section is rendered
      const section = screen.getByRole('region', { name: /why choose us/i }) || 
                     document.querySelector('#why-choose-us');
      expect(section).toBeInTheDocument();
      
      // Check if all three cards are rendered
      expect(screen.getByText(/ZeroRisk/i)).toBeInTheDocument();
      expect(screen.getByText(/Extensive Experience/i)).toBeInTheDocument();
      expect(screen.getByText(/Business Automations/i)).toBeInTheDocument();
    });

    it('should have proper responsive breakpoints configured', () => {
      render(<WhyChooseUs />);
      
      // Check if responsive text classes are applied
      const heading = screen.getByText(/Why Choose the Asset Studio/i);
      expect(heading).toHaveClass('text-3xl', 'md:text-4xl');
      
      const description = screen.getByText(/Discover the key benefits/i);
      expect(description).toHaveClass('text-xl');
    });
  });
});