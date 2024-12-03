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

## Development Roadmap

### Phase 1: Type Safety and Consistency (Current)

- [ ] Standardize type patterns
  - Metadata interfaces
  - Entity references
  - Audit fields
- [ ] Enhance error handling
  - Structured error types
  - Error recovery
  - Validation feedback
- [ ] Improve data validation
  - Input schemas
  - Runtime checks
  - Type assertions

### Phase 2: Data Management

- [ ] Transaction support
  - Multi-entity operations
  - Rollback handling
  - Conflict resolution
- [ ] Batch operations
  - Bulk updates
  - Mass assignments
  - Group actions
- [ ] History tracking
  - Change logs
  - Audit trails
  - Version control

### Phase 3: Mobile and Offline

- [ ] Offline capabilities
  - Service workers
  - Local storage
  - Sync management
- [ ] Mobile optimization
  - Touch interfaces
  - Responsive layouts
  - Native features

## Development

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

### Type Safety Guidelines

Follow these patterns for type-safe development:

```typescript
// Schema types
type TableType = typeof tableSchema;
type TableInsert = typeof tableSchema.$inferInsert;
type TableSelect = typeof tableSchema.$inferSelect;

// Mutations
.insert(data as typeof table.$inferInsert)
.update().set(data as typeof table.$inferInsert)

// Validation
const inputSchema = z.object({
  data: tableSchema.$inferInsert.omit(['id', 'createdAt'])
});
```

## Contributing

1. Follow type safety guidelines
2. Maintain consistent patterns
3. Write clear documentation
4. Add appropriate tests

## License

MIT
