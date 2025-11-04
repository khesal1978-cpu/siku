# PingCaset - Crypto Mining Web Application

## Overview

PingCaset is a mobile-first crypto-style mining web application inspired by Pi Network and Interlink Network. The app features a gamified mining experience where users can earn "Caset" coins through 6-hour mining cycles (10 coins per hour), build referral networks, and compete on global leaderboards. The application uses a premium light green theme with glassmorphic and neumorphic design elements.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework & Build System**
- React 18+ with TypeScript for type-safe component development
- Vite as the build tool and development server
- Wouter for lightweight client-side routing (replacing React Router)
- Mobile-first responsive design approach

**UI Component System**
- shadcn/ui component library with Radix UI primitives
- Tailwind CSS for utility-first styling with custom design tokens
- CSS variables for theming (light mode with premium green palette)
- Component path aliases configured (`@/components`, `@/lib`, `@/hooks`)

**State Management**
- TanStack Query (React Query) for server state management
- Local component state using React hooks
- LocalStorage for client-side persistence (onboarding status, user preferences)

**Key Features**
- Splash screen with animated transitions
- Multi-step onboarding modal system
- Bottom navigation with 5 main sections (Mine, Team, Wallet, Ranks, Profile)
- Real-time mining dashboard with animated progress indicators
- Referral code system with copy/share functionality
- Leaderboard with global and regional rankings
- Transaction history display

### Backend Architecture

**Server Framework**
- Express.js as the HTTP server
- TypeScript for type safety across the stack
- Custom middleware for request logging and JSON body parsing

**Data Storage**
- Drizzle ORM for database interactions
- Neon Serverless PostgreSQL as the database provider
- WebSocket support via `ws` package for real-time features
- Schema-first approach with Drizzle Zod for validation

**API Design**
- RESTful API structure (routes prefixed with `/api`)
- In-memory storage abstraction (`MemStorage` class) for development
- Storage interface pattern for easy database swapping
- CRUD operations abstracted through `IStorage` interface

**Current Schema**
- Users table with username/password authentication
- UUID primary keys generated at database level
- Extensible schema structure for future features (mining records, referrals, transactions)

### External Dependencies

**UI & Styling**
- Radix UI: Accessible, unstyled component primitives
- Tailwind CSS: Utility-first CSS framework
- class-variance-authority: Type-safe variant management
- Google Fonts: Inter (primary), Poppins (accent/numbers)

**Database & ORM**
- @neondatabase/serverless: Neon PostgreSQL client
- Drizzle ORM: TypeScript-first ORM
- drizzle-zod: Schema validation integration
- connect-pg-simple: PostgreSQL session store

**Form & Validation**
- react-hook-form: Form state management
- @hookform/resolvers: Validation resolver integration
- zod: Schema validation library

**Development Tools**
- @replit/vite-plugin-runtime-error-modal: Runtime error overlay
- @replit/vite-plugin-cartographer: Development cartographer
- esbuild: Server bundling for production

**Utilities**
- date-fns: Date manipulation and formatting
- nanoid: Unique ID generation
- clsx & tailwind-merge: Conditional className utilities

**Design Assets**
- Custom logo and background images stored in `attached_assets/`
- Premium light green gradient color scheme
- Glassmorphism and neumorphism design patterns

**Authentication Strategy**
- Currently implements basic username/password schema
- Designed to support email, Google, and phone authentication
- Session management prepared via connect-pg-simple

**Missing Production Features**
- Most components use mock data (marked with `//todo: remove mock functionality`)
- Authentication endpoints not yet implemented
- Real-time mining logic needs backend implementation
- Referral system requires database integration
- Leaderboard needs actual user ranking queries
- Wallet withdrawal functionality disabled in MVP