'use client';

import React from 'react';
import { ButtonProps } from '@/types';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  href,
  onClick,
  className = '',
  loading = false,
  disabled = false,
}) => {
  const baseClasses = 'inline-flex items-center justify-center font-semibold rounded-lg transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variantClasses = {
    primary: 'bg-electric-blue text-white hover:bg-blue-700 focus:ring-electric-blue shadow-medium hover:shadow-large',
    secondary: 'bg-accent-yellow text-gray-900 hover:bg-yellow-500 focus:ring-accent-yellow shadow-medium hover:shadow-large',
    outline: 'border-2 border-electric-blue text-electric-blue hover:bg-electric-blue hover:text-white focus:ring-electric-blue',
    glass: 'bg-glass-bg border border-glass-border text-white hover:bg-white/20 focus:ring-white backdrop-blur-md',
    gradient: 'bg-gradient-primary text-white hover:opacity-90 focus:ring-electric-blue shadow-medium hover:shadow-large',
    cta: 'bg-warm-orange text-black hover:bg-orange-600 focus:ring-warm-orange shadow-medium hover:shadow-lg [&>*]:text-black',
  };
  
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
    xl: 'px-8 py-4 text-xl',
  };
  
  const classes = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`;
  
  const MotionComponent = motion.button;
  const MotionLink = motion.a;
  
  const content = loading ? (
    <>
      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      {children}
    </>
  ) : (
    children
  );
  
  const animationProps = {
    whileHover: disabled ? {} : {},
    whileTap: disabled ? {} : {},
    transition: { duration: 0 },
  };
  
  if (href) {
    return (
      <MotionLink
        href={href}
        className={`${classes} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        {...animationProps}
      >
        {content}
      </MotionLink>
    );
  }
  
  return (
    <MotionComponent
      className={classes}
      onClick={onClick}
      disabled={disabled || loading}
      {...animationProps}
    >
      {content}
    </MotionComponent>
  );
};

export default Button;