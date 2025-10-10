import React from 'react';
import { CardProps } from '@/types';
import Card from './Card';

const GlassCard: React.FC<Omit<CardProps, 'glass'>> = (props) => {
  return <Card {...props} glass={true} />;
};

export default GlassCard;