const puppeteer = require('puppeteer');

async function testWhyChooseUsVideo() {
  console.log('Testing Why Choose Us video implementation...');
  
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();
  
  try {
    // Navigate to the local development server
    await page.goto('http://localhost:3001');
    
    // Wait for the page to load
    await page.waitForSelector('#why-choose-us', { timeout: 10000 });
    
    // Scroll to the Why Choose Us section
    await page.evaluate(() => {
      document.getElementById('why-choose-us').scrollIntoView();
    });
    
    // Wait for the carousel to load
    await page.waitForSelector('.carousel', { timeout: 5000 });
    
    // Check if the first slide has a video element
    const hasVideo = await page.evaluate(() => {
      const firstSlide = document.querySelector('.carousel li:first-child');
      if (!firstSlide) return false;
      
      const videoElement = firstSlide.querySelector('video');
      return !!videoElement;
    });
    
    if (hasVideo) {
      console.log('✓ Video element found in the first slide (Zero Risk card)');
      
      // Check video attributes
      const videoAttributes = await page.evaluate(() => {
        const firstSlide = document.querySelector('.carousel li:first-child');
        const videoElement = firstSlide.querySelector('video');
        
        return {
          src: videoElement.src,
          autoplay: videoElement.autoplay,
          muted: videoElement.muted,
          loop: videoElement.loop,
          playsInline: videoElement.playsInline
        };
      });
      
      console.log('Video attributes:', videoAttributes);
      
      // Check if the video is playing
      const isPlaying = await page.evaluate(() => {
        const firstSlide = document.querySelector('.carousel li:first-child');
        const videoElement = firstSlide.querySelector('video');
        
        return !videoElement.paused && !videoElement.ended;
      });
      
      if (isPlaying) {
        console.log('✓ Video is playing');
      } else {
        console.log('⚠ Video is not playing (might be loading or blocked by browser)');
      }
      
      // Check the video source
      if (videoAttributes.src.includes('insta_post_2_1_xdaptq.mp4')) {
        console.log('✓ Correct video source is loaded');
      } else {
        console.log('✗ Incorrect video source');
      }
      
    } else {
      console.log('✗ No video element found in the first slide');
    }
    
    // Take a screenshot for verification
    await page.screenshot({ path: 'why-choose-us-video-test.png', fullPage: false });
    console.log('Screenshot saved as why-choose-us-video-test.png');
    
  } catch (error) {
    console.error('Error during test:', error);
  } finally {
    await browser.close();
  }
}

testWhyChooseUsVideo();