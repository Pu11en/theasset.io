/**
 * Test Runner for BookingForm Comprehensive Tests
 * 
 * This script runs all the BookingForm tests and generates a detailed report
 * of the test results, including coverage of all requirements.
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Test configuration
const TEST_CONFIG = {
  testFile: 'booking-form-comprehensive.test.js',
  outputDir: 'test-results',
  reportFile: 'booking-form-test-report.json',
  markdownReportFile: 'booking-form-test-report.md'
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
  console.log('🚀 Running BookingForm comprehensive tests...\n');
  
  try {
    // Run the tests with Jest
    const testOutput = execSync(`npx jest ${TEST_CONFIG.testFile} --verbose --json`, {
      encoding: 'utf8',
      stdio: 'pipe'
    });
    
    const testResults = JSON.parse(testOutput);
    return testResults;
  } catch (error) {
    // Jest returns non-zero exit code on test failures
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
      testResults: [],
      numTotalTests: 0,
      numPassedTests: 0,
      numFailedTests: 1,
      numPendingTests: 0,
      success: false,
      errorMessage: error.message
    };
  }
}

function analyzeTestResults(testResults) {
  const analysis = {
    totalTests: testResults.numTotalTests || 0,
    passedTests: testResults.numPassedTests || 0,
    failedTests: testResults.numFailedTests || 0,
    pendingTests: testResults.numPendingTests || 0,
    testDetails: [],
    requirementsCoverage: []
  };

  // Analyze individual test results
  if (testResults.testResults) {
    testResults.testResults.forEach(testFile => {
      testFile.assertionResults.forEach(assertion => {
        analysis.testDetails.push({
          title: assertion.title,
          status: assertion.status,
          failureMessages: assertion.failureMessages || [],
          category: categorizeTest(assertion.title)
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
      pendingTests: analysis.pendingTests,
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
      markdown += `${status} **${test.title}**\n`;
      
      if (test.failureMessages && test.failureMessages.length > 0) {
        test.failureMessages.forEach(msg => {
          markdown += `   - Error: ${msg}\n`;
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
  console.log(`   Pending: ${analysis.pendingTests} ⏳`);
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
  console.log('🧪 BookingForm Comprehensive Test Runner');
  console.log('=====================================\n');
  
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
    
    // Print summary
    printSummary(analysis);
    
    console.log('\n📄 Reports Generated:');
    console.log(`   JSON: ${jsonReportPath}`);
    console.log(`   Markdown: ${markdownReportPath}`);
    
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
  REQUIREMENTS
};