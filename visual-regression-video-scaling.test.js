/**
 * Visual Regression Tests for Video Scaling Fix
 * Takes screenshots at different breakpoints and browsers for visual comparison
 */

const { chromium, firefox, webkit } = require('playwright');
const fs = require('fs');
const path = require('path');

// Configuration
const BASE_URL = 'http://localhost:3001';
const TEST_RESULTS_DIR = 'test-results';
const SCREENSHOTS_DIR = path.join(TEST_RESULTS_DIR, 'screenshots', 'visual-regression');

// Ensure directories exist
if (!fs.existsSync(TEST_RESULTS_DIR)) fs.mkdirSync(TEST_RESULTS_DIR, { recursive: true });
if (!fs.existsSync(SCREENSHOTS_DIR)) fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });

// Viewports to test
const viewports = [
  { name: 'mobile', width: 375, height: 667 },
  { name: 'mobile-landscape', width: 667, height: 375 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'tablet-landscape', width: 1024, height: 768 },
  { name: 'desktop', width: 1200, height: 800 },
  { name: 'desktop-wide', width: 1920, height: 1080 }
];

// Browsers to test
const browsers = [
  { name: 'chromium', instance: chromium },
  { name: 'firefox', instance: firefox },
  { name: 'webkit', instance: webkit }
];

// Test scenarios
const scenarios = [
  {
    name: 'zero-risk-card-initial',
    description: 'Zero Risk card when first loaded',
    actions: async (page) => {
      await page.goto(BASE_URL);
      await page.waitForSelector('#why-choose-us', { timeout: 10000 });
      await page.evaluate(() => {
        document.getElementById('why-choose-us').scrollIntoView({ behavior: 'smooth' });
      });
      await page.waitForTimeout(1000);
      await page.waitForSelector('.carousel-card-zero-risk video', { timeout: 5000 });
      await page.waitForTimeout(500); // Wait for video to load
    }
  },
  {
    name: 'zero-risk-card-active',
    description: 'Zero Risk card when active/focused',
    actions: async (page) => {
      await page.goto(BASE_URL);
      await page.waitForSelector('#why-choose-us', { timeout: 10000 });
      await page.evaluate(() => {
        document.getElementById('why-choose-us').scrollIntoView({ behavior: 'smooth' });
      });
      await page.waitForTimeout(1000);
      await page.waitForSelector('.carousel-card-zero-risk video', { timeout: 5000 });
      
      // Simulate mouse hover to trigger active state
      const zeroRiskCard = page.locator('.carousel-card-zero-risk').first();
      await zeroRiskCard.hover();
      await page.waitForTimeout(500);
    }
  },
  {
    name: 'standard-card-comparison',
    description: 'Standard card for comparison with Zero Risk',
    actions: async (page) => {
      await page.goto(BASE_URL);
      await page.waitForSelector('#why-choose-us', { timeout: 10000 });
      await page.evaluate(() => {
        document.getElementById('why-choose-us').scrollIntoView({ behavior: 'smooth' });
      });
      await page.waitForTimeout(1000);
      
      // Navigate to a standard card
      await page.click('[aria-label="Go to next slide"]');
      await page.waitForTimeout(500);
    }
  },
  {
    name: 'carousel-navigation-test',
    description: 'Testing carousel navigation with Zero Risk card',
    actions: async (page) => {
      await page.goto(BASE_URL);
      await page.waitForSelector('#why-choose-us', { timeout: 10000 });
      await page.evaluate(() => {
        document.getElementById('why-choose-us').scrollIntoView({ behavior: 'smooth' });
      });
      await page.waitForTimeout(1000);
      
      // Navigate through different cards
      await page.click('[aria-label="Go to next slide"]');
      await page.waitForTimeout(500);
      await page.click('[aria-label="Go to next slide"]');
      await page.waitForTimeout(500);
      await page.click('[aria-label="Go to previous slide"]');
      await page.waitForTimeout(500);
      await page.click('[aria-label="Go to previous slide"]');
      await page.waitForTimeout(500);
    }
  },
  {
    name: 'text-readability-test',
    description: 'Testing text readability over video background',
    actions: async (page) => {
      await page.goto(BASE_URL);
      await page.waitForSelector('#why-choose-us', { timeout: 10000 });
      await page.evaluate(() => {
        document.getElementById('why-choose-us').scrollIntoView({ behavior: 'smooth' });
      });
      await page.waitForTimeout(1000);
      await page.waitForSelector('.carousel-card-zero-risk video', { timeout: 5000 });
      await page.waitForTimeout(1000); // Ensure video is fully loaded
    }
  }
];

// Utility functions
const utils = {
  async takeScreenshot(page, scenario, viewport, browser) {
    const timestamp = new Date().getTime();
    const filename = `${scenario.name}-${viewport.name}-${browser.name}-${timestamp}.png`;
    const filepath = path.join(SCREENSHOTS_DIR, filename);
    
    await page.screenshot({ 
      path: filepath, 
      fullPage: false,
      clip: {
        x: 0,
        y: 0,
        width: viewport.width,
        height: viewport.height
      }
    });
    
    return filepath;
  },
  
  async getElementDimensions(page, selector) {
    return await page.evaluate((sel) => {
      const element = document.querySelector(sel);
      if (!element) return null;
      
      const rect = element.getBoundingClientRect();
      return {
        width: rect.width,
        height: rect.height,
        aspectRatio: rect.width / rect.height,
        top: rect.top,
        left: rect.left
      };
    }, selector);
  },
  
  async getComputedStyle(page, selector, property) {
    return await page.evaluate((sel, prop) => {
      const element = document.querySelector(sel);
      if (!element) return null;
      return window.getComputedStyle(element).getPropertyValue(prop);
    }, selector, property);
  }
};

// Main test runner
async function runVisualRegressionTests() {
  console.log('Starting visual regression tests for video scaling...\n');
  
  const results = {
    timestamp: new Date().toISOString(),
    summary: {
      totalScreenshots: 0,
      browsers: browsers.length,
      viewports: viewports.length,
      scenarios: scenarios.length
    },
    screenshots: [],
    measurements: []
  };
  
  for (const browser of browsers) {
    console.log(`\n========== Testing on ${browser.name.toUpperCase()} ==========`);
    
    let browserInstance;
    try {
      browserInstance = await browser.instance.launch();
      const context = await browserInstance.newContext();
      
      for (const viewport of viewports) {
        console.log(`\n--- Viewport: ${viewport.name} (${viewport.width}x${viewport.height}) ---`);
        
        const page = await context.newPage();
        await page.setViewportSize(viewport);
        
        for (const scenario of scenarios) {
          console.log(`Running scenario: ${scenario.name}`);
          
          try {
            // Execute scenario actions
            await scenario.actions(page);
            
            // Take screenshot
            const screenshotPath = await utils.takeScreenshot(page, scenario, viewport, browser);
            results.screenshots.push(screenshotPath);
            results.summary.totalScreenshots++;
            
            // Collect measurements for analysis
            if (scenario.name.includes('zero-risk')) {
              const zeroRiskCard = await utils.getElementDimensions(page, '.carousel-card-zero-risk');
              const videoElement = await utils.getElementDimensions(page, '.carousel-card-zero-risk video');
              const objectFit = await utils.getComputedStyle(page, '.carousel-card-zero-risk video', 'object-fit');
              const aspectRatio = await utils.getComputedStyle(page, '.carousel-card-zero-risk', 'aspect-ratio');
              
              if (zeroRiskCard && videoElement) {
                results.measurements.push({
                  scenario: scenario.name,
                  browser: browser.name,
                  viewport: viewport.name,
                  cardDimensions: zeroRiskCard,
                  videoDimensions: videoElement,
                  objectFit,
                  aspectRatio,
                  timestamp: new Date().toISOString()
                });
              }
            }
            
            if (scenario.name.includes('standard-card')) {
              const standardCard = await utils.getElementDimensions(page, '.carousel-card-standard');
              const aspectRatio = await utils.getComputedStyle(page, '.carousel-card-standard', 'aspect-ratio');
              
              if (standardCard) {
                results.measurements.push({
                  scenario: scenario.name,
                  browser: browser.name,
                  viewport: viewport.name,
                  cardDimensions: standardCard,
                  aspectRatio,
                  timestamp: new Date().toISOString()
                });
              }
            }
            
            console.log(`✅ Screenshot captured: ${path.basename(screenshotPath)}`);
            
          } catch (error) {
            console.log(`❌ Error in scenario ${scenario.name}: ${error.message}`);
          }
        }
        
        await page.close();
      }
      
      await context.close();
      await browserInstance.close();
      
    } catch (error) {
      console.log(`❌ Browser ${browser.name} failed to launch: ${error.message}`);
    }
  }
  
  // Generate HTML report
  const htmlReport = generateHtmlReport(results);
  const reportPath = path.join(TEST_RESULTS_DIR, 'visual-regression-report.html');
  fs.writeFileSync(reportPath, htmlReport);
  
  // Save JSON data
  const jsonReportPath = path.join(TEST_RESULTS_DIR, 'visual-regression-data.json');
  fs.writeFileSync(jsonReportPath, JSON.stringify(results, null, 2));
  
  console.log('\n========== Visual Regression Summary ==========');
  console.log(`Total screenshots captured: ${results.summary.totalScreenshots}`);
  console.log(`HTML report saved to: ${reportPath}`);
  console.log(`JSON data saved to: ${jsonReportPath}`);
  
  return results;
}

// Generate HTML report for easy viewing
function generateHtmlReport(results) {
  const screenshots = results.screenshots.map(screenshot => {
    const filename = path.basename(screenshot);
    const parts = filename.split('-');
    const scenario = parts.slice(0, -3).join('-');
    const viewport = parts[parts.length - 3];
    const browser = parts[parts.length - 2];
    
    return `
      <div class="screenshot">
        <h3>${scenario} - ${viewport} - ${browser}</h3>
        <img src="../${screenshot}" alt="${scenario}" />
      </div>
    `;
  }).join('');
  
  const measurements = results.measurements.map(measurement => {
    return `
      <tr>
        <td>${measurement.scenario}</td>
        <td>${measurement.browser}</td>
        <td>${measurement.viewport}</td>
        <td>${measurement.cardDimensions ? `${measurement.cardDimensions.width.toFixed(0)}x${measurement.cardDimensions.height.toFixed(0)}` : 'N/A'}</td>
        <td>${measurement.cardDimensions ? measurement.cardDimensions.aspectRatio.toFixed(2) : 'N/A'}</td>
        <td>${measurement.videoDimensions ? `${measurement.videoDimensions.width.toFixed(0)}x${measurement.videoDimensions.height.toFixed(0)}` : 'N/A'}</td>
        <td>${measurement.objectFit || 'N/A'}</td>
        <td>${measurement.aspectRatio || 'N/A'}</td>
      </tr>
    `;
  }).join('');
  
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Video Scaling Visual Regression Report</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      margin: 0;
      padding: 20px;
      background-color: #f5f5f5;
    }
    .container {
      max-width: 1200px;
      margin: 0 auto;
      background: white;
      padding: 20px;
      border-radius: 8px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }
    h1 {
      color: #333;
      border-bottom: 2px solid #3B82F6;
      padding-bottom: 10px;
    }
    h2 {
      color: #555;
      margin-top: 30px;
    }
    .summary {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 20px;
      margin: 20px 0;
    }
    .summary-item {
      background: #f8f9fa;
      padding: 15px;
      border-radius: 6px;
      text-align: center;
    }
    .summary-item h3 {
      margin: 0 0 5px 0;
      color: #3B82F6;
    }
    .summary-item p {
      margin: 0;
      font-size: 24px;
      font-weight: bold;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 20px 0;
    }
    th, td {
      padding: 10px;
      text-align: left;
      border-bottom: 1px solid #ddd;
    }
    th {
      background-color: #f2f2f2;
      font-weight: 600;
    }
    .screenshots {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 20px;
      margin-top: 20px;
    }
    .screenshot {
      border: 1px solid #ddd;
      border-radius: 6px;
      overflow: hidden;
    }
    .screenshot h3 {
      margin: 0;
      padding: 10px;
      background: #f8f9fa;
      font-size: 14px;
    }
    .screenshot img {
      width: 100%;
      height: auto;
      display: block;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>Video Scaling Visual Regression Report</h1>
    <p>Generated on: ${new Date(results.timestamp).toLocaleString()}</p>
    
    <h2>Summary</h2>
    <div class="summary">
      <div class="summary-item">
        <h3>Total Screenshots</h3>
        <p>${results.summary.totalScreenshots}</p>
      </div>
      <div class="summary-item">
        <h3>Browsers</h3>
        <p>${results.summary.browsers}</p>
      </div>
      <div class="summary-item">
        <h3>Viewports</h3>
        <p>${results.summary.viewports}</p>
      </div>
      <div class="summary-item">
        <h3>Scenarios</h3>
        <p>${results.summary.scenarios}</p>
      </div>
    </div>
    
    <h2>Measurements</h2>
    <table>
      <thead>
        <tr>
          <th>Scenario</th>
          <th>Browser</th>
          <th>Viewport</th>
          <th>Card Size</th>
          <th>Card Aspect Ratio</th>
          <th>Video Size</th>
          <th>Object Fit</th>
          <th>CSS Aspect Ratio</th>
        </tr>
      </thead>
      <tbody>
        ${measurements}
      </tbody>
    </table>
    
    <h2>Screenshots</h2>
    <div class="screenshots">
      ${screenshots}
    </div>
  </div>
</body>
</html>
  `;
}

// Run tests if this file is executed directly
if (require.main === module) {
  runVisualRegressionTests().catch(console.error);
}

module.exports = { runVisualRegressionTests, scenarios, viewports, browsers };