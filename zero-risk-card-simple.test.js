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
    const page = await browser.newPage();
    await page.goto('http://localhost:3001');
    
    // Navigate to Why Choose Us section
    await page.locator('#why-choose-us').scrollIntoViewIfNeeded();
    await page.waitForTimeout(3000); // Wait for section to load
    
    // Check if Zero Risk card is present
    const zeroRiskCard = page.locator('text=Zero Risk').first();
    if (!await zeroRiskCard.isVisible()) {
      throw new Error('Zero Risk card is not visible');
    }
    
    // Check if the subheading text is correct
    const subheadingText = page.locator('text=You can\'t lose money. Our offer makes working with us risk free.').first();
    if (!await subheadingText.isVisible()) {
      throw new Error('Subheading text is not visible or incorrect');
    }
    
    // Take screenshot for visual verification
    await page.screenshot({ 
      path: path.join(screenshotsDir, `zero-risk-text-${Date.now()}.png`),
      fullPage: false 
    });
    
    await page.close();
  });
  
  // Test 2: Text readability over video background
  await runTest('Text is clearly readable over video background', async () => {
    const page = await browser.newPage();
    await page.goto('http://localhost:3001');
    
    // Navigate to Why Choose Us section
    await page.locator('#why-choose-us').scrollIntoViewIfNeeded();
    await page.waitForTimeout(3000);
    
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
    await page.waitForTimeout(2000);
    
    // Check for video element
    const videoElement = zeroRiskSlide.locator('video');
    if (!await videoElement.isVisible()) {
      throw new Error('Video element is not visible');
    }
    
    // Check for overlay with increased opacity
    const overlay = zeroRiskSlide.locator('.bg-black\\/50');
    if (!await overlay.isVisible()) {
      throw new Error('Overlay with bg-black/50 is not visible');
    }
    
    // Check for drop shadow on title
    const title = zeroRiskSlide.locator('h2.text-white.drop-shadow-lg');
    if (!await title.isVisible()) {
      throw new Error('Title with drop shadow is not visible');
    }
    
    // Check for drop shadow on description
    const description = zeroRiskSlide.locator('p.text-white\\/95.drop-shadow-md');
    if (!await description.isVisible()) {
      throw new Error('Description with drop shadow is not visible');
    }
    
    // Take screenshot for visual verification
    await page.screenshot({ 
      path: path.join(screenshotsDir, `text-readability-${Date.now()}.png`),
      fullPage: false 
    });
    
    await page.close();
  });
  
  // Test 3: Video remains as background while text is main focus
  await runTest('Video remains as background element while text is main focus', async () => {
    const page = await browser.newPage();
    await page.goto('http://localhost:3001');
    
    // Navigate to Why Choose Us section
    await page.locator('#why-choose-us').scrollIntoViewIfNeeded();
    await page.waitForTimeout(3000);
    
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
    await page.waitForTimeout(2000);
    
    // Check z-index hierarchy - text should be above video
    const textContent = zeroRiskSlide.locator('article');
    const videoElement = zeroRiskSlide.locator('video');
    const overlay = zeroRiskSlide.locator('.bg-black\\/50');
    
    // All elements should be visible
    if (!await textContent.isVisible()) {
      throw new Error('Text content is not visible');
    }
    if (!await videoElement.isVisible()) {
      throw new Error('Video element is not visible');
    }
    if (!await overlay.isVisible()) {
      throw new Error('Overlay is not visible');
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
      { name: 'Mobile', width: 375, height: 667 },
      { name: 'Tablet', width: 768, height: 1024 },
      { name: 'Desktop', width: 1280, height: 720 }
    ];
    
    for (const viewport of viewports) {
      console.log(`  📱 Testing ${viewport.name} (${viewport.width}x${viewport.height})`);
      
      const page = await browser.newPage();
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      
      await page.goto('http://localhost:3001');
      
      // Navigate to Why Choose Us section
      await page.locator('#why-choose-us').scrollIntoViewIfNeeded();
      await page.waitForTimeout(3000);
      
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
      await page.waitForTimeout(2000);
      
      // Check if all elements are visible
      const title = zeroRiskSlide.locator('h2');
      const description = zeroRiskSlide.locator('p');
      const videoElement = zeroRiskSlide.locator('video');
      const overlay = zeroRiskSlide.locator('.bg-black\\/50');
      
      if (!await title.isVisible()) {
        throw new Error(`Title is not visible on ${viewport.name}`);
      }
      if (!await description.isVisible()) {
        throw new Error(`Description is not visible on ${viewport.name}`);
      }
      if (!await videoElement.isVisible()) {
        throw new Error(`Video element is not visible on ${viewport.name}`);
      }
      if (!await overlay.isVisible()) {
        throw new Error(`Overlay is not visible on ${viewport.name}`);
      }
      
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
    const page = await browser.newPage();
    await page.goto('http://localhost:3001');
    
    // Navigate to Why Choose Us section
    await page.locator('#why-choose-us').scrollIntoViewIfNeeded();
    await page.waitForTimeout(3000);
    
    // Find the current active slide
    const currentSlide = page.locator('li').first();
    const initialTitle = await currentSlide.locator('h2').textContent();
    
    if (!initialTitle) {
      throw new Error('Could not get initial slide title');
    }
    
    // Click next button
    const nextButton = page.locator('button[title="Go to next slide"]');
    if (!await nextButton.isVisible()) {
      throw new Error('Next button is not visible');
    }
    await nextButton.click();
    await page.waitForTimeout(2000);
    
    // Check that slide has changed
    const newSlide = page.locator('li').first();
    const newTitle = await newSlide.locator('h2').textContent();
    
    if (initialTitle === newTitle) {
      throw new Error('Carousel did not navigate to next slide');
    }
    
    // Click previous button
    const prevButton = page.locator('button[title="Go to previous slide"]');
    if (!await prevButton.isVisible()) {
      throw new Error('Previous button is not visible');
    }
    await prevButton.click();
    await page.waitForTimeout(2000);
    
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
    await page.waitForTimeout(2000);
    
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