/**
 * Comprehensive Test Suite for Video Scaling Fix
 * Tests the Zero Risk card 4:5 aspect ratio implementation
 * and ensures other cards maintain 9:16 aspect ratio
 */

const { chromium, firefox, webkit } = require('playwright');
const { expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

// Configuration
const BASE_URL = 'http://localhost:3001';
const TEST_RESULTS_DIR = 'test-results';
const SCREENSHOTS_DIR = path.join(TEST_RESULTS_DIR, 'screenshots', 'video-scaling');

// Ensure directories exist
if (!fs.existsSync(TEST_RESULTS_DIR)) fs.mkdirSync(TEST_RESULTS_DIR, { recursive: true });
if (!fs.existsSync(SCREENSHOTS_DIR)) fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });

// Test utilities
const utils = {
  async wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  },

  async getComputedStyle(element, property) {
    return await element.evaluate((el, prop) => {
      return window.getComputedStyle(el).getPropertyValue(prop);
    }, property);
  },

  async getComputedDimensions(element) {
    return await element.evaluate(el => {
      const rect = el.getBoundingClientRect();
      return {
        width: rect.width,
        height: rect.height,
        aspectRatio: rect.width / rect.height
      };
    });
  },

  async scrollIntoViewAndWait(element, page) {
    await element.scrollIntoViewIfNeeded();
    await this.wait(500); // Wait for any animations
  },

  async takeScreenshot(page, name, browserType) {
    const timestamp = new Date().getTime();
    const filename = `${name}-${browserType}-${timestamp}.png`;
    const filepath = path.join(SCREENSHOTS_DIR, filename);
    await page.screenshot({ path: filepath, fullPage: false });
    return filepath;
  },

  async navigateToWhyChooseUs(page) {
    await page.goto(BASE_URL);
    await page.waitForSelector('#why-choose-us', { timeout: 10000 });
    await page.evaluate(() => {
      document.getElementById('why-choose-us').scrollIntoView({ behavior: 'smooth' });
    });
    await this.wait(1000); // Wait for scroll and animations
  },

  async waitForVideoLoad(page) {
    // Wait for the video element to be loaded and playing
    await page.waitForFunction(() => {
      const video = document.querySelector('.carousel-card-zero-risk video');
      return video && video.readyState >= 2;
    }, { timeout: 5000 });
    await this.wait(500);
  }
};

// Test data
const breakpoints = [
  { name: 'mobile', width: 375, height: 667 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'desktop', width: 1200, height: 800 }
];

const browsers = ['chromium', 'firefox', 'webkit'];

// Test suites
const testSuites = {
  aspectRatioVerification: {
    name: 'Aspect Ratio Verification',
    tests: [
      async function zeroRiskCardAspectRatio(page, browserType) {
        console.log(`Testing Zero Risk card aspect ratio on ${browserType}`);
        await utils.navigateToWhyChooseUs(page);
        await utils.waitForVideoLoad(page);
        
        // Find the Zero Risk card
        const zeroRiskCard = page.locator('.carousel-card-zero-risk').first();
        await expect(zeroRiskCard).toBeVisible();
        
        // Get computed dimensions
        const dimensions = await utils.getComputedDimensions(zeroRiskCard);
        const aspectRatio = dimensions.aspectRatio;
        
        // Expected 4:5 aspect ratio (0.8)
        const expectedRatio = 4 / 5;
        const tolerance = 0.05; // 5% tolerance
        
        console.log(`Zero Risk card dimensions: ${dimensions.width}x${dimensions.height}`);
        console.log(`Actual aspect ratio: ${aspectRatio}, Expected: ${expectedRatio}`);
        
        // Assert aspect ratio is within tolerance
        expect(Math.abs(aspectRatio - expectedRatio)).toBeLessThan(tolerance);
        
        // Check CSS aspect-ratio property
        const cssAspectRatio = await utils.getComputedStyle(zeroRiskCard, 'aspect-ratio');
        console.log(`CSS aspect-ratio property: ${cssAspectRatio}`);
        
        return {
          passed: Math.abs(aspectRatio - expectedRatio) < tolerance,
          details: {
            dimensions,
            aspectRatio,
            expectedRatio,
            cssAspectRatio
          }
        };
      },
      
      async function standardCardAspectRatio(page, browserType) {
        console.log(`Testing standard card aspect ratio on ${browserType}`);
        await utils.navigateToWhyChooseUs(page);
        
        // Navigate to a standard card (not Zero Risk)
        await page.click('[aria-label="Go to next slide"]');
        await utils.wait(500);
        
        // Find a standard card
        const standardCard = page.locator('.carousel-card-standard').first();
        await expect(standardCard).toBeVisible();
        
        // Get computed dimensions
        const dimensions = await utils.getComputedDimensions(standardCard);
        const aspectRatio = dimensions.aspectRatio;
        
        // Expected 9:16 aspect ratio (0.5625)
        const expectedRatio = 9 / 16;
        const tolerance = 0.05; // 5% tolerance
        
        console.log(`Standard card dimensions: ${dimensions.width}x${dimensions.height}`);
        console.log(`Actual aspect ratio: ${aspectRatio}, Expected: ${expectedRatio}`);
        
        // Assert aspect ratio is within tolerance
        expect(Math.abs(aspectRatio - expectedRatio)).toBeLessThan(tolerance);
        
        // Check CSS aspect-ratio property
        const cssAspectRatio = await utils.getComputedStyle(standardCard, 'aspect-ratio');
        console.log(`CSS aspect-ratio property: ${cssAspectRatio}`);
        
        return {
          passed: Math.abs(aspectRatio - expectedRatio) < tolerance,
          details: {
            dimensions,
            aspectRatio,
            expectedRatio,
            cssAspectRatio
          }
        };
      }
    ]
  },
  
  videoDisplayVerification: {
    name: 'Video Display Verification',
    tests: [
      async function videoVisibilityAndContainment(page, browserType) {
        console.log(`Testing video visibility and containment on ${browserType}`);
        await utils.navigateToWhyChooseUs(page);
        await utils.waitForVideoLoad(page);
        
        // Find the video element in Zero Risk card
        const videoElement = page.locator('.carousel-card-zero-risk video').first();
        await expect(videoElement).toBeVisible();
        
        // Check object-fit property
        const objectFit = await utils.getComputedStyle(videoElement, 'object-fit');
        console.log(`Video object-fit: ${objectFit}`);
        expect(objectFit).toBe('contain');
        
        // Check video is fully contained within its container
        const videoContainer = page.locator('.carousel-card-zero-risk .video-container').first();
        const videoDimensions = await utils.getComputedDimensions(videoElement);
        const containerDimensions = await utils.getComputedDimensions(videoContainer);
        
        console.log(`Video dimensions: ${videoDimensions.width}x${videoDimensions.height}`);
        console.log(`Container dimensions: ${containerDimensions.width}x${containerDimensions.height}`);
        
        // Video should not exceed container dimensions
        expect(videoDimensions.width).toBeLessThanOrEqual(containerDimensions.width + 1);
        expect(videoDimensions.height).toBeLessThanOrEqual(containerDimensions.height + 1);
        
        return {
          passed: objectFit === 'contain' && 
                  videoDimensions.width <= containerDimensions.width &&
                  videoDimensions.height <= containerDimensions.height,
          details: {
            objectFit,
            videoDimensions,
            containerDimensions
          }
        };
      },
      
      async function videoCentering(page, browserType) {
        console.log(`Testing video centering on ${browserType}`);
        await utils.navigateToWhyChooseUs(page);
        await utils.waitForVideoLoad(page);
        
        // Find the video element and its container
        const videoElement = page.locator('.carousel-card-zero-risk video').first();
        const videoContainer = page.locator('.carousel-card-zero-risk .video-container').first();
        
        // Get positions
        const videoPosition = await videoElement.evaluate(el => {
          const rect = el.getBoundingClientRect();
          return { top: rect.top, left: rect.left };
        });
        
        const containerPosition = await videoContainer.evaluate(el => {
          const rect = el.getBoundingClientRect();
          return { top: rect.top, left: rect.left };
        });
        
        const videoDimensions = await utils.getComputedDimensions(videoElement);
        const containerDimensions = await utils.getComputedDimensions(videoContainer);
        
        // Calculate expected center position
        const expectedTop = containerPosition.top + (containerDimensions.height - videoDimensions.height) / 2;
        const expectedLeft = containerPosition.left + (containerDimensions.width - videoDimensions.width) / 2;
        
        // Check if video is centered (with tolerance)
        const topTolerance = 5;
        const leftTolerance = 5;
        
        expect(Math.abs(videoPosition.top - expectedTop)).toBeLessThan(topTolerance);
        expect(Math.abs(videoPosition.left - expectedLeft)).toBeLessThan(leftTolerance);
        
        return {
          passed: Math.abs(videoPosition.top - expectedTop) < topTolerance &&
                  Math.abs(videoPosition.left - expectedLeft) < leftTolerance,
          details: {
            videoPosition,
            containerPosition,
            expectedTop,
            expectedLeft,
            videoDimensions,
            containerDimensions
          }
        };
      }
    ]
  },
  
  responsiveDesignVerification: {
    name: 'Responsive Design Verification',
    tests: [
      async function mobileView(page, browserType) {
        console.log(`Testing mobile view on ${browserType}`);
        const { width, height } = breakpoints.find(b => b.name === 'mobile');
        await page.setViewportSize({ width, height });
        
        await utils.navigateToWhyChooseUs(page);
        await utils.waitForVideoLoad(page);
        
        // Check Zero Risk card dimensions
        const zeroRiskCard = page.locator('.carousel-card-zero-risk').first();
        const cardDimensions = await utils.getComputedDimensions(zeroRiskCard);
        
        // On mobile, card should use mobile dimensions
        const expectedWidth = width * 0.85; // 85vw
        const expectedHeight = expectedWidth * 1.25; // 4:5 aspect ratio
        
        console.log(`Mobile Zero Risk card dimensions: ${cardDimensions.width}x${cardDimensions.height}`);
        console.log(`Expected dimensions: ${expectedWidth}x${expectedHeight}`);
        
        // Allow for small rounding differences
        expect(Math.abs(cardDimensions.width - expectedWidth)).toBeLessThan(10);
        expect(Math.abs(cardDimensions.height - expectedHeight)).toBeLessThan(10);
        
        return {
          passed: Math.abs(cardDimensions.width - expectedWidth) < 10 &&
                  Math.abs(cardDimensions.height - expectedHeight) < 10,
          details: {
            cardDimensions,
            expectedWidth,
            expectedHeight,
            viewport: { width, height }
          }
        };
      },
      
      async function tabletView(page, browserType) {
        console.log(`Testing tablet view on ${browserType}`);
        const { width, height } = breakpoints.find(b => b.name === 'tablet');
        await page.setViewportSize({ width, height });
        
        await utils.navigateToWhyChooseUs(page);
        await utils.waitForVideoLoad(page);
        
        // Check Zero Risk card dimensions
        const zeroRiskCard = page.locator('.carousel-card-zero-risk').first();
        const cardDimensions = await utils.getComputedDimensions(zeroRiskCard);
        
        // On tablet, card should use tablet dimensions
        const expectedWidth = width * 0.45; // 45vw
        const expectedHeight = expectedWidth * 1.25; // 4:5 aspect ratio
        
        console.log(`Tablet Zero Risk card dimensions: ${cardDimensions.width}x${cardDimensions.height}`);
        console.log(`Expected dimensions: ${expectedWidth}x${expectedHeight}`);
        
        // Allow for small rounding differences
        expect(Math.abs(cardDimensions.width - expectedWidth)).toBeLessThan(10);
        expect(Math.abs(cardDimensions.height - expectedHeight)).toBeLessThan(10);
        
        return {
          passed: Math.abs(cardDimensions.width - expectedWidth) < 10 &&
                  Math.abs(cardDimensions.height - expectedHeight) < 10,
          details: {
            cardDimensions,
            expectedWidth,
            expectedHeight,
            viewport: { width, height }
          }
        };
      },
      
      async function desktopView(page, browserType) {
        console.log(`Testing desktop view on ${browserType}`);
        const { width, height } = breakpoints.find(b => b.name === 'desktop');
        await page.setViewportSize({ width, height });
        
        await utils.navigateToWhyChooseUs(page);
        await utils.waitForVideoLoad(page);
        
        // Check Zero Risk card dimensions
        const zeroRiskCard = page.locator('.carousel-card-zero-risk').first();
        const cardDimensions = await utils.getComputedDimensions(zeroRiskCard);
        
        // On desktop, card should use desktop dimensions
        const expectedWidth = width * 0.30; // 30vw
        const expectedHeight = expectedWidth * 1.25; // 4:5 aspect ratio
        
        console.log(`Desktop Zero Risk card dimensions: ${cardDimensions.width}x${cardDimensions.height}`);
        console.log(`Expected dimensions: ${expectedWidth}x${expectedHeight}`);
        
        // Allow for small rounding differences
        expect(Math.abs(cardDimensions.width - expectedWidth)).toBeLessThan(10);
        expect(Math.abs(cardDimensions.height - expectedHeight)).toBeLessThan(10);
        
        return {
          passed: Math.abs(cardDimensions.width - expectedWidth) < 10 &&
                  Math.abs(cardDimensions.height - expectedHeight) < 10,
          details: {
            cardDimensions,
            expectedWidth,
            expectedHeight,
            viewport: { width, height }
          }
        };
      }
    ]
  },
  
  functionalityVerification: {
    name: 'Functionality Verification',
    tests: [
      async function carouselNavigation(page, browserType) {
        console.log(`Testing carousel navigation on ${browserType}`);
        await utils.navigateToWhyChooseUs(page);
        
        // Get initial slide
        const initialSlide = await page.getAttribute('.carousel-card-zero-risk', 'class');
        
        // Navigate to next slide
        await page.click('[aria-label="Go to next slide"]');
        await utils.wait(500);
        
        // Navigate to previous slide
        await page.click('[aria-label="Go to previous slide"]');
        await utils.wait(500);
        
        // Check if we're back to the Zero Risk card
        const currentSlide = await page.getAttribute('.carousel-card-zero-risk', 'class');
        
        // Verify navigation worked
        expect(currentSlide).toBeTruthy();
        
        // Test clicking on a slide
        const standardCard = page.locator('.carousel-card-standard').first();
        await standardCard.click();
        await utils.wait(500);
        
        // Verify the slide changed
        const isActive = await standardCard.evaluate(el => {
          return window.getComputedStyle(el).opacity === '1';
        });
        
        expect(isActive).toBeTruthy();
        
        return {
          passed: true,
          details: {
            navigation: 'Carousel navigation working correctly'
          }
        };
      },
      
      async function textReadability(page, browserType) {
        console.log(`Testing text readability on ${browserType}`);
        await utils.navigateToWhyChooseUs(page);
        await utils.waitForVideoLoad(page);
        
        // Check text elements in Zero Risk card
        const title = page.locator('.carousel-card-zero-risk h2').first();
        const description = page.locator('.carousel-card-zero-risk p').first();
        
        await expect(title).toBeVisible();
        await expect(description).toBeVisible();
        
        // Check text styles for readability
        const titleColor = await utils.getComputedStyle(title, 'color');
        const titleShadow = await utils.getComputedStyle(title, 'text-shadow');
        const descriptionColor = await utils.getComputedStyle(description, 'color');
        const descriptionShadow = await utils.getComputedStyle(description, 'text-shadow');
        
        console.log(`Title text color: ${titleColor}`);
        console.log(`Title text shadow: ${titleShadow}`);
        console.log(`Description text color: ${descriptionColor}`);
        console.log(`Description text shadow: ${descriptionShadow}`);
        
        // Check for text shadow or sufficient contrast
        const hasTextShadow = titleShadow !== 'none' || descriptionShadow !== 'none';
        const isWhiteText = titleColor.includes('255') || descriptionColor.includes('255');
        
        expect(hasTextShadow || isWhiteText).toBeTruthy();
        
        return {
          passed: hasTextShadow || isWhiteText,
          details: {
            titleColor,
            titleShadow,
            descriptionColor,
            descriptionShadow,
            hasTextShadow,
            isWhiteText
          }
        };
      }
    ]
  },
  
  crossBrowserCompatibility: {
    name: 'Cross-browser Compatibility',
    tests: [
      async function aspectRatioSupport(page, browserType) {
        console.log(`Testing aspect-ratio support on ${browserType}`);
        await utils.navigateToWhyChooseUs(page);
        
        // Check if aspect-ratio is supported
        const supportsAspectRatio = await page.evaluate(() => {
          return CSS.supports('aspect-ratio', '4/5');
        });
        
        console.log(`Browser ${browserType} supports aspect-ratio: ${supportsAspectRatio}`);
        
        if (supportsAspectRatio) {
          // Check if aspect-ratio is applied
          const zeroRiskCard = page.locator('.carousel-card-zero-risk').first();
          const cssAspectRatio = await utils.getComputedStyle(zeroRiskCard, 'aspect-ratio');
          console.log(`CSS aspect-ratio: ${cssAspectRatio}`);
          
          // Should be either '4/5' or '0.8' depending on browser
          const isValidAspectRatio = cssAspectRatio === '4/5' || 
                                   cssAspectRatio === '0.8' || 
                                   cssAspectRatio.includes('0.8');
          
          expect(isValidAspectRatio).toBeTruthy();
        } else {
          // Check fallback height is applied
          const zeroRiskCard = page.locator('.carousel-card-zero-risk').first();
          const height = await utils.getComputedStyle(zeroRiskCard, 'height');
          console.log(`Fallback height applied: ${height}`);
          
          // Height should be set as a calculated value
          expect(height).not.toBe('auto');
        }
        
        return {
          passed: true,
          details: {
            supportsAspectRatio,
            browserType
          }
        };
      }
    ]
  }
};

// Main test runner
async function runTests() {
  console.log('Starting comprehensive video scaling tests...\n');
  
  const results = {
    timestamp: new Date().toISOString(),
    summary: {
      totalTests: 0,
      passedTests: 0,
      failedTests: 0
    },
    results: {}
  };
  
  for (const browser of browsers) {
    console.log(`\n========== Testing on ${browser.toUpperCase()} ==========`);
    results.results[browser] = {
      tests: [],
      screenshots: []
    };
    
    let browserInstance;
    try {
      if (browser === 'chromium') browserInstance = await chromium.launch();
      else if (browser === 'firefox') browserInstance = await firefox.launch();
      else if (browser === 'webkit') browserInstance = await webkit.launch();
      
      const context = await browserInstance.newContext();
      const page = await context.newPage();
      
      // Run all test suites
      for (const [suiteKey, suite] of Object.entries(testSuites)) {
        console.log(`\n--- Running ${suite.name} ---`);
        
        for (const test of suite.tests) {
          const testName = test.name;
          console.log(`Running test: ${testName}`);
          
          try {
            const result = await test(page, browser);
            results.summary.totalTests++;
            
            if (result.passed) {
              console.log(`✅ PASSED: ${testName}`);
              results.summary.passedTests++;
            } else {
              console.log(`❌ FAILED: ${testName}`);
              results.summary.failedTests++;
            }
            
            results.results[browser].tests.push({
              suite: suite.name,
              name: testName,
              passed: result.passed,
              details: result.details
            });
            
            // Take screenshot for visual verification
            const screenshotPath = await utils.takeScreenshot(
              page, 
              `${testName.replace(/\s+/g, '-').toLowerCase()}`,
              browser
            );
            results.results[browser].screenshots.push(screenshotPath);
            
          } catch (error) {
            console.log(`❌ ERROR in ${testName}: ${error.message}`);
            results.summary.totalTests++;
            results.summary.failedTests++;
            
            results.results[browser].tests.push({
              suite: suite.name,
              name: testName,
              passed: false,
              error: error.message
            });
          }
        }
      }
      
      await context.close();
      await browserInstance.close();
      
    } catch (error) {
      console.log(`❌ Browser ${browser} failed to launch: ${error.message}`);
    }
  }
  
  // Generate report
  const reportPath = path.join(TEST_RESULTS_DIR, 'video-scaling-test-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(results, null, 2));
  
  console.log('\n========== Test Summary ==========');
  console.log(`Total tests: ${results.summary.totalTests}`);
  console.log(`Passed: ${results.summary.passedTests}`);
  console.log(`Failed: ${results.summary.failedTests}`);
  console.log(`Success rate: ${((results.summary.passedTests / results.summary.totalTests) * 100).toFixed(2)}%`);
  console.log(`Report saved to: ${reportPath}`);
  
  return results;
}

// Run tests if this file is executed directly
if (require.main === module) {
  runTests().catch(console.error);
}

module.exports = { runTests, testSuites, utils };