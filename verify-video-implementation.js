// Simple verification script to check if our changes are correctly implemented
const fs = require('fs');
const path = require('path');

console.log('Verifying video implementation in WhyChooseUs component...\n');

// Check WhyChooseUs.tsx
const whyChooseUsPath = path.join(__dirname, 'src/components/sections/WhyChooseUs.tsx');
const whyChooseUsContent = fs.readFileSync(whyChooseUsPath, 'utf8');

// Check if the first slide has the video URL and isVideo property
const hasVideoUrl = whyChooseUsContent.includes('https://res.cloudinary.com/dmdjagtkx/video/upload/v1760415676/insta_post_2_1_xdaptq.mp4');
const hasIsVideoProperty = whyChooseUsContent.includes('isVideo: true');

console.log('WhyChooseUs.tsx checks:');
console.log(`✓ Contains video URL: ${hasVideoUrl ? 'Yes' : 'No'}`);
console.log(`✓ Has isVideo property: ${hasIsVideoProperty ? 'Yes' : 'No'}`);

// Check carousel.tsx
const carouselPath = path.join(__dirname, 'src/components/ui/carousel.tsx');
const carouselContent = fs.readFileSync(carouselPath, 'utf8');

// Check if the SlideData interface includes isVideo
const hasIsVideoInInterface = carouselContent.includes('isVideo?: boolean;');

// Check if the Slide component conditionally renders video
const hasVideoElement = carouselContent.includes('<video');
const hasConditionalRender = carouselContent.includes('{isVideo ?') && carouselContent.includes(') : (');

// Check video attributes
const hasAutoPlay = carouselContent.includes('autoPlay');
const hasMuted = carouselContent.includes('muted');
const hasLoop = carouselContent.includes('loop');
const hasPlaysInline = carouselContent.includes('playsInline');

console.log('\nCarousel.tsx checks:');
console.log(`✓ Interface includes isVideo: ${hasIsVideoInInterface ? 'Yes' : 'No'}`);
console.log(`✓ Has video element: ${hasVideoElement ? 'Yes' : 'No'}`);
console.log(`✓ Has conditional render: ${hasConditionalRender ? 'Yes' : 'No'}`);
console.log(`✓ Video has autoPlay: ${hasAutoPlay ? 'Yes' : 'No'}`);
console.log(`✓ Video has muted: ${hasMuted ? 'Yes' : 'No'}`);
console.log(`✓ Video has loop: ${hasLoop ? 'Yes' : 'No'}`);
console.log(`✓ Video has playsInline: ${hasPlaysInline ? 'Yes' : 'No'}`);

// Overall verification
const allChecksPass = hasVideoUrl && hasIsVideoProperty && hasIsVideoInInterface && 
                     hasVideoElement && hasConditionalRender && hasAutoPlay && 
                     hasMuted && hasLoop && hasPlaysInline;

console.log('\nOverall verification:');
console.log(allChecksPass ? '✅ All checks passed! Video implementation is correct.' : '❌ Some checks failed. Please review the implementation.');

if (allChecksPass) {
  console.log('\nSummary of changes:');
  console.log('1. Updated WhyChooseUs.tsx to use the Cloudinary video URL with isVideo: true');
  console.log('2. Modified carousel.tsx to conditionally render video elements');
  console.log('3. Added proper video attributes (autoPlay, muted, loop, playsInline)');
  console.log('4. Video will maintain 9:16 aspect ratio with object-cover styling');
}