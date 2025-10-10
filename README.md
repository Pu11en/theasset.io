# 🚀 Asset Marketing Studio

<!-- Badges -->
<p align="center">
  <a href="https://github.com/your-org/asset-marketing-studio/blob/main/LICENSE">
    <img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="License">
  </a>
  <a href="https://nextjs.org/">
    <img src="https://img.shields.io/badge/Next.js-15.5.4-black" alt="Next.js">
  </a>
  <a href="https://www.typescriptlang.org/">
    <img src="https://img.shields.io/badge/TypeScript-5.x-blue" alt="TypeScript">
  </a>
  <a href="https://tailwindcss.com/">
    <img src="https://img.shields.io/badge/Tailwind_CSS-4.x-38B2AC" alt="Tailwind CSS">
  </a>
  <a href="https://www.framer.com/motion/">
    <img src="https://img.shields.io/badge/Framer_Motion-12.x-FF5C5C" alt="Framer Motion">
  </a>
  <a href="https://github.com/your-org/asset-marketing-studio/actions/workflows/ci.yml">
    <img src="https://github.com/your-org/asset-marketing-studio/workflows/CI/badge.svg" alt="CI">
  </a>
  <a href="https://codecov.io/gh/your-org/asset-marketing-studio">
    <img src="https://codecov.io/gh/your-org/asset-marketing-studio/branch/main/graph/badge.svg" alt="Coverage">
  </a>
  <a href="https://lighthouse-dot-webdotdevsite.appspot.com//lh/html?url=https%3A%2F%2Ftheassetstudio.com">
    <img src="https://img.shields.io/badge/Lighthouse-95+-brightgreen" alt="Lighthouse Score">
  </a>
</p>

<!-- Description -->
<p align="center">
  <strong>A modern, conversion-focused marketing website for The Asset Studio digital marketing agency</strong><br>
  Built with Next.js, TypeScript, and Tailwind CSS featuring a 90-day performance guarantee
</p>

<!-- Preview Image -->
<p align="center">
  <img src="https://img.shields.io/badge/Platform-Web-blue" alt="Web Platform">
  <img src="https://img.shields.io/badge/Responsive-Mobile--First-green" alt="Responsive">
  <img src="https://img.shields.io/badge/Accessibility-WCAG_2.1_AA-yellow" alt="Accessibility">
  <img src="https://img.shields.io/badge/Performance-Optimized-orange" alt="Performance">
</p>

## 🌟 Key Features

- 🎯 **90-Day Performance Guarantee** - Double your sales or work for free
- 📱 **Fully Responsive Design** - Mobile-first approach with seamless desktop experience
- 🎬 **Smooth Animations** - Interactive components powered by Framer Motion
- ⚡ **Performance Optimized** - Fast loading times with optimized assets
- 🎨 **Modern UI/UX** - Glassmorphism effects and advanced micro-interactions
- ♿ **Accessibility Compliant** - WCAG 2.1 AA standards with semantic HTML
- 🔍 **SEO Ready** - Optimized meta tags and structured data
- 📊 **Analytics Integration** - Easy integration with analytics platforms
- 🎥 **Video Testimonials** - Embedded YouTube video showcase
- 💼 **Service Showcase** - Comprehensive presentation of marketing solutions

## 🚀 Quick Start

### Prerequisites

- Node.js 18.0 or higher
- npm, yarn, pnpm, or bun package manager

### Installation

```bash
# Clone the repository
git clone https://github.com/your-org/asset-marketing-studio.git
cd asset-marketing-studio

# Install dependencies
npm install

# Start development server
npm run dev

# Open your browser
# Navigate to http://localhost:4000
```

### Available Scripts

```bash
# Start development server (runs on port 4000)
npm run dev

# Run ESLint
npm run lint

# Build for production
npm run build

# Start production server
npm run start

# Type checking
npm run type-check
```

## 🏗️ Project Structure

```
asset-marketing-studio/
├── public/                     # Static assets
│   ├── hero-bg.png            # Hero section background
│   └── favicon.ico            # Site favicon
├── src/
│   ├── app/                   # Next.js app directory
│   │   ├── globals.css        # Global styles
│   │   ├── layout.tsx         # Root layout component
│   │   └── page.tsx           # Home page component
│   ├── components/
│   │   ├── sections/          # Page section components
│   │   │   ├── Navigation.tsx
│   │   │   ├── Hero.tsx
│   │   │   ├── Solutions.tsx
│   │   │   ├── Benefits.tsx
│   │   │   ├── Process.tsx
│   │   │   ├── Pricing.tsx
│   │   │   ├── Testimonials.tsx
│   │   │   ├── CTA.tsx
│   │   │   ├── FAQ.tsx
│   │   │   └── Footer.tsx
│   │   └── ui/                # Reusable UI components
│   │       ├── Button.tsx
│   │       ├── Card.tsx
│   │       ├── GlassCard.tsx
│   │       └── Accordion.tsx
│   └── types/
│       └── index.ts           # TypeScript type definitions
├── docs/                      # Documentation
├── .github/                   # GitHub configuration
├── tailwind.config.ts         # Tailwind CSS configuration
├── tsconfig.json              # TypeScript configuration
├── next.config.ts             # Next.js configuration
└── package.json               # Project dependencies and scripts
```

## 🎨 Design System

### Color Palette
- **Deep Blue** (#0F172A) - Trust, professionalism, stability
- **Electric Blue** (#3B82F6) - Innovation, technology, confidence
- **Accent Yellow** (#FCD34D) - Energy, success, attention
- **Success Green** (#10B981) - Growth, results, achievement

### Typography
- **Display**: Inter Display Bold - Modern, confident headlines
- **Headings**: Inter SemiBold - Clear hierarchy and readability
- **Body**: Inter Regular - Excellent on-screen readability
- **Accent**: JetBrains Mono - Data, metrics, and technical elements

## 🌐 Sections Overview

### Hero Section
- Engaging headline with 90-day guarantee
- Embedded YouTube video showcase
- Call-to-action buttons with smooth animations
- Animated statistics counter

### Navigation
- Glassmorphism effect with backdrop blur
- Dynamic color change based on scroll position
- Mobile-responsive hamburger menu
- Smooth scroll navigation

### Solutions
- Service offerings showcase
- Interactive card components with hover effects
- Category filtering functionality
- Performance metrics display

### Benefits
- Value proposition highlights
- Icon-based feature list
- Animated metric counters
- Progress indicators

### Process
- Step-by-step workflow explanation
- Visual process indicators
- Interactive timeline
- Expandable step details

### Pricing
- Service tier comparison
- Highlighted recommended plan
- Feature comparison tables
- Strategic CTA placement

### Testimonials
- Customer success stories
- Social proof elements
- Interactive carousel
- Client company logos

### FAQ
- Accordion-style问答
- Common questions and answers
- Smooth expand/collapse animations
- Search functionality

### Footer
- Contact information
- Social media links
- Additional navigation
- Newsletter signup

## 🛠️ Technology Stack

### Core Technologies
- **Framework**: [Next.js 15.5.4](https://nextjs.org/) - React framework with App Router
- **Language**: [TypeScript](https://www.typescriptlang.org/) - Type-safe JavaScript
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) - Utility-first CSS framework
- **Animations**: [Framer Motion](https://www.framer.com/motion/) - Production-ready motion library
- **Icons**: [Lucide React](https://lucide.dev/) - Beautiful & consistent icon toolkit

### Development Tools
- **Package Manager**: npm
- **Linting**: ESLint with Next.js configuration
- **Type Checking**: TypeScript compiler
- **Build Tool**: Next.js built-in bundler
- **Code Formatting**: Prettier (recommended)

## 📱 Responsive Design

The website is fully responsive and optimized for:

- 📱 Mobile devices (320px and up)
- 📟 Tablets (768px and up)
- 💻 Desktop computers (1024px and up)
- 🖥️ Large screens (1280px and up)

## ♿ Accessibility

The website follows WCAG 2.1 AA guidelines with:

- Semantic HTML5 elements
- Proper heading hierarchy
- ARIA labels and roles
- Keyboard navigation support
- Focus indicators
- Color contrast compliance

## 🚀 Deployment

### Recommended Platforms

- [Vercel](https://vercel.com/) (Recommended)
- [Netlify](https://www.netlify.com/)
- [AWS Amplify](https://aws.amazon.com/amplify/)
- [Docker](https://www.docker.com/)

### Environment Variables

```bash
# Copy the example environment file
cp .env.example .env.local

# Add your environment variables
NEXT_PUBLIC_SITE_URL=https://your-domain.com
NEXT_PUBLIC_GA_ID=your-google-analytics-id
```

### Build Commands

```bash
# Build for production
npm run build

# Export static files (if needed)
npm run export

# Analyze bundle size
npm run analyze
```

## 📊 Performance Metrics

- **Lighthouse Score**: 95+ across all categories
- **Core Web Vitals**: Optimized for LCP, FID, and CLS
- **Bundle Size**: Optimized with code splitting
- **Image Optimization**: Next.js Image component usage
- **Caching**: Proper cache headers and strategies

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](.github/CONTRIBUTING.md) for details.

### Development Workflow

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Quality

- Run `npm run lint` to check code style
- Run `npm run type-check` to verify TypeScript types
- Ensure all tests pass before submitting PR

## 📚 Documentation

- [Development Setup Guide](docs/DEVELOPMENT.md) - Local development environment setup
- [Deployment Guide](docs/DEPLOYMENT.md) - Instructions for deploying the application
- [API Documentation](docs/API.md) - Information about APIs and services used
- [Design System](docs/DESIGN_SYSTEM.md) - Design tokens, patterns, and UI guidelines
- [Contributing Guidelines](.github/CONTRIBUTING.md) - How to contribute to the project
- [Security Policy](SECURITY.md) - Security guidelines and reporting
- [Changelog](CHANGELOG.md) - Version history and changes

## 🔍 Keywords for Discoverability

marketing website, digital marketing agency, conversion optimization, Next.js, TypeScript, Tailwind CSS, responsive design, web development, React, marketing automation, lead generation, performance marketing, SEO optimization, modern UI, glassmorphism, micro-interactions, accessibility, WCAG, semantic HTML, performance optimization, marketing solutions, business growth, sales optimization

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🔒 Security

If you discover a security vulnerability, please see our [Security Policy](SECURITY.md) for reporting guidelines.

## 📞 Support

- 📧 Email: info@theassetstudio.com
- 🌐 Website: https://theassetstudio.com
- 🐛 Issues: [GitHub Issues](https://github.com/your-org/asset-marketing-studio/issues)
- 💬 Discussions: [GitHub Discussions](https://github.com/your-org/asset-marketing-studio/discussions)

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - The React framework for production
- [Tailwind CSS](https://tailwindcss.com/) - A utility-first CSS framework
- [Framer Motion](https://www.framer.com/motion/) - A production-ready motion library
- [Lucide](https://lucide.dev/) - Beautiful & consistent icon toolkit

## 📈 Future Roadmap

- [ ] Advanced 3D animations and interactions
- [ ] AI-powered content personalization
- [ ] Multi-language support
- [ ] Advanced analytics dashboard
- [ ] Progressive Web App features
- [ ] Headless CMS integration

---

<div align="center">
  <p>Built with ❤️ by The Asset Studio Team</p>
  <p>© 2024 The Asset Studio. All rights reserved.</p>
  
  <p>
    <a href="#top">Back to top ↑</a>
  </p>
</div>
