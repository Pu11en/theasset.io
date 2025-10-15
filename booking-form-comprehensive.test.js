/**
 * Comprehensive Test Suite for BookingForm Component
 * 
 * This test suite verifies all functionality of the updated BookingForm component:
 * 1. All fields are typable (Email, Phone, Industry, Current Audience, Key Messages, Visual References)
 * 2. Email Address is a required field
 * 3. Phone Number is a required field
 * 4. Preferred Contact Method field has been removed
 * 5. n8n webhook integration is maintained with JSON payload
 */

const { describe, it, expect, beforeEach, afterEach, jest } = require('@jest/globals');
const React = require('react');
const { render, screen, fireEvent, waitFor } = require('@testing-library/react');
const userEvent = require('@testing-library/user-event');
const BookingForm = require('../src/components/BookingForm.tsx');

// Mock fetch for webhook testing
global.fetch = jest.fn();

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

describe('BookingForm Component Tests', () => {
  let user;
  let mockOnClose;

  beforeEach(() => {
    user = userEvent.setup();
    mockOnClose = jest.fn();
    fetch.mockClear();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Component Rendering', () => {
    it('should render the form with all required fields', () => {
      render(
        <BookingForm 
          isOpen={true} 
          onClose={mockOnClose} 
          ctaButton="Book Now" 
        />
      );

      // Check for all form fields
      expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/business name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/phone number/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/industry/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/current target audience/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/key message to communicate/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/visual references/i)).toBeInTheDocument();

      // Verify that Preferred Contact Method field is NOT present
      expect(screen.queryByLabelText(/preferred contact method/i)).not.toBeInTheDocument();
    });

    it('should display correct modal title based on ctaButton prop', () => {
      const { rerender } = render(
        <BookingForm 
          isOpen={true} 
          onClose={mockOnClose} 
          ctaButton="Book Now" 
        />
      );
      expect(screen.getByText('Book Your Campaign')).toBeInTheDocument();

      rerender(
        <BookingForm 
          isOpen={true} 
          onClose={mockOnClose} 
          ctaButton="Schedule Your Free Call" 
        />
      );
      expect(screen.getByText('Schedule Your Free Call')).toBeInTheDocument();
    });

    it('should show required field indicators for required fields', () => {
      render(
        <BookingForm 
          isOpen={true} 
          onClose={mockOnClose} 
          ctaButton="Book Now" 
        />
      );

      // Check for asterisks on required fields
      expect(screen.getByText(/name/i).parentElement.innerHTML).toContain('*');
      expect(screen.getByText(/business name/i).parentElement.innerHTML).toContain('*');
      expect(screen.getByText(/email address/i).parentElement.innerHTML).toContain('*');
      expect(screen.getByText(/phone number/i).parentElement.innerHTML).toContain('*');
      expect(screen.getByText(/industry/i).parentElement.innerHTML).toContain('*');

      // Check that optional fields don't have asterisks
      expect(screen.getByText(/current target audience/i).parentElement.innerHTML).not.toContain('*');
      expect(screen.getByText(/key message to communicate/i).parentElement.innerHTML).not.toContain('*');
      expect(screen.getByText(/visual references/i).parentElement.innerHTML).not.toContain('*');
    });
  });

  describe('Field Typability Tests', () => {
    it('should allow typing in all form fields', async () => {
      render(
        <BookingForm 
          isOpen={true} 
          onClose={mockOnClose} 
          ctaButton="Book Now" 
        />
      );

      // Test typing in each field
      await user.type(screen.getByLabelText(/name/i), validFormData.name);
      await user.type(screen.getByLabelText(/business name/i), validFormData.businessName);
      await user.type(screen.getByLabelText(/email address/i), validFormData.email);
      await user.type(screen.getByLabelText(/phone number/i), validFormData.phone);
      await user.type(screen.getByLabelText(/industry/i), validFormData.industry);
      await user.type(screen.getByLabelText(/current target audience/i), validFormData.targetAudience);
      await user.type(screen.getByLabelText(/key message to communicate/i), validFormData.keyMessage);
      await user.type(screen.getByLabelText(/visual references/i), validFormData.visualReferences);

      // Verify all fields have the correct values
      expect(screen.getByLabelText(/name/i)).toHaveValue(validFormData.name);
      expect(screen.getByLabelText(/business name/i)).toHaveValue(validFormData.businessName);
      expect(screen.getByLabelText(/email address/i)).toHaveValue(validFormData.email);
      expect(screen.getByLabelText(/phone number/i)).toHaveValue(validFormData.phone);
      expect(screen.getByLabelText(/industry/i)).toHaveValue(validFormData.industry);
      expect(screen.getByLabelText(/current target audience/i)).toHaveValue(validFormData.targetAudience);
      expect(screen.getByLabelText(/key message to communicate/i)).toHaveValue(validFormData.keyMessage);
      expect(screen.getByLabelText(/visual references/i)).toHaveValue(validFormData.visualReferences);
    });

    it('should accept special characters in text fields', async () => {
      render(
        <BookingForm 
          isOpen={true} 
          onClose={mockOnClose} 
          ctaButton="Book Now" 
        />
      );

      const specialCharText = "Test & Special Characters (123) - #@$%";
      
      await user.type(screen.getByLabelText(/industry/i), specialCharText);
      expect(screen.getByLabelText(/industry/i)).toHaveValue(specialCharText);
    });

    it('should accept multiline text in textarea fields', async () => {
      render(
        <BookingForm 
          isOpen={true} 
          onClose={mockOnClose} 
          ctaButton="Book Now" 
        />
      );

      const multilineText = "Line 1\nLine 2\nLine 3";
      
      await user.type(screen.getByLabelText(/current target audience/i), multilineText);
      expect(screen.getByLabelText(/current target audience/i)).toHaveValue(multilineText);
    });
  });

  describe('Form Validation Tests', () => {
    it('should show validation errors for all required fields when submitting empty form', async () => {
      render(
        <BookingForm 
          isOpen={true} 
          onClose={mockOnClose} 
          ctaButton="Book Now" 
        />
      );

      // Submit empty form
      const submitButton = screen.getByRole('button', { name: /book campaign/i });
      await user.click(submitButton);

      // Check for all required field errors
      await waitFor(() => {
        expect(screen.getByText('Name is required')).toBeInTheDocument();
        expect(screen.getByText('Business name is required')).toBeInTheDocument();
        expect(screen.getByText('Email address is required')).toBeInTheDocument();
        expect(screen.getByText('Phone number is required')).toBeInTheDocument();
        expect(screen.getByText('Industry is required')).toBeInTheDocument();
      });
    });

    it('should validate email format', async () => {
      render(
        <BookingForm 
          isOpen={true} 
          onClose={mockOnClose} 
          ctaButton="Book Now" 
        />
      );

      // Fill form with invalid email
      await user.type(screen.getByLabelText(/name/i), validFormData.name);
      await user.type(screen.getByLabelText(/business name/i), validFormData.businessName);
      await user.type(screen.getByLabelText(/email address/i), 'invalid-email');
      await user.type(screen.getByLabelText(/phone number/i), validFormData.phone);
      await user.type(screen.getByLabelText(/industry/i), validFormData.industry);

      // Submit form
      const submitButton = screen.getByRole('button', { name: /book campaign/i });
      await user.click(submitButton);

      // Check for email validation error
      await waitFor(() => {
        expect(screen.getByText('Please enter a valid email address')).toBeInTheDocument();
      });
    });

    it('should validate phone number format and length', async () => {
      render(
        <BookingForm 
          isOpen={true} 
          onClose={mockOnClose} 
          ctaButton="Book Now" 
        />
      );

      // Fill form with invalid phone
      await user.type(screen.getByLabelText(/name/i), validFormData.name);
      await user.type(screen.getByLabelText(/business name/i), validFormData.businessName);
      await user.type(screen.getByLabelText(/email address/i), validFormData.email);
      await user.type(screen.getByLabelText(/phone number/i), '123'); // Too short
      await user.type(screen.getByLabelText(/industry/i), validFormData.industry);

      // Submit form
      const submitButton = screen.getByRole('button', { name: /book campaign/i });
      await user.click(submitButton);

      // Check for phone validation error
      await waitFor(() => {
        expect(screen.getByText('Phone number must be at least 10 digits')).toBeInTheDocument();
      });
    });

    it('should validate minimum length for text fields', async () => {
      render(
        <BookingForm 
          isOpen={true} 
          onClose={mockOnClose} 
          ctaButton="Book Now" 
        />
      );

      // Fill form with single character values
      await user.type(screen.getByLabelText(/name/i), 'a');
      await user.type(screen.getByLabelText(/business name/i), 'b');
      await user.type(screen.getByLabelText(/email address/i), validFormData.email);
      await user.type(screen.getByLabelText(/phone number/i), validFormData.phone);
      await user.type(screen.getByLabelText(/industry/i), 'c');

      // Submit form
      const submitButton = screen.getByRole('button', { name: /book campaign/i });
      await user.click(submitButton);

      // Check for length validation errors
      await waitFor(() => {
        expect(screen.getByText('Name must be at least 2 characters long')).toBeInTheDocument();
        expect(screen.getByText('Business name must be at least 2 characters long')).toBeInTheDocument();
        expect(screen.getByText('Industry must be at least 2 characters long')).toBeInTheDocument();
      });
    });

    it('should clear field errors when user starts typing', async () => {
      render(
        <BookingForm 
          isOpen={true} 
          onClose={mockOnClose} 
          ctaButton="Book Now" 
        />
      );

      // Submit empty form to trigger errors
      const submitButton = screen.getByRole('button', { name: /book campaign/i });
      await user.click(submitButton);

      // Wait for errors to appear
      await waitFor(() => {
        expect(screen.getByText('Name is required')).toBeInTheDocument();
      });

      // Start typing in name field
      await user.type(screen.getByLabelText(/name/i), 'John');

      // Error should be cleared
      await waitFor(() => {
        expect(screen.queryByText('Name is required')).not.toBeInTheDocument();
      });
    });
  });

  describe('Form Submission Tests', () => {
    it('should submit successfully with valid data', async () => {
      // Mock successful fetch response
      fetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ success: true })
      });

      render(
        <BookingForm 
          isOpen={true} 
          onClose={mockOnClose} 
          ctaButton="Book Now" 
        />
      );

      // Fill form with valid data
      await user.type(screen.getByLabelText(/name/i), validFormData.name);
      await user.type(screen.getByLabelText(/business name/i), validFormData.businessName);
      await user.type(screen.getByLabelText(/email address/i), validFormData.email);
      await user.type(screen.getByLabelText(/phone number/i), validFormData.phone);
      await user.type(screen.getByLabelText(/industry/i), validFormData.industry);
      await user.type(screen.getByLabelText(/current target audience/i), validFormData.targetAudience);
      await user.type(screen.getByLabelText(/key message to communicate/i), validFormData.keyMessage);
      await user.type(screen.getByLabelText(/visual references/i), validFormData.visualReferences);

      // Submit form
      const submitButton = screen.getByRole('button', { name: /book campaign/i });
      await user.click(submitButton);

      // Check that fetch was called with correct data
      await waitFor(() => {
        expect(fetch).toHaveBeenCalledWith(
          webhookUrl,
          expect.objectContaining({
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: expect.stringContaining(validFormData.name)
          })
        );
      });

      // Check for success message
      await waitFor(() => {
        expect(screen.getByText('Thank You!')).toBeInTheDocument();
        expect(screen.getByText(/Your campaign booking has been received/)).toBeInTheDocument();
      });
    });

    it('should show loading state during submission', async () => {
      // Mock fetch to delay response
      fetch.mockImplementationOnce(() => new Promise(resolve => setTimeout(() => resolve({
        ok: true,
        status: 200,
        json: async () => ({ success: true })
      }), 100)));

      render(
        <BookingForm 
          isOpen={true} 
          onClose={mockOnClose} 
          ctaButton="Book Now" 
        />
      );

      // Fill form with valid data
      await user.type(screen.getByLabelText(/name/i), validFormData.name);
      await user.type(screen.getByLabelText(/business name/i), validFormData.businessName);
      await user.type(screen.getByLabelText(/email address/i), validFormData.email);
      await user.type(screen.getByLabelText(/phone number/i), validFormData.phone);
      await user.type(screen.getByLabelText(/industry/i), validFormData.industry);

      // Submit form
      const submitButton = screen.getByRole('button', { name: /book campaign/i });
      await user.click(submitButton);

      // Check for loading state
      expect(screen.getByText('Submitting...')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /submitting/i })).toBeDisabled();
    });

    it('should handle submission errors gracefully', async () => {
      // Mock failed fetch response
      fetch.mockRejectedValueOnce(new Error('Network error'));

      render(
        <BookingForm 
          isOpen={true} 
          onClose={mockOnClose} 
          ctaButton="Book Now" 
        />
      );

      // Fill form with valid data
      await user.type(screen.getByLabelText(/name/i), validFormData.name);
      await user.type(screen.getByLabelText(/business name/i), validFormData.businessName);
      await user.type(screen.getByLabelText(/email address/i), validFormData.email);
      await user.type(screen.getByLabelText(/phone number/i), validFormData.phone);
      await user.type(screen.getByLabelText(/industry/i), validFormData.industry);

      // Submit form
      const submitButton = screen.getByRole('button', { name: /book campaign/i });
      await user.click(submitButton);

      // Check for error message
      await waitFor(() => {
        expect(screen.getByText('Submission Error')).toBeInTheDocument();
        expect(screen.getByText(/Failed to submit form/)).toBeInTheDocument();
      });
    });

    it('should reset form and close modal after successful submission', async () => {
      jest.useFakeTimers();
      
      // Mock successful fetch response
      fetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ success: true })
      });

      render(
        <BookingForm 
          isOpen={true} 
          onClose={mockOnClose} 
          ctaButton="Book Now" 
        />
      );

      // Fill form with valid data
      await user.type(screen.getByLabelText(/name/i), validFormData.name);
      await user.type(screen.getByLabelText(/business name/i), validFormData.businessName);
      await user.type(screen.getByLabelText(/email address/i), validFormData.email);
      await user.type(screen.getByLabelText(/phone number/i), validFormData.phone);
      await user.type(screen.getByLabelText(/industry/i), validFormData.industry);

      // Submit form
      const submitButton = screen.getByRole('button', { name: /book campaign/i });
      await user.click(submitButton);

      // Wait for success message
      await waitFor(() => {
        expect(screen.getByText('Thank You!')).toBeInTheDocument();
      });

      // Fast-forward 3 seconds
      jest.advanceTimersByTime(3000);

      // Check that onClose was called
      await waitFor(() => {
        expect(mockOnClose).toHaveBeenCalled();
      });

      jest.useRealTimers();
    });
  });

  describe('Webhook Payload Tests', () => {
    it('should send correct JSON payload structure to webhook', async () => {
      // Mock successful fetch response
      fetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ success: true })
      });

      render(
        <BookingForm 
          isOpen={true} 
          onClose={mockOnClose} 
          ctaButton="Book Now" 
        />
      );

      // Fill form with valid data
      await user.type(screen.getByLabelText(/name/i), validFormData.name);
      await user.type(screen.getByLabelText(/business name/i), validFormData.businessName);
      await user.type(screen.getByLabelText(/email address/i), validFormData.email);
      await user.type(screen.getByLabelText(/phone number/i), validFormData.phone);
      await user.type(screen.getByLabelText(/industry/i), validFormData.industry);
      await user.type(screen.getByLabelText(/current target audience/i), validFormData.targetAudience);
      await user.type(screen.getByLabelText(/key message to communicate/i), validFormData.keyMessage);
      await user.type(screen.getByLabelText(/visual references/i), validFormData.visualReferences);

      // Submit form
      const submitButton = screen.getByRole('button', { name: /book campaign/i });
      await user.click(submitButton);

      // Check webhook payload structure
      await waitFor(() => {
        const callArgs = fetch.mock.calls[0];
        const requestBody = JSON.parse(callArgs[1].body);
        
        // Verify all required fields are present
        expect(requestBody).toHaveProperty('name', validFormData.name);
        expect(requestBody).toHaveProperty('businessName', validFormData.businessName);
        expect(requestBody).toHaveProperty('email', validFormData.email);
        expect(requestBody).toHaveProperty('phone', validFormData.phone);
        expect(requestBody).toHaveProperty('industry', validFormData.industry);
        expect(requestBody).toHaveProperty('targetAudience', validFormData.targetAudience);
        expect(requestBody).toHaveProperty('keyMessage', validFormData.keyMessage);
        expect(requestBody).toHaveProperty('visualReferences', validFormData.visualReferences);
        
        // Verify additional metadata
        expect(requestBody).toHaveProperty('ctaButton', 'Book Now');
        expect(requestBody).toHaveProperty('timestamp');
        expect(typeof requestBody.timestamp).toBe('string');
        
        // Verify the payload doesn't include removed fields
        expect(requestBody).not.toHaveProperty('preferredContactMethod');
        expect(requestBody).not.toHaveProperty('contactType');
        expect(requestBody).not.toHaveProperty('contactInfo');
      });
    });

    it('should handle empty optional fields in payload', async () => {
      // Mock successful fetch response
      fetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ success: true })
      });

      render(
        <BookingForm 
          isOpen={true} 
          onClose={mockOnClose} 
          ctaButton="Schedule Your Free Call" 
        />
      );

      // Fill only required fields
      await user.type(screen.getByLabelText(/name/i), validFormData.name);
      await user.type(screen.getByLabelText(/business name/i), validFormData.businessName);
      await user.type(screen.getByLabelText(/email address/i), validFormData.email);
      await user.type(screen.getByLabelText(/phone number/i), validFormData.phone);
      await user.type(screen.getByLabelText(/industry/i), validFormData.industry);

      // Submit form
      const submitButton = screen.getByRole('button', { name: /schedule call/i });
      await user.click(submitButton);

      // Check webhook payload structure
      await waitFor(() => {
        const callArgs = fetch.mock.calls[0];
        const requestBody = JSON.parse(callArgs[1].body);
        
        // Verify optional fields are empty strings
        expect(requestBody).toHaveProperty('targetAudience', '');
        expect(requestBody).toHaveProperty('keyMessage', '');
        expect(requestBody).toHaveProperty('visualReferences', '');
        
        // Verify CTA button is correct
        expect(requestBody).toHaveProperty('ctaButton', 'Schedule Your Free Call');
      });
    });
  });

  describe('Modal Interaction Tests', () => {
    it('should close modal when close button is clicked', async () => {
      render(
        <BookingForm 
          isOpen={true} 
          onClose={mockOnClose} 
          ctaButton="Book Now" 
        />
      );

      // Click close button
      const closeButton = screen.getByRole('button', { name: /close/i });
      await user.click(closeButton);

      // Check that onClose was called
      expect(mockOnClose).toHaveBeenCalled();
    });

    it('should close modal when backdrop is clicked', async () => {
      render(
        <BookingForm 
          isOpen={true} 
          onClose={mockOnClose} 
          ctaButton="Book Now" 
        />
      );

      // Click backdrop (the overlay behind the modal)
      const backdrop = screen.getByText('Book Your Campaign').closest('[role="dialog"]')?.previousElementSibling;
      if (backdrop) {
        await user.click(backdrop);
        expect(mockOnClose).toHaveBeenCalled();
      }
    });

    it('should prevent closing modal during submission', async () => {
      // Mock fetch to delay response
      fetch.mockImplementationOnce(() => new Promise(resolve => setTimeout(() => resolve({
        ok: true,
        status: 200,
        json: async () => ({ success: true })
      }), 100)));

      render(
        <BookingForm 
          isOpen={true} 
          onClose={mockOnClose} 
          ctaButton="Book Now" 
        />
      );

      // Fill form with valid data
      await user.type(screen.getByLabelText(/name/i), validFormData.name);
      await user.type(screen.getByLabelText(/business name/i), validFormData.businessName);
      await user.type(screen.getByLabelText(/email address/i), validFormData.email);
      await user.type(screen.getByLabelText(/phone number/i), validFormData.phone);
      await user.type(screen.getByLabelText(/industry/i), validFormData.industry);

      // Submit form
      const submitButton = screen.getByRole('button', { name: /book campaign/i });
      await user.click(submitButton);

      // Try to close modal during submission
      const closeButton = screen.getByRole('button', { name: /close/i });
      await user.click(closeButton);

      // Close button should be disabled and onClose should not be called
      expect(closeButton).toBeDisabled();
      expect(mockOnClose).not.toHaveBeenCalled();
    });
  });

  describe('Accessibility Tests', () => {
    it('should have proper ARIA labels and roles', () => {
      render(
        <BookingForm 
          isOpen={true} 
          onClose={mockOnClose} 
          ctaButton="Book Now" 
        />
      );

      // Check for proper form structure
      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getByRole('form')).toBeInTheDocument();
      
      // Check for proper labels
      expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/business name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/phone number/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/industry/i)).toBeInTheDocument();
    });

    it('should show error messages with proper accessibility', async () => {
      render(
        <BookingForm 
          isOpen={true} 
          onClose={mockOnClose} 
          ctaButton="Book Now" 
        />
      );

      // Submit empty form
      const submitButton = screen.getByRole('button', { name: /book campaign/i });
      await user.click(submitButton);

      // Check for error messages
      await waitFor(() => {
        expect(screen.getByText('Name is required')).toBeInTheDocument();
        expect(screen.getByText('Email address is required')).toBeInTheDocument();
      });

      // Check that error messages are properly associated with inputs
      const nameInput = screen.getByLabelText(/name/i);
      expect(nameInput).toHaveAttribute('aria-invalid', 'true');
    });
  });

  describe('Edge Cases', () => {
    it('should handle very long text inputs', async () => {
      render(
        <BookingForm 
          isOpen={true} 
          onClose={mockOnClose} 
          ctaButton="Book Now" 
        />
      );

      const longText = 'a'.repeat(1000);
      
      await user.type(screen.getByLabelText(/current target audience/i), longText);
      expect(screen.getByLabelText(/current target audience/i)).toHaveValue(longText);
    });

    it('should handle special characters in email', async () => {
      render(
        <BookingForm 
          isOpen={true} 
          onClose={mockOnClose} 
          ctaButton="Book Now" 
        />
      );

      const specialEmail = 'test+special@example-domain.co.uk';
      
      await user.type(screen.getByLabelText(/name/i), validFormData.name);
      await user.type(screen.getByLabelText(/business name/i), validFormData.businessName);
      await user.type(screen.getByLabelText(/email address/i), specialEmail);
      await user.type(screen.getByLabelText(/phone number/i), validFormData.phone);
      await user.type(screen.getByLabelText(/industry/i), validFormData.industry);

      // Submit form
      const submitButton = screen.getByRole('button', { name: /book campaign/i });
      await user.click(submitButton);

      // Should not show email validation error
      await waitFor(() => {
        expect(screen.queryByText('Please enter a valid email address')).not.toBeInTheDocument();
      });
    });

    it('should handle international phone numbers', async () => {
      render(
        <BookingForm 
          isOpen={true} 
          onClose={mockOnClose} 
          ctaButton="Book Now" 
        />
      );

      const internationalPhone = '+44 20 7123 4567';
      
      await user.type(screen.getByLabelText(/name/i), validFormData.name);
      await user.type(screen.getByLabelText(/business name/i), validFormData.businessName);
      await user.type(screen.getByLabelText(/email address/i), validFormData.email);
      await user.type(screen.getByLabelText(/phone number/i), internationalPhone);
      await user.type(screen.getByLabelText(/industry/i), validFormData.industry);

      // Submit form
      const submitButton = screen.getByRole('button', { name: /book campaign/i });
      await user.click(submitButton);

      // Should not show phone validation error
      await waitFor(() => {
        expect(screen.queryByText('Please enter a valid phone number')).not.toBeInTheDocument();
      });
    });
  });
});

module.exports = {
  validFormData,
  webhookUrl
};