# Architecture & Technical Patterns

## Type System

### Database to UI Flow

```typescript
// 1. Database Layer (Drizzle)
import { pgTable, text, timestamp } from 'drizzle-orm/pg-core'

export const entityTable = pgTable('entity', {
  id: text('id').primaryKey(),
  createdAt: timestamp('created_at').defaultNow(),
  // ... other fields
})

// Types from schema
type Entity = typeof entityTable.$inferSelect
type NewEntity = typeof entityTable.$inferInsert

// 2. API Layer (tRPC + Zod for validation)
import { z } from 'zod'
import { createTRPCRouter, protectedProcedure } from '~/server/api/trpc'

export const entityRouter = createTRPCRouter({
  create: protectedProcedure
    .input(
      z.object({
        // Validate input, but use Drizzle types as base
        data: z.custom<NewEntity>(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Type-safe database operations
      return await ctx.db.insert(entityTable).values(input.data)
    }),
})

// 3. Form Layer (React Hook Form + Zod)
// We use Zod here primarily for runtime validation
const formSchema = z.custom<NewEntity>().pipe(
  z.object({
    // Additional client-side validations
  })
)

type FormData = z.infer<typeof formSchema>
```

### Type Safety Principles

1. **Database Schema**: Single source of truth via Drizzle
2. **API Layer**:
   - Use Drizzle types for data structure
   - Use Zod for runtime validation
3. **Client Layer**:
   - Inherit types from API layer
   - Add UI-specific validations with Zod

### Data Flow

1. Client Form → tRPC Procedure → Database
2. Database → tRPC Query → Client Cache → UI
3. Optimistic Updates → Cache → Background Sync

## Standard Patterns

### Entity References

```typescript
interface EntityReference {
  entityId: string
  entityType: string // 'plant' | 'batch' | 'task' | 'job'
  metadata?: Record<string, unknown>
}
```

### Metadata Structure

```typescript
interface BaseMetadata {
  device?: string
  location?: LocationMetadata
  weather?: WeatherMetadata
  references?: EntityReference[]
  timestamps: {
    createdAt: Date
    updatedAt: Date
    completedAt?: Date
  }
}
```

### Form Implementation

```typescript
// 1. Schema Definition
const formSchema = z.object({
  // ... schema definition
})
type FormData = z.infer<typeof formSchema>

// 2. Form Component
interface EntityFormProps {
  mode: 'create' | 'edit'
  initialData?: Entity
  onSuccess?: (data: FormData) => void
}

// 3. Form Implementation
const EntityForm = ({ mode, initialData, onSuccess }: EntityFormProps) => {
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: getInitialValues(initialData),
  })

  const mutation = api.entity.create.useMutation({
    onSuccess: (data) => {
      toast.success('Successfully created')
      onSuccess?.(data)
    },
    onError: (error) => {
      toast.error(error.message)
    }
  })

  const onSubmit = form.handleSubmit(async (data) => {
    await mutation.mutateAsync(data)
  })

  return (
    <Form {...form}>
      <form onSubmit={onSubmit}>
        {/* Form fields */}
      </form>
    </Form>
  )
}
```

## State Management

### Query Patterns (TanStack Query v5)

```typescript
// Query Client Configuration
{
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,     // 5 minutes
      gcTime: 60 * 60 * 1000,       // 1 hour
      networkMode: 'offlineFirst',
      retry: {
        maxAttempts: 3,
        excludeCodes: ['NOT_FOUND', 'UNAUTHORIZED', 'FORBIDDEN']
      }
    },
    mutations: {
      networkMode: 'offlineFirst',
      retry: false
    }
  }
}

// Basic Query with Options
const query = api.entity.list.useQuery({
  staleTime: 5 * 60 * 1000,
  gcTime: 60 * 60 * 1000,
  networkMode: 'offlineFirst'
})

// Dependent Query
const dependentQuery = api.entity.details.useQuery({
  enabled: !!query.data,
  networkMode: 'offlineFirst'
})

// Optimistic Updates
const mutation = api.entity.create.useMutation({
  onMutate: async (newData) => {
    await queryClient.cancelQueries(['entity', 'list'])
    const previousData = queryClient.getQueryData(['entity', 'list'])
    queryClient.setQueryData(['entity', 'list'], old => [...old, newData])
    return { previousData }
  },
  onError: (err, newData, context) => {
    queryClient.setQueryData(['entity', 'list'], context.previousData)
  }
})
```

### Offline Support

1. Service Worker Strategy

   - Cache-first for static assets
   - Network-first for API calls
   - Background sync for mutations

2. Local Storage
   - Query cache persistence
   - Form state backup
   - User preferences

## Mobile-First Design

### Touch Targets

- Minimum size: 44px × 44px
- Comfortable size: 48px × 48px
- Clear spacing between elements

### Responsive Patterns

```typescript
// 1. Breakpoint System
const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
}

// 2. Component Adaptation
const Component = () => {
  const isMobile = useMediaQuery('(max-width: 768px)')
  return isMobile ? <MobileView /> : <DesktopView />
}
```

## Error Handling

### API Layer

```typescript
try {
  const result = await mutation()
} catch (error) {
  if (error instanceof TRPCError) {
    handleTRPCError(error)
  } else {
    handleUnexpectedError(error)
  }
}
```

### UI Layer

```typescript
<ErrorBoundary
  fallback={<ErrorFallback />}
  onError={reportError}
>
  <Component />
</ErrorBoundary>
```

## Performance Optimization

### Query Optimization

1. Proper cache configuration
2. Selective revalidation
3. Optimistic updates
4. Background polling

### Component Optimization

1. Proper memo usage
2. Lazy loading
3. Virtual scrolling
4. Image optimization

## Security Patterns

### Authentication

1. Protected procedures
2. Session validation
3. CSRF protection
4. Rate limiting

### Data Access

1. Row-level security
2. Input sanitization
3. Output encoding
4. Audit logging

# Contributing Guidelines

## Development Setup

### Prerequisites

- Node.js 18+
- PostgreSQL 14+
- pnpm package manager

### Getting Started

1. Clone the repository
2. Run `pnpm install`
3. Run `pnpm dev`
