# Legacy Grow App

A modern cultivation management system built with the T3 Stack, focusing on cannabis plant tracking and cultivation logging.

## Tech Stack

- [Next.js 15](https://nextjs.org)
- [NextAuth.js 5](https://next-auth.js.org)
- [Drizzle ORM](https://orm.drizzle.team)
- [Tanstack React Query](https://tanstack.com/query)
- [tRPC](https://trpc.io)
- [Shadcn/ui](https://ui.shadcn.com)
- [Tailwind CSS](https://tailwindcss.com)

## Core Features

The app provides comprehensive tracking and management for cannabis cultivation:

- Plant lifecycle tracking from seed/clone to harvest
- Genetic strain management and lineage tracking
- Location and environment monitoring
- Task management and scheduling
- Compliance logging and reporting
- Input and supply chain management

## MVP Roadmap

### Phase 1: Basic Plant Logging

- [ ] Plant creation and basic details entry
- [ ] Growth stage tracking (seedling, vegetative, flowering)
- [ ] Daily/weekly logging functionality
- [ ] Basic location tracking
- [ ] Mobile-friendly image upload
- [ ] Simple task creation and completion

### Phase 2: Enhanced Tracking

- [ ] Genetic strain database
- [ ] Environmental data logging
- [ ] Nutrient schedules
- [ ] Growth metrics tracking
- [ ] Basic reporting
- [ ] Offline functionality

### Phase 3: Advanced Features

- [ ] Harvest tracking
- [ ] Processing workflows
- [ ] Compliance reporting
- [ ] Advanced analytics
- [ ] Multi-facility support
- [ ] Batch operations

## Development

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
