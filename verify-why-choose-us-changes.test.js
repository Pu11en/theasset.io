// Test script to verify the "Why Choose The Asset Studio" section changes
const { chromium } = require('playwright');

async function verifyWhyChooseUsChanges() {
  console.log('Starting verification of Why Choose The Asset Studio section changes...\n');
  
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  // Navigate to the development server
  await page.goto('http://localhost:4000');
  
  // Wait for the page to load
  await page.waitForLoadState('networkidle');
  
  // Scroll to the Why Choose Us section
  await page.locator('#why-choose-us').scrollIntoViewIfNeeded();
  await page.waitForTimeout(2000); // Allow animations to complete
  
  console.log('1. Checking the Business Automations card (last card)...');
  
  // Check if the last card displays the correct image without text
  const businessAutomationsCard = page.locator('[data-testid="carousel-slide"]').last();
  
  // Verify the image source
  const imageElement = businessAutomationsCard.locator('img');
  const imageSrc = await imageElement.getAttribute('src');
  const expectedImageSrc = 'https://res.cloudinary.com/dmdjagtkx/image/upload/v1760482527/carosel_n8n_kq8h7n.png';
  
  if (imageSrc && imageSrc.includes('carosel_n8n_kq8h7n.png')) {
    console.log('✅ Business Automations card displays the correct image');
  } else {
    console.log('❌ Business Automations card does not display the correct image');
    console.log(`Expected: ${expectedImageSrc}`);
    console.log(`Actual: ${imageSrc}`);
  }
  
  // Check if there's no text overlay for the Business Automations card
  const titleElement = businessAutomationsCard.locator('h3');
  const descriptionElement = businessAutomationsCard.locator('p');
  
  const titleText = await titleElement.textContent();
  const descriptionText = await descriptionElement.textContent();
  
  if (!titleText && !descriptionText) {
    console.log('✅ Business Automations card has no text overlay');
  } else {
    console.log('❌ Business Automations card still has text overlay');
    console.log(`Title: ${titleText}`);
    console.log(`Description: ${descriptionText}`);
  }
  
  console.log('\n2. Checking the Extensive Experience card...');
  
  // Get all cards in the carousel
  const allCards = page.locator('[data-testid="carousel-slide"]');
  const cardCount = await allCards.count();
  
  // Find the Extensive Experience card (should be the second card)
  let extensiveExperienceCard = null;
  for (let i = 0; i < cardCount; i++) {
    const card = allCards.nth(i);
    const title = await card.locator('h3').textContent();
    if (title && title.includes('Extensive Experience')) {
      extensiveExperienceCard = card;
      break;
    }
  }
  
  if (extensiveExperienceCard) {
    // Count how many times "Extensive Experience" appears in the card
    const cardContent = await extensiveExperienceCard.textContent();
    const matches = cardContent.match(/Extensive Experience/g);
    const matchCount = matches ? matches.length : 0;
    
    if (matchCount === 1) {
      console.log('✅ Extensive Experience card shows the heading only once');
    } else {
      console.log(`❌ Extensive Experience card shows the heading ${matchCount} times`);
    }
  } else {
    console.log('❌ Could not find the Extensive Experience card');
  }
  
  console.log('\n3. Checking for console errors...');
  
  // Listen for console errors
  const consoleErrors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
    }
  });
  
  // Refresh the page to catch any errors on load
  await page.reload();
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);
  
  if (consoleErrors.length === 0) {
    console.log('✅ No console errors detected');
  } else {
    console.log('❌ Console errors detected:');
    consoleErrors.forEach(error => console.log(`  - ${error}`));
  }
  
  await browser.close();
  
  console.log('\nVerification complete!');
}

verifyWhyChooseUsChanges().catch(console.error);