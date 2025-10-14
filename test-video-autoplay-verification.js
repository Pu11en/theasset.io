/**
 * Video Autoplay Behavior Verification Test
 * 
 * This test verifies that videos with forceAutoplay enabled:
 * 1. Autoplay immediately upon page load
 * 2. Loop seamlessly with no pauses or stops
 * 3. Have all video player controls removed
 * 4. Maintain continuous playback regardless of user interaction
 * 5. Have proper fallbacks for autoplay restrictions
 */

const { chromium } = require('playwright');
const path = require('path');

async function testVideoAutoplayBehavior() {
  console.log('🎬 Starting Video Autoplay Behavior Verification Tests...\n');
  
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  // Enable console logging from the page
  page.on('console', msg => {
    console.log(`📝 [Page Console] ${msg.text()}`);
  });
  
  // Enable error logging
  page.on('pageerror', error => {
    console.error(`❌ [Page Error] ${error.message}`);
  });
  
  try {
    // Navigate to the test page
    const testPagePath = path.join(__dirname, 'test-video-autoplay-behavior.html');
    await page.goto(`file://${testPagePath}`);
    
    // Wait for the page to load
    await page.waitForTimeout(2000);
    
    console.log('📋 Test 1: Verifying Video Attributes');
    console.log('=====================================');
    
    // Test 1: Verify video attributes
    const video1Attributes = await page.evaluate(() => {
      const video = document.getElementById('video-1');
      if (!video) return null;
      
      return {
        hasAutoplay: video.hasAttribute('autoplay'),
        hasMuted: video.hasAttribute('muted'),
        hasLoop: video.hasAttribute('loop'),
        hasControls: video.hasAttribute('controls'),
        hasPlaysInline: video.hasAttribute('playsinline'),
        pointerEvents: video.style.pointerEvents,
        x5VideoPlayerType: video.getAttribute('x5-video-player-type'),
        x5VideoPlayerFullscreen: video.getAttribute('x5-video-player-fullscreen'),
        x5VideoOrientation: video.getAttribute('x5-video-orientation')
      };
    });
    
    console.log('🎥 Video 1 (ZeroRisk) Attributes:', JSON.stringify(video1Attributes, null, 2));
    
    // Verify attributes are correct
    const video1Correct = 
      video1Attributes.hasAutoplay &&
      video1Attributes.hasMuted &&
      video1Attributes.hasLoop &&
      !video1Attributes.hasControls &&
      video1Attributes.hasPlaysInline &&
      video1Attributes.pointerEvents === 'none';
    
    console.log(`✅ Video 1 attributes ${video1Correct ? 'PASS' : 'FAIL'}`);
    
    const video2Attributes = await page.evaluate(() => {
      const video = document.getElementById('video-2');
      if (!video) return null;
      
      return {
        hasAutoplay: video.hasAttribute('autoplay'),
        hasMuted: video.hasAttribute('muted'),
        hasLoop: video.hasAttribute('loop'),
        hasControls: video.hasAttribute('controls'),
        hasPlaysInline: video.hasAttribute('playsinline'),
        pointerEvents: video.style.pointerEvents
      };
    });
    
    console.log('🎥 Video 2 (Extensive Experience) Attributes:', JSON.stringify(video2Attributes, null, 2));
    
    const video2Correct = 
      video2Attributes.hasAutoplay &&
      video2Attributes.hasMuted &&
      video2Attributes.hasLoop &&
      !video2Attributes.hasControls &&
      video2Attributes.hasPlaysInline &&
      video2Attributes.pointerEvents === 'none';
    
    console.log(`✅ Video 2 attributes ${video2Correct ? 'PASS' : 'FAIL'}`);
    
    console.log('\n📋 Test 2: Verifying Autoplay Behavior');
    console.log('=====================================');
    
    // Test 2: Check if videos are playing
    await page.waitForTimeout(3000); // Give videos time to start
    
    const videoStates = await page.evaluate(() => {
      const video1 = document.getElementById('video-1');
      const video2 = document.getElementById('video-2');
      
      return {
        video1: {
          paused: video1 ? video1.paused : null,
          currentTime: video1 ? video1.currentTime : null,
          duration: video1 ? video1.duration : null,
          readyState: video1 ? video1.readyState : null
        },
        video2: {
          paused: video2 ? video2.paused : null,
          currentTime: video2 ? video2.currentTime : null,
          duration: video2 ? video2.duration : null,
          readyState: video2 ? video2.readyState : null
        }
      };
    });
    
    console.log('🎥 Video States:', JSON.stringify(videoStates, null, 2));
    
    const video1Playing = videoStates.video1 && !videoStates.video1.paused && videoStates.video1.currentTime > 0;
    const video2Playing = videoStates.video2 && !videoStates.video2.paused && videoStates.video2.currentTime > 0;
    
    console.log(`✅ Video 1 autoplay ${video1Playing ? 'PASS' : 'FAIL'}`);
    console.log(`✅ Video 2 autoplay ${video2Playing ? 'PASS' : 'FAIL'}`);
    
    console.log('\n📋 Test 3: Verifying Loop Behavior');
    console.log('=====================================');
    
    // Test 3: Check if videos loop properly
    // Wait for videos to play for a bit
    await page.waitForTimeout(5000);
    
    const videoLoopTest = await page.evaluate(() => {
      const video1 = document.getElementById('video-1');
      const video2 = document.getElementById('video-2');
      
      // Check if videos have loop attribute and are still playing
      return {
        video1: {
          hasLoop: video1 ? video1.hasAttribute('loop') : false,
          isPlaying: video1 ? !video1.paused : false,
          currentTime: video1 ? video1.currentTime : null
        },
        video2: {
          hasLoop: video2 ? video2.hasAttribute('loop') : false,
          isPlaying: video2 ? !video2.paused : false,
          currentTime: video2 ? video2.currentTime : null
        }
      };
    });
    
    console.log('🎥 Loop Test Results:', JSON.stringify(videoLoopTest, null, 2));
    
    const video1Looping = videoLoopTest.video1.hasLoop && videoLoopTest.video1.isPlaying;
    const video2Looping = videoLoopTest.video2.hasLoop && videoLoopTest.video2.isPlaying;
    
    console.log(`✅ Video 1 loop behavior ${video1Looping ? 'PASS' : 'FAIL'}`);
    console.log(`✅ Video 2 loop behavior ${video2Looping ? 'PASS' : 'FAIL'}`);
    
    console.log('\n📋 Test 4: Verifying No Controls');
    console.log('=====================================');
    
    // Test 4: Check that videos have no controls
    const noControlsTest = await page.evaluate(() => {
      const video1 = document.getElementById('video-1');
      const video2 = document.getElementById('video-2');
      
      return {
        video1: {
          hasControls: video1 ? video1.hasAttribute('controls') : false,
          controlsAttribute: video1 ? video1.getAttribute('controls') : null,
          pointerEvents: video1 ? video1.style.pointerEvents : null
        },
        video2: {
          hasControls: video2 ? video2.hasAttribute('controls') : false,
          controlsAttribute: video2 ? video2.getAttribute('controls') : null,
          pointerEvents: video2 ? video2.style.pointerEvents : null
        }
      };
    });
    
    console.log('🎥 No Controls Test:', JSON.stringify(noControlsTest, null, 2));
    
    const video1NoControls = !noControlsTest.video1.hasControls && noControlsTest.video1.pointerEvents === 'none';
    const video2NoControls = !noControlsTest.video2.hasControls && noControlsTest.video2.pointerEvents === 'none';
    
    console.log(`✅ Video 1 no controls ${video1NoControls ? 'PASS' : 'FAIL'}`);
    console.log(`✅ Video 2 no controls ${video2NoControls ? 'PASS' : 'FAIL'}`);
    
    console.log('\n📋 Test 5: Verifying Fallback Behavior');
    console.log('=====================================');
    
    // Test 5: Check if static image is properly rendered
    const staticImageTest = await page.evaluate(() => {
      const image = document.getElementById('image-3');
      const status = document.getElementById('status-3');
      
      return {
        imageExists: !!image,
        imageSrc: image ? image.src : null,
        statusText: status ? status.textContent : null,
        isVideo: image ? image.tagName === 'VIDEO' : false
      };
    });
    
    console.log('🖼️ Static Image Test:', JSON.stringify(staticImageTest, null, 2));
    
    const staticImageCorrect = staticImageTest.imageExists && !staticImageTest.isVideo && staticImageTest.statusText === 'Static Image';
    
    console.log(`✅ Static image ${staticImageCorrect ? 'PASS' : 'FAIL'}`);
    
    console.log('\n📋 Test 6: Simulating User Interaction');
    console.log('=====================================');
    
    // Test 6: Simulate user interaction to test fallback behavior
    await page.click('body');
    await page.waitForTimeout(1000);
    
    const userInteractionTest = await page.evaluate(() => {
      const video1 = document.getElementById('video-1');
      const video2 = document.getElementById('video-2');
      
      return {
        video1: {
          isPlaying: video1 ? !video1.paused : false,
          currentTime: video1 ? video1.currentTime : null
        },
        video2: {
          isPlaying: video2 ? !video2.paused : false,
          currentTime: video2 ? video2.currentTime : null
        }
      };
    });
    
    console.log('🎥 User Interaction Test:', JSON.stringify(userInteractionTest, null, 2));
    
    const video1StillPlaying = userInteractionTest.video1.isPlaying;
    const video2StillPlaying = userInteractionTest.video2.isPlaying;
    
    console.log(`✅ Video 1 continuous playback ${video1StillPlaying ? 'PASS' : 'FAIL'}`);
    console.log(`✅ Video 2 continuous playback ${video2StillPlaying ? 'PASS' : 'FAIL'}`);
    
    // Generate final report
    console.log('\n📊 Final Test Results');
    console.log('=====================');
    
    const allTests = [
      { name: 'Video 1 Attributes', passed: video1Correct },
      { name: 'Video 2 Attributes', passed: video2Correct },
      { name: 'Video 1 Autoplay', passed: video1Playing },
      { name: 'Video 2 Autoplay', passed: video2Playing },
      { name: 'Video 1 Loop', passed: video1Looping },
      { name: 'Video 2 Loop', passed: video2Looping },
      { name: 'Video 1 No Controls', passed: video1NoControls },
      { name: 'Video 2 No Controls', passed: video2NoControls },
      { name: 'Static Image', passed: staticImageCorrect },
      { name: 'Video 1 Continuous Playback', passed: video1StillPlaying },
      { name: 'Video 2 Continuous Playback', passed: video2StillPlaying }
    ];
    
    const passedTests = allTests.filter(test => test.passed).length;
    const totalTests = allTests.length;
    
    console.log(`✅ Passed: ${passedTests}/${totalTests} tests`);
    
    allTests.forEach(test => {
      console.log(`${test.passed ? '✅' : '❌'} ${test.name}`);
    });
    
    if (passedTests === totalTests) {
      console.log('\n🎉 All tests passed! Video autoplay behavior is working correctly.');
    } else {
      console.log('\n⚠️ Some tests failed. Please review the video implementation.');
    }
    
  } catch (error) {
    console.error('❌ Test execution failed:', error);
  } finally {
    await browser.close();
  }
}

// Run the tests
testVideoAutoplayBehavior().catch(console.error);