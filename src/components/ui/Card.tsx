import React from 'react';
import { CardProps } from '@/types';
import { motion } from 'framer-motion';

const Card: React.FC<CardProps> = ({
  children,
  className = '',
  hover = true,
  glass = false
}) => {
  const baseClasses = 'rounded-xl transition-all duration-300';
  
  const variantClasses = glass
    ? 'bg-glass-bg border border-glass-border backdrop-blur-md shadow-glass text-white'
    : 'bg-white shadow-md text-gray-900';
  
  const hoverClasses = hover
    ? glass
      ? 'hover:bg-white/20 hover:shadow-glass-hover hover:border-white/30'
      : 'hover:shadow-xl'
    : '';
  
  const classes = `${baseClasses} ${variantClasses} ${hoverClasses} ${className}`;
  
  const animationProps = hover ? {
    whileHover: { y: -5 },
    transition: { duration: 0.3 },
  } : {};
  
  return (
    <motion.div
      className={classes}
      {...animationProps}
    >
      {children}
    </motion.div>
  );
};

export default Card;