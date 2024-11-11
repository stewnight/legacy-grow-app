'use client'

import { useEffect, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { SyncService } from '~/services/syncService'
import { Button } from './ui/button'
import { Loader2, WifiOff, AlertCircle } from 'lucide-react'
import { useToast } from '~/hooks/use-toast'

export function NetworkStatus() {
  const [isOnline, setIsOnline] = useState(true)
  const [isSyncing, setIsSyncing] = useState(false)
  const [hasError, setHasError] = useState(false)
  const queryClient = useQueryClient()
  const syncService = new SyncService(queryClient)
  const { toast } = useToast()

  const handleSync = async () => {
    setIsSyncing(true)
    setHasError(false)
    try {
      await syncService.syncAll()
      toast({
        title: 'Sync complete',
        description: 'All data has been synchronized',
      })
    } catch (error) {
      console.error('Sync failed:', error)
      setHasError(true)
      toast({
        title: 'Sync failed',
        description: 'Please try again later',
        variant: 'destructive',
      })
    } finally {
      setIsSyncing(false)
    }
  }

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true)
      void handleSync()
    }
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [handleSync])

  if (isOnline && !isSyncing && !hasError) return null

  return (
    <div className="fixed bottom-4 right-4 flex items-center gap-2 rounded-md bg-background p-4 shadow-lg">
      {!isOnline ? (
        <>
          <WifiOff className="h-4 w-4" />
          <span>You are offline.</span>
        </>
      ) : hasError ? (
        <>
          <AlertCircle className="h-4 w-4 text-destructive" />
          <span>Sync failed.</span>
        </>
      ) : (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Syncing changes...</span>
        </>
      )}
      {(hasError || !isOnline) && (
        <Button
          variant="outline"
          size="sm"
          onClick={() => void handleSync()}
          disabled={!isOnline || isSyncing}
        >
          {isSyncing ? 'Syncing...' : 'Retry Sync'}
        </Button>
      )}
    </div>
  )
}
