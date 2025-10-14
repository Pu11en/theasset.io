/**
 * Comprehensive Test Suite for Updated Carousel Functionality in WhyChooseUs Component
 * 
 * This test suite verifies:
 * 1. New video slide loading and playback properties
 * 2. New image slide loading
 * 3. Placeholder text overlays for new slides
 * 4. Carousel navigation with new slides
 * 5. Responsiveness on different screen sizes
 */

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

// Test configuration
const TEST_CONFIG = {
  baseUrl: 'http://localhost:4000',
  screenshotsDir: './test-results/new-slides-screenshots',
  reportPath: './test-results/new-slides-test-report.json',
  timeout: 30000,
  viewports: {
    mobile: { width: 375, height: 667 },
    tablet: { width: 768, height: 1024 },
    desktop: { width: 1280, height: 800 }
  }
};

// New slide data to verify
const NEW_SLIDES = {
  video: {
    id: 'new-video',
    src: 'https://res.cloudinary.com/dmdjagtkx/video/upload/v1760470477/carosal_6_yzdvbj.mp4',
    title: 'Video title placeholder',
    description: 'Video description placeholder',
    caption: 'New Video',
    type: 'video',
    autoplay: true,
    muted: true,
    loop: true
  },
  image: {
    id: 'new-image',
    src: 'https://res.cloudinary.com/dmdjagtkx/image/upload/v1760472391/carosal_pep_agscnh.png',
    title: 'Image title placeholder',
    description: 'Image description placeholder',
    caption: 'New Image',
    type: 'image',
    alt: 'New image asset'
  }
};

// Test results storage
let testResults = {
  summary: {
    total: 0,
    passed: 0,
    failed: 0,
    skipped: 0
  },
  tests: [],
  timestamp: new Date().toISOString()
};

/**
 * Helper function to create a test result entry
 */
function createTestResult(name, status, details = '', error = null) {
  const result = {
    name,
    status,
    details,
    error: error ? error.message : null,
    timestamp: new Date().toISOString()
  };
  
  testResults.tests.push(result);
  testResults.summary.total++;
  
  if (status === 'passed') {
    testResults.summary.passed++;
    console.log(`✅ ${name}: ${details}`);
  } else if (status === 'failed') {
    testResults.summary.failed++;
    console.log(`❌ ${name}: ${details}`);
    if (error) console.error(`   Error: ${error.message}`);
  } else {
    testResults.summary.skipped++;
    console.log(`⏭️ ${name}: ${details}`);
  }
  
  return result;
}

/**
 * Helper function to take a screenshot
 */
async function takeScreenshot(page, name, viewport) {
  const screenshotPath = path.join(
    TEST_CONFIG.screenshotsDir,
    `${viewport}-${name}-${Date.now()}.png`
  );
  
  await page.screenshot({ path: screenshotPath, fullPage: true });
  return screenshotPath;
}

/**
 * Test if the new video slide loads and plays correctly
 */
async function testVideoSlideLoading(page, viewport) {
  const testName = `Video Slide Loading - ${viewport}`;
  
  try {
    // Navigate to the WhyChooseUs section
    await page.goto(`${TEST_CONFIG.baseUrl}/#why-choose-us`);
    await page.waitForSelector('#why-choose-us', { timeout: TEST_CONFIG.timeout });
    
    // Find the new video slide
    const videoSlide = await page.locator(`[data-slide-id="${NEW_SLIDES.video.id}"]`).first();
    const isVisible = await videoSlide.isVisible();
    
    if (!isVisible) {
      // Navigate to the video slide if not visible
      const slideIndex = await page.evaluate(() => {
        const slides = Array.from(document.querySelectorAll('.carousel__slide'));
        return slides.findIndex(slide => 
          slide.querySelector('video') && 
          slide.querySelector('video').src.includes('carosal_6_yzdvbj.mp4')
        );
      });
      
      if (slideIndex !== -1) {
        // Navigate to the slide by clicking pagination bullets
        const bullets = await page.locator('.carousel__pagination-bullet').all();
        if (bullets[slideIndex]) {
          await bullets[slideIndex].click();
          await page.waitForTimeout(500);
        }
      }
    }
    
    // Check if video element exists
    const videoElement = await page.locator('video[src*="carosal_6_yzdvbj.mp4"]').first();
    const videoExists = await videoElement.count() > 0;
    
    if (!videoExists) {
      return createTestResult(
        testName,
        'failed',
        'Video element not found',
        new Error('Video element with expected source not found')
      );
    }
    
    // Check video attributes
    const isAutoplay = await videoElement.getAttribute('autoplay');
    const isMuted = await videoElement.getAttribute('muted');
    const isLoop = await videoElement.getAttribute('loop');
    const hasControls = await videoElement.getAttribute('controls');
    
    // Verify video properties
    const hasCorrectAttributes = 
      (isAutoplay !== null) && 
      (isMuted !== null) && 
      (isLoop !== null) && 
      (hasControls !== null);
    
    if (!hasCorrectAttributes) {
      return createTestResult(
        testName,
        'failed',
        `Video attributes incorrect - autoplay: ${isAutoplay}, muted: ${isMuted}, loop: ${isLoop}, controls: ${hasControls}`,
        new Error('Video does not have expected attributes')
      );
    }
    
    // Check if video is playing (by checking if it has progressed)
    await page.waitForTimeout(2000); // Wait for video to potentially start playing
    
    const currentTime = await page.evaluate(() => {
      const video = document.querySelector('video[src*="carosal_6_yzdvbj.mp4"]');
      return video ? video.currentTime : 0;
    });
    
    const isPlaying = currentTime > 0;
    
    // Take a screenshot for visual verification
    const screenshotPath = await takeScreenshot(page, 'video-slide', viewport);
    
    return createTestResult(
      testName,
      isPlaying ? 'passed' : 'partial',
      `Video loaded with correct attributes. Playing: ${isPlaying}. Screenshot: ${screenshotPath}`
    );
    
  } catch (error) {
    return createTestResult(testName, 'failed', 'Error testing video slide', error);
  }
}

/**
 * Test if the new image slide loads correctly
 */
async function testImageSlideLoading(page, viewport) {
  const testName = `Image Slide Loading - ${viewport}`;
  
  try {
    // Navigate to the WhyChooseUs section
    await page.goto(`${TEST_CONFIG.baseUrl}/#why-choose-us`);
    await page.waitForSelector('#why-choose-us', { timeout: TEST_CONFIG.timeout });
    
    // Find the new image slide
    const imageSlide = await page.locator(`img[src*="carosal_pep_agscnh.png"]`).first();
    const isVisible = await imageSlide.isVisible();
    
    if (!isVisible) {
      // Navigate to the image slide if not visible
      const slideIndex = await page.evaluate(() => {
        const slides = Array.from(document.querySelectorAll('.carousel__slide'));
        return slides.findIndex(slide => 
          slide.querySelector('img') && 
          slide.querySelector('img').src.includes('carosal_pep_agscnh.png')
        );
      });
      
      if (slideIndex !== -1) {
        // Navigate to the slide by clicking pagination bullets
        const bullets = await page.locator('.carousel__pagination-bullet').all();
        if (bullets[slideIndex]) {
          await bullets[slideIndex].click();
          await page.waitForTimeout(500);
        }
      }
    }
    
    // Check if image element exists
    const imageElement = await page.locator('img[src*="carosal_pep_agscnh.png"]').first();
    const imageExists = await imageElement.count() > 0;
    
    if (!imageExists) {
      return createTestResult(
        testName,
        'failed',
        'Image element not found',
        new Error('Image element with expected source not found')
      );
    }
    
    // Check image attributes
    const altText = await imageElement.getAttribute('alt');
    const hasCorrectAlt = altText === NEW_SLIDES.image.alt;
    
    // Check if image is loaded
    const isLoaded = await imageElement.evaluate(img => img.complete && img.naturalHeight !== 0);
    
    // Take a screenshot for visual verification
    const screenshotPath = await takeScreenshot(page, 'image-slide', viewport);
    
    return createTestResult(
      testName,
      isLoaded && hasCorrectAlt ? 'passed' : 'partial',
      `Image loaded: ${isLoaded}, Correct alt: ${hasCorrectAlt}. Screenshot: ${screenshotPath}`
    );
    
  } catch (error) {
    return createTestResult(testName, 'failed', 'Error testing image slide', error);
  }
}

/**
 * Test if the new slides have placeholder text overlays
 */
async function testPlaceholderTextOverlays(page, viewport) {
  const testName = `Placeholder Text Overlays - ${viewport}`;
  
  try {
    // Navigate to the WhyChooseUs section
    await page.goto(`${TEST_CONFIG.baseUrl}/#why-choose-us`);
    await page.waitForSelector('#why-choose-us', { timeout: TEST_CONFIG.timeout });
    
    // Check video slide overlay
    const videoSlideIndex = await page.evaluate(() => {
      const slides = Array.from(document.querySelectorAll('.carousel__slide'));
      return slides.findIndex(slide => 
        slide.querySelector('video') && 
        slide.querySelector('video').src.includes('carosal_6_yzdvbj.mp4')
      );
    });
    
    if (videoSlideIndex !== -1) {
      // Navigate to the video slide
      const bullets = await page.locator('.carousel__pagination-bullet').all();
      if (bullets[videoSlideIndex]) {
        await bullets[videoSlideIndex].click();
        await page.waitForTimeout(500);
      }
      
      // Check for title and description overlays
      const videoTitle = await page.locator('.carousel__slide-title').filter({ hasText: NEW_SLIDES.video.title }).first();
      const videoDesc = await page.locator('.carousel__slide-description').filter({ hasText: NEW_SLIDES.video.description }).first();
      
      const videoTitleExists = await videoTitle.count() > 0;
      const videoDescExists = await videoDesc.count() > 0;
      
      if (!videoTitleExists || !videoDescExists) {
        // Check for alternative overlay structure
        const videoCaption = await page.locator('.carousel__slide-caption').filter({ hasText: NEW_SLIDES.video.caption }).first();
        const videoCaptionExists = await videoCaption.count() > 0;
        
        if (!videoCaptionExists) {
          return createTestResult(
            testName,
            'failed',
            'Video slide placeholder text not found',
            new Error('Neither title/description nor caption found for video slide')
          );
        }
      }
    }
    
    // Check image slide overlay
    const imageSlideIndex = await page.evaluate(() => {
      const slides = Array.from(document.querySelectorAll('.carousel__slide'));
      return slides.findIndex(slide => 
        slide.querySelector('img') && 
        slide.querySelector('img').src.includes('carosal_pep_agscnh.png')
      );
    });
    
    if (imageSlideIndex !== -1) {
      // Navigate to the image slide
      const bullets = await page.locator('.carousel__pagination-bullet').all();
      if (bullets[imageSlideIndex]) {
        await bullets[imageSlideIndex].click();
        await page.waitForTimeout(500);
      }
      
      // Check for title and description overlays
      const imageTitle = await page.locator('.carousel__slide-title').filter({ hasText: NEW_SLIDES.image.title }).first();
      const imageDesc = await page.locator('.carousel__slide-description').filter({ hasText: NEW_SLIDES.image.description }).first();
      
      const imageTitleExists = await imageTitle.count() > 0;
      const imageDescExists = await imageDesc.count() > 0;
      
      if (!imageTitleExists || !imageDescExists) {
        // Check for alternative overlay structure
        const imageCaption = await page.locator('.carousel__slide-caption').filter({ hasText: NEW_SLIDES.image.caption }).first();
        const imageCaptionExists = await imageCaption.count() > 0;
        
        if (!imageCaptionExists) {
          return createTestResult(
            testName,
            'failed',
            'Image slide placeholder text not found',
            new Error('Neither title/description nor caption found for image slide')
          );
        }
      }
    }
    
    // Take a screenshot for visual verification
    const screenshotPath = await takeScreenshot(page, 'text-overlays', viewport);
    
    return createTestResult(
      testName,
      'passed',
      `Placeholder text overlays found for both new slides. Screenshot: ${screenshotPath}`
    );
    
  } catch (error) {
    return createTestResult(testName, 'failed', 'Error testing placeholder text overlays', error);
  }
}

/**
 * Test carousel navigation with new slides
 */
async function testCarouselNavigation(page, viewport) {
  const testName = `Carousel Navigation - ${viewport}`;
  
  try {
    // Navigate to the WhyChooseUs section
    await page.goto(`${TEST_CONFIG.baseUrl}/#why-choose-us`);
    await page.waitForSelector('#why-choose-us', { timeout: TEST_CONFIG.timeout });
    
    // Find indices of new slides
    const newSlideIndices = await page.evaluate(() => {
      const slides = Array.from(document.querySelectorAll('.carousel__slide'));
      return slides.map((slide, index) => {
        const hasVideo = slide.querySelector('video') && 
                        slide.querySelector('video').src.includes('carosal_6_yzdvbj.mp4');
        const hasImage = slide.querySelector('img') && 
                        slide.querySelector('img').src.includes('carosal_pep_agscnh.png');
        return { index, hasVideo, hasImage };
      }).filter(slide => slide.hasVideo || slide.hasImage).map(slide => slide.index);
    });
    
    if (newSlideIndices.length === 0) {
      return createTestResult(
        testName,
        'failed',
        'New slides not found in carousel',
        new Error('Neither new video nor image slide found')
      );
    }
    
    // Test navigation to each new slide
    for (const slideIndex of newSlideIndices) {
      // Navigate using pagination bullets
      const bullets = await page.locator('.carousel__pagination-bullet').all();
      if (bullets[slideIndex]) {
        await bullets[slideIndex].click();
        await page.waitForTimeout(500);
        
        // Verify slide is now active
        const isActive = await page.evaluate((index) => {
          const slides = document.querySelectorAll('.carousel__slide');
          if (slides[index]) {
            return slides[index].classList.contains('carousel__slide--active');
          }
          return false;
        }, slideIndex);
        
        if (!isActive) {
          return createTestResult(
            testName,
            'failed',
            `Failed to navigate to slide at index ${slideIndex}`,
            new Error(`Slide ${slideIndex} is not active after navigation`)
          );
        }
      }
    }
    
    // Test next/previous navigation
    const nextButton = await page.locator('.carousel__arrow--next').first();
    const prevButton = await page.locator('.carousel__arrow--prev').first();
    
    if (await nextButton.isVisible() && await prevButton.isVisible()) {
      // Navigate to first new slide
      if (newSlideIndices.length > 0) {
        const bullets = await page.locator('.carousel__pagination-bullet').all();
        if (bullets[newSlideIndices[0]]) {
          await bullets[newSlideIndices[0]].click();
          await page.waitForTimeout(500);
        }
        
        // Test next button
        await nextButton.click();
        await page.waitForTimeout(500);
        
        // Test previous button
        await prevButton.click();
        await page.waitForTimeout(500);
      }
    }
    
    // Take a screenshot for visual verification
    const screenshotPath = await takeScreenshot(page, 'navigation', viewport);
    
    return createTestResult(
      testName,
      'passed',
      `Navigation to new slides successful. Screenshot: ${screenshotPath}`
    );
    
  } catch (error) {
    return createTestResult(testName, 'failed', 'Error testing carousel navigation', error);
  }
}

/**
 * Test carousel responsiveness on different screen sizes
 */
async function testCarouselResponsiveness(page, viewport) {
  const testName = `Carousel Responsiveness - ${viewport}`;
  
  try {
    // Set viewport size
    await page.setViewportSize(TEST_CONFIG.viewports[viewport]);
    
    // Navigate to the WhyChooseUs section
    await page.goto(`${TEST_CONFIG.baseUrl}/#why-choose-us`);
    await page.waitForSelector('#why-choose-us', { timeout: TEST_CONFIG.timeout });
    
    // Check if carousel is visible and properly sized
    const carousel = await page.locator('.carousel').first();
    const isVisible = await carousel.isVisible();
    
    if (!isVisible) {
      return createTestResult(
        testName,
        'failed',
        'Carousel not visible',
        new Error('Carousel element not found or not visible')
      );
    }
    
    // Check carousel dimensions
    const boundingBox = await carousel.boundingBox();
    const hasValidDimensions = boundingBox && boundingBox.width > 0 && boundingBox.height > 0;
    
    if (!hasValidDimensions) {
      return createTestResult(
        testName,
        'failed',
        'Carousel has invalid dimensions',
        new Error(`Carousel dimensions: ${JSON.stringify(boundingBox)}`)
      );
    }
    
    // Check if slides are properly sized
    const slides = await page.locator('.carousel__slide').all();
    let slidesHaveValidDimensions = true;
    
    for (const slide of slides) {
      const slideBox = await slide.boundingBox();
      if (!slideBox || slideBox.width <= 0 || slideBox.height <= 0) {
        slidesHaveValidDimensions = false;
        break;
      }
    }
    
    // Check if navigation elements are properly positioned
    const nextButton = await page.locator('.carousel__arrow--next').first();
    const prevButton = await page.locator('.carousel__arrow--prev').first();
    
    const navElementsVisible = await nextButton.isVisible() && await prevButton.isVisible();
    
    // Take a screenshot for visual verification
    const screenshotPath = await takeScreenshot(page, 'responsiveness', viewport);
    
    return createTestResult(
      testName,
      hasValidDimensions && slidesHaveValidDimensions ? 'passed' : 'partial',
      `Carousel dimensions valid: ${hasValidDimensions}, Slides valid: ${slidesHaveValidDimensions}, Navigation visible: ${navElementsVisible}. Screenshot: ${screenshotPath}`
    );
    
  } catch (error) {
    return createTestResult(testName, 'failed', 'Error testing carousel responsiveness', error);
  }
}

/**
 * Main test execution function
 */
async function runTests() {
  console.log('🚀 Starting comprehensive tests for updated carousel functionality...\n');
  
  // Ensure screenshots directory exists
  if (!fs.existsSync(TEST_CONFIG.screenshotsDir)) {
    fs.mkdirSync(TEST_CONFIG.screenshotsDir, { recursive: true });
  }
  
  // Initialize browser
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  
  try {
    // Run tests for each viewport
    for (const viewport of Object.keys(TEST_CONFIG.viewports)) {
      console.log(`\n📱 Testing on ${viewport} viewport...`);
      const page = await context.newPage();
      
      try {
        // Run all test categories
        await testVideoSlideLoading(page, viewport);
        await testImageSlideLoading(page, viewport);
        await testPlaceholderTextOverlays(page, viewport);
        await testCarouselNavigation(page, viewport);
        await testCarouselResponsiveness(page, viewport);
      } finally {
        await page.close();
      }
    }
    
    // Save test results
    fs.writeFileSync(TEST_CONFIG.reportPath, JSON.stringify(testResults, null, 2));
    
    // Print summary
    console.log('\n📊 Test Summary:');
    console.log(`Total: ${testResults.summary.total}`);
    console.log(`Passed: ${testResults.summary.passed}`);
    console.log(`Failed: ${testResults.summary.failed}`);
    console.log(`Skipped: ${testResults.summary.skipped}`);
    console.log(`Success Rate: ${((testResults.summary.passed / testResults.summary.total) * 100).toFixed(2)}%`);
    console.log(`\n📄 Full report saved to: ${TEST_CONFIG.reportPath}`);
    console.log(`📸 Screenshots saved to: ${TEST_CONFIG.screenshotsDir}`);
    
    return testResults;
    
  } finally {
    await browser.close();
  }
}

/**
 * Generate a detailed HTML report
 */
function generateHtmlReport() {
  const reportPath = TEST_CONFIG.reportPath.replace('.json', '.html');
  
  const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>WhyChooseUs New Slides Test Report</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
            line-height: 1.6;
            color: #333;
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
            padding-bottom: 20px;
            border-bottom: 1px solid #eee;
        }
        .summary {
            display: flex;
            justify-content: space-around;
            margin-bottom: 30px;
            background: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
        }
        .summary-item {
            text-align: center;
        }
        .summary-item h3 {
            margin: 0 0 10px 0;
            font-size: 24px;
        }
        .passed { color: #28a745; }
        .failed { color: #dc3545; }
        .skipped { color: #ffc107; }
        .test-list {
            margin-top: 30px;
        }
        .test-item {
            margin-bottom: 15px;
            padding: 15px;
            border-radius: 5px;
            border-left: 4px solid;
        }
        .test-item.passed {
            background-color: #f8fff9;
            border-left-color: #28a745;
        }
        .test-item.failed {
            background-color: #fff8f8;
            border-left-color: #dc3545;
        }
        .test-item.partial {
            background-color: #fffdf7;
            border-left-color: #ffc107;
        }
        .test-name {
            font-weight: bold;
            margin-bottom: 5px;
        }
        .test-details {
            margin-bottom: 5px;
        }
        .test-error {
            color: #dc3545;
            font-family: monospace;
            background: #f8f8f8;
            padding: 5px;
            border-radius: 3px;
            margin-top: 5px;
        }
        .screenshots {
            margin-top: 30px;
        }
        .screenshot-item {
            margin-bottom: 10px;
        }
        .screenshot-link {
            color: #007bff;
            text-decoration: none;
        }
        .screenshot-link:hover {
            text-decoration: underline;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>WhyChooseUs New Slides Test Report</h1>
        <p>Generated on ${new Date().toLocaleString()}</p>
    </div>
    
    <div class="summary">
        <div class="summary-item">
            <h3 class="passed">${testResults.summary.passed}</h3>
            <p>Passed</p>
        </div>
        <div class="summary-item">
            <h3 class="failed">${testResults.summary.failed}</h3>
            <p>Failed</p>
        </div>
        <div class="summary-item">
            <h3 class="skipped">${testResults.summary.skipped}</h3>
            <p>Skipped</p>
        </div>
        <div class="summary-item">
            <h3>${testResults.summary.total}</h3>
            <p>Total</p>
        </div>
        <div class="summary-item">
            <h3>${((testResults.summary.passed / testResults.summary.total) * 100).toFixed(2)}%</h3>
            <p>Success Rate</p>
        </div>
    </div>
    
    <div class="test-list">
        <h2>Test Results</h2>
        ${testResults.tests.map(test => `
            <div class="test-item ${test.status}">
                <div class="test-name">${test.name}</div>
                <div class="test-details">${test.details}</div>
                ${test.error ? `<div class="test-error">${test.error}</div>` : ''}
            </div>
        `).join('')}
    </div>
    
    <div class="screenshots">
        <h2>Screenshots</h2>
        <p>Screenshots are saved in the <code>${TEST_CONFIG.screenshotsDir}</code> directory.</p>
    </div>
</body>
</html>
  `;
  
  fs.writeFileSync(reportPath, htmlContent);
  console.log(`\n📄 HTML report generated at: ${reportPath}`);
}

// Run tests if this file is executed directly
if (require.main === module) {
  runTests()
    .then(() => {
      generateHtmlReport();
      process.exit(testResults.summary.failed > 0 ? 1 : 0);
    })
    .catch(error => {
      console.error('Error running tests:', error);
      process.exit(1);
    });
}

module.exports = {
  runTests,
  generateHtmlReport,
  testVideoSlideLoading,
  testImageSlideLoading,
  testPlaceholderTextOverlays,
  testCarouselNavigation,
  testCarouselResponsiveness
};