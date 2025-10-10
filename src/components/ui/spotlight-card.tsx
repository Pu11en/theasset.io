'use client';

import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { SpotlightCardProps } from '@/types';

const SpotlightCard: React.FC<SpotlightCardProps> = ({
  children,
  className = '',
  glowColor = 'blue',
  size = 'md',
  customSize
}) => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    setMousePosition({ x, y });
  };

  const handleMouseEnter = () => setIsHovering(true);
  const handleMouseLeave = () => setIsHovering(false);

  const getSizeClasses = () => {
    if (customSize) {
      return {
        width: customSize.width || 'auto',
        height: customSize.height || 'auto'
      };
    }
    
    switch (size) {
      case 'sm':
        return { width: 'w-64', height: 'h-40' };
      case 'md':
        return { width: 'w-80', height: 'h-56' };
      case 'lg':
        return { width: 'w-96', height: 'h-72' };
      default:
        return { width: 'w-80', height: 'h-56' };
    }
  };

  const sizeClasses = getSizeClasses();

  return (
    <motion.div
      ref={cardRef}
      className={`
        relative overflow-hidden rounded-xl bg-white/95 backdrop-blur-sm
        border border-gray-200 shadow-xl transition-all duration-300
        ${sizeClasses.width} ${sizeClasses.height} ${className}
      `}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      whileHover={{
        y: -5,
        transition: { duration: 0.3 }
      }}
    >
      {/* Glow effect overlay */}
      <div
        className={`
          absolute pointer-events-none opacity-0 transition-opacity duration-300
          ${isHovering ? 'opacity-100' : ''}
        `}
        style={{
          background: `radial-gradient(
            circle 150px at ${mousePosition.x}px ${mousePosition.y}px,
            rgba(59, 130, 246, 0.15) 0%,
            transparent 50%
          )`,
          width: '100%',
          height: '100%',
          top: 0,
          left: 0
        }}
      />
      
      {/* Colored glow effect */}
      <div
        className={`
          absolute pointer-events-none opacity-0 transition-opacity duration-300
          ${isHovering ? 'opacity-100' : ''}
        `}
        style={{
          background: `radial-gradient(
            circle 100px at ${mousePosition.x}px ${mousePosition.y}px,
            ${glowColor === 'blue' ? 'rgba(59, 130, 246, 0.4)' :
              glowColor === 'purple' ? 'rgba(147, 51, 234, 0.4)' :
              glowColor === 'green' ? 'rgba(34, 197, 94, 0.4)' :
              glowColor === 'red' ? 'rgba(239, 68, 68, 0.4)' :
              glowColor === 'orange' ? 'rgba(249, 115, 22, 0.4)' :
              'rgba(59, 130, 246, 0.4)'} 0%,
            transparent 70%
          )`,
          width: '100%',
          height: '100%',
          top: 0,
          left: 0,
          filter: 'blur(20px)'
        }}
      />
      
      {/* Content */}
      <div className="relative z-10 h-full flex flex-col justify-center items-center p-6">
        {children}
      </div>
    </motion.div>
  );
};

export default SpotlightCard;