# PingCaset - Crypto Mining App Design Guidelines

## Design Approach
**Reference-Based**: Inspired by Pi Network, Interlink Network, and modern Web3 dashboards with a premium light green theme. Drawing from fintech apps like Revolut and crypto platforms like Binance for trustworthy, polished aesthetics.

## Core Design Principles
- **Premium Light Green Theme**: Primary focus with sophisticated gradients
- **Glassmorphic + Neumorphic Elements**: Modern, elevated UI components
- **Mobile-First Responsive**: Optimized for mobile with seamless desktop scaling
- **Trust & Credibility**: Professional, startup-ready appearance

---

## Color Strategy
**Primary Light Green Palette**:
- Base: Light mint green (#DCFCE7, #BBF7D0, #86EFAC)
- Accent: Deeper emerald tones (#34D399, #10B981, #059669)
- Premium touches: Gold accents (#FBBF24, #F59E0B) for rewards/highlights
- Neutrals: Soft grays and whites for backgrounds (#F9FAFB, #F3F4F6, #FFFFFF)

**Gradient Applications**:
- Hero sections: Flowing green-to-emerald gradients
- Cards: Subtle light green to white gradients
- Mining button: Vibrant green gradient with gold shimmer
- Active states: Deeper emerald with subtle glow

---

## Typography
**Font Families** (Google Fonts):
- Primary: Inter (weights: 400, 500, 600, 700) - clean, modern, readable
- Accent/Numbers: Poppins (weights: 600, 700) - for coin counters and headings

**Hierarchy**:
- H1 (App Title): 2.5rem (mobile) / 3.5rem (desktop), Poppins Bold
- H2 (Section Headers): 1.75rem / 2.25rem, Poppins SemiBold
- H3 (Card Titles): 1.25rem / 1.5rem, Inter SemiBold
- Body: 0.875rem / 1rem, Inter Regular
- Coin Counters: 2rem / 3rem, Poppins Bold with tabular-nums

---

## Layout System
**Spacing Primitives** (Tailwind):
- Primary units: 2, 4, 6, 8, 12, 16
- Section padding: py-12 (mobile), py-20 (desktop)
- Card padding: p-6 (mobile), p-8 (desktop)
- Component gaps: gap-4, gap-6, gap-8

**Grid System**:
- Mobile: Single column (grid-cols-1)
- Tablet: 2 columns where appropriate (md:grid-cols-2)
- Desktop: Max 3 columns for feature grids (lg:grid-cols-3)
- Container: max-w-7xl with mx-auto

---

## Component Library

### 1. Splash Screen
- Full-screen gradient background (light green to white)
- Centered logo with subtle floating animation
- Tagline beneath logo
- Smooth fade-in entrance (800ms)

### 2. Authentication Pages
- Centered card with glassmorphic effect (backdrop-blur-xl)
- Light green gradient border (1px)
- Input fields with soft green focus states
- Social login buttons with provider icons (Google, phone)
- Rounded corners (rounded-2xl)

### 3. Mining Dashboard (Primary Screen)
**Hero Mining Card**:
- Large glassmorphic card with subtle green gradient background
- Prominent "TAP TO MINE" button (circular, 160px diameter on mobile)
- Button: vibrant green-to-emerald gradient with gold shimmer ring
- Real-time coin counter above button (large, animated counting)
- Progress ring around button showing 6-hour cycle completion
- Mining status indicator: "Active Mining" with pulsing green dot

**Dashboard Stats Row**:
- Three stat cards in horizontal row (rounded-xl, light background)
- Mining Speed: "10 CASET/hour" with 1.8x multiplier badge
- Total Mined: Accumulated coins with trending up arrow
- Next Mining: Countdown timer to next 6-hour reset
- Each card with icon (from Heroicons) and gradient accent

**Boost Section**:
- Horizontal scrollable cards
- "Invite Friends" card with referral CTA
- "Share Progress" social media integration
- Each boost shows potential reward increase

### 4. Referral System
**My Team Page**:
- Network tree visualization with connecting lines
- User avatar circles with level indicators
- Direct referrals highlighted with green glow
- Stats: 500 coins to inviter / 900 coins to invited friend clearly displayed
- Unique referral code card with copy button (prominent)

**Leaderboard**:
- Tabbed interface: Global / Regional
- Top 10 users with ranking badges (gold, silver, bronze for top 3)
- User cards showing: rank, avatar, name, total coins
- Current user highlighted with green background
- Animated number transitions

### 5. Wallet
**Balance Overview Card**:
- Large total balance display with CASET logo
- Secondary text: "Available" vs "Pending"
- Withdraw button (grayed out with "Coming Soon" badge)

**Transaction History**:
- Chronological list with icons for transaction types
- Mining rewards: green circle with mining icon
- Referral bonuses: gold circle with team icon
- Each entry shows: amount, type, timestamp
- Infinite scroll pagination

### 6. Profile Section
- Avatar upload with light green border ring
- Editable fields: Username, Country (dropdown with flags)
- Referral code display with prominent copy button
- Account stats: Join date, total referrals, mining days
- Logout button (subtle, bottom of screen)

### 7. Navigation
**Bottom Navigation Bar** (Mobile):
- 5 tabs: Dashboard, Team, Wallet, Leaderboard, Profile
- Icons from Heroicons (outline default, solid when active)
- Active state: green icon with label, subtle upward shift
- Fixed position with light backdrop blur

**Desktop Sidebar**:
- Left sidebar (240px width)
- Logo at top
- Navigation items with icons and labels
- Active state: light green background, darker green text

### 8. Onboarding Tutorial
- Sequential popup overlays with spotlight effect
- Dark overlay with white glassmorphic tutorial cards
- "Next" button in green gradient
- Progress dots indicator
- Skip option in top-right

---

## Visual Effects

### Glassmorphism
- Cards: `backdrop-blur-xl bg-white/80 border border-green-200/50`
- Overlays: `backdrop-blur-md bg-white/60`

### Animations (Framer Motion - Minimal)
- Mining button: Subtle pulse on active mining (scale 1 to 1.05, 2s loop)
- Coin counter: Number counting animation on updates
- Page transitions: Slide fade (300ms)
- Success states: Confetti particle burst (referral success, mining complete)

### Particle Effects
- Mining dashboard background: Floating subtle green particles
- Success celebrations: Brief gold particle burst
- Implementation: Canvas-based or CSS with opacity animations

### Shadows & Depth
- Cards: `shadow-lg shadow-green-100/50`
- Buttons: `shadow-md hover:shadow-xl shadow-green-200`
- Mining button: `shadow-2xl shadow-emerald-300/50` with glow

---

## Responsive Breakpoints
- Mobile: 320px - 767px (base styles)
- Tablet: 768px - 1023px (md:)
- Desktop: 1024px+ (lg:, xl:)

**Mobile-First Adaptations**:
- Stack all components vertically
- Full-width cards with horizontal padding
- Bottom navigation fixed
- Larger touch targets (min 44px)
- Simplified animations for performance

**Desktop Enhancements**:
- Sidebar navigation
- Multi-column layouts where appropriate
- Larger mining button (200px diameter)
- Hover states with subtle lift
- More detailed stats and visualizations

---

## Images & Icons

**Icons**: Heroicons (via CDN) for all UI elements
- Mining: lightning bolt
- Wallet: wallet icon
- Team: users icon
- Leaderboard: trophy icon
- Profile: user circle icon

**Logo**: Custom PingCaset logo (placeholder: green hexagon with "PC" typography)

**Illustrations**: Use for empty states
- No transactions: Simple green-tinted illustration
- No referrals: Team building illustration
- Onboarding: Mining concept illustrations

**No large hero image needed** - focus on dashboard-style interface with functional components and data visualization.

---

## Accessibility
- ARIA labels on all interactive elements
- Keyboard navigation support
- Focus states with green ring indicators
- High contrast text (WCAG AA minimum)
- Reduced motion option for animations