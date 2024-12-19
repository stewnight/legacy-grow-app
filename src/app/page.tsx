'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { api } from '~/trpc/react'
import { Button } from '~/components/ui/button'

export default function LandingPage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const { data: isFirstUser } = api.user.isFirstUser.useQuery()

  useEffect(() => {
    if (status === 'authenticated') {
      router.push('/dashboard')
    }
  }, [status, router])

  if (status === 'loading') {
    return null
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center">
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage:
            'url("https://images.unsplash.com/photo-1536819114556-1c5699f20e05?q=80&w=2940&auto=format&fit=crop")',
        }}
      >
        <div className="absolute inset-0 bg-black/50" />
      </div>

      {/* Content */}
      <div className="relative z-10 space-y-8 px-4 text-center text-white">
        <h1 className="text-5xl font-bold tracking-tight">
          Welcome to Legacy Grow
        </h1>
        <p className="mx-auto max-w-2xl text-xl text-gray-200">
          A modern cultivation management system designed for efficiency and
          compliance.
        </p>
        <div className="flex justify-center gap-4">
          <Button
            size="lg"
            onClick={() => router.push('/auth/signin')}
            variant={isFirstUser ? 'default' : 'secondary'}
          >
            {isFirstUser ? 'Create Admin Account' : 'Sign In'}
          </Button>
        </div>
      </div>
    </div>
  )
}
