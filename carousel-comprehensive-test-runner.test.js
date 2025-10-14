/**
 * Comprehensive Carousel Test Runner
 * Tests the WhyChooseUs carousel functionality across different viewport sizes
 * with focus on 3:4 aspect ratio cards, navigation, and responsive behavior
 */

const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

// Test configuration
const TEST_CONFIG = {
  baseUrl: 'http://localhost:3000',
  viewports: {
    mobile: { width: 375, height: 667, name: 'Mobile' },
    mobileLandscape: { width: 667, height: 375, name: 'Mobile Landscape' },
    tablet: { width: 768, height: 1024, name: 'Tablet' },
    tabletLandscape: { width: 1024, height: 768, name: 'Tablet Landscape' },
    desktop: { width: 1280, height: 720, name: 'Desktop' },
    desktopLarge: { width: 1920, height: 1080, name: 'Desktop Large' }
  },
  screenshotsDir: path.join(__dirname, 'test-results', 'carousel-comprehensive-screenshots'),
  reportPath: path.join(__dirname, 'test-results', 'carousel-comprehensive-report.json'),
  reportMdPath: path.join(__dirname, 'test-results', 'carousel-comprehensive-report.md')
};

// Test results storage
const testResults = {
  summary: {
    totalTests: 0,
    passedTests: 0,
    failedTests: 0,
    startTime: new Date().toISOString(),
    endTime: null,
    duration: null
  },
  viewports: {},
  issues: []
};

/**
 * Initialize browser and page
 */
async function initializeBrowser() {
  console.log('🚀 Initializing browser...');
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
  });
  
  const page = await browser.newPage();
  
  // Set viewport to desktop initially
  await page.setViewport({ width: 1280, height: 720 });
  
  return { browser, page };
}

/**
 * Navigate to the page and wait for carousel to load
 */
async function navigateToPage(page) {
  console.log('📍 Navigating to page...');
  
  try {
    await page.goto(TEST_CONFIG.baseUrl, { waitUntil: 'networkidle2' });
    
    // Wait for the WhyChooseUs section to be visible
    await page.waitForSelector('#why-choose-us', { timeout: 10000 });
    
    // Scroll to the WhyChooseUs section
    await page.evaluate(() => {
      document.getElementById('why-choose-us').scrollIntoView({ behavior: 'smooth' });
    });
    
    // Wait for carousel to be visible
    await page.waitForSelector('.carousel-container-enhanced', { timeout: 10000 });
    
    // Wait for videos/images to load
    await page.waitForTimeout(2000);
    
    console.log('✅ Page loaded successfully');
    return true;
  } catch (error) {
    console.error('❌ Failed to load page:', error.message);
    return false;
  }
}

/**
 * Test carousel card aspect ratio
 */
async function testCardAspectRatio(page, viewport) {
  console.log(`📐 Testing card aspect ratio for ${viewport.name}...`);
  
  const result = {
    viewport: viewport.name,
    test: 'Card Aspect Ratio (3:4)',
    passed: false,
    details: {},
    issues: []
  };
  
  try {
    const aspectRatioData = await page.evaluate(() => {
      const cards = document.querySelectorAll('.carousel-card-standard');
      const cardData = [];
      
      cards.forEach((card, index) => {
        const rect = card.getBoundingClientRect();
        const aspectRatio = rect.width / rect.height;
        const expectedRatio = 3/4; // 0.75
        
        cardData.push({
          index,
          width: rect.width,
          height: rect.height,
          aspectRatio: aspectRatio.toFixed(2),
          expectedRatio: expectedRatio.toFixed(2),
          isCorrect: Math.abs(aspectRatio - expectedRatio) < 0.05 // Allow small tolerance
        });
      });
      
      return cardData;
    });
    
    result.details.cards = aspectRatioData;
    result.passed = aspectRatioData.every(card => card.isCorrect);
    
    if (!result.passed) {
      result.issues = aspectRatioData
        .filter(card => !card.isCorrect)
        .map(card => `Card ${card.index}: Aspect ratio ${card.aspectRatio} (expected ${card.expectedRatio})`);
    }
    
    console.log(`${result.passed ? '✅' : '❌'} Card aspect ratio test: ${result.passed ? 'PASSED' : 'FAILED'}`);
    
  } catch (error) {
    result.issues.push(`Error testing aspect ratio: ${error.message}`);
    console.error('❌ Error testing card aspect ratio:', error.message);
  }
  
  return result;
}

/**
 * Test carousel navigation arrows
 */
async function testNavigationArrows(page, viewport) {
  console.log(`🧭 Testing navigation arrows for ${viewport.name}...`);
  
  const result = {
    viewport: viewport.name,
    test: 'Navigation Arrows',
    passed: false,
    details: {},
    issues: []
  };
  
  try {
    // Check if navigation arrows are visible
    const arrowsVisible = await page.evaluate(() => {
      const prevArrow = document.querySelector('button[title="Go to previous slide"]');
      const nextArrow = document.querySelector('button[title="Go to next slide"]');
      
      return {
        prevArrow: {
          visible: prevArrow ? window.getComputedStyle(prevArrow).display !== 'none' : false,
          clickable: prevArrow ? !prevArrow.disabled : false
        },
        nextArrow: {
          visible: nextArrow ? window.getComputedStyle(nextArrow).display !== 'none' : false,
          clickable: nextArrow ? !nextArrow.disabled : false
        }
      };
    });
    
    result.details.arrowsVisible = arrowsVisible;
    
    // Test navigation functionality
    const initialSlide = await page.evaluate(() => {
      const activeSlide = document.querySelector('.carousel-card-standard[style*="scale(1)"]');
      const slides = Array.from(document.querySelectorAll('.carousel-card-standard'));
      return slides.indexOf(activeSlide);
    });
    
    // Click next arrow
    await page.click('button[title="Go to next slide"]');
    await page.waitForTimeout(1000); // Wait for transition
    
    const afterNextSlide = await page.evaluate(() => {
      const activeSlide = document.querySelector('.carousel-card-standard[style*="scale(1)"]');
      const slides = Array.from(document.querySelectorAll('.carousel-card-standard'));
      return slides.indexOf(activeSlide);
    });
    
    // Click previous arrow
    await page.click('button[title="Go to previous slide"]');
    await page.waitForTimeout(1000); // Wait for transition
    
    const afterPrevSlide = await page.evaluate(() => {
      const activeSlide = document.querySelector('.carousel-card-standard[style*="scale(1)"]');
      const slides = Array.from(document.querySelectorAll('.carousel-card-standard'));
      return slides.indexOf(activeSlide);
    });
    
    result.details.navigationTest = {
      initialSlide,
      afterNextSlide,
      afterPrevSlide,
      nextWorking: afterNextSlide !== initialSlide,
      prevWorking: afterPrevSlide === initialSlide
    };
    
    result.passed = arrowsVisible.prevArrow.visible && 
                    arrowsVisible.nextArrow.visible && 
                    arrowsVisible.prevArrow.clickable && 
                    arrowsVisible.nextArrow.clickable &&
                    result.details.navigationTest.nextWorking &&
                    result.details.navigationTest.prevWorking;
    
    if (!result.passed) {
      if (!arrowsVisible.prevArrow.visible) result.issues.push('Previous arrow not visible');
      if (!arrowsVisible.nextArrow.visible) result.issues.push('Next arrow not visible');
      if (!arrowsVisible.prevArrow.clickable) result.issues.push('Previous arrow not clickable');
      if (!arrowsVisible.nextArrow.clickable) result.issues.push('Next arrow not clickable');
      if (!result.details.navigationTest.nextWorking) result.issues.push('Next navigation not working');
      if (!result.details.navigationTest.prevWorking) result.issues.push('Previous navigation not working');
    }
    
    console.log(`${result.passed ? '✅' : '❌'} Navigation arrows test: ${result.passed ? 'PASSED' : 'FAILED'}`);
    
  } catch (error) {
    result.issues.push(`Error testing navigation arrows: ${error.message}`);
    console.error('❌ Error testing navigation arrows:', error.message);
  }
  
  return result;
}

/**
 * Test smooth transitions between slides
 */
async function testSmoothTransitions(page, viewport) {
  console.log(`🌊 Testing smooth transitions for ${viewport.name}...`);
  
  const result = {
    viewport: viewport.name,
    test: 'Smooth Transitions',
    passed: false,
    details: {},
    issues: []
  };
  
  try {
    // Start with initial slide
    const initialSlide = await page.evaluate(() => {
      const activeSlide = document.querySelector('.carousel-card-standard[style*="scale(1)"]');
      const slides = Array.from(document.querySelectorAll('.carousel-card-standard'));
      return slides.indexOf(activeSlide);
    });
    
    // Measure transition time
    const startTime = Date.now();
    await page.click('button[title="Go to next slide"]');
    
    // Wait for transition to complete
    await page.waitForFunction(() => {
      const activeSlide = document.querySelector('.carousel-card-standard[style*="scale(1)"]');
      const slides = Array.from(document.querySelectorAll('.carousel-card-standard'));
      const currentSlide = slides.indexOf(activeSlide);
      return currentSlide !== 0; // Assuming we started at slide 0
    }, { timeout: 3000 });
    
    const transitionTime = Date.now() - startTime;
    
    // Check if transition is smooth (not instant)
    result.details.transitionTime = transitionTime;
    result.details.isSmooth = transitionTime > 300 && transitionTime < 1500; // Reasonable range for smooth transition
    
    // Test multiple rapid transitions
    const rapidTestStart = Date.now();
    for (let i = 0; i < 3; i++) {
      await page.click('button[title="Go to next slide"]');
      await page.waitForTimeout(100); // Small delay between clicks
    }
    await page.waitForTimeout(1500); // Wait for all transitions to complete
    
    const rapidTestTime = Date.now() - rapidTestStart;
    result.details.rapidTransitionTime = rapidTestTime;
    
    result.passed = result.details.isSmooth;
    
    if (!result.passed) {
      result.issues.push(`Transition time ${transitionTime}ms is not in expected range (300-1500ms)`);
    }
    
    console.log(`${result.passed ? '✅' : '❌'} Smooth transitions test: ${result.passed ? 'PASSED' : 'FAILED'}`);
    
  } catch (error) {
    result.issues.push(`Error testing smooth transitions: ${error.message}`);
    console.error('❌ Error testing smooth transitions:', error.message);
  }
  
  return result;
}

/**
 * Test video content display
 */
async function testVideoContent(page, viewport) {
  console.log(`🎥 Testing video content for ${viewport.name}...`);
  
  const result = {
    viewport: viewport.name,
    test: 'Video Content Display',
    passed: false,
    details: {},
    issues: []
  };
  
  try {
    // Check video elements
    const videoData = await page.evaluate(() => {
      const videos = document.querySelectorAll('.video-element');
      const videoInfo = [];
      
      videos.forEach((video, index) => {
        const rect = video.getBoundingClientRect();
        const isVisible = rect.width > 0 && rect.height > 0;
        const isLoaded = video.readyState >= 2; // HAVE_CURRENT_DATA
        
        videoInfo.push({
          index,
          isVisible,
          isLoaded,
          width: rect.width,
          height: rect.height,
          hasSrc: !!video.src,
          isVideo: video.tagName === 'VIDEO'
        });
      });
      
      return videoInfo;
    });
    
    result.details.videos = videoData;
    
    // Check for the first video slide (Zero Risk)
    await page.evaluate(() => {
      const slides = Array.from(document.querySelectorAll('.carousel-card-standard'));
      if (slides.length > 0) {
        // Navigate to first slide if not already there
        const activeSlide = document.querySelector('.carousel-card-standard[style*="scale(1)"]');
        const activeIndex = slides.indexOf(activeSlide);
        
        if (activeIndex !== 0) {
          // Click previous button until we reach the first slide
          for (let i = 0; i < activeIndex; i++) {
            document.querySelector('button[title="Go to previous slide"]').click();
          }
        }
      }
    });
    
    await page.waitForTimeout(1500);
    
    // Check the first slide specifically
    const firstSlideVideo = await page.evaluate(() => {
      const activeSlide = document.querySelector('.carousel-card-standard[style*="scale(1)"]');
      if (!activeSlide) return null;
      
      const video = activeSlide.querySelector('video');
      if (!video) return null;
      
      const rect = video.getBoundingClientRect();
      return {
        isActive: true,
        isPlaying: !video.paused,
        isVisible: rect.width > 0 && rect.height > 0,
        hasControls: video.controls,
        isMuted: video.muted,
        isLooping: video.loop,
        aspectRatio: (rect.width / rect.height).toFixed(2)
      };
    });
    
    result.details.firstSlideVideo = firstSlideVideo;
    
    result.passed = videoData.length > 0 && 
                    videoData.some(v => v.isVisible && v.isLoaded) &&
                    firstSlideVideo && 
                    firstSlideVideo.isVisible &&
                    firstSlideVideo.isPlaying;
    
    if (!result.passed) {
      if (videoData.length === 0) result.issues.push('No video elements found');
      if (!videoData.some(v => v.isVisible && v.isLoaded)) result.issues.push('No visible and loaded videos');
      if (!firstSlideVideo) result.issues.push('First slide video not found');
      if (firstSlideVideo && !firstSlideVideo.isVisible) result.issues.push('First slide video not visible');
      if (firstSlideVideo && !firstSlideVideo.isPlaying) result.issues.push('First slide video not playing');
    }
    
    console.log(`${result.passed ? '✅' : '❌'} Video content test: ${result.passed ? 'PASSED' : 'FAILED'}`);
    
  } catch (error) {
    result.issues.push(`Error testing video content: ${error.message}`);
    console.error('❌ Error testing video content:', error.message);
  }
  
  return result;
}

/**
 * Test text overlays
 */
async function testTextOverlays(page, viewport) {
  console.log(`📝 Testing text overlays for ${viewport.name}...`);
  
  const result = {
    viewport: viewport.name,
    test: 'Text Overlays',
    passed: false,
    details: {},
    issues: []
  };
  
  try {
    const textData = await page.evaluate(() => {
      const activeSlide = document.querySelector('.carousel-card-standard[style*="scale(1)"]');
      if (!activeSlide) return null;
      
      const titleElement = activeSlide.querySelector('h2');
      const descriptionElement = activeSlide.querySelector('p');
      const textContainer = activeSlide.querySelector('article');
      
      if (!titleElement || !textContainer) return null;
      
      const titleRect = titleElement.getBoundingClientRect();
      const descRect = descriptionElement ? descriptionElement.getBoundingClientRect() : null;
      const containerRect = textContainer.getBoundingClientRect();
      
      return {
        title: {
          text: titleElement.textContent,
          isVisible: titleRect.width > 0 && titleRect.height > 0,
          fontSize: window.getComputedStyle(titleElement).fontSize,
          color: window.getComputedStyle(titleElement).color,
          hasTextShadow: window.getComputedStyle(titleElement).textShadow !== 'none'
        },
        description: descriptionElement ? {
          text: descriptionElement.textContent,
          isVisible: descRect.width > 0 && descRect.height > 0,
          fontSize: window.getComputedStyle(descriptionElement).fontSize,
          color: window.getComputedStyle(descriptionElement).color
        } : null,
        container: {
          isVisible: containerRect.width > 0 && containerRect.height > 0,
          hasBackground: window.getComputedStyle(textContainer).backgroundColor !== 'rgba(0, 0, 0, 0)',
          backgroundColor: window.getComputedStyle(textContainer).backgroundColor,
          backdropFilter: window.getComputedStyle(textContainer).backdropFilter
        }
      };
    });
    
    result.details.textData = textData;
    
    result.passed = textData && 
                    textData.title.isVisible &&
                    textData.container.isVisible &&
                    textData.container.hasBackground &&
                    textData.title.hasTextShadow;
    
    if (!result.passed) {
      if (!textData) result.issues.push('Text data not found');
      else {
        if (!textData.title.isVisible) result.issues.push('Title not visible');
        if (!textData.container.isVisible) result.issues.push('Text container not visible');
        if (!textData.container.hasBackground) result.issues.push('Text container has no background');
        if (!textData.title.hasTextShadow) result.issues.push('Title has no text shadow for readability');
      }
    }
    
    console.log(`${result.passed ? '✅' : '❌'} Text overlays test: ${result.passed ? 'PASSED' : 'FAILED'}`);
    
  } catch (error) {
    result.issues.push(`Error testing text overlays: ${error.message}`);
    console.error('❌ Error testing text overlays:', error.message);
  }
  
  return result;
}

/**
 * Test responsive behavior
 */
async function testResponsiveBehavior(page, viewport) {
  console.log(`📱 Testing responsive behavior for ${viewport.name}...`);
  
  const result = {
    viewport: viewport.name,
    test: 'Responsive Behavior',
    passed: false,
    details: {},
    issues: []
  };
  
  try {
    const responsiveData = await page.evaluate((viewportWidth) => {
      const cards = document.querySelectorAll('.carousel-card-standard');
      const container = document.querySelector('.carousel-container-enhanced');
      
      if (cards.length === 0 || !container) return null;
      
      const containerRect = container.getBoundingClientRect();
      const firstCardRect = cards[0].getBoundingClientRect();
      
      // Expected card width based on viewport
      let expectedWidth;
      if (viewportWidth < 768) {
        expectedWidth = viewportWidth * 0.85; // 85vw for mobile
      } else if (viewportWidth < 1024) {
        expectedWidth = viewportWidth * 0.45; // 45vw for tablet
      } else {
        expectedWidth = viewportWidth * 0.3; // 30vw for desktop
      }
      
      return {
        viewportWidth,
        containerWidth: containerRect.width,
        cardWidth: firstCardRect.width,
        expectedWidth,
        widthMatch: Math.abs(firstCardRect.width - expectedWidth) < 20, // Allow 20px tolerance
        cardCount: cards.length,
        aspectRatio: (firstCardRect.width / firstCardRect.height).toFixed(2)
      };
    }, viewport.width);
    
    result.details.responsiveData = responsiveData;
    
    result.passed = responsiveData && 
                    responsiveData.widthMatch &&
                    parseFloat(responsiveData.aspectRatio) === 0.75; // 3:4 ratio
    
    if (!result.passed) {
      if (!responsiveData) result.issues.push('Responsive data not available');
      else {
        if (!responsiveData.widthMatch) {
          result.issues.push(`Card width ${responsiveData.cardWidth}px doesn't match expected ${responsiveData.expectedWidth}px`);
        }
        if (parseFloat(responsiveData.aspectRatio) !== 0.75) {
          result.issues.push(`Aspect ratio ${responsiveData.aspectRatio} is not 3:4 (0.75)`);
        }
      }
    }
    
    console.log(`${result.passed ? '✅' : '❌'} Responsive behavior test: ${result.passed ? 'PASSED' : 'FAILED'}`);
    
  } catch (error) {
    result.issues.push(`Error testing responsive behavior: ${error.message}`);
    console.error('❌ Error testing responsive behavior:', error.message);
  }
  
  return result;
}

/**
 * Test edge cases
 */
async function testEdgeCases(page, viewport) {
  console.log(`🔍 Testing edge cases for ${viewport.name}...`);
  
  const result = {
    viewport: viewport.name,
    test: 'Edge Cases',
    passed: false,
    details: {},
    issues: []
  };
  
  try {
    const edgeCaseResults = {};
    
    // Test first slide navigation
    await page.evaluate(() => {
      const slides = Array.from(document.querySelectorAll('.carousel-card-standard'));
      if (slides.length > 0) {
        // Navigate to first slide
        const activeSlide = document.querySelector('.carousel-card-standard[style*="scale(1)"]');
        const activeIndex = slides.indexOf(activeSlide);
        
        if (activeIndex !== 0) {
          for (let i = 0; i < activeIndex; i++) {
            document.querySelector('button[title="Go to previous slide"]').click();
          }
        }
      }
    });
    await page.waitForTimeout(1500);
    
    const firstSlideIndex = await page.evaluate(() => {
      const activeSlide = document.querySelector('.carousel-card-standard[style*="scale(1)"]');
      const slides = Array.from(document.querySelectorAll('.carousel-card-standard'));
      return slides.indexOf(activeSlide);
    });
    
    // Test previous button on first slide (should go to last slide)
    await page.click('button[title="Go to previous slide"]');
    await page.waitForTimeout(1500);
    
    const afterFirstPrevSlide = await page.evaluate(() => {
      const activeSlide = document.querySelector('.carousel-card-standard[style*="scale(1)"]');
      const slides = Array.from(document.querySelectorAll('.carousel-card-standard'));
      return slides.indexOf(activeSlide);
    });
    
    // Test last slide navigation
    const totalSlides = await page.evaluate(() => {
      return document.querySelectorAll('.carousel-card-standard').length;
    });
    
    await page.evaluate((slideCount) => {
      // Navigate to last slide
      for (let i = 0; i < slideCount - 1; i++) {
        document.querySelector('button[title="Go to next slide"]').click();
      }
    }, totalSlides);
    await page.waitForTimeout(1500);
    
    const lastSlideIndex = await page.evaluate(() => {
      const activeSlide = document.querySelector('.carousel-card-standard[style*="scale(1)"]');
      const slides = Array.from(document.querySelectorAll('.carousel-card-standard'));
      return slides.indexOf(activeSlide);
    });
    
    // Test next button on last slide (should go to first slide)
    await page.click('button[title="Go to next slide"]');
    await page.waitForTimeout(1500);
    
    const afterLastNextSlide = await page.evaluate(() => {
      const activeSlide = document.querySelector('.carousel-card-standard[style*="scale(1)"]');
      const slides = Array.from(document.querySelectorAll('.carousel-card-standard'));
      return slides.indexOf(activeSlide);
    });
    
    // Test rapid navigation
    const rapidStart = Date.now();
    for (let i = 0; i < 5; i++) {
      await page.click('button[title="Go to next slide"]');
      await page.waitForTimeout(100); // Small delay between clicks
    }
    await page.waitForTimeout(1500);
    const rapidEnd = Date.now();
    
    edgeCaseResults.firstSlideNavigation = {
      firstSlideIndex,
      afterFirstPrevSlide,
      wrapsCorrectly: afterFirstPrevSlide === totalSlides - 1
    };
    
    edgeCaseResults.lastSlideNavigation = {
      lastSlideIndex,
      afterLastNextSlide,
      wrapsCorrectly: afterLastNextSlide === 0
    };
    
    edgeCaseResults.rapidNavigation = {
      duration: rapidEnd - rapidStart,
      completed: true
    };
    
    result.details.edgeCases = edgeCaseResults;
    
    result.passed = edgeCaseResults.firstSlideNavigation.wrapsCorrectly &&
                    edgeCaseResults.lastSlideNavigation.wrapsCorrectly &&
                    edgeCaseResults.rapidNavigation.completed;
    
    if (!result.passed) {
      if (!edgeCaseResults.firstSlideNavigation.wrapsCorrectly) {
        result.issues.push('First slide previous navigation doesn\'t wrap to last slide');
      }
      if (!edgeCaseResults.lastSlideNavigation.wrapsCorrectly) {
        result.issues.push('Last slide next navigation doesn\'t wrap to first slide');
      }
      if (!edgeCaseResults.rapidNavigation.completed) {
        result.issues.push('Rapid navigation test failed');
      }
    }
    
    console.log(`${result.passed ? '✅' : '❌'} Edge cases test: ${result.passed ? 'PASSED' : 'FAILED'}`);
    
  } catch (error) {
    result.issues.push(`Error testing edge cases: ${error.message}`);
    console.error('❌ Error testing edge cases:', error.message);
  }
  
  return result;
}

/**
 * Take screenshot for current viewport
 */
async function takeScreenshot(page, viewport, testName) {
  const filename = `${viewport.name.toLowerCase().replace(/\s+/g, '-')}-${testName}.png`;
  const filepath = path.join(TEST_CONFIG.screenshotsDir, filename);
  
  await page.screenshot({ path: filepath, fullPage: true });
  console.log(`📸 Screenshot saved: ${filename}`);
  
  return filename;
}

/**
 * Run all tests for a specific viewport
 */
async function runTestsForViewport(page, viewport) {
  console.log(`\n🧪 Running tests for ${viewport.name} (${viewport.width}x${viewport.height})...`);
  
  // Set viewport
  await page.setViewport(viewport);
  
  // Wait for layout to adjust
  await page.waitForTimeout(2000);
  
  // Initialize results for this viewport
  testResults.viewports[viewport.name] = {
    width: viewport.width,
    height: viewport.height,
    tests: [],
    passedTests: 0,
    failedTests: 0,
    screenshots: []
  };
  
  // Take initial screenshot
  const initialScreenshot = await takeScreenshot(page, viewport, 'initial');
  testResults.viewports[viewport.name].screenshots.push(initialScreenshot);
  
  // Run all tests
  const tests = [
    testCardAspectRatio,
    testNavigationArrows,
    testSmoothTransitions,
    testVideoContent,
    testTextOverlays,
    testResponsiveBehavior,
    testEdgeCases
  ];
  
  for (const test of tests) {
    const testResult = await test(page, viewport);
    testResults.viewports[viewport.name].tests.push(testResult);
    
    if (testResult.passed) {
      testResults.viewports[viewport.name].passedTests++;
      testResults.summary.passedTests++;
    } else {
      testResults.viewports[viewport.name].failedTests++;
      testResults.summary.failedTests++;
      testResults.issues.push(...testResult.issues.map(issue => `${viewport.name}: ${issue}`));
    }
    
    testResults.summary.totalTests++;
    
    // Take screenshot after each test
    const screenshotName = await takeScreenshot(page, viewport, testResult.test.toLowerCase().replace(/\s+/g, '-'));
    testResults.viewports[viewport.name].screenshots.push(screenshotName);
  }
  
  console.log(`✅ Completed tests for ${viewport.name}. Passed: ${testResults.viewports[viewport.name].passedTests}, Failed: ${testResults.viewports[viewport.name].failedTests}`);
}

/**
 * Generate markdown report
 */
function generateMarkdownReport() {
  const { summary, viewports, issues } = testResults;
  
  let markdown = `# Carousel Comprehensive Test Report\n\n`;
  markdown += `**Test Date:** ${new Date(summary.startTime).toLocaleString()}\n`;
  markdown += `**Duration:** ${summary.duration}ms\n\n`;
  
  markdown += `## Summary\n\n`;
  markdown += `- **Total Tests:** ${summary.totalTests}\n`;
  markdown += `- **Passed:** ${summary.passedTests}\n`;
  markdown += `- **Failed:** ${summary.failedTests}\n`;
  markdown += `- **Success Rate:** ${((summary.passedTests / summary.totalTests) * 100).toFixed(1)}%\n\n`;
  
  if (issues.length > 0) {
    markdown += `## Issues Found\n\n`;
    issues.forEach(issue => {
      markdown += `- ❌ ${issue}\n`;
    });
    markdown += `\n`;
  }
  
  markdown += `## Viewport Test Results\n\n`;
  
  Object.keys(viewports).forEach(viewportName => {
    const viewport = viewports[viewportName];
    const successRate = ((viewport.passedTests / viewport.tests.length) * 100).toFixed(1);
    
    markdown += `### ${viewportName} (${viewport.width}x${viewport.height})\n\n`;
    markdown += `**Success Rate:** ${successRate}% (${viewport.passedTests}/${viewport.tests.length})\n\n`;
    
    markdown += `| Test | Status | Issues |\n`;
    markdown += `|------|--------|--------|\n`;
    
    viewport.tests.forEach(test => {
      const status = test.passed ? '✅ PASSED' : '❌ FAILED';
      const issuesText = test.issues.length > 0 ? test.issues.join('; ') : 'None';
      markdown += `| ${test.test} | ${status} | ${issuesText} |\n`;
    });
    
    markdown += `\n**Screenshots:**\n`;
    viewport.screenshots.forEach(screenshot => {
      markdown += `- ${screenshot}\n`;
    });
    
    markdown += `\n`;
  });
  
  return markdown;
}

/**
 * Save test results and generate report
 */
function saveResults() {
  // Ensure directories exist
  if (!fs.existsSync(TEST_CONFIG.screenshotsDir)) {
    fs.mkdirSync(TEST_CONFIG.screenshotsDir, { recursive: true });
  }
  
  if (!fs.existsSync(path.dirname(TEST_CONFIG.reportPath))) {
    fs.mkdirSync(path.dirname(TEST_CONFIG.reportPath), { recursive: true });
  }
  
  // Update summary
  testResults.summary.endTime = new Date().toISOString();
  testResults.summary.duration = new Date(testResults.summary.endTime) - new Date(testResults.summary.startTime);
  
  // Save JSON report
  fs.writeFileSync(TEST_CONFIG.reportPath, JSON.stringify(testResults, null, 2));
  console.log(`📊 JSON report saved to: ${TEST_CONFIG.reportPath}`);
  
  // Save Markdown report
  const markdownReport = generateMarkdownReport();
  fs.writeFileSync(TEST_CONFIG.reportMdPath, markdownReport);
  console.log(`📝 Markdown report saved to: ${TEST_CONFIG.reportMdPath}`);
}

/**
 * Main test runner function
 */
async function runTests() {
  console.log('🚀 Starting Comprehensive Carousel Tests...\n');
  
  const { browser, page } = await initializeBrowser();
  
  try {
    // Navigate to page
    const pageLoaded = await navigateToPage(page);
    if (!pageLoaded) {
      throw new Error('Failed to load page');
    }
    
    // Run tests for each viewport
    for (const viewportName in TEST_CONFIG.viewports) {
      const viewport = TEST_CONFIG.viewports[viewportName];
      await runTestsForViewport(page, viewport);
    }
    
    // Generate and save reports
    saveResults();
    
    console.log('\n🎉 All tests completed!');
    console.log(`📊 Summary: ${testResults.summary.passedTests}/${testResults.summary.totalTests} tests passed`);
    
    if (testResults.issues.length > 0) {
      console.log('\n❌ Issues found:');
      testResults.issues.forEach(issue => console.log(`  - ${issue}`));
    }
    
    return testResults;
    
  } catch (error) {
    console.error('❌ Test execution failed:', error);
    throw error;
  } finally {
    await browser.close();
  }
}

// Export for use in other files
module.exports = {
  runTests,
  TEST_CONFIG
};

// Run tests if this file is executed directly
if (require.main === module) {
  runTests()
    .then(() => {
      console.log('✅ Test execution completed successfully');
      process.exit(0);
    })
    .catch(error => {
      console.error('❌ Test execution failed:', error);
      process.exit(1);
    });
}