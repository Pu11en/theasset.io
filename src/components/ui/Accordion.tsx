'use client';

import React, { useState } from 'react';
import { AccordionItemProps } from '@/types';
import { ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const AccordionItem: React.FC<AccordionItemProps> = ({
  title,
  content,
  isOpen = false,
  onClick,
}) => {
  return (
    <div className="border-b border-gray-200 last:border-b-0">
      <button
        className="w-full py-4 px-6 text-left flex justify-between items-center hover:bg-gray-50 transition-colors duration-200"
        onClick={onClick}
      >
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.3 }}
        >
          <ChevronDown className="h-5 w-5 text-gray-500" />
        </motion.div>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="px-6 pb-4 text-gray-600">
              {content}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

interface AccordionProps {
  items: {
    title: string;
    content: string;
  }[];
  className?: string;
}

const Accordion: React.FC<AccordionProps> = ({ items, className = '' }) => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const handleToggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className={`bg-white rounded-lg shadow-md ${className}`}>
      {items.map((item, index) => (
        <AccordionItem
          key={index}
          title={item.title}
          content={item.content}
          isOpen={openIndex === index}
          onClick={() => handleToggle(index)}
        />
      ))}
    </div>
  );
};

export default Accordion;