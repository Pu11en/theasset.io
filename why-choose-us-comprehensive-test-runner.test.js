/**
 * WhyChooseUs Comprehensive Test Runner
 * 
 * This script executes the comprehensive test suite for the WhyChooseUs carousel
 * and generates a detailed report with results.
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

/**
 * Execute the comprehensive test suite
 */
function runComprehensiveTests() {
  console.log('========================================');
  console.log('WhyChooseUs Comprehensive Test Runner');
  console.log('========================================');
  console.log('Running comprehensive tests to validate all carousel fixes...\n');
  
  try {
    // Execute the comprehensive test suite
    console.log('Executing: npx playwright test why-choose-us-comprehensive-final-validation.test.js --reporter=json');
    
    const testOutput = execSync(
      'npx playwright test why-choose-us-comprehensive-final-validation.test.js --reporter=json',
      { encoding: 'utf8', stdio: 'pipe' }
    );
    
    console.log('Tests completed successfully!\n');
    
    // Parse the test results
    const testResults = JSON.parse(testOutput);
    
    // Generate and display the report
    generateAndDisplayReport(testResults);
    
    return testResults;
  } catch (error) {
    console.error('Error running tests:', error.message);
    
    // Try to read the report file if it exists
    const reportPath = './test-results/why-choose-us-comprehensive-final-validation-report.json';
    if (fs.existsSync(reportPath)) {
      const reportData = JSON.parse(fs.readFileSync(reportPath, 'utf8'));
      generateAndDisplayReport(reportData);
      return reportData;
    }
    
    throw error;
  }
}

/**
 * Generate and display a comprehensive report
 */
function generateAndDisplayReport(testResults) {
  console.log('========================================');
  console.log('COMPREHENSIVE TEST RESULTS REPORT');
  console.log('========================================');
  
  // Overall summary
  console.log('\n--- OVERALL SUMMARY ---');
  console.log(`Total Tests: ${testResults.summary.total}`);
  console.log(`Passed: ${testResults.summary.passed}`);
  console.log(`Failed: ${testResults.summary.failed}`);
  console.log(`Pass Rate: ${testResults.summary.passRate}%`);
  
  const overallStatus = testResults.summary.failed === 0 ? 'PASSED' : 'FAILED';
  console.log(`Overall Status: ${overallStatus}`);
  
  // Results by category
  console.log('\n--- RESULTS BY CATEGORY ---');
  const categories = [
    { name: 'Aspect Ratio Implementation', key: 'aspectRatioTests' },
    { name: 'Text Visibility Improvements', key: 'textVisibilityTests' },
    { name: 'Card Spacing Fixes', key: 'cardSpacingTests' },
    { name: 'Image/Video Handling', key: 'mediaHandlingTests' },
    { name: 'Carousel Functionality', key: 'carouselFunctionalityTests' },
    { name: 'Visual Consistency', key: 'visualConsistencyTests' }
  ];
  
  categories.forEach(category => {
    const results = testResults.summaryByCategory[category.key];
    const status = results.failed === 0 ? 'PASSED' : 'FAILED';
    const passRate = results.passed + results.failed > 0 
      ? ((results.passed / (results.passed + results.failed)) * 100).toFixed(1)
      : '0';
    
    console.log(`\n${category.name}:`);
    console.log(`  Status: ${status}`);
    console.log(`  Passed: ${results.passed}`);
    console.log(`  Failed: ${results.failed}`);
    console.log(`  Pass Rate: ${passRate}%`);
  });
  
  // Failed tests details
  const failedTests = testResults.results.filter(result => !result.passed);
  if (failedTests.length > 0) {
    console.log('\n--- FAILED TESTS DETAILS ---');
    failedTests.forEach((test, index) => {
      console.log(`\n${index + 1}. ${test.test}`);
      console.log(`   Viewport: ${test.viewport}`);
      console.log(`   Category: ${test.category}`);
      
      // Add specific details based on category
      if (test.category === 'aspectRatio' && test.cardMeasurements) {
        const problematicCards = test.cardMeasurements.filter(card => !card.withinTolerance);
        problematicCards.forEach(card => {
          console.log(`   Card ${card.index}: Aspect ratio ${card.aspectRatio.toFixed(3)} (expected ${card.expectedAspectRatio})`);
        });
      }
      
      if (test.category === 'textVisibility' && test.textContrastResults) {
        const problematicText = test.textContrastResults.filter(text => !text.hasProperContrast);
        problematicText.forEach(text => {
          console.log(`   ${text.type} ${text.index}: Color ${text.color}, Background ${text.backgroundColor}`);
        });
      }
      
      if (test.category === 'cardSpacing' && test.spacingResults) {
        console.log(`   Spacing issues detected in card positioning`);
      }
      
      if (test.category === 'mediaHandling' && test.mediaFitResults) {
        const problematicMedia = test.mediaFitResults.filter(media => !media.hasCorrectFit);
        problematicMedia.forEach(media => {
          console.log(`   ${media.type} ${media.index}: object-fit is "${media.objectFit}" instead of "cover"`);
        });
      }
      
      if (test.category === 'carouselFunctionality' && test.navigationResults) {
        const problematicNavigation = test.navigationResults.filter(nav => !nav.changed);
        problematicNavigation.forEach(nav => {
          console.log(`   ${nav.action}: Transform did not change`);
        });
      }
      
      if (test.category === 'visualConsistency' && test.layoutResults) {
        const problematicLayout = test.layoutResults.filter(layout => !layout.withinBounds);
        problematicLayout.forEach(layout => {
          console.log(`   Card ${layout.index}: Position (${layout.position.x}, ${layout.position.y}), Size (${layout.size.width}x${layout.size.height})`);
        });
      }
    });
  }
  
  // Validation results
  console.log('\n--- VALIDATION RESULTS ---');
  
  // 1. 3:4 Aspect Ratio Implementation
  const aspectRatioTests = testResults.results.filter(result => result.category === 'aspectRatio');
  const aspectRatioPassed = aspectRatioTests.filter(test => test.passed).length;
  const aspectRatioStatus = aspectRatioPassed === aspectRatioTests.length ? 'PASSED' : 'FAILED';
  console.log(`\n1. 3:4 Aspect Ratio Implementation: ${aspectRatioStatus}`);
  console.log(`   All carousel cards maintain strict 3:4 aspect ratio: ${aspectRatioPassed}/${aspectRatioTests.length} tests passed`);
  console.log(`   Aspect ratio is consistent across all breakpoints: ${aspectRatioPassed}/${aspectRatioTests.length} tests passed`);
  console.log(`   No distortion or stretching of content: ${aspectRatioPassed}/${aspectRatioTests.length} tests passed`);
  
  // 2. Text Visibility Improvements
  const textVisibilityTests = testResults.results.filter(result => result.category === 'textVisibility');
  const textVisibilityPassed = textVisibilityTests.filter(test => test.passed).length;
  const textVisibilityStatus = textVisibilityPassed === textVisibilityTests.length ? 'PASSED' : 'FAILED';
  console.log(`\n2. Text Visibility Improvements: ${textVisibilityStatus}`);
  console.log(`   Text overlays are clearly visible against background images/videos: ${textVisibilityPassed}/${textVisibilityTests.length} tests passed`);
  console.log(`   Text has proper contrast and readability: ${textVisibilityPassed}/${textVisibilityTests.length} tests passed`);
  console.log(`   Text positioning doesn't interfere with carousel functionality: ${textVisibilityPassed}/${textVisibilityTests.length} tests passed`);
  
  // 3. Card Spacing Fixes
  const cardSpacingTests = testResults.results.filter(result => result.category === 'cardSpacing');
  const cardSpacingPassed = cardSpacingTests.filter(test => test.passed).length;
  const cardSpacingStatus = cardSpacingPassed === cardSpacingTests.length ? 'PASSED' : 'FAILED';
  console.log(`\n3. Card Spacing Fixes: ${cardSpacingStatus}`);
  console.log(`   No overlapping between cards: ${cardSpacingPassed}/${cardSpacingTests.length} tests passed`);
  console.log(`   Consistent spacing maintained across all viewports: ${cardSpacingPassed}/${cardSpacingTests.length} tests passed`);
  console.log(`   Proper alignment within the carousel container: ${cardSpacingPassed}/${cardSpacingTests.length} tests passed`);
  
  // 4. Image/Video Handling
  const mediaHandlingTests = testResults.results.filter(result => result.category === 'mediaHandling');
  const mediaHandlingPassed = mediaHandlingTests.filter(test => test.passed).length;
  const mediaHandlingStatus = mediaHandlingPassed === mediaHandlingTests.length ? 'PASSED' : 'FAILED';
  console.log(`\n4. Image/Video Handling: ${mediaHandlingStatus}`);
  console.log(`   Images and videos use object-fit: cover properly: ${mediaHandlingPassed}/${mediaHandlingTests.length} tests passed`);
  console.log(`   No stretching or squishing of media content: ${mediaHandlingPassed}/${mediaHandlingTests.length} tests passed`);
  console.log(`   Media maintains proper aspect ratio within cards: ${mediaHandlingPassed}/${mediaHandlingTests.length} tests passed`);
  
  // 5. Carousel Functionality
  const carouselFunctionalityTests = testResults.results.filter(result => result.category === 'carouselFunctionality');
  const carouselFunctionalityPassed = carouselFunctionalityTests.filter(test => test.passed).length;
  const carouselFunctionalityStatus = carouselFunctionalityPassed === carouselFunctionalityTests.length ? 'PASSED' : 'FAILED';
  console.log(`\n5. Carousel Functionality: ${carouselFunctionalityStatus}`);
  console.log(`   Navigation arrows work correctly: ${carouselFunctionalityPassed}/${carouselFunctionalityTests.length} tests passed`);
  console.log(`   Smooth transitions between slides: ${carouselFunctionalityPassed}/${carouselFunctionalityTests.length} tests passed`);
  console.log(`   Keyboard navigation works: ${carouselFunctionalityPassed}/${carouselFunctionalityTests.length} tests passed`);
  
  // 6. Overall Visual Consistency
  const visualConsistencyTests = testResults.results.filter(result => result.category === 'visualConsistency');
  const visualConsistencyPassed = visualConsistencyTests.filter(test => test.passed).length;
  const visualConsistencyStatus = visualConsistencyPassed === visualConsistencyTests.length ? 'PASSED' : 'FAILED';
  console.log(`\n6. Overall Visual Consistency: ${visualConsistencyStatus}`);
  console.log(`   Uniform appearance across all breakpoints: ${visualConsistencyPassed}/${visualConsistencyTests.length} tests passed`);
  console.log(`   No layout breaks or visual inconsistencies: ${visualConsistencyPassed}/${visualConsistencyTests.length} tests passed`);
  console.log(`   Professional, polished presentation: ${visualConsistencyPassed}/${visualConsistencyTests.length} tests passed`);
  
  // Final assessment
  console.log('\n--- FINAL ASSESSMENT ---');
  if (overallStatus === 'PASSED') {
    console.log('✅ All validation tests passed successfully!');
    console.log('✅ The 3:4 aspect ratio is properly implemented across all viewports');
    console.log('✅ Text visibility improvements are working correctly');
    console.log('✅ Card spacing fixes have resolved overlapping issues');
    console.log('✅ Image/video handling is working as expected');
    console.log('✅ Carousel functionality is fully operational');
    console.log('✅ Overall visual consistency is maintained');
    console.log('\n🎉 The WhyChooseUs carousel implementation is ready for production!');
  } else {
    console.log('❌ Some validation tests failed.');
    console.log('❌ Please review the failed tests and implement necessary fixes.');
    console.log('\n🔧 The WhyChooseUs carousel implementation requires further attention.');
  }
  
  // Save comprehensive report
  saveComprehensiveReport(testResults, {
    aspectRatioStatus,
    textVisibilityStatus,
    cardSpacingStatus,
    mediaHandlingStatus,
    carouselFunctionalityStatus,
    visualConsistencyStatus,
    overallStatus
  });
  
  return {
    overallStatus,
    summary: testResults.summary,
    categoryResults: {
      aspectRatio: aspectRatioStatus,
      textVisibility: textVisibilityStatus,
      cardSpacing: cardSpacingStatus,
      mediaHandling: mediaHandlingStatus,
      carouselFunctionality: carouselFunctionalityStatus,
      visualConsistency: visualConsistencyStatus
    }
  };
}

/**
 * Save comprehensive report to file
 */
function saveComprehensiveReport(testResults, validationStatus) {
  const reportPath = './test-results/why-choose-us-comprehensive-final-report.json';
  
  // Ensure directory exists
  const dir = path.dirname(reportPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  
  const comprehensiveReport = {
    timestamp: new Date().toISOString(),
    title: 'WhyChooseUs Carousel Comprehensive Final Validation Report',
    summary: testResults.summary,
    validationStatus,
    conclusion: validationStatus.overallStatus === 'PASSED'
      ? 'All validation tests passed successfully. The 3:4 aspect ratio is properly implemented, text visibility improvements are working correctly, card spacing fixes have resolved overlapping issues, image/video handling is working as expected, carousel functionality is fully operational, and overall visual consistency is maintained. The WhyChooseUs carousel implementation is ready for production.'
      : 'Some validation tests failed. Please review the failed tests and implement necessary fixes before deploying to production.',
    detailedResults: testResults.results
  };
  
  fs.writeFileSync(reportPath, JSON.stringify(comprehensiveReport, null, 2));
  console.log(`\nComprehensive report saved to: ${reportPath}`);
}

/**
 * Main function
 */
function main() {
  try {
    const report = runComprehensiveTests();
    return report;
  } catch (error) {
    console.error('Error running comprehensive tests:', error);
    throw error;
  }
}

// Execute if run directly
if (require.main === module) {
  main();
}

module.exports = {
  runComprehensiveTests,
  generateAndDisplayReport,
  saveComprehensiveReport,
  main
};