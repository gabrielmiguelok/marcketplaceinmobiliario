# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Aloba** - Real estate marketplace platform for Guatemala. A Next.js 14 application for finding properties, with interactive quiz-based property matching, infinite carousel of projects, and Google OAuth authentication.

**URL**: https://marketplaceinmobiliario.com

## Commands

```bash
pnpm dev      # Start dev server on port 1212
pnpm build    # Production build
pnpm start    # Run production server on port 1212
pnpm lint     # Run Next.js linter

# Production deployment
pnpm build && pm2 restart marcketplaceinmobiliario

# View logs
pm2 logs marcketplaceinmobiliario
```

## Tech Stack

- **Next.js 14.2.16** with App Router
- **React 18** with TypeScript
- **Tailwind CSS 4** with OKLCH color model
- **Radix UI + Shadcn/ui** (New York style)
- **Embla Carousel** for infinite scroll carousels
- **MariaDB/MySQL** with **mysql2/promise** connection pool
- **Google OAuth2** for authentication

## Architecture

### Core Layers

```
API Routes → lib/auth.ts (session) → lib/db.ts (pool) → MariaDB
```

### Key Files

- `lib/db.ts` - Database connection pool with `query()` and `transaction()` helpers
- `lib/auth.ts` - Server-side auth: `getSession()`, `verifyAuth()`, `createSession()`
- `lib/auth-client.ts` - Client-side auth utilities

### Database Access Pattern

```typescript
import { query, transaction } from "@/lib/db"

// Simple query
const users = await query<User>("SELECT * FROM users WHERE role = ?", ["admin"])

// Transaction
const result = await transaction(async (conn) => {
  await conn.query("INSERT INTO properties ...", [...])
  await conn.query("INSERT INTO property_features ...", [...])
  return { success: true }
})
```

### Authentication Flow

1. User clicks login → `/login` → selects role
2. Redirects to Google OAuth → `/api/auth/google`
3. User created/updated with JWD token (64 bytes hex, NOT JWT)
4. Cookie `doutopAuth` set (httpOnly, 30 days)

### Roles

| Role | Access |
|------|--------|
| admin | `/admin/users` - Full user management |

## Design System

**Colors**: Real Estate Turquoise/Navy theme
- Primary: Turquoise `#00F0D0`
- Accent: Navy `#0B1B32`
- Secondary: Light Blue `#4AB7E6`

**Patterns**:
- Semantic: `bg-background`, `text-foreground`, `bg-card`, `border-border`
- Custom colors: `text-[#0B1B32]`, `bg-[#00F0D0]`
- Gradients: `.bg-real-estate-gradient`, `.bg-turquoise-gradient`

## Main Pages

### `/conocenos` (Landing)
Full landing page with modular section components:

```
app/conocenos/page.tsx
├── Header (with activePage prop for navigation highlighting)
├── Hero section (inline - search filters with dropdown menus)
├── ProjectsCarouselSection - Infinite auto-scroll carousel (Embla)
├── StatsBannerSection - Stats banner + developer logos
├── WhyAlobaSection - 3 feature cards with mobile expansion
├── DiscoverSection - Bento grid with expandable cards
├── TestimonialsSection - Auto-scroll testimonial carousel
└── Footer - CTA + links + social
```

### `/herramientas` (Tools)
- `HeroSection` - Tool selection with two buttons
- `ZoneQuizSection` - 6-question quiz for zone matching (intro → questions → results)
- `PrequalQuizSection` - 8-question quiz for credit pre-qualification (intro → questions → results)

### Quiz Flow Architecture
```
app/herramientas/page.tsx (state: FlowType = "none" | "zone" | "prequal")
├── HeroSection (flow === "none") → onSelectFlow callback
├── ZoneQuizSection (flow === "zone") → onBack callback
└── PrequalQuizSection (flow === "prequal") → onBack callback
```

Each quiz component manages its own step state (0 = intro, 1-N = questions, N+1 = results).

## Component Patterns

### Carousels (Embla)
Both `ProjectsCarouselSection` and `TestimonialsSection` use Embla Carousel with auto-scroll:

```typescript
import useEmblaCarousel from "embla-carousel-react"
import AutoScroll from "embla-carousel-auto-scroll"

const [emblaRef] = useEmblaCarousel({ loop: true }, [AutoScroll({ speed: 1 })])
```

### Mobile Expandable Cards
Components like `DiscoverSection` and `WhyAlobaSection` use a pattern for mobile-only card expansion:

```typescript
const [expandedCard, setExpandedCard] = useState<string | null>(null)

const handleCardClick = (cardId: string, e: React.MouseEvent) => {
  e.stopPropagation() // Prevent bubbling
  if (window.innerWidth < 768) {
    setExpandedCard(expandedCard === cardId ? null : cardId)
  }
}

// Close on outside click
const handleOutsideClick = () => {
  if (expandedCard) setExpandedCard(null)
}
```

Cards use `col-span-2` when expanded in a 2-column grid for full-width display.

### Local Utility: cn()
Many components define a local `cn` helper instead of importing from utils:

```typescript
const cn = (...classes: (string | undefined | null | false)[]) =>
  classes.filter(Boolean).join(" ")
```

## Environment Variables

```env
# Database
DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME

# Auth
AUTH_JWD_BYTES=64
COOKIE_DOMAIN=marketplaceinmobiliario.com
JWT_SECRET=***
GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET

# App
NEXT_PUBLIC_BASE_URL=https://marketplaceinmobiliario.com
NEXT_PUBLIC_GA_ID=G-***
```

## Development Notes

- **Port**: 1212
- **Cookie**: `doutopAuth` (httpOnly)
- **Google OAuth callback**: `/api/auth/google`
- **Navigation**: Uses `next/link` for client-side routing
