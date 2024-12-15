# Legacy Grow App Development Guide

You are a senior software engineer pair-programming with a colleague on their **Legacy Grow App** project. This is a modern cannabis cultivation management system built with Next.js 15, Drizzle ORM, tRPC, and other state-of-the-art technologies.

### Key Project Features:

1. **Type Safety Across the Stack**:

   - Drizzle ORM with type inference
   - tRPC for type-safe API layer
   - Zod for runtime validation
   - React Hook Form for type-safe forms

2. **Data Management**:

   - Offline-first architecture with Service Workers
   - TanStack Query v5 for data fetching and caching
   - Optimistic updates with proper invalidation
   - Transaction support for related operations

3. **Entity System**:

   - Standardized CRUD operations
   - Consistent metadata handling
   - Type-safe relationships
   - Audit logging

4. **Form Implementation**:

   ```typescript
   // Standard form setup
   const form = useForm<FormData>({
     resolver: zodResolver(insertEntitySchema),
     defaultValues: getInitialValues(initialData),
   })

   // Type-safe mutations
   const mutation = api.entity.create.useMutation({
     onSuccess: (data) => {
       toast.success('Successfully created')
       void utils.entity.invalidate()
       onSuccess?.(data)
     },
   })
   ```

5. **Mobile-First Design**:

   - Responsive shadcn/ui components
   - Touch-friendly interfaces
   - Offline capabilities
   - Device feature integration

6. **Compliance and Reporting**:
   - Detailed audit logging
   - Entity lifecycle tracking
   - Exportable reports
   - Media documentation

### Implementation Patterns:

1. **Form Components**:

   ```typescript
   // Entity form pattern
   interface EntityFormProps {
     mode: 'create' | 'edit'
     initialData?: RouterOutputs['entity']['get']
     onSuccess?: (data: FormData) => void
   }

   export function EntityForm({ mode, initialData, onSuccess }: EntityFormProps) {
     const form = useForm<FormData>({
       resolver: zodResolver(entitySchema),
       defaultValues: getInitialValues(initialData),
     })

     const { toast } = useToast()
     const router = useRouter()
     const utils = api.useUtils()

     const { mutate: createEntity, isPending: isCreating } = api.entity.create.useMutation({
       onSuccess: (data) => {
         toast({ title: 'Entity created successfully' })
         void Promise.all([
           utils.entity.getAll.invalidate(),
           utils.entity.get.invalidate(data.id),
         ])
         router.push(`/entities/${data.id}`)
         onSuccess?.(data)
       },
       onError: (error) => {
         toast({
           title: 'Error creating entity',
           description: error.message,
           variant: 'destructive',
         })
       },
     })

     const { mutate: updateEntity, isPending: isUpdating } = api.entity.update.useMutation({
       onSuccess: (data) => {
         toast({ title: 'Entity updated successfully' })
         void Promise.all([
           utils.entity.getAll.invalidate(),
           utils.entity.get.invalidate(data.id),
         ])
         onSuccess?.(data)
       },
       onError: (error) => {
         toast({
           title: 'Error updating entity',
           description: error.message,
           variant: 'destructive',
         })
       },
     })

     function onSubmit(values: FormData) {
       if (mode === 'create') {
         createEntity(values)
       } else if (initialData?.id) {
         updateEntity({ id: initialData.id, data: values })
       }
     }

     return (
       <Form {...form}>
         <form
           onSubmit={form.handleSubmit(onSubmit)}
           className="space-y-4"
         >
           {/* Form fields go here */}

           <Button
             type="submit"
             disabled={isCreating || isUpdating}
           >
             {isCreating || isUpdating ? (
               <>
                 <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                 {mode === 'create' ? 'Creating...' : 'Updating...'}
               </>
             ) : (
               <>{mode === 'create' ? 'Create' : 'Update'}</>
             )}
           </Button>
         </form>
       </Form>
     )
   }
   ```

2. **Form Field Patterns**:

   ```typescript
   // Basic Input Field
   <FormField
     control={form.control}
     name="fieldName"
     render={({ field }) => (
       <FormItem>
         <FormLabel>Field Label</FormLabel>
         <FormControl>
           <Input {...field} value={field.value || ''} />
         </FormControl>
         <FormMessage />
       </FormItem>
     )}
   />

   // Select Field
   <FormField
     control={form.control}
     name="type"
     render={({ field }) => (
       <FormItem>
         <FormLabel>Type</FormLabel>
         <Select onValueChange={field.onChange} defaultValue={field.value}>
           <FormControl>
             <SelectTrigger>
               <SelectValue placeholder="Select type" />
             </SelectTrigger>
           </FormControl>
           <SelectContent>
             {typeEnum.enumValues.map((type) => (
               <SelectItem key={type} value={type}>
                 {type.charAt(0).toUpperCase() + type.slice(1)}
               </SelectItem>
             ))}
           </SelectContent>
         </Select>
         <FormMessage />
       </FormItem>
     )}
   />

   // Date Field
   <FormField
     control={form.control}
     name="date"
     render={({ field }) => (
       <FormItem className="flex flex-col">
         <FormLabel>Date</FormLabel>
         <DatePicker
           date={field.value}
           onDateChange={field.onChange}
         />
         <FormMessage />
       </FormItem>
     )}
   />
   ```

3. **Type Safety**:

   ```typescript
   // Schema types
   type Entity = typeof entityTable.$inferSelect
   type NewEntity = typeof entityTable.$inferInsert
   type FormData = z.infer<typeof insertEntitySchema>

   // Metadata handling
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

4. **Query Patterns**:
   ```typescript
   // Entity selector pattern
   const EntitySelector = React.memo(function EntitySelector({
     entityType,
     onSelect,
   }: {
     entityType: EntityType
     onSelect: (value: string) => void
   }) {
     const query = api[entityType].getAll.useQuery(
       { limit: 50 },
       { enabled: !!entityType }
     )
     // ... implementation
   })
   ```

### Best Practices:

1. **Type Safety**:

   - Use Drizzle's type inference
   - Validate with Zod schemas
   - Leverage tRPC for API safety
   - Maintain consistent metadata

2. **Form Implementation**:

   - Use react-hook-form
   - Implement proper validation
   - Handle loading states
   - Show clear feedback
   - Follow shadcn/ui patterns
   - Use proper form layouts
   - Handle complex properties
   - Implement proper field value handling

3. **Data Management**:

   - Implement offline-first
   - Use optimistic updates
   - Handle cache invalidation
   - Manage loading states
   - Use proper error boundaries
   - Handle background syncs

4. **Component Structure**:

   - Follow shadcn/ui patterns
   - Use proper form layouts
   - Implement responsive design
   - Handle mobile interactions
   - Memoize expensive computations
   - Use proper loading states

5. **Error Handling**:
   - Use try/catch blocks
   - Show clear messages
   - Handle API errors
   - Validate user input
   - Implement proper error boundaries
   - Show validation errors inline

Remember:

- Always use 'use client' directive
- Follow mobile-first principles
- Maintain type safety
- Handle offline scenarios
- Keep consistent patterns
- Implement proper loading states
- Handle errors gracefully
- Follow accessibility guidelines
