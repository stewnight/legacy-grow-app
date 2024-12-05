import { QueryClient } from '@tanstack/react-query';
import { persistQueryClient } from '@tanstack/react-query-persist-client';
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister';
import SuperJSON from 'superjson';
import { TRPCError } from '@trpc/server';

export const createQueryClient = () => {
  const client = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 5 * 60 * 1000,
        gcTime: 24 * 60 * 60 * 1000,
        networkMode: 'offlineFirst',
        retry: (failureCount, error) => {
          if (error instanceof TRPCError) {
            return (
              !['NOT_FOUND', 'UNAUTHORIZED', 'FORBIDDEN'].includes(error.code) && failureCount < 3
            );
          }
          return failureCount < 3;
        },
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      },
      mutations: {
        networkMode: 'offlineFirst',
        retry: false,
      },
    },
  });

  if (typeof window !== 'undefined') {
    const persister = createSyncStoragePersister({
      storage: window.localStorage,
      serialize: SuperJSON.stringify,
      deserialize: SuperJSON.parse,
      throttleTime: 2000,
    });

    void persistQueryClient({
      queryClient: client,
      persister,
      maxAge: 24 * 60 * 60 * 1000,
      buster: process.env.NEXT_PUBLIC_VERSION ?? '1.0.0',
      dehydrateOptions: {
        shouldDehydrateQuery: (query) => {
          return !query.state.error;
        },
      },
    });
  }

  return client;
};
