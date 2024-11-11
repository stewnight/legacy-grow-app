'use client'

import { type ReactNode } from 'react'
import { ErrorBoundary as ReactErrorBoundary } from 'react-error-boundary'
import { Button } from '~/components/ui/button'
import { Alert, AlertDescription, AlertTitle } from '~/components/ui/alert'

interface PlantErrorBoundaryProps {
  children: ReactNode
}

function ErrorFallback({ error, resetErrorBoundary }: any) {
  return (
    <Alert variant="destructive">
      <AlertTitle>Something went wrong</AlertTitle>
      <AlertDescription>{error.message}</AlertDescription>
      <Button onClick={resetErrorBoundary} variant="outline" className="mt-4">
        Try again
      </Button>
    </Alert>
  )
}

export function PlantErrorBoundary({ children }: PlantErrorBoundaryProps) {
  return (
    <ReactErrorBoundary FallbackComponent={ErrorFallback}>
      {children}
    </ReactErrorBoundary>
  )
}
