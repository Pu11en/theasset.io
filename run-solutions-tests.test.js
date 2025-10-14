/**
 * Test Runner for Solutions Component
 * Executes all test suites and generates a comprehensive report
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Test configuration
const TEST_RESULTS_DIR = './test-results';
const COMPREHENSIVE_REPORT_FILE = path.join(TEST_RESULTS_DIR, 'solutions-comprehensive-test-report.json');
const HTML_REPORT_FILE = path.join(TEST_RESULTS_DIR, 'solutions-test-report.html');

// Ensure test directories exist
if (!fs.existsSync(TEST_RESULTS_DIR)) fs.mkdirSync(TEST_RESULTS_DIR, { recursive: true });

// Test suites to run
const testSuites = [
  { name: 'Comprehensive Component Tests', file: 'solutions-component.test.js' },
  { name: 'Video Background Tests', file: 'solutions-video-test.test.js' },
  { name: 'Accessibility Tests', file: 'solutions-accessibility-test.test.js' },
  { name: 'Performance Tests', file: 'solutions-performance-test.test.js' }
];

// Initialize comprehensive report
const comprehensiveReport = {
  timestamp: new Date().toISOString(),
  testSuites: [],
  summary: {
    totalSuites: testSuites.length,
    totalPassed: 0,
    totalFailed: 0,
    totalTests: 0
  },
  environment: {
    nodeVersion: process.version,
    platform: process.platform,
    arch: process.arch
  }
};

// Function to run a test suite
function runTestSuite(testSuite) {
  console.log(`\n🧪 Running ${testSuite.name}...`);
  
  try {
    // Execute the test suite
    const output = execSync(`node ${testSuite.file}`, { 
      encoding: 'utf8',
      stdio: 'pipe',
      timeout: 60000 // 60 seconds timeout
    });
    
    console.log(output);
    
    // Read the test results file
    const reportFile = path.join(TEST_RESULTS_DIR, `${testSuite.file.replace('.test.js', '-test-report.json')}`);
    
    if (fs.existsSync(reportFile)) {
      const testResults = JSON.parse(fs.readFileSync(reportFile, 'utf8'));
      
      const suiteResult = {
        name: testSuite.name,
        file: testSuite.file,
        passed: testResults.summary.totalPassed,
        failed: testResults.summary.totalFailed,
        total: testResults.summary.totalPassed + testResults.summary.totalFailed,
        timestamp: testResults.timestamp,
        categories: {}
      };
      
      // Extract category results
      Object.keys(testResults.tests).forEach(category => {
        suiteResult.categories[category] = {
          passed: testResults.tests[category].passed,
          failed: testResults.tests[category].failed,
          total: testResults.tests[category].passed + testResults.tests[category].failed,
          details: testResults.tests[category].details
        };
      });
      
      comprehensiveReport.testSuites.push(suiteResult);
      comprehensiveReport.summary.totalPassed += suiteResult.passed;
      comprehensiveReport.summary.totalFailed += suiteResult.failed;
      comprehensiveReport.summary.totalTests += suiteResult.total;
      
      console.log(`✅ ${testSuite.name} completed: ${suiteResult.passed}/${suiteResult.total} passed`);
      
      return suiteResult;
    } else {
      console.log(`⚠️  No report file found for ${testSuite.name}`);
      return null;
    }
  } catch (error) {
    console.error(`❌ Error running ${testSuite.name}:`, error.message);
    
    const suiteResult = {
      name: testSuite.name,
      file: testSuite.file,
      passed: 0,
      failed: 1,
      total: 1,
      timestamp: new Date().toISOString(),
      error: error.message,
      categories: {}
    };
    
    comprehensiveReport.testSuites.push(suiteResult);
    comprehensiveReport.summary.totalFailed += 1;
    comprehensiveReport.summary.totalTests += 1;
    
    return suiteResult;
  }
}

// Function to generate HTML report
function generateHTMLReport() {
  const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Solutions Component Test Report</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
            line-height: 1.6;
            color: #333;
        }
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            border-radius: 10px;
            margin-bottom: 30px;
        }
        .summary {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }
        .summary-card {
            background: white;
            padding: 20px;
            border-radius: 10px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            text-align: center;
        }
        .pass { color: #10b981; }
        .fail { color: #ef4444; }
        .test-suite {
            background: white;
            margin-bottom: 20px;
            border-radius: 10px;
            overflow: hidden;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .suite-header {
            background: #f9fafb;
            padding: 15px 20px;
            border-bottom: 1px solid #e5e7eb;
            font-weight: 600;
            font-size: 18px;
        }
        .suite-results {
            padding: 20px;
        }
        .category {
            margin-bottom: 20px;
        }
        .category-header {
            font-weight: 600;
            margin-bottom: 10px;
            color: #4b5563;
        }
        .test-item {
            display: flex;
            align-items: center;
            padding: 8px 0;
            border-bottom: 1px solid #f3f4f6;
        }
        .test-item:last-child {
            border-bottom: none;
        }
        .test-status {
            width: 20px;
            height: 20px;
            border-radius: 50%;
            margin-right: 10px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: bold;
            color: white;
            font-size: 12px;
        }
        .test-status.pass {
            background: #10b981;
        }
        .test-status.fail {
            background: #ef4444;
        }
        .test-details {
            flex: 1;
        }
        .test-name {
            font-weight: 500;
        }
        .test-message {
            font-size: 14px;
            color: #6b7280;
        }
        .progress-bar {
            width: 100%;
            height: 20px;
            background: #e5e7eb;
            border-radius: 10px;
            overflow: hidden;
            margin: 20px 0;
        }
        .progress-fill {
            height: 100%;
            background: linear-gradient(90deg, #10b981, #059669);
            transition: width 0.3s ease;
        }
        .percentage {
            margin-top: 10px;
            font-size: 24px;
            font-weight: bold;
        }
        .timestamp {
            color: #6b7280;
            font-size: 14px;
            margin-top: 20px;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>Solutions Component Test Report</h1>
        <p>Comprehensive testing of the Solutions component including visual, video, accessibility, and performance tests</p>
        <div class="timestamp">Generated on ${new Date(comprehensiveReport.timestamp).toLocaleString()}</div>
    </div>

    <div class="summary">
        <div class="summary-card">
            <div class="percentage">${comprehensiveReport.summary.totalPassed}</div>
            <div>Tests Passed</div>
        </div>
        <div class="summary-card">
            <div class="percentage fail">${comprehensiveReport.summary.totalFailed}</div>
            <div>Tests Failed</div>
        </div>
        <div class="summary-card">
            <div class="percentage">${comprehensiveReport.summary.totalTests}</div>
            <div>Total Tests</div>
        </div>
        <div class="summary-card">
            <div class="percentage pass">${Math.round((comprehensiveReport.summary.totalPassed / comprehensiveReport.summary.totalTests) * 100)}%</div>
            <div>Pass Rate</div>
        </div>
    </div>

    <div class="progress-bar">
        <div class="progress-fill" style="width: ${(comprehensiveReport.summary.totalPassed / comprehensiveReport.summary.totalTests) * 100}%"></div>
    </div>

    ${comprehensiveReport.testSuites.map(suite => `
    <div class="test-suite">
        <div class="suite-header">
            ${suite.name} - ${suite.passed}/${suite.total} passed
        </div>
        <div class="suite-results">
            ${Object.keys(suite.categories).map(category => `
            <div class="category">
                <div class="category-header">
                    ${category.charAt(0).toUpperCase() + category.slice(1)} - ${suite.categories[category].passed}/${suite.categories[category].total} passed
                </div>
                ${suite.categories[category].details.map(test => `
                <div class="test-item">
                    <div class="test-status ${test.passed ? 'pass' : 'fail'}">
                        ${test.passed ? '✓' : '✗'}
                    </div>
                    <div class="test-details">
                        <div class="test-name">${test.testName}</div>
                        <div class="test-message">${test.details}</div>
                    </div>
                </div>
                `).join('')}
            </div>
            `).join('')}
        </div>
    </div>
    `).join('')}

    <div class="timestamp">
        Report generated on ${new Date(comprehensiveReport.timestamp).toLocaleString()}<br>
        Node.js ${comprehensiveReport.environment.nodeVersion} on ${comprehensiveReport.environment.platform} (${comprehensiveReport.environment.arch})
    </div>
</body>
</html>
  `;
  
  fs.writeFileSync(HTML_REPORT_FILE, htmlContent);
  console.log(`\n📄 HTML report generated: ${HTML_REPORT_FILE}`);
}

// Main function to run all tests
async function runAllTests() {
  console.log('🚀 Starting Solutions Component Comprehensive Test Suite...\n');
  
  // Check if Playwright is installed
  try {
    require('playwright');
  } catch (error) {
    console.error('❌ Playwright is not installed. Please install it with:');
    console.error('npm install playwright');
    process.exit(1);
  }
  
  // Run each test suite
  for (const testSuite of testSuites) {
    await runTestSuite(testSuite);
  }
  
  // Calculate overall pass rate
  const passRate = comprehensiveReport.summary.totalTests > 0 
    ? Math.round((comprehensiveReport.summary.totalPassed / comprehensiveReport.summary.totalTests) * 100)
    : 0;
  
  // Save comprehensive report
  fs.writeFileSync(COMPREHENSIVE_REPORT_FILE, JSON.stringify(comprehensiveReport, null, 2));
  
  // Generate HTML report
  generateHTMLReport();
  
  // Print summary
  console.log('\n' + '='.repeat(80));
  console.log('📊 COMPREHENSIVE TEST SUMMARY');
  console.log('='.repeat(80));
  console.log(`Total Test Suites: ${comprehensiveReport.summary.totalSuites}`);
  console.log(`Total Tests: ${comprehensiveReport.summary.totalTests}`);
  console.log(`Passed: ${comprehensiveReport.summary.totalPassed}`);
  console.log(`Failed: ${comprehensiveReport.summary.totalFailed}`);
  console.log(`Pass Rate: ${passRate}%`);
  console.log('='.repeat(80));
  
  // Print category summaries
  const categorySummary = {};
  comprehensiveReport.testSuites.forEach(suite => {
    Object.keys(suite.categories).forEach(category => {
      if (!categorySummary[category]) {
        categorySummary[category] = { passed: 0, failed: 0, total: 0 };
      }
      categorySummary[category].passed += suite.categories[category].passed;
      categorySummary[category].failed += suite.categories[category].failed;
      categorySummary[category].total += suite.categories[category].total;
    });
  });
  
  console.log('\n📋 CATEGORY BREAKDOWN:');
  Object.keys(categorySummary).forEach(category => {
    const catPassRate = Math.round((categorySummary[category].passed / categorySummary[category].total) * 100);
    console.log(`${category.padEnd(20)}: ${categorySummary[category].passed}/${categorySummary[category].total} (${catPassRate}%)`);
  });
  
  console.log('\n📁 Report Files:');
  console.log(`JSON: ${COMPREHENSIVE_REPORT_FILE}`);
  console.log(`HTML: ${HTML_REPORT_FILE}`);
  
  // Exit with appropriate code
  if (comprehensiveReport.summary.totalFailed > 0) {
    console.log('\n❌ Some tests failed. Check the reports for details.');
    process.exit(1);
  } else {
    console.log('\n✅ All tests passed!');
    process.exit(0);
  }
}

// Run all tests
runAllTests().catch(error => {
  console.error('Test execution failed:', error);
  process.exit(1);
});