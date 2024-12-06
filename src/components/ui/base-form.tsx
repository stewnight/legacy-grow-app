'use client'

import * as React from 'react'
import {
  useForm,
  type UseFormProps,
  type FieldValues,
  type DefaultValues,
} from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { type z } from 'zod'
import { Form } from '~/components/ui/form'
import { Button } from '~/components/ui/button'
import { Loader2, Copy, Check } from 'lucide-react'
import { useToast } from '~/hooks/use-toast'
import { type TRPCClientErrorLike } from '@trpc/client'
import { type AppRouter } from '~/server/api/root'
import { api } from '~/trpc/react'
import { useRouter } from 'next/navigation'

export interface BaseFormProps<
  TFormSchema extends z.ZodType<any, any>,
  TEntity extends FieldValues,
> {
  // Form Mode
  mode: 'create' | 'edit'
  // Schema for form validation
  schema: TFormSchema
  // Initial form data
  initialData?: TEntity
  // Default values for the form
  defaultValues: DefaultValues<z.infer<TFormSchema>>
  // Children render prop for form fields
  children: (
    form: ReturnType<typeof useForm<z.infer<TFormSchema>>>
  ) => React.ReactNode
  // API mutation paths
  apiPath: {
    create: `${string}.create`
    update: `${string}.update`
    getAll: `${string}.getAll`
  }
  // Success callback
  onSuccess?: (data: TEntity) => void
  // Additional form configuration
  formConfig?: Omit<
    UseFormProps<z.infer<TFormSchema>>,
    'resolver' | 'defaultValues'
  >
  // Custom data transformation before submit
  transformData?: (data: z.infer<TFormSchema>) => z.infer<TFormSchema>
  // Redirect path after success
  redirectPath?: string
  // Button text
  buttonText?: {
    create?: string
    update?: string
    loading?: string
  }
}

export function BaseForm<
  TFormSchema extends z.ZodType<any, any>,
  TEntity extends FieldValues,
>({
  mode,
  schema,
  initialData,
  defaultValues,
  children,
  apiPath,
  onSuccess,
  formConfig,
  transformData,
  redirectPath,
  buttonText = {
    create: 'Create',
    update: 'Update',
    loading: mode === 'create' ? 'Creating...' : 'Updating...',
  },
}: BaseFormProps<TFormSchema, TEntity>) {
  const { toast } = useToast()
  const navigation = useRouter()
  const utils = api.useUtils()
  const [copied, setCopied] = React.useState(false)

  const copyToClipboard = React.useCallback(async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy text: ', err)
    }
  }, [])

  const showErrorToast = React.useCallback(
    (error: TRPCClientErrorLike<AppRouter>) => {
      toast({
        title: 'Error',
        description: (
          <div className="flex flex-col gap-2">
            <p>{error.message}</p>
            <Button
              variant="outline"
              size="sm"
              className="w-fit"
              onClick={() => copyToClipboard(error.message)}
            >
              {copied ? (
                <Check className="mr-2 h-4 w-4" />
              ) : (
                <Copy className="mr-2 h-4 w-4" />
              )}
              Copy error
            </Button>
          </div>
        ),
        variant: 'destructive',
      })
    },
    [toast, copyToClipboard, copied]
  )

  // Initialize form
  const form = useForm<z.infer<TFormSchema>>({
    resolver: zodResolver(schema),
    defaultValues,
    ...formConfig,
  })

  // Get the router path parts
  const [routerName] = apiPath.create.split('.')
  const trpcUtils = api[routerName as keyof typeof api]

  // Setup mutations
  const { mutate: createMutation, isPending: isCreating } = (
    api[routerName as keyof typeof api] as any
  ).create.useMutation({
    onSuccess: (data: TEntity) => {
      toast({ title: 'Created successfully' })
      void utils.invalidate()
      if (redirectPath) navigation.push(redirectPath)
      onSuccess?.(data)
    },
    onError: showErrorToast,
  })

  const { mutate: updateMutation, isPending: isUpdating } = (
    api[routerName as keyof typeof api] as any
  ).update.useMutation({
    onSuccess: (data: TEntity) => {
      toast({ title: 'Updated successfully' })
      void utils.invalidate()
      if (redirectPath) navigation.push(redirectPath)
      onSuccess?.(data)
    },
    onError: showErrorToast,
  })

  // Form submission handler
  async function onSubmit(data: z.infer<TFormSchema>) {
    try {
      const formattedData = transformData ? transformData(data) : data

      if (mode === 'create') {
        createMutation(formattedData)
      } else if (initialData?.id) {
        updateMutation({
          id: initialData.id,
          data: formattedData,
        })
      }
    } catch (error) {
      console.error('Form submission error:', error)
      showErrorToast(error as TRPCClientErrorLike<AppRouter>)
    }
  }

  const isPending = isCreating || isUpdating

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-8"
        noValidate
      >
        {children(form)}

        <Button type="submit" disabled={isPending} className="w-full">
          {isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {buttonText.loading}
            </>
          ) : mode === 'create' ? (
            buttonText.create
          ) : (
            buttonText.update
          )}
        </Button>
      </form>
    </Form>
  )
}
