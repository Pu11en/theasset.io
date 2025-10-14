/**
 * Comprehensive Carousel Functionality Test
 * 
 * This test suite verifies that the carousel functionality remains intact after the fixes
 * for 3:4 aspect ratio, text visibility, and card spacing.
 */

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

// Test configuration
const TEST_CONFIG = {
  baseUrl: 'http://localhost:3000', // Adjust if your app runs on a different port
  viewports: {
    mobile: { width: 375, height: 667 },
    tablet: { width: 768, height: 1024 },
    desktop: { width: 1200, height: 800 }
  },
  timeout: 10000,
  screenshotDir: './test-results/carousel-screenshots'
};

// Test results storage
const testResults = {
  navigationArrows: {
    visibility: [],
    positioning: [],
    functionality: [],
    boundaryBehavior: [],
    hoverEffects: []
  },
  swipeGestures: {
    mobile: [],
    tablet: [],
    sensitivity: [],
    momentum: [],
    aspectRatioConstraints: []
  },
  carouselBehavior: {
    transitions: [],
    indicators: [],
    keyboardNavigation: [],
    aspectRatioMaintenance: []
  },
  interactionWithFixes: {
    textOverlayInterference: [],
    cardSpacingEffects: [],
    aspectRatioDuringTransitions: []
  }
};

/**
 * Initialize browser and page
 */
async function initializeBrowser() {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  // Set default timeout
  page.setDefaultTimeout(TEST_CONFIG.timeout);
  
  return { browser, context, page };
}

/**
 * Navigate to the page with carousel
 */
async function navigateToCarouselPage(page) {
  console.log('Navigating to the page with carousel...');
  
  // Navigate to the home page where the carousel should be
  await page.goto(TEST_CONFIG.baseUrl);
  
  // Wait for the page to load
  await page.waitForLoadState('networkidle');
  
  // Scroll to the Why Choose Us section where the carousel is located
  const whyChooseUsSection = await page.locator('#why-choose-us');
  if (await whyChooseUsSection.isVisible()) {
    await whyChooseUsSection.scrollIntoViewIfNeeded();
    await page.waitForTimeout(1000); // Allow animations to complete
  } else {
    throw new Error('Why Choose Us section with carousel not found');
  }
  
  return true;
}

/**
 * Test navigation arrow functionality
 */
async function testNavigationArrows(page, viewportName) {
  console.log(`Testing navigation arrows for ${viewportName} viewport...`);
  
  const results = {
    viewport: viewportName,
    tests: []
  };
  
  try {
    // Check if arrows are visible
    const prevArrow = page.locator('button[title="Go to previous slide"]');
    const nextArrow = page.locator('button[title="Go to next slide"]');
    
    const prevVisible = await prevArrow.isVisible();
    const nextVisible = await nextArrow.isVisible();
    
    results.tests.push({
      name: 'Arrow visibility',
      passed: prevVisible && nextVisible,
      details: `Previous: ${prevVisible}, Next: ${nextVisible}`
    });
    
    // Check arrow positioning
    const prevBox = await prevArrow.boundingBox();
    const nextBox = await nextArrow.boundingBox();
    const carouselBox = await page.locator('.carousel-container-enhanced').boundingBox();
    
    const arrowsPositionedCorrectly = prevBox && nextBox && carouselBox &&
      prevBox.y > carouselBox.y + carouselBox.height - 100 &&
      nextBox.y > carouselBox.y + carouselBox.height - 100;
    
    results.tests.push({
      name: 'Arrow positioning',
      passed: arrowsPositionedCorrectly,
      details: `Arrows positioned below carousel: ${arrowsPositionedCorrectly}`
    });
    
    // Test arrow functionality
    const currentSlide = await page.locator('.carousel-card').nth(0);
    const isActive = await currentSlide.evaluate(el => 
      el.style.transform === 'scale(1) rotateX(0deg)'
    );
    
    // Click next arrow
    await nextArrow.click();
    await page.waitForTimeout(600); // Wait for transition
    
    const nextSlide = await page.locator('.carousel-card').nth(1);
    const isNextActive = await nextSlide.evaluate(el => 
      el.style.transform === 'scale(1) rotateX(0deg)'
    );
    
    results.tests.push({
      name: 'Next arrow functionality',
      passed: isNextActive,
      details: `Next slide activated: ${isNextActive}`
    });
    
    // Click previous arrow
    await prevArrow.click();
    await page.waitForTimeout(600); // Wait for transition
    
    const isCurrentActiveAgain = await currentSlide.evaluate(el => 
      el.style.transform === 'scale(1) rotateX(0deg)'
    );
    
    results.tests.push({
      name: 'Previous arrow functionality',
      passed: isCurrentActiveAgain,
      details: `Current slide reactivated: ${isCurrentActiveAgain}`
    });
    
    // Test boundary behavior (go to first slide from last and vice versa)
    const totalSlides = await page.locator('.carousel-card').count();
    
    // Navigate to last slide
    for (let i = 1; i < totalSlides; i++) {
      await nextArrow.click();
      await page.waitForTimeout(300);
    }
    
    // Now click next to go to first slide
    await nextArrow.click();
    await page.waitForTimeout(600);
    
    const firstSlide = await page.locator('.carousel-card').nth(0);
    const isFirstActive = await firstSlide.evaluate(el => 
      el.style.transform === 'scale(1) rotateX(0deg)'
    );
    
    results.tests.push({
      name: 'Boundary behavior (last to first)',
      passed: isFirstActive,
      details: `First slide activated from last: ${isFirstActive}`
    });
    
    // Test hover effects
    await prevArrow.hover();
    const prevTransformed = await prevArrow.evaluate(el => 
      el.style.transform.includes('translateY(-0.5px)')
    );
    
    await nextArrow.hover();
    const nextTransformed = await nextArrow.evaluate(el => 
      el.style.transform.includes('translateY(-0.5px)')
    );
    
    results.tests.push({
      name: 'Arrow hover effects',
      passed: prevTransformed && nextTransformed,
      details: `Previous hover: ${prevTransformed}, Next hover: ${nextTransformed}`
    });
    
    // Take screenshot for visual verification
    await page.screenshot({ 
      path: `${TEST_CONFIG.screenshotDir}/arrows-${viewportName}.png`,
      fullPage: false
    });
    
  } catch (error) {
    results.tests.push({
      name: 'Navigation arrows test error',
      passed: false,
      details: error.message
    });
  }
  
  return results;
}

/**
 * Test swipe gesture functionality
 */
async function testSwipeGestures(page, viewportName) {
  console.log(`Testing swipe gestures for ${viewportName} viewport...`);
  
  const results = {
    viewport: viewportName,
    tests: []
  };
  
  try {
    // Only test swipe on mobile and tablet viewports
    if (viewportName === 'desktop') {
      results.tests.push({
        name: 'Swipe gestures',
        passed: true,
        details: 'Swipe gestures not applicable for desktop'
      });
      return results;
    }
    
    const carousel = page.locator('.carousel-list-enhanced');
    const carouselBox = await carousel.boundingBox();
    
    if (!carouselBox) {
      throw new Error('Carousel not found for swipe testing');
    }
    
    // Get initial active slide
    const initialSlide = await page.locator('.carousel-card').nth(0);
    const isInitialActive = await initialSlide.evaluate(el => 
      el.style.transform === 'scale(1) rotateX(0deg)'
    );
    
    // Perform swipe left to go to next slide
    const startX = carouselBox.x + carouselBox.width * 0.8;
    const endX = carouselBox.x + carouselBox.width * 0.2;
    const startY = carouselBox.y + carouselBox.height / 2;
    
    await page.touchscreen.tap(startX, startY);
    await page.touchscreen.tap(startX, startY); // Double tap to ensure touch context
    
    // Perform swipe gesture
    await page.mouse.move(startX, startY);
    await page.mouse.down();
    await page.mouse.move(endX, startY, { steps: 10 });
    await page.mouse.up();
    
    await page.waitForTimeout(600); // Wait for transition
    
    // Check if next slide is active
    const nextSlide = await page.locator('.carousel-card').nth(1);
    const isNextActive = await nextSlide.evaluate(el => 
      el.style.transform === 'scale(1) rotateX(0deg)'
    );
    
    results.tests.push({
      name: 'Swipe left functionality',
      passed: isNextActive,
      details: `Next slide activated by swipe: ${isNextActive}`
    });
    
    // Perform swipe right to go back to previous slide
    await page.mouse.move(endX, startY);
    await page.mouse.down();
    await page.mouse.move(startX, startY, { steps: 10 });
    await page.mouse.up();
    
    await page.waitForTimeout(600); // Wait for transition
    
    // Check if initial slide is active again
    const isInitialActiveAgain = await initialSlide.evaluate(el => 
      el.style.transform === 'scale(1) rotateX(0deg)'
    );
    
    results.tests.push({
      name: 'Swipe right functionality',
      passed: isInitialActiveAgain,
      details: `Initial slide reactivated by swipe: ${isInitialActiveAgain}`
    });
    
    // Test swipe sensitivity with smaller gestures
    const smallSwipeStartX = carouselBox.x + carouselBox.width * 0.6;
    const smallSwipeEndX = carouselBox.x + carouselBox.width * 0.4;
    
    await page.mouse.move(smallSwipeStartX, startY);
    await page.mouse.down();
    await page.mouse.move(smallSwipeEndX, startY, { steps: 5 });
    await page.mouse.up();
    
    await page.waitForTimeout(600);
    
    // Check if slide changed (it shouldn't with small swipe)
    const stillInitial = await initialSlide.evaluate(el => 
      el.style.transform === 'scale(1) rotateX(0deg)'
    );
    
    results.tests.push({
      name: 'Swipe sensitivity',
      passed: stillInitial,
      details: `Small swipe did not change slide: ${stillInitial}`
    });
    
    // Take screenshot for visual verification
    await page.screenshot({ 
      path: `${TEST_CONFIG.screenshotDir}/swipe-${viewportName}.png`,
      fullPage: false
    });
    
  } catch (error) {
    results.tests.push({
      name: 'Swipe gestures test error',
      passed: false,
      details: error.message
    });
  }
  
  return results;
}

/**
 * Test carousel behavior
 */
async function testCarouselBehavior(page, viewportName) {
  console.log(`Testing carousel behavior for ${viewportName} viewport...`);
  
  const results = {
    viewport: viewportName,
    tests: []
  };
  
  try {
    // Test slide transitions
    const activeSlide = await page.locator('.carousel-card').filter({ hasText: 'Zero Risk' });
    const initialTransform = await activeSlide.evaluate(el => el.style.transform);
    
    // Click on a different slide
    const targetSlide = await page.locator('.carousel-card').filter({ hasText: 'Expert Team' });
    await targetSlide.click();
    await page.waitForTimeout(600);
    
    const newTransform = await activeSlide.evaluate(el => el.style.transform);
    const targetTransform = await targetSlide.evaluate(el => el.style.transform);
    
    const transitionOccurred = initialTransform !== newTransform && 
      targetTransform === 'scale(1) rotateX(0deg)';
    
    results.tests.push({
      name: 'Slide transitions',
      passed: transitionOccurred,
      details: `Transition completed: ${transitionOccurred}`
    });
    
    // Test keyboard navigation
    await page.keyboard.press('ArrowRight');
    await page.waitForTimeout(600);
    
    const keyboardSlide = await page.locator('.carousel-card').nth(2);
    const isKeyboardSlideActive = await keyboardSlide.evaluate(el => 
      el.style.transform === 'scale(1) rotateX(0deg)'
    );
    
    results.tests.push({
      name: 'Keyboard navigation',
      passed: isKeyboardSlideActive,
      details: `Arrow key navigation works: ${isKeyboardSlideActive}`
    });
    
    // Test tab navigation to arrows
    await page.keyboard.press('Tab');
    await page.waitForTimeout(200);
    
    const arrowFocused = await page.locator('button[title="Go to next slide"]').evaluate(el => 
      document.activeElement === el
    );
    
    results.tests.push({
      name: 'Tab navigation',
      passed: arrowFocused,
      details: `Tab navigation to arrows works: ${arrowFocused}`
    });
    
    // Test aspect ratio maintenance during transitions
    const slideElements = await page.locator('.carousel-card').all();
    
    for (let i = 0; i < Math.min(3, slideElements.length); i++) {
      const slide = slideElements[i];
      const aspectRatio = await slide.evaluate(el => {
        const width = el.offsetWidth;
        const height = el.offsetHeight;
        return Math.abs((width / height) - 0.75) < 0.05; // 3:4 = 0.75, allow 5% tolerance
      });
      
      results.tests.push({
        name: `Aspect ratio maintenance - slide ${i}`,
        passed: aspectRatio,
        details: `Slide ${i} maintains 3:4 ratio: ${aspectRatio}`
      });
    }
    
    // Take screenshot for visual verification
    await page.screenshot({ 
      path: `${TEST_CONFIG.screenshotDir}/behavior-${viewportName}.png`,
      fullPage: false
    });
    
  } catch (error) {
    results.tests.push({
      name: 'Carousel behavior test error',
      passed: false,
      details: error.message
    });
  }
  
  return results;
}

/**
 * Test interaction with recent fixes
 */
async function testInteractionWithFixes(page, viewportName) {
  console.log(`Testing interaction with recent fixes for ${viewportName} viewport...`);
  
  const results = {
    viewport: viewportName,
    tests: []
  };
  
  try {
    // Test text overlay doesn't interfere with navigation
    const textOverlay = page.locator('.carousel-card article');
    const overlayVisible = await textOverlay.isVisible();
    const overlayBoundingBox = await textOverlay.boundingBox();
    
    const overlayNextArrow = page.locator('button[title="Go to next slide"]');
    const arrowBoundingBox = await overlayNextArrow.boundingBox();
    
    const noOverlap = overlayBoundingBox && arrowBoundingBox &&
      (overlayBoundingBox.y + overlayBoundingBox.height < arrowBoundingBox.y);
    
    results.tests.push({
      name: 'Text overlay doesn\'t interfere with navigation',
      passed: noOverlap,
      details: `Text overlay visible: ${overlayVisible}, No overlap: ${noOverlap}`
    });
    
    // Test text visibility
    const textElements = await textOverlay.locator('h2, p').all();
    let textVisible = true;
    
    for (const textEl of textElements) {
      const isVisible = await textEl.isVisible();
      const computedStyle = await textEl.evaluate(el => {
        const style = window.getComputedStyle(el);
        return {
          color: style.color,
          backgroundColor: style.backgroundColor,
          textShadow: style.textShadow,
          opacity: style.opacity
        };
      });
      
      // Check if text has sufficient contrast
      const hasGoodContrast = computedStyle.color !== 'rgba(0, 0, 0, 0)' && 
        parseFloat(computedStyle.opacity) > 0.5;
      
      if (!isVisible || !hasGoodContrast) {
        textVisible = false;
        break;
      }
    }
    
    results.tests.push({
      name: 'Text visibility',
      passed: textVisible,
      details: `All text elements visible: ${textVisible}`
    });
    
    // Test card spacing doesn't affect swipe gestures
    const carouselList = page.locator('.carousel-list-enhanced');
    const carouselListBoundingBox = await carouselList.boundingBox();
    
    if (carouselListBoundingBox) {
      // Try to swipe in the gap between cards
      const gapX = carouselListBoundingBox.x + carouselListBoundingBox.width * 0.2;
      const gapY = carouselListBoundingBox.y + carouselListBoundingBox.height / 2;
      
      const initialSlide = await page.locator('.carousel-card').nth(0);
      const isInitialActive = await initialSlide.evaluate(el => 
        el.style.transform === 'scale(1) rotateX(0deg)'
      );
      
      // Perform swipe from gap
      await page.mouse.move(gapX, gapY);
      await page.mouse.down();
      await page.mouse.move(gapX + 100, gapY, { steps: 5 });
      await page.mouse.up();
      
      await page.waitForTimeout(600);
      
      const nextSlide = await page.locator('.carousel-card').nth(1);
      const isNextActive = await nextSlide.evaluate(el => 
        el.style.transform === 'scale(1) rotateX(0deg)'
      );
      
      results.tests.push({
        name: 'Card spacing doesn\'t affect swipe gestures',
        passed: isNextActive,
        details: `Swipe from gap works: ${isNextActive}`
      });
    }
    
    // Test 3:4 aspect ratio is maintained during transitions
    const activeSlide = await page.locator('.carousel-card').filter({ 
      hasText: 'Zero Risk' 
    });
    
    const initialAspectRatio = await activeSlide.evaluate(el => {
      const width = el.offsetWidth;
      const height = el.offsetHeight;
      return width / height;
    });
    
    // Navigate to next slide
    const aspectNextArrow = page.locator('button[title="Go to next slide"]');
    await aspectNextArrow.click();
    await page.waitForTimeout(600);
    
    const newActiveSlide = await page.locator('.carousel-card').filter({ 
      hasText: 'Expert Team' 
    });
    
    const newAspectRatio = await newActiveSlide.evaluate(el => {
      const width = el.offsetWidth;
      const height = el.offsetHeight;
      return width / height;
    });
    
    const aspectRatioMaintained = Math.abs(initialAspectRatio - 0.75) < 0.05 && 
      Math.abs(newAspectRatio - 0.75) < 0.05;
    
    results.tests.push({
      name: '3:4 aspect ratio maintained during transitions',
      passed: aspectRatioMaintained,
      details: `Initial ratio: ${initialAspectRatio.toFixed(2)}, New ratio: ${newAspectRatio.toFixed(2)}`
    });
    
    // Take screenshot for visual verification
    await page.screenshot({ 
      path: `${TEST_CONFIG.screenshotDir}/fixes-${viewportName}.png`,
      fullPage: false
    });
    
  } catch (error) {
    results.tests.push({
      name: 'Interaction with fixes test error',
      passed: false,
      details: error.message
    });
  }
  
  return results;
}

/**
 * Run all tests for a specific viewport
 */
async function runTestsForViewport(page, viewportName) {
  console.log(`\n======== Running tests for ${viewportName} viewport ========`);
  
  // Set viewport size
  await page.setViewportSize(TEST_CONFIG.viewports[viewportName]);
  await page.waitForTimeout(1000); // Allow for responsive adjustments
  
  const viewportResults = {
    viewport: viewportName,
    navigationArrows: await testNavigationArrows(page, viewportName),
    swipeGestures: await testSwipeGestures(page, viewportName),
    carouselBehavior: await testCarouselBehavior(page, viewportName),
    interactionWithFixes: await testInteractionWithFixes(page, viewportName)
  };
  
  return viewportResults;
}

/**
 * Generate test report
 */
function generateTestReport(allResults) {
  console.log('\n======== CAROUSEL FUNCTIONALITY TEST REPORT ========');
  
  let totalTests = 0;
  let passedTests = 0;
  
  const report = {
    summary: {
      totalTests: 0,
      passedTests: 0,
      failedTests: 0,
      passRate: 0
    },
    viewports: {},
    issues: [],
    recommendations: []
  };
  
  for (const viewportResult of allResults) {
    const viewportName = viewportResult.viewport;
    report.viewports[viewportName] = {
      navigationArrows: { passed: 0, failed: 0, tests: [] },
      swipeGestures: { passed: 0, failed: 0, tests: [] },
      carouselBehavior: { passed: 0, failed: 0, tests: [] },
      interactionWithFixes: { passed: 0, failed: 0, tests: [] }
    };
    
    // Process navigation arrows tests
    for (const test of viewportResult.navigationArrows.tests) {
      totalTests++;
      if (test.passed) {
        passedTests++;
        report.viewports[viewportName].navigationArrows.passed++;
      } else {
        report.viewports[viewportName].navigationArrows.failed++;
        report.issues.push({
          viewport: viewportName,
          category: 'Navigation Arrows',
          test: test.name,
          details: test.details
        });
      }
      report.viewports[viewportName].navigationArrows.tests.push(test);
    }
    
    // Process swipe gestures tests
    for (const test of viewportResult.swipeGestures.tests) {
      totalTests++;
      if (test.passed) {
        passedTests++;
        report.viewports[viewportName].swipeGestures.passed++;
      } else {
        report.viewports[viewportName].swipeGestures.failed++;
        report.issues.push({
          viewport: viewportName,
          category: 'Swipe Gestures',
          test: test.name,
          details: test.details
        });
      }
      report.viewports[viewportName].swipeGestures.tests.push(test);
    }
    
    // Process carousel behavior tests
    for (const test of viewportResult.carouselBehavior.tests) {
      totalTests++;
      if (test.passed) {
        passedTests++;
        report.viewports[viewportName].carouselBehavior.passed++;
      } else {
        report.viewports[viewportName].carouselBehavior.failed++;
        report.issues.push({
          viewport: viewportName,
          category: 'Carousel Behavior',
          test: test.name,
          details: test.details
        });
      }
      report.viewports[viewportName].carouselBehavior.tests.push(test);
    }
    
    // Process interaction with fixes tests
    for (const test of viewportResult.interactionWithFixes.tests) {
      totalTests++;
      if (test.passed) {
        passedTests++;
        report.viewports[viewportName].interactionWithFixes.passed++;
      } else {
        report.viewports[viewportName].interactionWithFixes.failed++;
        report.issues.push({
          viewport: viewportName,
          category: 'Interaction with Fixes',
          test: test.name,
          details: test.details
        });
      }
      report.viewports[viewportName].interactionWithFixes.tests.push(test);
    }
  }
  
  // Update summary
  report.summary.totalTests = totalTests;
  report.summary.passedTests = passedTests;
  report.summary.failedTests = totalTests - passedTests;
  report.summary.passRate = totalTests > 0 ? (passedTests / totalTests * 100).toFixed(2) : 0;
  
  // Generate recommendations based on failed tests
  const failedCategories = [...new Set(report.issues.map(issue => issue.category))];
  
  if (failedCategories.includes('Navigation Arrows')) {
    report.recommendations.push('Review arrow button implementation and ensure proper event handling');
  }
  
  if (failedCategories.includes('Swipe Gestures')) {
    report.recommendations.push('Check touch event handling and gesture recognition logic');
  }
  
  if (failedCategories.includes('Carousel Behavior')) {
    report.recommendations.push('Verify state management and transition animations');
  }
  
  if (failedCategories.includes('Interaction with Fixes')) {
    report.recommendations.push('Ensure recent fixes don\'t interfere with carousel functionality');
  }
  
  // Print summary to console
  console.log(`Total Tests: ${report.summary.totalTests}`);
  console.log(`Passed: ${report.summary.passedTests}`);
  console.log(`Failed: ${report.summary.failedTests}`);
  console.log(`Pass Rate: ${report.summary.passRate}%`);
  
  if (report.issues.length > 0) {
    console.log('\nISSUES FOUND:');
    report.issues.forEach((issue, index) => {
      console.log(`${index + 1}. [${issue.viewport}] ${issue.category}: ${issue.test}`);
      console.log(`   Details: ${issue.details}`);
    });
  }
  
  if (report.recommendations.length > 0) {
    console.log('\nRECOMMENDATIONS:');
    report.recommendations.forEach((rec, index) => {
      console.log(`${index + 1}. ${rec}`);
    });
  }
  
  return report;
}

/**
 * Save test report to file
 */
function saveTestReport(report) {
  const reportPath = './test-results/carousel-functionality-report.json';
  
  // Ensure directory exists
  const dir = path.dirname(reportPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log(`\nTest report saved to: ${reportPath}`);
}

/**
 * Main test function
 */
async function runCarouselFunctionalityTests() {
  console.log('Starting Carousel Functionality Tests...\n');
  
  // Create screenshot directory
  if (!fs.existsSync(TEST_CONFIG.screenshotDir)) {
    fs.mkdirSync(TEST_CONFIG.screenshotDir, { recursive: true });
  }
  
  let browser, context, page;
  
  try {
    // Initialize browser
    ({ browser, context, page } = await initializeBrowser());
    
    // Navigate to carousel page
    await navigateToCarouselPage(page);
    
    const allResults = [];
    
    // Run tests for each viewport
    for (const viewportName of Object.keys(TEST_CONFIG.viewports)) {
      const viewportResults = await runTestsForViewport(page, viewportName);
      allResults.push(viewportResults);
    }
    
    // Generate and save report
    const report = generateTestReport(allResults);
    saveTestReport(report);
    
    return report;
    
  } catch (error) {
    console.error('Error running carousel functionality tests:', error);
    throw error;
  } finally {
    // Close browser
    if (browser) {
      await browser.close();
    }
  }
}

// Export for use in other files or direct execution
if (require.main === module) {
  runCarouselFunctionalityTests()
    .then(() => {
      console.log('\nCarousel functionality tests completed successfully!');
      process.exit(0);
    })
    .catch(error => {
      console.error('Carousel functionality tests failed:', error);
      process.exit(1);
    });
}

module.exports = {
  runCarouselFunctionalityTests,
  testNavigationArrows,
  testSwipeGestures,
  testCarouselBehavior,
  testInteractionWithFixes
};