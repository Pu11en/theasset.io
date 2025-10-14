"use client";
import { IconArrowNarrowRight } from "@tabler/icons-react";
import { useState, useRef, useId, useEffect } from "react";
import Image from "next/image";

interface SlideData {
  title: string;
  button?: string;
  src: string;
  description?: string;
  isVideo?: boolean;
}

interface SlideProps {
  slide: SlideData;
  index: number;
  current: number;
  handleSlideClick: (index: number) => void;
  enableEnhancedAspectRatios?: boolean;
}

const Slide = ({
  slide,
  index,
  current,
  handleSlideClick,
  enableEnhancedAspectRatios = false
}: SlideProps) => {
  const slideRef = useRef<HTMLLIElement>(null);

  const xRef = useRef(0);
  const yRef = useRef(0);
  const frameRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    const animate = () => {
      if (!slideRef.current) return;

      const x = xRef.current;
      const y = yRef.current;

      slideRef.current.style.setProperty("--x", `${x}px`);
      slideRef.current.style.setProperty("--y", `${y}px`);

      frameRef.current = requestAnimationFrame(animate);
    };

    frameRef.current = requestAnimationFrame(animate);

    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, []);

  const handleMouseMove = (event: React.MouseEvent) => {
    const el = slideRef.current;
    if (!el) return;

    const r = el.getBoundingClientRect();
    xRef.current = event.clientX - (r.left + Math.floor(r.width / 2));
    yRef.current = event.clientY - (r.top + Math.floor(r.height / 2));
  };

  const handleMouseLeave = () => {
    xRef.current = 0;
    yRef.current = 0;
  };

  const imageLoaded = () => {
    // Image opacity is handled by the Image component
  };

  const { src, title, description, isVideo } = slide;

  // Determine card classes based on enhanced mode
  const getCardClasses = () => {
    if (!enableEnhancedAspectRatios) {
      return "flex flex-1 flex-col items-center justify-center relative text-center text-white opacity-100 transition-all duration-300 ease-in-out carousel-card-legacy mx-[4vmin] z-10";
    }
    
    // All cards use the same aspect ratio (3:4)
    return "carousel-card flex flex-1 flex-col items-center justify-center relative text-center text-white opacity-100 transition-all duration-300 ease-in-out z-10 carousel-card-standard";
  };

  return (
    <div className="[perspective:1200px] [transform-style:preserve-3d]">
      <li
        ref={slideRef}
        className={getCardClasses()}
        onClick={() => handleSlideClick(index)}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{
          transform:
            current !== index
              ? "scale(0.98) rotateX(8deg)"
              : "scale(1) rotateX(0deg)",
          transition: "transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)",
          transformOrigin: "bottom",
        }}
      >
        <div
          className="video-container rounded-[1%] overflow-hidden transition-all duration-150 ease-out w-full h-full"
          style={{
            transform:
              current === index
                ? "translate3d(calc(var(--x) / 30), calc(var(--y) / 30), 0)"
                : "none",
          }}
        >
          {isVideo ? (
            <video
              className="video-element opacity-100 transition-opacity duration-600 ease-in-out w-full h-full"
              style={{
                opacity: current === index ? 1 : 0.5,
              }}
              autoPlay
              muted
              loop
              playsInline
              src={src}
            />
          ) : (
            <Image
              className="video-element opacity-100 transition-opacity duration-600 ease-in-out w-full h-full"
              style={{
                opacity: current === index ? 1 : 0.5,
              }}
              alt={title}
              src={src}
              onLoad={imageLoaded}
              fill
              sizes="(max-width: 768px) 85vw, (max-width: 1024px) 45vw, 30vw"
              priority
            />
          )}
          {current === index && (
            <div className={`absolute inset-0 transition-all duration-1000 ${isVideo ? "bg-black/50" : "bg-black/30"}`} />
          )}
        </div>

        <article
          className={`absolute p-[4vmin] transition-opacity duration-1000 ease-in-out z-20 ${
            current === index ? "opacity-100 visible" : "opacity-0 invisible"
          }`}
          style={{
            zIndex: current === index ? 20 : 10,
            backgroundColor: current === index ? 'rgba(0, 0, 0, 0.5)' : 'transparent',
            borderRadius: '0.25rem',
            backdropFilter: 'blur(2px)',
            textShadow: '0 2px 4px rgba(0, 0, 0, 0.8)',
            bottom: 0,
            left: 0,
            right: 0
          }}
        >
          <h2 className={`text-lg md:text-2xl lg:text-4xl font-semibold relative ${isVideo ? "text-white drop-shadow-lg" : "text-white"}`}>
            {title}
          </h2>
          {description && (
            <p className={`mt-3 text-sm md:text-base max-w-xs mx-auto ${isVideo ? "text-white/95 drop-shadow-md" : "text-white/90"}`}>
              {description}
            </p>
          )}
        </article>
      </li>
    </div>
  );
};

interface CarouselControlProps {
  type: string;
  title: string;
  handleClick: () => void;
}

const CarouselControl = ({
  type,
  title,
  handleClick,
}: CarouselControlProps) => {
  return (
    <button
      className={`w-12 h-12 flex items-center pointer-events-auto justify-center bg-white/90 dark:bg-black/90 backdrop-blur-sm border border-white/20 dark:border-black/20 shadow-lg rounded-full focus:border-[#6D64F7] focus:outline-none hover:-translate-y-0.5 active:translate-y-0.5 transition duration-200 hover:shadow-[0_0_20px_rgba(109,100,247,0.3)] ${
        type === "previous" ? "rotate-180" : ""
      }`}
      title={title}
      onClick={handleClick}
    >
      <IconArrowNarrowRight className="text-gray-800 dark:text-white" />
    </button>
  );
};

interface CarouselProps {
  slides: SlideData[];
  enableEnhancedAspectRatios?: boolean;
  carouselType?: string;
}

export function Carousel({
  slides,
  enableEnhancedAspectRatios = false,
  carouselType = "standard"
}: CarouselProps): React.ReactElement {
  const [current, setCurrent] = useState(0);
  const carouselRef = useRef<HTMLDivElement>(null);
  const [cardWidth, setCardWidth] = useState(0);

  // Calculate card width based on viewport
  useEffect(() => {
    const updateCardWidth = () => {
      if (!carouselRef.current) return;
      
      const viewportWidth = window.innerWidth;
      let width;
      
      if (viewportWidth < 768) {
        width = viewportWidth * 0.85; // 85vw for mobile
      } else if (viewportWidth < 1024) {
        width = viewportWidth * 0.45; // 45vw for tablet
      } else {
        width = viewportWidth * 0.3; // 30vw for desktop
      }
      
      setCardWidth(width);
    };

    updateCardWidth();
    window.addEventListener('resize', updateCardWidth);
    return () => window.removeEventListener('resize', updateCardWidth);
  }, []);

  const handlePreviousClick = () => {
    const previous = current - 1;
    setCurrent(previous < 0 ? slides.length - 1 : previous);
  };

  const handleNextClick = () => {
    const next = current + 1;
    setCurrent(next === slides.length ? 0 : next);
  };

  const handleSlideClick = (index: number) => {
    if (current !== index) {
      setCurrent(index);
    }
  };

  const id = useId();

  // Get container classes based on enhanced mode
  const getContainerClasses = () => {
    if (!enableEnhancedAspectRatios) {
      return "relative carousel-card-legacy mx-auto";
    }
    
    return "carousel-container-enhanced relative mx-auto";
  };

  // Get list classes based on enhanced mode
  const getListClasses = () => {
    if (!enableEnhancedAspectRatios) {
      return "absolute flex mx-[-4vmin] transition-transform duration-1000 ease-in-out";
    }
    
    return "carousel-list-enhanced absolute flex transition-transform duration-1000 ease-in-out";
  };

  // Calculate transform based on actual card width
  const getTransformValue = () => {
    if (!enableEnhancedAspectRatios) {
      return `translateX(-${current * (100 / slides.length)}%)`;
    }
    
    // Use pixel-based transform for enhanced mode
    const gap = current > 0 ? 16 : 0; // 1rem gap in pixels
    return `translateX(-${current * (cardWidth + gap)}px)`;
  };

  return (
    <div
      ref={carouselRef}
      className={getContainerClasses()}
      aria-labelledby={`carousel-heading-${id}`}
    >
      <ul
        className={getListClasses()}
        style={{
          transform: getTransformValue(),
        }}
      >
        {slides.map((slide, index) => (
          <Slide
            key={index}
            slide={slide}
            index={index}
            current={current}
            handleSlideClick={handleSlideClick}
            enableEnhancedAspectRatios={enableEnhancedAspectRatios}
          />
        ))}
      </ul>

      <div className="absolute flex justify-between left-0 right-0 w-full top-[20%] pointer-events-none px-4">
        <CarouselControl
          type="previous"
          title="Go to previous slide"
          handleClick={handlePreviousClick}
        />

        <CarouselControl
          type="next"
          title="Go to next slide"
          handleClick={handleNextClick}
        />
      </div>
    </div>
  );
}