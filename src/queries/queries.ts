import {createSyncStoragePersister} from '@tanstack/query-sync-storage-persister'
import {
  matchQuery,
  MutationCache,
  type OmitKeyof,
  QueryClient,
  type QueryKey,
} from '@tanstack/react-query'
import type {PersistedClient, PersistQueryClientOptions} from '@tanstack/react-query-persist-client'
import {parse, stringify} from 'devalue'
import {compress as compressString, decompress as decompressString} from 'lz-string'

import {isPermanentError} from '@/utils/errors/MaybePermanentError'

declare module '@tanstack/react-query' {
  interface Register {
    mutationMeta: {
      invalidates?: QueryKey[] | 'all'
      awaitInvalidates?: QueryKey[] | 'all'
    }
  }
}

export function createQueryClient() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        throwOnError: true,
        gcTime: 1000 * 60 * 60 * 24, // 24 hours
        retry(failureCount, error) {
          if (isPermanentError(error)) return false
          return failureCount < 1
        },
      },
      mutations: {
        throwOnError: false,
        gcTime: 1000 * 60 * 60 * 24, // 24 hours
        retry(failureCount, error) {
          if (isPermanentError(error)) return false
          return failureCount < 1
        },
      },
    },
    mutationCache: new MutationCache({
      onSuccess: async (_data, _variables, _context, mutation) => {
        const awaitInvalidates = mutation.meta?.awaitInvalidates
        if (awaitInvalidates === 'all') {
          await queryClient.invalidateQueries()
        } else {
          await queryClient.invalidateQueries({
            predicate: query =>
              awaitInvalidates?.some(queryKey => matchQuery({queryKey}, query)) ?? false,
          })
        }

        const invalidates = mutation.meta?.invalidates
        if (invalidates === 'all') {
          void queryClient.invalidateQueries()
        } else {
          void queryClient.invalidateQueries({
            predicate: query =>
              invalidates?.some(queryKey => matchQuery({queryKey}, query)) ?? false,
          })
        }
      },
    }),
  })

  return queryClient
}

export function createQueryPersistOptions(): OmitKeyof<PersistQueryClientOptions, 'queryClient'> {
  const persister = createSyncStoragePersister({
    storage: window.localStorage,
    serialize: data => compressString(stringify(data)),
    deserialize: data => parse(decompressString(data)) as PersistedClient,
  })

  return {
    persister,
    dehydrateOptions: {
      shouldDehydrateQuery: ({queryKey}) => {
        const firstKey = queryKey[0]
        if (typeof firstKey !== 'string') return true
        return !firstKey.startsWith('!')
      },
      shouldDehydrateMutation: ({meta}) => {
        if (!meta) return true
        if (typeof meta.persist !== 'boolean') return true
        return !!meta.persist
      },
    },
  }
}
