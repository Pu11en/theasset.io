/**
 * Playwright Test Runner for BookingForm Comprehensive Tests
 * 
 * This script runs all the BookingForm Playwright tests and generates a detailed report
 * of the test results, including coverage of all requirements.
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Test configuration
const TEST_CONFIG = {
  testFile: 'booking-form-comprehensive.spec.js',
  outputDir: 'test-results',
  reportFile: 'booking-form-playwright-report.json',
  markdownReportFile: 'booking-form-playwright-report.md',
  htmlReportFile: 'booking-form-playwright-report.html'
};

// Requirements to verify
const REQUIREMENTS = [
  {
    id: 'REQ-001',
    title: 'All fields are typable',
    description: 'Email, Phone, Industry, Current Audience, Key Messages, Visual References fields accept input',
    category: 'Field Functionality'
  },
  {
    id: 'REQ-002',
    title: 'Email Address is required',
    description: 'Email field must be filled out and validated',
    category: 'Validation'
  },
  {
    id: 'REQ-003',
    title: 'Phone Number is required',
    description: 'Phone field must be filled out and validated',
    category: 'Validation'
  },
  {
    id: 'REQ-004',
    title: 'Preferred Contact Method removed',
    description: 'Preferred Contact Method field should not be present in the form',
    category: 'Field Changes'
  },
  {
    id: 'REQ-005',
    title: 'n8n webhook integration',
    description: 'Form data is sent to n8n webhook with correct JSON payload',
    category: 'Integration'
  },
  {
    id: 'REQ-006',
    title: 'Form validation for required fields',
    description: 'Name, Business Name, Email, Phone, Industry fields are validated',
    category: 'Validation'
  },
  {
    id: 'REQ-007',
    title: 'Error handling for invalid inputs',
    description: 'Appropriate error messages are shown for invalid inputs',
    category: 'Error Handling'
  },
  {
    id: 'REQ-008',
    title: 'Form reset after submission',
    description: 'Form is reset and modal closes after successful submission',
    category: 'Form Behavior'
  }
];

function ensureOutputDirectory() {
  if (!fs.existsSync(TEST_CONFIG.outputDir)) {
    fs.mkdirSync(TEST_CONFIG.outputDir, { recursive: true });
  }
}

function runTests() {
  console.log('🚀 Running BookingForm comprehensive Playwright tests...\n');
  
  try {
    // Run the tests with Playwright
    const testOutput = execSync(`npx playwright test ${TEST_CONFIG.testFile} --reporter=json`, {
      encoding: 'utf8',
      stdio: 'pipe'
    });
    
    const testResults = JSON.parse(testOutput);
    return testResults;
  } catch (error) {
    // Playwright returns non-zero exit code on test failures
    // We still want to parse the results
    try {
      const errorOutput = error.stdout || error.stderr;
      const jsonMatch = errorOutput.match(/\{[\s\S]*\}$/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    } catch (parseError) {
      console.error('Failed to parse test results:', parseError);
    }
    
    // If we can't parse JSON, create a minimal error report
    return {
      suites: [],
      specs: [],
      errors: [error.message],
      stats: {
        total: 0,
        passed: 0,
        failed: 1,
        skipped: 0
      }
    };
  }
}

function analyzeTestResults(testResults) {
  const analysis = {
    totalTests: 0,
    passedTests: 0,
    failedTests: 0,
    skippedTests: 0,
    testDetails: [],
    requirementsCoverage: []
  };

  // Analyze individual test results
  if (testResults.suites) {
    testResults.suites.forEach(suite => {
      suite.specs.forEach(spec => {
        spec.tests.forEach(test => {
          const testDetail = {
            title: test.title,
            status: test.results[0].status,
            duration: test.results[0].duration,
            failureMessages: test.results[0].errors ? 
              test.results[0].errors.map(err => err.message) : [],
            category: categorizeTest(test.title),
            suite: suite.title,
            spec: spec.title
          };
          
          analysis.testDetails.push(testDetail);
          analysis.totalTests++;
          
          if (test.results[0].status === 'passed') {
            analysis.passedTests++;
          } else if (test.results[0].status === 'failed') {
            analysis.failedTests++;
          } else if (test.results[0].status === 'skipped') {
            analysis.skippedTests++;
          }
        });
      });
    });
  }

  // Analyze requirements coverage
  REQUIREMENTS.forEach(req => {
    const coverage = analyzeRequirementCoverage(req, analysis.testDetails);
    analysis.requirementsCoverage.push({
      ...req,
      covered: coverage.covered,
      testCount: coverage.testCount,
      testTitles: coverage.testTitles,
      status: coverage.covered ? 'PASS' : 'FAIL'
    });
  });

  return analysis;
}

function categorizeTest(testTitle) {
  if (testTitle.includes('typability') || testTitle.includes('typing')) {
    return 'Field Functionality';
  } else if (testTitle.includes('validation') || testTitle.includes('required')) {
    return 'Validation';
  } else if (testTitle.includes('submission') || testTitle.includes('submit')) {
    return 'Form Behavior';
  } else if (testTitle.includes('webhook') || testTitle.includes('payload')) {
    return 'Integration';
  } else if (testTitle.includes('error') || testTitle.includes('invalid')) {
    return 'Error Handling';
  } else if (testTitle.includes('modal') || testTitle.includes('close')) {
    return 'UI Interaction';
  } else if (testTitle.includes('accessibility')) {
    return 'Accessibility';
  } else if (testTitle.includes('edge case')) {
    return 'Edge Cases';
  } else {
    return 'General';
  }
}

function analyzeRequirementCoverage(requirement, testDetails) {
  const relevantTests = testDetails.filter(test => {
    const title = test.title.toLowerCase();
    const desc = requirement.description.toLowerCase();
    
    // Check if test title relates to requirement
    if (requirement.id === 'REQ-001') {
      return title.includes('typability') || title.includes('typing') || 
             title.includes('field') || title.includes('input');
    } else if (requirement.id === 'REQ-002') {
      return title.includes('email') && (title.includes('required') || title.includes('validation'));
    } else if (requirement.id === 'REQ-003') {
      return title.includes('phone') && (title.includes('required') || title.includes('validation'));
    } else if (requirement.id === 'REQ-004') {
      return title.includes('preferred contact method') || title.includes('removed');
    } else if (requirement.id === 'REQ-005') {
      return title.includes('webhook') || title.includes('payload');
    } else if (requirement.id === 'REQ-006') {
      return title.includes('validation') && title.includes('required');
    } else if (requirement.id === 'REQ-007') {
      return title.includes('error') || title.includes('invalid');
    } else if (requirement.id === 'REQ-008') {
      return title.includes('reset') || title.includes('close') || title.includes('submission');
    }
    
    return false;
  });

  const passedTests = relevantTests.filter(test => test.status === 'passed');
  
  return {
    covered: relevantTests.length > 0 && passedTests.length === relevantTests.length,
    testCount: relevantTests.length,
    testTitles: relevantTests.map(test => test.title)
  };
}

function generateJsonReport(analysis, testResults) {
  const report = {
    timestamp: new Date().toISOString(),
    summary: {
      totalTests: analysis.totalTests,
      passedTests: analysis.passedTests,
      failedTests: analysis.failedTests,
      skippedTests: analysis.skippedTests,
      successRate: analysis.totalTests > 0 ? 
        Math.round((analysis.passedTests / analysis.totalTests) * 100) : 0
    },
    requirements: analysis.requirementsCoverage,
    testDetails: analysis.testDetails,
    categories: groupTestsByCategory(analysis.testDetails),
    rawResults: testResults
  };

  const reportPath = path.join(TEST_CONFIG.outputDir, TEST_CONFIG.reportFile);
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  
  return reportPath;
}

function generateMarkdownReport(analysis, reportPath) {
  const { summary, requirements, categories } = analysis;
  
  let markdown = `# BookingForm Comprehensive Test Report\n\n`;
  markdown += `**Generated:** ${new Date().toLocaleString()}\n\n`;
  
  // Executive Summary
  markdown += `## Executive Summary\n\n`;
  markdown += `- **Total Tests:** ${summary.totalTests}\n`;
  markdown += `- **Passed:** ${summary.passedTests}\n`;
  markdown += `- **Failed:** ${summary.failedTests}\n`;
  markdown += `- **Skipped:** ${summary.skippedTests}\n`;
  markdown += `- **Success Rate:** ${summary.successRate}%\n\n`;
  
  // Requirements Coverage
  markdown += `## Requirements Coverage\n\n`;
  markdown += `| ID | Requirement | Category | Status | Tests |\n`;
  markdown += `|---|-------------|----------|--------|-------|\n`;
  
  requirements.forEach(req => {
    const status = req.status === 'PASS' ? '✅ PASS' : '❌ FAIL';
    markdown += `| ${req.id} | ${req.title} | ${req.category} | ${status} | ${req.testCount} |\n`;
  });
  
  markdown += `\n`;
  
  // Detailed Requirements Analysis
  markdown += `## Detailed Requirements Analysis\n\n`;
  
  requirements.forEach(req => {
    markdown += `### ${req.id}: ${req.title}\n\n`;
    markdown += `**Category:** ${req.category}\n\n`;
    markdown += `**Description:** ${req.description}\n\n`;
    markdown += `**Status:** ${req.status === 'PASS' ? '✅ PASSED' : '❌ FAILED'}\n\n`;
    
    if (req.testTitles.length > 0) {
      markdown += `**Related Tests:**\n`;
      req.testTitles.forEach(title => {
        markdown += `- ${title}\n`;
      });
      markdown += `\n`;
    } else {
      markdown += `**⚠️ No tests found for this requirement**\n\n`;
    }
  });
  
  // Test Categories
  markdown += `## Test Categories\n\n`;
  
  Object.keys(categories).forEach(category => {
    const categoryTests = categories[category];
    const passedCount = categoryTests.filter(t => t.status === 'passed').length;
    const totalCount = categoryTests.length;
    
    markdown += `### ${category} (${passedCount}/${totalCount} passed)\n\n`;
    
    categoryTests.forEach(test => {
      const status = test.status === 'passed' ? '✅' : '❌';
      markdown += `${status} **${test.title}** (${test.duration}ms)\n`;
      
      if (test.failureMessages && test.failureMessages.length > 0) {
        test.failureMessages.forEach(msg => {
          markdown += `   - Error: ${msg.substring(0, 100)}...\n`;
        });
      }
      markdown += `\n`;
    });
  });
  
  // Recommendations
  markdown += `## Recommendations\n\n`;
  
  const failedRequirements = requirements.filter(req => req.status === 'FAIL');
  if (failedRequirements.length > 0) {
    markdown += `### Failed Requirements\n\n`;
    failedRequirements.forEach(req => {
      markdown += `- **${req.id}: ${req.title}** - Add or fix tests for this requirement\n`;
    });
    markdown += `\n`;
  }
  
  if (summary.successRate < 100) {
    markdown += `### General Recommendations\n\n`;
    markdown += `- Fix failing tests to achieve 100% success rate\n`;
    markdown += `- Add more edge case tests for robustness\n`;
    markdown += `- Consider adding performance tests\n`;
    markdown += `- Add accessibility tests for WCAG compliance\n\n`;
  } else {
    markdown += `### ✅ All Requirements Met!\n\n`;
    markdown += `The BookingForm component meets all specified requirements.\n`;
    markdown += `Consider adding additional tests for future enhancements.\n\n`;
  }
  
  // Save markdown report
  const markdownPath = path.join(TEST_CONFIG.outputDir, TEST_CONFIG.markdownReportFile);
  fs.writeFileSync(markdownPath, markdown);
  
  return markdownPath;
}

function generateHtmlReport(analysis) {
  const { summary, requirements, categories } = analysis;
  
  let html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>BookingForm Test Report</title>
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
            border-radius: 8px;
            padding: 30px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        h1 {
            color: #2c3e50;
            border-bottom: 2px solid #3498db;
            padding-bottom: 10px;
        }
        h2 {
            color: #34495e;
            margin-top: 30px;
        }
        .summary {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin: 20px 0;
        }
        .summary-card {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            text-align: center;
            border-left: 4px solid #3498db;
        }
        .summary-card.passed {
            border-left-color: #27ae60;
        }
        .summary-card.failed {
            border-left-color: #e74c3c;
        }
        .summary-card h3 {
            margin: 0 0 10px 0;
            font-size: 2em;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
        }
        th, td {
            padding: 12px 15px;
            text-align: left;
            border-bottom: 1px solid #ddd;
        }
        th {
            background-color: #f8f9fa;
            font-weight: 600;
        }
        .status-pass {
            color: #27ae60;
            font-weight: bold;
        }
        .status-fail {
            color: #e74c3c;
            font-weight: bold;
        }
        .test-item {
            padding: 10px;
            margin: 5px 0;
            border-radius: 4px;
            background: #f8f9fa;
        }
        .test-passed {
            border-left: 4px solid #27ae60;
        }
        .test-failed {
            border-left: 4px solid #e74c3c;
        }
        .error-message {
            color: #e74c3c;
            font-size: 0.9em;
            margin-top: 5px;
        }
        .category-section {
            margin: 30px 0;
        }
        .success-rate {
            font-size: 1.2em;
            font-weight: bold;
            margin: 10px 0;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>BookingForm Comprehensive Test Report</h1>
        <p><strong>Generated:</strong> ${new Date().toLocaleString()}</p>
        
        <h2>Executive Summary</h2>
        <div class="summary">
            <div class="summary-card">
                <h3>${summary.totalTests}</h3>
                <p>Total Tests</p>
            </div>
            <div class="summary-card passed">
                <h3>${summary.passedTests}</h3>
                <p>Passed</p>
            </div>
            <div class="summary-card failed">
                <h3>${summary.failedTests}</h3>
                <p>Failed</p>
            </div>
            <div class="summary-card">
                <h3>${summary.skippedTests}</h3>
                <p>Skipped</p>
            </div>
        </div>
        
        <div class="success-rate">Success Rate: ${summary.successRate}%</div>
        
        <h2>Requirements Coverage</h2>
        <table>
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Requirement</th>
                    <th>Category</th>
                    <th>Status</th>
                    <th>Tests</th>
                </tr>
            </thead>
            <tbody>`;
  
  requirements.forEach(req => {
    const statusClass = req.status === 'PASS' ? 'status-pass' : 'status-fail';
    html += `
                <tr>
                    <td>${req.id}</td>
                    <td>${req.title}</td>
                    <td>${req.category}</td>
                    <td class="${statusClass}">${req.status}</td>
                    <td>${req.testCount}</td>
                </tr>`;
  });
  
  html += `
            </tbody>
        </table>
        
        <h2>Test Categories</h2>`;
  
  Object.keys(categories).forEach(category => {
    const categoryTests = categories[category];
    const passedCount = categoryTests.filter(t => t.status === 'passed').length;
    const totalCount = categoryTests.length;
    
    html += `
        <div class="category-section">
            <h3>${category} (${passedCount}/${totalCount} passed)</h3>`;
    
    categoryTests.forEach(test => {
      const statusClass = test.status === 'passed' ? 'test-passed' : 'test-failed';
      const statusIcon = test.status === 'passed' ? '✅' : '❌';
      
      html += `
            <div class="test-item ${statusClass}">
                <div>${statusIcon} <strong>${test.title}</strong> (${test.duration}ms)</div>`;
      
      if (test.failureMessages && test.failureMessages.length > 0) {
        html += `<div class="error-message">${test.failureMessages[0].substring(0, 200)}...</div>`;
      }
      
      html += `</div>`;
    });
    
    html += `</div>`;
  });
  
  html += `
    </div>
</body>
</html>`;
  
  // Save HTML report
  const htmlPath = path.join(TEST_CONFIG.outputDir, TEST_CONFIG.htmlReportFile);
  fs.writeFileSync(htmlPath, html);
  
  return htmlPath;
}

function groupTestsByCategory(testDetails) {
  const categories = {};
  
  testDetails.forEach(test => {
    const category = test.category || 'General';
    if (!categories[category]) {
      categories[category] = [];
    }
    categories[category].push(test);
  });
  
  return categories;
}

function printSummary(analysis) {
  console.log('\n📊 Test Results Summary:');
  console.log(`   Total Tests: ${analysis.totalTests}`);
  console.log(`   Passed: ${analysis.passedTests} ✅`);
  console.log(`   Failed: ${analysis.failedTests} ❌`);
  console.log(`   Skipped: ${analysis.skippedTests} ⏳`);
  console.log(`   Success Rate: ${analysis.totalTests > 0 ? 
    Math.round((analysis.passedTests / analysis.totalTests) * 100) : 0}%`);
  
  console.log('\n📋 Requirements Coverage:');
  analysis.requirementsCoverage.forEach(req => {
    const status = req.status === 'PASS' ? '✅' : '❌';
    console.log(`   ${status} ${req.id}: ${req.title} (${req.testCount} tests)`);
  });
  
  const passedRequirements = analysis.requirementsCoverage.filter(req => req.status === 'PASS').length;
  console.log(`\n🎯 Requirements Passed: ${passedRequirements}/${analysis.requirementsCoverage.length}`);
}

function main() {
  console.log('🧪 BookingForm Comprehensive Playwright Test Runner');
  console.log('=================================================\n');
  
  try {
    // Ensure output directory exists
    ensureOutputDirectory();
    
    // Run the tests
    const testResults = runTests();
    
    // Analyze results
    const analysis = analyzeTestResults(testResults);
    
    // Generate reports
    const jsonReportPath = generateJsonReport(analysis, testResults);
    const markdownReportPath = generateMarkdownReport(analysis, jsonReportPath);
    const htmlReportPath = generateHtmlReport(analysis);
    
    // Print summary
    printSummary(analysis);
    
    console.log('\n📄 Reports Generated:');
    console.log(`   JSON: ${jsonReportPath}`);
    console.log(`   Markdown: ${markdownReportPath}`);
    console.log(`   HTML: ${htmlReportPath}`);
    
    // Exit with appropriate code
    if (analysis.failedTests > 0) {
      console.log('\n❌ Some tests failed. Check the reports for details.');
      process.exit(1);
    } else {
      console.log('\n✅ All tests passed!');
      process.exit(0);
    }
    
  } catch (error) {
    console.error('\n💥 Test runner failed:', error.message);
    process.exit(1);
  }
}

// Run the test runner
if (require.main === module) {
  main();
}

module.exports = {
  runTests,
  analyzeTestResults,
  generateJsonReport,
  generateMarkdownReport,
  generateHtmlReport,
  REQUIREMENTS
};