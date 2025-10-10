# Development Setup Guide

This guide provides detailed instructions for setting up a local development environment for the Asset Marketing Studio project.

## 📋 Table of Contents

- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Development Workflow](#development-workflow)
- [Project Structure](#project-structure)
- [Available Scripts](#available-scripts)
- [Code Style and Guidelines](#code-style-and-guidelines)
- [Debugging](#debugging)
- [Testing](#testing)
- [Common Issues](#common-issues)

## ✅ Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js**: Version 18.0 or higher
- **Package Manager**: npm (comes with Node.js), yarn, pnpm, or bun
- **Git**: For version control
- **Code Editor**: VS Code (recommended) with extensions

### Recommended VS Code Extensions

- **ES7+ React/Redux/React-Native snippets** - For React code snippets
- **Tailwind CSS IntelliSense** - For Tailwind CSS autocomplete
- **TypeScript Importer** - For automatic TypeScript imports
- **Prettier - Code formatter** - For code formatting
- **ESLint** - For code linting
- **Auto Rename Tag** - For automatic tag renaming
- **Bracket Pair Colorizer** - For better bracket visualization

## 📦 Installation

### 1. Clone the Repository

```bash
git clone https://github.com/your-org/asset-marketing-studio.git
cd asset-marketing-studio
```

### 2. Install Dependencies

Choose one of the following package managers:

```bash
# Using npm (default)
npm install

# Using yarn
yarn install

# Using pnpm
pnpm install

# Using bun
bun install
```

### 3. Start the Development Server

```bash
# Using npm
npm run dev

# Using yarn
yarn dev

# Using pnpm
pnpm dev

# Using bun
bun dev
```

The development server will start on `http://localhost:4000` (configured in package.json).

## 🔄 Development Workflow

### 1. Creating a New Branch

```bash
# Create a new feature branch
git checkout -b feature/your-feature-name

# Create a new bugfix branch
git checkout -b fix/your-bug-fix-name
```

### 2. Making Changes

- Edit the source files in the `src` directory
- The development server will automatically reload when you save changes
- Use TypeScript for type safety
- Follow the existing code patterns and structure

### 3. Running Linting

```bash
# Run ESLint
npm run lint
# or
yarn lint
# or
pnpm lint
# or
bun lint
```

### 4. Building for Production

```bash
# Build the application
npm run build
# or
yarn build
# or
pnpm build
# or
bun build
```

### 5. Testing Production Build Locally

```bash
# Start production server
npm run start
# or
yarn start
# or
pnpm start
# or
bun start
```

## 📁 Project Structure

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

## 📜 Available Scripts

### Development Scripts

```bash
# Start development server (runs on port 4000)
npm run dev

# Run ESLint
npm run lint

# Build for production
npm run build

# Start production server
npm run start
```

### Package Scripts in package.json

```json
{
  "scripts": {
    "dev": "next dev -p 4000",
    "build": "next build",
    "start": "next start",
    "lint": "eslint"
  }
}
```

## 🎨 Code Style and Guidelines

### TypeScript Guidelines

1. **Use TypeScript for all new code**
2. **Define interfaces for component props**
3. **Use explicit return types for functions**
4. **Prefer `const` over `let` when possible**

Example:
```typescript
// Define interface for component props
interface ButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
}

// Use explicit return type
const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  onClick
}) => {
  // Component implementation
  return <button onClick={onClick}>{children}</button>;
};
```

### React Component Guidelines

1. **Use functional components with hooks**
2. **Follow the existing component structure**
3. **Use proper TypeScript props interfaces**
4. **Import React at the top of each component**

Example:
```typescript
'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ButtonProps } from '@/types';

const ComponentName: React.FC<ButtonProps> = ({ children, onClick }) => {
  const [state, setState] = useState<string>('initial');

  useEffect(() => {
    // Effect logic here
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {children}
    </motion.div>
  );
};

export default ComponentName;
```

### CSS/Styling Guidelines

1. **Use Tailwind CSS classes for styling**
2. **Follow the existing design tokens**
3. **Use responsive design patterns**
4. **Maintain consistency with the existing design system**

Example:
```typescript
<div className="flex flex-col md:flex-row gap-4 justify-center p-6">
  <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
    Heading Text
  </h1>
  <p className="text-xl md:text-2xl text-gray-100">
    Paragraph text
  </p>
</div>
```

### File Naming Conventions

- **Components**: PascalCase (e.g., `NewComponent.tsx`)
- **Utilities**: camelCase (e.g., `formatDate.ts`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `API_ENDPOINTS.ts`)
- **Files**: kebab-case for documentation (e.g., `development-setup.md`)

## 🐛 Debugging

### Browser DevTools

1. **Open Developer Tools** (F12 or Ctrl+Shift+I)
2. **Use the Console tab** for JavaScript errors
3. **Use the Elements tab** for HTML/CSS inspection
4. **Use the Network tab** for API requests and resources

### React Developer Tools

1. **Install React Developer Tools** browser extension
2. **Inspect component hierarchy** and props
3. **View component state** and hooks

### Common Debugging Techniques

1. **Console Logging**
   ```typescript
   console.log('Debug info:', data);
   console.error('Error occurred:', error);
   ```

2. **TypeScript Type Checking**
   ```typescript
   // Use type assertions for debugging
   const debugData = data as unknown as DebugType;
   ```

3. **Error Boundaries**
   ```typescript
   // Create error boundary for catching errors
   class ErrorBoundary extends React.Component {
     // Implementation
   }
   ```

## 🧪 Testing

### Running Tests

Currently, the project doesn't have formal tests set up, but you can:

1. **Manual Testing**
   - Test all functionality in the browser
   - Check responsive design on different screen sizes
   - Verify animations and transitions

2. **Linting**
   ```bash
   npm run lint
   ```

3. **Type Checking**
   ```bash
   npx tsc --noEmit
   ```

### Future Testing Setup

Consider adding these testing frameworks:

1. **Jest** for unit testing
2. **React Testing Library** for component testing
3. **Cypress** for end-to-end testing
4. **Storybook** for component development and testing

## ❗ Common Issues

### Port Already in Use

If port 4000 is already in use:

```bash
# Kill the process on port 4000
npx kill-port 4000

# Or use a different port
npm run dev -- -p 3001
```

### Dependency Issues

If you encounter dependency issues:

```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and package-lock.json
rm -rf node_modules package-lock.json

# Reinstall dependencies
npm install
```

### TypeScript Errors

If you encounter TypeScript errors:

1. **Check tsconfig.json** configuration
2. **Ensure all imports are correct**
3. **Verify type definitions** in `types/index.ts`

### Build Errors

If the build fails:

1. **Check for syntax errors** in your code
2. **Run the linter** to catch issues
3. **Check the build log** for specific errors
4. **Ensure all imports** are valid

## 🔧 Development Tips

1. **Use Hot Module Replacement** - The dev server automatically reloads when you save changes
2. **Use TypeScript** - It helps catch errors early
3. **Follow the existing patterns** - Maintain consistency with the existing codebase
4. **Test on multiple screen sizes** - Use browser dev tools for responsive testing
5. **Use Git branches** - Keep your main branch clean
6. **Commit frequently** - Make small, focused commits
7. **Write clear commit messages** - Follow conventional commit format if possible

## 📚 Learning Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [React Documentation](https://reactjs.org/docs)
- [Framer Motion Documentation](https://www.framer.com/motion/)

## 🤝 Getting Help

If you need help:

1. **Check the documentation** in the `docs/` directory
2. **Search existing GitHub issues**
3. **Create a new issue** with detailed information
4. **Join community discussions** (if available)

## 🔄 Syncing with Main Branch

To keep your local repository up to date:

```bash
# Switch to main branch
git checkout main

# Pull latest changes
git pull origin main

# Switch back to your feature branch
git checkout feature/your-feature-name

# Merge main into your feature branch
git merge main

# Resolve any conflicts if needed
```

## 📝 Pre-commit Checklist

Before committing your changes:

- [ ] Code follows the project style guidelines
- [ ] TypeScript errors are resolved
- [ ] ESLint passes without errors
- [ ] Build completes successfully
- [ ] Functionality is tested manually
- [ ] Responsive design is verified
- [ ] Documentation is updated if needed
- [ ] Commit message is clear and descriptive

Happy coding! 🚀