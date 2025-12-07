# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Aloba** - Real estate marketplace platform for Guatemala. A Next.js 14 application for finding properties, with dynamic search filters, property detail pages, interactive quiz-based property matching, and Google OAuth authentication.

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

# Database queries (via socket, no password needed)
sudo mysql -u root -e "SELECT * FROM aloba_db.inmuebles LIMIT 5"
```

## Tech Stack

- **Next.js 14.2.16** with App Router
- **React 18** with TypeScript
- **Tailwind CSS 4** with OKLCH color model
- **Radix UI + Shadcn/ui** (New York style)
- **Embla Carousel** for infinite scroll carousels
- **TanStack Table + MUI** for admin tables (CustomTable component)
- **Sharp** for image processing (WebP conversion, thumbnails)
- **MariaDB/MySQL** with **mysql2/promise** connection pool
- **Google OAuth2** for authentication
- **react-hot-toast** for notifications
- **OpenAI GPT-4o-mini** for AI chat with function calling
- **react-leaflet 4.2.1** + **Leaflet** for interactive maps
- **@turf/boolean-point-in-polygon** for polygon-based filtering

## Architecture

### Core Layers

```
API Routes → lib/auth.ts (session) → lib/db.ts (pool) → MariaDB
                                  → lib/services/inmuebles-service.ts (cached queries)
```

### Key Files

- `lib/db.ts` - Database connection pool with `query()` and `transaction()` helpers
- `lib/auth.ts` - Server-side auth: `getSession()`, `verifyAuth()`, `createSession()`
- `lib/services/inmuebles-service.ts` - Cached property queries with React `cache()`
- `components/CustomTable/` - Reusable admin table with inline editing, image upload, filters
- `components/HeroSearchBanner.tsx` - Dynamic search component with filters from DB
- `components/InmueblesGrid.tsx` - Property listing with filtering, pagination, share/like buttons

### Database Access Pattern

```typescript
import { query, transaction } from "@/lib/db"

// Simple query
const users = await query<User>("SELECT * FROM users WHERE role = ?", ["admin"])

// Using inmuebles service (cached)
import { getInmuebles, getInmuebleById } from "@/lib/services/inmuebles-service"
const properties = await getInmuebles()
const property = await getInmuebleById(123)
```

## Search System

### APIs

| Endpoint | Purpose |
|----------|---------|
| `GET /api/search-filters` | Returns dynamic filters (zonas, tipos, habitaciones, rangos de precio) from DB |
| `GET /api/inmuebles/search` | Search with combined filters: `?zona=10&habitaciones=3&precio_min=150000&precio_max=300000` |

### HeroSearchBanner Component

Located in `components/HeroSearchBanner.tsx`. Features:
- Loads filters dynamically from `/api/search-filters`
- Grid display with 2 rows x 4 columns (8 items per page)
- Carousel pagination with arrows and dots
- Clicking a result navigates to `/inmuebles/{id}`

### InmueblesGrid Component

Located in `components/InmueblesGrid.tsx`. Accepts `initialFilters` prop from URL query params:
```typescript
<InmueblesGrid
  inmuebles={data}
  initialFilters={{
    zona: "10",
    habitaciones: "3",
    precioMin: "150000",
    precioMax: "300000"
  }}
/>
```

## Image System

### Dynamic Image Serving (Without Rebuild)

All images are served through `/api/imagen` proxy to work without rebuild:

```typescript
// Helper function used across components
function getImageSrc(url: string | null): string | null {
  if (!url) return null
  if (url.startsWith('/inmuebles/') || url.startsWith('/uploads/')) {
    return `/api/imagen${url}`
  }
  return url
}
```

### Storage Structure

```
public/
├── inmuebles/           # Property images (gitignored, runtime uploads)
│   ├── inmueble-{id}-{timestamp}.webp
│   └── thumb-inmueble-{id}-{timestamp}.webp
└── images/              # Static images (committed to git)
```

## AI Chat System

### Architecture

```
User Message → extractSearchFilters (GPT function calling)
            → searchInmuebles (flexible SQL with scoring)
            → filterRelevantInmuebles (ranking)
            → GPT response with context
            → InmuebleCarouselChat (display results)
```

### Key Files

- `app/api/chat-business-info/route.ts` - AI API with OpenAI integration
- `components/chat/SupportChatWidget.tsx` - Floating chat widget
- `components/chat/InmuebleCarouselChat.tsx` - Property carousel for chat results
- `hooks/useChatManager.ts` - Chat state management
- `lib/chat-flow.ts` - Predefined conversation flows

### Search Intelligence

The chat uses OpenAI function calling to extract search filters:
```typescript
// User: "casa en zona 10 hasta 150k"
// AI extracts: { tipo: "casa", zona: "10", precioMax: 150000 }
```

Key behaviors:
- **Casa/Apartamento intercambiables**: Si pide casa, también muestra apartamentos
- **Precio flexible**: +20% margen sobre el máximo solicitado
- **Scoring**: Resultados ordenados por relevancia (zona, tipo, habitaciones, precio)
- **Solo filtros explícitos**: No asume tipo si el usuario no lo menciona

### Widget Integration

```typescript
import { SupportChatWidget } from "@/components/chat/SupportChatWidget"

// Add to any page
<SupportChatWidget />
```

Present in: `/`, `/conocenos`, `/inmuebles`

## Main Pages

### `/conocenos` (Landing)
```
app/conocenos/page.tsx
├── Header
├── Hero section with HeroSearchBanner (dynamic filters + results preview)
├── ProjectsCarouselSection
├── StatsBannerSection
├── WhyAlobaSection
├── DiscoverSection
├── TestimonialsSection
└── Footer
```

### `/inmuebles` (Property Listing)
- Server Component that passes query params to InmueblesGrid
- Supports URL filters: `?zona=10&habitaciones=3&precio_min=150000`

### `/inmuebles/[id]` (Property Detail)
- Dynamic page with full property information
- SEO optimized with OpenGraph/Twitter Cards using property image
- Share button copies link to clipboard
- Contact buttons (WhatsApp, email, schedule visit)

### `/herramientas` (Tools)
- `ZoneQuizSection` - 6-question quiz for zone matching
- `PrequalQuizSection` - 8-question quiz for credit pre-qualification

### `/inmuebles/mapa` (Map View)
- Split layout: 520px property grid (left), interactive map (right)
- Grid of 2x3 with pagination (6 items per page)
- Polygon drawing to filter properties by geographic area
- Mobile toggle between map and list views
- Key files:
  - `components/map/PropertyMapAloba.tsx` - Leaflet map with polygon selection
  - `components/map/InmuebleCardMap.tsx` - Compact property card for grid

### `/admin/inmuebles` (Admin Panel)
- CustomTable-based CRUD with inline editing
- Image upload with preview modal

## Design System

**Colors**:
- Primary: Turquoise `#00F0D0`
- Accent: Navy `#0B1B32`

**Patterns**:
```typescript
// Buttons
className="bg-[#00F0D0] hover:bg-[#00dbbe] text-[#0B1B32]"

// Cards
className="bg-white rounded-3xl shadow-lg border border-gray-100"

// Dark background
className="bg-[#0B1B32] text-white"
```

## API Response Format

```typescript
// Success
{ success: true, data: {...} }
{ success: true, inmuebles: [...], total: 20 }
{ success: true, filters: { zonas: [...], tipos: [...] } }

// Error
{ success: false, error: "Error message" }
```

## Environment Variables

```env
DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME
AUTH_JWD_BYTES=64
COOKIE_DOMAIN=marketplaceinmobiliario.com
GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET
NEXT_PUBLIC_BASE_URL=https://marketplaceinmobiliario.com
OPENAI_API_KEY=sk-...
```

## Development Notes

- **Port**: 1212
- **Cookie**: `doutopAuth` (httpOnly)
- **Toast notifications**: Use `react-hot-toast` (never `alert()`)
- **Cache invalidation**: Use `revalidatePath()` after mutations
- **SEO**: Property pages have dynamic metadata with OpenGraph images
- **Map coords**: Properties need `latitud` and `longitud` fields for map display
