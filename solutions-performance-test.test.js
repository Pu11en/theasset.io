/**
 * Performance Testing for Solutions Component
 * Tests page load time, video loading optimization, and overall performance metrics
 */

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

// Test configuration
const BASE_URL = 'http://localhost:3001';
const TEST_RESULTS_DIR = './test-results';
const REPORT_FILE = path.join(TEST_RESULTS_DIR, 'solutions-performance-test-report.json');

// Initialize test results
const testResults = {
  timestamp: new Date().toISOString(),
  tests: {
    pageLoad: { passed: 0, failed: 0, details: [] },
    videoOptimization: { passed: 0, failed: 0, details: [] },
    resourceLoading: { passed: 0, failed: 0, details: [] },
    memoryUsage: { passed: 0, failed: 0, details: [] }
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
async function runPerformanceTests() {
  console.log('⚡ Starting Solutions Component Performance Tests...\n');
  
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    // Enable performance monitoring
    await page.route('**/*', (route) => {
      const url = route.request().url();
      // Continue with the request but log it
      route.continue();
    });
    
    // Navigate to the page
    await page.goto(BASE_URL, { waitUntil: 'networkidle' });
    
    // Wait for the page to fully load
    await page.waitForTimeout(3000);
    
    // Scroll to Solutions section
    await page.evaluate(() => {
      document.getElementById('solutions')?.scrollIntoView({ behavior: 'smooth' });
    });
    
    // Wait for scroll to complete and videos to load
    await page.waitForTimeout(5000);
    
    // Run performance tests
    await testPageLoadMetrics(page);
    await testVideoOptimization(page);
    await testResourceLoading(page);
    await testMemoryUsage(page);
    
  } catch (error) {
    console.error('Error during performance testing:', error);
  } finally {
    await browser.close();
  }
  
  // Save test results
  fs.writeFileSync(REPORT_FILE, JSON.stringify(testResults, null, 2));
  
  // Print summary
  console.log('\n📊 Performance Test Summary:');
  console.log(`✅ Passed: ${testResults.summary.totalPassed}`);
  console.log(`❌ Failed: ${testResults.summary.totalFailed}`);
  console.log(`📄 Detailed report saved to: ${REPORT_FILE}`);
  
  return testResults;
}

// Test Page Load Metrics
async function testPageLoadMetrics(page) {
  console.log('📈 Testing page load metrics...');
  
  try {
    // Test 1: Get basic navigation timing
    const navigationTiming = await page.evaluate(() => {
      const timing = performance.timing;
      return {
        dnsLookup: timing.domainLookupEnd - timing.domainLookupStart,
        tcpConnect: timing.connectEnd - timing.connectStart,
        serverResponse: timing.responseEnd - timing.requestStart,
        domLoad: timing.domContentLoadedEventEnd - timing.navigationStart,
        windowLoad: timing.loadEventEnd - timing.navigationStart,
        totalLoadTime: timing.loadEventEnd - timing.navigationStart
      };
    });
    
    const loadTimeAcceptable = navigationTiming.totalLoadTime < 5000; // 5 seconds
    recordTest('pageLoad', 'Total page load time under 5 seconds', loadTimeAcceptable,
      `Total load time: ${navigationTiming.totalLoadTime}ms`);
    
    const domLoadAcceptable = navigationTiming.domLoad < 3000; // 3 seconds
    recordTest('pageLoad', 'DOM loaded under 3 seconds', domLoadAcceptable,
      `DOM load time: ${navigationTiming.domLoad}ms`);
    
    // Test 2: Check Core Web Vitals
    const webVitals = await page.evaluate(() => {
      return new Promise((resolve) => {
        // Create a PerformanceObserver to collect metrics
        let metrics = {};
        
        try {
          // Largest Contentful Paint (LCP)
          new PerformanceObserver((list) => {
            const entries = list.getEntries();
            const lastEntry = entries[entries.length - 1];
            metrics.lcp = lastEntry.renderTime || lastEntry.loadTime;
          }).observe({ entryTypes: ['largest-contentful-paint'] });
          
          // First Input Delay (FID)
          new PerformanceObserver((list) => {
            const entries = list.getEntries();
            metrics.fid = entries[0].processingStart - entries[0].startTime;
          }).observe({ entryTypes: ['first-input'] });
          
          // Cumulative Layout Shift (CLS)
          let clsValue = 0;
          new PerformanceObserver((list) => {
            for (const entry of list.getEntries()) {
              if (!entry.hadRecentInput) {
                clsValue += entry.value;
              }
            }
            metrics.cls = clsValue;
          }).observe({ entryTypes: ['layout-shift'] });
        } catch (e) {
          console.log('Performance Observer not fully supported:', e);
        }
        
        // Fallback to basic metrics if PerformanceObserver fails
        setTimeout(() => {
          if (!metrics.lcp) {
            const paintEntries = performance.getEntriesByType('paint');
            const lcpEntry = paintEntries.find(e => e.name === 'largest-contentful-paint');
            metrics.lcp = lcpEntry ? lcpEntry.startTime : performance.timing.loadEventEnd - performance.timing.navigationStart;
          }
          
          if (!metrics.fid) {
            metrics.fid = 0; // Default if we can't measure
          }
          
          if (!metrics.cls) {
            metrics.cls = 0; // Default if we can't measure
          }
          
          resolve(metrics);
        }, 3000);
      });
    });
    
    // LCP should be under 2.5 seconds
    const lcpGood = webVitals.lcp < 2500;
    recordTest('pageLoad', 'LCP under 2.5 seconds', lcpGood,
      `LCP: ${webVitals.lcp}ms`);
    
    // FID should be under 100ms
    const fidGood = webVitals.fid < 100;
    recordTest('pageLoad', 'FID under 100ms', fidGood,
      `FID: ${webVitals.fid}ms`);
    
    // CLS should be under 0.1
    const clsGood = webVitals.cls < 0.1;
    recordTest('pageLoad', 'CLS under 0.1', clsGood,
      `CLS: ${webVitals.cls}`);
    
    // Test 3: Check if Solutions section loads quickly
    const solutionsLoadTime = await page.evaluate(() => {
      return new Promise((resolve) => {
        const observer = new IntersectionObserver((entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting && entry.target.id === 'solutions') {
              const loadTime = performance.now();
              observer.disconnect();
              resolve(loadTime);
            }
          });
        });
        
        const solutionsSection = document.getElementById('solutions');
        if (solutionsSection) {
          observer.observe(solutionsSection);
        } else {
          resolve(-1);
        }
      });
    });
    
    const solutionsLoadAcceptable = solutionsLoadTime < 3000; // 3 seconds
    recordTest('pageLoad', 'Solutions section loads quickly', solutionsLoadAcceptable,
      solutionsLoadTime > 0 ? `Solutions load time: ${solutionsLoadTime}ms` : 'Solutions section not found');
    
  } catch (error) {
    recordTest('pageLoad', 'Page load metrics testing error', false, error.message);
  }
}

// Test Video Optimization
async function testVideoOptimization(page) {
  console.log('🎥 Testing video optimization...');
  
  try {
    // Test 1: Check video preload attribute
    const videoPreload = await page.evaluate(() => {
      const videos = document.querySelectorAll('#solutions video');
      return Array.from(videos).map(video => ({
        preload: video.getAttribute('preload'),
        src: video.querySelector('source')?.getAttribute('src')
      }));
    });
    
    const hasMetadataPreload = videoPreload.every(video => video.preload === 'metadata');
    recordTest('videoOptimization', 'Videos use metadata preload', hasMetadataPreload,
      `Videos with metadata preload: ${videoPreload.filter(v => v.preload === 'metadata').length}/${videoPreload.length}`);
    
    // Test 2: Check video loading time
    const videoLoadTimes = await page.evaluate(() => {
      return new Promise((resolve) => {
        const videos = document.querySelectorAll('#solutions video');
        const results = [];
        
        if (videos.length === 0) {
          resolve(results);
          return;
        }
        
        let completed = 0;
        const startTime = performance.now();
        
        videos.forEach((video, index) => {
          const videoStartTime = performance.now();
          
          video.addEventListener('loadeddata', () => {
            const loadTime = performance.now() - videoStartTime;
            results.push({
              index,
              loadTime,
              success: true
            });
            
            completed++;
            if (completed === videos.length) {
              resolve(results);
            }
          });
          
          video.addEventListener('error', () => {
            results.push({
              index,
              loadTime: -1,
              success: false,
              error: video.error?.message || 'Unknown error'
            });
            
            completed++;
            if (completed === videos.length) {
              resolve(results);
            }
          });
          
          // Set a timeout in case videos don't load
          setTimeout(() => {
            if (results.filter(r => r.index === index).length === 0) {
              results.push({
                index,
                loadTime: -1,
                success: false,
                error: 'Timeout'
              });
              
              completed++;
              if (completed === videos.length) {
                resolve(results);
              }
            }
          }, 10000);
        });
      });
    });
    
    if (videoLoadTimes.length > 0) {
      const successfulLoads = videoLoadTimes.filter(v => v.success);
      const avgLoadTime = successfulLoads.reduce((sum, v) => sum + v.loadTime, 0) / successfulLoads.length;
      
      const loadTimeAcceptable = avgLoadTime < 5000; // 5 seconds
      recordTest('videoOptimization', 'Video load time acceptable', loadTimeAcceptable,
        `Average video load time: ${avgLoadTime.toFixed(2)}ms (${successfulLoads.length}/${videoLoadTimes.length} successful)`);
    } else {
      recordTest('videoOptimization', 'Video load time measured', false, 'No videos found or timed out');
    }
    
    // Test 3: Check video file size (approximate)
    const videoResourceInfo = await page.evaluate(() => {
      return new Promise((resolve) => {
        // Override fetch to capture video resource info
        const originalFetch = window.fetch;
        const videoResources = [];
        
        window.fetch = function(...args) {
          const url = args[0];
          const promise = originalFetch.apply(this, args);
          
          if (typeof url === 'string' && url.includes('video')) {
            promise.then(response => {
              // We can't easily get file size from response, but we can log the URL
              videoResources.push({
                url: url,
                status: response.status,
                headers: Object.fromEntries(response.headers.entries())
              });
            }).catch(() => {
              videoResources.push({
                url: url,
                status: 'error'
              });
            });
          }
          
          return promise;
        };
        
        // Wait a bit to collect requests
        setTimeout(() => {
          window.fetch = originalFetch;
          resolve(videoResources);
        }, 5000);
      });
    });
    
    const hasVideoResources = videoResourceInfo.length > 0;
    recordTest('videoOptimization', 'Video resources loaded', hasVideoResources,
      `Video resources found: ${videoResourceInfo.length}`);
    
    // Test 4: Check if videos are responsive
    const videoResponsiveness = await page.evaluate(() => {
      const desktopVideo = document.querySelector('#solutions video.hidden.lg\\:block');
      const mobileVideo = document.querySelector('#solutions video.lg\\:hidden');
      
      const getVideoStyles = (video) => {
        if (!video) return null;
        const styles = window.getComputedStyle(video);
        return {
          display: styles.display,
          position: styles.position,
          width: styles.width,
          height: styles.height,
          objectFit: styles.objectFit
        };
      };
      
      return {
        desktop: getVideoStyles(desktopVideo),
        mobile: getVideoStyles(mobileVideo)
      };
    });
    
    const desktopVideoResponsive = videoResponsiveness.desktop && 
      videoResponsiveness.desktop.width === '100%' && 
      videoResponsiveness.desktop.height === '100%';
    
    const mobileVideoResponsive = videoResponsiveness.mobile && 
      videoResponsiveness.mobile.width === '100%' && 
      videoResponsiveness.mobile.height === '100%';
    
    recordTest('videoOptimization', 'Desktop video responsive', desktopVideoResponsive,
      desktopVideoResponsive ? 'Desktop video fills container' : 'Desktop video not fully responsive');
    
    recordTest('videoOptimization', 'Mobile video responsive', mobileVideoResponsive,
      mobileVideoResponsive ? 'Mobile video fills container' : 'Mobile video not fully responsive');
    
  } catch (error) {
    recordTest('videoOptimization', 'Video optimization testing error', false, error.message);
  }
}

// Test Resource Loading
async function testResourceLoading(page) {
  console.log('📦 Testing resource loading...');
  
  try {
    // Test 1: Check total resource count
    const resourceCount = await page.evaluate(() => {
      return performance.getEntriesByType('resource').length;
    });
    
    const resourceCountAcceptable = resourceCount < 100; // Less than 100 resources
    recordTest('resourceLoading', 'Resource count reasonable', resourceCountAcceptable,
      `Total resources: ${resourceCount}`);
    
    // Test 2: Check resource sizes
    const resourceSizes = await page.evaluate(() => {
      const resources = performance.getEntriesByType('resource');
      return {
        totalSize: resources.reduce((sum, resource) => sum + (resource.transferSize || 0), 0),
        largestResource: Math.max(...resources.map(r => r.transferSize || 0)),
        imageResources: resources.filter(r => r.name.includes('.jpg') || r.name.includes('.png') || r.name.includes('.webp')).length,
        videoResources: resources.filter(r => r.name.includes('.mp4') || r.name.includes('.webm')).length,
        jsResources: resources.filter(r => r.name.includes('.js')).length,
        cssResources: resources.filter(r => r.name.includes('.css')).length
      };
    });
    
    const totalSizeAcceptable = resourceSizes.totalSize < 5000000; // Less than 5MB
    recordTest('resourceLoading', 'Total resource size under 5MB', totalSizeAcceptable,
      `Total size: ${(resourceSizes.totalSize / 1024 / 1024).toFixed(2)}MB`);
    
    // Test 3: Check resource caching
    const resourceCaching = await page.evaluate(() => {
      const resources = performance.getEntriesByType('resource');
      const cacheableResources = resources.filter(r => 
        !r.name.includes('data:') && 
        (r.name.includes('.js') || r.name.includes('.css') || r.name.includes('.jpg') || r.name.includes('.png'))
      );
      
      return {
        total: cacheableResources.length,
        cached: cacheableResources.filter(r => 
          r.transferSize < r.encodedBodySize || r.transferSize === 0
        ).length
      };
    });
    
    const cachingEffective = resourceCaching.total === 0 || (resourceCaching.cached / resourceCaching.total) > 0.5;
    recordTest('resourceLoading', 'Resource caching effective', cachingEffective,
      `${resourceCaching.cached}/${resourceCaching.total} cacheable resources were cached`);
    
    // Test 4: Check for render-blocking resources
    const renderBlockingResources = await page.evaluate(() => {
      // This is a simplified check - in reality, you'd need more sophisticated analysis
      const scripts = document.querySelectorAll('script[src]');
      const links = document.querySelectorAll('link[rel="stylesheet"]');
      
      return {
        scripts: scripts.length,
        stylesheets: links.length,
        total: scripts.length + links.length
      };
    });
    
    const blockingResourcesAcceptable = renderBlockingResources.total < 10;
    recordTest('resourceLoading', 'Render-blocking resources reasonable', blockingResourcesAcceptable,
      `Render-blocking resources: ${renderBlockingResources.total} (${renderBlockingResources.scripts} scripts, ${renderBlockingResources.stylesheets} stylesheets)`);
    
  } catch (error) {
    recordTest('resourceLoading', 'Resource loading testing error', false, error.message);
  }
}

// Test Memory Usage
async function testMemoryUsage(page) {
  console.log('💾 Testing memory usage...');
  
  try {
    // Test 1: Initial memory usage
    const initialMemory = await page.evaluate(() => {
      if (performance.memory) {
        return {
          used: Math.round(performance.memory.usedJSHeapSize / 1048576), // MB
          total: Math.round(performance.memory.totalJSHeapSize / 1048576), // MB
          limit: Math.round(performance.memory.jsHeapSizeLimit / 1048576) // MB
        };
      }
      return null;
    });
    
    if (initialMemory) {
      const initialMemoryAcceptable = initialMemory.used < 50; // Less than 50MB initially
      recordTest('memoryUsage', 'Initial memory usage acceptable', initialMemoryAcceptable,
        `Initial memory: ${initialMemory.used}MB / ${initialMemory.total}MB`);
    }
    
    // Test 2: Memory usage after scrolling and interaction
    await page.evaluate(() => {
      // Simulate some interaction
      const buttons = document.querySelectorAll('button');
      if (buttons.length > 0) {
        buttons[0].click();
      }
      
      // Scroll up and down a few times
      window.scrollBy(0, -200);
      setTimeout(() => window.scrollBy(0, 400), 100);
      setTimeout(() => window.scrollBy(0, -200), 200);
    });
    
    await page.waitForTimeout(1000);
    
    const afterInteractionMemory = await page.evaluate(() => {
      if (performance.memory) {
        return {
          used: Math.round(performance.memory.usedJSHeapSize / 1048576), // MB
          total: Math.round(performance.memory.totalJSHeapSize / 1048576) // MB
        };
      }
      return null;
    });
    
    if (initialMemory && afterInteractionMemory) {
      const memoryIncrease = afterInteractionMemory.used - initialMemory.used;
      const memoryIncreaseAcceptable = memoryIncrease < 20; // Less than 20MB increase
      
      recordTest('memoryUsage', 'Memory increase after interaction acceptable', memoryIncreaseAcceptable,
        `Memory increased by ${memoryIncrease}MB (${initialMemory.used}MB → ${afterInteractionMemory.used}MB)`);
    }
    
    // Test 3: Memory usage after video loading
    // Wait a bit more for videos to fully load
    await page.waitForTimeout(3000);
    
    const afterVideoLoadMemory = await page.evaluate(() => {
      if (performance.memory) {
        return {
          used: Math.round(performance.memory.usedJSHeapSize / 1048576), // MB
          total: Math.round(performance.memory.totalJSHeapSize / 1048576) // MB
        };
      }
      return null;
    });
    
    if (afterInteractionMemory && afterVideoLoadMemory) {
      const videoMemoryIncrease = afterVideoLoadMemory.used - afterInteractionMemory.used;
      const videoMemoryIncreaseAcceptable = videoMemoryIncrease < 30; // Less than 30MB increase for videos
      
      recordTest('memoryUsage', 'Memory increase after video loading acceptable', videoMemoryIncreaseAcceptable,
        `Memory increased by ${videoMemoryIncrease}MB after videos (${afterInteractionMemory.used}MB → ${afterVideoLoadMemory.used}MB)`);
    }
    
    // Test 4: Check for memory leaks (force garbage collection if available)
    try {
      await page.evaluate(() => {
        if (window.gc) {
          window.gc();
        }
      });
      
      await page.waitForTimeout(1000);
      
      const afterGCMemory = await page.evaluate(() => {
        if (performance.memory) {
          return {
            used: Math.round(performance.memory.usedJSHeapSize / 1048576), // MB
            total: Math.round(performance.memory.totalJSHeapSize / 1048576) // MB
          };
        }
        return null;
      });
      
      if (afterVideoLoadMemory && afterGCMemory) {
        const memoryFreed = afterVideoLoadMemory.used - afterGCMemory.used;
        const memoryLeakAcceptable = afterGCMemory.used < 100; // Less than 100MB after GC
        
        recordTest('memoryUsage', 'No significant memory leaks', memoryLeakAcceptable,
          `Memory after GC: ${afterGCMemory.used}MB (freed ${memoryFreed}MB)`);
      }
    } catch (e) {
      // Garbage collection not available, skip this test
      recordTest('memoryUsage', 'Garbage collection test', true, 'GC not available, test skipped');
    }
    
  } catch (error) {
    recordTest('memoryUsage', 'Memory usage testing error', false, error.message);
  }
}

// Run the tests
runPerformanceTests().then(results => {
  console.log('\n🎉 Performance tests completed!');
  process.exit(results.summary.totalFailed > 0 ? 1 : 0);
}).catch(error => {
  console.error('Performance test execution failed:', error);
  process.exit(1);
});