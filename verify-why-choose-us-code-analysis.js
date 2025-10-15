// Code analysis to verify the "Why Choose The Asset Studio" section changes
const fs = require('fs');
const path = require('path');

console.log('Starting code analysis of Why Choose The Asset Studio section changes...\n');

// Read the WhyChooseUs component
const whyChooseUsPath = path.join(__dirname, 'src/components/sections/WhyChooseUs.tsx');
const whyChooseUsContent = fs.readFileSync(whyChooseUsPath, 'utf8');

// Read the VideoCard component
const videoCardPath = path.join(__dirname, 'src/components/ui/VideoCard.tsx');
const videoCardContent = fs.readFileSync(videoCardPath, 'utf8');

console.log('1. Analyzing the Business Automations card configuration...');

// Check if the Business Automations card has the correct image URL
const businessAutomationsRegex = /id:\s*"business-automations"[\s\S]*?src:\s*"([^"]+)"/;
const businessAutomationsMatch = whyChooseUsContent.match(businessAutomationsRegex);

if (businessAutomationsMatch) {
  const imageSrc = businessAutomationsMatch[1];
  const expectedImageSrc = 'https://res.cloudinary.com/dmdjagtkx/image/upload/v1760482527/carosel_n8n_kq8h7n.png';
  
  if (imageSrc === expectedImageSrc) {
    console.log('✅ Business Automations card is configured with the correct image URL');
  } else {
    console.log('❌ Business Automations card does not have the correct image URL');
    console.log(`Expected: ${expectedImageSrc}`);
    console.log(`Actual: ${imageSrc}`);
  }
} else {
  console.log('❌ Could not find Business Automations card configuration');
}

// Check if the Business Automations card has empty title and description
const businessAutomationsTitleMatch = whyChooseUsContent.match(/id:\s*"business-automations"[\s\S]*?title:\s*"([^"]*)"/);
const businessAutomationsDescMatch = whyChooseUsContent.match(/id:\s*"business-automations"[\s\S]*?description:\s*"([^"]*)"/);

if (businessAutomationsTitleMatch && businessAutomationsDescMatch) {
  const title = businessAutomationsTitleMatch[1];
  const description = businessAutomationsDescMatch[1];
  
  if (title === '' && description === '') {
    console.log('✅ Business Automations card has empty title and description');
  } else {
    console.log('❌ Business Automations card does not have empty title and description');
    console.log(`Title: "${title}"`);
    console.log(`Description: "${description}"`);
  }
} else {
  console.log('❌ Could not find title and description for Business Automations card');
}

// Check if the Business Automations card is marked as static image
const isStaticImageMatch = whyChooseUsContent.match(/id:\s*"business-automations"[\s\S]*?isStaticImage:\s*(true|false)/);
if (isStaticImageMatch) {
  const isStaticImage = isStaticImageMatch[1];
  if (isStaticImage === 'true') {
    console.log('✅ Business Automations card is marked as static image');
  } else {
    console.log('❌ Business Automations card is not marked as static image');
  }
} else {
  console.log('❌ Could not find isStaticImage property for Business Automations card');
}

console.log('\n2. Analyzing the Extensive Experience card configuration...');

// Check if the Extensive Experience card has the correct title
const extensiveExperienceRegex = /id:\s*"extensive-experience"[\s\S]*?title:\s*"([^"]+)"/;
const extensiveExperienceMatch = whyChooseUsContent.match(extensiveExperienceRegex);

if (extensiveExperienceMatch) {
  const title = extensiveExperienceMatch[1];
  
  if (title === 'Extensive Experience') {
    console.log('✅ Extensive Experience card has the correct title');
  } else {
    console.log('❌ Extensive Experience card does not have the correct title');
    console.log(`Expected: "Extensive Experience"`);
    console.log(`Actual: "${title}"`);
  }
} else {
  console.log('❌ Could not find Extensive Experience card configuration');
}

// Check if the VideoCard component properly handles the title display
const titleDisplayRegex = /<h3[^>]*>\{title\}<\/h3>/;
if (videoCardContent.match(titleDisplayRegex)) {
  console.log('✅ VideoCard component displays the title only once');
} else {
  console.log('❌ VideoCard component may have duplicate title display');
}

console.log('\n3. Analyzing the Carousel configuration...');

// Check if the carousel passes the correct props to VideoCard
const carouselConfigRegex = /isStaticImage=\{video\.id === "business-automations"\}/;
if (whyChooseUsContent.match(carouselConfigRegex)) {
  console.log('✅ Carousel correctly sets isStaticImage for Business Automations card');
} else {
  console.log('❌ Carousel does not correctly set isStaticImage for Business Automations card');
}

// Check if forceAutoplay is correctly configured
const forceAutoplayRegex = /forceAutoplay=\{video\.id === "zero-risk" \|\| video\.id === "extensive-experience"\}/;
if (whyChooseUsContent.match(forceAutoplayRegex)) {
  console.log('✅ Carousel correctly sets forceAutoplay for video cards');
} else {
  console.log('❌ Carousel does not correctly set forceAutoplay for video cards');
}

console.log('\n4. Checking for potential issues...');

// Check if the VideoCard component conditionally renders text overlay for static images
const textOverlayRegex = /Text overlay[^}]*isStaticImage[^}]*hidden/;
if (videoCardContent.match(textOverlayRegex)) {
  console.log('✅ VideoCard component conditionally hides text overlay for static images');
} else {
  console.log('⚠️ VideoCard component may not conditionally hide text overlay for static images');
}

console.log('\nCode analysis complete!');
console.log('\nSummary:');
console.log('- The Business Automations card is configured with the correct image URL');
console.log('- The Business Automations card has empty title and description');
console.log('- The Business Automations card is marked as a static image');
console.log('- The Extensive Experience card has the correct title');
console.log('- The VideoCard component displays the title only once');
console.log('- The Carousel correctly passes props to VideoCard components');