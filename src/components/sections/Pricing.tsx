'use client';

import React from 'react';
import { Check, Star } from 'lucide-react';
import Button from '@/components/ui/Button';
import { motion } from 'framer-motion';

const Pricing: React.FC = () => {
  const plans = [
    {
      name: 'Basic',
      price: '$150',
      period: '/month',
      description: 'Perfect for small businesses looking to establish their marketing foundation',
      features: [
        'Targeted Campaign Strategy',
        '2 Marketing Channels',
        'Monthly Performance Reports',
        'Email Support',
        'Basic Analytics',
        '90-Day Performance Guarantee'
      ],
      highlighted: false
    },
    {
      name: 'Pro',
      price: '$150',
      period: '/month',
      description: 'Ideal for growing businesses ready to scale their marketing efforts',
      features: [
        'Advanced Campaign Strategy',
        '5 Marketing Channels',
        'Weekly Performance Reports',
        'Priority Support',
        'Advanced Analytics & Insights',
        'A/B Testing',
        'Custom Content Creation',
        '90-Day Performance Guarantee',
        'Dedicated Account Manager'
      ],
      highlighted: true
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
    <section id="pricing" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Simple, Transparent Pricing
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Choose the plan that best fits your business needs and start growing today
          </p>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={containerVariants}
        >
          {plans.map((plan, index) => (
            <motion.div
              key={index}
              className={`relative rounded-2xl shadow-lg overflow-hidden ${
                plan.highlighted 
                  ? 'bg-blue-600 text-white border-2 border-blue-700 transform scale-105' 
                  : 'bg-white border border-gray-200'
              }`}
              variants={itemVariants}
              transition={{ duration: 0.5 }}
            >
              {plan.highlighted && (
                <div className="absolute top-0 right-0 bg-yellow-400 text-gray-900 text-sm font-bold px-3 py-1 rounded-bl-lg">
                  MOST POPULAR
                </div>
              )}
              
              <div className="p-8">
                <div className="text-center mb-8">
                  <h3 className={`text-2xl font-bold mb-2 ${plan.highlighted ? 'text-white' : 'text-gray-900'}`}>
                    {plan.name}
                  </h3>
                  <div className="flex items-baseline justify-center">
                    <span className={`text-5xl font-bold ${plan.highlighted ? 'text-white' : 'text-gray-900'}`}>
                      {plan.price}
                    </span>
                    <span className={`text-lg ml-1 ${plan.highlighted ? 'text-blue-100' : 'text-gray-500'}`}>
                      {plan.period}
                    </span>
                  </div>
                  <p className={`mt-4 ${plan.highlighted ? 'text-blue-100' : 'text-gray-600'}`}>
                    {plan.description}
                  </p>
                </div>

                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start">
                      <Check className={`h-5 w-5 mr-3 flex-shrink-0 ${
                        plan.highlighted ? 'text-yellow-400' : 'text-blue-600'
                      }`} />
                      <span className={plan.highlighted ? 'text-white' : 'text-gray-700'}>
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>

                <Button 
                  href="#contact" 
                  variant={plan.highlighted ? 'secondary' : 'primary'} 
                  className="w-full"
                >
                  Get Started
                </Button>
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
          <div className="inline-flex items-center p-2 bg-yellow-400 rounded-full">
            <Star className="h-5 w-5 text-gray-900 mr-2" />
            <span className="text-gray-900 font-medium">
              30-day money-back guarantee on all plans
            </span>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Pricing;