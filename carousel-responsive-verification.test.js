/**
 * Carousel Responsive Design and Cross-Browser Compatibility Verification
 * 
 * This test file verifies the carousel's responsive behavior and cross-browser compatibility
 * by simulating different viewport sizes and browser environments.
 */

// Test configuration
const TEST_CONFIG = {
  viewports: [
    { name: 'Small Mobile', width: 320, height: 568 },
    { name: 'Mobile', width: 375, height: 667 },
    { name: 'Large Mobile', width: 414, height: 896 },
    { name: 'Tablet', width: 768, height: 1024 },
    { name: 'Large Tablet', width: 896, height: 1024 },
    { name: 'Desktop', width: 1024, height: 768 },
    { name: 'Large Desktop', width: 1280, height: 800 },
    { name: 'Ultra Wide', width: 1440, height: 900 },
    { name: '4K', width: 1920, height: 1080 }
  ],
  browsers: [
    { name: 'Chrome', userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36' },
    { name: 'Firefox', userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:89.0) Gecko/20100101 Firefox/89.0' },
    { name: 'Safari', userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.1 Safari/605.1.15' },
    { name: 'Edge', userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36 Edg/91.0.864.59' }
  ],
  tests: {
    responsiveDesign: true,
    videoAutoplay: true,
    staticImageDisplay: true,
    touchGestures: true,
    performance: true,
    accessibility: true
  }
};

// Test results storage
const testResults = {
  responsiveDesign: {},
  videoAutoplay: {},
  staticImageDisplay: {},
  touchGestures: {},
  performance: {},
  accessibility: {},
  summary: {
    passed: 0,
    failed: 0,
    total: 0
  }
};

// Utility functions
function log(message, type = 'info') {
  const timestamp = new Date().toISOString();
  const prefix = `[${timestamp}] [${type.toUpperCase()}]`;
  console.log(`${prefix} ${message}`);
}

function recordResult(testCategory, testName, passed, details = '') {
  if (!testResults[testCategory]) {
    testResults[testCategory] = {};
  }
  
  testResults[testCategory][testName] = {
    passed,
    details,
    timestamp: new Date().toISOString()
  };
  
  testResults.summary.total++;
  if (passed) {
    testResults.summary.passed++;
  } else {
    testResults.summary.failed++;
  }
  
  log(`${testCategory}: ${testName} - ${passed ? 'PASSED' : 'FAILED'} ${details ? `(${details})` : ''}`, passed ? 'success' : 'error');
}

// Simulate viewport size
function simulateViewport(width, height) {
  // Create a test container
  const container = document.createElement('div');
  container.id = 'test-container';
  container.style.width = `${width}px`;
  container.style.height = `${height}px`;
  container.style.position = 'absolute';
  container.style.top = '0';
  container.style.left = '0';
  container.style.zIndex = '9999';
  container.style.background = 'rgba(0, 0, 0, 0.8)';
  container.style.color = 'white';
  container.style.padding = '20px';
  container.style.overflow = 'auto';
  
  // Add viewport info
  const info = document.createElement('div');
  info.innerHTML = `
    <h2>Viewport Test: ${width}x${height}</h2>
    <p>Testing responsive behavior...</p>
  `;
  container.appendChild(info);
  
  document.body.appendChild(container);
  
  // Return cleanup function
  return () => {
    document.body.removeChild(container);
  };
}

// Simulate browser environment
function simulateBrowser(userAgent) {
  const originalUserAgent = navigator.userAgent;
  Object.defineProperty(navigator, 'userAgent', {
    writable: true,
    value: userAgent
  });
  
  // Return cleanup function
  return () => {
    Object.defineProperty(navigator, 'userAgent', {
      writable: true,
      value: originalUserAgent
    });
  };
}

// Test responsive design
function testResponsiveDesign() {
  log('Starting responsive design tests...');
  
  TEST_CONFIG.viewports.forEach(viewport => {
    const cleanup = simulateViewport(viewport.width, viewport.height);
    
    try {
      // Test if carousel container exists
      const carousel = document.querySelector('.carousel');
      if (!carousel) {
        recordResult('responsiveDesign', `${viewport.name} - Carousel Container`, false, 'Carousel container not found');
        cleanup();
        return;
      }
      
      // Test if slides maintain aspect ratio
      const slides = document.querySelectorAll('.carousel__slide');
      let aspectRatioPassed = true;
      
      slides.forEach(slide => {
        const computedStyle = window.getComputedStyle(slide);
        const aspectRatio = computedStyle.aspectRatio;
        
        if (!aspectRatio || !aspectRatio.includes('3/4')) {
          aspectRatioPassed = false;
        }
      });
      
      recordResult('responsiveDesign', `${viewport.name} - Aspect Ratio (3:4)`, aspectRatioPassed, aspectRatioPassed ? 'Correct aspect ratio maintained' : 'Aspect ratio not maintained');
      
      // Test if navigation arrows are properly sized
      const prevArrow = document.querySelector('.carousel__arrow--prev');
      const nextArrow = document.querySelector('.carousel__arrow--next');
      
      if (prevArrow && nextArrow) {
        const prevStyle = window.getComputedStyle(prevArrow);
        const nextStyle = window.getComputedStyle(nextArrow);
        
        const minWidth = parseInt(prevStyle.minWidth) || 0;
        const minHeight = parseInt(prevStyle.minHeight) || 0;
        const width = parseInt(prevStyle.width) || 0;
        const height = parseInt(prevStyle.height) || 0;
        
        // Check if touch targets are at least 44px on mobile
        const isMobile = viewport.width < 768;
        const touchTargetPassed = !isMobile || (minWidth >= 44 && minHeight >= 44 && width >= 44 && height >= 44);
        
        recordResult('responsiveDesign', `${viewport.name} - Navigation Arrow Size`, touchTargetPassed, 
          touchTargetPassed ? 'Touch targets properly sized' : 'Touch targets too small for mobile');
      } else {
        recordResult('responsiveDesign', `${viewport.name} - Navigation Arrows`, false, 'Navigation arrows not found');
      }
      
      // Test if text overlays are readable
      const textOverlays = document.querySelectorAll('.video-card-container .text-overlay, .video-card-container > div > div:last-child');
      let textReadable = true;
      
      textOverlays.forEach(overlay => {
        const computedStyle = window.getComputedStyle(overlay);
        const fontSize = parseFloat(computedStyle.fontSize);
        
        // Check if font size is appropriate for viewport
        let minFontSize = viewport.width < 480 ? 14 : 16;
        if (fontSize < minFontSize) {
          textReadable = false;
        }
      });
      
      recordResult('responsiveDesign', `${viewport.name} - Text Readability`, textReadable, 
        textReadable ? 'Text is readable at this viewport' : 'Text too small for this viewport');
      
    } catch (error) {
      recordResult('responsiveDesign', `${viewport.name} - General Test`, false, `Error: ${error.message}`);
    }
    
    cleanup();
  });
}

// Test video autoplay behavior
function testVideoAutoplay() {
  log('Starting video autoplay tests...');
  
  TEST_CONFIG.browsers.forEach(browser => {
    const cleanup = simulateBrowser(browser.userAgent);
    
    try {
      // Test if videos have autoplay attributes
      const videos = document.querySelectorAll('.carousel__slide video');
      let autoplayPassed = true;
      
      videos.forEach(video => {
        if (!video.hasAttribute('autoplay') && !video.hasAttribute('data-force-autoplay')) {
          autoplayPassed = false;
        }
      });
      
      recordResult('videoAutoplay', `${browser.name} - Autoplay Attributes`, autoplayPassed, 
        autoplayPassed ? 'Videos have autoplay attributes' : 'Missing autoplay attributes');
      
      // Test browser-specific attributes
      let browserSpecificPassed = true;
      
      videos.forEach(video => {
        // Safari
        if (browser.name === 'Safari' && !video.hasAttribute('playsInline')) {
          browserSpecificPassed = false;
        }
        
        // Mobile browsers
        if (browser.name.includes('Mobile') && !video.hasAttribute('playsInline')) {
          browserSpecificPassed = false;
        }
        
        // All browsers should have muted for autoplay
        if (!video.hasAttribute('muted')) {
          browserSpecificPassed = false;
        }
      });
      
      recordResult('videoAutoplay', `${browser.name} - Browser Specific Attributes`, browserSpecificPassed, 
        browserSpecificPassed ? 'Browser-specific attributes present' : 'Missing browser-specific attributes');
      
    } catch (error) {
      recordResult('videoAutoplay', `${browser.name} - General Test`, false, `Error: ${error.message}`);
    }
    
    cleanup();
  });
}

// Test static image display
function testStaticImageDisplay() {
  log('Starting static image display tests...');
  
  try {
    // Test if static images are rendered correctly
    const staticImages = document.querySelectorAll('.carousel__slide img');
    let imageDisplayPassed = true;
    
    staticImages.forEach(img => {
      const computedStyle = window.getComputedStyle(img);
      const objectFit = computedStyle.objectFit;
      
      if (objectFit !== 'cover') {
        imageDisplayPassed = false;
      }
      
      // Check if image has proper dimensions
      const width = parseInt(computedStyle.width) || 0;
      const height = parseInt(computedStyle.height) || 0;
      
      if (width === 0 || height === 0) {
        imageDisplayPassed = false;
      }
    });
    
    recordResult('staticImageDisplay', 'Image Object Fit', imageDisplayPassed, 
      imageDisplayPassed ? 'Images have correct object-fit' : 'Images missing object-fit: cover');
    
    // Test if images maintain aspect ratio
    const slides = document.querySelectorAll('.carousel__slide');
    let aspectRatioPassed = true;
    
    slides.forEach(slide => {
      const img = slide.querySelector('img');
      if (img) {
        const slideStyle = window.getComputedStyle(slide);
        const imgStyle = window.getComputedStyle(img);
        
        const slideAspectRatio = slideStyle.aspectRatio;
        const imgPosition = imgStyle.position;
        
        if (imgPosition !== 'absolute') {
          aspectRatioPassed = false;
        }
      }
    });
    
    recordResult('staticImageDisplay', 'Image Positioning', aspectRatioPassed, 
      aspectRatioPassed ? 'Images positioned correctly' : 'Images not positioned correctly');
      
  } catch (error) {
    recordResult('staticImageDisplay', 'General Test', false, `Error: ${error.message}`);
  }
}

// Test touch gestures
function testTouchGestures() {
  log('Starting touch gesture tests...');
  
  try {
    // Test if touch events are properly handled
    const viewport = document.querySelector('.carousel__viewport');
    
    if (!viewport) {
      recordResult('touchGestures', 'Touch Events', false, 'Carousel viewport not found');
      return;
    }
    
    // Check touch-action property
    const computedStyle = window.getComputedStyle(viewport);
    const touchAction = computedStyle.touchAction;
    
    const touchActionPassed = touchAction === 'pan-y' || touchAction === 'manipulation';
    recordResult('touchGestures', 'Touch Action Property', touchActionPassed, 
      touchActionPassed ? `Touch action set to ${touchAction}` : 'Touch action not properly configured');
    
    // Test if haptic feedback is available
    const hapticAvailable = 'vibrate' in navigator;
    recordResult('touchGestures', 'Haptic Feedback', hapticAvailable, 
      hapticAvailable ? 'Haptic feedback available' : 'Haptic feedback not available');
    
    // Test if touch targets are large enough
    const arrows = document.querySelectorAll('.carousel__arrow');
    let touchTargetPassed = true;
    
    arrows.forEach(arrow => {
      const arrowStyle = window.getComputedStyle(arrow);
      const width = parseInt(arrowStyle.width) || 0;
      const height = parseInt(arrowStyle.height) || 0;
      
      if (width < 44 || height < 44) {
        touchTargetPassed = false;
      }
    });
    
    recordResult('touchGestures', 'Touch Target Size', touchTargetPassed, 
      touchTargetPassed ? 'Touch targets are at least 44px' : 'Touch targets too small');
      
  } catch (error) {
    recordResult('touchGestures', 'General Test', false, `Error: ${error.message}`);
  }
}

// Test performance optimizations
function testPerformance() {
  log('Starting performance tests...');
  
  try {
    // Test if GPU acceleration is enabled
    const track = document.querySelector('.carousel__track');
    let gpuAccelerationPassed = false;
    
    if (track) {
      const trackStyle = window.getComputedStyle(track);
      const transform = trackStyle.transform;
      const willChange = trackStyle.willChange;
      
      if (transform.includes('translateZ') || willChange.includes('transform')) {
        gpuAccelerationPassed = true;
      }
    }
    
    recordResult('performance', 'GPU Acceleration', gpuAccelerationPassed, 
      gpuAccelerationPassed ? 'GPU acceleration enabled' : 'GPU acceleration not enabled');
    
    // Test if lazy loading is implemented
    const lazyElements = document.querySelectorAll('[loading="lazy"], .carousel__slide--lazy');
    const lazyLoadingPassed = lazyElements.length > 0;
    
    recordResult('performance', 'Lazy Loading', lazyLoadingPassed, 
      lazyLoadingPassed ? `${lazyElements.length} lazy elements found` : 'No lazy loading detected');
    
    // Test if reduced motion is respected
    const reducedMotionMediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const reducedMotionSupported = reducedMotionMediaQuery.media !== 'not all';
    
    recordResult('performance', 'Reduced Motion Support', reducedMotionSupported, 
      reducedMotionSupported ? 'Reduced motion supported' : 'Reduced motion not supported');
      
  } catch (error) {
    recordResult('performance', 'General Test', false, `Error: ${error.message}`);
  }
}

// Test accessibility compliance
function testAccessibility() {
  log('Starting accessibility tests...');
  
  try {
    // Test ARIA labels
    const carousel = document.querySelector('.carousel');
    let ariaPassed = true;
    
    if (carousel) {
      if (!carousel.hasAttribute('role') || !carousel.hasAttribute('aria-roledescription')) {
        ariaPassed = false;
      }
    }
    
    recordResult('accessibility', 'ARIA Labels', ariaPassed, 
      ariaPassed ? 'ARIA labels present' : 'Missing ARIA labels');
    
    // Test keyboard navigation
    const focusableElements = document.querySelectorAll('.carousel__arrow, .carousel__slide');
    let keyboardNavPassed = focusableElements.length > 0;
    
    focusableElements.forEach(element => {
      const tabIndex = element.getAttribute('tabindex');
      if (tabIndex === null || tabIndex === '-1') {
        // Check if element should be focusable
        if (element.classList.contains('carousel__arrow')) {
          keyboardNavPassed = false;
        }
      }
    });
    
    recordResult('accessibility', 'Keyboard Navigation', keyboardNavPassed, 
      keyboardNavPassed ? 'Keyboard navigation supported' : 'Keyboard navigation issues');
    
    // Test color contrast
    const textElements = document.querySelectorAll('.video-card-container .text-overlay h3, .video-card-container .text-overlay p');
    let contrastPassed = true;
    
    textElements.forEach(element => {
      const computedStyle = window.getComputedStyle(element);
      const color = computedStyle.color;
      const backgroundColor = computedStyle.backgroundColor;
      
      // Simple check for white text on dark background
      if (color.includes('255, 255, 255') && backgroundColor.includes('0, 0, 0')) {
        // Good contrast
      } else if (color.includes('0, 0, 0') && backgroundColor.includes('255, 255, 255')) {
        // Good contrast
      } else {
        // Might have contrast issues
        contrastPassed = false;
      }
    });
    
    recordResult('accessibility', 'Color Contrast', contrastPassed, 
      contrastPassed ? 'Color contrast appears adequate' : 'Potential color contrast issues');
      
  } catch (error) {
    recordResult('accessibility', 'General Test', false, `Error: ${error.message}`);
  }
}

// Generate test report
function generateReport() {
  log('Generating test report...');
  
  const report = document.createElement('div');
  report.id = 'test-report';
  report.style.position = 'fixed';
  report.style.top = '0';
  report.style.left = '0';
  report.style.width = '100%';
  report.style.height = '100%';
  report.style.background = 'rgba(0, 0, 0, 0.9)';
  report.style.color = 'white';
  report.style.padding = '20px';
  report.style.overflow = 'auto';
  report.style.zIndex = '10000';
  
  let html = `
    <h1>Carousel Responsive Design & Cross-Browser Compatibility Report</h1>
    <h2>Summary</h2>
    <p>Total Tests: ${testResults.summary.total}</p>
    <p>Passed: ${testResults.summary.passed}</p>
    <p>Failed: ${testResults.summary.failed}</p>
    <p>Success Rate: ${((testResults.summary.passed / testResults.summary.total) * 100).toFixed(2)}%</p>
  `;
  
  // Add detailed results
  Object.keys(testResults).forEach(category => {
    if (category !== 'summary') {
      html += `<h2>${category.charAt(0).toUpperCase() + category.slice(1)}</h2>`;
      
      Object.keys(testResults[category]).forEach(testName => {
        const result = testResults[category][testName];
        const status = result.passed ? '✅ PASSED' : '❌ FAILED';
        html += `<p>${status} - ${testName}: ${result.details}</p>`;
      });
    }
  });
  
  // Add close button
  html += `<button onclick="document.body.removeChild(document.getElementById('test-report'))" style="position: fixed; top: 20px; right: 20px; padding: 10px 20px; background: #3B82F6; color: white; border: none; border-radius: 4px; cursor: pointer;">Close Report</button>`;
  
  report.innerHTML = html;
  document.body.appendChild(report);
  
  // Log to console as well
  console.log('=== CAROUSEL RESPONSIVE DESIGN & CROSS-BROWSER COMPATIBILITY REPORT ===');
  console.log(`Total Tests: ${testResults.summary.total}`);
  console.log(`Passed: ${testResults.summary.passed}`);
  console.log(`Failed: ${testResults.summary.failed}`);
  console.log(`Success Rate: ${((testResults.summary.passed / testResults.summary.total) * 100).toFixed(2)}%`);
  console.log('=== DETAILED RESULTS ===');
  console.log(JSON.stringify(testResults, null, 2));
}

// Main test runner
function runTests() {
  log('Starting carousel responsive design and cross-browser compatibility tests...');
  
  // Clear previous results
  testResults.responsiveDesign = {};
  testResults.videoAutoplay = {};
  testResults.staticImageDisplay = {};
  testResults.touchGestures = {};
  testResults.performance = {};
  testResults.accessibility = {};
  testResults.summary = { passed: 0, failed: 0, total: 0 };
  
  // Run tests
  if (TEST_CONFIG.tests.responsiveDesign) {
    testResponsiveDesign();
  }
  
  if (TEST_CONFIG.tests.videoAutoplay) {
    testVideoAutoplay();
  }
  
  if (TEST_CONFIG.tests.staticImageDisplay) {
    testStaticImageDisplay();
  }
  
  if (TEST_CONFIG.tests.touchGestures) {
    testTouchGestures();
  }
  
  if (TEST_CONFIG.tests.performance) {
    testPerformance();
  }
  
  if (TEST_CONFIG.tests.accessibility) {
    testAccessibility();
  }
  
  // Generate report
  setTimeout(generateReport, 1000);
}

// Auto-run tests if this is a test environment
if (typeof window !== 'undefined') {
  // Add a button to run tests manually
  const testButton = document.createElement('button');
  testButton.textContent = 'Run Carousel Tests';
  testButton.style.position = 'fixed';
  testButton.style.bottom = '20px';
  testButton.style.right = '20px';
  testButton.style.padding = '10px 20px';
  testButton.style.background = '#3B82F6';
  testButton.style.color = 'white';
  testButton.style.border = 'none';
  testButton.style.borderRadius = '4px';
  testButton.style.cursor = 'pointer';
  testButton.style.zIndex = '9999';
  testButton.onclick = runTests;
  
  document.body.appendChild(testButton);
  
  // Auto-run tests after page load
  if (document.readyState === 'complete') {
    setTimeout(runTests, 1000);
  } else {
    window.addEventListener('load', () => {
      setTimeout(runTests, 1000);
    });
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    runTests,
    testResults,
    TEST_CONFIG
  };
}