const { chromium, devices } = require('playwright');
const fs = require('fs');
const path = require('path');

// Create test results directory if it doesn't exist
const testResultsDir = path.join(__dirname, 'test-results');
const screenshotsDir = path.join(testResultsDir, 'screenshots', 'zero-risk-card');

if (!fs.existsSync(testResultsDir)) {
  fs.mkdirSync(testResultsDir, { recursive: true });
}
if (!fs.existsSync(screenshotsDir)) {
  fs.mkdirSync(screenshotsDir, { recursive: true });
}

async function testZeroRiskCard() {
  console.log('🚀 Starting Zero Risk Card comprehensive test...\n');
  
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  
  // Initialize expect for this context
  const expect = (0, eval)('require').playwright.expect;
  
  // Test results tracking
  const testResults = {
    timestamp: new Date().toISOString(),
    tests: [],
    summary: {
      passed: 0,
      failed: 0,
      total: 0
    }
  };
  
  // Helper function to run a test and track results
  async function runTest(testName, testFunction) {
    console.log(`📋 Running test: ${testName}`);
    testResults.summary.total++;
    
    try {
      await testFunction();
      console.log(`✅ PASSED: ${testName}\n`);
      testResults.tests.push({
        name: testName,
        status: 'passed',
        message: 'Test completed successfully'
      });
      testResults.summary.passed++;
    } catch (error) {
      console.log(`❌ FAILED: ${testName}`);
      console.log(`   Error: ${error.message}\n`);
      testResults.tests.push({
        name: testName,
        status: 'failed',
        message: error.message
      });
      testResults.summary.failed++;
    }
  }
  
  // Test 1: Zero Risk card displays with correct subheading text
  await runTest('Zero Risk card displays with correct subheading text', async () => {
    const page = await context.newPage();
    await page.goto('http://localhost:3001');
    
    // Navigate to Why Choose Us section
    await page.locator('#why-choose-us').scrollIntoViewIfNeeded();
    await page.waitForTimeout(2000); // Wait for section to load
    
    // Check if Zero Risk card is present
    const zeroRiskCard = page.locator('text=Zero Risk').first();
    await expect(zeroRiskCard).toBeVisible();
    
    // Check if the subheading text is correct
    const subheadingText = await page.locator('text=You can\'t lose money. Our offer makes working with us risk free.').first();
    await expect(subheadingText).toBeVisible();
    
    // Take screenshot for visual verification
    await page.screenshot({ 
      path: path.join(screenshotsDir, `zero-risk-text-${Date.now()}.png`),
      fullPage: false 
    });
    
    await page.close();
  });
  
  // Test 2: Text readability over video background
  await runTest('Text is clearly readable over video background', async () => {
    const page = await context.newPage();
    await page.goto('http://localhost:3001');
    
    // Navigate to Why Choose Us section
    await page.locator('#why-choose-us').scrollIntoViewIfNeeded();
    await page.waitForTimeout(2000);
    
    // Find the Zero Risk card and navigate to it
    const slides = await page.locator('li').all();
    let zeroRiskSlideIndex = -1;
    
    for (let i = 0; i < slides.length; i++) {
      const hasZeroRiskText = await slides[i].locator('text=Zero Risk').isVisible().catch(() => false);
      if (hasZeroRiskText) {
        zeroRiskSlideIndex = i;
        break;
      }
    }
    
    if (zeroRiskSlideIndex === -1) {
      throw new Error('Zero Risk slide not found');
    }
    
    // Navigate to Zero Risk slide
    const zeroRiskSlide = slides[zeroRiskSlideIndex];
    await zeroRiskSlide.click();
    await page.waitForTimeout(1000);
    
    // Check for video element
    const videoElement = zeroRiskSlide.locator('video');
    await expect(videoElement).toBeVisible();
    
    // Check for overlay with increased opacity
    const overlay = zeroRiskSlide.locator('.bg-black\\/50');
    await expect(overlay).toBeVisible();
    
    // Check for drop shadow on title
    const title = zeroRiskSlide.locator('h2.text-white.drop-shadow-lg');
    await expect(title).toBeVisible();
    
    // Check for drop shadow on description
    const description = zeroRiskSlide.locator('p.text-white\\/95.drop-shadow-md');
    await expect(description).toBeVisible();
    
    // Take screenshot for visual verification
    await page.screenshot({ 
      path: path.join(screenshotsDir, `text-readability-${Date.now()}.png`),
      fullPage: false 
    });
    
    await page.close();
  });
  
  // Test 3: Video remains as background while text is main focus
  await runTest('Video remains as background element while text is main focus', async () => {
    const page = await context.newPage();
    await page.goto('http://localhost:3001');
    
    // Navigate to Why Choose Us section
    await page.locator('#why-choose-us').scrollIntoViewIfNeeded();
    await page.waitForTimeout(2000);
    
    // Find and navigate to Zero Risk slide
    const slides = await page.locator('li').all();
    let zeroRiskSlideIndex = -1;
    
    for (let i = 0; i < slides.length; i++) {
      const hasZeroRiskText = await slides[i].locator('text=Zero Risk').isVisible().catch(() => false);
      if (hasZeroRiskText) {
        zeroRiskSlideIndex = i;
        break;
      }
    }
    
    if (zeroRiskSlideIndex === -1) {
      throw new Error('Zero Risk slide not found');
    }
    
    const zeroRiskSlide = slides[zeroRiskSlideIndex];
    await zeroRiskSlide.click();
    await page.waitForTimeout(1000);
    
    // Check z-index hierarchy - text should be above video
    const textContent = zeroRiskSlide.locator('article');
    const videoElement = zeroRiskSlide.locator('video');
    const overlay = zeroRiskSlide.locator('.bg-black\\/50');
    
    // All elements should be visible
    await expect(textContent).toBeVisible();
    await expect(videoElement).toBeVisible();
    await expect(overlay).toBeVisible();
    
    // Get computed z-index values to verify proper layering
    const textZIndex = await textContent.evaluate(el => getComputedStyle(el).zIndex);
    const videoZIndex = await videoElement.evaluate(el => getComputedStyle(el).zIndex);
    const overlayZIndex = await overlay.evaluate(el => getComputedStyle(el).zIndex);
    
    // Text should have higher z-index than video
    if (textZIndex === 'auto' && videoZIndex === 'auto') {
      // If both are auto, we need to check DOM order
      const textPosition = await textContent.evaluate(el => 
        Array.from(el.parentElement.children).indexOf(el)
      );
      const videoPosition = await videoElement.evaluate(el => 
        Array.from(el.parentElement.children).indexOf(el)
      );
      
      // Text should appear after video in DOM order
      if (textPosition <= videoPosition) {
        throw new Error('Text element should come after video element in DOM order');
      }
    }
    
    // Take screenshot for visual verification
    await page.screenshot({ 
      path: path.join(screenshotsDir, `video-background-hierarchy-${Date.now()}.png`),
      fullPage: false 
    });
    
    await page.close();
  });
  
  // Test 4: Responsiveness across different screen sizes
  await runTest('Changes work across different screen sizes', async () => {
    const viewports = [
      { name: 'Mobile', width: 375, height: 667, device: devices['iPhone 12'] },
      { name: 'Tablet', width: 768, height: 1024, device: devices['iPad'] },
      { name: 'Desktop', width: 1280, height: 720 }
    ];
    
    for (const viewport of viewports) {
      console.log(`  📱 Testing ${viewport.name} (${viewport.width}x${viewport.height})`);
      
      const page = viewport.device 
        ? await browser.newPage({ ...viewport.device })
        : await context.newPage();
      
      if (!viewport.device) {
        await page.setViewportSize({ width: viewport.width, height: viewport.height });
      }
      
      await page.goto('http://localhost:3001');
      
      // Navigate to Why Choose Us section
      await page.locator('#why-choose-us').scrollIntoViewIfNeeded();
      await page.waitForTimeout(2000);
      
      // Find and navigate to Zero Risk slide
      const slides = await page.locator('li').all();
      let zeroRiskSlideIndex = -1;
      
      for (let i = 0; i < slides.length; i++) {
        const hasZeroRiskText = await slides[i].locator('text=Zero Risk').isVisible().catch(() => false);
        if (hasZeroRiskText) {
          zeroRiskSlideIndex = i;
          break;
        }
      }
      
      if (zeroRiskSlideIndex === -1) {
        throw new Error(`Zero Risk slide not found on ${viewport.name}`);
      }
      
      const zeroRiskSlide = slides[zeroRiskSlideIndex];
      await zeroRiskSlide.click();
      await page.waitForTimeout(1000);
      
      // Check if all elements are visible
      const title = zeroRiskSlide.locator('h2');
      const description = zeroRiskSlide.locator('p');
      const videoElement = zeroRiskSlide.locator('video');
      const overlay = zeroRiskSlide.locator('.bg-black\\/50');
      
      await expect(title).toBeVisible();
      await expect(description).toBeVisible();
      await expect(videoElement).toBeVisible();
      await expect(overlay).toBeVisible();
      
      // Take screenshot for visual verification
      await page.screenshot({ 
        path: path.join(screenshotsDir, `responsiveness-${viewport.name.toLowerCase()}-${Date.now()}.png`),
        fullPage: false 
      });
      
      await page.close();
    }
  });
  
  // Test 5: Carousel functionality still works properly
  await runTest('Carousel functionality works properly', async () => {
    const page = await context.newPage();
    await page.goto('http://localhost:3001');
    
    // Navigate to Why Choose Us section
    await page.locator('#why-choose-us').scrollIntoViewIfNeeded();
    await page.waitForTimeout(2000);
    
    // Find the current active slide
    const currentSlide = page.locator('li').first();
    const initialTitle = await currentSlide.locator('h2').textContent();
    
    // Click next button
    const nextButton = page.locator('button[title="Go to next slide"]');
    await nextButton.click();
    await page.waitForTimeout(1000);
    
    // Check that slide has changed
    const newSlide = page.locator('li').first();
    const newTitle = await newSlide.locator('h2').textContent();
    
    if (initialTitle === newTitle) {
      throw new Error('Carousel did not navigate to next slide');
    }
    
    // Click previous button
    const prevButton = page.locator('button[title="Go to previous slide"]');
    await prevButton.click();
    await page.waitForTimeout(1000);
    
    // Check that slide has changed back
    const prevSlide = page.locator('li').first();
    const prevTitle = await prevSlide.locator('h2').textContent();
    
    if (prevTitle === newTitle) {
      throw new Error('Carousel did not navigate to previous slide');
    }
    
    // Test direct slide navigation
    const slides = await page.locator('li').all();
    let zeroRiskSlideIndex = -1;
    
    for (let i = 0; i < slides.length; i++) {
      const hasZeroRiskText = await slides[i].locator('text=Zero Risk').isVisible().catch(() => false);
      if (hasZeroRiskText) {
        zeroRiskSlideIndex = i;
        break;
      }
    }
    
    if (zeroRiskSlideIndex === -1) {
      throw new Error('Zero Risk slide not found for direct navigation test');
    }
    
    // Click directly on Zero Risk slide
    await slides[zeroRiskSlideIndex].click();
    await page.waitForTimeout(1000);
    
    // Verify we're on the Zero Risk slide
    const activeSlide = page.locator('li').first();
    const activeTitle = await activeSlide.locator('h2').textContent();
    
    if (activeTitle !== 'Zero Risk') {
      throw new Error('Direct navigation to Zero Risk slide failed');
    }
    
    // Take screenshot for visual verification
    await page.screenshot({ 
      path: path.join(screenshotsDir, `carousel-functionality-${Date.now()}.png`),
      fullPage: false 
    });
    
    await page.close();
  });
  
  // Generate test report
  const reportPath = path.join(testResultsDir, 'zero-risk-card-test-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(testResults, null, 2));
  
  console.log('📊 Test Summary:');
  console.log(`   Total: ${testResults.summary.total}`);
  console.log(`   Passed: ${testResults.summary.passed}`);
  console.log(`   Failed: ${testResults.summary.failed}`);
  console.log(`   Report saved to: ${reportPath}`);
  console.log(`   Screenshots saved to: ${screenshotsDir}`);
  
  await browser.close();
  
  return testResults;
}

// Run the tests
testZeroRiskCard()
  .then(results => {
    console.log('\n🎉 Zero Risk Card testing completed!');
    
    // Exit with appropriate code
    process.exit(results.summary.failed > 0 ? 1 : 0);
  })
  .catch(error => {
    console.error('❌ Test execution failed:', error);
    process.exit(1);
  });