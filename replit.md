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
- Users table with email, username, googleId, photoURL, referralCode, invitedBy fields
- UUID primary keys generated at database level
- Firebase authentication integration for secure access
- Complete referral tracking system
- Mining sessions, transactions, achievements, games, and profile data

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

**Authentication & Security**
- firebase: Client-side authentication SDK
- firebase-admin: Server-side token verification
- Secure token-based authentication flow

**Utilities**
- date-fns: Date manipulation and formatting
- nanoid: Unique ID generation (referral codes)
- clsx & tailwind-merge: Conditional className utilities

**Design Assets**
- Custom logo and background images stored in `attached_assets/`
- Premium light green gradient color scheme
- Glassmorphism and neumorphism design patterns

**Authentication Strategy**
- Firebase Authentication for secure user authentication
- Email/password authentication with Firebase Auth
- Google OAuth sign-in integration
- Invitation code system with referral tracking
- Referral link sharing with pingcaset.in domain
- Session management via Firebase Admin SDK token verification

## Recent Changes (November 7, 2025)

**Firebase Authentication Implementation Complete**
- ✅ Firebase client SDK integrated for frontend authentication
- ✅ Firebase Admin SDK configured for secure backend token verification
- ✅ Email/password authentication flow with beautiful themed login/signup pages
- ✅ Google OAuth sign-in integration
- ✅ Database schema updated with email, googleId, photoURL, referralCode, invitedBy fields
- ✅ Invitation code system: Users can sign up with referral codes via URL (?ref=CODE)
- ✅ Referral rewards: Invited users get 400 coins, inviters get 200 coins + 1.4x multiplier
- ✅ Referral link sharing on Team page with pingcaset.in domain
- ✅ Protected routes requiring authentication before accessing app features
- ✅ Secure token verification with email/ID validation on all auth endpoints
- ✅ Database schema synced successfully with `npm run db:push`

**Setup Required**
- Firebase project credentials needed in Replit Secrets:
  - Frontend: VITE_FIREBASE_API_KEY, VITE_FIREBASE_AUTH_DOMAIN, etc.
  - Backend: FIREBASE_ADMIN_CREDENTIALS (service account JSON)

## Recent Changes (November 5, 2025)

**Mining & Reward System Updates**
- ✅ Mining speed reduced from 10 to 2 CASET per hour for better economy balance
- ✅ Referral rewards updated: inviter receives 200 coins, invited user receives 400 coins
- ✅ Referral mining multiplier set to 1.4x per referral (scales with team size)
- ✅ Achievement rewards adjusted: Daily Login (5), Mine 1000 (100), Invite 5 Friends (100), Play 10 Games (50)
- ✅ Real-time earnings display integrated into Mining Balance card
- ✅ Earnings calculation properly capped to prevent display bugs after session completion
- ✅ UI text updated across onboarding and team pages to reflect new values

**Real-Time Integration Complete**
- ✅ WebSocket server implemented for real-time updates across all features
- ✅ WebSocketContext and AuthContext created for frontend state management
- ✅ All major pages connected to real backend APIs with React Query
- ✅ Dashboard: Real-time mining session tracking with live earnings updates
- ✅ Wallet: Live transaction history and balance updates
- ✅ Team: Real referral tracking with WebSocket notifications
- ✅ Games: Spin wheel, scratch cards, and achievements fully functional with real-time updates
- ✅ Profile: Real user data with logout functionality
- ✅ Energy system working with 5-minute refill intervals
- ✅ Mining cycles properly track 6-hour sessions at 2 coins/hour

**Remaining Mock Data**
- Leaderboard page still uses mock data (backend endpoint not yet implemented)

**Known Issues**
- Vite HMR WebSocket shows connection error in console (does not affect application functionality)
- Profile edit functionality disabled (coming soon)

**Production Ready Features**
- PostgreSQL database with comprehensive schema
- WebSocket server broadcasting on all data-changing operations
- Authentication flow working with session management
- Real-time mining, games, transactions, and referrals
- No application errors or bugs in production code