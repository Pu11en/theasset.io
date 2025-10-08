'use client';

import React from 'react';
import { ArrowRight, Calendar } from 'lucide-react';
import Button from '@/components/ui/Button';
import { motion } from 'framer-motion';

const CTA: React.FC = () => {
  return (
    <section className="py-20 bg-green-600">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Double Your Sales in 90 Days?
          </h2>
          
          <p className="text-xl text-green-100 mb-8 max-w-2xl mx-auto">
            Join hundreds of businesses that have transformed their growth with The Asset Studio.
            Book your free consultation today and start your journey to remarkable results.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
            <Button 
              href="#contact" 
              size="lg" 
              className="bg-white text-green-600 hover:bg-gray-100 shadow-lg"
            >
              <Calendar className="mr-2 h-5 w-5" />
              Book Your Free Call
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-8 justify-center items-center text-white">
            <div className="flex items-center">
              <div className="bg-green-500 rounded-full p-2 mr-3">
                <svg className="h-6 w-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <span className="font-medium">No commitment required</span>
            </div>
            
            <div className="flex items-center">
              <div className="bg-green-500 rounded-full p-2 mr-3">
                <svg className="h-6 w-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <span className="font-medium">Free marketing audit</span>
            </div>
            
            <div className="flex items-center">
              <div className="bg-green-500 rounded-full p-2 mr-3">
                <svg className="h-6 w-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <span className="font-medium">Results in 90 days or free</span>
            </div>
          </div>
        </motion.div>
        
        <motion.div
          className="mt-12 bg-green-700 rounded-xl p-6 max-w-2xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <p className="text-green-100 italic">
            &quot;The Asset Studio delivered results beyond our expectations.
            We saw a 180% increase in sales in just 75 days. The best marketing investment we&apos;ve ever made!&quot;
          </p>
          <p className="text-white font-semibold mt-4">
            — Sarah Johnson, CEO of TechStart Inc.
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default CTA;