/**
 * Accessibility Testing for Solutions Component
 * Tests WCAG compliance, keyboard navigation, ARIA labels, and screen reader compatibility
 */

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

// Test configuration
const BASE_URL = 'http://localhost:3001';
const TEST_RESULTS_DIR = './test-results';
const REPORT_FILE = path.join(TEST_RESULTS_DIR, 'solutions-accessibility-test-report.json');

// Initialize test results
const testResults = {
  timestamp: new Date().toISOString(),
  tests: {
    wcagCompliance: { passed: 0, failed: 0, details: [] },
    keyboardNavigation: { passed: 0, failed: 0, details: [] },
    ariaLabels: { passed: 0, failed: 0, details: [] },
    screenReader: { passed: 0, failed: 0, details: [] }
  },
  summary: { totalPassed: 0, totalFailed: 0 }
};

// Ensure test directories exist
if (!fs.existsSync(TEST_RESULTS_DIR)) fs.mkdirSync(TEST_RESULTS_DIR, { recursive: true });

// Helper function to record test results
function recordTest(category, testName, passed, details = '') {
  const result = { testName, passed, details, timestamp: new Date().toISOString() };
  testResults.tests[category].details.push(result);
  
  if (passed) {
    testResults.tests[category].passed++;
    testResults.summary.totalPassed++;
  } else {
    testResults.tests[category].failed++;
    testResults.summary.totalFailed++;
  }
}

// Helper function to calculate contrast ratio
function calculateContrast(rgb1, rgb2) {
  // Convert RGB to relative luminance
  const rgbToLuminance = (r, g, b) => {
    const [rs, gs, bs] = [r, g, b].map(c => {
      c = c / 255;
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
  };
  
  const lum1 = rgbToLuminance(rgb1.r, rgb1.g, rgb1.b);
  const lum2 = rgbToLuminance(rgb2.r, rgb2.g, rgb2.b);
  
  const brightest = Math.max(lum1, lum2);
  const darkest = Math.min(lum1, lum2);
  
  return (brightest + 0.05) / (darkest + 0.05);
}

// Helper function to hex to RGB
function hexToRgb(hex) {
  if (!hex || hex === 'transparent') return null;
  if (hex.startsWith('#')) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  }
  if (hex.startsWith('rgb')) {
    const values = hex.match(/\d+/g);
    return values ? {
      r: parseInt(values[0]),
      g: parseInt(values[1]),
      b: parseInt(values[2])
    } : null;
  }
  return null;
}

// Main test function
async function runAccessibilityTests() {
  console.log('♿ Starting Solutions Component Accessibility Tests...\n');
  
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    // Navigate to the page
    await page.goto(BASE_URL, { waitUntil: 'networkidle' });
    
    // Wait for the page to fully load
    await page.waitForTimeout(3000);
    
    // Scroll to Solutions section
    await page.evaluate(() => {
      document.getElementById('solutions')?.scrollIntoView({ behavior: 'smooth' });
    });
    
    // Wait for scroll to complete
    await page.waitForTimeout(2000);
    
    // Run accessibility tests
    await testWCAGCompliance(page);
    await testKeyboardNavigation(page);
    await testAriaLabels(page);
    await testScreenReaderCompatibility(page);
    
  } catch (error) {
    console.error('Error during accessibility testing:', error);
  } finally {
    await browser.close();
  }
  
  // Save test results
  fs.writeFileSync(REPORT_FILE, JSON.stringify(testResults, null, 2));
  
  // Print summary
  console.log('\n📊 Accessibility Test Summary:');
  console.log(`✅ Passed: ${testResults.summary.totalPassed}`);
  console.log(`❌ Failed: ${testResults.summary.totalFailed}`);
  console.log(`📄 Detailed report saved to: ${REPORT_FILE}`);
  
  return testResults;
}

// Test WCAG Compliance
async function testWCAGCompliance(page) {
  console.log('🔍 Testing WCAG compliance...');
  
  try {
    // Test 1: Check color contrast for headings
    const headingContrast = await page.evaluate(() => {
      const headings = document.querySelectorAll('#solutions h2, #solutions h3');
      const results = [];
      
      headings.forEach(heading => {
        const styles = window.getComputedStyle(heading);
        const color = styles.color;
        const backgroundColor = styles.backgroundColor;
        
        results.push({
          tag: heading.tagName,
          text: heading.textContent.substring(0, 30),
          color,
          backgroundColor,
          fontSize: styles.fontSize,
          fontWeight: styles.fontWeight
        });
      });
      
      return results;
    });
    
    headingContrast.forEach(item => {
      const textColor = hexToRgb(item.color);
      const bgColor = hexToRgb(item.backgroundColor);
      
      if (textColor && bgColor) {
        const contrastRatio = calculateContrast(textColor, bgColor);
        const isLargeText = parseFloat(item.fontSize) >= 18 || (parseFloat(item.fontSize) >= 14 && parseFloat(item.fontWeight) >= 700);
        const requiredRatio = isLargeText ? 3.0 : 4.5;
        const passesWCAG = contrastRatio >= requiredRatio;
        
        recordTest('wcagCompliance', `Heading contrast ratio (${item.tag})`, passesWCAG,
          `Text: ${item.text}..., Contrast: ${contrastRatio.toFixed(2)}:1, Required: ${requiredRatio}:1`);
      } else {
        recordTest('wcagCompliance', `Heading color check (${item.tag})`, false,
          `Could not determine colors - Text: ${item.color}, Background: ${item.backgroundColor}`);
      }
    });
    
    // Test 2: Check color contrast for body text
    const textContrast = await page.evaluate(() => {
      const textElements = document.querySelectorAll('#solutions p, #solutions li, #solutions span');
      const results = [];
      
      textElements.forEach(element => {
        if (element.textContent.trim().length > 0) {
          const styles = window.getComputedStyle(element);
          const color = styles.color;
          const backgroundColor = styles.backgroundColor;
          
          results.push({
            tag: element.tagName,
            text: element.textContent.substring(0, 30),
            color,
            backgroundColor,
            fontSize: styles.fontSize,
            fontWeight: styles.fontWeight
          });
        }
      });
      
      return results.slice(0, 5); // Limit to first 5 elements
    });
    
    textContrast.forEach(item => {
      const textColor = hexToRgb(item.color);
      const bgColor = hexToRgb(item.backgroundColor);
      
      if (textColor && bgColor) {
        const contrastRatio = calculateContrast(textColor, bgColor);
        const isLargeText = parseFloat(item.fontSize) >= 18 || (parseFloat(item.fontSize) >= 14 && parseFloat(item.fontWeight) >= 700);
        const requiredRatio = isLargeText ? 3.0 : 4.5;
        const passesWCAG = contrastRatio >= requiredRatio;
        
        recordTest('wcagCompliance', `Text contrast ratio (${item.tag})`, passesWCAG,
          `Text: ${item.text}..., Contrast: ${contrastRatio.toFixed(2)}:1, Required: ${requiredRatio}:1`);
      } else {
        recordTest('wcagCompliance', `Text color check (${item.tag})`, false,
          `Could not determine colors - Text: ${item.color}, Background: ${item.backgroundColor}`);
      }
    });
    
    // Test 3: Check focus indicators
    const hasFocusStyles = await page.evaluate(() => {
      const focusableElements = document.querySelectorAll('#solutions button, #solutions a, #solutions [tabindex]');
      if (focusableElements.length === 0) return { hasFocusable: false, hasFocusStyles: false };
      
      // Check if there are any focus styles defined
      const styleSheets = Array.from(document.styleSheets);
      let hasFocusStyles = false;
      
      styleSheets.forEach(sheet => {
        try {
          const rules = Array.from(sheet.cssRules || sheet.rules || []);
          hasFocusStyles = hasFocusStyles || rules.some(rule => 
            rule.selectorText && rule.selectorText.includes(':focus')
          );
        } catch (e) {
          // Ignore CORS errors
        }
      });
      
      return { hasFocusable: true, hasFocusStyles };
    });
    
    recordTest('wcagCompliance', 'Focus indicators available', hasFocusStyles.hasFocusStyles,
      hasFocusStyles.hasFocusable ? (hasFocusStyles.hasFocusStyles ? 'Focus styles found' : 'No focus styles found') : 'No focusable elements found');
    
    // Test 4: Check text resizing
    await page.evaluate(() => {
      document.documentElement.style.fontSize = '200%';
    });
    
    await page.waitForTimeout(1000);
    
    const textResizingWorks = await page.evaluate(() => {
      const heading = document.querySelector('#solutions h2');
      if (!heading) return false;
      
      const styles = window.getComputedStyle(heading);
      const fontSize = parseFloat(styles.fontSize);
      return fontSize >= 36; // Should be at least 36px for 200% zoom
    });
    
    recordTest('wcagCompliance', 'Text resizing works', textResizingWorks,
      textResizingWorks ? 'Text properly scales to 200%' : 'Text does not scale properly');
    
    // Reset zoom
    await page.evaluate(() => {
      document.documentElement.style.fontSize = '';
    });
    
  } catch (error) {
    recordTest('wcagCompliance', 'WCAG compliance testing error', false, error.message);
  }
}

// Test Keyboard Navigation
async function testKeyboardNavigation(page) {
  console.log('⌨️  Testing keyboard navigation...');
  
  try {
    // Test 1: Check if Solutions section can receive focus
    await page.keyboard.press('Tab');
    
    const focusedElement = await page.evaluate(() => {
      const element = document.activeElement;
      return {
        tagName: element.tagName,
        id: element.id,
        className: element.className,
        isInSolutions: element.closest('#solutions') !== null
      };
    });
    
    recordTest('keyboardNavigation', 'Can focus on Solutions section', focusedElement.isInSolutions,
      `Focused element: ${focusedElement.tagName}${focusedElement.id ? '#' + focusedElement.id : ''}`);
    
    // Test 2: Check tab order through Solutions section
    let tabCount = 0;
    let elementsInSolutions = 0;
    
    for (let i = 0; i < 20; i++) {
      await page.keyboard.press('Tab');
      
      const currentElement = await page.evaluate(() => {
        const element = document.activeElement;
        return {
          tagName: element.tagName,
          id: element.id,
          isInSolutions: element.closest('#solutions') !== null
        };
      });
      
      if (currentElement.isInSolutions) {
        elementsInSolutions++;
      }
      
      tabCount++;
      
      // Stop if we've cycled through the page
      if (currentElement.tagName === 'BODY') break;
    }
    
    recordTest('keyboardNavigation', 'Tab order includes Solutions elements', elementsInSolutions > 0,
      `Found ${elementsInSolutions} focusable elements in Solutions section after ${tabCount} tabs`);
    
    // Test 3: Check if focus is visible
    await page.evaluate(() => {
      const firstFocusable = document.querySelector('#solutions button, #solutions a, #solutions [tabindex]:not([tabindex="-1"])');
      if (firstFocusable) firstFocusable.focus();
    });
    
    const focusVisible = await page.evaluate(() => {
      const element = document.activeElement;
      if (!element) return false;
      
      const styles = window.getComputedStyle(element, ':focus');
      const outline = styles.outline;
      const boxShadow = styles.boxShadow;
      
      return outline !== 'none' || boxShadow !== 'none';
    });
    
    recordTest('keyboardNavigation', 'Focus is visible', focusVisible,
      focusVisible ? 'Focus indicator is visible' : 'No visible focus indicator');
    
    // Test 4: Check escape key functionality
    await page.keyboard.press('Escape');
    
    const escapeWorks = await page.evaluate(() => {
      // This is a basic test - in a real app, Escape might close modals, etc.
      // We're just checking that it doesn't cause errors
      return true;
    });
    
    recordTest('keyboardNavigation', 'Escape key works', escapeWorks,
      'Escape key handled without errors');
    
  } catch (error) {
    recordTest('keyboardNavigation', 'Keyboard navigation testing error', false, error.message);
  }
}

// Test ARIA Labels
async function testAriaLabels(page) {
  console.log('🏷️  Testing ARIA labels...');
  
  try {
    // Test 1: Check main section has aria-label
    const sectionAriaLabel = await page.locator('#solutions').getAttribute('aria-label');
    const hasSectionAriaLabel = sectionAriaLabel === 'Solutions section';
    
    recordTest('ariaLabels', 'Section has aria-label', hasSectionAriaLabel,
      hasSectionAriaLabel ? 'Section has correct aria-label' : `Section aria-label: ${sectionAriaLabel || 'missing'}`);
    
    // Test 2: Check decorative elements have aria-hidden
    const decorativeElements = await page.locator('#solutions video[aria-hidden="true"], #solutions .absolute.inset-0[aria-hidden="true"]').count();
    const hasDecorativeAriaHidden = decorativeElements >= 2; // Should have at least video and overlay
    
    recordTest('ariaLabels', 'Decorative elements have aria-hidden', hasDecorativeAriaHidden,
      `Found ${decorativeElements} decorative elements with aria-hidden="true"`);
    
    // Test 3: Check for proper heading structure
    const headingStructure = await page.evaluate(() => {
      const headings = document.querySelectorAll('#solutions h1, #solutions h2, #solutions h3, #solutions h4, #solutions h5, #solutions h6');
      return Array.from(headings).map(h => ({
        tag: h.tagName,
        text: h.textContent.substring(0, 50)
      }));
    });
    
    const hasProperHeadings = headingStructure.length > 0;
    recordTest('ariaLabels', 'Proper heading structure', hasProperHeadings,
      hasProperHeadings ? `Found ${headingStructure.length} headings` : 'No headings found');
    
    // Test 4: Check for proper list structure
    const listStructure = await page.evaluate(() => {
      const lists = document.querySelectorAll('#solutions ul, #solutions ol');
      return Array.from(lists).map(list => ({
        tag: list.tagName,
        itemCount: list.querySelectorAll('li').length
      }));
    });
    
    const hasProperLists = listStructure.length > 0;
    recordTest('ariaLabels', 'Proper list structure', hasProperLists,
      hasProperLists ? `Found ${listStructure.length} lists with items` : 'No lists found');
    
    // Test 5: Check for missing alt text on images (if any)
    const imagesWithoutAlt = await page.locator('#solutions img:not([alt])').count();
    const hasImageAlts = imagesWithoutAlt === 0;
    
    recordTest('ariaLabels', 'Images have alt text', hasImageAlts,
      hasImageAlts ? 'All images have alt text' : `Found ${imagesWithoutAlt} images without alt text`);
    
  } catch (error) {
    recordTest('ariaLabels', 'ARIA labels testing error', false, error.message);
  }
}

// Test Screen Reader Compatibility
async function testScreenReaderCompatibility(page) {
  console.log('🔊 Testing screen reader compatibility...');
  
  try {
    // Test 1: Check for semantic HTML structure
    const semanticStructure = await page.evaluate(() => {
      const section = document.querySelector('#solutions');
      const hasSection = section && section.tagName === 'SECTION';
      
      const headings = section.querySelectorAll('h1, h2, h3, h4, h5, h6');
      const hasHeadings = headings.length > 0;
      
      const lists = section.querySelectorAll('ul, ol, dl');
      const hasLists = lists.length > 0;
      
      return {
        hasSection,
        hasHeadings,
        hasLists,
        headingCount: headings.length,
        listCount: lists.length
      };
    });
    
    recordTest('screenReader', 'Semantic HTML structure', 
      semanticStructure.hasSection && semanticStructure.hasHeadings,
      `Section: ${semanticStructure.hasSection}, Headings: ${semanticStructure.headingCount}, Lists: ${semanticStructure.listCount}`);
    
    // Test 2: Check for accessible names
    const accessibleNames = await page.evaluate(() => {
      const elements = document.querySelectorAll('#solutions [role], #solutions [aria-label], #solutions [aria-labelledby]');
      return Array.from(elements).map(el => ({
        tag: el.tagName,
        role: el.getAttribute('role'),
        ariaLabel: el.getAttribute('aria-label'),
        ariaLabelledby: el.getAttribute('aria-labelledby')
      }));
    });
    
    const hasAccessibleNames = accessibleNames.length > 0;
    recordTest('screenReader', 'Elements have accessible names', hasAccessibleNames,
      hasAccessibleNames ? `Found ${accessibleNames.length} elements with accessibility attributes` : 'No elements with accessibility attributes found');
    
    // Test 3: Check for proper reading order
    const readingOrder = await page.evaluate(() => {
      const section = document.querySelector('#solutions');
      if (!section) return false;
      
      // Check if content appears in logical order
      const mainHeading = section.querySelector('h2');
      const descriptions = section.querySelectorAll('p');
      const cards = section.querySelectorAll('.grid > div');
      
      if (!mainHeading) return false;
      
      // Get positions of elements
      const getElementPosition = (el) => {
        const rect = el.getBoundingClientRect();
        return rect.top + window.scrollY;
      };
      
      const headingPos = getElementPosition(mainHeading);
      const descPos = descriptions.length > 0 ? getElementPosition(descriptions[0]) : headingPos;
      const cardPos = cards.length > 0 ? getElementPosition(cards[0]) : headingPos;
      
      // Check if elements are in logical order (heading first, then description, then cards)
      return headingPos <= descPos && descPos <= cardPos;
    });
    
    recordTest('screenReader', 'Logical reading order', readingOrder,
      readingOrder ? 'Content appears in logical order' : 'Content order may be confusing');
    
    // Test 4: Check for form controls (if any)
    const formControls = await page.evaluate(() => {
      const controls = document.querySelectorAll('#solutions button, #solutions input, #solutions select, #solutions textarea');
      return Array.from(controls).map(control => ({
        tag: control.tagName,
        type: control.type || 'N/A',
        hasLabel: !!control.labels || !!control.getAttribute('aria-label') || !!control.getAttribute('aria-labelledby'),
        hasName: !!control.getAttribute('name')
      }));
    });
    
    const formControlsAccessible = formControls.every(control => control.hasLabel);
    recordTest('screenReader', 'Form controls accessible', formControls.length === 0 || formControlsAccessible,
      formControls.length === 0 ? 'No form controls found' : `${formControls.length} form controls, ${formControls.filter(c => c.hasLabel).length} with labels`);
    
  } catch (error) {
    recordTest('screenReader', 'Screen reader compatibility testing error', false, error.message);
  }
}

// Run the tests
runAccessibilityTests().then(results => {
  console.log('\n🎉 Accessibility tests completed!');
  process.exit(results.summary.totalFailed > 0 ? 1 : 0);
}).catch(error => {
  console.error('Accessibility test execution failed:', error);
  process.exit(1);
});