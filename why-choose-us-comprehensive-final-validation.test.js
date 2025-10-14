const { test, expect, devices } = require('@playwright/test');
const path = require('path');
const fs = require('fs');

// Define viewports for testing
const VIEWPORTS = {
  mobile: { width: 375, height: 667 },    // iPhone SE
  mobileLarge: { width: 414, height: 896 }, // iPhone 11
  tablet: { width: 768, height: 1024 },    // iPad
  tabletLandscape: { width: 1024, height: 768 }, // iPad landscape
  desktop: { width: 1440, height: 900 },   // Desktop
  desktopLarge: { width: 1920, height: 1080 }, // Large desktop
  intermediate: { width: 1024, height: 768 } // Intermediate size
};

// Expected aspect ratio (3:4 = 0.75)
const EXPECTED_ASPECT_RATIO = 0.75;
const ASPECT_RATIO_TOLERANCE = 0.05; // Allow 5% tolerance

// Helper function to calculate aspect ratio
function calculateAspectRatio(width, height) {
  return width / height;
}

// Helper function to check if aspect ratio is within tolerance
function isAspectRatioWithinTolerance(actual, expected, tolerance) {
  return Math.abs(actual - expected) <= tolerance;
}

// Helper function to generate test report data
function generateTestResult(testName, passed, details = {}) {
  return {
    test: testName,
    passed,
    timestamp: new Date().toISOString(),
    ...details
  };
}

// Helper function to create test page content
function createTestPageContent() {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>WhyChooseUs Comprehensive Final Validation</title>
      <script src="https://cdn.tailwindcss.com"></script>
      <script src="https://cdn.jsdelivr.net/npm/framer-motion@10.16.4/dist/framer-motion.min.js"></script>
      <style>
        /* Include necessary styles from globals.css */
        :root {
          --carousel-card-width-mobile: 85vw;
          --carousel-card-height-mobile: calc(85vw * 1.33);
          --carousel-card-width-tablet: 45vw;
          --carousel-card-height-tablet: calc(45vw * 1.33);
          --carousel-card-width-desktop: 30vw;
          --carousel-card-height-desktop: calc(30vw * 1.33);
          --standard-card-width-mobile: var(--carousel-card-width-mobile);
          --standard-card-height-mobile: var(--carousel-card-height-mobile);
          --standard-card-width-tablet: var(--carousel-card-width-tablet);
          --standard-card-height-tablet: var(--carousel-card-height-tablet);
          --standard-card-width-desktop: var(--carousel-card-width-desktop);
          --standard-card-height-desktop: var(--carousel-card-height-desktop);
          --carousel-card-margin: 2vw;
          --carousel-container-padding: 1rem;
          --carousel-card-gap: 1rem;
          --video-container-border-radius: 0.25rem;
          --video-overlay-opacity: 0.5;
        }
        
        .carousel-card {
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          border-radius: var(--video-container-border-radius);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          will-change: transform;
          flex-shrink: 0;
          margin: 0 var(--carousel-card-margin);
          aspect-ratio: 3/4;
        }
        
        .carousel-card-standard,
        .carousel-card-zero-risk {
          width: var(--carousel-card-width-mobile);
          height: var(--carousel-card-height-mobile);
        }
        
        .video-container {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          overflow: hidden;
          background-color: #1D1F2F;
        }
        
        .video-element {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: opacity 0.6s ease-in-out;
        }
        
        .carousel-container-enhanced {
          position: relative;
          width: 100%;
          max-width: 1200px;
          margin: 0 auto;
          padding: var(--carousel-container-padding);
        }
        
        .carousel-list-enhanced {
          display: flex;
          transition: transform 1s cubic-bezier(0.4, 0, 0.2, 1);
          will-change: transform;
          gap: var(--carousel-card-gap);
          padding: 0 var(--carousel-card-margin);
        }
        
        @media (min-width: 768px) {
          :root {
            --carousel-card-width-mobile: var(--carousel-card-width-tablet);
            --carousel-card-height-mobile: var(--carousel-card-height-tablet);
            --standard-card-width-mobile: var(--standard-card-width-tablet);
            --standard-card-height-mobile: var(--standard-card-height-tablet);
            --carousel-card-margin: 1.5vw;
          }
          
          .carousel-card-standard {
            width: var(--standard-card-width-tablet);
            height: var(--standard-card-height-tablet);
          }
        }
        
        @media (min-width: 1024px) {
          :root {
            --carousel-card-width-mobile: var(--carousel-card-width-desktop);
            --carousel-card-height-mobile: var(--carousel-card-height-desktop);
            --standard-card-width-mobile: var(--standard-card-width-desktop);
            --standard-card-height-mobile: var(--standard-card-height-desktop);
            --carousel-card-margin: 1vw;
          }
          
          .carousel-card-standard {
            width: var(--standard-card-width-desktop);
            height: var(--standard-card-height-desktop);
          }
        }
      </style>
    </head>
    <body>
      <div id="test-container">
        <!-- WhyChooseUs component will be rendered here -->
      </div>
      
      <script>
        // Simplified carousel implementation for testing
        const slideData = [
          {
            title: "Zero Risk",
            description: "You can't lose money. Our offer makes working with us risk free.",
            src: "https://res.cloudinary.com/dmdjagtkx/video/upload/v1760415676/insta_post_2_1_xdaptq.mp4",
            isVideo: true,
          },
          {
            title: "Expert Team",
            description: "Our specialists bring years of experience to deliver exceptional results.",
            src: "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?q=80&w=3540&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
          },
          {
            title: "Proven Process",
            description: "We've refined our approach to ensure consistent, high-quality outcomes.",
            src: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=3540&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
          },
          {
            title: "Transparent Pricing",
            description: "No hidden fees or surprises—just clear, straightforward pricing.",
            src: "https://images.unsplash.com/photo-1554224154-260325c05f19?q=80&w=3540&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
          },
          {
            title: "Dedicated Support",
            description: "We're with you every step of the way, ensuring your success.",
            src: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=3540&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
          }
        ];
        
        function renderCarousel() {
          const container = document.getElementById('test-container');
          container.innerHTML = \`
            <section id="why-choose-us" class="relative min-h-screen overflow-hidden bg-white">
              <div class="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16 w-full">
                <div class="text-center mb-24">
                  <h2 class="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                    Why Choose the Asset Studio?
                  </h2>
                  <p class="text-xl text-gray-700 max-w-3xl mx-auto">
                    Discover the key benefits that set us apart and make us the perfect partner for your business growth.
                  </p>
                </div>
                
                <div class="flex justify-center items-center mt-12">
                  <div class="w-full max-w-5xl">
                    <div class="carousel-container-enhanced relative mx-auto">
                      <div class="carousel-list-enhanced absolute flex transition-transform duration-1000 ease-in-out" id="carousel-list" style="width: 500%; overflow: hidden;">
                        \${slideData.map((slide, index) => \`
                          <div class="carousel-card carousel-card-standard" data-slide-index="\${index}">
                            <div class="video-container rounded-[1%] overflow-hidden transition-all duration-150 ease-out">
                              \${slide.isVideo ? \`
                                <video
                                  class="video-element opacity-100 transition-opacity duration-600 ease-in-out"
                                  autoPlay
                                  muted
                                  loop
                                  playsInline
                                  src="\${slide.src}"
                                />
                              \` : \`
                                <img
                                  class="video-element opacity-100 transition-opacity duration-600 ease-in-out"
                                  src="\${slide.src}"
                                  alt="\${slide.title}"
                                />
                              \`}
                              <div class="absolute inset-0 transition-all duration-1000 bg-black/30" />
                            </div>
                            
                            <article class="relative p-[4vmin] transition-opacity duration-1000 ease-in-out opacity-100 visible z-20" style="background-color: rgba(0, 0, 0, 0.5); border-radius: 0.25rem; backdrop-filter: blur(2px); text-shadow: 0 2px 4px rgba(0, 0, 0, 0.8); position: absolute; bottom: 0; left: 0; right: 0;">
                              <h2 class="text-lg md:text-2xl lg:text-4xl font-semibold relative text-white">
                                \${slide.title}
                              </h2>
                              <p class="mt-3 text-sm md:text-base max-w-xs mx-auto text-white/90">
                                \${slide.description}
                              </p>
                            </article>
                          </div>
                        \`).join('')}
                      </div>
                      
                      <div class="absolute flex justify-center w-full top-[calc(100%+1rem)]">
                        <button id="prev-btn" class="w-10 h-10 flex items-center mx-2 justify-center bg-neutral-200 border-3 border-transparent rounded-full">
                          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="rotate-180">
                            <path d="m9 18 6-6-6-6"/>
                          </svg>
                        </button>
                        
                        <button id="next-btn" class="w-10 h-10 flex items-center mx-2 justify-center bg-neutral-200 border-3 border-transparent rounded-full">
                          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="m9 18 6-6-6-6"/>
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          \`;
          
          // Add carousel functionality
          let current = 0;
          const slides = slideData.length;
          const list = document.getElementById('carousel-list');
          
          document.getElementById('prev-btn').addEventListener('click', () => {
            current = current === 0 ? slides - 1 : current - 1;
            list.style.transform = \`translateX(-\${current * (100 / slides)}%)\`;
          });
          
          document.getElementById('next-btn').addEventListener('click', () => {
            current = (current + 1) % slides;
            list.style.transform = \`translateX(-\${current * (100 / slides)}%)\`;
          });
        }
        
        // Render the carousel when page loads
        document.addEventListener('DOMContentLoaded', renderCarousel);
      </script>
    </body>
    </html>
  `;
}

test.describe('WhyChooseUs Carousel Comprehensive Final Validation', () => {
  let testResults = [];
  let summaryData = {
    aspectRatioTests: { passed: 0, failed: 0 },
    textVisibilityTests: { passed: 0, failed: 0 },
    cardSpacingTests: { passed: 0, failed: 0 },
    mediaHandlingTests: { passed: 0, failed: 0 },
    carouselFunctionalityTests: { passed: 0, failed: 0 },
    visualConsistencyTests: { passed: 0, failed: 0 }
  };

  // Save results after all tests complete
  test.afterAll(async () => {
    const reportPath = path.join(__dirname, 'test-results', 'why-choose-us-comprehensive-final-validation-report.json');
    
    // Ensure test-results directory exists
    if (!fs.existsSync(path.join(__dirname, 'test-results'))) {
      fs.mkdirSync(path.join(__dirname, 'test-results'), { recursive: true });
    }
    
    const totalTests = testResults.length;
    const passedTests = testResults.filter(r => r.passed).length;
    const failedTests = totalTests - passedTests;
    
    const reportData = {
      timestamp: new Date().toISOString(),
      title: 'WhyChooseUs Carousel Comprehensive Final Validation Report',
      summary: {
        total: totalTests,
        passed: passedTests,
        failed: failedTests,
        passRate: totalTests > 0 ? ((passedTests / totalTests) * 100).toFixed(2) : "0"
      },
      summaryByCategory: summaryData,
      results: testResults
    };
    
    fs.writeFileSync(reportPath, JSON.stringify(reportData, null, 2));
    console.log(`Test report saved to ${reportPath}`);
  });

  // Test for each viewport size
  Object.entries(VIEWPORTS).forEach(([viewportName, viewport]) => {
    test.describe(`Viewport: ${viewportName} (${viewport.width}x${viewport.height})`, () => {
      test.use({ viewport });

      // 1. ASPECT RATIO IMPLEMENTATION TESTS
      test('1.1 should maintain strict 3:4 aspect ratio for all carousel cards', async ({ page }) => {
        await page.setContent(createTestPageContent());
        await page.waitForSelector('.carousel-card', { timeout: 10000 });
        
        const cards = await page.$$('.carousel-card');
        expect(cards.length).toBeGreaterThan(0);
        
        let allCardsMaintainAspectRatio = true;
        const cardMeasurements = [];
        
        for (let i = 0; i < cards.length; i++) {
          const card = cards[i];
          const boundingBox = await card.boundingBox();
          
          if (boundingBox) {
            const aspectRatio = calculateAspectRatio(boundingBox.width, boundingBox.height);
            const withinTolerance = isAspectRatioWithinTolerance(
              aspectRatio, 
              EXPECTED_ASPECT_RATIO, 
              ASPECT_RATIO_TOLERANCE
            );
            
            cardMeasurements.push({
              index: i,
              width: boundingBox.width,
              height: boundingBox.height,
              aspectRatio,
              expectedAspectRatio: EXPECTED_ASPECT_RATIO,
              tolerance: ASPECT_RATIO_TOLERANCE,
              withinTolerance,
              difference: Math.abs(aspectRatio - EXPECTED_ASPECT_RATIO)
            });
            
            if (!withinTolerance) {
              allCardsMaintainAspectRatio = false;
            }
          }
        }
        
        expect(allCardsMaintainAspectRatio).toBeTruthy();
        
        if (allCardsMaintainAspectRatio) {
          summaryData.aspectRatioTests.passed++;
        } else {
          summaryData.aspectRatioTests.failed++;
        }
        
        testResults.push(generateTestResult(
          `${viewportName} - Cards maintain 3:4 aspect ratio`,
          allCardsMaintainAspectRatio,
          { 
            viewport: `${viewport.width}x${viewport.height}`,
            category: 'aspectRatio',
            cardMeasurements
          }
        ));
      });

      test('1.2 should have consistent aspect ratio across all breakpoints', async ({ page }) => {
        await page.setContent(createTestPageContent());
        await page.waitForSelector('.carousel-card', { timeout: 10000 });
        
        // Get the computed aspect ratio from CSS
        const cssAspectRatio = await page.$eval('.carousel-card', el => {
          return getComputedStyle(el).aspectRatio;
        });
        
        // Check if CSS aspect ratio is set to 3/4
        const hasCorrectCSSAspectRatio = cssAspectRatio === '3/4' || cssAspectRatio === '0.75';
        
        expect(hasCorrectCSSAspectRatio).toBeTruthy();
        
        if (hasCorrectCSSAspectRatio) {
          summaryData.aspectRatioTests.passed++;
        } else {
          summaryData.aspectRatioTests.failed++;
        }
        
        testResults.push(generateTestResult(
          `${viewportName} - CSS aspect ratio is set to 3/4`,
          hasCorrectCSSAspectRatio,
          { 
            viewport: `${viewport.width}x${viewport.height}`,
            category: 'aspectRatio',
            cssAspectRatio
          }
        ));
      });

      // 2. TEXT VISIBILITY IMPROVEMENTS TESTS
      test('2.1 should display text overlays with proper contrast', async ({ page }) => {
        await page.setContent(createTestPageContent());
        await page.waitForSelector('article', { timeout: 10000 });
        
        const articles = await page.$$('article');
        expect(articles.length).toBeGreaterThan(0);
        
        let allTextHasProperContrast = true;
        const textContrastResults = [];
        
        for (let i = 0; i < articles.length; i++) {
          const article = articles[i];
          const backgroundColor = await article.evaluate(el => {
            return getComputedStyle(el).backgroundColor;
          });
          
          const titles = await article.$$('h2');
          const descriptions = await article.$$('p');
          
          for (const title of titles) {
            const color = await title.evaluate(el => getComputedStyle(el).color);
            const hasDarkText = color.includes('rgb(255, 255, 255)') || color.includes('#ffffff') || color.includes('white');
            const hasBackgroundWithBlur = backgroundColor.includes('rgba') && backgroundColor.includes('0.5');
            
            textContrastResults.push({
              index: i,
              type: 'title',
              color,
              backgroundColor,
              hasDarkText,
              hasBackgroundWithBlur,
              hasProperContrast: hasDarkText && hasBackgroundWithBlur
            });
            
            if (!hasDarkText || !hasBackgroundWithBlur) {
              allTextHasProperContrast = false;
            }
          }
          
          for (const description of descriptions) {
            const color = await description.evaluate(el => getComputedStyle(el).color);
            const hasDarkText = color.includes('rgb(255, 255, 255)') || color.includes('#ffffff') || color.includes('white');
            const hasBackgroundWithBlur = backgroundColor.includes('rgba') && backgroundColor.includes('0.5');
            
            textContrastResults.push({
              index: i,
              type: 'description',
              color,
              backgroundColor,
              hasDarkText,
              hasBackgroundWithBlur,
              hasProperContrast: hasDarkText && hasBackgroundWithBlur
            });
            
            if (!hasDarkText || !hasBackgroundWithBlur) {
              allTextHasProperContrast = false;
            }
          }
        }
        
        expect(allTextHasProperContrast).toBeTruthy();
        
        if (allTextHasProperContrast) {
          summaryData.textVisibilityTests.passed++;
        } else {
          summaryData.textVisibilityTests.failed++;
        }
        
        testResults.push(generateTestResult(
          `${viewportName} - Text overlays have proper contrast`,
          allTextHasProperContrast,
          { 
            viewport: `${viewport.width}x${viewport.height}`,
            category: 'textVisibility',
            textContrastResults
          }
        ));
      });

      test('2.2 should have text with proper readability and positioning', async ({ page }) => {
        await page.setContent(createTestPageContent());
        await page.waitForSelector('article', { timeout: 10000 });
        
        const articles = await page.$$('article');
        expect(articles.length).toBeGreaterThan(0);
        
        let allTextIsReadable = true;
        const textReadabilityResults = [];
        
        for (let i = 0; i < articles.length; i++) {
          const article = articles[i];
          const isVisible = await article.isVisible();
          const hasBackdropFilter = await article.evaluate(el => {
            return getComputedStyle(el).backdropFilter !== 'none';
          });
          const hasTextShadow = await article.evaluate(el => {
            const textShadow = getComputedStyle(el).textShadow;
            return textShadow !== 'none' && textShadow.includes('rgba(0, 0, 0');
          });
          
          const titles = await article.$$('h2');
          const descriptions = await article.$$('p');
          
          for (const title of titles) {
            const fontSize = parseFloat(await title.evaluate(el => getComputedStyle(el).fontSize));
            const hasReasonableFontSize = fontSize >= 16; // At least 16px for readability
            const textContent = await title.textContent();
            const hasContent = textContent && textContent.trim().length > 0;
            
            textReadabilityResults.push({
              index: i,
              type: 'title',
              isVisible,
              hasBackdropFilter,
              hasTextShadow,
              fontSize,
              hasReasonableFontSize,
              hasContent,
              isReadable: isVisible && hasBackdropFilter && hasTextShadow && hasReasonableFontSize && hasContent
            });
            
            if (!isVisible || !hasBackdropFilter || !hasTextShadow || !hasReasonableFontSize || !hasContent) {
              allTextIsReadable = false;
            }
          }
          
          for (const description of descriptions) {
            const fontSize = parseFloat(await description.evaluate(el => getComputedStyle(el).fontSize));
            const hasReasonableFontSize = fontSize >= 14; // At least 14px for descriptions
            const textContent = await description.textContent();
            const hasContent = textContent && textContent.trim().length > 0;
            
            textReadabilityResults.push({
              index: i,
              type: 'description',
              isVisible,
              hasBackdropFilter,
              hasTextShadow,
              fontSize,
              hasReasonableFontSize,
              hasContent,
              isReadable: isVisible && hasBackdropFilter && hasTextShadow && hasReasonableFontSize && hasContent
            });
            
            if (!isVisible || !hasBackdropFilter || !hasTextShadow || !hasReasonableFontSize || !hasContent) {
              allTextIsReadable = false;
            }
          }
        }
        
        expect(allTextIsReadable).toBeTruthy();
        
        if (allTextIsReadable) {
          summaryData.textVisibilityTests.passed++;
        } else {
          summaryData.textVisibilityTests.failed++;
        }
        
        testResults.push(generateTestResult(
          `${viewportName} - Text is readable with proper styling`,
          allTextIsReadable,
          { 
            viewport: `${viewport.width}x${viewport.height}`,
            category: 'textVisibility',
            textReadabilityResults
          }
        ));
      });

      // 3. CARD SPACING FIXES TESTS
      test('3.1 should not have overlapping cards', async ({ page }) => {
        await page.setContent(createTestPageContent());
        await page.waitForSelector('.carousel-card', { timeout: 10000 });
        
        const cards = await page.$$('.carousel-card');
        expect(cards.length).toBeGreaterThan(0);
        
        let noOverlappingIssues = true;
        const spacingResults = [];
        
        // Check if cards overlap
        for (let i = 0; i < cards.length; i++) {
          const card = cards[i];
          const boundingBox = await card.boundingBox();
          
          if (boundingBox) {
            spacingResults.push({
              index: i,
              position: { x: boundingBox.x, y: boundingBox.y },
              size: { width: boundingBox.width, height: boundingBox.height }
            });
            
            // Check if this card overlaps with any previous card
            for (let j = 0; j < i; j++) {
              const prevCard = cards[j];
              const prevBoundingBox = await prevCard.boundingBox();
              
              if (prevBoundingBox) {
                const overlaps = !(
                  boundingBox.x + boundingBox.width <= prevBoundingBox.x ||
                  prevBoundingBox.x + prevBoundingBox.width <= boundingBox.x ||
                  boundingBox.y + boundingBox.height <= prevBoundingBox.y ||
                  prevBoundingBox.y + prevBoundingBox.height <= boundingBox.y
                );
                
                if (overlaps) {
                  noOverlappingIssues = false;
                }
              }
            }
          }
        }
        
        expect(noOverlappingIssues).toBeTruthy();
        
        if (noOverlappingIssues) {
          summaryData.cardSpacingTests.passed++;
        } else {
          summaryData.cardSpacingTests.failed++;
        }
        
        testResults.push(generateTestResult(
          `${viewportName} - No overlapping cards`,
          noOverlappingIssues,
          { 
            viewport: `${viewport.width}x${viewport.height}`,
            category: 'cardSpacing',
            spacingResults
          }
        ));
      });

      test('3.2 should have consistent spacing maintained across viewports', async ({ page }) => {
        await page.setContent(createTestPageContent());
        await page.waitForSelector('.carousel-list-enhanced', { timeout: 10000 });
        
        const carouselList = await page.$('.carousel-list-enhanced');
        const cards = await page.$$('.carousel-card');
        
        expect(carouselList).toBeTruthy();
        expect(cards.length).toBeGreaterThan(0);
        
        let consistentSpacing = true;
        const spacingConsistencyResults = [];
        
        // Check if cards have consistent spacing
        for (let i = 1; i < cards.length; i++) {
          const prevCard = cards[i-1];
          const currentCard = cards[i];
          
          const prevBoundingBox = await prevCard.boundingBox();
          const currentBoundingBox = await currentCard.boundingBox();
          
          if (prevBoundingBox && currentBoundingBox) {
            const gap = currentBoundingBox.x - (prevBoundingBox.x + prevBoundingBox.width);
            
            spacingConsistencyResults.push({
              prevCardIndex: i-1,
              currentCardIndex: i,
              gap
            });
            
            // Check if gap is reasonable (not negative and not too large)
            if (gap < 0 || gap > 50) {
              consistentSpacing = false;
            }
          }
        }
        
        expect(consistentSpacing).toBeTruthy();
        
        if (consistentSpacing) {
          summaryData.cardSpacingTests.passed++;
        } else {
          summaryData.cardSpacingTests.failed++;
        }
        
        testResults.push(generateTestResult(
          `${viewportName} - Consistent card spacing`,
          consistentSpacing,
          { 
            viewport: `${viewport.width}x${viewport.height}`,
            category: 'cardSpacing',
            spacingConsistencyResults
          }
        ));
      });

      // 4. IMAGE/VIDEO HANDLING TESTS
      test('4.1 should display images and videos with object-fit: cover', async ({ page }) => {
        await page.setContent(createTestPageContent());
        await page.waitForSelector('.video-element', { timeout: 10000 });
        
        const mediaElements = await page.$$('.video-element');
        expect(mediaElements.length).toBeGreaterThan(0);
        
        let allMediaHaveCorrectFit = true;
        const mediaFitResults = [];
        
        for (let i = 0; i < mediaElements.length; i++) {
          const element = mediaElements[i];
          const objectFit = await element.evaluate(el => getComputedStyle(el).objectFit);
          const tagName = await element.evaluate(el => el.tagName.toLowerCase());
          
          const hasCorrectFit = objectFit === 'cover';
          mediaFitResults.push({
            index: i,
            type: tagName,
            objectFit,
            hasCorrectFit
          });
          
          if (!hasCorrectFit) {
            allMediaHaveCorrectFit = false;
          }
        }
        
        expect(allMediaHaveCorrectFit).toBeTruthy();
        
        if (allMediaHaveCorrectFit) {
          summaryData.mediaHandlingTests.passed++;
        } else {
          summaryData.mediaHandlingTests.failed++;
        }
        
        testResults.push(generateTestResult(
          `${viewportName} - Media elements have object-fit: cover`,
          allMediaHaveCorrectFit,
          { 
            viewport: `${viewport.width}x${viewport.height}`,
            category: 'mediaHandling',
            mediaFitResults
          }
        ));
      });

      test('4.2 should prevent stretching or squishing of media content', async ({ page }) => {
        await page.setContent(createTestPageContent());
        await page.waitForSelector('.video-element', { timeout: 10000 });
        
        const mediaElements = await page.$$('.video-element');
        expect(mediaElements.length).toBeGreaterThan(0);
        
        let noStretchingOrSquishing = true;
        const mediaDistortionResults = [];
        
        for (let i = 0; i < mediaElements.length; i++) {
          const element = mediaElements[i];
          const tagName = await element.evaluate(el => el.tagName.toLowerCase());
          
          // Get the container and media element dimensions
          const container = await element.$('xpath=..');
          const containerBox = await container?.boundingBox();
          const mediaBox = await element.boundingBox();
          
          if (containerBox && mediaBox) {
            // Check if media covers the container completely
            const coversCompletely = 
              mediaBox.width >= containerBox.width && 
              mediaBox.height >= containerBox.height;
            
            // Check if media maintains aspect ratio (no stretching)
            const mediaAspectRatio = calculateAspectRatio(mediaBox.width, mediaBox.height);
            const containerAspectRatio = calculateAspectRatio(containerBox.width, containerBox.height);
            const aspectRatioDifference = Math.abs(mediaAspectRatio - containerAspectRatio);
            const maintainsAspectRatio = aspectRatioDifference < 0.1; // Allow small difference
            
            mediaDistortionResults.push({
              index: i,
              type: tagName,
              containerDimensions: { width: containerBox.width, height: containerBox.height },
              mediaDimensions: { width: mediaBox.width, height: mediaBox.height },
              coversCompletely,
              maintainsAspectRatio,
              aspectRatioDifference
            });
            
            if (!coversCompletely || !maintainsAspectRatio) {
              noStretchingOrSquishing = false;
            }
          }
        }
        
        expect(noStretchingOrSquishing).toBeTruthy();
        
        if (noStretchingOrSquishing) {
          summaryData.mediaHandlingTests.passed++;
        } else {
          summaryData.mediaHandlingTests.failed++;
        }
        
        testResults.push(generateTestResult(
          `${viewportName} - Media content not stretched or squished`,
          noStretchingOrSquishing,
          { 
            viewport: `${viewport.width}x${viewport.height}`,
            category: 'mediaHandling',
            mediaDistortionResults
          }
        ));
      });

      // 5. CAROUSEL FUNCTIONALITY TESTS
      test('5.1 should have working navigation arrows', async ({ page }) => {
        await page.setContent(createTestPageContent());
        await page.waitForSelector('#prev-btn, #next-btn', { timeout: 10000 });
        
        const prevBtn = await page.$('#prev-btn');
        const nextBtn = await page.$('#next-btn');
        
        expect(prevBtn).toBeTruthy();
        expect(nextBtn).toBeTruthy();
        
        let navigationWorking = true;
        const navigationResults = [];
        
        // Get initial transform value
        const initialTransform = await page.$eval('.carousel-list-enhanced', el => getComputedStyle(el).transform);
        
        // Click next button and check if transform changes
        await nextBtn.click();
        await page.waitForTimeout(1000); // Wait for transition
        
        const afterNextTransform = await page.$eval('.carousel-list-enhanced', el => getComputedStyle(el).transform);
        const nextBtnChangedTransform = initialTransform !== afterNextTransform;
        
        navigationResults.push({
          action: 'next button click',
          initialTransform,
          afterTransform: afterNextTransform,
          changed: nextBtnChangedTransform
        });
        
        if (!nextBtnChangedTransform) {
          navigationWorking = false;
        }
        
        // Click previous button and check if transform changes
        await prevBtn.click();
        await page.waitForTimeout(1000); // Wait for transition
        
        const afterPrevTransform = await page.$eval('.carousel-list-enhanced', el => getComputedStyle(el).transform);
        const prevBtnChangedTransform = afterNextTransform !== afterPrevTransform;
        
        navigationResults.push({
          action: 'previous button click',
          initialTransform: afterNextTransform,
          afterTransform: afterPrevTransform,
          changed: prevBtnChangedTransform
        });
        
        if (!prevBtnChangedTransform) {
          navigationWorking = false;
        }
        
        expect(navigationWorking).toBeTruthy();
        
        if (navigationWorking) {
          summaryData.carouselFunctionalityTests.passed++;
        } else {
          summaryData.carouselFunctionalityTests.failed++;
        }
        
        testResults.push(generateTestResult(
          `${viewportName} - Navigation arrows work correctly`,
          navigationWorking,
          { 
            viewport: `${viewport.width}x${viewport.height}`,
            category: 'carouselFunctionality',
            navigationResults
          }
        ));
      });

      test('5.2 should have smooth transitions between slides', async ({ page }) => {
        await page.setContent(createTestPageContent());
        await page.waitForSelector('.carousel-list-enhanced', { timeout: 10000 });
        
        const carouselList = await page.$('.carousel-list-enhanced');
        expect(carouselList).toBeTruthy();
        
        // Check if transition is applied
        const transitionValue = await carouselList.evaluate(el => getComputedStyle(el).transition);
        const hasTransition = transitionValue && transitionValue !== 'none' && transitionValue.includes('transform');
        
        // Test transition duration
        const transitionDuration = await carouselList.evaluate(el => getComputedStyle(el).transitionDuration);
        const hasReasonableDuration = transitionDuration && 
          (parseFloat(transitionDuration) >= 0.5 && parseFloat(transitionDuration) <= 2.0); // Between 0.5s and 2s
        
        const transitionsWorking = hasTransition && hasReasonableDuration;
        
        expect(transitionsWorking).toBeTruthy();
        
        if (transitionsWorking) {
          summaryData.carouselFunctionalityTests.passed++;
        } else {
          summaryData.carouselFunctionalityTests.failed++;
        }
        
        testResults.push(generateTestResult(
          `${viewportName} - Smooth transitions between slides`,
          transitionsWorking,
          { 
            viewport: `${viewport.width}x${viewport.height}`,
            category: 'carouselFunctionality',
            transitionValue,
            transitionDuration,
            hasTransition,
            hasReasonableDuration
          }
        ));
      });

      // 6. OVERALL VISUAL CONSISTENCY TESTS
      test('6.1 should have uniform appearance across all breakpoints', async ({ page }) => {
        await page.setContent(createTestPageContent());
        await page.waitForSelector('.carousel-card', { timeout: 10000 });
        
        const cards = await page.$$('.carousel-card');
        expect(cards.length).toBeGreaterThan(0);
        
        let uniformAppearance = true;
        const appearanceResults = [];
        
        // Check if all cards have the same styling
        for (let i = 0; i < cards.length; i++) {
          const card = cards[i];
          const styles = await card.evaluate(el => {
            const computedStyle = getComputedStyle(el);
            return {
              width: computedStyle.width,
              height: computedStyle.height,
              aspectRatio: computedStyle.aspectRatio,
              borderRadius: computedStyle.borderRadius,
              overflow: computedStyle.overflow,
              position: computedStyle.position
            };
          });
          
          appearanceResults.push({
            index: i,
            styles
          });
          
          // Check if styles are consistent
          if (i > 0) {
            const prevStyles = appearanceResults[i-1].styles;
            
            if (styles.aspectRatio !== prevStyles.aspectRatio ||
                styles.borderRadius !== prevStyles.borderRadius ||
                styles.overflow !== prevStyles.overflow ||
                styles.position !== prevStyles.position) {
              uniformAppearance = false;
            }
          }
        }
        
        expect(uniformAppearance).toBeTruthy();
        
        if (uniformAppearance) {
          summaryData.visualConsistencyTests.passed++;
        } else {
          summaryData.visualConsistencyTests.failed++;
        }
        
        testResults.push(generateTestResult(
          `${viewportName} - Uniform appearance across cards`,
          uniformAppearance,
          { 
            viewport: `${viewport.width}x${viewport.height}`,
            category: 'visualConsistency',
            appearanceResults
          }
        ));
      });

      test('6.2 should have no layout breaks or visual inconsistencies', async ({ page }) => {
        await page.setContent(createTestPageContent());
        await page.waitForSelector('#why-choose-us', { timeout: 10000 });
        
        // Check if the section is visible and properly positioned
        const section = await page.$('#why-choose-us');
        expect(section).toBeTruthy();
        
        const sectionVisible = await section.isVisible();
        expect(sectionVisible).toBeTruthy();
        
        // Check if cards are within viewport bounds
        const cards = await page.$$('.carousel-card');
        expect(cards.length).toBeGreaterThan(0);
        
        let noLayoutBreaks = true;
        const layoutResults = [];
        
        for (let i = 0; i < cards.length; i++) {
          const card = cards[i];
          const boundingBox = await card.boundingBox();
          
          if (boundingBox) {
            // Check if card is within reasonable bounds
            const withinBounds = 
              boundingBox.width > 0 && 
              boundingBox.height > 0 &&
              boundingBox.x >= -100 && // Allow some overflow for carousel
              boundingBox.y >= 0;
            
            layoutResults.push({
              index: i,
              position: { x: boundingBox.x, y: boundingBox.y },
              size: { width: boundingBox.width, height: boundingBox.height },
              withinBounds
            });
            
            if (!withinBounds) {
              noLayoutBreaks = false;
            }
          }
        }
        
        expect(noLayoutBreaks).toBeTruthy();
        
        if (noLayoutBreaks) {
          summaryData.visualConsistencyTests.passed++;
        } else {
          summaryData.visualConsistencyTests.failed++;
        }
        
        testResults.push(generateTestResult(
          `${viewportName} - No layout breaks or visual inconsistencies`,
          noLayoutBreaks,
          { 
            viewport: `${viewport.width}x${viewport.height}`,
            category: 'visualConsistency',
            layoutResults
          }
        ));
      });
    });
  });
});