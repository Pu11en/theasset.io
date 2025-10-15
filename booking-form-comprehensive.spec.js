/**
 * Comprehensive Playwright Test Suite for BookingForm Component
 * 
 * This test suite verifies all functionality of the updated BookingForm component:
 * 1. All fields are typable (Email, Phone, Industry, Current Audience, Key Messages, Visual References)
 * 2. Email Address is a required field
 * 3. Phone Number is a required field
 * 4. Preferred Contact Method field has been removed
 * 5. n8n webhook integration is maintained with JSON payload
 */

const { test, expect } = require('@playwright/test');

// Test data
const validFormData = {
  name: 'John Doe',
  businessName: 'Test Business',
  email: 'john.doe@example.com',
  phone: '+1 (555) 123-4567',
  industry: 'Technology',
  targetAudience: 'Small business owners',
  keyMessage: 'Increase brand awareness',
  visualReferences: 'https://example.com/reference1.jpg'
};

const webhookUrl = 'https://drewp.app.n8n.cloud/webhook/de92f751-0138-4303-b1c6-434349a84d02';

test.describe('BookingForm Component Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Mock the webhook to prevent actual network calls during testing
    await page.route(webhookUrl, async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true })
      });
    });

    // Navigate to test page with the BookingForm component
    await page.goto('file://' + __dirname + '/test-booking-form-integration.html');
  });

  test.describe('Component Rendering', () => {
    test('should render the form with all required fields', async ({ page }) => {
      // Open the Book Now modal
      await page.click('#bookNowBtn');
      
      // Wait for modal to appear
      await page.waitForSelector('h2:has-text("Book Your Campaign")');

      // Check for all form fields
      await expect(page.locator('label:has-text("Name")')).toBeVisible();
      await expect(page.locator('label:has-text("Business Name")')).toBeVisible();
      await expect(page.locator('label:has-text("Email Address")')).toBeVisible();
      await expect(page.locator('label:has-text("Phone Number")')).toBeVisible();
      await expect(page.locator('label:has-text("Industry")')).toBeVisible();
      await expect(page.locator('label:has-text("Current Target Audience")')).toBeVisible();
      await expect(page.locator('label:has-text("Key Message to Communicate")')).toBeVisible();
      await expect(page.locator('label:has-text("Visual References")')).toBeVisible();

      // Verify that Preferred Contact Method field is NOT present
      await expect(page.locator('label:has-text("Preferred Contact Method")')).not.toBeVisible();
    });

    test('should display correct modal title based on button clicked', async ({ page }) => {
      // Test Book Now button
      await page.click('#bookNowBtn');
      await expect(page.locator('h2:has-text("Book Your Campaign")')).toBeVisible();
      
      // Close modal
      await page.click('[aria-label="Close"]');
      
      // Test Schedule Call button
      await page.click('#scheduleCallBtn');
      await expect(page.locator('h2:has-text("Schedule Your Free Call")')).toBeVisible();
    });

    test('should show required field indicators for required fields', async ({ page }) => {
      await page.click('#bookNowBtn');
      await page.waitForSelector('h2:has-text("Book Your Campaign")');

      // Check for asterisks on required fields
      const nameField = page.locator('label:has-text("Name")');
      await expect(nameField.locator('text=*')).toBeVisible();
      
      const businessNameField = page.locator('label:has-text("Business Name")');
      await expect(businessNameField.locator('text=*')).toBeVisible();
      
      const emailField = page.locator('label:has-text("Email Address")');
      await expect(emailField.locator('text=*')).toBeVisible();
      
      const phoneField = page.locator('label:has-text("Phone Number")');
      await expect(phoneField.locator('text=*')).toBeVisible();
      
      const industryField = page.locator('label:has-text("Industry")');
      await expect(industryField.locator('text=*')).toBeVisible();

      // Check that optional fields don't have asterisks
      const targetAudienceField = page.locator('label:has-text("Current Target Audience")');
      await expect(targetAudienceField.locator('text=*')).not.toBeVisible();
    });
  });

  test.describe('Field Typability Tests', () => {
    test('should allow typing in all form fields', async ({ page }) => {
      await page.click('#bookNowBtn');
      await page.waitForSelector('h2:has-text("Book Your Campaign")');

      // Test typing in each field
      await page.fill('input[name="name"]', validFormData.name);
      await page.fill('input[name="businessName"]', validFormData.businessName);
      await page.fill('input[name="email"]', validFormData.email);
      await page.fill('input[name="phone"]', validFormData.phone);
      await page.fill('input[name="industry"]', validFormData.industry);
      await page.fill('textarea[name="targetAudience"]', validFormData.targetAudience);
      await page.fill('textarea[name="keyMessage"]', validFormData.keyMessage);
      await page.fill('textarea[name="visualReferences"]', validFormData.visualReferences);

      // Verify all fields have the correct values
      await expect(page.locator('input[name="name"]')).toHaveValue(validFormData.name);
      await expect(page.locator('input[name="businessName"]')).toHaveValue(validFormData.businessName);
      await expect(page.locator('input[name="email"]')).toHaveValue(validFormData.email);
      await expect(page.locator('input[name="phone"]')).toHaveValue(validFormData.phone);
      await expect(page.locator('input[name="industry"]')).toHaveValue(validFormData.industry);
      await expect(page.locator('textarea[name="targetAudience"]')).toHaveValue(validFormData.targetAudience);
      await expect(page.locator('textarea[name="keyMessage"]')).toHaveValue(validFormData.keyMessage);
      await expect(page.locator('textarea[name="visualReferences"]')).toHaveValue(validFormData.visualReferences);
    });

    test('should accept special characters in text fields', async ({ page }) => {
      await page.click('#bookNowBtn');
      await page.waitForSelector('h2:has-text("Book Your Campaign")');

      const specialCharText = "Test & Special Characters (123) - #@$%";
      await page.fill('input[name="industry"]', specialCharText);
      await expect(page.locator('input[name="industry"]')).toHaveValue(specialCharText);
    });

    test('should accept multiline text in textarea fields', async ({ page }) => {
      await page.click('#bookNowBtn');
      await page.waitForSelector('h2:has-text("Book Your Campaign")');

      const multilineText = "Line 1\nLine 2\nLine 3";
      await page.fill('textarea[name="targetAudience"]', multilineText);
      await expect(page.locator('textarea[name="targetAudience"]')).toHaveValue(multilineText);
    });
  });

  test.describe('Form Validation Tests', () => {
    test('should show validation errors for all required fields when submitting empty form', async ({ page }) => {
      await page.click('#bookNowBtn');
      await page.waitForSelector('h2:has-text("Book Your Campaign")');

      // Submit empty form
      await page.click('button:has-text("Book Campaign")');

      // Check for all required field errors
      await expect(page.locator('text=Name is required')).toBeVisible();
      await expect(page.locator('text=Business name is required')).toBeVisible();
      await expect(page.locator('text=Email address is required')).toBeVisible();
      await expect(page.locator('text=Phone number is required')).toBeVisible();
      await expect(page.locator('text=Industry is required')).toBeVisible();
    });

    test('should validate email format', async ({ page }) => {
      await page.click('#bookNowBtn');
      await page.waitForSelector('h2:has-text("Book Your Campaign")');

      // Fill form with invalid email
      await page.fill('input[name="name"]', validFormData.name);
      await page.fill('input[name="businessName"]', validFormData.businessName);
      await page.fill('input[name="email"]', 'invalid-email');
      await page.fill('input[name="phone"]', validFormData.phone);
      await page.fill('input[name="industry"]', validFormData.industry);

      // Submit form
      await page.click('button:has-text("Book Campaign")');

      // Check for email validation error
      await expect(page.locator('text=Please enter a valid email address')).toBeVisible();
    });

    test('should validate phone number format and length', async ({ page }) => {
      await page.click('#bookNowBtn');
      await page.waitForSelector('h2:has-text("Book Your Campaign")');

      // Fill form with invalid phone
      await page.fill('input[name="name"]', validFormData.name);
      await page.fill('input[name="businessName"]', validFormData.businessName);
      await page.fill('input[name="email"]', validFormData.email);
      await page.fill('input[name="phone"]', '123'); // Too short
      await page.fill('input[name="industry"]', validFormData.industry);

      // Submit form
      await page.click('button:has-text("Book Campaign")');

      // Check for phone validation error
      await expect(page.locator('text=Phone number must be at least 10 digits')).toBeVisible();
    });

    test('should validate minimum length for text fields', async ({ page }) => {
      await page.click('#bookNowBtn');
      await page.waitForSelector('h2:has-text("Book Your Campaign")');

      // Fill form with single character values
      await page.fill('input[name="name"]', 'a');
      await page.fill('input[name="businessName"]', 'b');
      await page.fill('input[name="email"]', validFormData.email);
      await page.fill('input[name="phone"]', validFormData.phone);
      await page.fill('input[name="industry"]', 'c');

      // Submit form
      await page.click('button:has-text("Book Campaign")');

      // Check for length validation errors
      await expect(page.locator('text=Name must be at least 2 characters long')).toBeVisible();
      await expect(page.locator('text=Business name must be at least 2 characters long')).toBeVisible();
      await expect(page.locator('text=Industry must be at least 2 characters long')).toBeVisible();
    });

    test('should clear field errors when user starts typing', async ({ page }) => {
      await page.click('#bookNowBtn');
      await page.waitForSelector('h2:has-text("Book Your Campaign")');

      // Submit empty form to trigger errors
      await page.click('button:has-text("Book Campaign")');

      // Wait for errors to appear
      await expect(page.locator('text=Name is required')).toBeVisible();

      // Start typing in name field
      await page.fill('input[name="name"]', 'John');

      // Error should be cleared
      await expect(page.locator('text=Name is required')).not.toBeVisible();
    });
  });

  test.describe('Form Submission Tests', () => {
    test('should submit successfully with valid data', async ({ page }) => {
      await page.click('#bookNowBtn');
      await page.waitForSelector('h2:has-text("Book Your Campaign")');

      // Fill form with valid data
      await page.fill('input[name="name"]', validFormData.name);
      await page.fill('input[name="businessName"]', validFormData.businessName);
      await page.fill('input[name="email"]', validFormData.email);
      await page.fill('input[name="phone"]', validFormData.phone);
      await page.fill('input[name="industry"]', validFormData.industry);
      await page.fill('textarea[name="targetAudience"]', validFormData.targetAudience);
      await page.fill('textarea[name="keyMessage"]', validFormData.keyMessage);
      await page.fill('textarea[name="visualReferences"]', validFormData.visualReferences);

      // Submit form
      await page.click('button:has-text("Book Campaign")');

      // Check for success message
      await expect(page.locator('text=Thank You!')).toBeVisible();
      await expect(page.locator('text=Your campaign booking has been received')).toBeVisible();
    });

    test('should show loading state during submission', async ({ page }) => {
      // Mock a delayed response
      await page.unroute(webhookUrl);
      await page.route(webhookUrl, async route => {
        // Delay response by 1 second
        await new Promise(resolve => setTimeout(resolve, 1000));
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ success: true })
        });
      });

      await page.click('#bookNowBtn');
      await page.waitForSelector('h2:has-text("Book Your Campaign")');

      // Fill form with valid data
      await page.fill('input[name="name"]', validFormData.name);
      await page.fill('input[name="businessName"]', validFormData.businessName);
      await page.fill('input[name="email"]', validFormData.email);
      await page.fill('input[name="phone"]', validFormData.phone);
      await page.fill('input[name="industry"]', validFormData.industry);

      // Submit form
      await page.click('button:has-text("Book Campaign")');

      // Check for loading state
      await expect(page.locator('text=Submitting...')).toBeVisible();
      await expect(page.locator('button:has-text("Submitting...")')).toBeDisabled();
    });

    test('should handle submission errors gracefully', async ({ page }) => {
      // Mock a failed response
      await page.unroute(webhookUrl);
      await page.route(webhookUrl, async route => {
        await route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'Server error' })
        });
      });

      await page.click('#bookNowBtn');
      await page.waitForSelector('h2:has-text("Book Your Campaign")');

      // Fill form with valid data
      await page.fill('input[name="name"]', validFormData.name);
      await page.fill('input[name="businessName"]', validFormData.businessName);
      await page.fill('input[name="email"]', validFormData.email);
      await page.fill('input[name="phone"]', validFormData.phone);
      await page.fill('input[name="industry"]', validFormData.industry);

      // Submit form
      await page.click('button:has-text("Book Campaign")');

      // Check for error message
      await expect(page.locator('text=Submission Error')).toBeVisible();
      await expect(page.locator('text=Failed to submit form')).toBeVisible();
    });

    test('should reset form and close modal after successful submission', async ({ page }) => {
      await page.click('#bookNowBtn');
      await page.waitForSelector('h2:has-text("Book Your Campaign")');

      // Fill form with valid data
      await page.fill('input[name="name"]', validFormData.name);
      await page.fill('input[name="businessName"]', validFormData.businessName);
      await page.fill('input[name="email"]', validFormData.email);
      await page.fill('input[name="phone"]', validFormData.phone);
      await page.fill('input[name="industry"]', validFormData.industry);

      // Submit form
      await page.click('button:has-text("Book Campaign")');

      // Wait for success message
      await expect(page.locator('text=Thank You!')).toBeVisible();

      // Wait for modal to close (after 3 seconds)
      await page.waitForTimeout(3500);

      // Check that modal is closed
      await expect(page.locator('h2:has-text("Book Your Campaign")')).not.toBeVisible();
    });
  });

  test.describe('Webhook Payload Tests', () => {
    test('should send correct JSON payload structure to webhook', async ({ page }) => {
      let capturedPayload = null;

      // Capture the webhook payload
      await page.unroute(webhookUrl);
      await page.route(webhookUrl, async route => {
        const postData = route.request().postData();
        capturedPayload = JSON.parse(postData);
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ success: true })
        });
      });

      await page.click('#bookNowBtn');
      await page.waitForSelector('h2:has-text("Book Your Campaign")');

      // Fill form with valid data
      await page.fill('input[name="name"]', validFormData.name);
      await page.fill('input[name="businessName"]', validFormData.businessName);
      await page.fill('input[name="email"]', validFormData.email);
      await page.fill('input[name="phone"]', validFormData.phone);
      await page.fill('input[name="industry"]', validFormData.industry);
      await page.fill('textarea[name="targetAudience"]', validFormData.targetAudience);
      await page.fill('textarea[name="keyMessage"]', validFormData.keyMessage);
      await page.fill('textarea[name="visualReferences"]', validFormData.visualReferences);

      // Submit form
      await page.click('button:has-text("Book Campaign")');

      // Wait for the webhook to be called
      await page.waitForTimeout(1000);

      // Verify webhook payload structure
      expect(capturedPayload).not.toBeNull();
      expect(capturedPayload).toHaveProperty('name', validFormData.name);
      expect(capturedPayload).toHaveProperty('businessName', validFormData.businessName);
      expect(capturedPayload).toHaveProperty('email', validFormData.email);
      expect(capturedPayload).toHaveProperty('phone', validFormData.phone);
      expect(capturedPayload).toHaveProperty('industry', validFormData.industry);
      expect(capturedPayload).toHaveProperty('targetAudience', validFormData.targetAudience);
      expect(capturedPayload).toHaveProperty('keyMessage', validFormData.keyMessage);
      expect(capturedPayload).toHaveProperty('visualReferences', validFormData.visualReferences);
      
      // Verify additional metadata
      expect(capturedPayload).toHaveProperty('ctaButton', 'Book Now');
      expect(capturedPayload).toHaveProperty('timestamp');
      expect(typeof capturedPayload.timestamp).toBe('string');
      
      // Verify the payload doesn't include removed fields
      expect(capturedPayload).not.toHaveProperty('preferredContactMethod');
      expect(capturedPayload).not.toHaveProperty('contactType');
      expect(capturedPayload).not.toHaveProperty('contactInfo');
    });

    test('should handle empty optional fields in payload', async ({ page }) => {
      let capturedPayload = null;

      // Capture the webhook payload
      await page.unroute(webhookUrl);
      await page.route(webhookUrl, async route => {
        const postData = route.request().postData();
        capturedPayload = JSON.parse(postData);
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ success: true })
        });
      });

      await page.click('#scheduleCallBtn');
      await page.waitForSelector('h2:has-text("Schedule Your Free Call")');

      // Fill only required fields
      await page.fill('input[name="name"]', validFormData.name);
      await page.fill('input[name="businessName"]', validFormData.businessName);
      await page.fill('input[name="email"]', validFormData.email);
      await page.fill('input[name="phone"]', validFormData.phone);
      await page.fill('input[name="industry"]', validFormData.industry);

      // Submit form
      await page.click('button:has-text("Schedule Call")');

      // Wait for the webhook to be called
      await page.waitForTimeout(1000);

      // Verify webhook payload structure
      expect(capturedPayload).not.toBeNull();
      
      // Verify optional fields are empty strings
      expect(capturedPayload).toHaveProperty('targetAudience', '');
      expect(capturedPayload).toHaveProperty('keyMessage', '');
      expect(capturedPayload).toHaveProperty('visualReferences', '');
      
      // Verify CTA button is correct
      expect(capturedPayload).toHaveProperty('ctaButton', 'Schedule Your Free Call');
    });
  });

  test.describe('Modal Interaction Tests', () => {
    test('should close modal when close button is clicked', async ({ page }) => {
      await page.click('#bookNowBtn');
      await page.waitForSelector('h2:has-text("Book Your Campaign")');

      // Click close button
      await page.click('[aria-label="Close"]');

      // Check that modal is closed
      await expect(page.locator('h2:has-text("Book Your Campaign")')).not.toBeVisible();
    });

    test('should close modal when backdrop is clicked', async ({ page }) => {
      await page.click('#bookNowBtn');
      await page.waitForSelector('h2:has-text("Book Your Campaign")');

      // Click backdrop (the overlay behind the modal)
      await page.click('.fixed.inset-0.bg-black\\/50');

      // Check that modal is closed
      await expect(page.locator('h2:has-text("Book Your Campaign")')).not.toBeVisible();
    });

    test('should prevent closing modal during submission', async ({ page }) => {
      // Mock a delayed response
      await page.unroute(webhookUrl);
      await page.route(webhookUrl, async route => {
        // Delay response by 2 seconds
        await new Promise(resolve => setTimeout(resolve, 2000));
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ success: true })
        });
      });

      await page.click('#bookNowBtn');
      await page.waitForSelector('h2:has-text("Book Your Campaign")');

      // Fill form with valid data
      await page.fill('input[name="name"]', validFormData.name);
      await page.fill('input[name="businessName"]', validFormData.businessName);
      await page.fill('input[name="email"]', validFormData.email);
      await page.fill('input[name="phone"]', validFormData.phone);
      await page.fill('input[name="industry"]', validFormData.industry);

      // Submit form
      await page.click('button:has-text("Book Campaign")');

      // Try to close modal during submission
      const closeButton = page.locator('[aria-label="Close"]');
      await closeButton.click();

      // Close button should be disabled and modal should remain open
      await expect(closeButton).toBeDisabled();
      await expect(page.locator('h2:has-text("Book Your Campaign")')).toBeVisible();
    });
  });

  test.describe('Accessibility Tests', () => {
    test('should have proper ARIA labels and roles', async ({ page }) => {
      await page.click('#bookNowBtn');
      await page.waitForSelector('h2:has-text("Book Your Campaign")');

      // Check for proper form structure
      await expect(page.locator('[role="dialog"]')).toBeVisible();
      await expect(page.locator('form')).toBeVisible();
      
      // Check for proper labels
      await expect(page.locator('label:has-text("Name")')).toBeVisible();
      await expect(page.locator('label:has-text("Business Name")')).toBeVisible();
      await expect(page.locator('label:has-text("Email Address")')).toBeVisible();
      await expect(page.locator('label:has-text("Phone Number")')).toBeVisible();
      await expect(page.locator('label:has-text("Industry")')).toBeVisible();
    });

    test('should show error messages with proper accessibility', async ({ page }) => {
      await page.click('#bookNowBtn');
      await page.waitForSelector('h2:has-text("Book Your Campaign")');

      // Submit empty form
      await page.click('button:has-text("Book Campaign")');

      // Check for error messages
      await expect(page.locator('text=Name is required')).toBeVisible();
      await expect(page.locator('text=Email address is required')).toBeVisible();

      // Check that error messages are properly associated with inputs
      const nameInput = page.locator('input[name="name"]');
      await expect(nameInput).toHaveAttribute('aria-invalid', 'true');
    });
  });

  test.describe('Edge Cases', () => {
    test('should handle very long text inputs', async ({ page }) => {
      await page.click('#bookNowBtn');
      await page.waitForSelector('h2:has-text("Book Your Campaign")');

      const longText = 'a'.repeat(1000);
      
      await page.fill('textarea[name="targetAudience"]', longText);
      await expect(page.locator('textarea[name="targetAudience"]')).toHaveValue(longText);
    });

    test('should handle special characters in email', async ({ page }) => {
      await page.click('#bookNowBtn');
      await page.waitForSelector('h2:has-text("Book Your Campaign")');

      const specialEmail = 'test+special@example-domain.co.uk';
      
      await page.fill('input[name="name"]', validFormData.name);
      await page.fill('input[name="businessName"]', validFormData.businessName);
      await page.fill('input[name="email"]', specialEmail);
      await page.fill('input[name="phone"]', validFormData.phone);
      await page.fill('input[name="industry"]', validFormData.industry);

      // Submit form
      await page.click('button:has-text("Book Campaign")');

      // Should not show email validation error
      await expect(page.locator('text=Please enter a valid email address')).not.toBeVisible();
    });

    test('should handle international phone numbers', async ({ page }) => {
      await page.click('#bookNowBtn');
      await page.waitForSelector('h2:has-text("Book Your Campaign")');

      const internationalPhone = '+44 20 7123 4567';
      
      await page.fill('input[name="name"]', validFormData.name);
      await page.fill('input[name="businessName"]', validFormData.businessName);
      await page.fill('input[name="email"]', validFormData.email);
      await page.fill('input[name="phone"]', internationalPhone);
      await page.fill('input[name="industry"]', validFormData.industry);

      // Submit form
      await page.click('button:has-text("Book Campaign")');

      // Should not show phone validation error
      await expect(page.locator('text=Please enter a valid phone number')).not.toBeVisible();
    });
  });
});

module.exports = {
  validFormData,
  webhookUrl
};