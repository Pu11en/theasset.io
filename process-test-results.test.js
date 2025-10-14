const fs = require('fs');
const path = require('path');

// Process the Playwright test results and generate a comprehensive report
async function processTestResults() {
  console.log('📊 Processing WhyChooseUs Carousel Responsiveness Test Results...\n');
  
  // Read the raw test results from the previous run
  const testResultsDir = path.join(__dirname, 'test-results');
  const rawResultsPath = path.join(testResultsDir, 'why-choose-us-raw-results.json');
  
  if (!fs.existsSync(rawResultsPath)) {
    console.log('❌ Raw test results not found. Please run the tests first.');
    return;
  }
  
  const rawTestOutput = fs.readFileSync(rawResultsPath, 'utf8');
  const testResults = JSON.parse(rawTestOutput);
  
  // Extract test results from Playwright output
  const extractedResults = extractTestResults(testResults);
  
  // Generate comprehensive report
  const reportData = {
    timestamp: new Date().toISOString(),
    summary: {
      total: extractedResults.length,
      passed: extractedResults.filter(r => r.passed).length,
      failed: extractedResults.filter(r => !r.passed).length
    },
    results: extractedResults
  };
  
  // Save the comprehensive report
  const reportPath = path.join(testResultsDir, 'why-choose-us-responsiveness-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(reportData, null, 2));
  
  console.log(`📊 Test report generated at: ${reportPath}`);
  
  // Display summary
  const { summary } = reportData;
  
  console.log('\n📋 Test Summary:');
  console.log(`   Total Tests: ${summary.total}`);
  console.log(`   Passed: ${summary.passed}`);
  console.log(`   Failed: ${summary.failed}`);
  console.log(`   Success Rate: ${((summary.passed / summary.total) * 100).toFixed(2)}%`);
  
  // Display failed tests if any
  if (summary.failed > 0) {
    console.log('\n❌ Failed Tests:');
    reportData.results
      .filter(result => !result.passed)
      .forEach(result => {
        console.log(`   - ${result.test}`);
        if (result.error) {
          console.log(`     Error: ${result.error.message}`);
        }
      });
  }
  
  // Generate HTML report
  await generateHTMLReport(reportData);
  console.log(`\n🌐 HTML report generated at: ${path.join(testResultsDir, 'why-choose-us-responsiveness-report.html')}`);
  
  // Generate aspect ratio analysis
  generateAspectRatioAnalysis(reportData);
}

// Extract test results from Playwright JSON output
function extractTestResults(playwrightResults) {
  const extractedResults = [];
  
  // Recursively extract test results from the Playwright output
  function extractFromSuite(suite, viewportName = '') {
    if (suite.specs) {
      // Extract from specs (actual tests)
      suite.specs.forEach(spec => {
        if (spec.tests) {
          spec.tests.forEach(test => {
            test.results.forEach(result => {
              const testName = spec.title;
              const passed = result.status === 'passed';
              const viewport = viewportName || 'Unknown';
              
              extractedResults.push({
                test: `${viewport} - ${testName}`,
                passed,
                timestamp: new Date(result.startTime).toISOString(),
                viewport: viewportName || 'Unknown',
                duration: result.duration,
                error: result.error ? {
                  message: result.error.message,
                  location: result.error.location
                } : null
              });
            });
          });
        } else {
          // This is a nested suite, extract its specs
          extractFromSuite(spec, viewportName);
        }
      });
    }
    
    if (suite.suites) {
      // Extract from nested suites
      suite.suites.forEach(nestedSuite => {
        // Extract viewport name from suite title if it's a viewport suite
        const nestedViewportName = nestedSuite.title.includes('Viewport:') 
          ? nestedSuite.title.match(/\((\d+x\d+)\)/)?.[1] || viewportName
          : viewportName;
        
        extractFromSuite(nestedSuite, nestedViewportName);
      });
    }
  }
  
  // Start extraction from the top-level suites
  if (playwrightResults.suites) {
    playwrightResults.suites.forEach(suite => {
      extractFromSuite(suite);
    });
  }
  
  return extractedResults;
}

// Generate an HTML report for better visualization
async function generateHTMLReport(reportData) {
  const htmlTemplate = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>WhyChooseUs Carousel Responsiveness Test Report</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 1200px;
          margin: 0 auto;
          padding: 20px;
          background-color: #f9fafb;
        }
        .header {
          text-align: center;
          margin-bottom: 30px;
          padding: 20px;
          background-color: #fff;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .summary {
          display: flex;
          justify-content: space-around;
          margin-bottom: 30px;
        }
        .summary-card {
          text-align: center;
          padding: 20px;
          background-color: #fff;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          flex: 1;
          margin: 0 10px;
        }
        .summary-card h3 {
          margin: 0 0 10px 0;
          font-size: 18px;
        }
        .summary-card .number {
          font-size: 36px;
          font-weight: bold;
          margin: 10px 0;
        }
        .passed { color: #10b981; }
        .failed { color: #ef4444; }
        .total { color: #3b82f6; }
        .test-results {
          background-color: #fff;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          overflow: hidden;
        }
        .test-item {
          padding: 15px 20px;
          border-bottom: 1px solid #e5e7eb;
        }
        .test-item:last-child {
          border-bottom: none;
        }
        .test-name {
          font-weight: 600;
          margin-bottom: 5px;
        }
        .test-status {
          display: inline-block;
          padding: 3px 8px;
          border-radius: 4px;
          font-size: 12px;
          font-weight: 500;
        }
        .status-passed {
          background-color: #d1fae5;
          color: #065f46;
        }
        .status-failed {
          background-color: #fee2e2;
          color: #991b1b;
        }
        .test-details {
          margin-top: 10px;
          font-size: 14px;
          color: #6b7280;
        }
        .viewport-info {
          margin-top: 5px;
          font-size: 12px;
          color: #9ca3af;
        }
        .error-message {
          margin-top: 5px;
          padding: 8px;
          background-color: #fef2f2;
          border-radius: 4px;
          font-size: 12px;
          color: #991b1b;
          white-space: pre-wrap;
        }
        .footer {
          text-align: center;
          margin-top: 30px;
          padding: 20px;
          color: #6b7280;
          font-size: 14px;
        }
        .aspect-ratio-section {
          margin-top: 30px;
          background-color: #fff;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          padding: 20px;
        }
        .aspect-ratio-section h2 {
          margin-top: 0;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>WhyChooseUs Carousel Responsiveness Test Report</h1>
        <p>Generated on ${new Date(reportData.timestamp).toLocaleString()}</p>
      </div>
      
      <div class="summary">
        <div class="summary-card">
          <h3>Total Tests</h3>
          <div class="number total">${reportData.summary.total}</div>
        </div>
        <div class="summary-card">
          <h3>Passed</h3>
          <div class="number passed">${reportData.summary.passed}</div>
        </div>
        <div class="summary-card">
          <h3>Failed</h3>
          <div class="number failed">${reportData.summary.failed}</div>
        </div>
        <div class="summary-card">
          <h3>Success Rate</h3>
          <div class="number total">${((reportData.summary.passed / reportData.summary.total) * 100).toFixed(2)}%</div>
        </div>
      </div>
      
      <div class="test-results">
        <h2 style="padding: 20px; margin: 0; border-bottom: 1px solid #e5e7eb;">Test Results</h2>
        ${reportData.results.map(result => `
          <div class="test-item">
            <div class="test-name">${result.test}</div>
            <span class="test-status ${result.passed ? 'status-passed' : 'status-failed'}">
              ${result.passed ? 'PASSED' : 'FAILED'}
            </span>
            ${result.viewport ? `<div class="viewport-info">Viewport: ${result.viewport}</div>` : ''}
            ${result.duration ? `<div class="viewport-info">Duration: ${result.duration}ms</div>` : ''}
            ${result.error ? `<div class="error-message">${result.error.message}</div>` : ''}
          </div>
        `).join('')}
      </div>
      
      <div class="aspect-ratio-section">
        <h2>Aspect Ratio Analysis</h2>
        <p>The tests verify that the carousel cards maintain a consistent 3:4 aspect ratio across all breakpoints. This ensures visual consistency and proper media display regardless of screen size.</p>
        <ul>
          <li><strong>Mobile (375x667):</strong> Cards should be sized appropriately for small screens while maintaining the 3:4 ratio</li>
          <li><strong>Tablet (768x1024):</strong> Cards should scale up for medium screens while preserving the aspect ratio</li>
          <li><strong>Desktop (1440x900):</strong> Cards should be optimally sized for large screens with the same 3:4 ratio</li>
          <li><strong>Large Desktop (1920x1080):</strong> Cards should maintain proportions on ultra-wide screens</li>
        </ul>
      </div>
      
      <div class="footer">
        <p>This report tests the WhyChooseUs carousel component across multiple viewports to ensure consistent 3:4 aspect ratio, proper media display, text legibility, and functionality.</p>
      </div>
    </body>
    </html>
  `;
  
  const htmlReportPath = path.join(__dirname, 'test-results', 'why-choose-us-responsiveness-report.html');
  fs.writeFileSync(htmlReportPath, htmlTemplate);
}

// Generate aspect ratio analysis
function generateAspectRatioAnalysis(reportData) {
  const aspectRatioTests = reportData.results.filter(result => 
    result.test.includes('aspect ratio')
  );
  
  const viewportResults = {};
  aspectRatioTests.forEach(test => {
    const viewport = test.viewport;
    if (!viewportResults[viewport]) {
      viewportResults[viewport] = { passed: 0, failed: 0 };
    }
    
    if (test.passed) {
      viewportResults[viewport].passed++;
    } else {
      viewportResults[viewport].failed++;
    }
  });
  
  const analysis = {
    timestamp: new Date().toISOString(),
    summary: {
      totalAspectRatioTests: aspectRatioTests.length,
      passed: aspectRatioTests.filter(t => t.passed).length,
      failed: aspectRatioTests.filter(t => !t.passed).length
    },
    viewportResults
  };
  
  const analysisPath = path.join(__dirname, 'test-results', 'aspect-ratio-analysis.json');
  fs.writeFileSync(analysisPath, JSON.stringify(analysis, null, 2));
  
  console.log(`\n📐 Aspect Ratio Analysis:`);
  console.log(`   Total Aspect Ratio Tests: ${analysis.summary.totalAspectRatioTests}`);
  console.log(`   Passed: ${analysis.summary.passed}`);
  console.log(`   Failed: ${analysis.summary.failed}`);
  
  Object.entries(viewportResults).forEach(([viewport, results]) => {
    const successRate = (results.passed / (results.passed + results.failed) * 100).toFixed(2);
    console.log(`   ${viewport}: ${results.passed}/${results.passed + results.failed} tests passed (${successRate}%)`);
  });
}

// Run the processing
processTestResults().catch(console.error);