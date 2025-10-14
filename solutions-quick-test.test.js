/**
 * Quick Test for Solutions Component
 * Tests key functionality without complex Playwright operations
 */

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

// Test configuration
const BASE_URL = 'http://localhost:3001';
const TEST_RESULTS_DIR = './test-results';
const REPORT_FILE = path.join(TEST_RESULTS_DIR, 'solutions-quick-test-report.json');

// Initialize test results
const testResults = {
  timestamp: new Date().toISOString(),
  tests: { passed: 0, failed: 0, details: [] },
  summary: { totalPassed: 0, totalFailed: 0 }
};

// Ensure test directories exist
if (!fs.existsSync(TEST_RESULTS_DIR)) fs.mkdirSync(TEST_RESULTS_DIR, { recursive: true });

// Helper function to record test results
function recordTest(testName, passed, details = '') {
  const result = { testName, passed, details, timestamp: new Date().toISOString() };
  testResults.tests.details.push(result);
  
  if (passed) {
    testResults.tests.passed++;
    testResults.summary.totalPassed++;
  } else {
    testResults.tests.failed++;
    testResults.summary.totalFailed++;
  }
}

// Main test function
async function runQuickTests() {
  console.log('🚀 Starting Solutions Component Quick Tests...\n');
  
  const browser = await chromium.launch({ 
    headless: true,
    timeout: 30000 // 30 seconds timeout
  });
  
  try {
    const context = await browser.newContext();
    const page = await context.newPage();
    
    // Set a reasonable timeout for navigation
    page.setDefaultTimeout(15000);
    
    // Navigate to the page
    await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' });
    
    // Wait a bit for dynamic content
    await page.waitForTimeout(2000);
    
    // Scroll to Solutions section
    await page.evaluate(() => {
      document.getElementById('solutions')?.scrollIntoView({ behavior: 'smooth' });
    });
    
    // Wait for scroll to complete
    await page.waitForTimeout(1000);
    
    // Run quick tests
    await testBasicStructure(page);
    await testTextColors(page);
    await testVideoElements(page);
    await testAccessibility(page);
    
  } catch (error) {
    console.error('Error during testing:', error);
    recordTest('Test Execution', false, `Error: ${error.message}`);
  } finally {
    await browser.close();
  }
  
  // Save test results
  fs.writeFileSync(REPORT_FILE, JSON.stringify(testResults, null, 2));
  
  // Print summary
  console.log('\n📊 Quick Test Summary:');
  console.log(`✅ Passed: ${testResults.summary.totalPassed}`);
  console.log(`❌ Failed: ${testResults.summary.totalFailed}`);
  console.log(`📄 Detailed report saved to: ${REPORT_FILE}`);
  
  return testResults;
}

// Test Basic Structure
async function testBasicStructure(page) {
  console.log('🏗️  Testing basic structure...');
  
  try {
    // Test 1: Check if Solutions section exists
    const sectionExists = await page.locator('#solutions').isVisible();
    recordTest('Solutions section exists', sectionExists,
      sectionExists ? 'Solutions section is visible' : 'Solutions section not found');
    
    // Test 2: Check if main heading exists
    const headingExists = await page.locator('#solutions h2').isVisible();
    recordTest('Main heading exists', headingExists,
      headingExists ? 'Main heading is visible' : 'Main heading not found');
    
    // Test 3: Check if description exists
    const descriptionExists = await page.locator('#solutions p').isVisible();
    recordTest('Description exists', descriptionExists,
      descriptionExists ? 'Description is visible' : 'Description not found');
    
    // Test 4: Check if solution cards exist
    const cardsCount = await page.locator('#solutions .grid > div').count();
    const hasCards = cardsCount > 0;
    recordTest('Solution cards exist', hasCards,
      hasCards ? `Found ${cardsCount} solution cards` : 'No solution cards found');
    
  } catch (error) {
    recordTest('Basic structure test', false, `Error: ${error.message}`);
  }
}

// Test Text Colors
async function testTextColors(page) {
  console.log('🎨 Testing text colors...');
  
  try {
    // Test 1: Check heading color
    const headingColor = await page.evaluate(() => {
      const heading = document.querySelector('#solutions h2');
      if (!heading) return null;
      const styles = window.getComputedStyle(heading);
      return styles.color;
    });
    
    const headingIsBlack = headingColor && (headingColor === 'rgb(0, 0, 0)' || headingColor === '#000000');
    recordTest('Heading is black', headingIsBlack,
      `Heading color: ${headingColor || 'not found'}`);
    
    // Test 2: Check description color
    const descriptionColor = await page.evaluate(() => {
      const description = document.querySelector('#solutions p');
      if (!description) return null;
      const styles = window.getComputedStyle(description);
      return styles.color;
    });
    
    const descriptionIsBlack = descriptionColor && (descriptionColor === 'rgb(0, 0, 0)' || descriptionColor === '#000000');
    recordTest('Description is black', descriptionIsBlack,
      `Description color: ${descriptionColor || 'not found'}`);
    
    // Test 3: Check card title colors
    const cardTitleColor = await page.evaluate(() => {
      const cardTitle = document.querySelector('#solutions h3');
      if (!cardTitle) return null;
      const styles = window.getComputedStyle(cardTitle);
      return styles.color;
    });
    
    const cardTitleIsBlack = cardTitleColor && (cardTitleColor === 'rgb(0, 0, 0)' || cardTitleColor === '#000000');
    recordTest('Card titles are black', cardTitleIsBlack,
      `Card title color: ${cardTitleColor || 'not found'}`);
    
  } catch (error) {
    recordTest('Text color test', false, `Error: ${error.message}`);
  }
}

// Test Video Elements
async function testVideoElements(page) {
  console.log('🎥 Testing video elements...');
  
  try {
    // Test 1: Check if video elements exist
    const videoCount = await page.locator('#solutions video').count();
    const hasVideos = videoCount > 0;
    recordTest('Video elements exist', hasVideos,
      hasVideos ? `Found ${videoCount} video elements` : 'No video elements found');
    
    // Test 2: Check video attributes
    if (hasVideos) {
      const hasAutoplay = await page.locator('#solutions video[autoplay]').count() > 0;
      const hasMuted = await page.locator('#solutions video[muted]').count() > 0;
      const hasLoop = await page.locator('#solutions video[loop]').count() > 0;
      const hasPlaysInline = await page.locator('#solutions video[playsinline]').count() > 0;
      
      recordTest('Videos have autoplay', hasAutoplay,
        hasAutoplay ? 'Videos have autoplay attribute' : 'Videos missing autoplay');
      
      recordTest('Videos have muted', hasMuted,
        hasMuted ? 'Videos have muted attribute' : 'Videos missing muted');
      
      recordTest('Videos have loop', hasLoop,
        hasLoop ? 'Videos have loop attribute' : 'Videos missing loop');
      
      recordTest('Videos have playsinline', hasPlaysInline,
        hasPlaysInline ? 'Videos have playsinline attribute' : 'Videos missing playsinline');
    }
    
    // Test 3: Check video source URLs
    const videoSources = await page.evaluate(() => {
      const sources = document.querySelectorAll('#solutions video source');
      return Array.from(sources).map(source => source.getAttribute('src'));
    });
    
    const hasVideoSources = videoSources.length > 0 && videoSources.every(src => src && src.includes('video'));
    recordTest('Videos have valid sources', hasVideoSources,
      hasVideoSources ? `Found ${videoSources.length} video sources` : 'No valid video sources found');
    
    // Test 4: Check video overlay
    const overlayExists = await page.locator('#solutions .absolute.inset-0.bg-black\\/40').isVisible();
    recordTest('Video overlay exists', overlayExists,
      overlayExists ? 'Video overlay is visible' : 'Video overlay not found');
    
  } catch (error) {
    recordTest('Video elements test', false, `Error: ${error.message}`);
  }
}

// Test Accessibility
async function testAccessibility(page) {
  console.log('♿ Testing accessibility...');
  
  try {
    // Test 1: Check ARIA label on section
    const hasAriaLabel = await page.locator('#solutions[aria-label="Solutions section"]').count() > 0;
    recordTest('Section has aria-label', hasAriaLabel,
      hasAriaLabel ? 'Section has aria-label' : 'Section missing aria-label');
    
    // Test 2: Check video aria-hidden
    const videoAriaHidden = await page.locator('#solutions video[aria-hidden="true"]').count() > 0;
    recordTest('Videos have aria-hidden', videoAriaHidden,
      videoAriaHidden ? 'Videos have aria-hidden' : 'Videos missing aria-hidden');
    
    // Test 3: Check overlay aria-hidden
    const overlayAriaHidden = await page.locator('#solutions .absolute.inset-0.bg-black\\/40[aria-hidden="true"]').count() > 0;
    recordTest('Overlay has aria-hidden', overlayAriaHidden,
      overlayAriaHidden ? 'Overlay has aria-hidden' : 'Overlay missing aria-hidden');
    
    // Test 4: Check semantic HTML
    const hasSemanticStructure = await page.evaluate(() => {
      const section = document.querySelector('#solutions');
      const headings = section.querySelectorAll('h2, h3');
      const lists = section.querySelectorAll('ul, ol');
      
      return {
        hasSection: section && section.tagName === 'SECTION',
        hasHeadings: headings.length > 0,
        hasLists: lists.length > 0
      };
    });
    
    recordTest('Semantic HTML structure', 
      hasSemanticStructure.hasSection && hasSemanticStructure.hasHeadings,
      `Section: ${hasSemanticStructure.hasSection}, Headings: ${hasSemanticStructure.hasHeadings}`);
    
  } catch (error) {
    recordTest('Accessibility test', false, `Error: ${error.message}`);
  }
}

// Run the tests
runQuickTests().then(results => {
  console.log('\n🎉 Quick tests completed!');
  
  // Print detailed results
  console.log('\n📋 DETAILED RESULTS:');
  results.tests.details.forEach(test => {
    const status = test.passed ? '✅' : '❌';
    console.log(`${status} ${test.testName}: ${test.details}`);
  });
  
  process.exit(results.summary.totalFailed > 0 ? 1 : 0);
}).catch(error => {
  console.error('Quick test execution failed:', error);
  process.exit(1);
});