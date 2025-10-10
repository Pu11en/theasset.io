# Design System Documentation

This document outlines the design tokens, patterns, and UI guidelines used in the Asset Marketing Studio project.

## 📋 Table of Contents

- [Color Palette](#color-palette)
- [Typography](#typography)
- [Spacing](#spacing)
- [Components](#components)
- [Animations](#animations)
- [Responsive Design](#responsive-design)
- [Accessibility](#accessibility)
- [Usage Guidelines](#usage-guidelines)

## 🎨 Color Palette

### Primary Colors

```typescript
// From tailwind.config.ts
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

### Color Usage Guidelines

| Color | Usage | Example |
|-------|-------|---------|
| `deep-blue` | Main background, navigation bar | `bg-deep-blue` |
| `electric-blue` | Primary buttons, links, highlights | `bg-electric-blue`, `text-electric-blue` |
| `accent-yellow` | Secondary buttons, highlights | `bg-accent-yellow`, `text-accent-yellow` |
| `success-green` | Success messages, validation | `bg-success-green` |
| `dark-gray` | Secondary text, borders | `text-dark-gray`, `border-dark-gray` |
| `light-gray` | Light backgrounds, cards | `bg-light-gray` |
| `vibrant-purple` | Special accents, gradients | `bg-vibrant-purple` |
| `warm-orange` | CTA buttons, important actions | `bg-warm-orange` |

### Semantic Color Classes

```typescript
// Button variants
const buttonVariants = {
  primary: 'bg-electric-blue text-white hover:bg-blue-700',
  secondary: 'bg-accent-yellow text-gray-900 hover:bg-yellow-500',
  outline: 'border-2 border-electric-blue text-electric-blue hover:bg-electric-blue hover:text-white',
  glass: 'bg-glass-bg border border-glass-border text-white hover:bg-white/20',
  gradient: 'bg-gradient-primary text-white hover:opacity-90',
  cta: 'bg-warm-orange text-black hover:bg-orange-600',
};
```

## ✏️ Typography

### Font Families

```typescript
// Defined in layout.tsx and tailwind.config.ts
const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const interDisplay = Inter({ 
  subsets: ["latin"], 
  variable: "--font-inter-display", 
  weight: ["700", "800", "900"] 
});
const jetbrainsMono = JetBrains_Mono({ 
  subsets: ["latin"], 
  variable: "--font-jetbrains-mono" 
});

// In tailwind.config.ts
fontFamily: {
  'inter-display': ['var(--font-inter-display)'],
  'jetbrains-mono': ['var(--font-jetbrains-mono)'],
},
```

### Typography Scale

| Element | Size | Class | Usage |
|---------|------|-------|-------|
| Heading 1 | 4xl-6xl | `text-4xl md:text-6xl` | Main headings, hero titles |
| Heading 2 | 3xl-4xl | `text-3xl md:text-4xl` | Section headings |
| Heading 3 | 2xl-3xl | `text-2xl md:text-3xl` | Subsection headings |
| Body Large | xl-2xl | `text-xl md:text-2xl` | Leading paragraphs, descriptions |
| Body Regular | base | `text-base` | Regular text content |
| Body Small | sm | `text-sm` | Secondary information, captions |
| Micro | xs | `text-xs` | Labels, metadata |

### Typography Guidelines

1. **Font Weights**
   - `font-bold` (700) for headings
   - `font-semibold` (600) for emphasis
   - `font-medium` (500) for buttons
   - `font-normal` (400) for body text

2. **Text Colors**
   - `text-white` for primary text on dark backgrounds
   - `text-gray-100` for secondary text on dark backgrounds
   - `text-black` for text on light backgrounds
   - `text-electric-blue` for links and accents

## 📏 Spacing

### Spacing Scale

The project uses Tailwind's default spacing scale:

| Value | Tailwind Class | Usage |
|-------|----------------|-------|
| 1 | `p-1`, `m-1` | 4px - Micro spacing |
| 2 | `p-2`, `m-2` | 8px - Small spacing |
| 3 | `p-3`, `m-3` | 12px - Default spacing |
| 4 | `p-4`, `m-4` | 16px - Medium spacing |
| 6 | `p-6`, `m-6` | 24px - Large spacing |
| 8 | `p-8`, `m-8` | 32px - Extra large spacing |
| 12 | `p-12`, `m-12` | 48px - Section spacing |
| 16 | `p-16`, `m-16` | 64px - Container spacing |
| 24 | `p-24`, `m-24` | 96px - Hero spacing |

### Common Spacing Patterns

```typescript
// Component padding
<div className="px-4 sm:px-6 lg:px-8 py-24">  // Section spacing
<div className="p-6">                        // Card padding
<div className="px-6 py-3">                  // Button padding

// Gap between elements
<div className="gap-4">                      // Medium gap
<div className="space-y-4">                  // Vertical spacing
<div className="flex flex-col md:flex-row gap-4 justify-center">  // Responsive gap
```

## 🧩 Components

### Button Component

The Button component (`src/components/ui/Button.tsx`) provides a consistent button interface across the application.

#### Variants

```typescript
type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'glass' | 'gradient' | 'cta';
type ButtonSize = 'sm' | 'md' | 'lg' | 'xl';
```

#### Usage Examples

```typescript
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

// CTA button with special styling
<Button variant="cta" size="lg">
  Book Call
</Button>
```

### Card Component

The Card component (`src/components/ui/Card.tsx`) provides a consistent container for content.

#### Variants

```typescript
interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;    // Enable hover effects
  glass?: boolean;    // Glass morphism style
}
```

#### Usage Examples

```typescript
// Standard card
<Card>
  <h3>Card Title</h3>
  <p>Card content goes here</p>
</Card>

// Card with hover effect
<Card hover>
  <h3>Interactive Card</h3>
  <p>This card has hover effects</p>
</Card>

// Glass card
<Card glass>
  <h3>Glass Card</h3>
  <p>Transparent glass effect</p>
</Card>
```

### Accordion Component

The Accordion component (`src/components/ui/Accordion.tsx`) provides collapsible content sections.

#### Usage Example

```typescript
const faqItems = [
  {
    question: "What is your 90-day guarantee?",
    answer: "We guarantee to double your sales in 90 days or we work for free until you do."
  },
  // ... more items
];

<Accordion items={faqItems} />
```

## 🎬 Animations

### Framer Motion Integration

The project uses Framer Motion for smooth animations and transitions.

#### Common Animation Patterns

```typescript
// Fade in animation
<motion.div
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  transition={{ duration: 0.8 }}
>

// Slide up animation
<motion.div
  initial={{ y: 30, opacity: 0 }}
  animate={{ y: 0, opacity: 1 }}
  transition={{ duration: 0.8, delay: 0.2 }}
>

// Staggered animations
{items.map((item, index) => (
  <motion.div
    key={index}
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay: index * 0.1 }}
  >
    {item.content}
  </motion.div>
))}
```

### Custom Animations

Defined in `tailwind.config.ts`:

```typescript
animation: {
  'float': 'float 3s ease-in-out infinite',
  'pulse-slow': 'pulse-slow 4s ease-in-out infinite',
  'slide-up': 'slideUp 0.5s ease-out',
  'slide-in-left': 'slideInLeft 0.5s ease-out',
  'slide-in-right': 'slideInRight 0.5s ease-out',
},
```

## 📱 Responsive Design

### Breakpoints

The project uses Tailwind's default responsive breakpoints:

| Breakpoint | Min-width | CSS | Usage |
|------------|-----------|-----|-------|
| sm | 640px | `@media (min-width: 640px)` | Small screens |
| md | 768px | `@media (min-width: 768px)` | Tablets |
| lg | 1024px | `@media (min-width: 1024px)` | Small desktops |
| xl | 1280px | `@media (min-width: 1280px)` | Desktops |
| 2xl | 1536px | `@media (min-width: 1536px)` | Large desktops |

### Responsive Patterns

```typescript
// Responsive typography
<h1 className="text-4xl md:text-6xl font-bold">
  Responsive heading
</h1>

// Responsive layout
<div className="flex flex-col md:flex-row gap-4">
  <div>Column 1</div>
  <div>Column 2</div>
</div>

// Responsive spacing
<div className="px-4 sm:px-6 lg:px-8 py-12 md:py-24">
  Responsive container
</div>

// Responsive grid
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  Grid items
</div>
```

## ♿ Accessibility

### Color Contrast

All text and background combinations meet WCAG AA standards:

- Normal text: 4.5:1 contrast ratio minimum
- Large text: 3:1 contrast ratio minimum
- Non-text elements: 3:1 contrast ratio minimum

### Focus States

All interactive elements have visible focus states:

```typescript
// Button focus styles
className="focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-electric-blue"

// Link focus styles
className="focus:outline-none focus:ring-2 focus:ring-yellow-400"
```

### Screen Reader Support

- Semantic HTML5 elements are used appropriately
- ARIA labels are provided where needed
- Alt text is provided for all images
- Heading hierarchy is maintained

### Keyboard Navigation

- All interactive elements are keyboard accessible
- Tab order follows logical sequence
- Skip links are provided for navigation

## 📖 Usage Guidelines

### Design Principles

1. **Consistency** - Use established patterns and components
2. **Clarity** - Ensure clear visual hierarchy and readable text
3. **Responsiveness** - Design for all screen sizes
4. **Accessibility** - Ensure inclusive design for all users
5. **Performance** - Optimize for fast loading and smooth interactions

### Component Usage

1. **Use existing components** before creating new ones
2. **Follow established patterns** for consistency
3. **Maintain proper spacing** using the defined scale
4. **Use appropriate colors** from the palette
5. **Ensure responsive behavior** for all components

### Customization Guidelines

When customizing the design system:

1. **Update tokens** in `tailwind.config.ts`
2. **Document changes** in this file
3. **Test across breakpoints** for responsiveness
4. **Verify accessibility** compliance
5. **Update components** to use new tokens

## 🔧 Implementation Details

### Tailwind Configuration

The design system is implemented using Tailwind CSS with custom configuration in `tailwind.config.ts`:

```typescript
const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: { /* custom colors */ },
      fontFamily: { /* custom fonts */ },
      backgroundImage: { /* custom gradients */ },
      animation: { /* custom animations */ },
      keyframes: { /* animation definitions */ },
    },
  },
  plugins: [],
};
```

### CSS Custom Properties

The design system uses CSS custom properties for dynamic values:

```css
:root {
  --gradient-primary: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  --gradient-accent: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  --gradient-text: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}
```

## 🚀 Future Enhancements

### Planned Improvements

1. **Dark Mode Support** - Add dark mode variants
2. **Component Library** - Expand reusable components
3. **Design Tokens** - Implement design token system
4. **Theming** - Support for multiple themes
5. **Animation Library** - Standardized animation patterns

### Contribution Guidelines

When contributing to the design system:

1. **Follow established patterns** and conventions
2. **Update documentation** for any changes
3. **Test across browsers** and devices
4. **Ensure accessibility** compliance
5. **Maintain consistency** with existing design

## 📚 Resources

- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Framer Motion Documentation](https://www.framer.com/motion/)
- [Web Content Accessibility Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [Material Design Principles](https://material.io/design/)