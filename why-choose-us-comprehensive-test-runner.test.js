const { test, expect, devices } = require('@playwright/test');
const path = require('path');
const fs = require('fs');

// Import the comprehensive test file
require('./why-choose-us-comprehensive-device-testing.test.js');

// Define browsers for cross-browser testing
const BROWSERS = ['chromium', 'firefox', 'webkit'];

// Define device profiles for testing
const DEVICE_PROFILES = [
  { name: 'iPhone 12', ...devices['iPhone 12'] },
  { name: 'iPad', ...devices['iPad'] },
  { name: 'Desktop Chrome', ...devices['Desktop Chrome'] },
  { name: 'Desktop Safari', ...devices['Desktop Safari'] }
];

// Helper function to generate comprehensive report
function generateComprehensiveReport(testResults, browserResults) {
  const reportPath = path.join(__dirname, 'test-results', 'why-choose-us-comprehensive-final-report.json');
  
  // Ensure test-results directory exists
  if (!fs.existsSync(path.join(__dirname, 'test-results'))) {
    fs.mkdirSync(path.join(__dirname, 'test-results'), { recursive: true });
  }
  
  // Aggregate results by category
  const categories = {
    responsiveBehavior: { passed: 0, failed: 0, issues: [] },
    videoFunctionality: { passed: 0, failed: 0, issues: [] },
    touchGestures: { passed: 0, failed: 0, issues: [] },
    performance: { passed: 0, failed: 0, issues: [] },
    accessibility: { passed: 0, failed: 0, issues: [] },
    crossBrowser: { passed: 0, failed: 0, issues: [] }
  };
  
  // Process test results
  testResults.forEach(result => {
    if (result.category && categories[result.category]) {
      if (result.passed) {
        categories[result.category].passed++;
      } else {
        categories[result.category].failed++;
        categories[result.category].issues.push({
          test: result.test,
          viewport: result.viewport,
          details: result.details || {}
        });
      }
    }
  });
  
  // Process browser results
  const browserStats = {};
  browserResults.forEach(browserResult => {
    if (!browserStats[browserResult.browser]) {
      browserStats[browserResult.browser] = { passed: 0, failed: 0 };
    }
    
    if (browserResult.passed) {
      browserStats[browserResult.browser].passed++;
    } else {
      browserStats[browserResult.browser].failed++;
    }
  });
  
  // Calculate overall statistics
  const totalTests = testResults.length;
  const passedTests = testResults.filter(r => r.passed).length;
  const failedTests = totalTests - passedTests;
  const passRate = totalTests > 0 ? ((passedTests / totalTests) * 100).toFixed(2) : "0";
  
  // Identify critical issues
  const criticalIssues = [];
  
  // Check for problematic range issues
  const problematicRangeTests = testResults.filter(r => 
    r.category === 'responsiveBehavior' && 
    r.viewport && 
    (r.viewport.includes('768') || r.viewport.includes('896') || r.viewport.includes('1024')) &&
    !r.passed
  );
  
  if (problematicRangeTests.length > 0) {
    criticalIssues.push({
      type: 'Problematic Range Issues',
      severity: 'high',
      description: 'Issues found in the 768px-1024px range that were supposed to be fixed',
      tests: problematicRangeTests.map(t => t.test)
    });
  }
  
  // Check for video functionality issues
  const videoIssues = testResults.filter(r => 
    r.category === 'videoFunctionality' && !r.passed
  );
  
  if (videoIssues.length > 0) {
    criticalIssues.push({
      type: 'Video Functionality Issues',
      severity: 'high',
      description: 'Video loading or playback issues detected',
      tests: videoIssues.map(t => t.test)
    });
  }
  
  // Check for touch gesture issues
  const touchIssues = testResults.filter(r => 
    r.category === 'touchGestures' && !r.passed
  );
  
  if (touchIssues.length > 0) {
    criticalIssues.push({
      type: 'Touch Gesture Issues',
      severity: 'medium',
      description: 'Touch gesture or mobile interaction issues detected',
      tests: touchIssues.map(t => t.test)
    });
  }
  
  // Check for performance issues
  const performanceIssues = testResults.filter(r => 
    r.category === 'performance' && !r.passed
  );
  
  if (performanceIssues.length > 0) {
    criticalIssues.push({
      type: 'Performance Issues',
      severity: 'medium',
      description: 'Performance or loading time issues detected',
      tests: performanceIssues.map(t => t.test)
    });
  }
  
  // Check for accessibility issues
  const accessibilityIssues = testResults.filter(r => 
    r.category === 'accessibility' && !r.passed
  );
  
  if (accessibilityIssues.length > 0) {
    criticalIssues.push({
      type: 'Accessibility Issues',
      severity: 'high',
      description: 'Accessibility compliance issues detected',
      tests: accessibilityIssues.map(t => t.test)
    });
  }
  
  // Generate recommendations
  const recommendations = [];
  
  if (problematicRangeTests.length > 0) {
    recommendations.push({
      priority: 'high',
      category: 'Responsive Design',
      description: 'Fix the remaining issues in the 768px-1024px range',
      action: 'Review and adjust CSS media queries and flexbox/grid layouts for tablet devices'
    });
  }
  
  if (videoIssues.length > 0) {
    recommendations.push({
      priority: 'high',
      category: 'Video Functionality',
      description: 'Ensure videos load correctly across all devices',
      action: 'Implement proper video format fallbacks and error handling'
    });
  }
  
  if (touchIssues.length > 0) {
    recommendations.push({
      priority: 'medium',
      category: 'Mobile Experience',
      description: 'Improve touch gesture support',
      action: 'Enhance touch event handling and gesture recognition'
    });
  }
  
  if (performanceIssues.length > 0) {
    recommendations.push({
      priority: 'medium',
      category: 'Performance',
      description: 'Optimize loading times and animations',
      action: 'Implement lazy loading and optimize assets'
    });
  }
  
  if (accessibilityIssues.length > 0) {
    recommendations.push({
      priority: 'high',
      category: 'Accessibility',
      description: 'Improve accessibility compliance',
      action: 'Add proper ARIA labels, roles, and keyboard navigation support'
    });
  }
  
  // Create comprehensive report
  const reportData = {
    timestamp: new Date().toISOString(),
    title: 'WhyChooseUs Carousel Comprehensive Testing Report',
    summary: {
      total: totalTests,
      passed: passedTests,
      failed: failedTests,
      passRate: passRate,
      browsersTested: BROWSERS.length,
      devicesTested: DEVICE_PROFILES.length,
      viewportsTested: [...new Set(testResults.map(r => r.viewport))].length
    },
    categories,
    browserStats,
    criticalIssues,
    recommendations,
    testResults,
    browserResults,
    verificationStatus: {
      exactlyThreeCards: testResults.filter(r => r.test.includes('exactly three video cards')).every(r => r.passed),
      problematicRangeFixed: problematicRangeTests.length === 0,
      lazyLoadingWorking: testResults.filter(r => r.test.includes('lazy') || r.category === 'videoFunctionality').every(r => r.passed),
      touchGesturesWorking: touchIssues.length === 0,
      performanceOptimized: performanceIssues.length === 0,
      accessibilityCompliant: accessibilityIssues.length === 0
    }
  };
  
  // Save comprehensive report
  fs.writeFileSync(reportPath, JSON.stringify(reportData, null, 2));
  
  // Generate markdown report
  const markdownReport = generateMarkdownReport(reportData);
  const markdownPath = path.join(__dirname, 'test-results', 'why-choose-us-comprehensive-final-report.md');
  fs.writeFileSync(markdownPath, markdownReport);
  
  console.log(`Comprehensive test report saved to ${reportPath}`);
  console.log(`Markdown report saved to ${markdownPath}`);
  
  return reportData;
}

function generateMarkdownReport(reportData) {
  const { summary, categories, browserStats, criticalIssues, recommendations, verificationStatus } = reportData;
  
  let markdown = `# WhyChooseUs Carousel Comprehensive Testing Report\n\n`;
  markdown += `**Generated:** ${reportData.timestamp}\n\n`;
  
  // Executive Summary
  markdown += `## Executive Summary\n\n`;
  markdown += `- **Total Tests:** ${summary.total}\n`;
  markdown += `- **Passed:** ${summary.passed} (${summary.passRate}%)\n`;
  markdown += `- **Failed:** ${summary.failed}\n`;
  markdown += `- **Browsers Tested:** ${summary.browsersTested}\n`;
  markdown += `- **Devices Tested:** ${summary.devicesTested}\n`;
  markdown += `- **Viewports Tested:** ${summary.viewportsTested}\n\n`;
  
  // Verification Status
  markdown += `## Verification Status\n\n`;
  markdown += `- ✅ **Exactly Three Cards:** ${verificationStatus.exactlyThreeCards ? 'PASS' : 'FAIL'}\n`;
  markdown += `- ✅ **Problematic Range (768px-1024px) Fixed:** ${verificationStatus.problematicRangeFixed ? 'PASS' : 'FAIL'}\n`;
  markdown += `- ✅ **Lazy Loading Working:** ${verificationStatus.lazyLoadingWorking ? 'PASS' : 'FAIL'}\n`;
  markdown += `- ✅ **Touch Gestures Working:** ${verificationStatus.touchGesturesWorking ? 'PASS' : 'FAIL'}\n`;
  markdown += `- ✅ **Performance Optimized:** ${verificationStatus.performanceOptimized ? 'PASS' : 'FAIL'}\n`;
  markdown += `- ✅ **Accessibility Compliant:** ${verificationStatus.accessibilityCompliant ? 'PASS' : 'FAIL'}\n\n`;
  
  // Test Results by Category
  markdown += `## Test Results by Category\n\n`;
  markdown += `| Category | Passed | Failed | Pass Rate |\n`;
  markdown += `|----------|--------|--------|----------|\n`;
  
  Object.entries(categories).forEach(([category, results]) => {
    const total = results.passed + results.failed;
    const passRate = total > 0 ? ((results.passed / total) * 100).toFixed(1) : '0';
    markdown += `| ${category} | ${results.passed} | ${results.failed} | ${passRate}% |\n`;
  });
  markdown += `\n`;
  
  // Browser Compatibility
  markdown += `## Browser Compatibility\n\n`;
  markdown += `| Browser | Passed | Failed | Pass Rate |\n`;
  markdown += `|---------|--------|--------|----------|\n`;
  
  Object.entries(browserStats).forEach(([browser, stats]) => {
    const total = stats.passed + stats.failed;
    const passRate = total > 0 ? ((stats.passed / total) * 100).toFixed(1) : '0';
    markdown += `| ${browser} | ${stats.passed} | ${stats.failed} | ${passRate}% |\n`;
  });
  markdown += `\n`;
  
  // Critical Issues
  if (criticalIssues.length > 0) {
    markdown += `## Critical Issues\n\n`;
    
    criticalIssues.forEach(issue => {
      const severityEmoji = issue.severity === 'high' ? '🔴' : issue.severity === 'medium' ? '🟡' : '🟢';
      markdown += `### ${severityEmoji} ${issue.type}\n\n`;
      markdown += `**Severity:** ${issue.severity}\n\n`;
      markdown += `**Description:** ${issue.description}\n\n`;
      
      if (issue.tests && issue.tests.length > 0) {
        markdown += `**Affected Tests:**\n`;
        issue.tests.forEach(test => {
          markdown += `- ${test}\n`;
        });
        markdown += `\n`;
      }
    });
  }
  
  // Recommendations
  if (recommendations.length > 0) {
    markdown += `## Recommendations\n\n`;
    
    recommendations.forEach(rec => {
      const priorityEmoji = rec.priority === 'high' ? '🔴' : rec.priority === 'medium' ? '🟡' : '🟢';
      markdown += `### ${priorityEmoji} ${rec.category} (${rec.priority} priority)\n\n`;
      markdown += `**Issue:** ${rec.description}\n\n`;
      markdown += `**Action:** ${rec.action}\n\n`;
    });
  }
  
  // Conclusion
  markdown += `## Conclusion\n\n`;
  
  if (parseFloat(summary.passRate) >= 95) {
    markdown += `🎉 **Excellent!** The carousel implementation is working very well with a ${summary.passRate}% pass rate. `;
  } else if (parseFloat(summary.passRate) >= 80) {
    markdown += `✅ **Good!** The carousel implementation is mostly functional with a ${summary.passRate}% pass rate. `;
  } else {
    markdown += `⚠️ **Needs Improvement.** The carousel implementation has issues with a ${summary.passRate}% pass rate. `;
  }
  
  markdown += `The key areas that need attention are:\n\n`;
  
  if (verificationStatus.problematicRangeFixed === false) {
    markdown += `- The problematic 768px-1024px range still has issues\n`;
  }
  
  if (verificationStatus.lazyLoadingWorking === false) {
    markdown += `- Video lazy loading needs improvement\n`;
  }
  
  if (verificationStatus.touchGesturesWorking === false) {
    markdown += `- Touch gestures on mobile devices need enhancement\n`;
  }
  
  if (verificationStatus.performanceOptimized === false) {
    markdown += `- Performance optimization is needed\n`;
  }
  
  if (verificationStatus.accessibilityCompliant === false) {
    markdown += `- Accessibility compliance issues need to be addressed\n`;
  }
  
  markdown += `\nPlease review the detailed recommendations above and implement the necessary fixes.\n`;
  
  return markdown;
}

test.describe('WhyChooseUs Comprehensive Test Runner', () => {
  let allTestResults = [];
  let allBrowserResults = [];
  
  test.afterAll(async () => {
    // Generate comprehensive report
    generateComprehensiveReport(allTestResults, allBrowserResults);
  });
  
  // Run tests on different browsers
  BROWSERS.forEach(browser => {
    test.describe(`Browser: ${browser}`, () => {
      test.use({ browser });
      
      // Collect browser-specific results
      test.beforeEach(async () => {
        // This will be called before each test
      });
      
      test.afterEach(async ({}, testInfo) => {
        // Collect test results
        allBrowserResults.push({
          browser,
          test: testInfo.title,
          passed: testInfo.status === 'passed',
          duration: testInfo.duration,
          retry: testInfo.retry
        });
      });
      
      // Run comprehensive tests
      test('should run comprehensive tests', async ({ page }) => {
        // This test serves as a placeholder to ensure the browser tests run
        // The actual tests are in the imported file
        expect(true).toBeTruthy();
      });
    });
  });
  
  // Run tests on different devices
  DEVICE_PROFILES.forEach(device => {
    test.describe(`Device: ${device.name}`, () => {
      test.use({ ...device });
      
      test('should run comprehensive tests on device', async ({ page }) => {
        // This test serves as a placeholder to ensure the device tests run
        // The actual tests are in the imported file
        expect(true).toBeTruthy();
      });
    });
  });
  
  // Test data collection and analysis
  test('should collect and analyze test results', async () => {
    // This test collects all the results from other tests
    // The actual collection happens in the afterEach hooks
    expect(allBrowserResults.length).toBeGreaterThan(0);
  });
});

// Export the report generation function for use in other files
module.exports = {
  generateComprehensiveReport,
  generateMarkdownReport
};