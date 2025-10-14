/**
 * Specialized Video Testing for Solutions Component
 * Tests video loading, playback, and performance specifically
 */

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

// Test configuration
const BASE_URL = 'http://localhost:3001';
const TEST_RESULTS_DIR = './test-results';
const REPORT_FILE = path.join(TEST_RESULTS_DIR, 'solutions-video-test-report.json');

// Video URLs
const DESKTOP_VIDEO_URL = 'https://res.cloudinary.com/dmdjagtkx/video/upload/v1760405896/social_defipullen_A_continuation-style_digital_background_designed_f_7bbfc11b-e450-4abc-910a-6eef28babf6a_0_xzhdrv.mp4';
const MOBILE_VIDEO_URL = 'https://res.cloudinary.com/dmdjagtkx/video/upload/v1760406410/social_defipullen_A_continuation-style_digital_background_designed_f_dc49c4c4-ced0-4a1e-a218-7245167285e8_0_xqzwmw.mp4';

// Initialize test results
const testResults = {
  timestamp: new Date().toISOString(),
  tests: {
    videoLoading: { passed: 0, failed: 0, details: [] },
    videoPlayback: { passed: 0, failed: 0, details: [] },
    videoPerformance: { passed: 0, failed: 0, details: [] },
    videoOptimization: { passed: 0, failed: 0, details: [] }
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

// Main test function
async function runVideoTests() {
  console.log('🎥 Starting Solutions Component Video Tests...\n');
  
  const browser = await chromium.launch({ headless: false }); // Use non-headless for better video testing
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
    
    // Run video tests for different viewports
    await testDesktopVideo(page);
    await testMobileVideo(page);
    await testVideoPerformance(page);
    await testVideoOptimization(page);
    
  } catch (error) {
    console.error('Error during video testing:', error);
  } finally {
    await browser.close();
  }
  
  // Save test results
  fs.writeFileSync(REPORT_FILE, JSON.stringify(testResults, null, 2));
  
  // Print summary
  console.log('\n📊 Video Test Summary:');
  console.log(`✅ Passed: ${testResults.summary.totalPassed}`);
  console.log(`❌ Failed: ${testResults.summary.totalFailed}`);
  console.log(`📄 Detailed report saved to: ${REPORT_FILE}`);
  
  return testResults;
}

// Test Desktop Video
async function testDesktopVideo(page) {
  console.log('🖥️  Testing desktop video...');
  
  try {
    // Set desktop viewport
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.waitForTimeout(1000);
    
    // Test 1: Check desktop video element exists
    const desktopVideo = await page.locator('#solutions video.hidden.lg\\:block');
    const videoExists = await desktopVideo.count();
    recordTest('videoLoading', 'Desktop video element exists', videoExists > 0,
      `Desktop video elements found: ${videoExists}`);
    
    if (videoExists > 0) {
      // Test 2: Check video source URL
      const sourceElement = desktopVideo.locator('source');
      const sourceUrl = await sourceElement.getAttribute('src');
      const urlCorrect = sourceUrl === DESKTOP_VIDEO_URL;
      recordTest('videoLoading', 'Desktop video URL correct', urlCorrect,
        `Expected: ${DESKTOP_VIDEO_URL.substring(0, 50)}..., Got: ${sourceUrl ? sourceUrl.substring(0, 50) + '...' : 'null'}`);
      
      // Test 3: Check video attributes
      const hasAutoplay = await desktopVideo.getAttribute('autoplay');
      const hasMuted = await desktopVideo.getAttribute('muted');
      const hasLoop = await desktopVideo.getAttribute('loop');
      const hasPlaysInline = await desktopVideo.getAttribute('playsinline');
      const hasPreload = await desktopVideo.getAttribute('preload');
      
      const attributesCorrect = hasAutoplay && hasMuted && hasLoop && hasPlaysInline && hasPreload === 'metadata';
      recordTest('videoLoading', 'Desktop video attributes correct', attributesCorrect,
        `Autoplay: ${hasAutoplay}, Muted: ${hasMuted}, Loop: ${hasLoop}, PlaysInline: ${hasPlaysInline}, Preload: ${hasPreload}`);
      
      // Test 4: Check video loading state
      const videoState = await page.evaluate(() => {
        const video = document.querySelector('#solutions video.hidden.lg\\:block');
        if (!video) return 'not-found';
        if (video.readyState >= 2) return 'loaded';
        if (video.error) return `error: ${video.error.message}`;
        return 'loading';
      });
      
      const videoLoaded = videoState === 'loaded';
      recordTest('videoLoading', 'Desktop video loaded', videoLoaded,
        `Video state: ${videoState}`);
      
      // Test 5: Test video playback
      if (videoLoaded) {
        // Wait a bit more for video to potentially start playing
        await page.waitForTimeout(3000);
        
        const isPlaying = await page.evaluate(() => {
          const video = document.querySelector('#solutions video.hidden.lg\\:block');
          return video && !video.paused && !video.ended && video.readyState >= 2;
        });
        
        recordTest('videoPlayback', 'Desktop video playing', isPlaying,
          isPlaying ? 'Video is playing' : 'Video is not playing');
      }
      
      // Test 6: Check video dimensions
      const videoDimensions = await page.evaluate(() => {
        const video = document.querySelector('#solutions video.hidden.lg\\:block');
        if (!video) return null;
        return {
          width: video.videoWidth,
          height: video.videoHeight,
          displayWidth: video.offsetWidth,
          displayHeight: video.offsetHeight
        };
      });
      
      const hasValidDimensions = videoDimensions && videoDimensions.width > 0 && videoDimensions.height > 0;
      recordTest('videoLoading', 'Desktop video has valid dimensions', hasValidDimensions,
        hasValidDimensions ? `Dimensions: ${videoDimensions.width}x${videoDimensions.height}` : 'Invalid dimensions');
    }
    
  } catch (error) {
    recordTest('videoLoading', 'Desktop video testing error', false, error.message);
  }
}

// Test Mobile Video
async function testMobileVideo(page) {
  console.log('📱 Testing mobile video...');
  
  try {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(1000);
    
    // Test 1: Check mobile video element exists and is visible
    const mobileVideo = await page.locator('#solutions video.lg\\:hidden');
    const videoExists = await mobileVideo.count();
    const isVisible = await mobileVideo.isVisible();
    
    recordTest('videoLoading', 'Mobile video element exists', videoExists > 0,
      `Mobile video elements found: ${videoExists}`);
    
    recordTest('videoLoading', 'Mobile video element visible', isVisible,
      isVisible ? 'Mobile video is visible' : 'Mobile video is not visible');
    
    if (videoExists > 0 && isVisible) {
      // Test 2: Check video source URL
      const sourceElement = mobileVideo.locator('source');
      const sourceUrl = await sourceElement.getAttribute('src');
      const urlCorrect = sourceUrl === MOBILE_VIDEO_URL;
      recordTest('videoLoading', 'Mobile video URL correct', urlCorrect,
        `Expected: ${MOBILE_VIDEO_URL.substring(0, 50)}..., Got: ${sourceUrl ? sourceUrl.substring(0, 50) + '...' : 'null'}`);
      
      // Test 3: Check video attributes
      const hasAutoplay = await mobileVideo.getAttribute('autoplay');
      const hasMuted = await mobileVideo.getAttribute('muted');
      const hasLoop = await mobileVideo.getAttribute('loop');
      const hasPlaysInline = await mobileVideo.getAttribute('playsinline');
      const hasPreload = await mobileVideo.getAttribute('preload');
      
      const attributesCorrect = hasAutoplay && hasMuted && hasLoop && hasPlaysInline && hasPreload === 'metadata';
      recordTest('videoLoading', 'Mobile video attributes correct', attributesCorrect,
        `Autoplay: ${hasAutoplay}, Muted: ${hasMuted}, Loop: ${hasLoop}, PlaysInline: ${hasPlaysInline}, Preload: ${hasPreload}`);
      
      // Test 4: Check video loading state
      const videoState = await page.evaluate(() => {
        const video = document.querySelector('#solutions video.lg\\:hidden');
        if (!video) return 'not-found';
        if (video.readyState >= 2) return 'loaded';
        if (video.error) return `error: ${video.error.message}`;
        return 'loading';
      });
      
      const videoLoaded = videoState === 'loaded';
      recordTest('videoLoading', 'Mobile video loaded', videoLoaded,
        `Video state: ${videoState}`);
      
      // Test 5: Test video playback
      if (videoLoaded) {
        // Wait a bit more for video to potentially start playing
        await page.waitForTimeout(3000);
        
        const isPlaying = await page.evaluate(() => {
          const video = document.querySelector('#solutions video.lg\\:hidden');
          return video && !video.paused && !video.ended && video.readyState >= 2;
        });
        
        recordTest('videoPlayback', 'Mobile video playing', isPlaying,
          isPlaying ? 'Video is playing' : 'Video is not playing');
      }
      
      // Test 6: Check video dimensions
      const videoDimensions = await page.evaluate(() => {
        const video = document.querySelector('#solutions video.lg\\:hidden');
        if (!video) return null;
        return {
          width: video.videoWidth,
          height: video.videoHeight,
          displayWidth: video.offsetWidth,
          displayHeight: video.offsetHeight
        };
      });
      
      const hasValidDimensions = videoDimensions && videoDimensions.width > 0 && videoDimensions.height > 0;
      recordTest('videoLoading', 'Mobile video has valid dimensions', hasValidDimensions,
        hasValidDimensions ? `Dimensions: ${videoDimensions.width}x${videoDimensions.height}` : 'Invalid dimensions');
    }
    
  } catch (error) {
    recordTest('videoLoading', 'Mobile video testing error', false, error.message);
  }
}

// Test Video Performance
async function testVideoPerformance(page) {
  console.log('⚡ Testing video performance...');
  
  try {
    // Test 1: Check video network requests
    const networkRequests = await page.evaluate(() => {
      return new Promise((resolve) => {
        const requests = [];
        const originalFetch = window.fetch;
        
        window.fetch = function(...args) {
          const url = args[0];
          if (typeof url === 'string' && url.includes('video')) {
            requests.push({
              url: url,
              timestamp: Date.now()
            });
          }
          return originalFetch.apply(this, args);
        };
        
        // Wait a bit to collect requests
        setTimeout(() => {
          resolve(requests);
        }, 5000);
      });
    });
    
    const videoRequestsMade = networkRequests.length > 0;
    recordTest('videoPerformance', 'Video network requests made', videoRequestsMade,
      `Video requests: ${networkRequests.length}`);
    
    // Test 2: Check video loading time
    const loadingMetrics = await page.evaluate(() => {
      return new Promise((resolve) => {
        const videos = document.querySelectorAll('#solutions video');
        const metrics = [];
        
        videos.forEach((video, index) => {
          const startTime = performance.now();
          
          video.addEventListener('loadeddata', () => {
            const loadTime = performance.now() - startTime;
            metrics.push({
              index,
              loadTime,
              readyState: video.readyState
            });
            
            if (metrics.length === videos.length) {
              resolve(metrics);
            }
          });
          
          video.addEventListener('error', () => {
            metrics.push({
              index,
              error: true,
              readyState: video.readyState
            });
            
            if (metrics.length === videos.length) {
              resolve(metrics);
            }
          });
        });
        
        // Fallback timeout
        setTimeout(() => {
          resolve(metrics);
        }, 10000);
      });
    });
    
    if (loadingMetrics.length > 0) {
      const avgLoadTime = loadingMetrics
        .filter(m => !m.error && m.loadTime)
        .reduce((sum, m) => sum + m.loadTime, 0) / loadingMetrics.filter(m => !m.error && m.loadTime).length;
      
      const loadTimeAcceptable = avgLoadTime < 5000; // 5 seconds threshold
      recordTest('videoPerformance', 'Video loading time acceptable', loadTimeAcceptable,
        `Average load time: ${avgLoadTime.toFixed(2)}ms`);
    }
    
    // Test 3: Check video memory usage
    const memoryUsage = await page.evaluate(() => {
      if (performance.memory) {
        return {
          used: Math.round(performance.memory.usedJSHeapSize / 1048576), // MB
          total: Math.round(performance.memory.totalJSHeapSize / 1048576) // MB
        };
      }
      return null;
    });
    
    if (memoryUsage) {
      const memoryAcceptable = memoryUsage.used < 100; // 100MB threshold
      recordTest('videoPerformance', 'Memory usage acceptable', memoryAcceptable,
        `Memory used: ${memoryUsage.used}MB / ${memoryUsage.total}MB`);
    }
    
  } catch (error) {
    recordTest('videoPerformance', 'Video performance testing error', false, error.message);
  }
}

// Test Video Optimization
async function testVideoOptimization(page) {
  console.log('🔧 Testing video optimization...');
  
  try {
    // Test 1: Check preload attribute
    const preloadSet = await page.evaluate(() => {
      const videos = document.querySelectorAll('#solutions video');
      return Array.from(videos).every(video => video.getAttribute('preload') === 'metadata');
    });
    
    recordTest('videoOptimization', 'Videos have metadata preload', preloadSet,
      preloadSet ? 'All videos have preload="metadata"' : 'Some videos missing proper preload');
    
    // Test 2: Check video format
    const videoFormat = await page.evaluate(() => {
      const sources = document.querySelectorAll('#solutions video source');
      return Array.from(sources).every(source => source.getAttribute('type') === 'video/mp4');
    });
    
    recordTest('videoOptimization', 'Videos use MP4 format', videoFormat,
      videoFormat ? 'All videos use MP4 format' : 'Some videos not using MP4');
    
    // Test 3: Check video autoplay behavior
    const autoplayBehavior = await page.evaluate(() => {
      return new Promise((resolve) => {
        const videos = document.querySelectorAll('#solutions video');
        const results = [];
        
        videos.forEach((video, index) => {
          // Check if video is muted (required for autoplay)
          const isMuted = video.muted;
          
          // Check if video has autoplay attribute
          const hasAutoplay = video.hasAttribute('autoplay');
          
          // Check if video is playing after a delay
          setTimeout(() => {
            const isPlaying = !video.paused && !video.ended && video.readyState >= 2;
            results.push({
              index,
              isMuted,
              hasAutoplay,
              isPlaying
            });
            
            if (results.length === videos.length) {
              resolve(results);
            }
          }, 3000);
        });
      });
    });
    
    if (autoplayBehavior.length > 0) {
      const allAutoplayCorrect = autoplayBehavior.every(v => v.isMuted && v.hasAutoplay);
      const somePlaying = autoplayBehavior.some(v => v.isPlaying);
      
      recordTest('videoOptimization', 'Videos configured for autoplay', allAutoplayCorrect,
        allAutoplayCorrect ? 'All videos properly configured for autoplay' : 'Some videos missing autoplay configuration');
      
      recordTest('videoPlayback', 'Videos actually playing', somePlaying,
        somePlaying ? 'At least one video is playing' : 'No videos are playing');
    }
    
    // Test 4: Check video responsive behavior
    const responsiveBehavior = await page.evaluate(() => {
      const desktopVideo = document.querySelector('#solutions video.hidden.lg\\:block');
      const mobileVideo = document.querySelector('#solutions video.lg\\:hidden');
      
      const desktopStyles = desktopVideo ? window.getComputedStyle(desktopVideo) : null;
      const mobileStyles = mobileVideo ? window.getComputedStyle(mobileVideo) : null;
      
      return {
        desktopDisplay: desktopStyles ? desktopStyles.display : 'not-found',
        mobileDisplay: mobileStyles ? mobileStyles.display : 'not-found'
      };
    });
    
    recordTest('videoOptimization', 'Videos responsive to viewport', 
      responsiveBehavior.desktopDisplay !== 'not-found' && responsiveBehavior.mobileDisplay !== 'not-found',
      `Desktop: ${responsiveBehavior.desktopDisplay}, Mobile: ${responsiveBehavior.mobileDisplay}`);
    
  } catch (error) {
    recordTest('videoOptimization', 'Video optimization testing error', false, error.message);
  }
}

// Run the tests
runVideoTests().then(results => {
  console.log('\n🎉 Video tests completed!');
  process.exit(results.summary.totalFailed > 0 ? 1 : 0);
}).catch(error => {
  console.error('Video test execution failed:', error);
  process.exit(1);
});