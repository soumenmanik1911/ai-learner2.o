# AI Learning Companion - Complete Documentation

## Table of Contents
1. [Project Overview](#project-overview)
2. [Architecture](#architecture)
3. [Technology Stack](#technology-stack)
4. [Project Structure](#project-structure)
5. [Core Features](#core-features)
6. [Database Schema](#database-schema)
7. [API Endpoints](#api-endpoints)
8. [Authentication Flow](#authentication-flow)
9. [Component Documentation](#component-documentation)
10. [State Management](#state-management)
11. [Styling & UI](#styling--ui)
12. [Deployment](#deployment)
13. [Environment Variables](#environment-variables)
14. [Development Guide](#development-guide)
15. [Troubleshooting](#troubleshooting)

## Project Overview

**AI Learning Companion** is a Next.js-based educational platform that provides personalized AI tutoring through voice interactions. The application allows users to create custom AI companions for different subjects and topics, enabling real-time voice conversations for learning.

### Key Features
- **Voice-based AI Tutoring**: Real-time voice conversations with AI companions
- **Personalized Learning**: Custom companions for different subjects and topics
- **Progress Tracking**: Analytics dashboard for learning progress
- **Multi-subject Support**: Maths, Science, Language, History, Coding, Economics
- **User Authentication**: Secure user management with Clerk
- **Session History**: Track and review past learning sessions

## Architecture

The application follows a modern Next.js 15 architecture with the App Router pattern:

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   External      │
│   (Next.js)     │◄──►│   (Supabase)    │◄──►│   Services      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Clerk Auth    │    │   PostgreSQL    │    │   Vapi AI       │
│   (User Mgmt)   │    │   (Database)    │    │   (Voice AI)    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Architecture Principles
- **Server-Side Rendering**: Optimized performance with SSR
- **Type Safety**: Full TypeScript implementation
- **Component-Based**: Modular React components
- **API-First**: RESTful API design
- **Security-First**: Authentication and authorization at every level

## Technology Stack

### Frontend
- **Next.js 15.3.4**: React framework with App Router
- **React 19**: Latest React with concurrent features
- **TypeScript 5**: Type-safe development
- **Tailwind CSS 4**: Utility-first CSS framework
- **Framer Motion**: Animation library
- **Lucide React**: Icon library

### Backend & Database
- **Supabase**: Backend-as-a-Service with PostgreSQL
- **Clerk**: Authentication and user management
- **Vapi AI**: Voice AI platform for real-time conversations

### Development Tools
- **ESLint**: Code linting
- **PostCSS**: CSS processing
- **Sentry**: Error tracking and monitoring

### External Services
- **Vapi AI**: Voice conversation API
- **11labs**: Voice synthesis
- **Deepgram**: Speech-to-text transcription

## Project Structure

```
reconin-vapi/
├── app/                          # Next.js App Router pages
│   ├── api/                      # API routes
│   ├── companion/                # Companion interaction pages
│   ├── dashboard/                # User dashboard
│   ├── my-journey/              # Learning progress
│   ├── sign-in/                 # Authentication pages
│   ├── sign-up/
│   └── subscription/            # Subscription management
├── components/                   # React components
│   ├── ui/                      # Reusable UI components
│   ├── CompanionForm.tsx        # Companion creation form
│   ├── CompanionComponent.tsx   # Voice interaction component
│   ├── StudyAnalyticsDashboard.tsx # Learning analytics
│   └── LearningPathRecommender.tsx # AI recommendations
├── lib/                         # Utility functions and configurations
│   ├── actions/                 # Server actions
│   ├── supabase.ts             # Database client
│   └── utils.ts                # Helper functions
├── types/                       # TypeScript type definitions
├── constants/                   # Application constants
├── public/                      # Static assets
└── middleware.ts               # Authentication middleware
```

## Core Features

### 1. AI Companion Creation
Users can create personalized AI companions with:
- **Custom Names**: Personalize the learning experience
- **Subject Selection**: Choose from 6 subjects (Maths, Science, Language, History, Coding, Economics)
- **Topic Specification**: Define specific learning topics
- **Voice Preferences**: Male/Female voices with formal/casual styles
- **Session Duration**: 15-60 minute sessions

### 2. Voice-Based Learning
Real-time voice conversations featuring:
- **Live Transcription**: Real-time speech-to-text
- **Voice Synthesis**: Natural AI voice responses
- **Interactive Sessions**: Two-way voice communication
- **Session Recording**: Automatic session history tracking

### 3. Learning Analytics
Comprehensive progress tracking including:
- **Study Time Tracking**: Total hours and session duration
- **Performance Metrics**: Average scores and improvement rates
- **Subject Progress**: Individual subject performance
- **Learning Streaks**: Consistency tracking
- **AI Insights**: Personalized learning recommendations

### 4. User Management
Complete user lifecycle management:
- **Authentication**: Secure sign-in/sign-up with Clerk
- **Profile Management**: User profiles and preferences
- **Session History**: Complete learning session records
- **Subscription Management**: Feature access control

## Database Schema

### Tables

#### `companions`
```sql
CREATE TABLE companions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR NOT NULL,
  subject VARCHAR NOT NULL,
  topic TEXT NOT NULL,
  voice VARCHAR NOT NULL,
  style VARCHAR NOT NULL,
  duration INTEGER NOT NULL,
  author UUID REFERENCES auth.users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### `logs`
```sql
CREATE TABLE logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  companion_id UUID REFERENCES companions(id),
  user_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Relationships
- **One-to-Many**: User → Companions (one user can create many companions)
- **Many-to-Many**: Users ↔ Companions (through logs table for session tracking)

## API Endpoints

### Server Actions (lib/actions/companion.action.ts)

#### `createCompanion(formData: CreateCompanion)`
Creates a new AI companion for the authenticated user.

**Parameters:**
- `name`: Companion name
- `subject`: Learning subject
- `topic`: Specific topic
- `voice`: Voice preference (male/female)
- `style`: Communication style (formal/casual)
- `duration`: Session duration in minutes

**Returns:** Created companion object

#### `getAllCompanions(options: GetAllCompanions)`
Retrieves companions with filtering and pagination.

**Parameters:**
- `limit`: Number of results (default: 10)
- `page`: Page number (default: 1)
- `subject`: Filter by subject
- `topic`: Filter by topic

**Returns:** Array of companion objects

#### `getRecentSessions(limit: number)`
Retrieves recent learning sessions with deduplication.

**Parameters:**
- `limit`: Number of recent sessions (default: 10)

**Returns:** Array of unique companion sessions

#### `getUserCompanions(userId: string)`
Retrieves all companions created by a specific user.

**Parameters:**
- `userId`: User identifier

**Returns:** Array of user's companions

#### `addToSessionHistory(companionId: string)`
Records a completed learning session.

**Parameters:**
- `companionId`: Companion identifier

**Returns:** Session log entry

## Authentication Flow

### Clerk Integration
The application uses Clerk for authentication with the following flow:

1. **User Registration**: Users sign up via Clerk's hosted UI
2. **Session Management**: Clerk handles session tokens and refresh
3. **Route Protection**: Middleware protects authenticated routes
4. **User Context**: User data available throughout the application

### Protected Routes
- `/dashboard`: User dashboard
- `/companion/*`: Companion interaction pages
- `/my-journey`: Learning progress
- `/companion/new`: Companion creation

### Middleware Configuration
```typescript
// middleware.ts
import { clerkMiddleware } from "@clerk/nextjs/server";

export default clerkMiddleware();

export const config = {
  matcher: [
    "/((?!_next|[^?]*\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
```

## Component Documentation

### Core Components

#### `CompanionForm.tsx`
**Purpose**: Form for creating new AI companions

**Features:**
- Form validation with Zod schema
- Subject and voice selection
- Topic description input
- Duration configuration

**Props:** None (uses form state)

**Key Methods:**
- `onSubmit()`: Handles form submission and companion creation

#### `CompanionComponent.tsx`
**Purpose**: Voice interaction interface for AI companions

**Features:**
- Real-time voice conversation
- Call status management
- Message transcription
- Microphone controls

**Props:**
```typescript
interface CompanionComponentProps {
  companionId: string;
  subject: string;
  topic: string;
  name: string;
  userName: string;
  userImage: string;
  voice: string;
  style: string;
}
```

**Key Methods:**
- `handleCall()`: Initiates voice session
- `handleDisconnect()`: Ends voice session
- `toggleMicrophone()`: Mutes/unmutes microphone

#### `StudyAnalyticsDashboard.tsx`
**Purpose**: Learning progress analytics and insights

**Features:**
- Weekly performance charts
- Subject progress tracking
- Learning streaks
- AI-powered insights
- Achievement tracking

**Props:** None (fetches data from server actions)

**Key Features:**
- Interactive charts
- Real-time data updates
- Personalized recommendations

#### `LearningPathRecommender.tsx`
**Purpose**: AI-powered learning path recommendations

**Features:**
- Personalized learning paths
- Subject-based recommendations
- Progress-based suggestions
- Interactive path selection

### UI Components (components/ui/)

#### Form Components
- `Form.tsx`: Form wrapper with validation
- `Input.tsx`: Text input component
- `Select.tsx`: Dropdown selection component
- `Textarea.tsx`: Multi-line text input
- `Button.tsx`: Action button component

#### Display Components
- `Table.tsx`: Data table component
- `Accordion.tsx`: Collapsible content sections
- `Loading.tsx`: Loading states and spinners

## State Management

### Client-Side State
- **React Hooks**: useState, useEffect for component state
- **Form State**: react-hook-form for form management
- **Session State**: Call status, messages, user interactions

### Server-Side State
- **Database**: PostgreSQL for persistent data
- **Authentication**: Clerk for user sessions
- **File Storage**: Supabase storage for assets

### State Flow
```
User Action → Component State → Server Action → Database → UI Update
```

## Styling & UI

### Design System
- **Typography**: Bricolage Grotesque font family
- **Colors**: Subject-based color coding
- **Spacing**: Consistent 8px grid system
- **Components**: Reusable UI components

### Subject Colors
```typescript
export const subjectsColors = {
  science: "#E5D0FF",
  maths: "#FFDA6E",
  language: "#BDE7FF",
  coding: "#FFC8E4",
  history: "#FFECC8",
  economics: "#C8FFDF",
};
```

### Responsive Design
- **Mobile-First**: Responsive design approach
- **Breakpoints**: Tailwind CSS responsive utilities
- **Touch-Friendly**: Optimized for mobile interactions

### Animations
- **Framer Motion**: Smooth component transitions
- **Lottie**: Complex animations (sound waves)
- **CSS Transitions**: Hover effects and state changes

## Deployment

### Vercel Deployment
1. **Repository Setup**: Connect GitHub repository
2. **Environment Variables**: Configure all required variables
3. **Build Settings**: Automatic build and deployment
4. **Domain Configuration**: Custom domain setup

### Netlify Deployment
1. **Repository Import**: Connect Git repository
2. **Build Command**: `npm run build`
3. **Publish Directory**: `.next`
4. **Environment Variables**: Configure in Netlify dashboard

### Environment Variables
```bash
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_publishable_key
CLERK_SECRET_KEY=your_secret_key

# Supabase Database
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Vapi AI
NEXT_PUBLIC_VAPI_PUBLIC_KEY=your_vapi_public_key
VAPI_PRIVATE_KEY=your_vapi_private_key

# Sentry Error Tracking
NEXT_PUBLIC_SENTRY_DSN=your_sentry_dsn
```

## Environment Variables

### Required Variables
- **Clerk Keys**: Authentication service configuration
- **Supabase Credentials**: Database connection
- **Vapi AI Keys**: Voice AI service configuration

### Optional Variables
- **Sentry DSN**: Error tracking and monitoring
- **Custom Domains**: Production domain configuration

### Security Considerations
- **Environment Separation**: Different keys for dev/staging/prod
- **Key Rotation**: Regular key updates
- **Access Control**: Limited key access

## Development Guide

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Git
- Supabase account
- Clerk account
- Vapi AI account

### Setup Instructions
1. **Clone Repository**
   ```bash
   git clone <repository-url>
   cd reconin-vapi
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your credentials
   ```

4. **Database Setup**
   - Create Supabase project
   - Run database migrations
   - Configure RLS policies

5. **Start Development Server**
   ```bash
   npm run dev
   ```

### Development Workflow
1. **Feature Development**: Create feature branches
2. **Testing**: Test locally before committing
3. **Code Review**: Submit pull requests
4. **Deployment**: Automatic deployment on merge

### Code Standards
- **TypeScript**: Strict type checking
- **ESLint**: Code quality enforcement
- **Prettier**: Code formatting
- **Conventional Commits**: Commit message standards

## Troubleshooting

### Common Issues

#### Authentication Errors
**Problem**: Clerk authentication not working
**Solution**: 
- Verify environment variables
- Check Clerk dashboard configuration
- Ensure middleware is properly configured

#### Database Connection Issues
**Problem**: Supabase connection failing
**Solution**:
- Verify Supabase URL and keys
- Check network connectivity
- Validate RLS policies

#### Voice AI Issues
**Problem**: Vapi AI not responding
**Solution**:
- Verify Vapi API keys
- Check voice configuration
- Ensure proper assistant setup

#### Build Errors
**Problem**: Build failing in production
**Solution**:
- Check TypeScript errors
- Verify all dependencies
- Review environment variables

### Performance Optimization
- **Image Optimization**: Use Next.js Image component
- **Code Splitting**: Automatic route-based splitting
- **Caching**: Implement proper caching strategies
- **Bundle Analysis**: Monitor bundle sizes

### Monitoring
- **Sentry**: Error tracking and performance monitoring
- **Analytics**: User behavior tracking
- **Logs**: Application logging
- **Health Checks**: System health monitoring

---

## Conclusion

This AI Learning Companion platform provides a comprehensive solution for personalized, voice-based learning. The architecture ensures scalability, security, and maintainability while delivering an engaging user experience.

For additional support or questions, please refer to the individual service documentation or contact the development team. 