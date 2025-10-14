import React from 'react';
import VideoCard from '@/components/ui/VideoCard';

// Test component to verify text emphasis changes
const TestCarouselTextEmphasis: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <h1 className="text-2xl font-bold mb-6">Carousel Text Emphasis Test</h1>
      
      <div className="max-w-md mx-auto">
        <VideoCard
          src="https://res.cloudinary.com/dmdjagtkx/video/upload/v1760415676/insta_post_2_1_xdaptq.mp4"
          poster="https://res.cloudinary.com/dmdjagtkx/image/upload/v1760415676/insta_post_2_1_poster_xdaptq.jpg"
          title="Zero Risk"
          description="You can't lose money. Our offer makes working with us risk free."
          caption="Zero Risk Guarantee"
          aspectRatio="3/4"
          autoPlay={true}
          muted={true}
          loop={true}
          lazy={true}
        />
      </div>
      
      <div className="mt-8 p-4 bg-white rounded-lg shadow">
        <h2 className="text-lg font-semibold mb-2">Test Checklist:</h2>
        <ul className="list-disc pl-5 space-y-1">
          <li>Text is positioned at the top of the card</li>
          <li>Heading is large and prominent</li>
          <li>Description text is clearly visible</li>
          <li>Text has proper shadow for contrast</li>
          <li>Video background is dimmed to emphasize text</li>
          <li>Text scales appropriately on different screen sizes</li>
        </ul>
      </div>
    </div>
  );
};

export default TestCarouselTextEmphasis;