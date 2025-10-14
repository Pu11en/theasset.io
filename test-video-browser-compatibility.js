/**
 * Video Browser Compatibility Test
 * 
 * This test verifies that video autoplay behavior works across different browsers:
 * - Chrome/Chromium
 * - Firefox
 * - Safari (if available)
 * - Edge (if available)
 */

const { chromium, firefox, webkit } = require('playwright');
const path = require('path');

async function testVideoInBrowser(browserType, browserName) {
  console.log(`\n🌐 Testing in ${browserName}...`);
  console.log('='.repeat(50));
  
  const browser = await browserType.launch({ 
    headless: false,
    slowMo: 500 // Slow down for better observation
  });
  
  const context = await browser.newContext({
    viewport: { width: 1200, height: 800 },
    userAgent: getRandomUserAgent(browserName)
  });
  
  const page = await context.newPage();
  
  // Enable console logging from the page
  page.on('console', msg => {
    console.log(`📝 [${browserName} Console] ${msg.text()}`);
  });
  
  // Enable error logging
  page.on('pageerror', error => {
    console.error(`❌ [${browserName} Error] ${error.message}`);
  });
  
  try {
    // Navigate to the test page
    const testPagePath = path.join(__dirname, 'test-video-autoplay-behavior.html');
    await page.goto(`file://${testPagePath}`);
    
    // Wait for the page to load
    await page.waitForTimeout(3000);
    
    // Run tests
    const testResults = await page.evaluate(() => {
      const results = {
        browserInfo: {
          userAgent: navigator.userAgent,
          vendor: navigator.vendor,
          platform: navigator.platform
        },
        videos: {},
        errors: []
      };
      
      // Test Video 1
      try {
        const video1 = document.getElementById('video-1');
        if (video1) {
          results.videos.video1 = {
            attributes: {
              autoplay: video1.hasAttribute('autoplay'),
              muted: video1.hasAttribute('muted'),
              loop: video1.hasAttribute('loop'),
              controls: video1.hasAttribute('controls'),
              playsinline: video1.hasAttribute('playsinline'),
              pointerEvents: video1.style.pointerEvents
            },
            state: {
              paused: video1.paused,
              currentTime: video1.currentTime,
              duration: video1.duration,
              readyState: video1.readyState,
              networkState: video1.networkState
            },
            canPlay: video1.canPlayType ? video1.canPlayType('video/mp4') : 'unknown'
          };
        } else {
          results.errors.push('Video 1 not found');
        }
      } catch (error) {
        results.errors.push(`Video 1 error: ${error.message}`);
      }
      
      // Test Video 2
      try {
        const video2 = document.getElementById('video-2');
        if (video2) {
          results.videos.video2 = {
            attributes: {
              autoplay: video2.hasAttribute('autoplay'),
              muted: video2.hasAttribute('muted'),
              loop: video2.hasAttribute('loop'),
              controls: video2.hasAttribute('controls'),
              playsinline: video2.hasAttribute('playsinline'),
              pointerEvents: video2.style.pointerEvents
            },
            state: {
              paused: video2.paused,
              currentTime: video2.currentTime,
              duration: video2.duration,
              readyState: video2.readyState,
              networkState: video2.networkState
            },
            canPlay: video2.canPlayType ? video2.canPlayType('video/mp4') : 'unknown'
          };
        } else {
          results.errors.push('Video 2 not found');
        }
      } catch (error) {
        results.errors.push(`Video 2 error: ${error.message}`);
      }
      
      // Test Static Image
      try {
        const image3 = document.getElementById('image-3');
        if (image3) {
          results.videos.image3 = {
            isImage: image3.tagName === 'IMG',
            src: image3.src,
            loaded: image3.complete && image3.naturalHeight !== 0
          };
        } else {
          results.errors.push('Image 3 not found');
        }
      } catch (error) {
        results.errors.push(`Image 3 error: ${error.message}`);
      }
      
      return results;
    });
    
    console.log(`📊 ${browserName} Test Results:`);
    console.log(JSON.stringify(testResults, null, 2));
    
    // Wait a bit more to observe behavior
    await page.waitForTimeout(3000);
    
    // Try to manually play videos if they're not playing
    const manualPlayResults = await page.evaluate(() => {
      const results = { videos: {} };
      
      ['video-1', 'video-2'].forEach(videoId => {
        const video = document.getElementById(videoId);
        if (video) {
          const wasPaused = video.paused;
          
          // Try to play
          video.play().then(() => {
            results.videos[videoId] = {
              wasPaused,
              nowPlaying: !video.paused,
              currentTime: video.currentTime
            };
          }).catch(error => {
            results.videos[videoId] = {
              wasPaused,
              nowPlaying: false,
              error: error.message
            };
          });
        }
      });
      
      return results;
    });
    
    console.log(`🎮 ${browserName} Manual Play Results:`);
    console.log(JSON.stringify(manualPlayResults, null, 2));
    
    // Final check after manual play attempt
    await page.waitForTimeout(2000);
    
    const finalState = await page.evaluate(() => {
      const results = { videos: {} };
      
      ['video-1', 'video-2'].forEach(videoId => {
        const video = document.getElementById(videoId);
        if (video) {
          results.videos[videoId] = {
            paused: video.paused,
            currentTime: video.currentTime,
            duration: video.duration
          };
        }
      });
      
      return results;
    });
    
    console.log(`🏁 ${browserName} Final State:`);
    console.log(JSON.stringify(finalState, null, 2));
    
    return {
      browserName,
      success: true,
      testResults,
      manualPlayResults,
      finalState
    };
    
  } catch (error) {
    console.error(`❌ ${browserName} test failed:`, error);
    return {
      browserName,
      success: false,
      error: error.message
    };
  } finally {
    await browser.close();
  }
}

function getRandomUserAgent(browserName) {
  const userAgents = {
    'Chrome': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Firefox': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0',
    'Safari': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Safari/605.1.15',
    'Edge': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.0.0'
  };
  
  return userAgents[browserName] || userAgents['Chrome'];
}

async function runBrowserCompatibilityTests() {
  console.log('🌐 Starting Video Browser Compatibility Tests...\n');
  
  const browsers = [
    { type: chromium, name: 'Chrome' },
    { type: firefox, name: 'Firefox' },
    { type: webkit, name: 'Safari' }
  ];
  
  const results = [];
  
  for (const browser of browsers) {
    try {
      const result = await testVideoInBrowser(browser.type, browser.name);
      results.push(result);
    } catch (error) {
      console.error(`❌ Failed to test ${browser.name}:`, error);
      results.push({
        browserName: browser.name,
        success: false,
        error: error.message
      });
    }
  }
  
  // Generate compatibility report
  console.log('\n📊 Browser Compatibility Report');
  console.log('================================');
  
  results.forEach(result => {
    console.log(`\n🌐 ${result.browserName}:`);
    console.log(`Status: ${result.success ? '✅ Success' : '❌ Failed'}`);
    
    if (result.success) {
      const { testResults } = result;
      
      // Check video attributes
      if (testResults.videos.video1) {
        const v1Attrs = testResults.videos.video1.attributes;
        const v1Correct = v1Attrs.autoplay && v1Attrs.muted && v1Attrs.loop && !v1Attrs.controls;
        console.log(`  Video 1 Attributes: ${v1Correct ? '✅' : '❌'}`);
      }
      
      if (testResults.videos.video2) {
        const v2Attrs = testResults.videos.video2.attributes;
        const v2Correct = v2Attrs.autoplay && v2Attrs.muted && v2Attrs.loop && !v2Attrs.controls;
        console.log(`  Video 2 Attributes: ${v2Correct ? '✅' : '❌'}`);
      }
      
      // Check video playback
      if (result.finalState && result.finalState.videos) {
        Object.entries(result.finalState.videos).forEach(([videoId, state]) => {
          const isPlaying = !state.paused && state.currentTime > 0;
          console.log(`  ${videoId} Playing: ${isPlaying ? '✅' : '❌'}`);
        });
      }
      
      // Check static image
      if (testResults.videos.image3) {
        const imageCorrect = testResults.videos.image3.isImage;
        console.log(`  Static Image: ${imageCorrect ? '✅' : '❌'}`);
      }
      
      if (testResults.errors.length > 0) {
        console.log(`  Errors: ${testResults.errors.join(', ')}`);
      }
    } else {
      console.log(`  Error: ${result.error}`);
    }
  });
  
  // Summary
  const successfulBrowsers = results.filter(r => r.success).length;
  const totalBrowsers = results.length;
  
  console.log(`\n📈 Summary: ${successfulBrowsers}/${totalBrowsers} browsers passed compatibility tests`);
  
  if (successfulBrowsers === totalBrowsers) {
    console.log('🎉 All browsers support the video autoplay behavior!');
  } else {
    console.log('⚠️ Some browsers have compatibility issues. Consider implementing additional fallbacks.');
  }
  
  return results;
}

// Run the tests
runBrowserCompatibilityTests().catch(console.error);