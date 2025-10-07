import React from 'react';
import { CardProps } from '@/types';
import { motion } from 'framer-motion';

const Card: React.FC<CardProps> = ({ children, className = '' }) => {
  return (
    <motion.div
      className={`bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow duration-300 ${className}`}
      whileHover={{ y: -5 }}
      transition={{ duration: 0.3 }}
    >
      {children}
    </motion.div>
  );
};

export default Card;