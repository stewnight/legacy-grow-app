# Legacy Grow App

A modern cannabis cultivation management system built with Next.js 15, focusing on essential growing operations, compliance tracking, and mobile-first usability.

## Tech Stack

- **Next.js 15** with App Router for modern server-side rendering
- **NextAuth.js 5** for Discord-based authentication
- **Drizzle ORM** with PostgreSQL for type-safe database interactions
- **tRPC** for type-safe APIs and simplified backend/frontend communication
- **Tanstack React Query** for efficient data fetching and optimistic updates
- **Shadcn UI components** with **Tailwind CSS** for responsive design and styling

## Current State

### Completed Features

- [x] User authentication with Discord
- [x] Initial schema design and integration using Drizzle ORM
- [o] Basic CRUD scaffolding for:
  - [x] Facilities
  - [x] Areas
  - [x] Locations
  - [x] Genetic strains
  - [x] Batches
  - [x] Plants
  - [x] Tasks
  - [x] Notes
  - [x] Sensors
  - [x] Processing
  - [x] Harvests
- [x] Mobile-first responsive layout
- [x] Reusable UI components (forms, tables, and navigation)

### In Progress Features

- [x] Schema consistency and standardization (pending metadata alignment, field naming, cascading relationships, etc.)
- [x] Router integration for CRUD operations with tRPC
- [x] Complete CRUD operations for:
  - Plant updates and deletions
  - Genetic strain updates and deletions
  - Batch updates and deletions
- [ ] Enhanced note system:
  - Media upload support
  - Better timeline visualization
- [ ] Offline-first capabilities:
  - React Query caching
  - Service Worker integration
  - PWA configuration

### MVP Roadmap

#### Phase 1: Core Functionality Completion

- [ ] Finalize schemas with consistent relationships and field structures
- [ ] Align all routers with finalized schemas
- [ ] Create mobile-friendly forms for CRUD operations
- [ ] Set up offline functionality (React Query + Service Worker)

#### Phase 2: Enhanced Operations

- [ ] Develop Plant Dashboard:
  - Active plant overview
  - Growth stage tracking
  - Health status monitoring
- [ ] Implement Batch Management:
  - Batch creation and grouping
  - Batch timeline visualization
- [ ] Add Daily Operations Tracking:
  - Task scheduling
  - Growth stage transitions
  - Environmental logging

#### Phase 3: Compliance and Reporting

- [ ] Automated compliance logging
- [ ] Comprehensive plant and batch history tracking
- [ ] Export and reporting tools
- [ ] Image and media-based documentation

## Development

### Prerequisites

- Node.js 18+
- PostgreSQL database
- Cloudflare R2 or compatible S3 storage

### Getting Started

```bash
# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env

# Push database schema
pnpm db:push

# Start the development server
pnpm dev
```
