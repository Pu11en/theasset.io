'use client';

import React from 'react';
import { Carousel } from '@/components/ui/carousel';
import { motion } from 'framer-motion';

const WhyChooseUs: React.FC = () => {
  const slideData = [
    {
      title: "Zero Risk",
      button: "Learn More",
      description: "You can't lose money—our offer makes working with us risk-free.",
      src: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?q=80&w=3540&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    },
    {
      title: "Expert Team",
      button: "Meet Our Team",
      description: "Our specialists bring years of experience to deliver exceptional results.",
      src: "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?q=80&w=3540&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    },
    {
      title: "Proven Process",
      button: "See How It Works",
      description: "We've refined our approach to ensure consistent, high-quality outcomes.",
      src: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=3540&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    },
    {
      title: "Transparent Pricing",
      button: "View Pricing",
      description: "No hidden fees or surprises—just clear, straightforward pricing.",
      src: "https://images.unsplash.com/photo-1554224154-260325c05f19?q=80&w=3540&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    },
    {
      title: "Dedicated Support",
      button: "Contact Us",
      description: "We're with you every step of the way, ensuring your success.",
      src: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=3540&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    },
  ];

  return (
    <section id="why-choose-us" className="relative min-h-screen overflow-hidden">
      {/* Overlay for text readability */}
      <div className="absolute inset-0 bg-white/30 backdrop-blur-sm" />
      
      {/* Content Container */}
      <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 w-full">
        <motion.div
          className="text-center mb-24 relative z-30"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-2xl md:text-3xl font-bold text-black mb-4">
            Why Choose the Asset Studio?
          </h2>
          <p className="text-xl text-black max-w-3xl mx-auto">
            Discover the key benefits that set us apart and make us the perfect partner for your business growth.
          </p>
        </motion.div>

        <motion.div
          className="relative z-10 flex justify-center items-center mt-12"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <div className="w-full max-w-5xl">
            <Carousel slides={slideData} />
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default WhyChooseUs;