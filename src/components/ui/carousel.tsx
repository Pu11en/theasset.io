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
  isZeroRiskCard?: boolean;
  enableEnhancedAspectRatios?: boolean;
}

const Slide = ({
  slide,
  index,
  current,
  handleSlideClick,
  isZeroRiskCard = false,
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

  // Determine card classes based on enhanced mode and card type
  const getCardClasses = () => {
    if (!enableEnhancedAspectRatios) {
      return "flex flex-1 flex-col items-center justify-center relative text-center text-white opacity-100 transition-all duration-300 ease-in-out w-[40vmin] h-[53.3vmin] mx-[4vmin] md:w-[35vmin] md:h-[46.7vmin] sm:w-[30vmin] sm:h-[40vmin] z-10 aspect-[3/4]";
    }
    
    const baseClasses = "carousel-card flex flex-1 flex-col items-center justify-center relative text-center text-white opacity-100 transition-all duration-300 ease-in-out z-10";
    // All cards now use the same aspect ratio, so we can apply the same class
    const typeClasses = "carousel-card-standard";
    
    return `${baseClasses} ${typeClasses}`;
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
          className="video-container rounded-[1%] overflow-hidden transition-all duration-150 ease-out"
          style={{
            transform:
              current === index
                ? "translate3d(calc(var(--x) / 30), calc(var(--y) / 30), 0)"
                : "none",
          }}
        >
          {isVideo ? (
            <video
              className="video-element opacity-100 transition-opacity duration-600 ease-in-out"
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
              className="video-element opacity-100 transition-opacity duration-600 ease-in-out"
              style={{
                opacity: current === index ? 1 : 0.5,
              }}
              alt={title}
              src={src}
              onLoad={imageLoaded}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              priority
            />
          )}
          {current === index && (
            <div className={`absolute inset-0 transition-all duration-1000 ${isVideo ? "bg-black/50" : "bg-black/30"}`} />
          )}
        </div>

        <article
          className={`relative p-[4vmin] transition-opacity duration-1000 ease-in-out z-20 ${
            current === index ? "opacity-100 visible" : "opacity-0 invisible"
          }`}
          style={{
            zIndex: current === index ? 20 : 10,
            backgroundColor: current === index ? 'rgba(0, 0, 0, 0.5)' : 'transparent',
            borderRadius: '0.25rem',
            backdropFilter: 'blur(2px)',
            textShadow: '0 2px 4px rgba(0, 0, 0, 0.8)'
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
      className={`w-10 h-10 flex items-center mx-2 justify-center bg-neutral-200 dark:bg-neutral-800 border-3 border-transparent rounded-full focus:border-[#6D64F7] focus:outline-none hover:-translate-y-0.5 active:translate-y-0.5 transition duration-200 ${
        type === "previous" ? "rotate-180" : ""
      }`}
      title={title}
      onClick={handleClick}
    >
      <IconArrowNarrowRight className="text-neutral-600 dark:text-neutral-200" />
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

  // Determine if the current slide is a Zero Risk card
  const isCurrentSlideZeroRisk = slides[current]?.title === "Zero Risk";

  // Get container classes based on enhanced mode
  const getContainerClasses = () => {
    if (!enableEnhancedAspectRatios) {
      return "relative w-[40vmin] h-[53.3vmin] md:w-[35vmin] md:h-[46.7vmin] sm:w-[30vmin] sm:h-[40vmin] mx-auto aspect-[3/4]";
    }
    
    const baseClasses = "carousel-container-enhanced relative mx-auto";
    // No longer need special handling for Zero Risk since all cards have the same aspect ratio
    const activeClasses = "";
    
    return `${baseClasses} ${activeClasses}`;
  };

  // Get list classes based on enhanced mode
  const getListClasses = () => {
    if (!enableEnhancedAspectRatios) {
      return "absolute flex mx-[-4vmin] transition-transform duration-1000 ease-in-out";
    }
    
    return "carousel-list-enhanced absolute flex transition-transform duration-1000 ease-in-out";
  };

  return (
    <div
      className={getContainerClasses()}
      aria-labelledby={`carousel-heading-${id}`}
    >
      <ul
        className={getListClasses()}
        style={{
          transform: `translateX(-${current * (100 / slides.length)}%)`,
        }}
      >
        {slides.map((slide, index) => (
          <Slide
            key={index}
            slide={slide}
            index={index}
            current={current}
            handleSlideClick={handleSlideClick}
            isZeroRiskCard={false} // All cards now use the same aspect ratio
            enableEnhancedAspectRatios={enableEnhancedAspectRatios}
          />
        ))}
      </ul>

      <div className="absolute flex justify-center w-full top-[calc(100%+1rem)]">
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