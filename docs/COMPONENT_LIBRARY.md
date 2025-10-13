# Component Library Guide

This guide provides comprehensive documentation for all components in the Asset Marketing Studio project, including usage examples, props interfaces, and best practices.

## Table of Contents

1. [Introduction](#introduction)
2. [Design System Overview](#design-system-overview)
3. [UI Components](#ui-components)
4. [Section Components](#section-components)
5. [Component Composition Guidelines](#component-composition-guidelines)
6. [Best Practices](#best-practices)
7. [Customization and Theming](#customization-and-theming)

## Introduction

The Asset Marketing Studio component library is a collection of reusable React components built with TypeScript, Tailwind CSS, and Framer Motion. These components are designed to create a consistent, professional, and engaging marketing website experience.

### Key Features

- **TypeScript Support**: All components include proper type definitions
- **Responsive Design**: Components adapt seamlessly to different screen sizes
- **Animation Integration**: Smooth transitions using Framer Motion
- **Accessibility**: Built with accessibility best practices in mind
- **Customizable**: Flexible props for customization while maintaining design consistency

## Design System Overview

### Color Palette

```typescript
colors: {
  'deep-blue': '#0F172A',      // Main background color
  'electric-blue': '#3B82F6',  // Primary action color
  'accent-yellow': '#FCD34D',  // Secondary accent color
  'success-green': '#10B981',  // Success states
  'dark-gray': '#1F2937',       // Dark text and UI elements
  'light-gray': '#F9FAFB',      // Light backgrounds
  'vibrant-purple': '#8B5CF6', // Additional accent
  'warm-orange': '#F97316',     // CTA buttons and highlights
}
```

### Typography

The project uses Inter font family with a responsive scale:

- **Headings**: `text-2xl` to `text-6xl` with `font-bold` weight
- **Body Text**: `text-base` to `text-xl` with `font-normal` weight
- **Small Text**: `text-sm` for secondary information

### Spacing

The design uses Tailwind's default spacing scale with common patterns:

- Component padding: `p-4` to `p-8`
- Section spacing: `py-16` to `py-24`
- Gap between elements: `gap-4` to `gap-8`

## UI Components

### Button

A versatile button component with multiple variants and sizes.

**File**: [`src/components/ui/Button.tsx`](../src/components/ui/Button.tsx)

#### Props Interface

```typescript
interface ButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'glass' | 'gradient' | 'cta';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  href?: string;
  onClick?: () => void;
  className?: string;
  loading?: boolean;
  disabled?: boolean;
}
```

#### Usage Examples

```jsx
// Primary CTA button
<Button variant="primary" size="lg">
  Get Started
</Button>

// Secondary button
<Button variant="secondary" size="md">
  Learn More
</Button>

// Outline button
<Button variant="outline" size="sm">
  View Details
</Button>

// Glass morphism button
<Button variant="glass" size="lg">
  Contact Us
</Button>

// Gradient button
<Button variant="gradient" size="xl">
  Sign Up Now
</Button>

// CTA button with special styling
<Button variant="cta" size="lg">
  Book Call
</Button>

// Loading state
<Button variant="primary" loading>
  Processing...
</Button>

// Disabled button
<Button variant="primary" disabled>
  Disabled
</Button>

// As a link
<Button variant="primary" href="/about">
  About Us
</Button>
```

#### Customization Options

- **Variants**: Choose from 6 different visual styles
- **Sizes**: 4 size options from small to extra large
- **States**: Loading and disabled states
- **Link Support**: Can render as a button or anchor tag

#### Accessibility Considerations

- Includes focus states with visible ring
- Proper ARIA attributes for disabled state
- Keyboard navigation support
- Semantic HTML structure

---

### Card

A flexible container component with optional hover effects and glass morphism style.

**File**: [`src/components/ui/Card.tsx`](../src/components/ui/Card.tsx)

#### Props Interface

```typescript
interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  glass?: boolean;
}
```

#### Usage Examples

```jsx
// Standard card
<Card>
  <h3 className="text-xl font-bold mb-2">Card Title</h3>
  <p className="text-gray-600">Card content goes here</p>
</Card>

// Card with hover effect
<Card hover>
  <h3 className="text-xl font-bold mb-2">Interactive Card</h3>
  <p className="text-gray-600">This card has hover effects</p>
</Card>

// Glass card
<Card glass>
  <h3 className="text-xl font-bold mb-2">Glass Card</h3>
  <p className="text-gray-600">Transparent glass effect</p>
</Card>

// Custom styled card
<Card hover className="border-2 border-blue-500">
  <h3 className="text-xl font-bold mb-2">Custom Card</h3>
  <p className="text-gray-600">Custom styling applied</p>
</Card>
```

#### Customization Options

- **Hover Effect**: Adds lift animation and shadow changes
- **Glass Style**: Applies glass morphism with backdrop blur
- **Custom Classes**: Additional Tailwind classes for customization

#### Accessibility Considerations

- Semantic HTML structure
- Proper contrast ratios for text
- Responsive design considerations

---

### GlassCard

A specialized card component that always uses glass morphism styling.

**File**: [`src/components/ui/GlassCard.tsx`](../src/components/ui/GlassCard.tsx)

#### Props Interface

```typescript
interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
}
```

#### Usage Examples

```jsx
// Basic glass card
<GlassCard>
  <h3 className="text-xl font-bold mb-2">Glass Card</h3>
  <p className="text-gray-600">Transparent glass effect</p>
</GlassCard>

// Glass card with hover effect
<GlassCard hover>
  <h3 className="text-xl font-bold mb-2">Interactive Glass</h3>
  <p className="text-gray-600">Hover me!</p>
</GlassCard>
```

#### Customization Options

- Inherits all Card props except `glass` (always true)
- Custom styling through className prop
- Hover effect optional

---

### Accordion

A collapsible content component with smooth animations.

**File**: [`src/components/ui/Accordion.tsx`](../src/components/ui/Accordion.tsx)

#### Props Interface

```typescript
interface AccordionProps {
  items: {
    title: string;
    content: string;
  }[];
  className?: string;
}
```

#### Usage Examples

```jsx
const faqItems = [
  {
    title: "What is your 90-day guarantee?",
    content: "We guarantee to double your sales in 90 days or we work for free until you do."
  },
  {
    title: "How quickly can I see results?",
    content: "Most clients see significant improvements within the first 30 days."
  }
];

<Accordion items={faqItems} />

// With custom styling
<Accordion 
  items={faqItems} 
  className="max-w-3xl mx-auto"
/>
```

#### Customization Options

- Custom styling through className prop
- Dynamic content rendering
- Single item open behavior

#### Accessibility Considerations

- Semantic HTML structure
- Keyboard navigation support
- ARIA attributes for screen readers
- Smooth animations with reduced motion support

---

### SpotlightCard

An interactive card component with mouse-following spotlight effects.

**File**: [`src/components/ui/spotlight-card.tsx`](../src/components/ui/spotlight-card.tsx)

#### Props Interface

```typescript
interface SpotlightCardProps {
  children: React.ReactNode;
  className?: string;
  glowColor?: 'blue' | 'purple' | 'green' | 'red' | 'orange';
  size?: 'sm' | 'md' | 'lg';
  customSize?: {
    width?: string;
    height?: string;
  };
}
```

#### Usage Examples

```jsx
// Default spotlight card
<SpotlightCard>
  <div className="text-center">
    <h3 className="text-xl font-bold mb-2">Spotlight Effect</h3>
    <p className="text-gray-600">Hover to see the effect</p>
  </div>
</SpotlightCard>

// Different glow colors
<SpotlightCard glowColor="purple" size="lg">
  <div className="text-center">
    <h3 className="text-xl font-bold mb-2">Purple Glow</h3>
    <p className="text-gray-600">Custom spotlight color</p>
  </div>
</SpotlightCard>

// Custom size
<SpotlightCard 
  glowColor="green" 
  customSize={{ width: 'w-96', height: 'h-64' }}
>
  <div className="text-center">
    <h3 className="text-xl font-bold mb-2">Custom Size</h3>
    <p className="text-gray-600">Custom dimensions</p>
  </div>
</SpotlightCard>
```

#### Customization Options

- **Glow Colors**: 5 preset color options
- **Sizes**: 3 predefined sizes or custom dimensions
- **Custom Styling**: Additional classes through className prop

#### Accessibility Considerations

- Reduced motion support for users who prefer it
- High contrast for text readability
- Semantic HTML structure

---

### SpotlightDemo

A demonstration component showcasing different SpotlightCard variations.

**File**: [`src/components/ui/spotlight-demo.tsx`](../src/components/ui/spotlight-demo.tsx)

#### Usage Examples

```jsx
<SpotlightDemo />
```

#### Customization Options

This is a demonstration component with no customization options. Use it as a reference for implementing SpotlightCard components.

---

## Section Components

Section components are larger components that make up the main sections of the marketing website.

### Navigation

A responsive navigation header with mobile menu support.

**File**: [`src/components/sections/Navigation.tsx`](../src/components/sections/Navigation.tsx)

#### Usage Examples

```jsx
<Navigation />
```

#### Features

- Fixed positioning with scroll effects
- Mobile-responsive hamburger menu
- Smooth animations and transitions
- Brand logo with custom styling
- Call-to-action button

#### Customization Options

- Navigation items are configured in the component
- Logo text and styling can be modified
- CTA button appearance can be customized

#### Accessibility Considerations

- Semantic HTML5 navigation element
- Keyboard navigation support
- ARIA labels for mobile menu
- Focus management

---

### Hero

The main hero section with headline, video, and call-to-action buttons.

**File**: [`src/components/sections/Hero.tsx`](../src/components/sections/Hero.tsx)

#### Usage Examples

```jsx
<Hero />
```

#### Features

- Background image with overlay
- Animated headline with gradient text
- Embedded YouTube video player
- Dual CTA buttons
- Responsive design

#### Customization Options

- Background image path
- Video URL and title
- Headline text and styling
- Button variants and links

#### Accessibility Considerations

- Semantic section element with id
- Proper heading hierarchy
- Video accessibility features
- Keyboard-accessible buttons

---

### Benefits

A section showcasing key benefits with icon cards.

**File**: [`src/components/sections/Benefits.tsx`](../src/components/sections/Benefits.tsx)

#### Usage Examples

```jsx
<Benefits />
```

#### Features

- Grid layout with 6 benefit cards
- Icon-based visual hierarchy
- Animated entrance effects
- Call-to-action banner
- Responsive grid system

#### Customization Options

- Benefit items array with title, description, and icon
- Grid layout customization
- Color scheme adjustments
- CTA banner content

#### Accessibility Considerations

- Semantic grid layout
- Icon accessibility with proper labels
- Focus management
- Responsive design considerations

---

### Solutions

A section presenting service solutions with interactive spotlight cards.

**File**: [`src/components/sections/Solutions.tsx`](../src/components/sections/Solutions.tsx)

#### Usage Examples

```jsx
<Solutions />
```

#### Features

- SpotlightCard components with different glow colors
- Feature lists with checkmarks
- Statistics display
- Interactive hover effects
- Responsive grid layout

#### Customization Options

- Solutions array with title, description, features
- Spotlight card colors and sizes
- Statistics and accent icons
- Grid layout customization

#### Accessibility Considerations

- Semantic section structure
- Icon accessibility
- Keyboard navigation
- Focus management

---

### Process

A section explaining the 3-step process with connected cards.

**File**: [`src/components/sections/Process.tsx`](../src/components/sections/Process.tsx)

#### Usage Examples

```jsx
<Process />
```

#### Features

- Numbered process steps
- Connection lines between steps
- Icon-based visual hierarchy
- Animated entrance effects
- Responsive layout

#### Customization Options

- Process steps array with title, description, and icon
- Connection line styling
- Color scheme adjustments
- Layout customization

#### Accessibility Considerations

- Semantic section structure
- Proper heading hierarchy
- Icon accessibility
- Focus management

---

### Testimonials

A section displaying client testimonials with ratings.

**File**: [`src/components/sections/Testimonials.tsx`](../src/components/sections/Testimonials.tsx)

#### Usage Examples

```jsx
<Testimonials />
```

#### Features

- 3-column testimonial grid
- Star rating display
- Client information with initials
- Quote styling
- Call-to-action banner

#### Customization Options

- Testimonials array with name, title, company, content
- Rating system
- Grid layout customization
- Banner content and styling

#### Accessibility Considerations

- Semantic section structure
- Quote elements for testimonials
- Star rating accessibility
- Focus management

---

### Pricing

A pricing section with tiered plans and features comparison.

**File**: [`src/components/sections/Pricing.tsx`](../src/components/sections/Pricing.tsx)

#### Usage Examples

```jsx
<Pricing />
```

#### Features

- Two-tier pricing structure
- Highlighted "most popular" plan
- Feature comparison lists
- Call-to-action buttons
- Money-back guarantee badge

#### Customization Options

- Pricing plans array with name, price, features
- Highlight plan selection
- Color scheme customization
- Button variants

#### Accessibility Considerations

- Semantic section structure
- Proper heading hierarchy
- Feature list accessibility
- Focus management

---

### CTA

A call-to-action section with compelling messaging and buttons.

**File**: [`src/components/sections/CTA.tsx`](../src/components/sections/CTA.tsx)

#### Usage Examples

```jsx
<CTA />
```

#### Features

- Compelling headline and description
- Primary CTA button with icon
- Feature highlights with checkmarks
- Client testimonial
- Green background for emphasis

#### Customization Options

- Headline and description text
- Button variant and link
- Feature highlights
- Testimonial content

#### Accessibility Considerations

- Semantic section structure
- Proper heading hierarchy
- Icon accessibility
- Focus management

---

### FAQ

A frequently asked questions section using the Accordion component.

**File**: [`src/components/sections/FAQ.tsx`](../src/components/sections/FAQ.tsx)

#### Usage Examples

```jsx
<FAQ />
```

#### Features

- Accordion-based FAQ display
- 6 pre-configured questions
- Call-to-action banner
- Smooth animations
- Responsive design

#### Customization Options

- FAQ items array with questions and answers
- Banner content and styling
- Accordion customization

#### Accessibility Considerations

- Semantic section structure
- Accordion accessibility features
- Proper heading hierarchy
- Focus management

---

### Footer

A comprehensive footer with links, contact information, and social media.

**File**: [`src/components/sections/Footer.tsx`](../src/components/sections/Footer.tsx)

#### Usage Examples

```jsx
<Footer />
```

#### Features

- Company information and contact details
- Organized link sections
- Social media links
- Copyright information
- Responsive layout

#### Customization Options

- Footer sections array with links
- Contact information
- Social media links
- Copyright text

#### Accessibility Considerations

- Semantic footer element
- Proper link structure
- Social media accessibility
- Focus management

---

### SocialProof

A section displaying statistics and client logos for credibility.

**File**: [`src/components/sections/SocialProof.tsx`](../src/components/sections/SocialProof.tsx)

#### Usage Examples

```jsx
<SocialProof />
```

#### Features

- Statistics grid with icons
- Client logos display
- Animated entrance effects
- Responsive layout
- Hover effects

#### Customization Options

- Statistics array with value, label, and icon
- Client logos array
- Grid layout customization
- Animation settings

#### Accessibility Considerations

- Semantic section structure
- Icon accessibility
- Focus management
- Responsive design considerations

---

## Component Composition Guidelines

### Nesting Components

Many components are designed to work together:

```jsx
// Using Button inside Card
<Card hover>
  <h3 className="text-xl font-bold mb-4">Card Title</h3>
  <p className="text-gray-600 mb-4">Card description</p>
  <Button variant="primary" size="sm">Learn More</Button>
</Card>

// Using SpotlightCard in Solutions section
<SpotlightCard glowColor="blue" size="lg">
  <div className="text-center">
    <h3 className="text-xl font-bold mb-2">Solution Title</h3>
    <Button variant="outline" size="sm">View Details</Button>
  </div>
</SpotlightCard>
```

### Section Layout Pattern

Most sections follow a consistent pattern:

```jsx
<section className="py-20 bg-gray-50">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    {/* Section header */}
    <motion.div className="text-center mb-16">
      <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
        Section Title
      </h2>
      <p className="text-xl text-gray-600 max-w-3xl mx-auto">
        Section description
      </p>
    </motion.div>
    
    {/* Section content */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {/* Content items */}
    </div>
    
    {/* Optional CTA */}
    <motion.div className="mt-16 text-center">
      {/* CTA content */}
    </motion.div>
  </div>
</section>
```

### Animation Pattern

Components use consistent animation patterns with Framer Motion:

```jsx
// Fade in animation
<motion.div
  initial={{ opacity: 0, y: 20 }}
  whileInView={{ opacity: 1, y: 0 }}
  viewport={{ once: true }}
  transition={{ duration: 0.6 }}
>

// Staggered animation for lists
{items.map((item, index) => (
  <motion.div
    key={index}
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.5, delay: index * 0.1 }}
  >
    {item.content}
  </motion.div>
))}
```

## Best Practices

### Component Usage

1. **Use Existing Components**: Always check if a component exists before creating a new one
2. **Follow Props Interface**: Use props as defined in the interface for consistency
3. **Maintain Responsive Design**: Ensure components work across all screen sizes
4. **Preserve Accessibility**: Don't override accessibility features
5. **Use Semantic HTML**: Maintain proper HTML structure

### Styling Guidelines

1. **Use Tailwind Classes**: Prefer Tailwind utility classes over inline styles
2. **Follow Design System**: Use established colors, spacing, and typography
3. **Maintain Consistency**: Keep similar components visually consistent
4. **Test Responsiveness**: Verify components work on all device sizes
5. **Check Contrast Ratios**: Ensure text meets WCAG AA standards

### Performance Considerations

1. **Optimize Images**: Use appropriate image formats and sizes
2. **Lazy Load Content**: Implement lazy loading for heavy components
3. **Minimize Re-renders**: Use React.memo for expensive components
4. **Optimize Animations**: Use transform and opacity for smooth animations
5. **Test Performance**: Monitor component performance impact

## Customization and Theming

### Modifying Colors

Update colors in [`tailwind.config.ts`](../tailwind.config.ts):

```typescript
colors: {
  'electric-blue': '#YOUR_COLOR', // Update primary color
  'accent-yellow': '#YOUR_COLOR', // Update accent color
  // ... other colors
}
```

### Adding New Variants

To add new variants to components like Button:

1. Update the type definition in [`src/types/index.ts`](../src/types/index.ts)
2. Add the variant styles in the component
3. Update documentation

### Custom Animations

Add new animations in [`tailwind.config.ts`](../tailwind.config.ts):

```typescript
animation: {
  'custom-animation': 'customAnimation 1s ease-in-out',
},
keyframes: {
  customAnimation: {
    '0%': { transform: 'scale(1)' },
    '50%': { transform: 'scale(1.1)' },
    '100%': { transform: 'scale(1)' },
  },
},
```

### Component Extensions

When extending components:

1. Follow existing patterns and conventions
2. Maintain backward compatibility
3. Update TypeScript interfaces
4. Add proper documentation
5. Test across all breakpoints

---

## 📚 Additional Resources

- [Design System Documentation](./DESIGN_SYSTEM.md) - Design tokens and patterns
- [Testing Guide](./TESTING_GUIDE.md) - Testing procedures for components
- [API Documentation](./API.md) - External service integrations
- [Tailwind CSS Documentation](https://tailwindcss.com/docs) - Utility-first CSS framework
- [Framer Motion Documentation](https://www.framer.com/motion/) - Animation library
- [TypeScript Documentation](https://www.typescriptlang.org/docs/) - Type-safe JavaScript
- [React Documentation](https://react.dev/) - React library

---

*This component library is part of the Asset Marketing Studio project. For the main documentation hub, see [DOCUMENTATION_INDEX.md](../../DOCUMENTATION_INDEX.md).*

---

## 🔍 Quick Navigation

| Looking For | Document | Section |
|-------------|----------|---------|
| Button component usage | [Component Library](./COMPONENT_LIBRARY.md#button) | Button |
| Card component examples | [Component Library](./COMPONENT_LIBRARY.md#card) | Card |
| Design tokens | [Design System](./DESIGN_SYSTEM.md) | Color Palette |
| Testing components | [Testing Guide](./TESTING_GUIDE.md) | Unit Testing |
| Deployment | [Deployment Guide](./DEPLOYMENT.md) | Platform name |

---

## 📅 Document Information

**Last Updated**: 2024-10-12
**Next Review**: 2024-11-12
**Maintainer**: Development Team
**Related**: [Design System](./DESIGN_SYSTEM.md), [Testing Guide](./TESTING_GUIDE.md)