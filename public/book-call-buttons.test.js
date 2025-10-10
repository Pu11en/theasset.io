/**
 * Test Script for Book Call Buttons
 * This script tests the visual appearance, functionality, and accessibility of the Book Call buttons
 */

// Expected color values based on implementation
const EXPECTED_COLORS = {
  background: '#FACC15', // yellow-400 (same as "90 days" text)
  text: '#000000', // black text
  focusRing: '#FACC15' // yellow-400 focus ring
};

// Button locations to test
const BUTTON_LOCATIONS = {
  desktopNav: {
    selector: 'nav a[href="#contact"]',
    description: 'Desktop navigation Book Call button'
  },
  mobileNav: {
    selector: '.md:hidden a[href="#contact"]',
    description: 'Mobile navigation Book Call button'
  },
  heroSection: {
    selector: '#home a[href="#contact"]',
    description: 'Hero section Book Call button with arrow'
  }
};

// Test functions
function testButtonAppearance() {
  console.log('=== Testing Button Appearance ===');
  
  Object.entries(BUTTON_LOCATIONS).forEach(([key, location]) => {
    const button = document.querySelector(location.selector);
    if (!button) {
      console.error(`❌ ${location.description}: Button not found`);
      return;
    }
    
    // Get computed styles
    const styles = window.getComputedStyle(button);
    const backgroundColor = styles.backgroundColor;
    const color = styles.color;
    const padding = styles.padding;
    const borderRadius = styles.borderRadius;
    
    // Convert RGB to hex for comparison
    const rgbToHex = (rgb) => {
      const result = rgb.match(/\d+/g);
      if (!result) return rgb;
      return "#" + ((1 << 24) + (parseInt(result[0]) << 16) + (parseInt(result[1]) << 8) + parseInt(result[2])).toString(16).slice(1);
    };
    
    const hexBgColor = rgbToHex(backgroundColor);
    
    // Test background color
    if (hexBgColor.toLowerCase() === EXPECTED_COLORS.background.toLowerCase()) {
      console.log(`✅ ${location.description}: Background color is correct (${hexBgColor})`);
    } else {
      console.log(`❌ ${location.description}: Background color is ${hexBgColor}, expected ${EXPECTED_COLORS.background}`);
    }
    
    // Test text color
    if (color === EXPECTED_COLORS.text || color === 'rgb(255, 255, 255)') {
      console.log(`✅ ${location.description}: Text color is correct (${color})`);
    } else {
      console.log(`❌ ${location.description}: Text color is ${color}, expected ${EXPECTED_COLORS.text}`);
    }
    
    // Test padding (should have proper padding for smaller lg size)
    if (padding.includes('24px') || padding.includes('1.5rem')) {
      console.log(`✅ ${location.description}: Padding is appropriate (${padding})`);
    } else {
      console.log(`⚠️ ${location.description}: Padding might need adjustment (${padding})`);
    }
    
    // Test border radius
    if (borderRadius !== '0px') {
      console.log(`✅ ${location.description}: Has rounded corners (${borderRadius})`);
    } else {
      console.log(`❌ ${location.description}: Missing rounded corners`);
    }
  });
}

function testButtonHover() {
  console.log('\n=== Testing Button Hover Effects ===');
  
  Object.entries(BUTTON_LOCATIONS).forEach(([key, location]) => {
    const button = document.querySelector(location.selector);
    if (!button) {
      console.error(`❌ ${location.description}: Button not found`);
      return;
    }
    
    // Create hover event
    const hoverEvent = new Event('mouseover', { bubbles: true });
    button.dispatchEvent(hoverEvent);
    
    // Check styles after hover
    setTimeout(() => {
      const styles = window.getComputedStyle(button);
      const backgroundColor = styles.backgroundColor;
      const boxShadow = styles.boxShadow;
      
      // Convert RGB to hex for comparison
      const rgbToHex = (rgb) => {
        const result = rgb.match(/\d+/g);
        if (!result) return rgb;
        return "#" + ((1 << 24) + (parseInt(result[0]) << 16) + (parseInt(result[1]) << 8) + parseInt(result[2])).toString(16).slice(1);
      };
      
      const hexBgColor = rgbToHex(backgroundColor);
      
      // Check if background stays the same (static button)
      if (hexBgColor.toLowerCase() === EXPECTED_COLORS.background.toLowerCase()) {
        console.log(`✅ ${location.description}: Background is static (${hexBgColor})`);
      } else {
        console.log(`⚠️ ${location.description}: Background changes on hover (${hexBgColor})`);
      }
      
      // Check for shadow (should be static)
      if (boxShadow && boxShadow !== 'none') {
        console.log(`✅ ${location.description}: Has shadow effect`);
      } else {
        console.log(`⚠️ ${location.description}: Shadow effect may be missing`);
      }
      
      // Remove hover
      const leaveEvent = new Event('mouseout', { bubbles: true });
      button.dispatchEvent(leaveEvent);
    }, 100);
  });
}

function testButtonFunctionality() {
  console.log('\n=== Testing Button Functionality ===');
  
  Object.entries(BUTTON_LOCATIONS).forEach(([key, location]) => {
    const button = document.querySelector(location.selector);
    if (!button) {
      console.error(`❌ ${location.description}: Button not found`);
      return;
    }
    
    // Test href attribute
    const href = button.getAttribute('href');
    if (href === '#contact') {
      console.log(`✅ ${location.description}: Links to #contact section`);
    } else {
      console.log(`❌ ${location.description}: Links to ${href}, expected #contact`);
    }
    
    // Test if clickable
    const isClickable = button.tagName === 'A' || button.onclick !== null;
    if (isClickable) {
      console.log(`✅ ${location.description}: Is clickable`);
    } else {
      console.log(`❌ ${location.description}: May not be clickable`);
    }
  });
}

function testHeroButtonIcon() {
  console.log('\n=== Testing Hero Button Icon Animation ===');
  
  const heroButton = document.querySelector(BUTTON_LOCATIONS.heroSection.selector);
  if (!heroButton) {
    console.error('❌ Hero button not found');
    return;
  }
  
  // Check for ArrowRight icon
  const arrowIcon = heroButton.querySelector('svg');
  if (arrowIcon) {
    console.log('✅ Hero button has ArrowRight icon');
    
    // Test hover animation
    const hoverEvent = new Event('mouseover', { bubbles: true });
    heroButton.dispatchEvent(hoverEvent);
    
    setTimeout(() => {
      const iconStyles = window.getComputedStyle(arrowIcon);
      const transform = iconStyles.transform;
      
      if (transform && transform !== 'none') {
        console.log('⚠️ Hero button icon animates on hover (should be static)');
      } else {
        console.log('✅ Hero button icon is static (no animation)');
      }
      
      // Remove hover
      const leaveEvent = new Event('mouseout', { bubbles: true });
      heroButton.dispatchEvent(leaveEvent);
    }, 100);
  } else {
    console.log('❌ Hero button missing ArrowRight icon');
  }
}

function testResponsiveDesign() {
  console.log('\n=== Testing Responsive Design ===');
  
  // Check mobile menu button visibility
  const mobileMenuButton = document.querySelector('.md\\:hidden button');
  if (mobileMenuButton) {
    console.log('✅ Mobile menu button is present');
  } else {
    console.log('❌ Mobile menu button not found');
  }
  
  // Check desktop button visibility
  const desktopNavButton = document.querySelector('.hidden.md\\:block a[href="#contact"]');
  if (desktopNavButton) {
    console.log('✅ Desktop navigation button is present');
  } else {
    console.log('❌ Desktop navigation button not found');
  }
  
  // Check mobile button visibility
  const mobileNavButton = document.querySelector('.md\\:hidden a[href="#contact"]');
  if (mobileNavButton) {
    console.log('✅ Mobile navigation button is present');
  } else {
    console.log('❌ Mobile navigation button not found');
  }
}

function testAccessibility() {
  console.log('\n=== Testing Accessibility ===');
  
  Object.entries(BUTTON_LOCATIONS).forEach(([key, location]) => {
    const button = document.querySelector(location.selector);
    if (!button) {
      console.error(`❌ ${location.description}: Button not found`);
      return;
    }
    
    // Test for focusable elements
    const isFocusable = button.tabIndex >= 0;
    if (isFocusable) {
      console.log(`✅ ${location.description}: Is focusable`);
    } else {
      console.log(`⚠️ ${location.description}: May not be focusable`);
    }
    
    // Check for focus styles
    button.focus();
    const styles = window.getComputedStyle(button);
    const outline = styles.outline;
    const boxShadow = styles.boxShadow;
    
    if (outline !== 'none' || (boxShadow && boxShadow.includes('rgb'))) {
      console.log(`✅ ${location.description}: Has focus styles`);
    } else {
      console.log(`⚠️ ${location.description}: Focus styles may not be visible`);
    }
    
    // Check for color contrast (simplified)
    const bgColor = styles.backgroundColor;
    const textColor = styles.color;
    
    // Basic contrast check - black text on yellow background should have good contrast
    if (bgColor.includes('250') && bgColor.includes('204') && textColor.includes('0')) {
      console.log(`✅ ${location.description}: Likely has good color contrast`);
    } else {
      console.log(`⚠️ ${location.description}: Color contrast should be verified`);
    }
  });
}

// Run all tests
function runAllTests() {
  console.log('🧪 Starting Book Call Button Tests\n');
  
  testButtonAppearance();
  testButtonHover();
  testButtonFunctionality();
  testHeroButtonIcon();
  testResponsiveDesign();
  testAccessibility();
  
  console.log('\n✅ Tests completed!');
}

// Export for use in browser console
window.testBookCallButtons = runAllTests;
console.log('To run tests, type: testBookCallButtons() in the console');