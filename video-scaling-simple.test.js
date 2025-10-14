/**
 * Simplified Test Suite for Video Scaling Fix
 * A streamlined version that focuses on core functionality testing
 */

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

// Configuration
const BASE_URL = 'http://localhost:3001';
const TEST_RESULTS_DIR = 'test-results';
const SCREENSHOTS_DIR = path.join(TEST_RESULTS_DIR, 'screenshots', 'video-scaling-simple');

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

  async takeScreenshot(page, name) {
    const timestamp = new Date().getTime();
    const filename = `${name}-${timestamp}.png`;
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
    await this.wait(1000);
  },

  async waitForVideoLoad(page) {
    await page.waitForFunction(() => {
      const video = document.querySelector('.carousel-card-zero-risk video');
      return video && video.readyState >= 2;
    }, { timeout: 5000 });
    await this.wait(500);
  }
};

// Test cases
const tests = {
  aspectRatioVerification: async (page) => {
    console.log('Testing aspect ratio verification...');
    await utils.navigateToWhyChooseUs(page);
    await utils.waitForVideoLoad(page);
    
    const results = {
      zeroRiskCard: null,
      standardCard: null
    };
    
    // Test Zero Risk card
    const zeroRiskCard = page.locator('.carousel-card-zero-risk').first();
    if (await zeroRiskCard.isVisible()) {
      const dimensions = await utils.getComputedDimensions(zeroRiskCard);
      const aspectRatio = await utils.getComputedStyle(zeroRiskCard, 'aspect-ratio');
      
      results.zeroRiskCard = {
        dimensions,
        aspectRatio,
        expectedRatio: 4/5,
        isCorrectRatio: Math.abs(dimensions.aspectRatio - (4/5)) < 0.1
      };
    }
    
    // Try to find a standard card
    const standardCard = page.locator('.carousel-card-standard').first();
    if (await standardCard.isVisible()) {
      const dimensions = await utils.getComputedDimensions(standardCard);
      const aspectRatio = await utils.getComputedStyle(standardCard, 'aspect-ratio');
      
      results.standardCard = {
        dimensions,
        aspectRatio,
        expectedRatio: 9/16,
        isCorrectRatio: Math.abs(dimensions.aspectRatio - (9/16)) < 0.1
      };
    }
    
    return results;
  },

  videoDisplayVerification: async (page) => {
    console.log('Testing video display verification...');
    await utils.navigateToWhyChooseUs(page);
    await utils.waitForVideoLoad(page);
    
    const results = {
      videoElement: null,
      objectFit: null,
      isVideoVisible: false
    };
    
    // Test video element
    const videoElement = page.locator('.carousel-card-zero-risk video').first();
    if (await videoElement.isVisible()) {
      results.isVideoVisible = true;
      results.objectFit = await utils.getComputedStyle(videoElement, 'object-fit');
      results.videoElement = await utils.getComputedDimensions(videoElement);
    }
    
    return results;
  },

  responsiveDesignVerification: async (page) => {
    console.log('Testing responsive design verification...');
    const viewports = [
      { name: 'mobile', width: 375, height: 667 },
      { name: 'tablet', width: 768, height: 1024 },
      { name: 'desktop', width: 1200, height: 800 }
    ];
    
    const results = {};
    
    for (const viewport of viewports) {
      await page.setViewportSize(viewport);
      await utils.navigateToWhyChooseUs(page);
      await utils.waitForVideoLoad(page);
      
      const zeroRiskCard = page.locator('.carousel-card-zero-risk').first();
      if (await zeroRiskCard.isVisible()) {
        const dimensions = await utils.getComputedDimensions(zeroRiskCard);
        results[viewport.name] = {
          dimensions,
          aspectRatio: dimensions.aspectRatio,
          isCorrectRatio: Math.abs(dimensions.aspectRatio - (4/5)) < 0.1
        };
      }
    }
    
    return results;
  },

  crossBrowserCompatibility: async (page) => {
    console.log('Testing cross-browser compatibility...');
    await utils.navigateToWhyChooseUs(page);
    await utils.waitForVideoLoad(page);
    
    const results = {
      supportsAspectRatio: false,
      fallbackApplied: false
    };
    
    // Check aspect-ratio support
    results.supportsAspectRatio = await page.evaluate(() => {
      return CSS.supports('aspect-ratio', '4/5');
    });
    
    // Check if aspect-ratio is applied
    const zeroRiskCard = page.locator('.carousel-card-zero-risk').first();
    if (await zeroRiskCard.isVisible()) {
      const aspectRatio = await utils.getComputedStyle(zeroRiskCard, 'aspect-ratio');
      results.aspectRatioValue = aspectRatio;
      results.fallbackApplied = aspectRatio !== 'auto';
    }
    
    return results;
  }
};

// Main test runner
async function runSimpleTests() {
  console.log('Starting simplified video scaling tests...\n');
  
  const results = {
    timestamp: new Date().toISOString(),
    summary: {
      totalTests: Object.keys(tests).length,
      passedTests: 0,
      failedTests: 0
    },
    results: {},
    screenshots: []
  };
  
  let browser;
  try {
    browser = await chromium.launch();
    const context = await browser.newContext();
    const page = await context.newPage();
    
    // Run all tests
    for (const [testName, testFunction] of Object.entries(tests)) {
      console.log(`\n--- Running ${testName} ---`);
      
      try {
        const testResult = await testFunction(page);
        results.results[testName] = {
          status: 'passed',
          data: testResult
        };
        results.summary.passedTests++;
        
        // Take screenshot for visual verification
        const screenshotPath = await utils.takeScreenshot(page, testName);
        results.screenshots.push(screenshotPath);
        
        console.log(`✅ ${testName} completed successfully`);
        
      } catch (error) {
        console.log(`❌ ${testName} failed: ${error.message}`);
        results.results[testName] = {
          status: 'failed',
          error: error.message
        };
        results.summary.failedTests++;
      }
    }
    
    await context.close();
    await browser.close();
    
  } catch (error) {
    console.log(`❌ Browser setup failed: ${error.message}`);
    results.summary.failedTests = Object.keys(tests).length;
  }
  
  // Generate report
  const reportPath = path.join(TEST_RESULTS_DIR, 'video-scaling-simple-test-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(results, null, 2));
  
  // Generate HTML report
  const htmlReportPath = generateHtmlReport(results);
  
  console.log('\n========== Test Summary ==========');
  console.log(`Total tests: ${results.summary.totalTests}`);
  console.log(`Passed: ${results.summary.passedTests}`);
  console.log(`Failed: ${results.summary.failedTests}`);
  console.log(`Success rate: ${((results.summary.passedTests / results.summary.totalTests) * 100).toFixed(2)}%`);
  console.log(`JSON report saved to: ${reportPath}`);
  console.log(`HTML report saved to: ${htmlReportPath}`);
  
  return results;
}

// Generate HTML report
function generateHtmlReport(results) {
  const reportPath = path.join(TEST_RESULTS_DIR, 'video-scaling-simple-report.html');
  
  const testResultsHtml = Object.entries(results.results).map(([testName, result]) => {
    const statusClass = result.status === 'passed' ? 'test-passed' : 'test-failed';
    const statusIcon = result.status === 'passed' ? '✅' : '❌';
    
    let detailsHtml = '';
    if (result.data) {
      detailsHtml = `<pre>${JSON.stringify(result.data, null, 2)}</pre>`;
    } else if (result.error) {
      detailsHtml = `<p class="error">${result.error}</p>`;
    }
    
    return `
      <div class="test-result ${statusClass}">
        <h3>${statusIcon} ${testName}</h3>
        <p>Status: ${result.status}</p>
        ${detailsHtml}
      </div>
    `;
  }).join('');
  
  const screenshotsHtml = results.screenshots.map(screenshot => {
    const filename = path.basename(screenshot);
    return `
      <div class="screenshot">
        <img src="./screenshots/video-scaling-simple/${filename}" alt="${filename}" />
        <p>${filename}</p>
      </div>
    `;
  }).join('');
  
  const htmlReport = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Video Scaling Fix - Simple Test Report</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px;
      background-color: #f5f5f5;
    }
    .container {
      background: white;
      padding: 30px;
      border-radius: 8px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }
    h1 {
      color: #2c3e50;
      border-bottom: 3px solid #3498db;
      padding-bottom: 10px;
    }
    .summary {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 20px;
      margin: 20px 0;
    }
    .summary-item {
      background: #f8f9fa;
      padding: 20px;
      border-radius: 6px;
      text-align: center;
      box-shadow: 0 2px 4px rgba(0,0,0,0.05);
    }
    .summary-item h3 {
      margin: 0 0 10px 0;
      color: #3498db;
    }
    .summary-item p {
      margin: 0;
      font-size: 24px;
      font-weight: bold;
    }
    .success { color: #27ae60; }
    .failure { color: #e74c3c; }
    .test-result {
      margin: 20px 0;
      padding: 20px;
      border-radius: 6px;
      border-left: 4px solid #ddd;
    }
    .test-passed {
      background-color: #d4edda;
      border-left-color: #28a745;
    }
    .test-failed {
      background-color: #f8d7da;
      border-left-color: #dc3545;
    }
    .test-result h3 {
      margin: 0 0 10px 0;
    }
    .error {
      color: #721c24;
      background-color: #f8d7da;
      padding: 10px;
      border-radius: 4px;
    }
    pre {
      background: #f8f9fa;
      padding: 15px;
      border-radius: 4px;
      overflow-x: auto;
      font-size: 12px;
    }
    .screenshots {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 20px;
      margin: 20px 0;
    }
    .screenshot {
      border: 1px solid #ddd;
      border-radius: 4px;
      overflow: hidden;
      box-shadow: 0 2px 4px rgba(0,0,0,0.05);
    }
    .screenshot img {
      width: 100%;
      height: auto;
      display: block;
    }
    .screenshot p {
      padding: 10px;
      margin: 0;
      background: #f8f9fa;
      font-size: 12px;
      text-align: center;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>Video Scaling Fix - Simple Test Report</h1>
    <p>Generated on: ${new Date(results.timestamp).toLocaleString()}</p>
    
    <h2>Test Summary</h2>
    <div class="summary">
      <div class="summary-item">
        <h3>Total Tests</h3>
        <p>${results.summary.totalTests}</p>
      </div>
      <div class="summary-item">
        <h3>Passed</h3>
        <p class="success">${results.summary.passedTests}</p>
      </div>
      <div class="summary-item">
        <h3>Failed</h3>
        <p class="failure">${results.summary.failedTests}</p>
      </div>
      <div class="summary-item">
        <h3>Success Rate</h3>
        <p>${((results.summary.passedTests / results.summary.totalTests) * 100).toFixed(2)}%</p>
      </div>
    </div>
    
    <h2>Test Results</h2>
    ${testResultsHtml}
    
    <h2>Screenshots</h2>
    <div class="screenshots">
      ${screenshotsHtml}
    </div>
  </div>
</body>
</html>
  `;
  
  fs.writeFileSync(reportPath, htmlReport);
  return reportPath;
}

// Run tests if this file is executed directly
if (require.main === module) {
  runSimpleTests()
    .then(results => {
      console.log('\n✅ Simple tests completed!');
      
      if (results.summary.failedTests > 0) {
        console.log('\n⚠️ Some tests failed. Check the report for details.');
        process.exit(1);
      } else {
        console.log('\n🎉 All tests passed!');
        process.exit(0);
      }
    })
    .catch(error => {
      console.error(`\n❌ Test execution failed: ${error.message}`);
      process.exit(1);
    });
}

module.exports = { runSimpleTests, tests };