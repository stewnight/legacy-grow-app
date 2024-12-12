# Contributing Guidelines

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL 14+
- pnpm package manager

### Development Setup

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

## Project Structure

```
src/
├── app/                 # Next.js app router pages
├── components/          # React components
│   ├── ui/             # shadcn/ui components
│   └── <entity>/       # Entity-specific components
├── server/             # Backend code
│   ├── api/            # tRPC routers and procedures
│   └── db/             # Database schemas
├── lib/                # Core utilities and configurations
└── trpc/               # tRPC client setup
```

## Development Workflow

### 1. Creating New Features

1. Create a new branch from `main`
2. Follow the entity component pattern:
   ```
   components/<entity>/
   ├── <entity>-form.tsx      # Form implementation
   ├── <entity>-columns.tsx   # Data table columns
   └── <entity>-card.tsx      # Optional card view
   ```
3. Implement the feature
4. Add tests if required
5. Submit a PR

### 2. Working with Types

```typescript
// 1. Define database schema (src/server/db/schema/<entity>.ts)
import { pgTable, text, timestamp } from 'drizzle-orm/pg-core'

export const entityTable = pgTable('entity', {
  // ... schema definition
})

// 2. Create API endpoint (src/server/api/routers/<entity>.ts)
export const entityRouter = createTRPCRouter({
  // ... router definition
})

// 3. Implement form (src/components/<entity>/<entity>-form.tsx)
const EntityForm: React.FC<EntityFormProps> = () => {
  // ... form implementation
}
```

### 3. Best Practices

- Follow TypeScript strict mode
- Use tRPC for all API calls
- Implement proper error handling
- Add loading states
- Follow mobile-first approach
- Write clear commit messages

### 4. Code Style

- Use ESLint and Prettier
- Follow naming conventions:
  - Components: PascalCase
  - Files: kebab-case
  - Functions: camelCase
- Add JSDoc comments for complex logic

### 5. Testing

Before submitting PR:

1. Run `pnpm typecheck`
2. Run `pnpm lint`
3. Run `pnpm format:check`
4. Test your changes thoroughly

## Need Help?

- Check ARCHITECTURE.md for technical details
- Review existing components for patterns
- Ask in the team chat
- Create a draft PR for feedback
