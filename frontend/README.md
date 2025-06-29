# 🎨 HireMau Frontend

## Overview

Modern React TypeScript application for the HireMau recruitment platform, featuring a comprehensive recruitment workflow management system with AI-powered tools.

## 🏗️ Architecture

```
frontend/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── ui/             # shadcn/ui components
│   │   ├── candidate/      # Candidate-specific components
│   │   ├── interview/      # Interview management components
│   │   ├── job/            # Job posting components
│   │   └── layout/         # Layout components
│   ├── pages/              # Main application pages
│   │   ├── Dashboard.tsx   # Analytics dashboard
│   │   ├── AppliedCandidates.tsx
│   │   ├── Screening.tsx   # Candidate screening
│   │   ├── Interview.tsx   # Interview interface
│   │   └── JobOpenings.tsx # Job management
│   ├── services/           # API service layer
│   │   ├── candidateService.ts
│   │   ├── jobService.ts
│   │   ├── interviewService.ts
│   │   └── jobAI.ts        # AI-powered features
│   ├── hooks/              # Custom React hooks
│   │   ├── useCandidateFiltering.ts
│   │   └── use-toast.ts
│   ├── contexts/           # React contexts
│   │   ├── RecruitmentContext.tsx
│   │   └── NavigationContext.tsx
│   ├── types/              # TypeScript type definitions
│   └── lib/                # Utility functions
└── public/                 # Static assets
```

## 🎯 Key Features

### Comprehensive Recruitment Pipeline
- **Visual workflow stages** with drag-and-drop (planned)
- **Real-time candidate tracking** across all stages
- **Advanced filtering** by position, stage, skills, location
- **Bulk operations** for candidate management

### AI-Powered Job Creation
- **Smart job description parsing** from copy-paste text
- **Automatic skill extraction** and requirement mapping
- **Job template suggestions** based on similar roles
- **Fallback extraction** when AI is unavailable

### Interview Management
- **Live interview interface** with real-time notes
- **AI-powered question suggestions** based on role
- **Interview recording** and transcript generation (planned)
- **Automated evaluation** and scoring

### Modern UX/UI
- **Dark/light mode** support
- **Responsive design** for all devices
- **Accessibility compliant** (WCAG 2.1)
- **Real-time notifications** and updates

## 🚦 Quick Start

### Prerequisites
- Node.js 18+
- npm, yarn, or bun
- Backend API running on port 8001

### Installation

```bash
# Clone repository
git clone <repository-url>
cd hiremau/frontend

# Install dependencies
npm install
# or
yarn install
# or
bun install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your configuration
```

### Environment Configuration

```env
# API Configuration
VITE_API_BASE_URL=http://localhost:8001
VITE_API_TIMEOUT=10000

# Feature Flags
VITE_ENABLE_AI_FEATURES=true
VITE_ENABLE_ANALYTICS=true
VITE_ENABLE_NOTIFICATIONS=true

# Development
VITE_DEBUG_MODE=true
VITE_LOG_LEVEL=info
```

### Development Server

```bash
# Start development server
npm run dev
# or
yarn dev
# or
bun dev
```

The application will be available at:
- **Frontend**: http://localhost:5173
- **Storybook**: http://localhost:6006 (if enabled)

### Build & Deploy

```bash
# Build for production
npm run build

# Preview production build
npm run preview

# Run tests
npm run test

# Run tests with coverage
npm run test:coverage

# Lint and format
npm run lint
npm run format
```

## 🎨 UI Components

### Design System
Built with **shadcn/ui** components providing:
- Consistent design language
- Accessible components out of the box
- Customizable theming
- TypeScript support

### Key Components

**CandidateCard**
```tsx
<CandidateCard 
  candidate={candidate}
  onAction={handleAction}
  showActions={true}
  compact={false}
/>
```

**JobModal**
```tsx
<JobModal
  isOpen={isOpen}
  onClose={handleClose}
  job={editingJob}
  mode="create" // or "edit"
/>
```

**InterviewInterface**
```tsx
<InterviewInterface
  candidateId={candidateId}
  onComplete={handleComplete}
  aiAssistance={true}
/>
```

## 📊 State Management

### Context Pattern
Using React Context for global state:

```tsx
// Recruitment Context
const { 
  selectedPosition, 
  setSelectedPosition,
  selectedEvent,
  setSelectedEvent 
} = useRecruitment();

// Navigation Context
const { 
  currentPage, 
  navigateTo,
  breadcrumbs 
} = useNavigation();
```

### Local State Hooks
Custom hooks for component-specific state:

```tsx
// Candidate filtering with global context
const {
  candidates,
  loading,
  error,
  refresh,
  activeFilters
} = useCandidateFiltering({
  additionalFilters: { stage: 'applied' }
});
```

## 🔌 API Integration

### Service Layer
Centralized API calls with error handling:

```typescript
// candidateService.ts
export const fetchCandidates = async (filters?: CandidateFilters) => {
  const params = new URLSearchParams();
  // Add filters to params...
  
  const response = await fetch(`${API_BASE_URL}/candidates/?${params}`);
  if (!response.ok) throw new Error('Failed to fetch candidates');
  
  return response.json();
};
```

### Error Handling
Consistent error handling across all services:
- Network error fallbacks
- Retry logic for failed requests
- User-friendly error messages
- Offline mode support (planned)

## 🎯 Pages Overview

### Dashboard
- **Pipeline analytics** with conversion rates
- **Recent activity** feed
- **Performance metrics** and KPIs
- **Quick actions** for common tasks

### Applied Candidates
- **Global position filtering** from header
- **Search and filter** by multiple criteria
- **Bulk actions** for candidate management
- **Stage progression** tracking

### Screening
- **Interview scheduling** with calendar integration
- **Candidate evaluation** tools
- **Notes and feedback** collection
- **AI-powered candidate insights**

### Interview
- **Live interview interface** with timer
- **Real-time note taking** with auto-save
- **Question bank** with AI suggestions
- **Recording controls** (planned)

### Job Openings
- **Job creation** with AI-powered parsing
- **Requirement management** with skill suggestions
- **Application tracking** per position
- **Performance analytics** per job

## 🧪 Testing

### Test Structure
```
tests/
├── unit/                   # Unit tests
│   ├── components/
│   ├── hooks/
│   └── services/
├── integration/            # Integration tests
├── e2e/                   # End-to-end tests
└── __mocks__/             # Test mocks
```

### Running Tests
```bash
# Unit tests
npm run test:unit

# Integration tests
npm run test:integration

# E2E tests
npm run test:e2e

# All tests with coverage
npm run test:coverage
```

### Testing Utilities
```tsx
// Test utilities
import { render, screen, fireEvent } from '@testing-library/react';
import { TestProvider } from '../tests/utils/TestProvider';

test('should render candidate card', () => {
  render(
    <TestProvider>
      <CandidateCard candidate={mockCandidate} />
    </TestProvider>
  );
  
  expect(screen.getByText(mockCandidate.name)).toBeInTheDocument();
});
```

## 🎨 Styling & Theming

### CSS Architecture
- **Tailwind CSS** for utility-first styling
- **CSS Variables** for theme customization
- **Component variants** with class-variance-authority
- **Dark mode** support built-in

### Theme Customization
```css
/* globals.css */
:root {
  --primary: 222.2 84% 4.9%;
  --primary-foreground: 210 40% 98%;
  --secondary: 210 40% 96%;
  /* ... more theme variables */
}

[data-theme="dark"] {
  --primary: 210 40% 98%;
  --primary-foreground: 222.2 84% 4.9%;
  /* ... dark theme overrides */
}
```

## 📱 Responsive Design

### Breakpoints
- **Mobile**: 320px - 768px
- **Tablet**: 768px - 1024px  
- **Desktop**: 1024px - 1440px
- **Large**: 1440px+

### Mobile-First Approach
```tsx
// Responsive component example
<div className="
  grid grid-cols-1 gap-4
  md:grid-cols-2 md:gap-6
  lg:grid-cols-3 lg:gap-8
">
  {candidates.map(candidate => (
    <CandidateCard key={candidate.id} candidate={candidate} />
  ))}
</div>
```

## 🚀 Performance Optimization

### Code Splitting
```tsx
// Lazy loading pages
const Interview = lazy(() => import('./pages/Interview'));
const Dashboard = lazy(() => import('./pages/Dashboard'));

// Route-based code splitting
<Route path="/interview/:id" element={
  <Suspense fallback={<LoadingSpinner />}>
    <Interview />
  </Suspense>
} />
```

### Optimization Techniques
- **React.memo** for expensive components
- **useMemo** for expensive calculations
- **useCallback** for stable function references
- **Virtual scrolling** for large lists (planned)
- **Image optimization** with WebP format

## 🔒 Security

### Client-Side Security
- **Input sanitization** for all user inputs
- **XSS prevention** with proper escaping
- **Content Security Policy** headers
- **Environment variable** protection

### Authentication (Planned)
- **JWT token** handling
- **Automatic token refresh**
- **Role-based component rendering**
- **Protected route** guards

## 🚀 Deployment

### Build Optimization
```bash
# Analyze bundle size
npm run analyze

# Build with specific environment
VITE_ENV=production npm run build

# Build for specific deployment target
npm run build:staging
npm run build:production
```

### Deployment Targets
- **Vercel** (recommended)
- **Netlify**
- **AWS S3 + CloudFront**
- **Google Cloud Storage**
- **Docker container**

### Environment-Specific Builds
```typescript
// vite.config.ts
export default defineConfig({
  build: {
    sourcemap: process.env.NODE_ENV === 'development',
    minify: process.env.NODE_ENV === 'production',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          ui: ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu']
        }
      }
    }
  }
});
```

## 📝 Development Guidelines

### Code Standards
- **TypeScript strict mode** enabled
- **ESLint + Prettier** for code formatting
- **Conventional commits** for Git messages
- **Component documentation** with JSDoc

### Component Development
```tsx
/**
 * CandidateCard displays candidate information with action buttons
 * 
 * @param candidate - The candidate data to display
 * @param onAction - Callback when an action is performed
 * @param showActions - Whether to show action buttons
 */
interface CandidateCardProps {
  candidate: Candidate;
  onAction?: (action: string, candidateId: string) => void;
  showActions?: boolean;
  className?: string;
}

export const CandidateCard: React.FC<CandidateCardProps> = ({
  candidate,
  onAction,
  showActions = true,
  className
}) => {
  // Component implementation
};
```

### State Management Best Practices
- Keep state as close to where it's used as possible
- Use Context for truly global state only
- Prefer custom hooks for reusable stateful logic
- Use React Query for server state management (planned)

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Follow coding standards and write tests
4. Commit changes (`git commit -m 'feat: add amazing feature'`)
5. Push to branch (`git push origin feature/amazing-feature`)
6. Open a Pull Request

### Pull Request Guidelines
- Include description of changes
- Add/update tests as needed
- Ensure all tests pass
- Update documentation if needed
- Screenshot for UI changes

## 🐛 Troubleshooting

### Common Issues

**Module not found errors**
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

**Type errors with shadcn/ui**
```bash
# Ensure all peer dependencies are installed
npm install @types/react @types/react-dom
```

**API connection issues**
- Check `VITE_API_BASE_URL` in `.env.local`
- Ensure backend is running on correct port
- Verify CORS settings in backend

**Build failures**
- Check for TypeScript errors: `npm run type-check`
- Verify all environment variables are set
- Check for circular dependencies

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](../LICENSE) file for details. 