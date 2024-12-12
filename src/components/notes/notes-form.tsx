'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { insertNoteSchema, NoteWithRelations } from '~/server/db/schema'
import { Button } from '~/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '~/components/ui/form'
import { Input } from '~/components/ui/input'
import { Textarea } from '~/components/ui/textarea'
import { api } from '~/trpc/react'
import { useToast } from '~/hooks/use-toast'
import { useRouter } from 'next/navigation'
import { AppRouter } from '../../server/api/root'
import { inferRouterOutputs } from '@trpc/server'
import { z } from 'zod'
import { TRPCClientErrorLike } from '@trpc/client'
import { Loader2 } from 'lucide-react'

type RouterOutputs = inferRouterOutputs<AppRouter>
type NoteFormValues = z.infer<typeof insertNoteSchema>

interface NoteFormProps {
  mode: 'create' | 'edit'
  initialData?: NoteWithRelations
}

export function NoteForm({ mode, initialData }: NoteFormProps) {
  const utils = api.useUtils()
  const { toast } = useToast()
  const router = useRouter()

  const form = useForm<NoteFormValues>({
    resolver: zodResolver(insertNoteSchema),
    initialData: {
      title: initialData?.title ?? '',
      content: initialData?.content ?? '',
      createdById: initialData?.createdById ?? undefined,
    },
  })

  const { mutate: createNote, isPending: isCreating } =
    api.note.create.useMutation({
      onSuccess: async () => {
        toast({
          title: 'Note created successfully',
        })
        await utils.note.invalidate()
      },
      onError: (error: TRPCClientErrorLike<AppRouter>) => {
        toast({
          title: 'Error creating note',
          description: error.message,
          variant: 'destructive',
        })
      },
    })

  const { mutate: updateNote, isPending: isUpdating } =
    api.note.update.useMutation({
      onSuccess: async () => {
        toast({
          title: 'Note updated successfully',
        })
        await utils.note.invalidate()
      },
      onError: (error: TRPCClientErrorLike<AppRouter>) => {
        toast({
          title: 'Error updating note',
          description: error.message,
          variant: 'destructive',
        })
      },
    })

  const onSubmit = async (data: NoteFormValues) => {
    try {
      const formData = {
        ...data,
        entityId: data.entityType === 'none' ? null : data.entityId,
      }

      if (mode === 'create') {
        createNote(formData)
      } else if (initialData?.id) {
        updateNote({ id: initialData.id, data: formData })
      }
    } catch (error) {
      toast({
        title: 'Error submitting form',
        description: error as string,
        variant: 'destructive',
      })
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-4 p-1"
        noValidate
      >
        <div className="space-y-4">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Title</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="content"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Content</FormLabel>
                <FormControl>
                  <Textarea {...field} value={field.value ?? ''} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button
            type="submit"
            disabled={isCreating || isUpdating}
            className="w-full"
          >
            {isCreating || isUpdating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {mode === 'create' ? 'Creating...' : 'Updating...'}
              </>
            ) : mode === 'create' ? (
              'Create Job'
            ) : (
              'Update Job'
            )}
          </Button>
        </div>
      </form>
    </Form>
  )
}
