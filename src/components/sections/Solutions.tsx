'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Target, Zap, BarChart3, Users, TrendingUp, CheckCircle } from 'lucide-react';
import SpotlightCard from '@/components/ui/spotlight-card';
import { motion } from 'framer-motion';

const Solutions: React.FC = () => {
  const solutions = [
    {
      icon: <Target className="h-14 w-14 text-blue-500" />,
      title: "Targeted Campaigns",
      description: "Precision marketing that reaches your ideal customers where they spend their time.",
      features: [
        "Advanced audience segmentation",
        "Multi-channel campaign execution",
        "Behavioral targeting algorithms",
        "Custom content personalization"
      ],
      stats: "3.5x Higher Engagement",
      glowColor: 'blue' as const,
      accentIcon: <Users className="h-5 w-5 text-blue-500" />
    },
    {
      icon: <Zap className="h-14 w-14 text-purple-500" />,
      title: "Customized Content Solution",
      description: "Plug-and-play marketing with customized campaigns that run automatically.",
      features: [
        "Campaigns customized to each brand",
        "90-day content plan that runs automatically",
        "Plug-and-play with full delegation",
        "High-quality, performance-driven content"
      ],
      stats: "Zero Headaches Guaranteed",
      glowColor: 'purple' as const,
      accentIcon: <CheckCircle className="h-5 w-5 text-purple-500" />
    },
    {
      icon: <BarChart3 className="h-14 w-14 text-green-500" />,
      title: "Performance Analysis",
      description: "Clear reporting and proven results that drive your business forward.",
      features: [
        "Clear Reporting: Simple, easy-to-understand performance reports",
        "Proven Results: On average, clients see a 60% increase in clicks instantly"
      ],
      stats: "60% Average Click Increase",
      glowColor: 'green' as const,
      accentIcon: <TrendingUp className="h-5 w-5 text-green-500" />
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0 }
  };

  const [isClient, setIsClient] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    setIsClient(true);
    
    // Optimize video loading
    if (videoRef.current) {
      videoRef.current.setAttribute('preload', 'metadata');
      // Start video playback when user interacts with page
      const startVideo = () => {
        if (videoRef.current) {
          videoRef.current.play().catch(e => console.log('Video autoplay failed:', e));
        }
        document.removeEventListener('click', startVideo);
        document.removeEventListener('touchstart', startVideo);
      };
      
      document.addEventListener('click', startVideo);
      document.addEventListener('touchstart', startVideo);
      
      return () => {
        document.removeEventListener('click', startVideo);
        document.removeEventListener('touchstart', startVideo);
      };
    }
  }, []);

  return (
    <section id="solutions" className="relative min-h-screen flex items-center justify-center overflow-hidden" aria-label="Solutions section">
      {/* Video Background - Desktop */}
      {isClient && (
        <>
          <video
            ref={videoRef}
            className="absolute inset-0 w-full h-full object-cover hidden lg:block"
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            aria-hidden="true"
          >
            <source src="https://res.cloudinary.com/dmdjagtkx/video/upload/v1760405896/social_defipullen_A_continuation-style_digital_background_designed_f_7bbfc11b-e450-4abc-910a-6eef28babf6a_0_xzhdrv.mp4" type="video/mp4" />
            Your browser does not support the video tag.
          </video>
          
          {/* Video Background - Mobile */}
          <video
            className="absolute inset-0 w-full h-full object-cover lg:hidden"
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            aria-hidden="true"
          >
            <source src="https://res.cloudinary.com/dmdjagtkx/video/upload/v1760406410/social_defipullen_A_continuation-style_digital_background_designed_f_dc49c4c4-ced0-4a1e-a218-7245167285e8_0_xqzwmw.mp4" type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </>
      )}
      
      {/* Overlay for text readability - semi-transparent for WCAG compliance */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" aria-hidden="true" />
      
      {/* Content Container */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 w-full">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl md:text-4xl font-bold text-black mb-4">
            Solutions That Drive Results
          </h2>
          <p className="text-xl text-black max-w-3xl mx-auto">
            Our comprehensive suite of marketing services designed to accelerate your business growth
          </p>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 justify-items-center"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={containerVariants}
        >
          {solutions.map((solution, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              transition={{ duration: 0.5 }}
            >
              <SpotlightCard
                glowColor={solution.glowColor}
                size="lg"
                className="w-full max-w-sm h-full min-h-[420px] group"
              >
                <div className="flex flex-col h-full text-center p-4">
                  {/* Icon and Title Section */}
                  <div className="flex flex-col items-center mb-4">
                    <motion.div
                      className="flex justify-center mb-3 relative"
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      <div className="absolute inset-0 blur-xl opacity-50">
                        {solution.icon}
                      </div>
                      {solution.icon}
                    </motion.div>
                    <h3 className="text-2xl font-bold text-black mb-2">
                      {solution.title}
                    </h3>
                    <p className="text-black text-sm leading-relaxed px-2">
                      {solution.description}
                    </p>
                  </div>

                  {/* Features List */}
                  <div className="flex-1 mb-4">
                    <ul className="space-y-2 text-left">
                      {solution.features.map((feature, featureIndex) => (
                        <motion.li
                          key={featureIndex}
                          className="flex items-start space-x-2 text-black text-sm"
                          initial={{ opacity: 0, x: -10 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          viewport={{ once: true }}
                          transition={{ delay: featureIndex * 0.1 }}
                        >
                          <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                          <span>{feature}</span>
                        </motion.li>
                      ))}
                    </ul>
                  </div>

                  {/* Stats and CTA */}
                  <div className="border-t border-gray-200 pt-3">
                    <motion.div
                      className="flex items-center justify-center space-x-2"
                      whileHover={{ scale: 1.05 }}
                    >
                      {solution.accentIcon}
                      <span className="text-lg font-semibold text-black">
                        {solution.stats}
                      </span>
                    </motion.div>
                  </div>
                </div>
              </SpotlightCard>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default Solutions;