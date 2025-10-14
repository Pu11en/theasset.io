/**
 * Test Runner for Carousel Functionality Tests
 * 
 * This script runs the comprehensive carousel functionality tests and generates a report.
 */

const { runCarouselFunctionalityTests } = require('./carousel-functionality.test.js');
const fs = require('fs');
const path = require('path');

// Test configuration
const TEST_CONFIG = {
  baseUrl: 'http://localhost:3000',
  timeout: 30000,
  retries: 2
};

/**
 * Check if the development server is running
 */
async function checkServerStatus() {
  console.log('Checking if development server is running...');
  
  try {
    const { chromium } = require('playwright');
    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext();
    const page = await context.newPage();
    
    try {
      await page.goto(TEST_CONFIG.baseUrl, { timeout: 5000 });
      console.log('✓ Development server is running');
      return true;
    } catch (error) {
      console.log('✗ Development server is not running');
      console.log('Please start the development server with: npm run dev');
      return false;
    } finally {
      await browser.close();
    }
  } catch (error) {
    console.log('✗ Could not check server status:', error.message);
    return false;
  }
}

/**
 * Run tests with retries
 */
async function runTestsWithRetries() {
  let lastError = null;
  
  for (let attempt = 1; attempt <= TEST_CONFIG.retries + 1; attempt++) {
    console.log(`\n--- Test Attempt ${attempt} of ${TEST_CONFIG.retries + 1} ---`);
    
    try {
      const report = await runCarouselFunctionalityTests();
      return report;
    } catch (error) {
      lastError = error;
      console.log(`Test attempt ${attempt} failed:`, error.message);
      
      if (attempt < TEST_CONFIG.retries + 1) {
        console.log(`Retrying in 3 seconds...`);
        await new Promise(resolve => setTimeout(resolve, 3000));
      }
    }
  }
  
  throw lastError;
}

/**
 * Generate summary report
 */
function generateSummaryReport(testReport) {
  const summary = {
    timestamp: new Date().toISOString(),
    summary: testReport.summary,
    status: testReport.summary.failedTests === 0 ? 'PASSED' : 'FAILED',
    criticalIssues: testReport.issues.filter(issue => 
      issue.category === 'Navigation Arrows' || 
      issue.category === 'Swipe Gestures'
    ),
    recommendations: testReport.recommendations
  };
  
  return summary;
}

/**
 * Save summary report
 */
function saveSummaryReport(summary) {
  const reportPath = './test-results/carousel-functionality-summary.json';
  
  // Ensure directory exists
  const dir = path.dirname(reportPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  
  fs.writeFileSync(reportPath, JSON.stringify(summary, null, 2));
  console.log(`\nSummary report saved to: ${reportPath}`);
}

/**
 * Print summary to console
 */
function printSummary(summary) {
  console.log('\n========== CAROUSEL FUNCTIONALITY TEST SUMMARY ==========');
  console.log(`Status: ${summary.status}`);
  console.log(`Timestamp: ${summary.timestamp}`);
  console.log(`Total Tests: ${summary.summary.totalTests}`);
  console.log(`Passed: ${summary.summary.passedTests}`);
  console.log(`Failed: ${summary.summary.failedTests}`);
  console.log(`Pass Rate: ${summary.summary.passRate}%`);
  
  if (summary.criticalIssues.length > 0) {
    console.log('\nCRITICAL ISSUES FOUND:');
    summary.criticalIssues.forEach((issue, index) => {
      console.log(`${index + 1}. [${issue.viewport}] ${issue.category}: ${issue.test}`);
    });
  }
  
  if (summary.recommendations.length > 0) {
    console.log('\nRECOMMENDATIONS:');
    summary.recommendations.forEach((rec, index) => {
      console.log(`${index + 1}. ${rec}`);
    });
  }
  
  console.log('\nFor detailed results, see: ./test-results/carousel-functionality-report.json');
  console.log('For screenshots, see: ./test-results/carousel-screenshots/');
}

/**
 * Main function
 */
async function main() {
  console.log('Carousel Functionality Test Runner');
  console.log('=====================================');
  
  try {
    // Check if server is running
    const serverRunning = await checkServerStatus();
    if (!serverRunning) {
      process.exit(1);
    }
    
    // Run tests with retries
    const testReport = await runTestsWithRetries();
    
    // Generate and save summary
    const summary = generateSummaryReport(testReport);
    saveSummaryReport(summary);
    
    // Print summary to console
    printSummary(summary);
    
    // Exit with appropriate code
    if (summary.status === 'PASSED') {
      console.log('\n✓ All carousel functionality tests passed!');
      process.exit(0);
    } else {
      console.log('\n✗ Some carousel functionality tests failed!');
      process.exit(1);
    }
    
  } catch (error) {
    console.error('\nError running carousel functionality tests:', error);
    process.exit(1);
  }
}

// Execute if run directly
if (require.main === module) {
  main();
}

module.exports = {
  main,
  checkServerStatus,
  runTestsWithRetries,
  generateSummaryReport
};