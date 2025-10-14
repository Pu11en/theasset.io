'use client';

import React from 'react';
import { Carousel } from '@/components/ui/carousel';
import { FlickeringGrid } from '@/components/ui/flickering-grid';
import { motion } from 'framer-motion';

const WhyChooseUs: React.FC = () => {
  const slideData = [
    {
      title: "Zero Risk",
      description: "You can't lose money. Our offer makes working with us risk free.",
      src: "https://res.cloudinary.com/dmdjagtkx/video/upload/v1760415676/insta_post_2_1_xdaptq.mp4",
      isVideo: true,
    },
    {
      title: "Expert Team",
      description: "Our specialists bring years of experience to deliver exceptional results.",
      src: "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?q=80&w=3540&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    },
    {
      title: "Proven Process",
      description: "We've refined our approach to ensure consistent, high-quality outcomes.",
      src: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=3540&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    },
    {
      title: "Transparent Pricing",
      description: "No hidden fees or surprises—just clear, straightforward pricing.",
      src: "https://images.unsplash.com/photo-1554224154-260325c05f19?q=80&w=3540&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    },
    {
      title: "Dedicated Support",
      description: "We're with you every step of the way, ensuring your success.",
      src: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=3540&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    },
  ];

  return (
    <section id="why-choose-us" className="relative min-h-screen overflow-hidden bg-white">
      {/* Flickering Grid Background - positioned at the back */}
      <div className="absolute inset-0 z-0">
        <FlickeringGrid
          squareSize={4}
          gridGap={8}
          flickerChance={0.3}
          color="#60a5fa"
          maxOpacity={0.4}
          className="w-full h-full"
        />
      </div>
      
      {/* Semi-transparent overlay for better text readability */}
      <div className="absolute inset-0 bg-white/30 backdrop-blur-[2px] z-10" />
      
      {/* Content Container - positioned above everything */}
      <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16 w-full">
        <motion.div
          className="text-center mb-24"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
            Why Choose the Asset Studio?
          </h2>
          <p className="text-xl text-gray-700 max-w-3xl mx-auto">
            Discover the key benefits that set us apart and make us the perfect partner for your business growth.
          </p>
        </motion.div>

        <motion.div
          className="flex justify-center items-center mt-12"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <div className="w-full max-w-5xl">
            <Carousel
              slides={slideData}
              enableEnhancedAspectRatios={true}
              carouselType="why-choose-us"
            />
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default WhyChooseUs;