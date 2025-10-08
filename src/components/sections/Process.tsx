'use client';

import React from 'react';
import { Search, Rocket, BarChart } from 'lucide-react';
import { motion } from 'framer-motion';

const Process: React.FC = () => {
  const steps = [
    {
      number: 1,
      icon: <Search className="h-12 w-12 text-blue-600" />,
      title: "Discovery & Strategy",
      description: "We analyze your business, market, and competitors to develop a customized marketing strategy that targets your ideal customers."
    },
    {
      number: 2,
      icon: <Rocket className="h-12 w-12 text-blue-600" />,
      title: "Implementation",
      description: "Our expert team launches your performance campaigns across multiple channels, optimized for maximum reach and engagement."
    },
    {
      number: 3,
      icon: <BarChart className="h-12 w-12 text-blue-600" />,
      title: "Optimization & Growth",
      description: "We continuously monitor, analyze, and refine your campaigns to ensure you're getting the best possible ROI and growth."
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            How It Works?
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Our proven 3-step process delivers consistent results for businesses of all sizes
          </p>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={containerVariants}
        >
          {steps.map((step, index) => (
            <motion.div
              key={index}
              className="relative"
              variants={itemVariants}
              transition={{ duration: 0.5 }}
            >
              {/* Connection line for desktop */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-16 left-full w-full h-0.5 bg-blue-200 -z-10"></div>
              )}
              
              <div className="bg-gray-50 rounded-xl p-8 h-full shadow-md hover:shadow-xl transition-shadow duration-300">
                <div className="flex items-center mb-6">
                  <div className="bg-blue-100 rounded-full p-4 mr-4">
                    {step.icon}
                  </div>
                  <div className="bg-blue-600 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold text-lg">
                    {step.number}
                  </div>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  {step.title}
                </h3>
                <p className="text-gray-600">
                  {step.description}
                </p>
              </div>
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
          <div className="inline-flex items-center justify-center p-6 bg-yellow-50 rounded-lg border-2 border-yellow-200">
            <div className="text-center">
              <h4 className="text-2xl font-bold text-gray-900 mb-2">
                90 Days to Results
              </h4>
              <p className="text-gray-700 max-w-md">
                From strategy to implementation to optimization, we deliver measurable growth in just 90 days.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Process;