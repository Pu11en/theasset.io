/**
 * Comprehensive Carousel Enhancement Test Suite
 * 
 * This test suite verifies all carousel enhancement requirements:
 * 1. Navigation Controls (arrows, pagination removal)
 * 2. Card Layout Structure (text positioning)
 * 3. Card 1: ZeroRisk Guarantee
 * 4. Card 2: Experience Section
 * 5. Card 3: Business Automations
 * 6. Video Behavior (autoplay, looping, no controls)
 * 7. Technical Implementation (responsive, performance, browser compatibility)
 * 8. Deployment Readiness
 */

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

// Test configuration
const TEST_CONFIG = {
  baseUrl: process.env.TEST_BASE_URL || 'http://localhost:3000',
  headless: process.env.TEST_HEADLESS !== 'false',
  screenshotDir: './test-results/screenshots',
  timeout: 30000,
  retries: 2
};

// Test results storage
const testResults = {
  summary: {
    total: 0,
    passed: 0,
    failed: 0,
    skipped: 0
  },
  categories: {
    navigationControls: { passed: 0, failed: 0, details: [] },
    cardLayout: { passed: 0, failed: 0, details: [] },
    zeroRiskCard: { passed: 0, failed: 0, details: [] },
    experienceCard: { passed: 0, failed: 0, details: [] },
    businessAutomationsCard: { passed: 0, failed: 0, details: [] },
    videoBehavior: { passed: 0, failed: 0, details: [] },
    technicalImplementation: { passed: 0, failed: 0, details: [] },
    deploymentReadiness: { passed: 0, failed: 0, details: [] }
  },
  issues: [],
  screenshots: []
};

// Utility functions
function createTestResult(testName, category, passed, details = '', screenshot = '') {
  const result = {
    testName,
    category,
    passed,
    details,
    screenshot,
    timestamp: new Date().toISOString()
  };
  
  testResults.categories[category].details.push(result);
  
  if (passed) {
    testResults.categories[category].passed++;
    testResults.summary.passed++;
  } else {
    testResults.categories[category].failed++;
    testResults.summary.failed++;
    testResults.issues.push({ testName, category, details });
  }
  
  testResults.summary.total++;
  return result;
}

async function takeScreenshot(page, name, category) {
  if (!fs.existsSync(TEST_CONFIG.screenshotDir)) {
    fs.mkdirSync(TEST_CONFIG.screenshotDir, { recursive: true });
  }
  
  const filename = `${category}_${name.replace(/\s+/g, '_')}_${Date.now()}.png`;
  const filepath = path.join(TEST_CONFIG.screenshotDir, filename);
  
  await page.screenshot({ path: filepath, fullPage: true });
  testResults.screenshots.push({ name: filename, category, path: filepath });
  
  return filepath;
}

async function waitForElement(page, selector, timeout = 5000) {
  try {
    await page.waitForSelector(selector, { timeout });
    return await page.$(selector);
  } catch (error) {
    return null;
  }
}

// Test functions
async function testNavigationControls(page) {
  console.log('Testing Navigation Controls...');
  
  // Test 1: Verify 3-dot pagination indicators are removed
  try {
    const paginationBullets = await page.$$('.carousel__pagination-bullet');
    const paginationVisible = paginationBullets.length > 0 && 
      await paginationBullets[0].isVisible();
    
    createTestResult(
      'Pagination indicators removed',
      'navigationControls',
      !paginationVisible,
      paginationVisible ? 
        `Found ${paginationBullets.length} pagination bullets that should be removed` : 
        'Pagination indicators correctly removed'
    );
  } catch (error) {
    createTestResult(
      'Pagination indicators removed',
      'navigationControls',
      false,
      `Error checking pagination: ${error.message}`
    );
  }
  
  // Test 2: Verify left/right arrow navigation buttons are present
  try {
    const prevArrow = await waitForElement(page, '.carousel__arrow--prev');
    const nextArrow = await waitForElement(page, '.carousel__arrow--next');
    
    const arrowsPresent = prevArrow && nextArrow && 
      await prevArrow.isVisible() && 
      await nextArrow.isVisible();
    
    createTestResult(
      'Arrow navigation buttons present',
      'navigationControls',
      arrowsPresent,
      arrowsPresent ? 
        'Both left and right arrows are visible' : 
        'Missing arrow navigation buttons'
    );
    
    if (arrowsPresent) {
      await takeScreenshot(page, 'arrows_present', 'navigationControls');
    }
  } catch (error) {
    createTestResult(
      'Arrow navigation buttons present',
      'navigationControls',
      false,
      `Error checking arrows: ${error.message}`
    );
  }
  
  // Test 3: Test arrow navigation functionality
  try {
    const initialSlide = await page.getAttribute('.carousel__slide--active', 'data-index');
    
    // Click next arrow
    await page.click('.carousel__arrow--next');
    await page.waitForTimeout(500); // Wait for transition
    
    const afterNextClick = await page.getAttribute('.carousel__slide--active', 'data-index');
    
    // Click prev arrow
    await page.click('.carousel__arrow--prev');
    await page.waitForTimeout(500);
    
    const afterPrevClick = await page.getAttribute('.carousel__slide--active', 'data-index');
    
    const navigationWorking = initialSlide !== afterNextClick && afterPrevClick === initialSlide;
    
    createTestResult(
      'Arrow navigation functionality',
      'navigationControls',
      navigationWorking,
      navigationWorking ? 
        `Navigation working: ${initialSlide} -> ${afterNextClick} -> ${afterPrevClick}` : 
        `Navigation not working: ${initialSlide} -> ${afterNextClick} -> ${afterPrevClick}`
    );
  } catch (error) {
    createTestResult(
      'Arrow navigation functionality',
      'navigationControls',
      false,
      `Error testing navigation: ${error.message}`
    );
  }
  
  // Test 4: Test keyboard navigation
  try {
    const initialSlide = await page.getAttribute('.carousel__slide--active', 'data-index');
    
    // Focus carousel and press right arrow
    await page.focus('.carousel');
    await page.keyboard.press('ArrowRight');
    await page.waitForTimeout(500);
    
    const afterKeyRight = await page.getAttribute('.carousel__slide--active', 'data-index');
    
    // Press left arrow
    await page.keyboard.press('ArrowLeft');
    await page.waitForTimeout(500);
    
    const afterKeyLeft = await page.getAttribute('.carousel__slide--active', 'data-index');
    
    const keyboardNavWorking = initialSlide !== afterKeyRight && afterKeyLeft === initialSlide;
    
    createTestResult(
      'Keyboard navigation functionality',
      'navigationControls',
      keyboardNavWorking,
      keyboardNavWorking ? 
        `Keyboard navigation working: ${initialSlide} -> ${afterKeyRight} -> ${afterKeyLeft}` : 
        `Keyboard navigation not working: ${initialSlide} -> ${afterKeyRight} -> ${afterKeyLeft}`
    );
  } catch (error) {
    createTestResult(
      'Keyboard navigation functionality',
      'navigationControls',
      false,
      `Error testing keyboard navigation: ${error.message}`
    );
  }
  
  // Test 5: Test touch gestures (simulate on desktop)
  try {
    const initialSlide = await page.getAttribute('.carousel__slide--active', 'data-index');
    
    // Simulate swipe gesture
    const carousel = await page.$('.carousel__viewport');
    const box = await carousel.boundingBox();
    
    if (box) {
      await page.touchstart({
        x: box.x + box.width * 0.8,
        y: box.y + box.height / 2
      });
      
      await page.touchmove({
        x: box.x + box.width * 0.2,
        y: box.y + box.height / 2
      });
      
      await page.touchend();
      await page.waitForTimeout(500);
      
      const afterSwipe = await page.getAttribute('.carousel__slide--active', 'data-index');
      const touchWorking = initialSlide !== afterSwipe;
      
      createTestResult(
        'Touch gesture functionality',
        'navigationControls',
        touchWorking,
        touchWorking ? 
          `Touch gesture working: ${initialSlide} -> ${afterSwipe}` : 
          `Touch gesture not working: ${initialSlide} -> ${afterSwipe}`
      );
    }
  } catch (error) {
    createTestResult(
      'Touch gesture functionality',
      'navigationControls',
      false,
      `Error testing touch gestures: ${error.message}`
    );
  }
}

async function testCardLayoutStructure(page) {
  console.log('Testing Card Layout Structure...');
  
  // Test 1: Verify headings are positioned in upper portion
  try {
    const activeSlide = await page.$('.carousel__slide--active');
    const slideBox = await activeSlide.boundingBox();
    const heading = await activeSlide.$('h3');
    const headingBox = await heading.boundingBox();
    
    // Check if heading is in upper 40% of the card
    const headingInUpperPortion = headingBox.y < (slideBox.y + slideBox.height * 0.4);
    
    createTestResult(
      'Headings positioned in upper portion',
      'cardLayout',
      headingInUpperPortion,
      headingInUpperPortion ? 
        `Heading at Y: ${headingBox.y}, card height: ${slideBox.height}` : 
        `Heading too low: Y: ${headingBox.y}, should be < ${slideBox.y + slideBox.height * 0.4}`
    );
  } catch (error) {
    createTestResult(
      'Headings positioned in upper portion',
      'cardLayout',
      false,
      `Error checking heading position: ${error.message}`
    );
  }
  
  // Test 2: Verify text is large and highly visible
  try {
    const activeSlide = await page.$('.carousel__slide--active');
    const heading = await activeSlide.$('h3');
    const headingStyles = await heading.evaluate(el => {
      const computed = window.getComputedStyle(el);
      return {
        fontSize: computed.fontSize,
        fontWeight: computed.fontWeight,
        color: computed.color,
        textShadow: computed.textShadow
      };
    });
    
    const fontSize = parseInt(headingStyles.fontSize);
    const fontWeight = parseInt(headingStyles.fontWeight);
    const hasTextShadow = headingStyles.textShadow && headingStyles.textShadow !== 'none';
    
    const textProminent = fontSize >= 24 && fontWeight >= 700;
    
    createTestResult(
      'Text is large and highly visible',
      'cardLayout',
      textProminent,
      textProminent ? 
        `Text prominent: ${fontSize}px, weight: ${fontWeight}, shadow: ${hasTextShadow}` : 
        `Text not prominent enough: ${fontSize}px, weight: ${fontWeight}, shadow: ${hasTextShadow}`
    );
  } catch (error) {
    createTestResult(
      'Text is large and highly visible',
      'cardLayout',
      false,
      `Error checking text visibility: ${error.message}`
    );
  }
  
  // Test 3: Verify text is treated as main content (not background)
  try {
    const activeSlide = await page.$('.carousel__slide--active');
    const textOverlay = await activeSlide.$('.absolute.top-0');
    const hasTextOverlay = textOverlay !== null;
    
    // Check z-index to ensure text is above video
    const zIndex = await textOverlay.evaluate(el => {
      return window.getComputedStyle(el).zIndex;
    });
    
    const textAsMainContent = hasTextOverlay && (zIndex === 'auto' || parseInt(zIndex) > 0);
    
    createTestResult(
      'Text treated as main content',
      'cardLayout',
      textAsMainContent,
      textAsMainContent ? 
        `Text properly positioned as main content with z-index: ${zIndex}` : 
        `Text not properly positioned: has overlay: ${hasTextOverlay}, z-index: ${zIndex}`
    );
  } catch (error) {
    createTestResult(
      'Text treated as main content',
      'cardLayout',
      false,
      `Error checking text positioning: ${error.message}`
    );
  }
  
  await takeScreenshot(page, 'card_layout_structure', 'cardLayout');
}

async function testZeroRiskCard(page) {
  console.log('Testing Card 1: ZeroRisk Guarantee...');
  
  // Navigate to first slide if not already there
  try {
    await page.click('.carousel__arrow--prev');
    await page.waitForTimeout(500);
  } catch (error) {
    // Ignore if already at first slide
  }
  
  // Test 1: Verify heading is "ZeroRisk"
  try {
    const activeSlide = await page.$('.carousel__slide--active');
    const heading = await activeSlide.$('h3');
    const headingText = await heading.textContent();
    
    const correctHeading = headingText && headingText.trim() === 'ZeroRisk';
    
    createTestResult(
      'ZeroRisk heading correct',
      'zeroRiskCard',
      correctHeading,
      correctHeading ? 
        'Heading correctly shows "ZeroRisk"' : 
        `Incorrect heading: "${headingText}"`
    );
  } catch (error) {
    createTestResult(
      'ZeroRisk heading correct',
      'zeroRiskCard',
      false,
      `Error checking heading: ${error.message}`
    );
  }
  
  // Test 2: Verify subheading
  try {
    const activeSlide = await page.$('.carousel__slide--active');
    const description = await activeSlide.$('p');
    const descriptionText = await description.textContent();
    const expectedText = "You Can't Lose Money - Our Offer Makes Your Investment Risk-Free";
    
    const correctDescription = descriptionText && descriptionText.trim() === expectedText;
    
    createTestResult(
      'ZeroRisk subheading correct',
      'zeroRiskCard',
      correctDescription,
      correctDescription ? 
        'Subheading correctly shows risk-free message' : 
        `Incorrect subheading: "${descriptionText}"`
    );
  } catch (error) {
    createTestResult(
      'ZeroRisk subheading correct',
      'zeroRiskCard',
      false,
      `Error checking subheading: ${error.message}`
    );
  }
  
  // Test 3: Verify "ZeroRisk Guarantee" banner is removed
  try {
    const activeSlide = await page.$('.carousel__slide--active');
    const bannerElements = await activeSlide.$$('.text-center.text-white.bg-blue-600');
    
    const bannerRemoved = bannerElements.length === 0;
    
    createTestResult(
      'ZeroRisk Guarantee banner removed',
      'zeroRiskCard',
      bannerRemoved,
      bannerRemoved ? 
        'Banner correctly removed' : 
        `Found ${bannerElements.length} banner elements that should be removed`
    );
  } catch (error) {
    createTestResult(
      'ZeroRisk Guarantee banner removed',
      'zeroRiskCard',
      false,
      `Error checking banner removal: ${error.message}`
    );
  }
  
  // Test 4: Verify video autoplay without user controls
  try {
    const activeSlide = await page.$('.carousel__slide--active');
    const video = await activeSlide.$('video');
    
    if (video) {
      const hasControls = await video.evaluate(el => el.hasAttribute('controls'));
      const autoplay = await video.evaluate(el => el.autoplay);
      const muted = await video.evaluate(el => el.muted);
      const loop = await video.evaluate(el => el.loop);
      
      const correctVideoSetup = !hasControls && autoplay && muted && loop;
      
      createTestResult(
        'ZeroRisk video autoplay without controls',
        'zeroRiskCard',
        correctVideoSetup,
        correctVideoSetup ? 
        `Video correctly configured: controls=${hasControls}, autoplay=${autoplay}, muted=${muted}, loop=${loop}` : 
        `Video incorrectly configured: controls=${hasControls}, autoplay=${autoplay}, muted=${muted}, loop=${loop}`
      );
    } else {
      createTestResult(
        'ZeroRisk video autoplay without controls',
        'zeroRiskCard',
        false,
        'No video element found in ZeroRisk card'
      );
    }
  } catch (error) {
    createTestResult(
      'ZeroRisk video autoplay without controls',
      'zeroRiskCard',
      false,
      `Error checking video setup: ${error.message}`
    );
  }
  
  await takeScreenshot(page, 'zero_risk_card', 'zeroRiskCard');
}

async function testExperienceCard(page) {
  console.log('Testing Card 2: Experience Section...');
  
  // Navigate to second slide
  try {
    await page.click('.carousel__arrow--next');
    await page.waitForTimeout(500);
  } catch (error) {
    // Ignore if navigation fails
  }
  
  // Test 1: Verify heading is "Extensive Experience"
  try {
    const activeSlide = await page.$('.carousel__slide--active');
    const heading = await activeSlide.$('h3');
    const headingText = await heading.textContent();
    
    const correctHeading = headingText && headingText.trim() === 'Extensive Experience';
    
    createTestResult(
      'Experience heading correct',
      'experienceCard',
      correctHeading,
      correctHeading ? 
        'Heading correctly shows "Extensive Experience"' : 
        `Incorrect heading: "${headingText}"`
    );
  } catch (error) {
    createTestResult(
      'Experience heading correct',
      'experienceCard',
      false,
      `Error checking heading: ${error.message}`
    );
  }
  
  // Test 2: Verify subheading
  try {
    const activeSlide = await page.$('.carousel__slide--active');
    const description = await activeSlide.$('p');
    const descriptionText = await description.textContent();
    const expectedText = 'Proven Track Record Across Multiple Industries';
    
    const correctDescription = descriptionText && descriptionText.trim() === expectedText;
    
    createTestResult(
      'Experience subheading correct',
      'experienceCard',
      correctDescription,
      correctDescription ? 
        'Subheading correctly shows experience message' : 
        `Incorrect subheading: "${descriptionText}"`
    );
  } catch (error) {
    createTestResult(
      'Experience subheading correct',
      'experienceCard',
      false,
      `Error checking subheading: ${error.message}`
    );
  }
  
  // Test 3: Verify video autoplay without user controls
  try {
    const activeSlide = await page.$('.carousel__slide--active');
    const video = await activeSlide.$('video');
    
    if (video) {
      const hasControls = await video.evaluate(el => el.hasAttribute('controls'));
      const autoplay = await video.evaluate(el => el.autoplay);
      const muted = await video.evaluate(el => el.muted);
      const loop = await video.evaluate(el => el.loop);
      
      const correctVideoSetup = !hasControls && autoplay && muted && loop;
      
      createTestResult(
        'Experience video autoplay without controls',
        'experienceCard',
        correctVideoSetup,
        correctVideoSetup ? 
        `Video correctly configured: controls=${hasControls}, autoplay=${autoplay}, muted=${muted}, loop=${loop}` : 
        `Video incorrectly configured: controls=${hasControls}, autoplay=${autoplay}, muted=${muted}, loop=${loop}`
      );
    } else {
      createTestResult(
        'Experience video autoplay without controls',
        'experienceCard',
        false,
        'No video element found in Experience card'
      );
    }
  } catch (error) {
    createTestResult(
      'Experience video autoplay without controls',
      'experienceCard',
      false,
      `Error checking video setup: ${error.message}`
    );
  }
  
  await takeScreenshot(page, 'experience_card', 'experienceCard');
}

async function testBusinessAutomationsCard(page) {
  console.log('Testing Card 3: Business Automations...');
  
  // Navigate to third slide
  try {
    await page.click('.carousel__arrow--next');
    await page.waitForTimeout(500);
  } catch (error) {
    // Ignore if navigation fails
  }
  
  // Test 1: Verify heading is "Business Automations"
  try {
    const activeSlide = await page.$('.carousel__slide--active');
    const heading = await activeSlide.$('h3');
    const headingText = await heading.textContent();
    
    const correctHeading = headingText && headingText.trim() === 'Business Automations';
    
    createTestResult(
      'Business Automations heading correct',
      'businessAutomationsCard',
      correctHeading,
      correctHeading ? 
        'Heading correctly shows "Business Automations"' : 
        `Incorrect heading: "${headingText}"`
    );
  } catch (error) {
    createTestResult(
      'Business Automations heading correct',
      'businessAutomationsCard',
      false,
      `Error checking heading: ${error.message}`
    );
  }
  
  // Test 2: Verify subheading
  try {
    const activeSlide = await page.$('.carousel__slide--active');
    const description = await activeSlide.$('p');
    const descriptionText = await description.textContent();
    const expectedText = 'High-Tech Solutions for Streamlined Operations';
    
    const correctDescription = descriptionText && descriptionText.trim() === expectedText;
    
    createTestResult(
      'Business Automations subheading correct',
      'businessAutomationsCard',
      correctDescription,
      correctDescription ? 
        'Subheading correctly shows business automations message' : 
        `Incorrect subheading: "${descriptionText}"`
    );
  } catch (error) {
    createTestResult(
      'Business Automations subheading correct',
      'businessAutomationsCard',
      false,
      `Error checking subheading: ${error.message}`
    );
  }
  
  // Test 3: Verify static image is displayed instead of video
  try {
    const activeSlide = await page.$('.carousel__slide--active');
    const video = await activeSlide.$('video');
    const image = await activeSlide.$('img');
    
    const hasImageNotVideo = !video && image;
    
    createTestResult(
      'Business Automations displays static image',
      'businessAutomationsCard',
      hasImageNotVideo,
      hasImageNotVideo ? 
        'Static image correctly displayed instead of video' : 
        `Found video: ${!!video}, image: ${!!image}`
    );
  } catch (error) {
    createTestResult(
      'Business Automations displays static image',
      'businessAutomationsCard',
      false,
      `Error checking image/video: ${error.message}`
    );
  }
  
  // Test 4: Verify proper embedding of static image
  try {
    const activeSlide = await page.$('.carousel__slide--active');
    const image = await activeSlide.$('img');
    
    if (image) {
      const imageSrc = await image.getAttribute('src');
      const hasCorrectSrc = imageSrc && imageSrc.includes('carosel_n8n_kq8h7n.png');
      const hasObjectFit = await image.evaluate(el => {
        return window.getComputedStyle(el).objectFit === 'cover';
      });
      
      const properEmbedding = hasCorrectSrc && hasObjectFit;
      
      createTestResult(
        'Business Automations image properly embedded',
        'businessAutomationsCard',
        properEmbedding,
        properEmbedding ? 
        `Image properly embedded: src contains expected filename, object-fit: cover` : 
        `Image not properly embedded: src=${imageSrc}, object-fit=${hasObjectFit}`
      );
    } else {
      createTestResult(
        'Business Automations image properly embedded',
        'businessAutomationsCard',
        false,
        'No image element found in Business Automations card'
      );
    }
  } catch (error) {
    createTestResult(
      'Business Automations image properly embedded',
      'businessAutomationsCard',
      false,
      `Error checking image embedding: ${error.message}`
    );
  }
  
  await takeScreenshot(page, 'business_automations_card', 'businessAutomationsCard');
}

async function testVideoBehavior(page) {
  console.log('Testing Video Behavior...');
  
  // Navigate back to first slide (ZeroRisk with video)
  try {
    // Click prev twice to get to first slide
    await page.click('.carousel__arrow--prev');
    await page.waitForTimeout(500);
    await page.click('.carousel__arrow--prev');
    await page.waitForTimeout(500);
  } catch (error) {
    // Ignore if navigation fails
  }
  
  // Test 1: Verify video autoplay on page load
  try {
    const activeSlide = await page.$('.carousel__slide--active');
    const video = await activeSlide.$('video');
    
    if (video) {
      // Wait a bit for video to potentially start
      await page.waitForTimeout(2000);
      
      const isPlaying = await video.evaluate(el => {
        return !el.paused && el.readyState >= 2;
      });
      
      createTestResult(
        'Video autoplay on page load',
        'videoBehavior',
        isPlaying,
        isPlaying ? 
          'Video is playing as expected' : 
          'Video is not playing - autoplay may have failed'
      );
    } else {
      createTestResult(
        'Video autoplay on page load',
        'videoBehavior',
        false,
        'No video element found in current slide'
      );
    }
  } catch (error) {
    createTestResult(
      'Video autoplay on page load',
      'videoBehavior',
      false,
      `Error checking video playback: ${error.message}`
    );
  }
  
  // Test 2: Verify seamless looping
  try {
    const activeSlide = await page.$('.carousel__slide--active');
    const video = await activeSlide.$('video');
    
    if (video) {
      const loop = await video.evaluate(el => el.loop);
      
      createTestResult(
        'Video seamless looping',
        'videoBehavior',
        loop,
        loop ? 
          'Video loop attribute correctly set' : 
          'Video loop attribute not set'
      );
    } else {
      createTestResult(
        'Video seamless looping',
        'videoBehavior',
        false,
        'No video element found in current slide'
      );
    }
  } catch (error) {
    createTestResult(
      'Video seamless looping',
      'videoBehavior',
      false,
      `Error checking video loop: ${error.message}`
    );
  }
  
  // Test 3: Verify video player controls are removed
  try {
    const activeSlide = await page.$('.carousel__slide--active');
    const video = await activeSlide.$('video');
    
    if (video) {
      const hasControls = await video.evaluate(el => el.hasAttribute('controls'));
      const controlsVisible = await video.evaluate(el => {
        return window.getComputedStyle(el).controls !== '';
      });
      
      const noControls = !hasControls && !controlsVisible;
      
      createTestResult(
        'Video player controls removed',
        'videoBehavior',
        noControls,
        noControls ? 
          'Video controls correctly removed' : 
          `Video controls still visible: hasAttribute=${hasControls}, visible=${controlsVisible}`
      );
    } else {
      createTestResult(
        'Video player controls removed',
        'videoBehavior',
        false,
        'No video element found in current slide'
      );
    }
  } catch (error) {
    createTestResult(
      'Video player controls removed',
      'videoBehavior',
      false,
      `Error checking video controls: ${error.message}`
    );
  }
  
  // Test 4: Verify continuous playback regardless of user interaction
  try {
    const activeSlide = await page.$('.carousel__slide--active');
    const video = await activeSlide.$('video');
    
    if (video) {
      const pointerEvents = await video.evaluate(el => {
        return window.getComputedStyle(el).pointerEvents;
      });
      
      const noInteraction = pointerEvents === 'none';
      
      createTestResult(
        'Video continuous playback regardless of user interaction',
        'videoBehavior',
        noInteraction,
        noInteraction ? 
          'Video correctly configured to prevent user interaction' : 
          `Video still allows user interaction: pointer-events=${pointerEvents}`
      );
    } else {
      createTestResult(
        'Video continuous playback regardless of user interaction',
        'videoBehavior',
        false,
        'No video element found in current slide'
      );
    }
  } catch (error) {
    createTestResult(
      'Video continuous playback regardless of user interaction',
      'videoBehavior',
      false,
      `Error checking video interaction: ${error.message}`
    );
  }
  
  await takeScreenshot(page, 'video_behavior', 'videoBehavior');
}

async function testTechnicalImplementation(page) {
  console.log('Testing Technical Implementation...');
  
  // Test 1: Test responsive design across device sizes
  try {
    const viewports = [
      { width: 375, height: 667, name: 'Mobile' },
      { width: 768, height: 1024, name: 'Tablet' },
      { width: 1280, height: 720, name: 'Desktop' }
    ];
    
    let responsiveWorking = true;
    const responsiveDetails = [];
    
    for (const viewport of viewports) {
      await page.setViewportSize(viewport);
      await page.waitForTimeout(500);
      
      const carousel = await page.$('.carousel');
      const isVisible = await carousel.isVisible();
      
      if (!isVisible) {
        responsiveWorking = false;
        responsiveDetails.push(`${viewport.name}: Carousel not visible`);
      } else {
        responsiveDetails.push(`${viewport.name}: OK`);
      }
    }
    
    createTestResult(
      'Responsive design across device sizes',
      'technicalImplementation',
      responsiveWorking,
      responsiveWorking ? 
        `Responsive design working: ${responsiveDetails.join(', ')}` : 
        `Responsive design issues: ${responsiveDetails.join(', ')}`
    );
  } catch (error) {
    createTestResult(
      'Responsive design across device sizes',
      'technicalImplementation',
      false,
      `Error testing responsive design: ${error.message}`
    );
  }
  
  // Test 2: Test loading performance for media assets
  try {
    // Navigate to each slide and check for media loading
    const slides = [0, 1, 2]; // Three slides
    let mediaLoadingWorking = true;
    const loadingDetails = [];
    
    for (let i = 0; i < slides.length; i++) {
      // Navigate to slide
      if (i > 0) {
        await page.click('.carousel__arrow--next');
        await page.waitForTimeout(500);
      }
      
      const activeSlide = await page.$('.carousel__slide--active');
      const video = await activeSlide.$('video');
      const image = await activeSlide.$('img');
      
      if (video) {
        const readyState = await video.evaluate(el => el.readyState);
        const hasSrc = await video.evaluate(el => !!el.src);
        
        if (readyState < 2 || !hasSrc) {
          mediaLoadingWorking = false;
          loadingDetails.push(`Slide ${i+1}: Video not loaded (readyState: ${readyState}, hasSrc: ${hasSrc})`);
        } else {
          loadingDetails.push(`Slide ${i+1}: Video loaded`);
        }
      } else if (image) {
        const naturalWidth = await image.evaluate(el => el.naturalWidth);
        const hasSrc = await image.evaluate(el => !!el.src);
        
        if (naturalWidth === 0 || !hasSrc) {
          mediaLoadingWorking = false;
          loadingDetails.push(`Slide ${i+1}: Image not loaded (naturalWidth: ${naturalWidth}, hasSrc: ${hasSrc})`);
        } else {
          loadingDetails.push(`Slide ${i+1}: Image loaded`);
        }
      } else {
        mediaLoadingWorking = false;
        loadingDetails.push(`Slide ${i+1}: No media found`);
      }
    }
    
    createTestResult(
      'Loading performance for media assets',
      'technicalImplementation',
      mediaLoadingWorking,
      mediaLoadingWorking ? 
        `Media loading working: ${loadingDetails.join(', ')}` : 
        `Media loading issues: ${loadingDetails.join(', ')}`
    );
  } catch (error) {
    createTestResult(
      'Loading performance for media assets',
      'technicalImplementation',
      false,
      `Error testing media loading: ${error.message}`
    );
  }
  
  // Test 3: Test carousel functionality across different browsers (user agent simulation)
  try {
    const userAgents = [
      { userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36', name: 'Chrome' },
      { userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:89.0) Gecko/20100101 Firefox/89.0', name: 'Firefox' },
      { userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.1 Safari/605.1.15', name: 'Safari' }
    ];
    
    let browserCompatibilityWorking = true;
    const compatibilityDetails = [];
    
    for (const ua of userAgents) {
      await page.setUserAgent(ua.userAgent);
      await page.reload();
      await page.waitForTimeout(2000);
      
      const carousel = await page.$('.carousel');
      const isVisible = await carousel.isVisible();
      
      if (!isVisible) {
        browserCompatibilityWorking = false;
        compatibilityDetails.push(`${ua.name}: Carousel not visible`);
      } else {
        // Test basic navigation
        const initialSlide = await page.getAttribute('.carousel__slide--active', 'data-index');
        await page.click('.carousel__arrow--next');
        await page.waitForTimeout(500);
        const afterClick = await page.getAttribute('.carousel__slide--active', 'data-index');
        
        if (initialSlide === afterClick) {
          browserCompatibilityWorking = false;
          compatibilityDetails.push(`${ua.name}: Navigation not working`);
        } else {
          compatibilityDetails.push(`${ua.name}: OK`);
        }
      }
    }
    
    createTestResult(
      'Carousel functionality across different browsers',
      'technicalImplementation',
      browserCompatibilityWorking,
      browserCompatibilityWorking ? 
        `Browser compatibility working: ${compatibilityDetails.join(', ')}` : 
        `Browser compatibility issues: ${compatibilityDetails.join(', ')}`
    );
  } catch (error) {
    createTestResult(
      'Carousel functionality across different browsers',
      'technicalImplementation',
      false,
      `Error testing browser compatibility: ${error.message}`
    );
  }
  
  // Test 4: Test proper embedding of static image asset
  try {
    // Navigate to Business Automations slide (third slide)
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
    
    // Navigate to third slide
    await page.click('.carousel__arrow--next');
    await page.waitForTimeout(500);
    await page.click('.carousel__arrow--next');
    await page.waitForTimeout(500);
    
    const activeSlide = await page.$('.carousel__slide--active');
    const image = await activeSlide.$('img');
    
    if (image) {
      const imageSrc = await image.getAttribute('src');
      const hasCorrectSrc = imageSrc && imageSrc.includes('carosel_n8n_kq8h7n.png');
      const isResponsive = await image.evaluate(el => {
        const style = window.getComputedStyle(el);
        return style.width === '100%' && style.height === '100%';
      });
      
      const properEmbedding = hasCorrectSrc && isResponsive;
      
      createTestResult(
        'Proper embedding of static image asset',
        'technicalImplementation',
        properEmbedding,
        properEmbedding ? 
          `Static image properly embedded: correct src, responsive sizing` : 
          `Static image not properly embedded: src=${imageSrc}, responsive=${isResponsive}`
      );
    } else {
      createTestResult(
        'Proper embedding of static image asset',
        'technicalImplementation',
        false,
        'No image element found in Business Automations slide'
      );
    }
  } catch (error) {
    createTestResult(
      'Proper embedding of static image asset',
      'technicalImplementation',
      false,
      `Error testing image embedding: ${error.message}`
    );
  }
  
  await takeScreenshot(page, 'technical_implementation', 'technicalImplementation');
}

async function testDeploymentReadiness(page) {
  console.log('Testing Deployment Readiness...');
  
  // Test 1: Check for console errors or warnings
  try {
    const consoleMessages = [];
    page.on('console', msg => {
      if (msg.type() === 'error' || msg.type() === 'warning') {
        consoleMessages.push({
          type: msg.type(),
          text: msg.text(),
          location: msg.location()
        });
      }
    });
    
    // Reload page to catch any errors on load
    await page.reload();
    await page.waitForTimeout(3000);
    
    const hasErrors = consoleMessages.length > 0;
    
    createTestResult(
      'No console errors or warnings',
      'deploymentReadiness',
      !hasErrors,
      !hasErrors ? 
        'No console errors or warnings found' : 
        `Found ${consoleMessages.length} console issues: ${consoleMessages.map(m => `${m.type}: ${m.text}`).join(', ')}`
    );
  } catch (error) {
    createTestResult(
      'No console errors or warnings',
      'deploymentReadiness',
      false,
      `Error checking console messages: ${error.message}`
    );
  }
  
  // Test 2: Verify all file imports are working correctly
  try {
    // Check for any 404 errors in network requests
    const failedRequests = [];
    page.on('requestfailed', request => {
      if (request.failure().errorText === 'net::ERR_FAILED' || 
          request.failure().errorText.includes('404')) {
        failedRequests.push({
          url: request.url(),
          error: request.failure().errorText
        });
      }
    });
    
    // Reload page to catch any failed requests
    await page.reload();
    await page.waitForTimeout(3000);
    
    const importsWorking = failedRequests.length === 0;
    
    createTestResult(
      'All file imports working correctly',
      'deploymentReadiness',
      importsWorking,
      importsWorking ? 
        'All file imports working correctly' : 
        `Found ${failedRequests.length} failed requests: ${failedRequests.map(r => `${r.url} (${r.error})`).join(', ')}`
    );
  } catch (error) {
    createTestResult(
      'All file imports working correctly',
      'deploymentReadiness',
      false,
      `Error checking file imports: ${error.message}`
    );
  }
  
  // Test 3: Check for deployment-blocking issues
  try {
    // Check for common deployment issues
    const deploymentIssues = [];
    
    // Check if all required components are loaded
    const carousel = await page.$('.carousel');
    if (!carousel) {
      deploymentIssues.push('Carousel component not loaded');
    }
    
    const videoCards = await page.$$('video, img');
    if (videoCards.length < 3) {
      deploymentIssues.push(`Not all media elements loaded: found ${videoCards.length}, expected 3`);
    }
    
    // Check if navigation is working
    const prevArrow = await page.$('.carousel__arrow--prev');
    const nextArrow = await page.$('.carousel__arrow--next');
    if (!prevArrow || !nextArrow) {
      deploymentIssues.push('Navigation arrows not loaded');
    }
    
    const noBlockingIssues = deploymentIssues.length === 0;
    
    createTestResult(
      'No deployment-blocking issues',
      'deploymentReadiness',
      noBlockingIssues,
      noBlockingIssues ? 
        'No deployment-blocking issues found' : 
        `Found deployment issues: ${deploymentIssues.join(', ')}`
    );
  } catch (error) {
    createTestResult(
      'No deployment-blocking issues',
      'deploymentReadiness',
      false,
      `Error checking deployment issues: ${error.message}`
    );
  }
  
  // Test 4: Test implementation in production-like environment
  try {
    // Simulate production environment conditions
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.emulateNetworkConditions({ 
      offline: false, 
      downloadThroughput: 1500000, // 1.5 Mbps
      uploadThroughput: 700000,   // 700 Kbps
      latency: 20                 // 20ms
    });
    
    // Reload page with production-like conditions
    await page.reload();
    await page.waitForTimeout(3000);
    
    // Check if carousel still works under these conditions
    const carousel = await page.$('.carousel');
    const isVisible = await carousel.isVisible();
    
    // Test navigation
    const initialSlide = await page.getAttribute('.carousel__slide--active', 'data-index');
    await page.click('.carousel__arrow--next');
    await page.waitForTimeout(1000); // Longer timeout for slower network
    const afterClick = await page.getAttribute('.carousel__slide--active', 'data-index');
    
    const worksInProduction = isVisible && initialSlide !== afterClick;
    
    createTestResult(
      'Implementation works in production-like environment',
      'deploymentReadiness',
      worksInProduction,
      worksInProduction ? 
        'Implementation works in production-like environment' : 
        `Implementation issues in production-like environment: visible=${isVisible}, navigation=${initialSlide !== afterClick}`
    );
  } catch (error) {
    createTestResult(
      'Implementation works in production-like environment',
      'deploymentReadiness',
      false,
      `Error testing production-like environment: ${error.message}`
    );
  }
  
  await takeScreenshot(page, 'deployment_readiness', 'deploymentReadiness');
}

// Main test runner
async function runTests() {
  console.log('Starting Comprehensive Carousel Enhancement Tests...');
  
  const browser = await chromium.launch({ headless: TEST_CONFIG.headless });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 },
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
  });
  
  const page = await context.newPage();
  
  try {
    // Navigate to the page with carousel
    await page.goto(TEST_CONFIG.baseUrl, { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000); // Allow page to fully load
    
    // Scroll to carousel section
    await page.evaluate(() => {
      document.querySelector('#why-choose-us')?.scrollIntoView({ behavior: 'smooth' });
    });
    await page.waitForTimeout(1000);
    
    // Run all test suites
    await testNavigationControls(page);
    await testCardLayoutStructure(page);
    await testZeroRiskCard(page);
    await testExperienceCard(page);
    await testBusinessAutomationsCard(page);
    await testVideoBehavior(page);
    await testTechnicalImplementation(page);
    await testDeploymentReadiness(page);
    
    // Generate test report
    const report = generateTestReport();
    
    // Save report to file
    const reportPath = './test-results/carousel-enhancement-test-report.json';
    if (!fs.existsSync('./test-results')) {
      fs.mkdirSync('./test-results', { recursive: true });
    }
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    
    console.log(`Test report saved to: ${reportPath}`);
    console.log(`Tests completed: ${testResults.summary.passed}/${testResults.summary.total} passed`);
    
    if (testResults.summary.failed > 0) {
      console.log(`${testResults.summary.failed} tests failed. Check report for details.`);
      console.log('Failed tests:');
      testResults.issues.forEach(issue => {
        console.log(`  - ${issue.testName} (${issue.category}): ${issue.details}`);
      });
    }
    
    return report;
  } catch (error) {
    console.error('Error running tests:', error);
    throw error;
  } finally {
    await browser.close();
  }
}

// Generate comprehensive test report
function generateTestReport() {
  const report = {
    timestamp: new Date().toISOString(),
    summary: testResults.summary,
    categories: {},
    deploymentReadiness: {
      status: testResults.categories.deploymentReadiness.failed === 0 ? 'READY' : 'NOT READY',
      criticalIssues: testResults.categories.deploymentReadiness.details.filter(t => !t.passed),
      recommendations: []
    },
    screenshots: testResults.screenshots
  };
  
  // Process category results
  Object.keys(testResults.categories).forEach(category => {
    const categoryResults = testResults.categories[category];
    report.categories[category] = {
      passed: categoryResults.passed,
      failed: categoryResults.failed,
      total: categoryResults.passed + categoryResults.failed,
      status: categoryResults.failed === 0 ? 'PASS' : 'FAIL',
      details: categoryResults.details
    };
  });
  
  // Generate recommendations
  if (testResults.categories.deploymentReadiness.failed > 0) {
    report.deploymentReadiness.recommendations.push('Fix deployment readiness issues before deploying');
  }
  
  if (testResults.categories.navigationControls.failed > 0) {
    report.deploymentReadiness.recommendations.push('Fix navigation control issues');
  }
  
  if (testResults.categories.videoBehavior.failed > 0) {
    report.deploymentReadiness.recommendations.push('Fix video behavior issues');
  }
  
  if (testResults.categories.technicalImplementation.failed > 0) {
    report.deploymentReadiness.recommendations.push('Fix technical implementation issues');
  }
  
  if (report.deploymentReadiness.recommendations.length === 0) {
    report.deploymentReadiness.recommendations.push('All tests passed - ready for deployment');
  }
  
  return report;
}

// Run tests if this file is executed directly
if (require.main === module) {
  runTests()
    .then(() => {
      console.log('All tests completed successfully');
      process.exit(0);
    })
    .catch(error => {
      console.error('Test execution failed:', error);
      process.exit(1);
    });
}

module.exports = {
  runTests,
  testNavigationControls,
  testCardLayoutStructure,
  testZeroRiskCard,
  testExperienceCard,
  testBusinessAutomationsCard,
  testVideoBehavior,
  testTechnicalImplementation,
  testDeploymentReadiness
};