'use client';

import React from 'react';
import { CheckCircle, TrendingUp, Clock, Shield, Users, Target, Zap, BarChart3 } from 'lucide-react';
import { motion } from 'framer-motion';

const Benefits: React.FC = () => {
  const benefits = [
    {
      icon: <CheckCircle className="h-8 w-8 text-white" />,
      title: "Guaranteed Results",
      description: "Double your sales in 90 days or it's a refund."
    },
    {
      icon: <Target className="h-8 w-8 text-white" />,
      title: "Targeted Campaigns",
      description: "Reach your ideal customers with precision-targeted campaigns that drive engagement and conversions."
    },
    {
      icon: <Zap className="h-8 w-8 text-white" />,
      title: "Rapid Implementation",
      description: "Custom Campaigns: Each campaign is fully customized to your brand. 90 Days of Content: A complete 90-day content plan with zero headaches — no extra work required. Plug-and-Play: We handle all creation and scheduling, so your social media is fully delegated. High Quality + High Performance: Content designed to be top quality and results-driven."
    },
    {
      icon: <BarChart3 className="h-8 w-8 text-white" />,
      title: "Performance Analysis",
      description: "Clear Reporting: Straightforward, easy-to-understand performance reports. Proven Results: On average, clients see a 60% increase in clicks almost instantly."
    },
    {
      icon: <Shield className="h-8 w-8 text-white" />,
      title: "Zero Risk Guarantee",
      description: "Hiring me comes with zero risk. If I don't make you money, you get a full refund. I only go after your customers' money, not yours."
    },
    {
      icon: <Clock className="h-8 w-8 text-white" />,
      title: "Plug-and-Play Content Engine",
      description: "After two weeks, you'll receive 90 days of high-quality content that posts automatically. No headaches, no wasted time managing content."
    },
    {
      icon: <Target className="h-8 w-8 text-white" />,
      title: "Performance-Based Expertise",
      description: "Every business is different. I adapt campaigns to each brand using advanced AI tools—AI animation, AI research, and more."
    },
    {
      icon: <TrendingUp className="h-8 w-8 text-white" />,
      title: "Proven ROI Potential",
      description: "My campaigns are high-profile, high-value, and high-quality. I am confident the average ROI will be 200–300% within 90 days."
    },
    {
      icon: <Target className="h-8 w-8 text-white" />,
      title: "Precision Targeting",
      description: "Reach your ideal customers with laser-focused campaigns"
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
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Why Choose The Asset Studio?
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            We deliver measurable results that transform your business growth trajectory
          </p>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={containerVariants}
        >
          {benefits.map((benefit, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              transition={{ duration: 0.5 }}
            >
              <div className="bg-yellow-400 rounded-xl p-8 h-full shadow-lg hover:shadow-2xl transition-shadow duration-300">
                <div className="flex items-center mb-4">
                  <div className="bg-blue-600 rounded-lg p-3 mr-4">
                    {benefit.icon}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">
                    {benefit.title}
                  </h3>
                </div>
                <p className="text-gray-700 font-medium">
                  {benefit.description}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          className="mt-16 bg-blue-600 rounded-2xl p-8 text-center text-white"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <h3 className="text-2xl md:text-3xl font-bold mb-4">
            Ready to Double Your Sales?
          </h3>
          <p className="text-xl mb-6 opacity-90">
            Join 500+ businesses that have transformed their growth with The Asset Studio
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <div className="bg-white text-blue-600 font-bold py-3 px-6 rounded-lg">
              90-Day Performance Guarantee
            </div>
            <div className="bg-yellow-400 text-gray-900 font-bold py-3 px-6 rounded-lg">
              No Results = No Fee
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Benefits;