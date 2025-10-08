'use client';

import React from 'react';
import Accordion from '@/components/ui/Accordion';
import { motion } from 'framer-motion';

const FAQ: React.FC = () => {
  const faqItems = [
    {
      title: "What makes The Asset Studio different from other agencies?",
      content: "We offer a unique 90-day performance guarantee - if you don't see results, we work for free until you do. Our data-driven approach focuses on measurable outcomes rather than vanity metrics, and we specialize in doubling sales within 90 days for our clients."
    },
    {
      title: "How quickly can I expect to see results?",
      content: "While results vary by industry and starting point, most of our clients see significant improvements within the first 30 days. Our goal is to double your sales within 90 days, and we provide regular performance reports to track progress."
    },
    {
      title: "What industries do you work with?",
      content: "We have experience across multiple industries including e-commerce, SaaS, professional services, healthcare, and local businesses. Our strategies are customized to your specific industry and target audience."
    },
    {
      title: "What's included in the 90-day performance guarantee?",
      content: "If we don't deliver the agreed-upon results within 90 days, we continue working for free until we achieve those results. This includes all campaign management, optimization, and strategy adjustments at no additional cost."
    },
    {
      title: "How much do I need to spend on ad budget?",
      content: "Ad budgets vary based on your industry and goals. We work with businesses of all sizes, from startups to enterprises. During our free consultation, we'll recommend an appropriate budget based on your specific needs and growth targets."
    },
    {
      title: "Can I cancel my plan at any time?",
      content: "Yes, all our plans are month-to-month with no long-term contracts. While we recommend working with us for at least 90 days to see optimal results, you can cancel anytime with no penalties."
    }
  ];

  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Got questions? We&apos;ve got answers. If you don&apos;t see your question here, feel free to reach out.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Accordion items={faqItems} />
        </motion.div>

        <motion.div
          className="mt-16 text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <div className="bg-blue-50 rounded-xl p-8 border border-blue-200">
            <h3 className="text-2xl font-bold text-blue-600 mb-4">
              Still have questions?
            </h3>
            <p className="text-gray-700 mb-6">
              Schedule a free consultation with our marketing experts to discuss your specific needs and goals.
            </p>
            <div className="inline-flex items-center bg-blue-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors duration-300 cursor-pointer">
              Schedule Your Free Call
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default FAQ;