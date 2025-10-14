const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Create a comprehensive test runner for the WhyChooseUs responsiveness tests
async function runTests() {
  console.log('🚀 Starting WhyChooseUs Carousel Responsiveness Tests...\n');
  
  // Ensure test-results directory exists
  const testResultsDir = path.join(__dirname, 'test-results');
  if (!fs.existsSync(testResultsDir)) {
    fs.mkdirSync(testResultsDir, { recursive: true });
  }
  
  try {
    // Run the Playwright tests
    console.log('📱 Running tests across multiple viewports...');
    const testOutput = execSync('npx playwright test why-choose-us-responsiveness.test.js --reporter=json', {
      encoding: 'utf8',
      cwd: __dirname
    });
    
    // Parse the JSON output
    const testResults = JSON.parse(testOutput);
    
    // Save the raw test results
    const rawReportPath = path.join(testResultsDir, 'why-choose-us-raw-results.json');
    fs.writeFileSync(rawReportPath, testOutput);
    
    console.log('\n✅ Tests completed successfully!');
    
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
    console.log(`📄 Raw test results saved to: ${rawReportPath}`);
    
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
        });
    }
    
    // Generate HTML report
    await generateHTMLReport(reportData);
    console.log(`\n🌐 HTML report generated at: ${path.join(testResultsDir, 'why-choose-us-responsiveness-report.html')}`);
  } catch (error) {
    console.error('❌ Error running tests:', error.message);
    process.exit(1);
  }
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
        .footer {
          text-align: center;
          margin-top: 30px;
          padding: 20px;
          color: #6b7280;
          font-size: 14px;
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
            ${result.details ? `
              <div class="test-details">
                ${Object.entries(result.details).map(([key, value]) => {
                  if (typeof value === 'object') {
                    return `<div><strong>${key}:</strong> ${JSON.stringify(value, null, 2)}</div>`;
                  }
                  return `<div><strong>${key}:</strong> ${value}</div>`;
                }).join('')}
              </div>
            ` : ''}
          </div>
        `).join('')}
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

// Run the tests
runTests().catch(console.error);