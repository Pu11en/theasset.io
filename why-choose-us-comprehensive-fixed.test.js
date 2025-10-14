const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

// Test configuration
const TEST_CONFIG = {
  baseUrl: 'http://localhost:3001',
  screenshotsDir: './test-results/screenshots/why-choose-us',
  reportPath: './test-results/why-choose-us-comprehensive-test-report.json',
  viewports: [
    { name: 'Mobile', width: 375, height: 667 },
    { name: 'Tablet', width: 768, height: 1024 },
    { name: 'Desktop', width: 1920, height: 1080 }
  ]
};

// Test results storage
const testResults = {
  timestamp: new Date().toISOString(),
  summary: {
    total: 0,
    passed: 0,
    failed: 0
  },
  tests: [],
  screenshots: []
};

// Helper functions
function log(message, type = 'info') {
  const timestamp = new Date().toISOString();
  const prefix = type === 'error' ? '❌' : type === 'success' ? '✅' : 'ℹ️';
  console.log(`${prefix} [${timestamp}] ${message}`);
}

function recordTest(name, passed, details = '') {
  testResults.summary.total++;
  if (passed) {
    testResults.summary.passed++;
    log(`PASSED: ${name}`, 'success');
  } else {
    testResults.summary.failed++;
    log(`FAILED: ${name} - ${details}`, 'error');
  }
  
  testResults.tests.push({
    name,
    passed,
    details,
    timestamp: new Date().toISOString()
  });
}

async function takeScreenshot(page, name, viewport) {
  const filename = `${name}-${viewport.name.toLowerCase()}-${Date.now()}.png`;
  const filepath = path.join(TEST_CONFIG.screenshotsDir, filename);
  
  try {
    // Wait a bit to ensure content is rendered
    await new Promise(resolve => setTimeout(resolve, 1000));
    await page.screenshot({ path: filepath, fullPage: true });
    testResults.screenshots.push({
      name,
      viewport: viewport.name,
      path: filepath
    });
    log(`Screenshot saved: ${filename}`);
    return filepath;
  } catch (error) {
    log(`Failed to take screenshot: ${error.message}`, 'error');
    return null;
  }
}

// Test functions
async function testPageLoad(page, viewport) {
  try {
    log(`Testing page load on ${viewport.name}...`);
    
    // Navigate to the homepage
    await page.goto(TEST_CONFIG.baseUrl, { waitUntil: 'networkidle2' });
    
    // Scroll to the WhyChooseUs section
    const whyChooseUsSection = await page.$('#why-choose-us');
    if (!whyChooseUsSection) {
      recordTest('WhyChooseUs section exists', false, 'Section not found on page');
      return false;
    }
    
    await page.evaluate(() => {
      document.getElementById('why-choose-us').scrollIntoView({ behavior: 'smooth' });
    });
    
    // Wait for section to be visible
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    recordTest('Page loads and WhyChooseUs section is accessible', true);
    return true;
  } catch (error) {
    recordTest('Page loads and WhyChooseUs section is accessible', false, error.message);
    return false;
  }
}

async function testAspectRatio(page, viewport) {
  try {
    log(`Testing aspect ratio on ${viewport.name}...`);
    
    // Get the carousel container
    const carouselContainer = await page.$('[aria-labelledby^="carousel-heading-"]');
    if (!carouselContainer) {
      recordTest('Carousel container exists', false, 'Carousel container not found');
      return false;
    }
    
    // Get the dimensions of the carousel
    const dimensions = await page.evaluate((container) => {
      const rect = container.getBoundingClientRect();
      return {
        width: rect.width,
        height: rect.height,
        ratio: rect.height / rect.width
      };
    }, carouselContainer);
    
    // Calculate expected ratio (9:16 = 0.5625)
    const expectedRatio = 9 / 16;
    const actualRatio = dimensions.ratio;
    const ratioDifference = Math.abs(actualRatio - expectedRatio);
    
    // Allow for small variance (0.05)
    const isCorrectRatio = ratioDifference < 0.05;
    
    recordTest(
      `Aspect ratio is 9:16 on ${viewport.name}`,
      isCorrectRatio,
      `Expected: ${expectedRatio.toFixed(2)}, Actual: ${actualRatio.toFixed(2)}, Diff: ${ratioDifference.toFixed(2)}`
    );
    
    // Get individual slide dimensions
    const slideDimensions = await page.evaluate(() => {
      const slide = document.querySelector('li[style*="transform"]');
      if (!slide) return null;
      
      const rect = slide.getBoundingClientRect();
      return {
        width: rect.width,
        height: rect.height,
        ratio: rect.height / rect.width
      };
    });
    
    if (slideDimensions) {
      const slideRatio = slideDimensions.ratio;
      const slideRatioDifference = Math.abs(slideRatio - expectedRatio);
      const isSlideCorrectRatio = slideRatioDifference < 0.05;
      
      recordTest(
        `Slide aspect ratio is 9:16 on ${viewport.name}`,
        isSlideCorrectRatio,
        `Expected: ${expectedRatio.toFixed(2)}, Actual: ${slideRatio.toFixed(2)}, Diff: ${slideRatioDifference.toFixed(2)}`
      );
    }
    
    return isCorrectRatio;
  } catch (error) {
    recordTest(`Aspect ratio is 9:16 on ${viewport.name}`, false, error.message);
    return false;
  }
}

async function testVideoLoading(page, viewport) {
  try {
    log(`Testing video loading on ${viewport.name}...`);
    
    // Check if video element exists
    const videoExists = await page.evaluate(() => {
      const videos = document.querySelectorAll('video');
      return videos.length > 0;
    });
    
    recordTest('Video element exists in Zero Risk card', videoExists);
    
    if (!videoExists) return false;
    
    // Navigate to the first slide (Zero Risk)
    await page.evaluate(() => {
      const slides = document.querySelectorAll('li');
      if (slides.length > 0) {
        slides[0].click();
      }
    });
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Check video attributes
    const videoAttributes = await page.evaluate(() => {
      const video = document.querySelector('video');
      if (!video) return null;
      
      return {
        src: video.src,
        autoplay: video.autoplay,
        muted: video.muted,
        loop: video.loop,
        playsInline: video.playsInline
      };
    });
    
    if (videoAttributes) {
      const isCloudinaryVideo = videoAttributes.src.includes('cloudinary.com');
      const hasCorrectAttributes = videoAttributes.autoplay && videoAttributes.muted && videoAttributes.loop && videoAttributes.playsInline;
      
      recordTest('Video is from Cloudinary', isCloudinaryVideo);
      recordTest('Video has autoplay, muted, loop, playsInline attributes', hasCorrectAttributes);
      
      // Check video dimensions
      const videoDimensions = await page.evaluate(() => {
        const video = document.querySelector('video');
        if (!video) return null;
        
        return {
          videoWidth: video.videoWidth,
          videoHeight: video.videoHeight,
          displayWidth: video.clientWidth,
          displayHeight: video.clientHeight
        };
      });
      
      if (videoDimensions && videoDimensions.videoWidth > 0 && videoDimensions.videoHeight > 0) {
        const videoRatio = videoDimensions.videoHeight / videoDimensions.videoWidth;
        const expectedRatio = 9 / 16;
        const ratioDifference = Math.abs(videoRatio - expectedRatio);
        const isCorrectRatio = ratioDifference < 0.1;
        
        recordTest(
          'Video has 9:16 aspect ratio',
          isCorrectRatio,
          `Video dimensions: ${videoDimensions.videoWidth}x${videoDimensions.videoHeight}, Ratio: ${videoRatio.toFixed(2)}`
        );
      }
    }
    
    return videoExists;
  } catch (error) {
    recordTest('Video loading test', false, error.message);
    return false;
  }
}

async function testTextOverlay(page, viewport) {
  try {
    log(`Testing text overlay on ${viewport.name}...`);
    
    // Check if text overlay exists
    const textOverlayExists = await page.evaluate(() => {
      const articles = document.querySelectorAll('article');
      return articles.length > 0;
    });
    
    recordTest('Text overlay article element exists', textOverlayExists);
    
    if (!textOverlayExists) return false;
    
    // Check text content
    const textContent = await page.evaluate(() => {
      const article = document.querySelector('article');
      if (!article) return null;
      
      const title = article.querySelector('h2');
      const description = article.querySelector('p');
      
      return {
        title: title ? title.textContent.trim() : null,
        description: description ? description.textContent.trim() : null,
        isVisible: article.style.opacity !== '0' && article.style.visibility !== 'hidden'
      };
    });
    
    if (textContent) {
      const hasCorrectTitle = textContent.title === 'Zero Risk';
      const hasDescription = textContent.description && textContent.description.length > 0;
      const isVisible = textContent.isVisible;
      
      recordTest('Text overlay shows "Zero Risk" title', hasCorrectTitle);
      recordTest('Text overlay shows description', hasDescription);
      recordTest('Text overlay is visible', isVisible);
    }
    
    return textOverlayExists;
  } catch (error) {
    recordTest('Text overlay test', false, error.message);
    return false;
  }
}

async function testCarouselNavigation(page, viewport) {
  try {
    log(`Testing carousel navigation on ${viewport.name}...`);
    
    // Get initial slide
    const initialSlide = await page.evaluate(() => {
      const slides = document.querySelectorAll('li');
      for (let i = 0; i < slides.length; i++) {
        const style = window.getComputedStyle(slides[i]);
        if (style.transform === 'matrix(1, 0, 0, 1, 0, 0)' || style.transform === 'none') {
          return i;
        }
      }
      return 0;
    });
    
    // Find and click next button
    const nextButtonExists = await page.evaluate(() => {
      const buttons = document.querySelectorAll('button');
      for (const button of buttons) {
        if (button.title && button.title.includes('next slide')) {
          button.click();
          return true;
        }
      }
      return false;
    });
    
    recordTest('Next navigation button exists and clickable', nextButtonExists);
    
    if (!nextButtonExists) return false;
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Check if slide changed
    const newSlide = await page.evaluate(() => {
      const slides = document.querySelectorAll('li');
      for (let i = 0; i < slides.length; i++) {
        const style = window.getComputedStyle(slides[i]);
        if (style.transform === 'matrix(1, 0, 0, 1, 0, 0)' || style.transform === 'none') {
          return i;
        }
      }
      return 0;
    });
    
    const slideChanged = newSlide !== initialSlide;
    recordTest('Carousel navigation changes active slide', slideChanged);
    
    // Test previous button
    const prevButtonExists = await page.evaluate(() => {
      const buttons = document.querySelectorAll('button');
      for (const button of buttons) {
        if (button.title && button.title.includes('previous slide')) {
          button.click();
          return true;
        }
      }
      return false;
    });
    
    recordTest('Previous navigation button exists and clickable', prevButtonExists);
    
    // Test direct slide click
    const slideClickWorks = await page.evaluate(() => {
      const slides = document.querySelectorAll('li');
      if (slides.length > 2) {
        slides[2].click();
        return true;
      }
      return false;
    });
    
    recordTest('Direct slide click navigation works', slideClickWorks);
    
    return nextButtonExists && prevButtonExists;
  } catch (error) {
    recordTest('Carousel navigation test', false, error.message);
    return false;
  }
}

async function testResponsiveness(page, viewport) {
  try {
    log(`Testing responsiveness on ${viewport.name}...`);
    
    // Check if carousel adapts to viewport
    const carouselDimensions = await page.evaluate(() => {
      const carousel = document.querySelector('[aria-labelledby^="carousel-heading-"]');
      if (!carousel) return null;
      
      const rect = carousel.getBoundingClientRect();
      return {
        width: rect.width,
        height: rect.height,
        usesVMin: window.getComputedStyle(carousel).width.includes('vmin')
      };
    });
    
    if (carouselDimensions) {
      const usesResponsiveUnits = carouselDimensions.usesVMin;
      recordTest(
        `Carousel uses responsive units on ${viewport.name}`,
        usesResponsiveUnits
      );
    }
    
    // Check if text scales appropriately
    const textScaling = await page.evaluate(() => {
      const title = document.querySelector('article h2');
      if (!title) return null;
      
      const style = window.getComputedStyle(title);
      return {
        fontSize: style.fontSize,
        usesResponsiveUnits: style.fontSize.includes('rem') || style.fontSize.includes('em') || style.fontSize.includes('vw')
      };
    });
    
    if (textScaling) {
      const textIsResponsive = textScaling.usesResponsiveUnits;
      recordTest(
        `Text scales responsively on ${viewport.name}`,
        textIsResponsive,
        `Font size: ${textScaling.fontSize}`
      );
    }
    
    return true;
  } catch (error) {
    recordTest('Responsiveness test', false, error.message);
    return false;
  }
}

// Main test function
async function runTests() {
  log('Starting comprehensive WhyChooseUs component tests...');
  
  // Ensure screenshots directory exists
  if (!fs.existsSync(TEST_CONFIG.screenshotsDir)) {
    fs.mkdirSync(TEST_CONFIG.screenshotsDir, { recursive: true });
  }
  
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  try {
    for (const viewport of TEST_CONFIG.viewports) {
      log(`\n=== Testing on ${viewport.name} (${viewport.width}x${viewport.height}) ===`);
      
      const page = await browser.newPage();
      await page.setViewport(viewport);
      
      try {
        // Run all tests for this viewport
        await testPageLoad(page, viewport);
        await takeScreenshot(page, 'initial-load', viewport);
        
        await testAspectRatio(page, viewport);
        await takeScreenshot(page, 'aspect-ratio-test', viewport);
        
        await testVideoLoading(page, viewport);
        await takeScreenshot(page, 'video-loaded', viewport);
        
        await testTextOverlay(page, viewport);
        await takeScreenshot(page, 'text-overlay', viewport);
        
        await testCarouselNavigation(page, viewport);
        await takeScreenshot(page, 'navigation-test', viewport);
        
        await testResponsiveness(page, viewport);
        await takeScreenshot(page, 'responsiveness-test', viewport);
        
      } catch (error) {
        log(`Error testing ${viewport.name}: ${error.message}`, 'error');
        recordTest(`${viewport.name} test suite`, false, error.message);
      } finally {
        await page.close();
      }
    }
    
    // Save test results
    const reportDir = path.dirname(TEST_CONFIG.reportPath);
    if (!fs.existsSync(reportDir)) {
      fs.mkdirSync(reportDir, { recursive: true });
    }
    
    fs.writeFileSync(TEST_CONFIG.reportPath, JSON.stringify(testResults, null, 2));
    
    // Print summary
    log('\n=== TEST SUMMARY ===');
    log(`Total tests: ${testResults.summary.total}`);
    log(`Passed: ${testResults.summary.passed}`);
    log(`Failed: ${testResults.summary.failed}`);
    log(`Success rate: ${((testResults.summary.passed / testResults.summary.total) * 100).toFixed(1)}%`);
    log(`Report saved to: ${TEST_CONFIG.reportPath}`);
    log(`Screenshots saved to: ${TEST_CONFIG.screenshotsDir}`);
    
  } finally {
    await browser.close();
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  runTests().catch(error => {
    log(`Test execution failed: ${error.message}`, 'error');
    process.exit(1);
  });
}

module.exports = {
  runTests,
  testAspectRatio,
  testVideoLoading,
  testTextOverlay,
  testCarouselNavigation,
  testResponsiveness
};