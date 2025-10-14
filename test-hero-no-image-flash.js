/**
 * Test script to verify that the Hero component no longer shows image fallback on mobile
 * This script checks for the absence of image fallback elements and ensures video loads directly
 */

const puppeteer = require('puppeteer');
const path = require('path');

async function testHeroNoImageFlash() {
  console.log('🔍 Testing Hero component for image fallback on mobile...\n');
  
  const browser = await puppeteer.launch({
    headless: false,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--no-first-run',
      '--no-zygote',
      '--single-process',
      '--disable-gpu'
    ]
  });
  
  try {
    // Test different mobile viewport sizes
    const viewports = [
      { name: 'iPhone SE', width: 375, height: 667, userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15' },
      { name: 'iPhone 12', width: 390, height: 844, userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15' },
      { name: 'iPhone 12 Pro Max', width: 428, height: 926, userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15' },
      { name: 'Android', width: 414, height: 896, userAgent: 'Mozilla/5.0 (Linux; Android 10; SM-G975F) AppleWebKit/537.36' }
    ];
    
    const baseUrl = 'http://localhost:3001';
    const results = [];
    
    for (const viewport of viewports) {
      console.log(`📱 Testing on ${viewport.name} (${viewport.width}x${viewport.height})...`);
      
      const page = await browser.newPage();
      await page.setUserAgent(viewport.userAgent);
      await page.setViewport({ width: viewport.width, height: viewport.height });
      
      // Navigate to the homepage
      const startTime = Date.now();
      await page.goto(baseUrl, { waitUntil: 'networkidle0' });
      const loadTime = Date.now() - startTime;
      
      // Wait a bit for video to start loading
      await page.waitForTimeout(2000);
      
      // Check for image fallback elements
      const hasImageFallback = await page.evaluate(() => {
        const heroSection = document.querySelector('.hero');
        if (!heroSection) return { found: false, reason: 'Hero section not found' };
        
        // Look for any div with background-image style
        const elementsWithBgImage = heroSection.querySelectorAll('div[style*="background-image"]');
        
        // Check if any of these elements are visible
        for (const element of elementsWithBgImage) {
          const style = window.getComputedStyle(element);
          if (style.backgroundImage && style.backgroundImage !== 'none' && 
              style.display !== 'none' && style.opacity !== '0') {
            return { 
              found: true, 
              element: element.tagName,
              backgroundImage: style.backgroundImage,
              reason: 'Image fallback detected'
            };
          }
        }
        
        return { found: false, reason: 'No image fallback detected' };
      });
      
      // Check for video element
      const hasVideo = await page.evaluate(() => {
        const heroSection = document.querySelector('.hero');
        if (!heroSection) return { found: false, reason: 'Hero section not found' };
        
        const video = heroSection.querySelector('video');
        if (!video) return { found: false, reason: 'No video element found' };
        
        return { 
          found: true, 
          src: video.src,
          poster: video.poster,
          autoplay: video.autoplay,
          muted: video.muted,
          playsInline: video.playsInline
        };
      });
      
      // Check for loading indicator
      const hasLoadingIndicator = await page.evaluate(() => {
        const heroSection = document.querySelector('.hero');
        if (!heroSection) return { found: false };
        
        const loadingElements = heroSection.querySelectorAll('.animate-spin');
        return loadingElements.length > 0;
      });
      
      // Check video loading state
      const videoState = await page.evaluate(() => {
        const video = document.querySelector('.hero video');
        if (!video) return null;
        
        return {
          readyState: video.readyState,
          networkState: video.networkState,
          videoWidth: video.videoWidth,
          videoHeight: video.videoHeight,
          currentTime: video.currentTime,
          paused: video.paused,
          ended: video.ended,
          seeking: video.seeking
        };
      });
      
      // Take screenshot for visual verification
      const screenshotPath = `test-results/hero-no-flash-${viewport.name.toLowerCase().replace(/\s+/g, '-')}.png`;
      await page.screenshot({ path: screenshotPath, fullPage: true });
      
      const result = {
        viewport: viewport.name,
        loadTime,
        hasImageFallback,
        hasVideo,
        hasLoadingIndicator,
        videoState,
        screenshot: screenshotPath
      };
      
      results.push(result);
      
      console.log(`  ✅ Load time: ${loadTime}ms`);
      console.log(`  ${hasImageFallback.found ? '❌' : '✅'} Image fallback: ${hasImageFallback.reason}`);
      console.log(`  ${hasVideo.found ? '✅' : '❌'} Video element: ${hasVideo.reason || 'Found'}`);
      console.log(`  ${hasLoadingIndicator ? '✅' : '❌'} Loading indicator: ${hasLoadingIndicator ? 'Found' : 'Not found'}`);
      
      if (videoState) {
        console.log(`  📹 Video state: ReadyState=${videoState.readyState}, NetworkState=${videoState.networkState}`);
        console.log(`  📹 Video dimensions: ${videoState.videoWidth}x${videoState.videoHeight}`);
      }
      
      console.log(`  📸 Screenshot saved: ${screenshotPath}\n`);
      
      await page.close();
    }
    
    // Generate test report
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        totalTests: results.length,
        passed: results.filter(r => !r.hasImageFallback.found && r.hasVideo.found).length,
        failed: results.filter(r => r.hasImageFallback.found || !r.hasVideo.found).length
      },
      results
    };
    
    // Save report
    const fs = require('fs');
    const reportPath = 'test-results/hero-no-flash-report.json';
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    
    console.log('📊 Test Summary:');
    console.log(`  Total tests: ${report.summary.totalTests}`);
    console.log(`  Passed: ${report.summary.passed}`);
    console.log(`  Failed: ${report.summary.failed}`);
    console.log(`  Report saved: ${reportPath}`);
    
    return report;
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    throw error;
  } finally {
    await browser.close();
  }
}

// Run the test
if (require.main === module) {
  testHeroNoImageFlash()
    .then(() => {
      console.log('\n✅ All tests completed!');
      process.exit(0);
    })
    .catch(error => {
      console.error('\n❌ Test failed:', error);
      process.exit(1);
    });
}

module.exports = testHeroNoImageFlash;