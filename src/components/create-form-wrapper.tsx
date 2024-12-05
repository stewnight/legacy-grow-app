'use client';

import { useSession } from 'next-auth/react';
import { Alert, AlertDescription } from '~/components/ui/alert';
import { Skeleton } from '~/components/ui/skeleton';

interface CreateFormWrapperProps {
  children: React.ReactNode;
}

export function CreateFormWrapper({ children }: CreateFormWrapperProps) {
  const { status } = useSession();

  if (status === 'loading') {
    return <Skeleton className="h-[400px] w-full" />;
  }

  if (status === 'unauthenticated') {
    return (
      <Alert>
        <AlertDescription>Please sign in to access this feature</AlertDescription>
      </Alert>
    );
  }

  return <>{children}</>;
}
