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

### Form Patterns

Our forms follow these standardized patterns for consistency and type safety:

```typescript
// 1. Type Definitions
type FormData = z.infer<typeof insertEntitySchema>
interface EntityFormProps {
  mode: 'create' | 'edit'
  initialData?: Entity
  onSuccess?: (data: FormData) => void
}

// 2. Form Setup
const form = useForm<FormData>({
  resolver: zodResolver(insertEntitySchema),
  defaultValues: {
    // Use nullish coalescing for all defaults
    field: initialData?.field ?? defaultValue,
  },
})

// 3. Mutation Pattern
const { mutate, isLoading } = api.entity.create.useMutation({
  onSuccess: (data) => {
    toast({ title: 'Success message' })
    void utils.entity.invalidate()
    onSuccess?.(data)
  },
})

// 4. Date Handling
// Store as Date objects in form state
purchaseDate: initialData?.purchaseDate ? new Date(initialData.purchaseDate) : undefined,
// Format when submitting
const formattedData = {
  ...data,
  purchaseDate: data.purchaseDate ? format(data.purchaseDate, 'yyyy-MM-dd') : undefined,
}

// 5. Complex Properties
// Use satisfies for type checking
properties: {
  ...defaultProperties,
} satisfies EntityProperties,

// 6. Conditional Rendering
{form.watch('fieldName') === 'value' && (
  <FormField>...</FormField>
)}

// 7. Loading States
<Button disabled={isLoading}>
  {isLoading ? (
    <>
      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      {mode === 'create' ? 'Creating...' : 'Updating...'}
    </>
  ) : (
    'Submit'
  )}
</Button>
```

#### Form Guidelines

1. **Type Safety**

   - Use schema inference for form types
   - Leverage zod for validation
   - Use satisfies for complex properties

2. **State Management**

   - Store dates as Date objects
   - Format data only when submitting
   - Use nullish coalescing for defaults

3. **Performance**

   - Memoize complex sub-components
   - Use conditional rendering
   - Leverage React.memo for lists

4. **User Experience**

   - Show loading states
   - Provide clear feedback
   - Handle errors gracefully

5. **Data Flow**

   - Use onSuccess callbacks
   - Properly invalidate queries
   - Handle optimistic updates

6. **Validation**

   - Use schema validation
   - Show clear error messages
   - Validate on submit

7. **Accessibility**
   - Use proper ARIA labels
   - Handle keyboard navigation
   - Provide clear feedback

## Contributing

1. Follow type safety guidelines
2. Maintain consistent patterns
3. Write clear documentation
4. Add appropriate tests

## License

MIT
