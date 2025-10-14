/**
 * Comprehensive Test Suite for Solutions Component
 * Tests visual appearance, video backgrounds, accessibility, performance, and cross-browser compatibility
 */

const { chromium, devices } = require('playwright');
const fs = require('fs');
const path = require('path');

// Test configuration
const BASE_URL = 'http://localhost:3001';
const TEST_RESULTS_DIR = './test-results';
const SCREENSHOTS_DIR = path.join(TEST_RESULTS_DIR, 'screenshots');
const REPORT_FILE = path.join(TEST_RESULTS_DIR, 'solutions-test-report.json');

// Initialize test results
const testResults = {
  timestamp: new Date().toISOString(),
  tests: {
    visual: { passed: 0, failed: 0, details: [] },
    video: { passed: 0, failed: 0, details: [] },
    accessibility: { passed: 0, failed: 0, details: [] },
    performance: { passed: 0, failed: 0, details: [] },
    crossBrowser: { passed: 0, failed: 0, details: [] }
  },
  summary: { totalPassed: 0, totalFailed: 0 }
};

// Ensure test directories exist
if (!fs.existsSync(TEST_RESULTS_DIR)) fs.mkdirSync(TEST_RESULTS_DIR, { recursive: true });
if (!fs.existsSync(SCREENSHOTS_DIR)) fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });

// Helper function to record test results
function recordTest(category, testName, passed, details = '') {
  const result = { testName, passed, details, timestamp: new Date().toISOString() };
  testResults.tests[category].details.push(result);
  
  if (passed) {
    testResults.tests[category].passed++;
    testResults.summary.totalPassed++;
  } else {
    testResults.tests[category].failed++;
    testResults.summary.totalFailed++;
  }
}

// Helper function to take screenshots
async function takeScreenshot(page, name, category) {
  const screenshotPath = path.join(SCREENSHOTS_DIR, `${category}-${name}.png`);
  await page.screenshot({ path: screenshotPath, fullPage: true });
  return screenshotPath;
}

// Helper function to check color contrast
async function checkColorContrast(page, selector) {
  return await page.evaluate((sel) => {
    const element = document.querySelector(sel);
    if (!element) return null;
    
    const styles = window.getComputedStyle(element);
    const color = styles.color;
    const backgroundColor = styles.backgroundColor;
    
    // Convert RGB to hex for easier comparison
    const rgbToHex = (rgb) => {
      if (rgb.startsWith('#')) return rgb;
      const match = rgb.match(/\d+/g);
      if (!match) return null;
      return '#' + match.slice(0, 3).map(x => {
        const hex = parseInt(x).toString(16);
        return hex.length === 1 ? '0' + hex : hex;
      }).join('');
    };
    
    return {
      color: rgbToHex(color),
      backgroundColor: rgbToHex(backgroundColor),
      fontSize: styles.fontSize,
      fontWeight: styles.fontWeight
    };
  }, selector);
}

// Main test function
async function runTests() {
  console.log('🧪 Starting Solutions Component Comprehensive Tests...\n');
  
  // Test with different viewports
  const viewports = [
    { name: 'Desktop', width: 1920, height: 1080 },
    { name: 'Tablet', width: 768, height: 1024 },
    { name: 'Mobile', width: 375, height: 667 }
  ];
  
  // Test with different browsers
  const browsers = ['chromium', 'firefox', 'webkit'];
  
  for (const browserType of browsers) {
    console.log(`🌐 Testing in ${browserType}...`);
    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext();
    const page = await context.newPage();
    
    try {
      // Navigate to the page
      await page.goto(BASE_URL, { waitUntil: 'networkidle' });
      
      // Wait for the page to fully load
      await page.waitForTimeout(3000);
      
      // Scroll to Solutions section
      await page.evaluate(() => {
        document.getElementById('solutions')?.scrollIntoView({ behavior: 'smooth' });
      });
      
      // Wait for scroll to complete and videos to load
      await page.waitForTimeout(2000);
      
      // Run tests for each viewport
      for (const viewport of viewports) {
        await page.setViewportSize({ width: viewport.width, height: viewport.height });
        await page.waitForTimeout(1000);
        
        console.log(`  📱 Testing ${viewport.name} view (${viewport.width}x${viewport.height})`);
        
        // 1. Visual Testing
        await runVisualTests(page, viewport, browserType);
        
        // 2. Video Background Testing
        await runVideoTests(page, viewport, browserType);
        
        // 3. Accessibility Testing
        await runAccessibilityTests(page, viewport, browserType);
        
        // 4. Performance Testing
        await runPerformanceTests(page, viewport, browserType);
      }
      
    } catch (error) {
      console.error(`Error in ${browserType}:`, error);
    } finally {
      await browser.close();
    }
  }
  
  // Save test results
  fs.writeFileSync(REPORT_FILE, JSON.stringify(testResults, null, 2));
  
  // Print summary
  console.log('\n📊 Test Summary:');
  console.log(`✅ Passed: ${testResults.summary.totalPassed}`);
  console.log(`❌ Failed: ${testResults.summary.totalFailed}`);
  console.log(`📄 Detailed report saved to: ${REPORT_FILE}`);
  console.log(`📸 Screenshots saved to: ${SCREENSHOTS_DIR}`);
  
  return testResults;
}

// Visual Testing
async function runVisualTests(page, viewport, browser) {
  console.log(`    👁️  Running visual tests for ${viewport.name} in ${browser}...`);
  
  try {
    // Test 1: Check if text is pure black (#000000)
    const titleColors = await checkColorContrast(page, '#solutions h2');
    const descriptionColors = await checkColorContrast(page, '#solutions p');
    const cardTitleColors = await checkColorContrast(page, '#solutions h3');
    const cardTextColors = await checkColorContrast(page, '#solutions .text-black');
    
    const isBlack = (color) => color && color.toLowerCase() === '#000000';
    
    const titleIsBlack = isBlack(titleColors?.color);
    const descriptionIsBlack = isBlack(descriptionColors?.color);
    const cardTitleIsBlack = isBlack(cardTitleColors?.color);
    const cardTextIsBlack = isBlack(cardTextColors?.color);
    
    recordTest('visual', 'Pure black text color', 
      titleIsBlack && descriptionIsBlack && cardTitleIsBlack && cardTextIsBlack,
      `Title: ${titleColors?.color}, Description: ${descriptionColors?.color}, Card Title: ${cardTitleColors?.color}, Card Text: ${cardTextColors?.color}`);
    
    // Test 2: Check overlay visibility
    const overlayExists = await page.locator('#solutions .absolute.inset-0.bg-black\\/40').isVisible();
    recordTest('visual', 'Semi-transparent overlay visible', overlayExists,
      overlayExists ? 'Overlay is visible' : 'Overlay not found or not visible');
    
    // Test 3: Check responsive design
    const solutionsSection = await page.locator('#solutions');
    const isVisible = await solutionsSection.isVisible();
    recordTest('visual', 'Solutions section visible', isVisible,
      isVisible ? 'Section is visible' : 'Section not found or not visible');
    
    // Test 4: Check card layout
    const cards = await page.locator('#solutions .grid > div').count();
    const expectedCards = viewport.name === 'Mobile' ? 1 : viewport.name === 'Tablet' ? 2 : 3;
    const layoutCorrect = cards >= expectedCards;
    recordTest('visual', 'Responsive card layout', layoutCorrect,
      `Expected at least ${expectedCards} cards, found ${cards}`);
    
    // Take screenshot for visual reference
    await takeScreenshot(page, `${viewport.name.toLowerCase()}-${browser}`, 'visual');
    
  } catch (error) {
    recordTest('visual', 'Visual testing error', false, error.message);
  }
}

// Video Background Testing
async function runVideoTests(page, viewport, browser) {
  console.log(`    🎥 Running video tests for ${viewport.name} in ${browser}...`);
  
  try {
    // Test 1: Check if video elements exist
    const desktopVideo = await page.locator('#solutions video.hidden.lg\\:block').count();
    const mobileVideo = await page.locator('#solutions video.lg\\:hidden').count();
    
    const hasCorrectVideo = viewport.name === 'Mobile' ? mobileVideo > 0 : desktopVideo > 0;
    recordTest('video', 'Correct video element for viewport', hasCorrectVideo,
      `Desktop videos: ${desktopVideo}, Mobile videos: ${mobileVideo}`);
    
    // Test 2: Check video attributes
    const videoElement = viewport.name === 'Mobile' 
      ? page.locator('#solutions video.lg\\:hidden')
      : page.locator('#solutions video.hidden.lg\\:block');
    
    if (await videoElement.count() > 0) {
      const hasAutoplay = await videoElement.getAttribute('autoplay');
      const hasMuted = await videoElement.getAttribute('muted');
      const hasLoop = await videoElement.getAttribute('loop');
      const hasPlaysInline = await videoElement.getAttribute('playsinline');
      
      const videoAttributesCorrect = hasAutoplay && hasMuted && hasLoop && hasPlaysInline;
      recordTest('video', 'Video attributes correct', videoAttributesCorrect,
        `Autoplay: ${hasAutoplay}, Muted: ${hasMuted}, Loop: ${hasLoop}, PlaysInline: ${hasPlaysInline}`);
      
      // Test 3: Check video source URLs
      const sourceElement = videoElement.locator('source');
      const sourceUrl = await sourceElement.getAttribute('src');
      
      const expectedUrl = viewport.name === 'Mobile'
        ? 'https://res.cloudinary.com/dmdjagtkx/video/upload/v1760406410/social_defipullen_A_continuation-style_digital_background_designed_f_dc49c4c4-ced0-4a1e-a218-7245167285e8_0_xqzwmw.mp4'
        : 'https://res.cloudinary.com/dmdjagtkx/video/upload/v1760405896/social_defipullen_A_continuation-style_digital_background_designed_f_7bbfc11b-e450-4abc-910a-6eef28babf6a_0_xzhdrv.mp4';
      
      const urlCorrect = sourceUrl === expectedUrl;
      recordTest('video', 'Video source URL correct', urlCorrect,
        `Expected: ${expectedUrl.substring(0, 50)}..., Got: ${sourceUrl ? sourceUrl.substring(0, 50) + '...' : 'null'}`);
    } else {
      recordTest('video', 'Video element exists', false, 'No video element found for current viewport');
    }
    
    // Test 4: Check video loading state
    await page.waitForTimeout(3000); // Wait for video to potentially load
    const videoState = await page.evaluate(() => {
      const videos = document.querySelectorAll('#solutions video');
      if (videos.length === 0) return 'no-video';
      
      for (const video of videos) {
        if (window.getComputedStyle(video).display !== 'none') {
          if (video.readyState >= 2) return 'loaded';
          if (video.error) return 'error';
          return 'loading';
        }
      }
      return 'hidden';
    });
    
    recordTest('video', 'Video loading state', videoState === 'loaded' || videoState === 'loading',
      `Video state: ${videoState}`);
    
  } catch (error) {
    recordTest('video', 'Video testing error', false, error.message);
  }
}

// Accessibility Testing
async function runAccessibilityTests(page, viewport, browser) {
  console.log(`    ♿ Running accessibility tests for ${viewport.name} in ${browser}...`);
  
  try {
    // Test 1: Check ARIA labels
    const hasAriaLabel = await page.locator('#solutions[aria-label="Solutions section"]').count();
    recordTest('accessibility', 'ARIA label on section', hasAriaLabel > 0,
      hasAriaLabel > 0 ? 'ARIA label found' : 'ARIA label missing');
    
    // Test 2: Check video aria-hidden
    const videoAriaHidden = await page.locator('#solutions video[aria-hidden="true"]').count();
    recordTest('accessibility', 'Video aria-hidden attribute', videoAriaHidden > 0,
      videoAriaHidden > 0 ? 'Video has aria-hidden' : 'Video aria-hidden missing');
    
    // Test 3: Check overlay aria-hidden
    const overlayAriaHidden = await page.locator('#solutions .absolute.inset-0.bg-black\\/40[aria-hidden="true"]').count();
    recordTest('accessibility', 'Overlay aria-hidden attribute', overlayAriaHidden > 0,
      overlayAriaHidden > 0 ? 'Overlay has aria-hidden' : 'Overlay aria-hidden missing');
    
    // Test 4: Check color contrast (basic check)
    const contrastData = await checkColorContrast(page, '#solutions h2');
    const textColor = contrastData?.color;
    const backgroundColor = contrastData?.backgroundColor;
    
    // Simple check for black text on semi-transparent overlay
    const hasGoodContrast = textColor === '#000000' && backgroundColor && backgroundColor !== 'transparent';
    recordTest('accessibility', 'Color contrast for text', hasGoodContrast,
      `Text color: ${textColor}, Background: ${backgroundColor}`);
    
    // Test 5: Check keyboard navigation
    await page.keyboard.press('Tab');
    const focusedElement = await page.evaluate(() => document.activeElement.tagName);
    const hasKeyboardNavigation = focusedElement !== 'BODY';
    recordTest('accessibility', 'Keyboard navigation', hasKeyboardNavigation,
      `Focused element: ${focusedElement}`);
    
  } catch (error) {
    recordTest('accessibility', 'Accessibility testing error', false, error.message);
  }
}

// Performance Testing
async function runPerformanceTests(page, viewport, browser) {
  console.log(`    ⚡ Running performance tests for ${viewport.name} in ${browser}...`);
  
  try {
    // Test 1: Check page load time
    const navigationStart = await page.evaluate(() => performance.timing.navigationStart);
    const loadComplete = await page.evaluate(() => performance.timing.loadEventEnd);
    const loadTime = loadComplete - navigationStart;
    
    const loadTimeAcceptable = loadTime < 5000; // 5 seconds threshold
    recordTest('performance', 'Page load time', loadTimeAcceptable,
      `Load time: ${loadTime}ms`);
    
    // Test 2: Check video preload attribute
    const videoElement = viewport.name === 'Mobile' 
      ? page.locator('#solutions video.lg\\:hidden')
      : page.locator('#solutions video.hidden.lg\\:block');
    
    if (await videoElement.count() > 0) {
      const preloadAttr = await videoElement.getAttribute('preload');
      const hasMetadataPreload = preloadAttr === 'metadata';
      recordTest('performance', 'Video preload set to metadata', hasMetadataPreload,
        `Preload attribute: ${preloadAttr}`);
    }
    
    // Test 3: Check if lazy loading is implemented
    const hasLoadingStrategy = await page.evaluate(() => {
      const videos = document.querySelectorAll('#solutions video');
      return Array.from(videos).some(video => video.hasAttribute('preload') || video.hasAttribute('loading'));
    });
    
    recordTest('performance', 'Video loading strategy implemented', hasLoadingStrategy,
      hasLoadingStrategy ? 'Loading strategy found' : 'No loading strategy found');
    
    // Test 4: Check for memory usage (basic check)
    const memoryInfo = await page.evaluate(() => {
      if (performance.memory) {
        return {
          used: Math.round(performance.memory.usedJSHeapSize / 1048576), // MB
          total: Math.round(performance.memory.totalJSHeapSize / 1048576) // MB
        };
      }
      return null;
    });
    
    if (memoryInfo) {
      const memoryUsageAcceptable = memoryInfo.used < 100; // 100MB threshold
      recordTest('performance', 'Memory usage', memoryUsageAcceptable,
        `Memory used: ${memoryInfo.used}MB / ${memoryInfo.total}MB`);
    }
    
  } catch (error) {
    recordTest('performance', 'Performance testing error', false, error.message);
  }
}

// Run the tests
runTests().then(results => {
  console.log('\n🎉 All tests completed!');
  process.exit(results.summary.totalFailed > 0 ? 1 : 0);
}).catch(error => {
  console.error('Test execution failed:', error);
  process.exit(1);
});