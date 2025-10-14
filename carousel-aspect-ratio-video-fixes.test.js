/**
 * Comprehensive Test Suite for Carousel Aspect Ratio and Video Behavior Fixes
 * 
 * This test suite verifies the recent fixes for:
 * 1. Fixed aspect ratio to maintain 3:4 ratio across all viewports
 * 2. Ensured videos have muted and loop attributes set correctly
 * 3. Updated CSS to use aspect-ratio property instead of fixed heights
 */

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

// Test configuration
const TEST_CONFIG = {
  baseUrl: 'http://localhost:4000',
  viewports: {
    mobile: { width: 375, height: 667 },
    tablet: { width: 768, height: 1024 },
    desktop: { width: 1200, height: 800 }
  },
  screenshotsDir: './test-results/carousel-aspect-ratio-screenshots',
  reportPath: './test-results/carousel-aspect-ratio-video-report.json'
};

// Expected aspect ratio (3:4 = 0.75)
const EXPECTED_ASPECT_RATIO = 0.75;
const ASPECT_RATIO_TOLERANCE = 0.05; // Allow 5% tolerance for rounding

// Test results storage
const testResults = {
  timestamp: new Date().toISOString(),
  summary: {
    total: 0,
    passed: 0,
    failed: 0
  },
  tests: []
};

/**
 * Helper function to record test results
 */
function recordTestResult(testName, passed, details = {}) {
  const result = {
    name: testName,
    passed,
    timestamp: new Date().toISOString(),
    ...details
  };
  
  testResults.tests.push(result);
  testResults.summary.total++;
  if (passed) {
    testResults.summary.passed++;
  } else {
    testResults.summary.failed++;
  }
  
  console.log(`${passed ? '✅ PASS' : '❌ FAIL'}: ${testName}`);
  if (!passed && details.error) {
    console.log(`  Error: ${details.error}`);
  }
}

/**
 * Helper function to calculate aspect ratio from dimensions
 */
function calculateAspectRatio(width, height) {
  return width / height;
}

/**
 * Helper function to check if aspect ratio is within tolerance
 */
function isAspectRatioCorrect(aspectRatio) {
  return Math.abs(aspectRatio - EXPECTED_ASPECT_RATIO) <= ASPECT_RATIO_TOLERANCE;
}

/**
 * Test 1: Verify aspect ratio maintenance across different viewports
 */
async function testAspectRatioAcrossViewports(page) {
  console.log('\n🔍 Testing aspect ratio across different viewports...');
  
  for (const [viewportName, viewport] of Object.entries(TEST_CONFIG.viewports)) {
    await page.setViewportSize(viewport);
    await page.goto(`${TEST_CONFIG.baseUrl}/#why-choose-us`);
    
    // Wait for carousel to load
    await page.waitForSelector('.carousel-card', { timeout: 10000 });
    
    // Get all carousel cards
    const cards = await page.$$('.carousel-card');
    
    if (cards.length === 0) {
      recordTestResult(`Aspect Ratio - ${viewportName} - Cards Found`, false, {
        error: `No carousel cards found on ${viewportName}`
      });
      continue;
    }
    
    // Test each card's aspect ratio
    for (let i = 0; i < cards.length; i++) {
      const card = cards[i];
      const boundingBox = await card.boundingBox();
      
      if (!boundingBox) {
        recordTestResult(`Aspect Ratio - ${viewportName} - Card ${i+1} Bounding Box`, false, {
          error: `Could not get bounding box for card ${i+1}`
        });
        continue;
      }
      
      const aspectRatio = calculateAspectRatio(boundingBox.width, boundingBox.height);
      const isCorrect = isAspectRatioCorrect(aspectRatio);
      
      recordTestResult(`Aspect Ratio - ${viewportName} - Card ${i+1}`, isCorrect, {
        expected: EXPECTED_ASPECT_RATIO,
        actual: aspectRatio,
        width: boundingBox.width,
        height: boundingBox.height,
        tolerance: ASPECT_RATIO_TOLERANCE
      });
      
      // Take screenshot for visual verification (with error handling)
      try {
        await page.screenshot({
          path: `${TEST_CONFIG.screenshotsDir}/${viewportName}-card-${i+1}.png`,
          clip: boundingBox
        });
      } catch (screenshotError) {
        console.log(`Warning: Could not take screenshot for ${viewportName}-card-${i+1}: ${screenshotError.message}`);
        // Continue with the test even if screenshot fails
      }
    }
  }
}

/**
 * Test 2: Verify video attributes (muted, loop, autoplay, playsInline)
 */
async function testVideoAttributes(page) {
  console.log('\n🔍 Testing video attributes...');
  
  await page.setViewportSize(TEST_CONFIG.viewports.desktop);
  await page.goto(`${TEST_CONFIG.baseUrl}/#why-choose-us`);
  
  // Wait for carousel to load
  await page.waitForSelector('.carousel-card', { timeout: 10000 });
  
  // Find video elements
  const videos = await page.$$('video');
  
  if (videos.length === 0) {
    recordTestResult('Video Elements Found', false, {
      error: 'No video elements found in carousel'
    });
    return;
  }
  
  recordTestResult('Video Elements Found', true, {
    count: videos.length
  });
  
  // Test each video element
  for (let i = 0; i < videos.length; i++) {
    const video = videos[i];
    
    // Check muted attribute
    const isMuted = await video.evaluate(el => el.muted);
    recordTestResult(`Video ${i+1} - Muted Attribute`, isMuted, {
      expected: true,
      actual: isMuted
    });
    
    // Check loop attribute
    const hasLoop = await video.evaluate(el => el.loop);
    recordTestResult(`Video ${i+1} - Loop Attribute`, hasLoop, {
      expected: true,
      actual: hasLoop
    });
    
    // Check autoplay attribute
    const hasAutoplay = await video.evaluate(el => el.autoplay);
    recordTestResult(`Video ${i+1} - Autoplay Attribute`, hasAutoplay, {
      expected: true,
      actual: hasAutoplay
    });
    
    // Check playsInline attribute
    const hasPlaysInline = await video.evaluate(el => el.playsInline);
    recordTestResult(`Video ${i+1} - PlaysInline Attribute`, hasPlaysInline, {
      expected: true,
      actual: hasPlaysInline
    });
    
    // Check if video is actually playing (after a short delay)
    await page.waitForTimeout(2000);
    const isPlaying = await video.evaluate(el => {
      return !el.paused && el.readyState >= 2;
    });
    recordTestResult(`Video ${i+1} - Actually Playing`, isPlaying, {
      expected: true,
      actual: isPlaying
    });
  }
}

/**
 * Test 3: Test responsive behavior and layout issues
 */
async function testResponsiveBehavior(page) {
  console.log('\n🔍 Testing responsive behavior...');
  
  for (const [viewportName, viewport] of Object.entries(TEST_CONFIG.viewports)) {
    await page.setViewportSize(viewport);
    await page.goto(`${TEST_CONFIG.baseUrl}/#why-choose-us`);
    
    // Wait for carousel to load
    await page.waitForSelector('.carousel-card', { timeout: 10000 });
    
    // Check for horizontal overflow
    const body = await page.$('body');
    const bodyBox = await body.boundingBox();
    const pageWidth = viewport.width;
    const hasOverflow = bodyBox && bodyBox.width > pageWidth;
    
    recordTestResult(`Responsive - ${viewportName} - No Horizontal Overflow`, !hasOverflow, {
      viewportWidth: pageWidth,
      bodyWidth: bodyBox?.width,
      hasOverflow
    });
    
    // Check if carousel container fits within viewport
    const carousel = await page.$('.carousel-container-enhanced');
    if (carousel) {
      const carouselBox = await carousel.boundingBox();
      const fitsInViewport = carouselBox && carouselBox.width <= pageWidth;
      
      recordTestResult(`Responsive - ${viewportName} - Carousel Fits`, fitsInViewport, {
        viewportWidth: pageWidth,
        carouselWidth: carouselBox?.width,
        fitsInViewport
      });
    }
    
    // Check for layout shifts
    const initialCards = await page.$$('.carousel-card');
    await page.waitForTimeout(3000); // Wait for any animations
    const finalCards = await page.$$('.carousel-card');
    
    const sameNumberOfCards = initialCards.length === finalCards.length;
    recordTestResult(`Responsive - ${viewportName} - No Layout Shifts`, sameNumberOfCards, {
      initialCards: initialCards.length,
      finalCards: finalCards.length
    });
    
    // Take full page screenshot for visual reference (with error handling)
    try {
      await page.screenshot({
        path: `${TEST_CONFIG.screenshotsDir}/${viewportName}-full-page.png`,
        fullPage: true
      });
    } catch (screenshotError) {
      console.log(`Warning: Could not take full page screenshot for ${viewportName}: ${screenshotError.message}`);
      // Continue with the test even if screenshot fails
    }
  }
}

/**
 * Test 4: Test CSS aspect-ratio property usage
 */
async function testCSSAspectRatioProperty(page) {
  console.log('\n🔍 Testing CSS aspect-ratio property usage...');
  
  await page.setViewportSize(TEST_CONFIG.viewports.desktop);
  await page.goto(`${TEST_CONFIG.baseUrl}/#why-choose-us`);
  
  // Wait for carousel to load
  await page.waitForSelector('.carousel-card', { timeout: 10000 });
  
  // Check if cards are using aspect-ratio CSS property
  const cards = await page.$$('.carousel-card');
  
  for (let i = 0; i < cards.length; i++) {
    const card = cards[i];
    const computedStyle = await card.evaluate(el => {
      return window.getComputedStyle(el);
    });
    
    const hasAspectRatio = computedStyle.aspectRatio && computedStyle.aspectRatio !== 'auto';
    recordTestResult(`CSS Aspect Ratio - Card ${i+1}`, hasAspectRatio, {
      actualValue: computedStyle.aspectRatio
    });
  }
}

/**
 * Test 5: Test video container aspect ratio
 */
async function testVideoContainerAspectRatio(page) {
  console.log('\n🔍 Testing video container aspect ratio...');
  
  await page.setViewportSize(TEST_CONFIG.viewports.desktop);
  await page.goto(`${TEST_CONFIG.baseUrl}/#why-choose-us`);
  
  // Wait for carousel to load
  await page.waitForSelector('.carousel-card', { timeout: 10000 });
  
  // Check video containers
  const videoContainers = await page.$$('.video-container');
  
  if (videoContainers.length === 0) {
    recordTestResult('Video Containers Found', false, {
      error: 'No video containers found'
    });
    return;
  }
  
  recordTestResult('Video Containers Found', true, {
    count: videoContainers.length
  });
  
  // Test each video container's aspect ratio
  for (let i = 0; i < videoContainers.length; i++) {
    const container = videoContainers[i];
    const boundingBox = await container.boundingBox();
    
    if (!boundingBox) {
      recordTestResult(`Video Container ${i+1} - Bounding Box`, false, {
        error: `Could not get bounding box for video container ${i+1}`
      });
      continue;
    }
    
    const aspectRatio = calculateAspectRatio(boundingBox.width, boundingBox.height);
    const isCorrect = isAspectRatioCorrect(aspectRatio);
    
    recordTestResult(`Video Container ${i+1} - Aspect Ratio`, isCorrect, {
      expected: EXPECTED_ASPECT_RATIO,
      actual: aspectRatio,
      width: boundingBox.width,
      height: boundingBox.height
    });
  }
}

/**
 * Main test runner
 */
async function runTests() {
  console.log('🚀 Starting Carousel Aspect Ratio and Video Behavior Tests...\n');
  
  // Create screenshots directory if it doesn't exist
  if (!fs.existsSync(TEST_CONFIG.screenshotsDir)) {
    fs.mkdirSync(TEST_CONFIG.screenshotsDir, { recursive: true });
  }
  
  // Create test results directory if it doesn't exist
  if (!fs.existsSync('./test-results')) {
    fs.mkdirSync('./test-results', { recursive: true });
  }
  
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  try {
    // Run all tests
    await testAspectRatioAcrossViewports(page);
    await testVideoAttributes(page);
    await testResponsiveBehavior(page);
    await testCSSAspectRatioProperty(page);
    await testVideoContainerAspectRatio(page);
    
    // Generate test report
    const reportContent = JSON.stringify(testResults, null, 2);
    fs.writeFileSync(TEST_CONFIG.reportPath, reportContent);
    
    // Print summary
    console.log('\n📊 Test Summary:');
    console.log(`Total Tests: ${testResults.summary.total}`);
    console.log(`Passed: ${testResults.summary.passed}`);
    console.log(`Failed: ${testResults.summary.failed}`);
    console.log(`Success Rate: ${((testResults.summary.passed / testResults.summary.total) * 100).toFixed(2)}%`);
    console.log(`\n📸 Screenshots saved to: ${TEST_CONFIG.screenshotsDir}`);
    console.log(`📄 Report saved to: ${TEST_CONFIG.reportPath}`);
    
  } catch (error) {
    console.error('❌ Test execution failed:', error);
    recordTestResult('Test Execution', false, { error: error.message });
  } finally {
    await browser.close();
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  runTests().catch(console.error);
}

module.exports = {
  runTests,
  testAspectRatioAcrossViewports,
  testVideoAttributes,
  testResponsiveBehavior,
  testCSSAspectRatioProperty,
  testVideoContainerAspectRatio
};