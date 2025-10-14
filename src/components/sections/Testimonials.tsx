'use client';

import React from 'react';
import { Star, Quote } from 'lucide-react';
import { motion } from 'framer-motion';

const Testimonials: React.FC = () => {
  const testimonials = [
    {
      name: "Lala's Brand",
      title: "Founder",
      company: "Boxmeal",
      content: "Drew did an excellent job creating content for our new Boxmeal product. Everything was organized, simple, and easy to understand. He went above and beyond — I honestly felt like I was underpaying for the value delivered.",
      rating: 5,
      image: null
    },
    {
      name: "Peptide Brand",
      title: "CEO",
      company: "Peptide Sciences",
      content: "The Asset Studio exceeded expectations by building our brand, website, and content from scratch. The speed and quality were exceptional — far faster than we imagined possible — without sacrificing precision or creativity.",
      rating: 5,
      image: null
    },
    {
      name: "Tech Director",
      title: "Director of Technology",
      company: "Tech Innovations",
      content: "Drew is one of the smartest individuals I've worked with. He's like a sponge for information and applies it instantly. He built a chatbot on a massive dataset that worked flawlessly. I can't wait to see what he creates next.",
      rating: 5,
      image: null
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

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-5 w-5 ${
          i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
        }`}
      />
    ));
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
            What Our Clients Say
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Don&apos;t just take our word for it - hear from businesses we&apos;ve helped grow
          </p>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={containerVariants}
        >
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              transition={{ duration: 0.5 }}
            >
              <div className="bg-gray-50 rounded-xl p-8 h-full shadow-md hover:shadow-xl transition-shadow duration-300">
                <Quote className="h-10 w-10 text-blue-600 mb-4" />
                
                <div className="flex mb-4">
                  {renderStars(testimonial.rating)}
                </div>
                
                <p className="text-gray-700 mb-6 italic">
                  &quot;{testimonial.content}&quot;
                </p>
                
                <div className="flex items-center">
                  <div className="bg-gray-300 rounded-full h-12 w-12 mr-4 flex items-center justify-center">
                    <span className="text-gray-600 font-bold text-lg">
                      {testimonial.name.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900">
                      {testimonial.name}
                    </h4>
                    <p className="text-gray-600 text-sm">
                      {testimonial.title}, {testimonial.company}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

      </div>
    </section>
  );
};

export default Testimonials;