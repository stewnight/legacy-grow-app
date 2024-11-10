import { QueryClient } from '@tanstack/react-query'
import { persistQueryClient } from '@tanstack/react-query-persist-client'
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister'
import SuperJSON from 'superjson'

export const createQueryClient = () => {
  const client = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 5 * 60 * 1000, // 5 minutes
        gcTime: 24 * 60 * 60 * 1000, // 24 hours
        networkMode: 'offlineFirst',
      },
    },
  })

  // Only setup persistence on the client
  if (typeof window !== 'undefined') {
    const persister = createSyncStoragePersister({
      storage: window.localStorage,
      serialize: SuperJSON.stringify,
      deserialize: SuperJSON.parse,
    })

    void persistQueryClient({
      queryClient: client,
      persister,
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    })
  }

  return client
}
