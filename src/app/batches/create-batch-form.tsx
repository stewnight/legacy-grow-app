'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { Textarea } from '~/components/ui/textarea'
import { api } from '~/trpc/react'
import { useRouter } from 'next/navigation'

const batchSchema = z.object({
  name: z.string().min(1),
  strain: z.string().min(1),
  plantCount: z.number().min(1),
  notes: z.string().optional(),
})

export function CreateBatchForm() {
  const router = useRouter()
  type BatchInput = z.infer<typeof batchSchema>
  const { register, handleSubmit, reset } = useForm<BatchInput>({
    resolver: zodResolver(batchSchema),
  })

  const createBatch = api.batch.create.useMutation({
    onSuccess: () => {
      reset()
      router.refresh()
    },
  })

  return (
    <form onSubmit={handleSubmit((data) => createBatch.mutate(data))}>
      <div className="space-y-4">
        <Input {...register('name')} placeholder="Batch Name" />
        <Input {...register('strain')} placeholder="Strain" />
        <Input
          {...register('plantCount', { valueAsNumber: true })}
          type="number"
          placeholder="Number of Plants"
        />
        <Textarea {...register('notes')} placeholder="Notes (optional)" />
        <Button type="submit" disabled={createBatch.isPending}>
          Create Batch
        </Button>
      </div>
    </form>
  )
}
