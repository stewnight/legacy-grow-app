# Legacy Grow App

A modern cannabis cultivation management system built with Next.js 15, focusing on type-safe operations, compliance tracking, and mobile-first usability.

## Tech Stack

- **Next.js 15** with App Router for modern server-side rendering
- **NextAuth.js 5** for Discord-based authentication
- **Drizzle ORM** with PostgreSQL for type-safe database interactions
  - Strong type inference with `$inferInsert` and `$inferSelect`
  - Standardized metadata handling
  - Consistent audit fields
- **tRPC** for type-safe APIs and simplified backend/frontend communication
  - Protected procedures with session handling
  - Standardized error handling
  - Type-safe mutations
- **Tanstack React Query** for efficient data fetching and optimistic updates
  - Automatic cache invalidation
  - Optimistic updates for better UX
- **Shadcn UI components** with **Tailwind CSS** for responsive design

## Current State

### Completed Features

- [x] User authentication with Discord
- [x] Enhanced type safety across the stack
  - Drizzle ORM type inference
  - tRPC procedure validation
  - Zod schema validation
- [x] Core entity management
  - Facilities and Areas
  - Plants and Batches
  - Notes with metadata
  - Jobs and Tasks
- [x] Enhanced note system
  - Rich metadata support
  - Entity relationships
  - File attachments
  - Creator tracking

### In Progress

- [ ] Type Safety Enhancements
  - Standardized metadata interfaces
  - Consistent type assertions
  - Enhanced error handling
- [ ] Data Management
  - Transaction support
  - Batch operations
  - History tracking
- [ ] UI/UX Improvements
  - Mobile responsiveness
  - Offline capabilities
  - Performance optimization

## Quick Start

### Prerequisites

- Node.js 18+
- PostgreSQL 14+
- pnpm package manager

### Getting Started

```bash
# Install dependencies
pnpm install

# Set up environment
cp .env.example .env

# Push database schema
pnpm db:push

# Start development
pnpm dev
```

## Documentation

- [Architecture & Patterns](./docs/ARCHITECTURE.md)
- [Contributing Guidelines](./docs/CONTRIBUTING.md)
- [Development Roadmap](./docs/ROADMAP.md)

## License

MIT
