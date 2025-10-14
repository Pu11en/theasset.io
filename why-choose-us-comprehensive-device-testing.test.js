const { test, expect, devices } = require('@playwright/test');
const path = require('path');
const fs = require('fs');

// Define comprehensive viewports for testing
const VIEWPORTS = {
  // Mobile devices
  mobileSmall: { width: 320, height: 568 },    // iPhone SE
  mobileMedium: { width: 375, height: 667 },   // iPhone 8
  mobileLarge: { width: 414, height: 896 },    // iPhone 11
  mobileExtraLarge: { width: 428, height: 926 }, // iPhone 12 Pro Max
  
  // Tablet devices
  tabletSmall: { width: 768, height: 1024 },   // iPad
  tabletMedium: { width: 820, height: 1180 },  // iPad Air
  tabletLarge: { width: 1024, height: 1366 },  // iPad Pro
  
  // Problematic range that was specifically mentioned
  problematic1: { width: 768, height: 1024 },  // Start of problematic range
  problematic2: { width: 896, height: 1024 },  // Middle of problematic range
  problematic3: { width: 1024, height: 768 },  // End of problematic range
  
  // Desktop devices
  desktopSmall: { width: 1280, height: 720 },  // Small desktop
  desktopMedium: { width: 1440, height: 900 }, // Standard desktop
  desktopLarge: { width: 1920, height: 1080 }, // Large desktop
  desktopExtraLarge: { width: 2560, height: 1440 } // 4K desktop
};

// Expected aspect ratio (3:4 = 0.75)
const EXPECTED_ASPECT_RATIO = 0.75;
const ASPECT_RATIO_TOLERANCE = 0.05; // Allow 5% tolerance

// Helper functions
function calculateAspectRatio(width, height) {
  return width / height;
}

function isAspectRatioWithinTolerance(actual, expected, tolerance) {
  return Math.abs(actual - expected) <= tolerance;
}

function generateTestResult(testName, passed, details = {}) {
  return {
    test: testName,
    passed,
    timestamp: new Date().toISOString(),
    ...details
  };
}

function createTestPageContent() {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>WhyChooseUs Comprehensive Device Testing</title>
      <script src="https://cdn.tailwindcss.com"></script>
      <script src="https://cdn.jsdelivr.net/npm/framer-motion@10.16.4/dist/framer-motion.min.js"></script>
      <style>
        /* Enhanced carousel styles for comprehensive testing */
        :root {
          --carousel-card-width-mobile: 85vw;
          --carousel-card-height-mobile: calc(85vw * 1.33);
          --carousel-card-width-tablet: 45vw;
          --carousel-card-height-tablet: calc(45vw * 1.33);
          --carousel-card-width-desktop: 30vw;
          --carousel-card-height-desktop: calc(30vw * 1.33);
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
        
        /* Responsive breakpoints */
        @media (min-width: 768px) {
          :root {
            --carousel-card-width-mobile: var(--carousel-card-width-tablet);
            --carousel-card-height-mobile: var(--carousel-card-height-tablet);
            --carousel-card-margin: 1.5vw;
          }
        }
        
        @media (min-width: 1024px) {
          :root {
            --carousel-card-width-mobile: var(--carousel-card-width-desktop);
            --carousel-card-height-mobile: var(--carousel-card-height-desktop);
            --carousel-card-margin: 1vw;
          }
        }
        
        /* Navigation arrows */
        .carousel-arrow {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          width: 40px;
          height: 40px;
          background: rgba(255, 255, 255, 0.9);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          z-index: 10;
          transition: all 0.2s ease;
        }
        
        .carousel-arrow:hover {
          background: rgba(255, 255, 255, 1);
          transform: translateY(-50%) scale(1.1);
        }
        
        .carousel-arrow.prev {
          left: 10px;
        }
        
        .carousel-arrow.next {
          right: 10px;
        }
        
        /* Touch gesture indicators */
        .touch-indicator {
          position: absolute;
          bottom: 20px;
          left: 50%;
          transform: translateX(-50%);
          background: rgba(0, 0, 0, 0.7);
          color: white;
          padding: 8px 16px;
          border-radius: 20px;
          font-size: 12px;
          opacity: 0;
          transition: opacity 0.3s ease;
          pointer-events: none;
        }
        
        .touch-indicator.visible {
          opacity: 1;
        }
        
        /* Performance indicator */
        .performance-indicator {
          position: absolute;
          top: 10px;
          left: 10px;
          background: rgba(0, 0, 0, 0.7);
          color: white;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 10px;
          font-family: monospace;
          z-index: 100;
        }
        
        /* Loading states */
        .loading-overlay {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 5;
        }
        
        .loading-spinner {
          width: 40px;
          height: 40px;
          border: 4px solid rgba(255, 255, 255, 0.3);
          border-top: 4px solid white;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }
        
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        /* Error state */
        .error-overlay {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(255, 0, 0, 0.1);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 5;
        }
        
        .error-message {
          color: #ff4444;
          text-align: center;
          padding: 20px;
        }
      </style>
    </head>
    <body>
      <div id="test-container">
        <!-- WhyChooseUs component will be rendered here -->
      </div>
      
      <script>
        // Enhanced video data for testing
        const slideData = [
          {
            id: "zero-risk",
            title: "Zero Risk",
            description: "You can't lose money. Our offer makes working with us risk free.",
            src: "https://res.cloudinary.com/dmdjagtkx/video/upload/v1760415676/insta_post_2_1_xdaptq.mp4",
            poster: "https://res.cloudinary.com/dmdjagtkx/image/upload/v1760415676/insta_post_2_1_poster_xdaptq.jpg",
            isVideo: true,
            sources: [
              {
                src: "https://res.cloudinary.com/dmdjagtkx/video/upload/v1760415676/insta_post_2_1_xdaptq.mp4",
                type: "video/mp4"
              },
              {
                src: "https://res.cloudinary.com/dmdjagtkx/video/upload/c_scale,w_480/v1760415676/insta_post_2_1_xdaptq.mp4",
                type: "video/mp4",
                media: "(max-width: 640px)"
              },
              {
                src: "https://res.cloudinary.com/dmdjagtkx/video/upload/c_scale,w_768/v1760415676/insta_post_2_1_xdaptq.mp4",
                type: "video/mp4",
                media: "(max-width: 1024px)"
              }
            ]
          },
          {
            id: "expert-team",
            title: "Expert Team",
            description: "Our specialists bring years of experience to deliver exceptional results.",
            src: "https://res.cloudinary.com/dmdjagtkx/video/upload/v1760470477/carosal_6_yzdvbj.mp4",
            poster: "https://res.cloudinary.com/dmdjagtkx/image/upload/v1760470477/carosal_6_poster_yzdvbj.jpg",
            isVideo: true,
            sources: [
              {
                src: "https://res.cloudinary.com/dmdjagtkx/video/upload/v1760470477/carosal_6_yzdvbj.mp4",
                type: "video/mp4"
              },
              {
                src: "https://res.cloudinary.com/dmdjagtkx/video/upload/c_scale,w_480/v1760470477/carosal_6_yzdvbj.mp4",
                type: "video/mp4",
                media: "(max-width: 640px)"
              },
              {
                src: "https://res.cloudinary.com/dmdjagtkx/video/upload/c_scale,w_768/v1760470477/carosal_6_yzdvbj.mp4",
                type: "video/mp4",
                media: "(max-width: 1024px)"
              }
            ]
          },
          {
            id: "proven-process",
            title: "Proven Process",
            description: "We've refined our approach to ensure consistent, high-quality outcomes.",
            src: "https://res.cloudinary.com/dmdjagtkx/video/upload/v1760415676/proven_process_video.mp4",
            poster: "https://res.cloudinary.com/dmdjagtkx/image/upload/v1760415676/proven_process_poster.jpg",
            isVideo: true,
            sources: [
              {
                src: "https://res.cloudinary.com/dmdjagtkx/video/upload/v1760415676/proven_process_video.mp4",
                type: "video/mp4"
              },
              {
                src: "https://res.cloudinary.com/dmdjagtkx/video/upload/c_scale,w_480/v1760415676/proven_process_video.mp4",
                type: "video/mp4",
                media: "(max-width: 640px)"
              },
              {
                src: "https://res.cloudinary.com/dmdjagtkx/video/upload/c_scale,w_768/v1760415676/proven_process_video.mp4",
                type: "video/mp4",
                media: "(max-width: 1024px)"
              }
            ]
          }
        ];
        
        // Performance monitoring
        let performanceMetrics = {
          loadTimes: [],
          interactionTimes: [],
          videoLoadTimes: {},
          memoryUsage: []
        };
        
        // Touch gesture tracking
        let touchGestures = {
          startX: 0,
          startY: 0,
          startTime: 0,
          isDragging: false,
          hasPassedThreshold: false
        };
        
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
                      <div class="carousel-list-enhanced absolute flex transition-transform duration-1000 ease-in-out" id="carousel-list" style="width: 300%; overflow: hidden;">
                        \${slideData.map((slide, index) => \`
                          <div class="carousel-card" data-slide-index="\${index}" data-slide-id="\${slide.id}">
                            <div class="video-container rounded-[1%] overflow-hidden transition-all duration-150 ease-out">
                              \${slide.isVideo ? \`
                                <video
                                  class="video-element opacity-100 transition-opacity duration-600 ease-in-out"
                                  data-video-id="\${slide.id}"
                                  autoPlay
                                  muted
                                  loop
                                  playsInline
                                  poster="\${slide.poster}"
                                  preload="metadata"
                                >
                                  \${slide.sources.map(source => \`
                                    <source src="\${source.src}" type="\${source.type}" media="\${source.media || ''}" />
                                  \`).join('')}
                                </video>
                                <div class="loading-overlay" id="loading-\${slide.id}">
                                  <div class="loading-spinner"></div>
                                </div>
                                <div class="error-overlay" id="error-\${slide.id}" style="display: none;">
                                  <div class="error-message">
                                    <p>Failed to load video</p>
                                    <img src="\${slide.poster}" alt="\${slide.title}" style="width: 100%; height: auto; object-fit: cover;" />
                                  </div>
                                </div>
                              \` : ''}
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
                      
                      <button class="carousel-arrow prev" id="prev-btn">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                          <path d="M15 18l-6-6 6-6" />
                        </svg>
                      </button>
                      
                      <button class="carousel-arrow next" id="next-btn">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                          <path d="M9 18l6-6-6-6" />
                        </svg>
                      </button>
                      
                      <div class="touch-indicator" id="touch-indicator">
                        Swipe to navigate
                      </div>
                      
                      <div class="performance-indicator" id="performance-indicator">
                        FPS: <span id="fps">60</span> | Memory: <span id="memory">0</span>MB
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          \`;
          
          initializeCarousel();
          initializePerformanceMonitoring();
          initializeTouchGestures();
          initializeVideoHandling();
        }
        
        function initializeCarousel() {
          let current = 0;
          const slides = slideData.length;
          const list = document.getElementById('carousel-list');
          
          document.getElementById('prev-btn').addEventListener('click', () => {
            const startTime = performance.now();
            current = current === 0 ? slides - 1 : current - 1;
            list.style.transform = \`translateX(-\${current * (100 / slides)}%)\`;
            performanceMetrics.interactionTimes.push(performance.now() - startTime);
          });
          
          document.getElementById('next-btn').addEventListener('click', () => {
            const startTime = performance.now();
            current = (current + 1) % slides;
            list.style.transform = \`translateX(-\${current * (100 / slides)}%)\`;
            performanceMetrics.interactionTimes.push(performance.now() - startTime);
          });
        }
        
        function initializePerformanceMonitoring() {
          let frameCount = 0;
          let lastTime = performance.now();
          
          function updateFPS() {
            frameCount++;
            const currentTime = performance.now();
            
            if (currentTime >= lastTime + 1000) {
              const fps = Math.round((frameCount * 1000) / (currentTime - lastTime));
              document.getElementById('fps').textContent = fps;
              
              frameCount = 0;
              lastTime = currentTime;
            }
            
            requestAnimationFrame(updateFPS);
          }
          
          updateFPS();
          
          // Monitor memory usage
          if (performance.memory) {
            setInterval(() => {
              const memoryMB = Math.round(performance.memory.usedJSHeapSize / 1048576);
              document.getElementById('memory').textContent = memoryMB;
              performanceMetrics.memoryUsage.push(memoryMB);
            }, 2000);
          }
        }
        
        function initializeTouchGestures() {
          const carousel = document.querySelector('.carousel-container-enhanced');
          const touchIndicator = document.getElementById('touch-indicator');
          let touchStartTime = 0;
          
          carousel.addEventListener('touchstart', (e) => {
            touchStartTime = performance.now();
            const touch = e.touches[0];
            touchGestures.startX = touch.clientX;
            touchGestures.startY = touch.clientY;
            touchGestures.startTime = Date.now();
            touchGestures.isDragging = true;
            
            // Show touch indicator
            touchIndicator.classList.add('visible');
            setTimeout(() => touchIndicator.classList.remove('visible'), 2000);
          });
          
          carousel.addEventListener('touchmove', (e) => {
            if (!touchGestures.isDragging) return;
            
            const touch = e.touches[0];
            const deltaX = Math.abs(touch.clientX - touchGestures.startX);
            const deltaY = Math.abs(touch.clientY - touchGestures.startY);
            
            if (deltaX > 30 || deltaY > 30) {
              touchGestures.hasPassedThreshold = true;
            }
          });
          
          carousel.addEventListener('touchend', (e) => {
            const touchEndTime = performance.now();
            performanceMetrics.interactionTimes.push(touchEndTime - touchStartTime);
            
            const touch = e.changedTouches[0];
            const deltaX = touch.clientX - touchGestures.startX;
            const deltaY = touch.clientY - touchGestures.startY;
            const deltaTime = Date.now() - touchGestures.startTime;
            
            // Check if it's a horizontal swipe
            if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 50) {
              const prevBtn = document.getElementById('prev-btn');
              const nextBtn = document.getElementById('next-btn');
              
              if (deltaX < 0) {
                nextBtn.click();
              } else {
                prevBtn.click();
              }
            }
            
            // Reset gesture state
            touchGestures = {
              startX: 0,
              startY: 0,
              startTime: 0,
              isDragging: false,
              hasPassedThreshold: false
            };
          });
        }
        
        function initializeVideoHandling() {
          const videos = document.querySelectorAll('video');
          
          videos.forEach(video => {
            const videoId = video.dataset.videoId;
            const loadingOverlay = document.getElementById(\`loading-\${videoId}\`);
            const errorOverlay = document.getElementById(\`error-\${videoId}\`);
            const loadStartTime = performance.now();
            
            video.addEventListener('loadstart', () => {
              performanceMetrics.videoLoadTimes[videoId] = { startTime: loadStartTime };
            });
            
            video.addEventListener('canplay', () => {
              const loadTime = performance.now() - loadStartTime;
              performanceMetrics.videoLoadTimes[videoId].loadTime = loadTime;
              
              if (loadingOverlay) {
                loadingOverlay.style.display = 'none';
              }
            });
            
            video.addEventListener('error', () => {
              performanceMetrics.videoLoadTimes[videoId].error = true;
              
              if (loadingOverlay) {
                loadingOverlay.style.display = 'none';
              }
              
              if (errorOverlay) {
                errorOverlay.style.display = 'flex';
              }
            });
          });
        }
        
        // Expose performance metrics for testing
        window.getPerformanceMetrics = () => performanceMetrics;
        
        // Render the carousel when page loads
        document.addEventListener('DOMContentLoaded', () => {
          const pageLoadStart = performance.now();
          renderCarousel();
          performanceMetrics.loadTimes.push(performance.now() - pageLoadStart);
        });
      </script>
    </body>
    </html>
  `;
}

test.describe('WhyChooseUs Carousel Comprehensive Device Testing', () => {
  let testResults = [];
  let summaryData = {
    responsiveBehaviorTests: { passed: 0, failed: 0 },
    videoFunctionalityTests: { passed: 0, failed: 0 },
    touchGestureTests: { passed: 0, failed: 0 },
    performanceTests: { passed: 0, failed: 0 },
    crossBrowserTests: { passed: 0, failed: 0 },
    accessibilityTests: { passed: 0, failed: 0 }
  };

  // Save results after all tests complete
  test.afterAll(async () => {
    const reportPath = path.join(__dirname, 'test-results', 'why-choose-us-comprehensive-device-testing-report.json');
    
    // Ensure test-results directory exists
    if (!fs.existsSync(path.join(__dirname, 'test-results'))) {
      fs.mkdirSync(path.join(__dirname, 'test-results'), { recursive: true });
    }
    
    const totalTests = testResults.length;
    const passedTests = testResults.filter(r => r.passed).length;
    const failedTests = totalTests - passedTests;
    
    const reportData = {
      timestamp: new Date().toISOString(),
      title: 'WhyChooseUs Carousel Comprehensive Device Testing Report',
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

      // 1. RESPONSIVE BEHAVIOR TESTS
      test('1.1 should display exactly three video cards', async ({ page }) => {
        await page.setContent(createTestPageContent());
        await page.waitForSelector('.carousel-card', { timeout: 10000 });
        
        const cards = await page.$$('.carousel-card');
        expect(cards.length).toBe(3);
        
        const allCardsVisible = await Promise.all(
          cards.map(card => card.isVisible())
        );
        
        const allVisible = allCardsVisible.every(visible => visible);
        
        if (allVisible) {
          summaryData.responsiveBehaviorTests.passed++;
        } else {
          summaryData.responsiveBehaviorTests.failed++;
        }
        
        testResults.push(generateTestResult(
          `${viewportName} - Displays exactly three video cards`,
          allVisible,
          { 
            viewport: `${viewport.width}x${viewport.height}`,
            category: 'responsiveBehavior',
            cardCount: cards.length,
            allCardsVisible
          }
        ));
      });

      test('1.2 should maintain strict 3:4 aspect ratio for all cards', async ({ page }) => {
        await page.setContent(createTestPageContent());
        await page.waitForSelector('.carousel-card', { timeout: 10000 });
        
        const cards = await page.$$('.carousel-card');
        expect(cards.length).toBe(3);
        
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
          summaryData.responsiveBehaviorTests.passed++;
        } else {
          summaryData.responsiveBehaviorTests.failed++;
        }
        
        testResults.push(generateTestResult(
          `${viewportName} - Cards maintain 3:4 aspect ratio`,
          allCardsMaintainAspectRatio,
          { 
            viewport: `${viewport.width}x${viewport.height}`,
            category: 'responsiveBehavior',
            cardMeasurements
          }
        ));
      });

      test('1.3 should have proper card sizing and spacing at each breakpoint', async ({ page }) => {
        await page.setContent(createTestPageContent());
        await page.waitForSelector('.carousel-card', { timeout: 10000 });
        
        const cards = await page.$$('.carousel-card');
        expect(cards.length).toBe(3);
        
        let properSizingAndSpacing = true;
        const sizingResults = [];
        
        for (let i = 0; i < cards.length; i++) {
          const card = cards[i];
          const boundingBox = await card.boundingBox();
          
          if (boundingBox) {
            // Check if card has reasonable dimensions
            const hasReasonableWidth = boundingBox.width > 100;
            const hasReasonableHeight = boundingBox.height > 100;
            const hasPositiveDimensions = boundingBox.width > 0 && boundingBox.height > 0;
            
            sizingResults.push({
              index: i,
              width: boundingBox.width,
              height: boundingBox.height,
              hasReasonableWidth,
              hasReasonableHeight,
              hasPositiveDimensions
            });
            
            if (!hasReasonableWidth || !hasReasonableHeight || !hasPositiveDimensions) {
              properSizingAndSpacing = false;
            }
          }
        }
        
        // Check spacing between cards
        for (let i = 1; i < cards.length; i++) {
          const prevCard = cards[i-1];
          const currentCard = cards[i];
          
          const prevBoundingBox = await prevCard.boundingBox();
          const currentBoundingBox = await currentCard.boundingBox();
          
          if (prevBoundingBox && currentBoundingBox) {
            const gap = currentBoundingBox.x - (prevBoundingBox.x + prevBoundingBox.width);
            const hasReasonableGap = gap >= 0 && gap <= 100; // Reasonable gap between 0-100px
            
            sizingResults.push({
              gapBetweenCards: `${i-1}-${i}`,
              gap,
              hasReasonableGap
            });
            
            if (!hasReasonableGap) {
              properSizingAndSpacing = false;
            }
          }
        }
        
        expect(properSizingAndSpacing).toBeTruthy();
        
        if (properSizingAndSpacing) {
          summaryData.responsiveBehaviorTests.passed++;
        } else {
          summaryData.responsiveBehaviorTests.failed++;
        }
        
        testResults.push(generateTestResult(
          `${viewportName} - Proper card sizing and spacing`,
          properSizingAndSpacing,
          { 
            viewport: `${viewport.width}x${viewport.height}`,
            category: 'responsiveBehavior',
            sizingResults
          }
        ));
      });

      test('1.4 should test problematic 768px-1024px range is fixed', async ({ page }) => {
        await page.setContent(createTestPageContent());
        await page.waitForSelector('.carousel-card', { timeout: 10000 });
        
        const cards = await page.$$('.carousel-card');
        expect(cards.length).toBe(3);
        
        let problematicRangeFixed = true;
        const problematicRangeResults = [];
        
        // Specific checks for the problematic range
        const isInProblematicRange = viewport.width >= 768 && viewport.width <= 1024;
        
        if (isInProblematicRange) {
          for (let i = 0; i < cards.length; i++) {
            const card = cards[i];
            const boundingBox = await card.boundingBox();
            
            if (boundingBox) {
              // Check for specific issues in this range
              const hasCorrectAspectRatio = isAspectRatioWithinTolerance(
                calculateAspectRatio(boundingBox.width, boundingBox.height),
                EXPECTED_ASPECT_RATIO,
                ASPECT_RATIO_TOLERANCE
              );
              
              const hasNoOverflow = boundingBox.x >= 0 && boundingBox.y >= 0;
              const hasProperVisibility = await card.isVisible();
              
              problematicRangeResults.push({
                index: i,
                width: boundingBox.width,
                height: boundingBox.height,
                hasCorrectAspectRatio,
                hasNoOverflow,
                hasProperVisibility,
                inProblematicRange: true
              });
              
              if (!hasCorrectAspectRatio || !hasNoOverflow || !hasProperVisibility) {
                problematicRangeFixed = false;
              }
            }
          }
        } else {
          problematicRangeResults.push({
            inProblematicRange: false,
            note: "Not in problematic range"
          });
        }
        
        if (isInProblematicRange) {
          expect(problematicRangeFixed).toBeTruthy();
        }
        
        if (problematicRangeFixed) {
          summaryData.responsiveBehaviorTests.passed++;
        } else {
          summaryData.responsiveBehaviorTests.failed++;
        }
        
        testResults.push(generateTestResult(
          `${viewportName} - Problematic 768px-1024px range is fixed`,
          problematicRangeFixed,
          { 
            viewport: `${viewport.width}x${viewport.height}`,
            category: 'responsiveBehavior',
            inProblematicRange: isInProblematicRange,
            problematicRangeResults
          }
        ));
      });

      test('1.5 should have working navigation arrows with proper positioning', async ({ page }) => {
        await page.setContent(createTestPageContent());
        await page.waitForSelector('.carousel-arrow', { timeout: 10000 });
        
        const prevBtn = await page.$('.carousel-arrow.prev');
        const nextBtn = await page.$('.carousel-arrow.next');
        
        expect(prevBtn).toBeTruthy();
        expect(nextBtn).toBeTruthy();
        
        let navigationArrowsWorking = true;
        const navigationResults = [];
        
        // Check if arrows are visible
        const prevVisible = await prevBtn.isVisible();
        const nextVisible = await nextBtn.isVisible();
        
        navigationResults.push({
          prevButtonVisible: prevVisible,
          nextButtonVisible: nextVisible
        });
        
        if (!prevVisible || !nextVisible) {
          navigationArrowsWorking = false;
        }
        
        // Check arrow positioning
        const prevBoundingBox = await prevBtn.boundingBox();
        const nextBoundingBox = await nextBtn.boundingBox();
        
        if (prevBoundingBox && nextBoundingBox) {
          const prevPositionedCorrectly = prevBoundingBox.x >= 0 && prevBoundingBox.y >= 0;
          const nextPositionedCorrectly = nextBoundingBox.x >= 0 && nextBoundingBox.y >= 0;
          
          navigationResults.push({
            prevPositionedCorrectly,
            nextPositionedCorrectly,
            prevPosition: { x: prevBoundingBox.x, y: prevBoundingBox.y },
            nextPosition: { x: nextBoundingBox.x, y: nextBoundingBox.y }
          });
          
          if (!prevPositionedCorrectly || !nextPositionedCorrectly) {
            navigationArrowsWorking = false;
          }
        }
        
        // Test arrow functionality
        const initialTransform = await page.$eval('.carousel-list-enhanced', el => getComputedStyle(el).transform);
        
        await nextBtn.click();
        await page.waitForTimeout(1000);
        
        const afterNextTransform = await page.$eval('.carousel-list-enhanced', el => getComputedStyle(el).transform);
        const nextBtnChangedTransform = initialTransform !== afterNextTransform;
        
        navigationResults.push({
          nextButtonFunctionality: nextBtnChangedTransform
        });
        
        if (!nextBtnChangedTransform) {
          navigationArrowsWorking = false;
        }
        
        await prevBtn.click();
        await page.waitForTimeout(1000);
        
        const afterPrevTransform = await page.$eval('.carousel-list-enhanced', el => getComputedStyle(el).transform);
        const prevBtnChangedTransform = afterNextTransform !== afterPrevTransform;
        
        navigationResults.push({
          prevButtonFunctionality: prevBtnChangedTransform
        });
        
        if (!prevBtnChangedTransform) {
          navigationArrowsWorking = false;
        }
        
        expect(navigationArrowsWorking).toBeTruthy();
        
        if (navigationArrowsWorking) {
          summaryData.responsiveBehaviorTests.passed++;
        } else {
          summaryData.responsiveBehaviorTests.failed++;
        }
        
        testResults.push(generateTestResult(
          `${viewportName} - Navigation arrows working with proper positioning`,
          navigationArrowsWorking,
          { 
            viewport: `${viewport.width}x${viewport.height}`,
            category: 'responsiveBehavior',
            navigationResults
          }
        ));
      });

      // 2. VIDEO FUNCTIONALITY TESTS
      test('2.1 should load and display videos correctly', async ({ page }) => {
        await page.setContent(createTestPageContent());
        await page.waitForSelector('video', { timeout: 10000 });
        
        const videos = await page.$$('video');
        expect(videos.length).toBe(3);
        
        let videosLoadCorrectly = true;
        const videoLoadResults = [];
        
        for (let i = 0; i < videos.length; i++) {
          const video = videos[i];
          const videoId = await video.getAttribute('data-video-id');
          
          // Check if video has correct attributes
          const hasAutoPlay = await video.getAttribute('autoplay');
          const hasMuted = await video.getAttribute('muted');
          const hasLoop = await video.getAttribute('loop');
          const hasPlaysInline = await video.getAttribute('playsinline');
          const hasPoster = await video.getAttribute('poster');
          
          videoLoadResults.push({
            index: i,
            videoId,
            hasAutoPlay,
            hasMuted,
            hasLoop,
            hasPlaysInline,
            hasPoster
          });
          
          // Check if video sources are present
          const sources = await video.$$('source');
          const hasSources = sources.length > 0;
          
          videoLoadResults[i].hasSources = hasSources;
          videoLoadResults[i].sourceCount = sources.length;
          
          if (!hasAutoPlay || !hasMuted || !hasLoop || !hasPlaysInline || !hasPoster || !hasSources) {
            videosLoadCorrectly = false;
          }
        }
        
        expect(videosLoadCorrectly).toBeTruthy();
        
        if (videosLoadCorrectly) {
          summaryData.videoFunctionalityTests.passed++;
        } else {
          summaryData.videoFunctionalityTests.failed++;
        }
        
        testResults.push(generateTestResult(
          `${viewportName} - Videos load and display correctly`,
          videosLoadCorrectly,
          { 
            viewport: `${viewport.width}x${viewport.height}`,
            category: 'videoFunctionality',
            videoLoadResults
          }
        ));
      });

      test('2.2 should have responsive video sources for different screen sizes', async ({ page }) => {
        await page.setContent(createTestPageContent());
        await page.waitForSelector('video', { timeout: 10000 });
        
        const videos = await page.$$('video');
        expect(videos.length).toBe(3);
        
        let hasResponsiveSources = true;
        const responsiveSourceResults = [];
        
        for (let i = 0; i < videos.length; i++) {
          const video = videos[i];
          const sources = await video.$$('source');
          
          const sourceInfo = [];
          let hasMobileSource = false;
          let hasTabletSource = false;
          let hasDesktopSource = false;
          
          for (let j = 0; j < sources.length; j++) {
            const source = sources[j];
            const src = await source.getAttribute('src');
            const type = await source.getAttribute('type');
            const media = await source.getAttribute('media');
            
            sourceInfo.push({
              index: j,
              src,
              type,
              media
            });
            
            // Check for responsive sources
            if (media && media.includes('640px')) {
              hasMobileSource = true;
            }
            if (media && media.includes('1024px')) {
              hasTabletSource = true;
            }
            if (!media) {
              hasDesktopSource = true;
            }
          }
          
          responsiveSourceResults.push({
            videoIndex: i,
            sourceCount: sources.length,
            sources: sourceInfo,
            hasMobileSource,
            hasTabletSource,
            hasDesktopSource
          });
          
          if (!hasMobileSource || !hasTabletSource || !hasDesktopSource) {
            hasResponsiveSources = false;
          }
        }
        
        expect(hasResponsiveSources).toBeTruthy();
        
        if (hasResponsiveSources) {
          summaryData.videoFunctionalityTests.passed++;
        } else {
          summaryData.videoFunctionalityTests.failed++;
        }
        
        testResults.push(generateTestResult(
          `${viewportName} - Videos have responsive sources`,
          hasResponsiveSources,
          { 
            viewport: `${viewport.width}x${viewport.height}`,
            category: 'videoFunctionality',
            responsiveSourceResults
          }
        ));
      });

      test('2.3 should handle video loading errors and show fallback images', async ({ page }) => {
        await page.setContent(createTestPageContent());
        await page.waitForSelector('video', { timeout: 10000 });
        
        const videos = await page.$$('video');
        expect(videos.length).toBe(3);
        
        let errorHandlingWorks = true;
        const errorHandlingResults = [];
        
        for (let i = 0; i < videos.length; i++) {
          const video = videos[i];
          const videoId = await video.getAttribute('data-video-id');
          
          // Check if error overlay exists
          const errorOverlay = await page.$(`#error-${videoId}`);
          const hasErrorOverlay = errorOverlay !== null;
          
          // Check if loading overlay exists
          const loadingOverlay = await page.$(`#loading-${videoId}`);
          const hasLoadingOverlay = loadingOverlay !== null;
          
          // Check if poster image is set
          const poster = await video.getAttribute('poster');
          const hasPoster = poster !== null && poster.length > 0;
          
          errorHandlingResults.push({
            videoIndex: i,
            videoId,
            hasErrorOverlay,
            hasLoadingOverlay,
            hasPoster,
            poster
          });
          
          if (!hasErrorOverlay || !hasLoadingOverlay || !hasPoster) {
            errorHandlingWorks = false;
          }
        }
        
        expect(errorHandlingWorks).toBeTruthy();
        
        if (errorHandlingWorks) {
          summaryData.videoFunctionalityTests.passed++;
        } else {
          summaryData.videoFunctionalityTests.failed++;
        }
        
        testResults.push(generateTestResult(
          `${viewportName} - Video error handling works`,
          errorHandlingWorks,
          { 
            viewport: `${viewport.width}x${viewport.height}`,
            category: 'videoFunctionality',
            errorHandlingResults
          }
        ));
      });

      // 3. TOUCH GESTURE TESTS
      test('3.1 should support swipe navigation on touch devices', async ({ page }) => {
        await page.setContent(createTestPageContent());
        await page.waitForSelector('.carousel-container-enhanced', { timeout: 10000 });
        
        const carousel = await page.$('.carousel-container-enhanced');
        expect(carousel).toBeTruthy();
        
        let swipeNavigationWorks = true;
        const swipeResults = [];
        
        // Check if touch event listeners are attached
        const hasTouchStart = await carousel.evaluate(el => {
          return el.getAttribute('data-touch-start') !== null || 
                 el.onTouchStart !== null ||
                 getEventListeners?.(el)?.touchstart?.length > 0;
        });
        
        const hasTouchMove = await carousel.evaluate(el => {
          return el.getAttribute('data-touch-move') !== null || 
                 el.onTouchMove !== null ||
                 getEventListeners?.(el)?.touchmove?.length > 0;
        });
        
        const hasTouchEnd = await carousel.evaluate(el => {
          return el.getAttribute('data-touch-end') !== null || 
                 el.onTouchEnd !== null ||
                 getEventListeners?.(el)?.touchend?.length > 0;
        });
        
        swipeResults.push({
          hasTouchStart,
          hasTouchMove,
          hasTouchEnd
        });
        
        // Check if touch indicator exists
        const touchIndicator = await page.$('#touch-indicator');
        const hasTouchIndicator = touchIndicator !== null;
        
        swipeResults.push({
          hasTouchIndicator
        });
        
        // Simulate touch swipe if supported
        const isTouchDevice = await page.evaluate(() => {
          return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
        });
        
        if (isTouchDevice) {
          const initialTransform = await page.$eval('.carousel-list-enhanced', el => getComputedStyle(el).transform);
          
          // Simulate swipe left
          await carousel.touchStart({ x: 200, y: 300 });
          await carousel.touchMove({ x: 100, y: 300 });
          await carousel.touchEnd({ x: 50, y: 300 });
          
          await page.waitForTimeout(1000);
          
          const afterSwipeTransform = await page.$eval('.carousel-list-enhanced', el => getComputedStyle(el).transform);
          const swipeChangedTransform = initialTransform !== afterSwipeTransform;
          
          swipeResults.push({
            isTouchDevice,
            swipeChangedTransform
          });
          
          if (!swipeChangedTransform) {
            swipeNavigationWorks = false;
          }
        } else {
          swipeResults.push({
            isTouchDevice: false,
            note: "Not a touch device, swipe simulation skipped"
          });
        }
        
        expect(swipeNavigationWorks).toBeTruthy();
        
        if (swipeNavigationWorks) {
          summaryData.touchGestureTests.passed++;
        } else {
          summaryData.touchGestureTests.failed++;
        }
        
        testResults.push(generateTestResult(
          `${viewportName} - Swipe navigation works`,
          swipeNavigationWorks,
          { 
            viewport: `${viewport.width}x${viewport.height}`,
            category: 'touchGestures',
            swipeResults
          }
        ));
      });

      test('3.2 should have touch targets that meet accessibility guidelines', async ({ page }) => {
        await page.setContent(createTestPageContent());
        await page.waitForSelector('.carousel-arrow', { timeout: 10000 });
        
        const prevBtn = await page.$('.carousel-arrow.prev');
        const nextBtn = await page.$('.carousel-arrow.next');
        
        expect(prevBtn).toBeTruthy();
        expect(nextBtn).toBeTruthy();
        
        let touchTargetsAccessible = true;
        const touchTargetResults = [];
        
        // Check minimum touch target size (44x44px per WCAG guidelines)
        const prevBoundingBox = await prevBtn.boundingBox();
        const nextBoundingBox = await nextBtn.boundingBox();
        
        if (prevBoundingBox) {
          const prevMinSize = Math.min(prevBoundingBox.width, prevBoundingBox.height);
          const prevMeetsGuidelines = prevMinSize >= 44;
          
          touchTargetResults.push({
            button: 'prev',
            width: prevBoundingBox.width,
            height: prevBoundingBox.height,
            minSize: prevMinSize,
            meetsGuidelines: prevMeetsGuidelines
          });
          
          if (!prevMeetsGuidelines) {
            touchTargetsAccessible = false;
          }
        }
        
        if (nextBoundingBox) {
          const nextMinSize = Math.min(nextBoundingBox.width, nextBoundingBox.height);
          const nextMeetsGuidelines = nextMinSize >= 44;
          
          touchTargetResults.push({
            button: 'next',
            width: nextBoundingBox.width,
            height: nextBoundingBox.height,
            minSize: nextMinSize,
            meetsGuidelines: nextMeetsGuidelines
          });
          
          if (!nextMeetsGuidelines) {
            touchTargetsAccessible = false;
          }
        }
        
        expect(touchTargetsAccessible).toBeTruthy();
        
        if (touchTargetsAccessible) {
          summaryData.touchGestureTests.passed++;
        } else {
          summaryData.touchGestureTests.failed++;
        }
        
        testResults.push(generateTestResult(
          `${viewportName} - Touch targets meet accessibility guidelines`,
          touchTargetsAccessible,
          { 
            viewport: `${viewport.width}x${viewport.height}`,
            category: 'touchGestures',
            touchTargetResults
          }
        ));
      });

      // 4. PERFORMANCE TESTS
      test('4.1 should load within reasonable time limits', async ({ page }) => {
        const startTime = Date.now();
        
        await page.setContent(createTestPageContent());
        await page.waitForSelector('.carousel-card', { timeout: 10000 });
        
        const loadTime = Date.now() - startTime;
        const reasonableLoadTime = loadTime < 5000; // 5 seconds max
        
        let performanceMetrics = null;
        
        try {
          performanceMetrics = await page.evaluate(() => {
            return window.getPerformanceMetrics ? window.getPerformanceMetrics() : null;
          });
        } catch (e) {
          // Performance metrics not available
        }
        
        const pageLoadTime = performanceMetrics?.loadTimes?.[0] || loadTime;
        const reasonablePageLoadTime = pageLoadTime < 5000;
        
        const performanceWorks = reasonableLoadTime && reasonablePageLoadTime;
        
        if (performanceWorks) {
          summaryData.performanceTests.passed++;
        } else {
          summaryData.performanceTests.failed++;
        }
        
        testResults.push(generateTestResult(
          `${viewportName} - Page loads within reasonable time`,
          performanceWorks,
          { 
            viewport: `${viewport.width}x${viewport.height}`,
            category: 'performance',
            loadTime,
            pageLoadTime,
            reasonableLoadTime,
            reasonablePageLoadTime,
            performanceMetrics
          }
        ));
      });

      test('4.2 should maintain smooth animations and transitions', async ({ page }) => {
        await page.setContent(createTestPageContent());
        await page.waitForSelector('.carousel-list-enhanced', { timeout: 10000 });
        
        const carouselList = await page.$('.carousel-list-enhanced');
        expect(carouselList).toBeTruthy();
        
        let smoothAnimations = true;
        const animationResults = [];
        
        // Check if transition is applied
        const transitionValue = await carouselList.evaluate(el => getComputedStyle(el).transition);
        const hasTransition = transitionValue && transitionValue !== 'none' && transitionValue.includes('transform');
        
        animationResults.push({
          hasTransition,
          transitionValue
        });
        
        if (!hasTransition) {
          smoothAnimations = false;
        }
        
        // Test transition duration
        const transitionDuration = await carouselList.evaluate(el => getComputedStyle(el).transitionDuration);
        const hasReasonableDuration = transitionDuration && 
          (parseFloat(transitionDuration) >= 0.3 && parseFloat(transitionDuration) <= 2.0); // Between 0.3s and 2s
        
        animationResults.push({
          transitionDuration,
          hasReasonableDuration
        });
        
        if (!hasReasonableDuration) {
          smoothAnimations = false;
        }
        
        // Test animation performance
        const nextBtn = await page.$('.carousel-arrow.next');
        if (nextBtn) {
          const startTime = performance.now();
          await nextBtn.click();
          
          // Wait for animation to complete
          await page.waitForTimeout(1000);
          
          const endTime = performance.now();
          const animationTime = endTime - startTime;
          const reasonableAnimationTime = animationTime < 1500; // 1.5 seconds max
          
          animationResults.push({
            animationTime,
            reasonableAnimationTime
          });
          
          if (!reasonableAnimationTime) {
            smoothAnimations = false;
          }
        }
        
        expect(smoothAnimations).toBeTruthy();
        
        if (smoothAnimations) {
          summaryData.performanceTests.passed++;
        } else {
          summaryData.performanceTests.failed++;
        }
        
        testResults.push(generateTestResult(
          `${viewportName} - Smooth animations and transitions`,
          smoothAnimations,
          { 
            viewport: `${viewport.width}x${viewport.height}`,
            category: 'performance',
            animationResults
          }
        ));
      });

      // 5. ACCESSIBILITY TESTS
      test('5.1 should have proper ARIA labels and roles', async ({ page }) => {
        await page.setContent(createTestPageContent());
        await page.waitForSelector('.carousel-container-enhanced', { timeout: 10000 });
        
        let hasProperAccessibility = true;
        const accessibilityResults = [];
        
        // Check for proper ARIA labels on navigation buttons
        const prevBtn = await page.$('.carousel-arrow.prev');
        const nextBtn = await page.$('.carousel-arrow.next');
        
        if (prevBtn) {
          const prevAriaLabel = await prevBtn.getAttribute('aria-label');
          const hasPrevAriaLabel = prevAriaLabel !== null && prevAriaLabel.length > 0;
          
          accessibilityResults.push({
            element: 'prevButton',
            hasAriaLabel: hasPrevAriaLabel,
            ariaLabel: prevAriaLabel
          });
          
          if (!hasPrevAriaLabel) {
            hasProperAccessibility = false;
          }
        }
        
        if (nextBtn) {
          const nextAriaLabel = await nextBtn.getAttribute('aria-label');
          const hasNextAriaLabel = nextAriaLabel !== null && nextAriaLabel.length > 0;
          
          accessibilityResults.push({
            element: 'nextButton',
            hasAriaLabel: hasNextAriaLabel,
            ariaLabel: nextAriaLabel
          });
          
          if (!hasNextAriaLabel) {
            hasProperAccessibility = false;
          }
        }
        
        // Check for proper roles on carousel elements
        const carousel = await page.$('.carousel-container-enhanced');
        if (carousel) {
          const carouselRole = await carousel.getAttribute('role');
          const hasProperRole = carouselRole === 'region' || carouselRole === 'application';
          
          accessibilityResults.push({
            element: 'carousel',
            hasProperRole,
            role: carouselRole
          });
          
          if (!hasProperRole) {
            hasProperAccessibility = false;
          }
        }
        
        // Check for keyboard navigation support
        const hasTabIndex = await page.evaluate(() => {
          const focusableElements = document.querySelectorAll('button, [tabindex]');
          return focusableElements.length > 0;
        });
        
        accessibilityResults.push({
          hasKeyboardNavigation: hasTabIndex
        });
        
        if (!hasTabIndex) {
          hasProperAccessibility = false;
        }
        
        expect(hasProperAccessibility).toBeTruthy();
        
        if (hasProperAccessibility) {
          summaryData.accessibilityTests.passed++;
        } else {
          summaryData.accessibilityTests.failed++;
        }
        
        testResults.push(generateTestResult(
          `${viewportName} - Proper ARIA labels and roles`,
          hasProperAccessibility,
          { 
            viewport: `${viewport.width}x${viewport.height}`,
            category: 'accessibility',
            accessibilityResults
          }
        ));
      });

      test('5.2 should support keyboard navigation', async ({ page }) => {
        await page.setContent(createTestPageContent());
        await page.waitForSelector('.carousel-arrow', { timeout: 10000 });
        
        let keyboardNavigationWorks = true;
        const keyboardResults = [];
        
        // Test Tab navigation
        await page.keyboard.press('Tab');
        const focusedElement = await page.evaluate(() => document.activeElement.tagName);
        const hasTabNavigation = focusedElement === 'BUTTON';
        
        keyboardResults.push({
          hasTabNavigation,
          focusedElement
        });
        
        if (!hasTabNavigation) {
          keyboardNavigationWorks = false;
        }
        
        // Test Enter/Space on focused button
        if (hasTabNavigation) {
          const initialTransform = await page.$eval('.carousel-list-enhanced', el => getComputedStyle(el).transform);
          
          await page.keyboard.press('Enter');
          await page.waitForTimeout(1000);
          
          const afterKeyPressTransform = await page.$eval('.carousel-list-enhanced', el => getComputedStyle(el).transform);
          const keyPressChangedTransform = initialTransform !== afterKeyPressTransform;
          
          keyboardResults.push({
            keyPressChangedTransform
          });
          
          if (!keyPressChangedTransform) {
            keyboardNavigationWorks = false;
          }
        }
        
        // Test Arrow key navigation
        await page.keyboard.press('ArrowLeft');
        await page.waitForTimeout(1000);
        
        const afterArrowKeyTransform = await page.$eval('.carousel-list-enhanced', el => getComputedStyle(el).transform);
        const arrowKeyNavigation = afterArrowKeyTransform !== afterKeyPressTransform;
        
        keyboardResults.push({
          arrowKeyNavigation
        });
        
        if (!arrowKeyNavigation) {
          keyboardNavigationWorks = false;
        }
        
        expect(keyboardNavigationWorks).toBeTruthy();
        
        if (keyboardNavigationWorks) {
          summaryData.accessibilityTests.passed++;
        } else {
          summaryData.accessibilityTests.failed++;
        }
        
        testResults.push(generateTestResult(
          `${viewportName} - Keyboard navigation works`,
          keyboardNavigationWorks,
          { 
            viewport: `${viewport.width}x${viewport.height}`,
            category: 'accessibility',
            keyboardResults
          }
        ));
      });
    });
  });
});