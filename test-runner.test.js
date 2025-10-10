/**
 * Test Runner for Book Call Buttons
 * This script injects our test functions into the browser console for testing
 */

// Test runner code to be executed in the browser console
const testRunnerCode = `
// Load the test script
const script = document.createElement('script');
script.src = '/book-call-buttons.test.js';
document.head.appendChild(script);

// Wait for the script to load and then run tests
script.onload = function() {
  console.log('Test script loaded. You can now run tests by typing: testBookCallButtons()');
  
  // Automatically run tests after 2 seconds
  setTimeout(() => {
    console.log('Running automated tests...');
    testBookCallButtons();
  }, 2000);
};
`;

console.log(`
To test the Book Call buttons:

1. Open http://localhost:3001 in your browser
2. Open the browser console (F12 or Ctrl+Shift+I)
3. Copy and paste the following code into the console:

${testRunnerCode}

4. The tests will run automatically after 2 seconds
5. You can also run them manually by typing: testBookCallButtons()

The tests will check:
- Visual appearance (color, text, padding, rounded corners)
- Hover effects (color change, shadow enhancement)
- Functionality (links to #contact, clickability)
- Hero button icon animation
- Responsive design (desktop/mobile button visibility)
- Accessibility (focus states, keyboard navigation, color contrast)
`);