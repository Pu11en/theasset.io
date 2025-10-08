'use client';

import React from 'react';
import { Target, Zap, BarChart3, Lightbulb } from 'lucide-react';
import Card from '@/components/ui/Card';
import { motion } from 'framer-motion';

const Solutions: React.FC = () => {
  const solutions = [
    {
      icon: <Target className="h-12 w-12 text-blue-600" />,
      title: "Targeted Campaigns",
      description: "Precision marketing that reaches your ideal customers where they spend their time."
    },
    {
      icon: <Zap className="h-12 w-12 text-blue-600" />,
      title: "Rapid Implementation",
      description: "Get your campaigns up and running in days, not weeks, with our streamlined process."
    },
    {
      icon: <BarChart3 className="h-12 w-12 text-blue-600" />,
      title: "Performance Analytics",
      description: "Real-time insights and data-driven optimizations to maximize your ROI."
    },
    {
      icon: <Lightbulb className="h-12 w-12 text-blue-600" />,
      title: "Creative Strategy",
      description: "Innovative approaches that cut through the noise and capture attention."
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
    <section id="solutions" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
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
              <Card className="h-full p-8 text-center hover:shadow-2xl">
                <div className="flex justify-center mb-6">
                  {solution.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  {solution.title}
                </h3>
                <p className="text-gray-600">
                  {solution.description}
                </p>
              </Card>
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
          <div className="inline-flex items-center justify-center p-6 bg-blue-50 rounded-lg">
            <div className="text-center">
              <h4 className="text-2xl font-bold text-blue-600 mb-2">
                90-Day Performance Guarantee
              </h4>
              <p className="text-gray-700">
                If you don't see results in 90 days, we work for free until you do.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Solutions;