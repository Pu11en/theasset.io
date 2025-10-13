# Testing Guide for Asset Marketing Studio

## Table of Contents
1. [Introduction to Testing](#introduction-to-testing)
2. [Testing Setup and Configuration](#testing-setup-and-configuration)
3. [Testing Tools and Frameworks](#testing-tools-and-frameworks)
4. [Testing Strategy Overview](#testing-strategy-overview)
5. [Unit Testing Guidelines](#unit-testing-guidelines)
6. [Integration Testing Guidelines](#integration-testing-guidelines)
7. [End-to-End Testing Guidelines](#end-to-end-testing-guidelines)
8. [Visual Regression Testing](#visual-regression-testing)
9. [Performance Testing](#performance-testing)
10. [Testing Workflow](#testing-workflow)
11. [Troubleshooting Common Testing Issues](#troubleshooting-common-testing-issues)
12. [Testing Checklist for New Features](#testing-checklist-for-new-features)

## Introduction to Testing

This guide provides comprehensive testing practices for the Asset Marketing Studio project. Testing is crucial to ensure the reliability, performance, and accessibility of our marketing website.

### Why Testing Matters
- Ensures consistent user experience across devices and browsers
- Prevents regressions when adding new features
- Improves code quality and maintainability
- Provides confidence when deploying changes
- Documents expected behavior through test cases

### Testing Philosophy
- **Test early, test often**: Write tests alongside code development
- **Focus on user behavior**: Test what users experience, not just implementation details
- **Automate where possible**: Use automated tests for repetitive checks
- **Balance coverage**: Aim for meaningful test coverage rather than 100% line coverage

## Testing Setup and Configuration

### Prerequisites
Ensure you have the following installed:
- Node.js (version 22.20.0 or higher)
- npm (version 9.0.0 or higher)
- Git

### Initial Setup
```bash
# Clone the repository
git clone https://github.com/your-username/asset-marketing-studio.git
cd asset-marketing-studio

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
```

### Testing Environment Configuration
Create a `.env.test.local` file for test-specific environment variables:
```bash
# Test environment variables
NODE_ENV=test
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

## Testing Tools and Frameworks

### Current Testing Stack
- **Jest**: Testing framework for unit and integration tests
- **React Testing Library**: For testing React components
- **Cypress**: End-to-end testing framework
- **Storybook**: Component development and visual testing
- **Lighthouse**: Performance and accessibility testing
- **Axe**: Accessibility testing

### Recommended Additional Tools
```bash
# Install additional testing dependencies
npm install --save-dev @testing-library/jest-dom @testing-library/user-event
npm install --save-dev cypress @cypress/react @cypress/webpack-dev-server
npm install --save-dev @storybook/react @storybook/testing-library
npm install --save-dev jest-axe lighthouse
```

## Testing Strategy Overview

### Testing Pyramid

```
    /\
   /  \  E2E Tests (Few)
  /____\
 /      \
/        \ Integration Tests (Some)
\________/
\        /
 \______/ Unit Tests (Many)
```

### Test Types Distribution
- **Unit Tests (70%)**: Fast, isolated tests for individual components and functions
- **Integration Tests (20%)**: Tests for component interactions and data flow
- **End-to-End Tests (10%)**: Full user journey tests across the application

## Unit Testing Guidelines

### Testing UI Components

#### Button Component Tests
```typescript
// src/components/ui/__tests__/Button.test.tsx
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Button from '../Button';

describe('Button Component', () => {
  test('renders with default props', () => {
    render(<Button>Click me</Button>);
    const button = screen.getByRole('button', { name: 'Click me' });
    expect(button).toBeInTheDocument();
    expect(button).toHaveClass('bg-electric-blue', 'text-white');
  });

  test('renders all variants correctly', () => {
    const variants = ['primary', 'secondary', 'outline', 'glass', 'gradient', 'cta'] as const;
    
    variants.forEach(variant => {
      const { container } = render(<Button variant={variant}>Test</Button>);
      const button = container.querySelector('button');
      expect(button).toHaveClass(`btn-${variant}`);
    });
  });

  test('renders all sizes correctly', () => {
    const sizes = ['sm', 'md', 'lg', 'xl'] as const;
    
    sizes.forEach(size => {
      const { container } = render(<Button size={size}>Test</Button>);
      const button = container.querySelector('button');
      expect(button).toHaveClass(`btn-${size}`);
    });
  });

  test('handles click events', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    
    const button = screen.getByRole('button');
    fireEvent.click(button);
    
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  test('renders as link when href is provided', () => {
    render(<Button href="/test">Link Button</Button>);
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/test');
  });

  test('shows loading state', () => {
    render(<Button loading={true}>Loading</Button>);
    expect(screen.getByText('Loading')).toBeInTheDocument();
    expect(screen.getByRole('button')).toBeDisabled();
  });

  test('is disabled when disabled prop is true', () => {
    render(<Button disabled={true}>Disabled</Button>);
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
    expect(button).toHaveClass('opacity-50', 'cursor-not-allowed');
  });
});
```

#### Card Component Tests
```typescript
// src/components/ui/__tests__/Card.test.tsx
import React from 'react';
import { render, screen } from '@testing-library/react';
import Card from '../Card';

describe('Card Component', () => {
  test('renders children correctly', () => {
    render(
      <Card>
        <p>Card content</p>
      </Card>
    );
    expect(screen.getByText('Card content')).toBeInTheDocument();
  });

  test('applies default styles', () => {
    render(<Card>Test Card</Card>);
    const card = screen.getByText('Test Card').parentElement;
    expect(card).toHaveClass('rounded-xl', 'bg-white', 'shadow-md');
  });

  test('applies glass variant when glass prop is true', () => {
    render(<Card glass={true}>Glass Card</Card>);
    const card = screen.getByText('Glass Card').parentElement;
    expect(card).toHaveClass('bg-glass-bg', 'border', 'backdrop-blur-md');
  });

  test('applies hover effect when hover prop is true', () => {
    render(<Card hover={true}>Hover Card</Card>);
    const card = screen.getByText('Hover Card').parentElement;
    expect(card).toHaveClass('hover:shadow-xl');
  });

  test('applies custom className', () => {
    render(<Card className="custom-class">Custom Card</Card>);
    const card = screen.getByText('Custom Card').parentElement;
    expect(card).toHaveClass('custom-class');
  });
});
```

#### GlassCard Component Tests
```typescript
// src/components/ui/__tests__/GlassCard.test.tsx
import React from 'react';
import { render, screen } from '@testing-library/react';
import GlassCard from '../GlassCard';

describe('GlassCard Component', () => {
  test('renders as glass variant by default', () => {
    render(<GlassCard>Glass Content</GlassCard>);
    const card = screen.getByText('Glass Content').parentElement;
    expect(card).toHaveClass('bg-glass-bg', 'border', 'backdrop-blur-md');
  });

  test('passes all props to underlying Card component', () => {
    render(
      <GlassCard hover={false} className="test-class">
        Test Content
      </GlassCard>
    );
    const card = screen.getByText('Test Content').parentElement;
    expect(card).toHaveClass('test-class');
    expect(card).not.toHaveClass('hover:shadow-xl');
  });
});
```

### Testing Section Components

#### Navigation Component Tests
```typescript
// src/components/sections/__tests__/Navigation.test.tsx
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Navigation from '../Navigation';

// Mock window.scrollY
Object.defineProperty(window, 'scrollY', {
  writable: true,
  value: 0,
});

describe('Navigation Component', () => {
  test('renders logo correctly', () => {
    render(<Navigation />);
    const logo = screen.getByText('The Asset Studio');
    expect(logo).toBeInTheDocument();
    expect(logo).toHaveAttribute('href', '#home');
  });

  test('renders desktop CTA button', () => {
    render(<Navigation />);
    const ctaButton = screen.getByText('Book Call');
    expect(ctaButton).toBeInTheDocument();
    expect(ctaButton).toHaveAttribute('href', '#contact');
  });

  test('renders mobile menu button', () => {
    render(<Navigation />);
    const menuButton = screen.getByRole('button', { name: /open main menu/i });
    expect(menuButton).toBeInTheDocument();
  });

  test('toggles mobile menu when button is clicked', () => {
    render(<Navigation />);
    const menuButton = screen.getByRole('button', { name: /open main menu/i });
    
    // Menu should be closed initially
    expect(screen.queryByText('Book Call')).toBeInTheDocument();
    
    // Click to open menu
    fireEvent.click(menuButton);
    
    // Mobile menu should now be visible
    expect(screen.getByRole('button', { name: /close main menu/i })).toBeInTheDocument();
  });

  test('applies scrolled class on scroll', () => {
    render(<Navigation />);
    const nav = screen.getByRole('navigation');
    
    // Initially not scrolled
    expect(nav).not.toHaveClass('scrolled');
    
    // Simulate scroll
    window.scrollY = 100;
    fireEvent.scroll(window);
    
    // Should have scrolled class
    expect(nav).toHaveClass('scrolled');
  });
});
```

#### Hero Component Tests
```typescript
// src/components/sections/__tests__/Hero.test.tsx
import React from 'react';
import { render, screen } from '@testing-library/react';
import Hero from '../Hero';

describe('Hero Component', () => {
  test('renders main heading', () => {
    render(<Hero />);
    const heading = screen.getByText(/Double your sells in/i);
    expect(heading).toBeInTheDocument();
    expect(heading).toContainHTML('span class="text-yellow-400"');
  });

  test('renders subheading', () => {
    render(<Hero />);
    const subheading = screen.getByText('High preforming marketing campaigns for brands');
    expect(subheading).toBeInTheDocument();
  });

  test('renders video iframe', () => {
    render(<Hero />);
    const iframe = screen.getByTitle('YouTube video player');
    expect(iframe).toBeInTheDocument();
    expect(iframe).toHaveAttribute('src', expect.stringContaining('youtube.com'));
  });

  test('renders CTA buttons', () => {
    render(<Hero />);
    const bookCallButton = screen.getByText('Book Call');
    const learnMoreButton = screen.getByText('Learn More');
    
    expect(bookCallButton).toBeInTheDocument();
    expect(bookCallButton).toHaveAttribute('href', '#contact');
    
    expect(learnMoreButton).toBeInTheDocument();
    expect(learnMoreButton).toHaveAttribute('href', '#solutions');
  });

  test('has correct section id', () => {
    render(<Hero />);
    const section = document.querySelector('#home');
    expect(section).toBeInTheDocument();
  });
});
```

### Best Practices for Unit Testing

1. **Test behavior, not implementation**
   ```typescript
   // Good: Test what the user sees
   expect(screen.getByText('Submit')).toBeInTheDocument();
   
   // Bad: Test implementation details
   expect(button.props.onClick).toBeDefined();
   ```

2. **Use semantic queries**
   ```typescript
   // Good: Use accessible queries
   screen.getByRole('button', { name: 'Submit' });
   
   // Bad: Use class names
   screen.getByClassName('btn-submit');
   ```

3. **Mock external dependencies**
   ```typescript
   // Mock API calls
   jest.mock('../api', () => ({
    fetchUser: jest.fn(() => Promise.resolve({ id: 1, name: 'John' }))
   }));
   ```

4. **Test edge cases**
   ```typescript
   test('handles empty state', () => {
     render(<Button />); // No children
     expect(screen.getByRole('button')).toBeInTheDocument();
   });
   
   test('handles disabled state', () => {
     render(<Button disabled={true}>Disabled</Button>);
     expect(screen.getByRole('button')).toBeDisabled();
   });
   ```

## Integration Testing Guidelines

### Testing Component Interactions

#### Button in Navigation Integration Test
```typescript
// src/components/__tests__/Navigation-Button.integration.test.tsx
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Navigation from '../sections/Navigation';

describe('Navigation and Button Integration', () => {
  test('Book Call button navigates to contact section', () => {
    render(<Navigation />);
    const bookCallButton = screen.getByText('Book Call');
    
    // Mock scrollIntoView
    Element.prototype.scrollIntoView = jest.fn();
    
    fireEvent.click(bookCallButton);
    
    // Verify navigation behavior
    expect(bookCallButton.closest('a')).toHaveAttribute('href', '#contact');
  });

  test('Mobile menu closes after clicking Book Call', () => {
    render(<Navigation />);
    
    // Open mobile menu
    const menuButton = screen.getByRole('button', { name: /open main menu/i });
    fireEvent.click(menuButton);
    
    // Click Book Call in mobile menu
    const mobileBookCall = screen.getAllByText('Book Call')[1]; // Mobile version
    fireEvent.click(mobileBookCall);
    
    // Menu should close (implementation depends on state management)
    expect(screen.queryByRole('button', { name: /close main menu/i })).not.toBeInTheDocument();
  });
});
```

### Testing Form Submissions

#### Contact Form Integration Test
```typescript
// src/components/__tests__/ContactForm.integration.test.tsx
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ContactForm from '../sections/ContactForm';

// Mock fetch API
global.fetch = jest.fn();

describe('Contact Form Integration', () => {
  beforeEach(() => {
    (fetch as jest.Mock).mockClear();
  });

  test('submits form with valid data', async () => {
    const user = userEvent.setup();
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true }),
    });

    render(<ContactForm />);

    // Fill out form
    await user.type(screen.getByLabelText(/name/i), 'John Doe');
    await user.type(screen.getByLabelText(/email/i), 'john@example.com');
    await user.type(screen.getByLabelText(/message/i), 'Test message');

    // Submit form
    await user.click(screen.getByRole('button', { name: /submit/i }));

    // Verify submission
    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'John Doe',
          email: 'john@example.com',
          message: 'Test message',
        }),
      });
    });

    // Verify success message
    expect(screen.getByText(/thank you/i)).toBeInTheDocument();
  });

  test('shows validation errors for invalid data', async () => {
    const user = userEvent.setup();
    render(<ContactForm />);

    // Submit empty form
    await user.click(screen.getByRole('button', { name: /submit/i }));

    // Verify validation errors
    await waitFor(() => {
      expect(screen.getByText(/name is required/i)).toBeInTheDocument();
      expect(screen.getByText(/email is required/i)).toBeInTheDocument();
      expect(screen.getByText(/message is required/i)).toBeInTheDocument();
    });
  });
});
```

### Testing API Calls

#### API Integration Test
```typescript
// src/lib/__tests__/api.integration.test.ts
import { fetchUserData } from '../api';

// Mock fetch
global.fetch = jest.fn();

describe('API Integration', () => {
  beforeEach(() => {
    (fetch as jest.Mock).mockClear();
  });

  test('fetches user data successfully', async () => {
    const mockUser = { id: 1, name: 'John Doe', email: 'john@example.com' };
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockUser,
    });

    const result = await fetchUserData(1);

    expect(fetch).toHaveBeenCalledWith('/api/users/1');
    expect(result).toEqual(mockUser);
  });

  test('handles API errors', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 404,
      json: async () => ({ error: 'User not found' }),
    });

    await expect(fetchUserData(999)).rejects.toThrow('User not found');
  });
});
```

## End-to-End Testing Guidelines

### Testing User Flows

#### Complete User Journey Test
```typescript
// cypress/e2e/user-journey.cy.ts
describe('Complete User Journey', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('allows user to navigate from hero to contact', () => {
    // Start at hero section
    cy.get('#home').should('be.visible');
    cy.contains('Double your sells in 90 days').should('be.visible');

    // Click Book Call button in hero
    cy.get('#home a[href="#contact"]').click();

    // Should scroll to contact section
    cy.get('#contact').should('be.visible');
    cy.url().should('include', '#contact');
  });

  it('allows user to explore solutions section', () => {
    // Navigate to solutions
    cy.get('a[href="#solutions"]').click();
    cy.get('#solutions').should('be.visible');

    // Verify solution cards are present
    cy.get('[data-testid="solution-card"]').should('have.length.greaterThan', 0);

    // Interact with solution cards
    cy.get('[data-testid="solution-card"]').first().realHover();
    cy.get('[data-testid="solution-card"]').first().should('have.class', 'hover:shadow-2xl');
  });

  it('handles mobile navigation correctly', () => {
    // View on mobile
    cy.viewport('iphone-x');

    // Mobile menu button should be visible
    cy.get('[data-testid="mobile-menu-button"]').should('be.visible');

    // Open mobile menu
    cy.get('[data-testid="mobile-menu-button"]').click();
    cy.get('[data-testid="mobile-menu"]').should('be.visible');

    // Close mobile menu
    cy.get('[data-testid="mobile-menu-button"]').click();
    cy.get('[data-testid="mobile-menu"]').should('not.be.visible');
  });
});
```

### Testing Responsive Design

#### Responsive Design Test
```typescript
// cypress/e2e/responsive.cy.ts
describe('Responsive Design', () => {
  const viewports = [
    { device: 'Mobile', width: 375, height: 667 },
    { device: 'Tablet', width: 768, height: 1024 },
    { device: 'Desktop', width: 1920, height: 1080 },
  ];

  viewports.forEach(({ device, width, height }) => {
    context(device, () => {
      beforeEach(() => {
        cy.viewport(width, height);
        cy.visit('/');
      });

      it('displays navigation correctly', () => {
        if (width < 768) {
          // Mobile view
          cy.get('[data-testid="mobile-menu-button"]').should('be.visible');
          cy.get('.hidden.md\\:block').should('not.exist');
        } else {
          // Desktop view
          cy.get('[data-testid="mobile-menu-button"]').should('not.exist');
          cy.get('.hidden.md\\:block').should('be.visible');
        }
      });

      it('displays hero section correctly', () => {
        cy.get('#home h1').should('be.visible');
        
        if (width < 768) {
          // Mobile typography should be smaller
          cy.get('#home h1').should('have.css', 'font-size').and('match', /2\.5rem/);
        } else {
          // Desktop typography should be larger
          cy.get('#home h1').should('have.css', 'font-size').and('match', /4\.5rem/);
        }
      });
    });
  });
});
```

### Testing Accessibility

#### Accessibility Test
```typescript
// cypress/e2e/accessibility.cy.ts
import { injectAxe, checkA11y } from 'cypress-axe';

describe('Accessibility', () => {
  beforeEach(() => {
    cy.visit('/');
    injectAxe();
  });

  it('has no detectable accessibility violations', () => {
    checkA11y();
  });

  it('supports keyboard navigation', () => {
    // Tab through interactive elements
    cy.get('body').tab();
    cy.focused().should('have.attr', 'href', '#home');

    cy.focused().tab();
    cy.focused().should('have.attr', 'href', '#contact');

    // Test Enter key on links
    cy.focused().type('{enter}');
    cy.url().should('include', '#contact');
  });

  it('maintains focus management', () => {
    // Open mobile menu
    cy.viewport('iphone-x');
    cy.get('[data-testid="mobile-menu-button"]').focus();
    cy.get('[data-testid="mobile-menu-button"]').click();

    // Focus should be inside menu
    cy.focused().should('be.within', '[data-testid="mobile-menu"]');

    // Close menu
    cy.get('[data-testid="mobile-menu-button"]').click();

    // Focus should return to menu button
    cy.focused().should('have.attr', 'data-testid', 'mobile-menu-button');
  });
});
```

## Visual Regression Testing

### Tools and Setup

#### Storybook Configuration
```typescript
// .storybook/main.ts
import type { StorybookConfig } from '@storybook/nextjs';

const config: StorybookConfig = {
  stories: ['../src/**/*.stories.@(js|jsx|ts|tsx|mdx)'],
  addons: [
    '@storybook/addon-essentials',
    '@storybook/addon-a11y',
    '@storybook/addon-docs',
    '@chromatic-com/storybook',
  ],
  framework: {
    name: '@storybook/nextjs',
    options: {},
  },
  docs: {
    autodocs: 'tag',
  },
};

export default config;
```

#### Component Stories
```typescript
// src/components/ui/Button.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import Button from './Button';

const meta: Meta<typeof Button> = {
  title: 'UI/Button',
  component: Button,
  parameters: {
    layout: 'centered',
    chromatic: { viewports: [320, 768, 1024, 1920] },
  },
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'outline', 'glass', 'gradient', 'cta'],
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg', 'xl'],
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: 'Button',
  },
};

export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-wrap gap-4">
      <Button variant="primary">Primary</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="outline">Outline</Button>
      <Button variant="glass">Glass</Button>
      <Button variant="gradient">Gradient</Button>
      <Button variant="cta">CTA</Button>
    </div>
  ),
};

export const AllSizes: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-4">
      <Button size="sm">Small</Button>
      <Button size="md">Medium</Button>
      <Button size="lg">Large</Button>
      <Button size="xl">Extra Large</Button>
    </div>
  ),
};
```

### Running Visual Tests

#### With Chromatic
```bash
# Install Chromatic CLI
npm install -g chromatic

# Run visual tests
chromatic --project-token=your-project-token

# Run with specific build
chromatic --build-number=123 --project-token=your-project-token
```

#### With Percy
```bash
# Install Percy CLI
npm install --save-dev @percy/cli

# Run Percy tests
npx percy exec -- npm run storybook:build
```

### Reviewing and Approving Changes

1. **Review Diff Images**: Compare baseline images with new changes
2. **Check Intentional Changes**: Verify that visual changes match expectations
3. **Approve or Reject**: Accept intentional changes, reject regressions
4. **Update Baseline**: Save approved changes as new baseline

## Performance Testing

### Measuring Performance

#### Core Web Vitals Test
```typescript
// cypress/e2e/performance.cy.ts
describe('Performance Testing', () => {
  it('meets Core Web Vitals thresholds', () => {
    cy.visit('/');
    
    // Wait for page to fully load
    cy.window().then((win) => {
      return new Promise((resolve) => {
        if (win.performance.timing.loadEventEnd) {
          resolve();
        } else {
          win.addEventListener('load', resolve);
        }
      });
    });

    // Check LCP (Largest Contentful Paint)
    cy.getLCP().should('be.lessThan', 2500);

    // Check FID (First Input Delay)
    cy.getFID().should('be.lessThan', 100);

    // Check CLS (Cumulative Layout Shift)
    cy.getCLS().should('be.lessThan', 0.1);
  });
});
```

#### Bundle Size Analysis
```bash
# Analyze bundle size
npm run build
npx webpack-bundle-analyzer .next/static/chunks/*.js

# Set up bundlesize configuration
echo "{
  \"files\": [
    {
      \"path\": \".next/static/chunks/pages/_app.js\",
      \"maxSize\": \"100kb\"
    },
    {
      \"path\": \".next/static/chunks/pages/index.js\",
      \"maxSize\": \"150kb\"
    }
  ]
}" > .bundlesize.json

# Run bundlesize check
npx bundlesize
```

### Performance Benchmarks

#### Performance Budget
```typescript
// performance-budgets.json
{
  "resourceSizes": [
    {
      "resourceType": "script",
      "budget": 200
    },
    {
      "resourceType": "stylesheet",
      "budget": 50
    },
    {
      "resourceType": "image",
      "budget": 500
    },
    {
      "resourceType": "font",
      "budget": 100
    }
  ],
  "resourceCounts": [
    {
      "resourceType": "script",
      "budget": 10
    },
    {
      "resourceType": "stylesheet",
      "budget": 3
    }
  ],
  "timings": [
    {
      "metric": "interactive",
      "budget": 5000
    },
    {
      "metric": "first-meaningful-paint",
      "budget": 2000
    }
  ]
}
```

### Tools for Performance Testing

1. **Lighthouse CI**
   ```bash
   # Install Lighthouse CI
   npm install -g @lhci/cli
   
   # Run Lighthouse audit
   lhci autorun
   ```

2. **WebPageTest**
   ```bash
   # Run WebPageTest
   npx webpagetest test https://your-site.com --location="Dulles:Chrome" --runs=3
   ```

3. **SpeedCurve**
   - Set up monitoring for performance trends
   - Track performance over time
   - Get alerts for performance regressions

## Testing Workflow

### When to Write Tests

1. **Before Writing Code (TDD)**
   - Write failing test first
   - Implement minimal code to pass test
   - Refactor while keeping tests green

2. **Alongside Code Development**
   - Write tests as you implement features
   - Test both happy paths and edge cases
   - Update tests when requirements change

3. **Before Deploying**
   - Run full test suite
   - Verify all critical paths work
   - Check performance and accessibility

### Running Tests Locally

#### Unit and Integration Tests
```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm test Button.test.tsx
```

#### End-to-End Tests
```bash
# Open Cypress interactive runner
npx cypress open

# Run Cypress tests headlessly
npx cypress run

# Run specific spec file
npx cypress run --spec "cypress/e2e/user-journey.cy.ts"
```

#### Visual Tests
```bash
# Build Storybook
npm run build-storybook

# Run visual tests
chromatic --project-token=your-token

# Run visual tests for specific components
chromatic --only-storybook-url=http://localhost:6006
```

### Running Tests in CI/CD

#### GitHub Actions Configuration
```yaml
# .github/workflows/test.yml
name: Tests

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Run linting
      run: npm run lint
    
    - name: Run type checking
      run: npm run type-check
    
    - name: Run unit tests
      run: npm run test:coverage
    
    - name: Upload coverage
      uses: codecov/codecov-action@v3
      with:
        file: ./coverage/lcov.info
    
    - name: Build application
      run: npm run build
    
    - name: Run E2E tests
      run: npm run test:e2e:ci
    
    - name: Run visual tests
      run: npm run test:visual
```

### Interpreting Test Results

#### Understanding Test Output
```bash
# Successful test run
PASS src/components/ui/Button.test.tsx
  Button Component
    ✓ renders with default props (5 ms)
    ✓ renders all variants correctly (2 ms)
    ✓ handles click events (1 ms)

Test Suites: 1 passed, 1 total
Tests:       3 passed, 3 total
Snapshots:   0 total
Time:        0.5 s
```

#### Debugging Failed Tests
```typescript
// Use screen.debug() to inspect DOM
test('debug example', () => {
  render(<Button>Test</Button>);
  screen.debug(); // Prints DOM structure to console
  
  // Use logRoles to see available roles
  const roles = logRoles(document.body);
  console.log(roles);
});
```

## Troubleshooting Common Testing Issues

### React Testing Library Issues

#### "Unable to find an element" Error
```typescript
// Problem
screen.getByText('Submit'); // Fails if text has extra whitespace

// Solution
screen.getByText(/submit/i); // Use regex for partial match
// or
screen.getByRole('button', { name: /submit/i }); // Use role
```

#### "act()" Warning
```typescript
// Problem
fireEvent.click(button);
expect(screen.getByText('Success')).toBeInTheDocument();

// Solution
import { act } from '@testing-library/react';

act(() => {
  fireEvent.click(button);
});
expect(screen.getByText('Success')).toBeInTheDocument();
```

### Cypress Issues

#### "Timed out" Error
```typescript
// Problem
cy.get('.dynamic-content').should('be.visible'); // Fails if content loads slowly

// Solution
cy.get('.dynamic-content', { timeout: 10000 }).should('be.visible');
// or
cy.get('.dynamic-content').should('exist');
cy.get('.dynamic-content').should('be.visible');
```

#### "Cross-origin" Error
```typescript
// Problem
cy.visit('https://external-site.com'); // Fails due to CORS

// Solution
// In cypress.config.ts
e2e: {
  baseUrl: 'http://localhost:3000',
  supportFile: 'cypress/support/e2e.ts',
  setupNodeEvents(on, config) {
    // Handle cross-origin requests
    on('task', {
      // Custom tasks if needed
    });
  }
}
```

### Performance Testing Issues

#### Inconsistent Performance Metrics
```typescript
// Problem
// Performance metrics vary between runs

// Solution
// Run multiple times and average
const measurePerformance = async (iterations = 5) => {
  const metrics = [];
  
  for (let i = 0; i < iterations; i++) {
    await cy.visit('/');
    const metric = await cy.getLCP();
    metrics.push(metric);
  }
  
  const average = metrics.reduce((a, b) => a + b) / metrics.length;
  cy.log(`Average LCP: ${average}ms`);
};
```

## Testing Checklist for New Features

### Pre-Development
- [ ] Define acceptance criteria
- [ ] Identify test scenarios (happy path, edge cases, error states)
- [ ] Plan test structure (unit, integration, E2E)
- [ ] Set up test data and mocks

### During Development
- [ ] Write unit tests for new components/functions
- [ ] Write integration tests for component interactions
- [ ] Test accessibility (keyboard navigation, screen readers)
- [ ] Test responsive design at different breakpoints

### Before Code Review
- [ ] All tests pass locally
- [ ] Code coverage meets project standards
- [ ] No console errors or warnings
- [ ] Performance impact is acceptable

### Before Deployment
- [ ] E2E tests pass in CI environment
- [ ] Visual regression tests pass
- [ ] Performance tests meet benchmarks
- [ ] Accessibility tests pass

### Post-Deployment
- [ ] Monitor for errors in production
- [ ] Check performance metrics
- [ ] Verify analytics tracking
- [ ] Collect user feedback

---

## Additional Resources

### Documentation
- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro)
- [Cypress Documentation](https://docs.cypress.io/guides/overview/why-cypress)
- [Storybook Documentation](https://storybook.js.org/docs)

### Tools
- [Axe Accessibility Testing](https://www.deque.com/axe/)
- [Lighthouse](https://developer.chrome.com/docs/lighthouse/)
- [WebPageTest](https://www.webpagetest.org/)
- [Bundle Analyzer](https://www.npmjs.com/package/webpack-bundle-analyzer)

### Best Practices
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
- [Accessibility Testing Guide](https://www.w3.org/WAI/test-evaluate/)
- [Performance Testing Guide](https://web.dev/performance/)