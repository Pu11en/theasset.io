/**
 * Master Test Runner for Video Scaling Fix
 * Executes all test suites and generates a comprehensive report
 */

const { runTests } = require('./video-scaling-comprehensive.test.js');
const { runVisualRegressionTests } = require('./visual-regression-video-scaling.test.js');
const { generateManualTestingGuide } = require('./manual-testing-video-scaling.test.js');
const fs = require('fs');
const path = require('path');

// Test results directory
const TEST_RESULTS_DIR = 'test-results';
if (!fs.existsSync(TEST_RESULTS_DIR)) {
  fs.mkdirSync(TEST_RESULTS_DIR, { recursive: true });
}

// Test execution configuration
const testConfig = {
  runAutomatedTests: true,
  runVisualRegressionTests: true,
  generateManualGuide: true,
  baseUrl: 'http://localhost:3001'
};

// Test runner
async function runAllTests() {
  console.log('======================================================');
  console.log('VIDEO SCALING FIX - COMPREHENSIVE TEST SUITE');
  console.log('======================================================');
  console.log(`Started at: ${new Date().toLocaleString()}`);
  console.log(`Base URL: ${testConfig.baseUrl}`);
  console.log('======================================================\n');
  
  const results = {
    timestamp: new Date().toISOString(),
    config: testConfig,
    automatedTests: null,
    visualRegressionTests: null,
    manualTestingGuide: null,
    summary: {
      totalTests: 0,
      passedTests: 0,
      failedTests: 0,
      totalScreenshots: 0
    },
    issues: [],
    recommendations: []
  };
  
  try {
    // 1. Run automated tests
    if (testConfig.runAutomatedTests) {
      console.log('\n🔄 Running automated tests...\n');
      try {
        results.automatedTests = await runTests();
        results.summary.totalTests += results.automatedTests.summary.totalTests;
        results.summary.passedTests += results.automatedTests.summary.passedTests;
        results.summary.failedTests += results.automatedTests.summary.failedTests;
        
        console.log(`✅ Automated tests completed: ${results.automatedTests.summary.passedTests}/${results.automatedTests.summary.totalTests} passed`);
      } catch (error) {
        console.log(`❌ Automated tests failed: ${error.message}`);
        results.issues.push({
          type: 'Automated Tests',
          message: error.message
        });
      }
    }
    
    // 2. Run visual regression tests
    if (testConfig.runVisualRegressionTests) {
      console.log('\n🔄 Running visual regression tests...\n');
      try {
        results.visualRegressionTests = await runVisualRegressionTests();
        results.summary.totalScreenshots += results.visualRegressionTests.summary.totalScreenshots;
        
        console.log(`✅ Visual regression tests completed: ${results.visualRegressionTests.summary.totalScreenshots} screenshots captured`);
      } catch (error) {
        console.log(`❌ Visual regression tests failed: ${error.message}`);
        results.issues.push({
          type: 'Visual Regression Tests',
          message: error.message
        });
      }
    }
    
    // 3. Generate manual testing guide
    if (testConfig.generateManualGuide) {
      console.log('\n🔄 Generating manual testing guide...\n');
      try {
        results.manualTestingGuide = await generateManualTestingGuide();
        console.log(`✅ Manual testing guide generated: ${results.manualTestingGuide.outputPath}`);
      } catch (error) {
        console.log(`❌ Manual testing guide generation failed: ${error.message}`);
        results.issues.push({
          type: 'Manual Testing Guide',
          message: error.message
        });
      }
    }
    
    // 4. Analyze results and generate recommendations
    console.log('\n🔄 Analyzing results and generating recommendations...\n');
    analyzeResults(results);
    
    // 5. Generate comprehensive report
    console.log('\n🔄 Generating comprehensive report...\n');
    const reportPath = generateComprehensiveReport(results);
    
    console.log('\n======================================================');
    console.log('TEST EXECUTION SUMMARY');
    console.log('======================================================');
    console.log(`Total Tests: ${results.summary.totalTests}`);
    console.log(`Passed: ${results.summary.passedTests}`);
    console.log(`Failed: ${results.summary.failedTests}`);
    console.log(`Success Rate: ${results.summary.totalTests > 0 ? ((results.summary.passedTests / results.summary.totalTests) * 100).toFixed(2) : 0}%`);
    console.log(`Screenshots Captured: ${results.summary.totalScreenshots}`);
    console.log(`Issues Found: ${results.issues.length}`);
    console.log(`Recommendations: ${results.recommendations.length}`);
    console.log(`Report saved to: ${reportPath}`);
    console.log('======================================================');
    
    return results;
    
  } catch (error) {
    console.log(`❌ Test execution failed: ${error.message}`);
    results.issues.push({
      type: 'Test Execution',
      message: error.message
    });
    return results;
  }
}

// Analyze test results and generate recommendations
function analyzeResults(results) {
  // Analyze automated test results
  if (results.automatedTests) {
    const { tests } = results.automatedTests.results;
    
    // Check for aspect ratio issues
    const aspectRatioTests = tests.filter(t => t.suite === 'Aspect Ratio Verification');
    const failedAspectRatioTests = aspectRatioTests.filter(t => !t.passed);
    
    if (failedAspectRatioTests.length > 0) {
      results.issues.push({
        type: 'Aspect Ratio',
        message: `${failedAspectRatioTests.length} aspect ratio tests failed`,
        details: failedAspectRatioTests
      });
      results.recommendations.push('Review CSS aspect-ratio implementation for Zero Risk and standard cards');
    }
    
    // Check for video display issues
    const videoDisplayTests = tests.filter(t => t.suite === 'Video Display Verification');
    const failedVideoDisplayTests = videoDisplayTests.filter(t => !t.passed);
    
    if (failedVideoDisplayTests.length > 0) {
      results.issues.push({
        type: 'Video Display',
        message: `${failedVideoDisplayTests.length} video display tests failed`,
        details: failedVideoDisplayTests
      });
      results.recommendations.push('Check video object-fit and container styling');
    }
    
    // Check for responsive design issues
    const responsiveTests = tests.filter(t => t.suite === 'Responsive Design Verification');
    const failedResponsiveTests = responsiveTests.filter(t => !t.passed);
    
    if (failedResponsiveTests.length > 0) {
      results.issues.push({
        type: 'Responsive Design',
        message: `${failedResponsiveTests.length} responsive design tests failed`,
        details: failedResponsiveTests
      });
      results.recommendations.push('Review responsive breakpoints and viewport calculations');
    }
  }
  
  // Check if success rate is below threshold
  const successRate = results.summary.totalTests > 0 ? 
    (results.summary.passedTests / results.summary.totalTests) : 0;
  
  if (successRate < 0.9) {
    results.recommendations.push('Test success rate is below 90%. Review failing tests and fix issues.');
  }
  
  // Add positive recommendations if everything looks good
  if (results.issues.length === 0) {
    results.recommendations.push('All tests passed! The video scaling fix is working correctly.');
    results.recommendations.push('Consider adding these tests to your CI/CD pipeline for future changes.');
  }
}

// Generate comprehensive HTML report
function generateComprehensiveReport(results) {
  const reportPath = path.join(TEST_RESULTS_DIR, 'video-scaling-comprehensive-report.html');
  
  // Generate test results HTML
  const testResultsHtml = results.automatedTests ? 
    Object.entries(results.automatedTests.results).map(([browser, data]) => {
      const testsHtml = data.tests.map(test => `
        <tr class="${test.passed ? 'test-passed' : 'test-failed'}">
          <td>${browser}</td>
          <td>${test.suite}</td>
          <td>${test.name}</td>
          <td>${test.passed ? '✅ PASSED' : '❌ FAILED'}</td>
          <td>${test.error || 'N/A'}</td>
        </tr>
      `).join('');
      
      return `
        <div class="browser-results">
          <h3>${browser.toUpperCase()} Results</h3>
          <table>
            <thead>
              <tr>
                <th>Browser</th>
                <th>Test Suite</th>
                <th>Test Name</th>
                <th>Status</th>
                <th>Error</th>
              </tr>
            </thead>
            <tbody>
              ${testsHtml}
            </tbody>
          </table>
        </div>
      `;
    }).join('') : '<p>No automated test results available</p>';
  
  // Generate issues HTML
  const issuesHtml = results.issues.length > 0 ? 
    results.issues.map(issue => `
      <div class="issue">
        <h4>${issue.type}</h4>
        <p>${issue.message}</p>
        ${issue.details ? `<pre>${JSON.stringify(issue.details, null, 2)}</pre>` : ''}
      </div>
    `).join('') : '<p>No issues found</p>';
  
  // Generate recommendations HTML
  const recommendationsHtml = results.recommendations.length > 0 ?
    results.recommendations.map(rec => `<li>${rec}</li>`).join('') : '<li>No recommendations</li>';
  
  // Generate screenshots HTML
  const screenshotsHtml = results.visualRegressionTests ?
    results.visualRegressionTests.screenshots.map(screenshot => {
      const filename = path.basename(screenshot);
      return `
        <div class="screenshot">
          <img src="./screenshots/visual-regression/${filename}" alt="${filename}" />
          <p>${filename}</p>
        </div>
      `;
    }).join('') : '<p>No screenshots available</p>';
  
  // Complete HTML report
  const htmlReport = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Video Scaling Fix - Comprehensive Test Report</title>
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
    h2 {
      color: #34495e;
      margin-top: 30px;
    }
    h3 {
      color: #2980b9;
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
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 20px 0;
      background: white;
      box-shadow: 0 2px 4px rgba(0,0,0,0.05);
    }
    th, td {
      padding: 12px;
      text-align: left;
      border-bottom: 1px solid #ddd;
    }
    th {
      background-color: #f2f2f2;
      font-weight: 600;
    }
    .test-passed { background-color: #d4edda; }
    .test-failed { background-color: #f8d7da; }
    .issue {
      background: #fff3cd;
      border: 1px solid #ffeaa7;
      border-radius: 4px;
      padding: 15px;
      margin: 10px 0;
    }
    .issue h4 {
      margin: 0 0 10px 0;
      color: #856404;
    }
    .recommendations {
      background: #d1ecf1;
      border: 1px solid #bee5eb;
      border-radius: 4px;
      padding: 15px;
      margin: 20px 0;
    }
    .recommendations h3 {
      margin: 0 0 10px 0;
      color: #0c5460;
    }
    .screenshots {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
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
    pre {
      background: #f8f9fa;
      padding: 10px;
      border-radius: 4px;
      overflow-x: auto;
      font-size: 12px;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>Video Scaling Fix - Comprehensive Test Report</h1>
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
        <p>${results.summary.totalTests > 0 ? ((results.summary.passedTests / results.summary.totalTests) * 100).toFixed(2) : 0}%</p>
      </div>
      <div class="summary-item">
        <h3>Screenshots</h3>
        <p>${results.summary.totalScreenshots}</p>
      </div>
    </div>
    
    <h2>Test Results</h2>
    ${testResultsHtml}
    
    <h2>Issues Found</h2>
    ${issuesHtml}
    
    <div class="recommendations">
      <h3>Recommendations</h3>
      <ul>
        ${recommendationsHtml}
      </ul>
    </div>
    
    <h2>Screenshots</h2>
    ${screenshotsHtml}
  </div>
</body>
</html>
  `;
  
  fs.writeFileSync(reportPath, htmlReport);
  
  // Also save JSON version for programmatic access
  const jsonReportPath = path.join(TEST_RESULTS_DIR, 'video-scaling-comprehensive-report.json');
  fs.writeFileSync(jsonReportPath, JSON.stringify(results, null, 2));
  
  return reportPath;
}

// Run tests if this file is executed directly
if (require.main === module) {
  runAllTests()
    .then(results => {
      console.log('\n✅ All tests completed successfully!');
      
      // Exit with appropriate code
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

module.exports = { runAllTests, testConfig };