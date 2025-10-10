# Deployment Guide

This guide provides detailed instructions for deploying the Asset Marketing Studio website to various hosting platforms.

## 📋 Table of Contents

- [Prerequisites](#prerequisites)
- [Build Process](#build-process)
- [Deployment Platforms](#deployment-platforms)
- [Environment Variables](#environment-variables)
- [Performance Optimization](#performance-optimization)
- [Domain Configuration](#domain-configuration)
- [Monitoring and Analytics](#monitoring-and-analytics)
- [Troubleshooting](#troubleshooting)

## ✅ Prerequisites

Before deploying, ensure you have:

- Node.js 18.0 or higher installed
- Access to the deployment platform
- Domain name (if using custom domain)
- SSL certificate (most platforms provide this automatically)
- Git repository with the application code

## 🔨 Build Process

### 1. Install Dependencies

```bash
npm install
# or
yarn install
# or
pnpm install
# or
bun install
```

### 2. Build the Application

```bash
npm run build
# or
yarn build
# or
pnpm build
# or
bun build
```

The build process creates an optimized production build in the `.next` directory.

### 3. Test the Production Build Locally

```bash
npm run start
# or
yarn start
# or
pnpm start
# or
bun start
```

## 🚀 Deployment Platforms

### Vercel (Recommended)

Vercel is the recommended platform for Next.js applications and provides the best integration.

#### Automatic Deployment

1. Connect your GitHub repository to Vercel
2. Vercel will automatically detect the Next.js framework
3. Configure build settings:
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`
   - **Install Command**: `npm install`
4. Deploy!

#### Manual Deployment with Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
vercel --prod
```

### Netlify

Netlify is another excellent option for static site deployment.

#### Using Git Integration

1. Connect your GitHub repository to Netlify
2. Configure build settings:
   - **Build command**: `npm run build`
   - **Publish directory**: `.next`
3. Set environment variables if needed
4. Deploy

#### Manual Deployment

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login to Netlify
netlify login

# Deploy
netlify deploy --prod --dir=.next
```

### AWS Amplify

AWS Amplify provides hosting with AWS infrastructure.

#### Deployment Steps

1. Connect your GitHub repository to AWS Amplify
2. Configure build settings:
   - **Build command**: `npm run build`
   - **Base directory**: `/`
   - **Start command**: `npm run start`
3. Deploy

### Docker Deployment

For custom server deployments, you can use Docker.

#### Dockerfile

```dockerfile
# Use the official Node.js runtime as a parent image
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install dependencies based on the preferred package manager
COPY package.json package-lock.json* ./
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Next.js collects completely anonymous telemetry data about general usage.
# Learn more here: https://nextjs.org/telemetry
# Uncomment the following line in case you want to disable telemetry during the build.
ENV NEXT_TELEMETRY_DISABLED 1

RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
# Uncomment the following line in case you want to disable telemetry during runtime.
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

# Set the correct permission for prerender cache
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000
# set hostname to localhost
ENV HOSTNAME "0.0.0.0"

# server.js is created by next build from the standalone output
# https://nextjs.org/docs/pages/api-reference/next-config-js/output
CMD ["node", "server.js"]
```

#### Build and Run

```bash
# Build the Docker image
docker build -t asset-marketing-studio .

# Run the container
docker run -p 3000:3000 asset-marketing-studio
```

## 🔧 Environment Variables

### Required Environment Variables

Currently, the application doesn't require any environment variables for basic functionality.

### Optional Environment Variables

```bash
# Analytics
NEXT_PUBLIC_GA_ID=GA_MEASUREMENT_ID

# API URLs (for future integrations)
NEXT_PUBLIC_API_URL=https://api.theassetstudio.com

# Feature flags
NEXT_PUBLIC_ENABLE_ANALYTICS=true
```

### Platform-Specific Configuration

#### Vercel

In Vercel dashboard, go to Settings > Environment Variables to add your variables.

#### Netlify

In Netlify dashboard, go to Site settings > Build & deploy > Environment > Environment variables.

#### AWS Amplify

In AWS Amplify console, go to App settings > Environment variables.

## ⚡ Performance Optimization

### Build Optimizations

The Next.js build process already includes:

- Automatic code splitting
- Tree shaking
- Minification
- Image optimization
- Font optimization

### Additional Optimizations

1. **Enable Compression**
   ```javascript
   // next.config.ts
   module.exports = {
     compress: true,
   }
   ```

2. **Optimize Images**
   - Use Next.js Image component for all images
   - Implement lazy loading
   - Use appropriate image formats (WebP, AVIF)

3. **Enable Caching**
   ```javascript
   // next.config.ts
   module.exports = {
     async headers() {
       return [
         {
           source: '/(.*)',
           headers: [
             {
               key: 'Cache-Control',
               value: 'public, max-age=31536000, immutable',
             },
           ],
         },
       ]
     },
   }
   ```

## 🌐 Domain Configuration

### Custom Domain Setup

#### Vercel

1. Go to Project Settings > Domains
2. Add your custom domain
3. Configure DNS records as instructed by Vercel
4. SSL certificate is automatically configured

#### Netlify

1. Go to Site settings > Domain management
2. Add custom domain
3. Configure DNS records
4. SSL certificate is automatically configured

#### AWS Amplify

1. Go to App settings > Domain management
2. Add custom domain
3. Configure DNS records
4. SSL certificate is automatically configured

### DNS Configuration

Typical DNS records needed:

```
Type: A
Name: @
Value: PLATFORM_IP_ADDRESS

Type: CNAME
Name: www
Value: PLATFORM_DOMAIN
```

## 📊 Monitoring and Analytics

### Performance Monitoring

1. **Google Analytics**
   ```javascript
   // Add to _app.tsx or layout.tsx
   import { useEffect } from 'react'
   import { useRouter } from 'next/router'
   
   export default function App({ Component, pageProps }) {
     const router = useRouter()
     
     useEffect(() => {
       const handleRouteChange = (url) => {
         gtag('config', GA_MEASUREMENT_ID, {
           page_path: url,
         })
       }
       
       router.events.on('routeChangeComplete', handleRouteChange)
       return () => {
         router.events.off('routeChangeComplete', handleRouteChange)
       }
     }, [router.events])
     
     return <Component {...pageProps} />
   }
   ```

2. **Vercel Analytics**
   - Enable in Vercel dashboard
   - No additional configuration needed

3. **Core Web Vitals**
   ```javascript
   // Add to _app.tsx or layout.tsx
   export function reportWebVitals(metric) {
     console.log(metric)
   }
   ```

### Error Monitoring

1. **Sentry**
   ```bash
   npm install @sentry/nextjs
   ```

2. **LogRocket**
   ```bash
   npm install logrocket
   ```

## 🔍 Troubleshooting

### Common Issues

1. **Build Fails**
   - Check Node.js version (requires 18.0+)
   - Clear node_modules and reinstall
   - Check for syntax errors

2. **Deployment Fails**
   - Verify build command is correct
   - Check environment variables
   - Review deployment logs

3. **Performance Issues**
   - Check bundle size with `npm run build`
   - Optimize images
   - Enable caching

4. **Domain Issues**
   - Verify DNS configuration
   - Check SSL certificate status
   - Ensure domain is pointing to correct platform

### Debugging Steps

1. Check build logs for errors
2. Test locally with production build
3. Verify environment variables
4. Check platform-specific documentation
5. Review network requests in browser dev tools

## 🔄 CI/CD Integration

### GitHub Actions

```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [ main ]

jobs:
  deploy:
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
    
    - name: Build
      run: npm run build
    
    - name: Deploy to Vercel
      uses: amondnet/vercel-action@v20
      with:
        vercel-token: ${{ secrets.VERCEL_TOKEN }}
        vercel-org-id: ${{ secrets.ORG_ID }}
        vercel-project-id: ${{ secrets.PROJECT_ID }}
        vercel-args: '--prod'
```

## 📝 Pre-Deployment Checklist

Before deploying to production:

- [ ] All tests pass
- [ ] Build completes successfully
- [ ] Environment variables are configured
- [ ] Domain is properly configured
- [ ] SSL certificate is valid
- [ ] Analytics and monitoring are set up
- [ ] Performance optimization is enabled
- [ ] Error handling is implemented
- [ ] Backup strategy is in place
- [ ] Rollback plan is documented

## 🚀 Post-Deployment Tasks

After deployment:

1. Verify the website is accessible
2. Test all functionality
3. Check analytics integration
4. Monitor performance metrics
5. Set up alerts for errors
6. Document any issues found
7. Update team on deployment status