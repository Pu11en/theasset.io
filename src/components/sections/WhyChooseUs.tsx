'use client';

import React from 'react';
import Carousel from '@/components/ui/carousel';
import VideoCard from '@/components/ui/VideoCard';
import { FlickeringGrid } from '@/components/ui/flickering-grid';
import { motion } from 'framer-motion';

const WhyChooseUs: React.FC = () => {
  // Only 3 video cards as requested with responsive sources
  const videoData = [
    {
      id: "zero-risk",
      title: "Zero Risk",
      description: "You can't lose money. Our offer makes working with us risk free.",
      src: "https://res.cloudinary.com/dmdjagtkx/video/upload/v1760415676/insta_post_2_1_xdaptq.mp4",
      poster: "https://res.cloudinary.com/dmdjagtkx/image/upload/v1760415676/insta_post_2_1_poster_xdaptq.jpg",
      caption: "Zero Risk Guarantee",
      sources: [
        {
          src: "https://res.cloudinary.com/dmdjagtkx/video/upload/v1760415676/insta_post_2_1_xdaptq.mp4",
          type: "video/mp4"
        },
        {
          src: "https://res.cloudinary.com/dmdjagtkx/video/upload/c_scale,w_480/v1760415676/insta_post_2_1_xdaptq.mp4",
          type: "video/mp4",
          media: "(max-width: 640px)"
        },
        {
          src: "https://res.cloudinary.com/dmdjagtkx/video/upload/c_scale,w_768/v1760415676/insta_post_2_1_xdaptq.mp4",
          type: "video/mp4",
          media: "(max-width: 1024px)"
        }
      ],
      fallbackImage: "https://res.cloudinary.com/dmdjagtkx/image/upload/v1760415676/insta_post_2_1_poster_xdaptq.jpg"
    },
    {
      id: "expert-team",
      title: "Expert Team",
      description: "Our specialists bring years of experience to deliver exceptional results.",
      src: "https://res.cloudinary.com/dmdjagtkx/video/upload/v1760470477/carosal_6_yzdvbj.mp4",
      poster: "https://res.cloudinary.com/dmdjagtkx/image/upload/v1760470477/carosal_6_poster_yzdvbj.jpg",
      caption: "Expert Team",
      sources: [
        {
          src: "https://res.cloudinary.com/dmdjagtkx/video/upload/v1760470477/carosal_6_yzdvbj.mp4",
          type: "video/mp4"
        },
        {
          src: "https://res.cloudinary.com/dmdjagtkx/video/upload/c_scale,w_480/v1760470477/carosal_6_yzdvbj.mp4",
          type: "video/mp4",
          media: "(max-width: 640px)"
        },
        {
          src: "https://res.cloudinary.com/dmdjagtkx/video/upload/c_scale,w_768/v1760470477/carosal_6_yzdvbj.mp4",
          type: "video/mp4",
          media: "(max-width: 1024px)"
        }
      ],
      fallbackImage: "https://res.cloudinary.com/dmdjagtkx/image/upload/v1760470477/carosal_6_poster_yzdvbj.jpg"
    },
    {
      id: "proven-process",
      title: "Proven Process",
      description: "We've refined our approach to ensure consistent, high-quality outcomes.",
      src: "https://res.cloudinary.com/dmdjagtkx/video/upload/v1760415676/proven_process_video.mp4",
      poster: "https://res.cloudinary.com/dmdjagtkx/image/upload/v1760415676/proven_process_poster.jpg",
      caption: "Proven Process",
      sources: [
        {
          src: "https://res.cloudinary.com/dmdjagtkx/video/upload/v1760415676/proven_process_video.mp4",
          type: "video/mp4"
        },
        {
          src: "https://res.cloudinary.com/dmdjagtkx/video/upload/c_scale,w_480/v1760415676/proven_process_video.mp4",
          type: "video/mp4",
          media: "(max-width: 640px)"
        },
        {
          src: "https://res.cloudinary.com/dmdjagtkx/video/upload/c_scale,w_768/v1760415676/proven_process_video.mp4",
          type: "video/mp4",
          media: "(max-width: 1024px)"
        }
      ],
      fallbackImage: "https://res.cloudinary.com/dmdjagtkx/image/upload/v1760415676/proven_process_poster.jpg"
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
          <div className="w-full max-w-6xl">
            <Carousel
              slides={videoData.map(video => ({
                ...video,
                type: 'custom' as const,
                content: (
                  <VideoCard
                    src={video.src}
                    poster={video.poster}
                    title={video.title}
                    description={video.description}
                    caption={video.caption}
                    aspectRatio="3/4"
                    autoPlay={true}
                    muted={true}
                    loop={true}
                    lazy={true}
                    sources={video.sources}
                    fallbackImage={video.fallbackImage}
                  />
                )
              }))}
              aspectRatio="3/4"
              slidesPerView="auto"
              spaceBetween={20}
              loop={true}
              navigation={true}
              pagination={true}
            />
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default WhyChooseUs;