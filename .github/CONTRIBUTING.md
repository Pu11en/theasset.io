# Contributing to Asset Marketing Studio

Thank you for your interest in contributing to the Asset Marketing Studio project! This document provides guidelines and information for contributors.

## 🚀 Getting Started

### Prerequisites

- Node.js 18.0 or higher
- npm, yarn, pnpm, or bun package manager
- Git

### Setting Up Your Development Environment

1. **Fork the repository**
   - Click the "Fork" button in the top right corner of the repository page
   - Clone your fork locally:
     ```bash
     git clone https://github.com/YOUR_USERNAME/asset-marketing-studio.git
     cd asset-marketing-studio
     ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   # or
   bun install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   # or
   bun dev
   ```

4. **Open your browser**
   Navigate to [http://localhost:4000](http://localhost:4000) to see the application running.

## 📋 Development Workflow

1. **Create a new branch**
   ```bash
   git checkout -b feature/your-feature-name
   # or
   git checkout -b fix/your-bug-fix
   ```

2. **Make your changes**
   - Follow the existing code style and patterns
   - Add comments where necessary
   - Update documentation if needed

3. **Test your changes**
   ```bash
   npm run lint
   # and
   npm run build
   ```
   Ensure the build completes successfully and there are no linting errors.

4. **Commit your changes**
   ```bash
   git add .
   git commit -m "feat: add your feature description"
   ```

5. **Push to your fork**
   ```bash
   git push origin feature/your-feature-name
   ```

6. **Create a Pull Request**
   - Go to your fork on GitHub
   - Click "New Pull Request"
   - Fill out the pull request template
   - Wait for code review

## 📝 Code Style Guidelines

### TypeScript/JavaScript

- Use TypeScript for all new code
- Follow the existing TypeScript configuration in `tsconfig.json`
- Use interfaces for type definitions
- Prefer explicit return types for functions

### React Components

- Use functional components with hooks
- Follow the existing component structure
- Use proper TypeScript props interfaces
- Use the existing UI components from the `components/ui` directory

### CSS/Styling

- Use Tailwind CSS classes for styling
- Follow the existing design tokens defined in `tailwind.config.ts`
- Use responsive design patterns
- Maintain consistency with the existing design system

### File Naming

- Use PascalCase for components (e.g., `NewComponent.tsx`)
- Use camelCase for utilities and helpers
- Use kebab-case for file names in documentation

## 🎯 Project Structure

```
asset-marketing-studio/
├── public/                 # Static assets
├── src/
│   ├── app/               # Next.js app directory
│   ├── components/
│   │   ├── sections/      # Page sections
│   │   └── ui/           # Reusable UI components
│   └── types/            # TypeScript type definitions
├── .github/              # GitHub configuration
└── docs/                 # Documentation
```

## 🐛 Reporting Issues

- Use the provided issue templates
- Search existing issues before creating a new one
- Provide as much detail as possible
- Include steps to reproduce bugs

## 📚 Documentation

- Update documentation for any new features
- Keep README.md up to date
- Add inline comments for complex logic
- Update the CHANGELOG.md for significant changes

## 🔍 Code Review Process

- All changes require code review
- Reviewers will check for:
  - Code quality and style
  - Functionality and correctness
  - Performance implications
  - Documentation completeness
- Address all review comments before merging

## 📏 Testing

- Ensure your changes don't break existing functionality
- Test on multiple browsers and screen sizes
- Check mobile responsiveness
- Verify accessibility compliance

## 🚢 Deployment

- The main branch is automatically deployed to production
- Ensure your changes are thoroughly tested before merging to main
- Use feature flags for incomplete features

## 🤝 Community Guidelines

- Be respectful and inclusive
- Welcome newcomers and help them learn
- Focus on constructive feedback
- Follow the [Code of Conduct](CODE_OF_CONDUCT.md)

## 📞 Getting Help

- Create an issue for questions
- Check the [documentation](docs/)
- Review existing issues and pull requests
- Join our community discussions

Thank you for contributing to Asset Marketing Studio! 🎉