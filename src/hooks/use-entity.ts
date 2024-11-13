import { type RouterOutputs } from '~/trpc/shared'
import { api } from '~/trpc/react'
import { useQueryClient } from '@tanstack/react-query'

interface UseEntityOptions<TPath extends keyof RouterOutputs> {
  path: TPath
  queryKey: string[]
}

export function useEntity<TPath extends keyof RouterOutputs>({
  path,
  queryKey,
}: UseEntityOptions<TPath>) {
  const queryClient = useQueryClient()

  const query = api[path].list.useQuery(undefined, {
    staleTime: 5 * 60 * 1000,
    gcTime: 24 * 60 * 60 * 1000,
    networkMode: 'offlineFirst',
  })

  const createMutation = api[path].create.useMutation({
    onMutate: async (newData) => {
      await queryClient.cancelQueries({ queryKey })
      const previousData = queryClient.getQueryData(queryKey)

      queryClient.setQueryData(queryKey, (old: any[] = []) => [
        ...old,
        { id: Date.now(), ...newData },
      ])

      return { previousData }
    },
    onError: (_, __, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(queryKey, context.previousData)
      }
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey })
    },
  })

  const updateMutation = api[path].update.useMutation({
    onMutate: async ({ id, data }) => {
      await queryClient.cancelQueries({ queryKey })
      const previousData = queryClient.getQueryData(queryKey)

      queryClient.setQueryData(queryKey, (old: any[] = []) =>
        old?.map((item) => (item.id === id ? { ...item, ...data } : item))
      )

      return { previousData }
    },
    onError: (_, __, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(queryKey, context.previousData)
      }
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey })
    },
  })

  const deleteMutation = api[path].delete.useMutation({
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey })
      const previousData = queryClient.getQueryData(queryKey)

      queryClient.setQueryData(queryKey, (old: any[] = []) =>
        old?.filter((item) => item.id !== id)
      )

      return { previousData }
    },
    onError: (_, __, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(queryKey, context.previousData)
      }
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey })
    },
  })

  return {
    data: query.data,
    isLoading: query.isLoading,
    error: query.error,
    create: createMutation,
    update: updateMutation,
    delete: deleteMutation,
  }
}
