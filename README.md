# MindForge

<img width="1024" height="1024" alt="Logo" src="https://github.com/user-attachments/assets/bf0f977c-4f21-428d-bef3-6daeddc227b0" />
<img width="840" height="853" alt="image" src="https://github.com/user-attachments/assets/d4f24574-1c5b-4e81-ab62-19e283ba3428" />
<img width="840" height="859" alt="image" src="https://github.com/user-attachments/assets/212ea595-67bd-443b-ad78-304d6c6a83c4" />



A revolutionary mobile micro-learning application leveraging cognitive science principles to transform knowledge acquisition and retention through spaced repetition and active recall methodologies.

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Project Vision](#project-vision)
3. [Technical Architecture](#technical-architecture)
4. [Features](#features)
5. [Installation](#installation)
6. [Development](#development)
7. [Project Structure](#project-structure)
8. [API Documentation](#api-documentation)
9. [Testing](#testing)
10. [Deployment](#deployment)
11. [Contributing](#contributing)
12. [License](#license)
13. [Contact](#contact)

## Executive Summary

MindForge addresses the fundamental challenge of knowledge retention in modern education and professional development. Traditional learning methods result in rapid knowledge decay, with studies showing that learners forget up to 90% of information within one week. MindForge implements scientifically-proven cognitive techniques to ensure knowledge transitions from short-term to long-term memory through systematic, optimised review cycles.

### Key Differentiators

- **Evidence-Based Methodology**: Implementation of SM-2 spaced repetition algorithm with adaptive difficulty adjustment
- **Content Agnosticism**: Automated processing of any knowledge domain from multiple source formats
- **Micro-Learning Architecture**: 5-minute optimized sessions designed for modern attention spans
- **Offline-First Design**: Full functionality without connectivity, with intelligent background synchronization
- **Enterprise-Ready**: Scalable architecture supporting individual to organisational deployments

## Project Vision

### Problem Statement

Current learning platforms focus on content consumption rather than retention. Professional development and academic success require not just access to information, but the ability to recall and apply knowledge effectively. Existing solutions either rely on ineffective cramming methods or require extensive manual card creation.

### Solution

MindForge automates the transformation of any content source into optimized learning materials, delivering them through scientifically-timed review sessions. The platform eliminates the friction between content discovery and knowledge mastery.

### Target Market

**Primary Users**
- University students preparing for examinations
- Professional certification candidates
- Corporate learning and development teams
- Lifelong learners pursuing personal development

**Market Sizing**
- Global e-learning market: $315 billion (2023)
- Mobile learning segment: 40% CAGR
- Target addressable market: 500 million learners globally

## Technical Architecture

### System Design

```
┌─────────────────────────────────────────────────────────────┐
│                        Client Layer                          │
├─────────────────────────────────────────────────────────────┤
│  Mobile Application (React Native)                           │
│  ├── Presentation Layer (UI Components)                      │
│  ├── State Management (Redux Toolkit)                        │
│  ├── Offline Storage (SQLite + AsyncStorage)                 │
│  └── Background Sync (Service Workers)                       │
├─────────────────────────────────────────────────────────────┤
│                        API Gateway                           │
├─────────────────────────────────────────────────────────────┤
│                     Microservices Layer                      │
│  ├── Authentication Service (Node.js)                        │
│  ├── Content Processing Service (Python)                     │
│  ├── Learning Engine Service (Python)                        │
│  ├── Analytics Service (Node.js)                             │
│  └── Payment Service (Node.js)                               │
├─────────────────────────────────────────────────────────────┤
│                      Data Layer                              │
│  ├── PostgreSQL (Primary Database)                           │
│  ├── Redis (Caching & Sessions)                              │
│  └── S3-Compatible Storage (Media Assets)                    │
├─────────────────────────────────────────────────────────────┤
│                    External Services                         │
│  ├── OpenAI API (Content Generation)                         │
│  ├── Stripe (Payment Processing)                             │
│  └── SendGrid (Transactional Email)                          │
└─────────────────────────────────────────────────────────────┘
```

### Technology Stack

**Frontend**
- React Native 0.81.4 with Expo SDK 54
- TypeScript for type safety
- Redux Toolkit for state management
- React Navigation v7 for routing
- React Native Reanimated for animations

**Backend**
- Node.js with Express for API Gateway
- Python FastAPI for ML services
- PostgreSQL 15 for data persistence
- Redis for caching layer
- Docker containerization

**Infrastructure**
- AWS/GCP cloud deployment
- Kubernetes orchestration
- CloudFlare CDN
- GitHub Actions CI/CD

### Security Architecture

- JWT-based authentication with refresh tokens
- End-to-end encryption for sensitive data
- Rate limiting and DDoS protection
- OWASP compliance for web security
- GDPR/CCPA compliant data handling

## Features

### Current Implementation (v0.1.0)

**Core Functionality**
- User authentication system with JWT
- Premium glassmorphic UI design system
- Onboarding flow for new users
- Redux-based state management
- Offline-first architecture foundation

**User Interface**
- Home dashboard with progress metrics
- Authentication screens (Login, Signup, Password Reset)
- Bottom tab navigation with blur effects
- Dark theme with gradient accents
- Responsive layout system

### Planned Features (v1.0.0)

**Learning System**
- SM-2 spaced repetition algorithm implementation
- Active recall question generation
- Multi-format content processing (Web, PDF, Text)
- AI-powered card creation
- Adaptive difficulty adjustment

**Content Management**
- Web scraping engine
- PDF text extraction
- LaTeX formula support
- Image and diagram processing
- Audio pronunciation support

**Analytics & Tracking**
- Learning velocity metrics
- Retention rate analysis
- Knowledge graph visualisation
- Performance predictions
- Export capabilities

**Monetization**
- Freemium tier with 2 skill categories
- Pro subscription (£9.99/month)
- Enterprise team management
- Content marketplace

### Future Roadmap (v2.0.0+)

- Collaborative learning features
- AI tutoring assistance
- API for third-party integrations

## Installation

### Prerequisites

- Node.js 18.0.0 or higher
- npm 9.0.0 or higher
- Expo CLI
- iOS Simulator (Mac) or Android Studio
- Git

### Development Setup

```bash
# Clone the repository
git clone https://github.com/Szyyi/mindforge.git
cd mindforge

# Install dependencies
cd apps/mobile
npm install

# Configure environment variables
cp .env.example .env
# Edit .env with your configuration

# Start development server
npx expo start

# Run on iOS simulator
npx expo run:ios

# Run on Android emulator
npx expo run:android
```

### Environment Configuration

Create `.env` file with required variables:

```env
# API Configuration
API_URL=http://localhost:3000
API_KEY=development_key

# Authentication
JWT_SECRET=your_jwt_secret
REFRESH_TOKEN_SECRET=your_refresh_secret

# External Services
OPENAI_API_KEY=your_openai_key
STRIPE_SECRET_KEY=your_stripe_key

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/mindforge
REDIS_URL=redis://localhost:6379
```

## Development

### Code Standards

**TypeScript Configuration**
- Strict mode enabled
- No implicit any
- Consistent return types
- Interface-first design

**Component Architecture**
- Functional components with hooks
- Single responsibility principle
- Prop type validation
- Comprehensive testing

**State Management**
- Redux Toolkit for global state
- Local state for component-specific data
- Optimistic updates
- Normalized data structure

### Branch Strategy

```
main (production)
├── develop (staging)
│   ├── feature/feature-name
│   ├── bugfix/issue-number
│   └── hotfix/critical-fix
```

### Commit Convention

```
type(scope): subject

body

footer
```

Types: feat, fix, docs, style, refactor, test, chore

## Project Structure

```
mindforge/
├── apps/
│   ├── mobile/              # React Native application
│   │   ├── src/
│   │   │   ├── components/  # Reusable UI components
│   │   │   ├── screens/     # Screen components
│   │   │   ├── navigation/  # Navigation configuration
│   │   │   ├── store/       # Redux store and slices
│   │   │   ├── services/    # API and external services
│   │   │   ├── utils/       # Utility functions
│   │   │   ├── types/       # TypeScript definitions
│   │   │   └── theme/       # Design system
│   │   └── package.json
│   └── api/                 # Backend services
│       ├── gateway/         # API Gateway
│       └── services/        # Microservices
├── packages/               # Shared packages
│   ├── shared/            # Shared types and utilities
│   └── ui/                # Shared UI components
├── infrastructure/        # Deployment configurations
│   ├── docker/
│   ├── kubernetes/
│   └── terraform/
└── docs/                  # Documentation
```

## API Documentation

### Authentication Endpoints

```
POST   /api/auth/register     - User registration
POST   /api/auth/login        - User login
POST   /api/auth/refresh      - Token refresh
POST   /api/auth/logout       - User logout
POST   /api/auth/reset        - Password reset
```

### Learning Endpoints

```
GET    /api/cards             - Retrieve user cards
POST   /api/cards             - Create new card
PUT    /api/cards/:id         - Update card
DELETE /api/cards/:id         - Delete card
POST   /api/cards/generate    - AI card generation
```

### Review Endpoints

```
GET    /api/reviews/today     - Daily review queue
POST   /api/reviews/:id       - Submit review rating
GET    /api/reviews/stats     - Review statistics
```

## Testing

### Testing Strategy

**Unit Tests**
- Component testing with React Native Testing Library
- Service layer testing with Jest
- Redux slice testing
- Utility function testing

**Integration Tests**
- API endpoint testing
- Database transaction testing
- Authentication flow testing

**E2E Tests**
- Critical user journeys
- Cross-platform compatibility
- Performance benchmarks

### Running Tests

```bash
# Unit tests
npm test

# Integration tests
npm run test:integration

# E2E tests
npm run test:e2e

# Coverage report
npm run test:coverage
```

## Deployment

### Mobile Application

**iOS Deployment**
1. Configure certificates in Apple Developer Portal
2. Build production bundle
3. Submit to App Store Connect
4. TestFlight beta testing
5. Production release

**Android Deployment**
1. Generate signed APK
2. Upload to Google Play Console
3. Internal testing track
4. Staged rollout
5. Production release

### Backend Services

**Container Deployment**
```bash
# Build Docker images
docker build -t mindforge/api-gateway ./apps/api/gateway
docker build -t mindforge/content-service ./apps/api/services/content

# Deploy to Kubernetes
kubectl apply -f infrastructure/kubernetes/
```

### Monitoring

- Application Performance Monitoring (APM)
- Error tracking with Sentry
- Analytics with Mixpanel
- Infrastructure monitoring with Datadog

## Contributing

### Development Process

1. Fork the repository
2. Create feature branch from develop
3. Implement changes with tests
4. Submit pull request with description
5. Code review by maintainers
6. Merge upon approval

### Code Review Criteria

- Functionality correctness
- Test coverage
- Performance impact
- Security considerations
- Documentation updates

## License

Copyright (C) 2025 MindForge. All rights reserved.

This software is proprietary and confidential. Unauthorised copying, modification, distribution, or use of this software, via any medium, is strictly prohibited without explicit written permission from MindForge maintainers 

## Contact

### Project Team

**Oliver Moughton**  
Founder & Product Owner  
Email: ols.moughton@outlook.com

**Szymon Procak MBCS**  
Technical Lead  
Email: SzyYP@proton.me

### Support

For technical support or inquiries:
- Email: SzyYP@proton.me
- Issue Tracker: GitHub Issues

Built with dedication to revolutionising knowledge retention.  
Version 0.1.0 | Last Updated: January 2025
