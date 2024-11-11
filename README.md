# Legacy Grow App

A modern cannabis cultivation management system built with Next.js 15, focusing on essential growing operations and compliance tracking.

## Tech Stack

- Next.js 15 with App Router
- NextAuth.js 5 for authentication
- Drizzle ORM with PostgreSQL
- tRPC for type-safe APIs
- Tanstack React Query for data management
- Shadcn/ui components
- Tailwind CSS for styling

## Current Implementation Status

### Completed Features
- [x] User authentication with Discord
- [x] Plant creation and reading
- [x] Genetic strain creation and reading
- [x] Batch creation and reading
- [x] Basic text-based note system
- [x] Mobile-responsive layout foundation
- [x] Initial offline data persistence with React Query

### In Progress Features
- [ ] Plant updates and deletion
- [ ] Genetic strain updates and deletion
- [ ] Batch updates and deletion
- [ ] Media handling for notes (images, voice, files)
- [ ] Timeline UI/UX improvements
- [ ] Complete offline functionality (Service Worker + PWA)

## MVP Roadmap

### Phase 1: Core Functionality Completion
- [ ] Complete CRUD operations
  - Plant management
  - Genetic strains
  - Batches
- [ ] Enhanced note system
  - Improved UI/UX
  - Media upload support
  - Better timeline visualization
- [ ] Full offline support
  - Service Worker implementation
  - PWA configuration
  - Robust data synchronization

### Phase 2: Essential Growing Operations
- [ ] Plant Dashboard
  - Active plants overview
  - Growth stage tracking
  - Health status monitoring
- [ ] Batch Management
  - Batch creation wizard
  - Plant grouping and tracking
  - Batch timeline view
- [ ] Daily Operations
  - Task scheduling
  - Growth stage transitions
  - Basic environmental logging

### Phase 3: Compliance & Documentation
- [ ] Automated compliance logging
- [ ] Plant history tracking
- [ ] Export capabilities
- [ ] Image documentation
- [ ] Batch reporting

## Development

### Prerequisites
- Node.js 18+
- PostgreSQL database
- Cloudflare R2 or compatible S3 storage

### Getting Started

# Install dependencies

pnpm install

# Set up environment variables

cp [.env.example] .env

# Push database schema

pnpm db:push

# Start development server

pnpm dev

## Mobile-First Features

- Progressive Web App (PWA) support
- Offline-first architecture using React Query
- Touch-friendly UI components
- Quick-action buttons for common tasks
- Camera integration for plant photos
- Simple data entry forms

## Calculators & Tools

- Nutrient ratio calculator
- Growth phase timeline
- Environmental condition optimizer
- Yield estimator
- Harvest scheduling
- Drying room conditions

## Next steps

1. Implement basic CRUD operations for plants using the existing schema
2. Create mobile-friendly forms for daily logging
3. Set up image upload and storage
4. Implement offline functionality using React Query
5. Add basic reporting and visualization

## Contributing

Please read our contributing guidelines before submitting pull requests.

## License

[MIT License](LICENSE)
