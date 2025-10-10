'use client';

import React from 'react';
import { Target, Zap, BarChart3, Users, TrendingUp, Clock, CheckCircle, ArrowRight } from 'lucide-react';
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
      title: "Rapid Implementation",
      description: "Get your campaigns up and running in days, not weeks, with our streamlined process.",
      features: [
        "Quick-launch campaign templates",
        "Automated workflow optimization",
        "24-hour initial setup",
        "Dedicated implementation team"
      ],
      stats: "Launch in 48 Hours",
      glowColor: 'purple' as const,
      accentIcon: <Clock className="h-5 w-5 text-purple-500" />
    },
    {
      icon: <BarChart3 className="h-14 w-14 text-green-500" />,
      title: "Performance Analytics",
      description: "Real-time insights and data-driven optimizations to maximize your ROI.",
      features: [
        "Real-time performance dashboards",
        "Predictive analytics engine",
        "A/B testing automation",
        "Custom reporting suite"
      ],
      stats: "40% Average ROI Increase",
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

  return (
    <section id="solutions" className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-white via-gray-50 to-white">
      {/* Content Container */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 w-full">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Solutions That Drive Results
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
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
                <div className="flex flex-col h-full text-center p-2">
                  {/* Icon and Title Section */}
                  <div className="flex flex-col items-center mb-6">
                    <motion.div
                      className="flex justify-center mb-4 relative"
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      <div className="absolute inset-0 blur-xl opacity-50">
                        {solution.icon}
                      </div>
                      {solution.icon}
                    </motion.div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-3">
                      {solution.title}
                    </h3>
                    <p className="text-gray-600 text-sm leading-relaxed px-2">
                      {solution.description}
                    </p>
                  </div>

                  {/* Features List */}
                  <div className="flex-1 mb-6">
                    <ul className="space-y-2 text-left">
                      {solution.features.map((feature, featureIndex) => (
                        <motion.li
                          key={featureIndex}
                          className="flex items-start space-x-2 text-gray-700 text-sm"
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
                  <div className="border-t border-gray-200 pt-4">
                    <motion.div
                      className="flex items-center justify-center space-x-2 mb-3"
                      whileHover={{ scale: 1.05 }}
                    >
                      {solution.accentIcon}
                      <span className="text-lg font-semibold text-gray-900">
                        {solution.stats}
                      </span>
                    </motion.div>
                    <motion.button
                      className="flex items-center justify-center space-x-2 text-sm text-gray-500 hover:text-gray-900 transition-colors duration-300 group"
                      whileHover={{ x: 5 }}
                    >
                      <span>Learn more</span>
                      <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform duration-300" />
                    </motion.button>
                  </div>
                </div>
              </SpotlightCard>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          className="mt-16 text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <p className="text-lg text-gray-600 mb-6">
            Ready to transform your marketing strategy?
          </p>
          <div className="inline-flex items-center justify-center p-6 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-lg shadow-lg">
            <div className="text-center">
              <h4 className="text-2xl font-bold text-blue-600 mb-2">
                90-Day Performance Guarantee
              </h4>
              <p className="text-gray-700">
                If you don&apos;t see results in 90 days, we work for free until you do.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Solutions;