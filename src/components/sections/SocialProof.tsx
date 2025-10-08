'use client';

import React from 'react';
import { Star, TrendingUp, Users, Award } from 'lucide-react';
import { motion } from 'framer-motion';

const SocialProof: React.FC = () => {
  const stats = [
    {
      icon: <TrendingUp className="h-8 w-8 text-blue-600" />,
      value: "237%",
      label: "Average ROI Increase"
    },
    {
      icon: <Users className="h-8 w-8 text-blue-600" />,
      value: "500+",
      label: "Happy Clients"
    },
    {
      icon: <Award className="h-8 w-8 text-blue-600" />,
      value: "50+",
      label: "Industry Awards"
    },
    {
      icon: <Star className="h-8 w-8 text-blue-600" />,
      value: "4.9/5",
      label: "Customer Rating"
    }
  ];

  const clientLogos = [
    { name: "Client 1", width: "w-24", height: "h-12" },
    { name: "Client 2", width: "w-32", height: "h-10" },
    { name: "Client 3", width: "w-28", height: "h-12" },
    { name: "Client 4", width: "w-24", height: "h-12" },
    { name: "Client 5", width: "w-32", height: "h-10" },
    { name: "Client 6", width: "w-28", height: "h-12" }
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
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Stats Section */}
        <motion.div
          className="mb-16"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={containerVariants}
        >
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Proven Results That Speak for Themselves
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              We&apos;ve helped hundreds of businesses transform their marketing and achieve remarkable growth
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                className="text-center"
                variants={itemVariants}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <div className="flex justify-center mb-4">
                  {stat.icon}
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-2">
                  {stat.value}
                </div>
                <div className="text-gray-600">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Client Logos Section */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={containerVariants}
        >
          <div className="text-center mb-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Trusted by Industry Leaders
            </h3>
            <p className="text-gray-600">
              Join the hundreds of companies that trust The Asset Studio
            </p>
          </div>

          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-12">
            {clientLogos.map((client, index) => (
              <motion.div
                key={index}
                className={`${client.width} ${client.height} bg-gray-300 rounded-lg flex items-center justify-center opacity-60 hover:opacity-100 transition-opacity duration-300`}
                variants={itemVariants}
                transition={{ duration: 0.5, delay: index * 0.05 }}
              >
                <span className="text-gray-500 text-sm font-medium">
                  {client.name}
                </span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default SocialProof;