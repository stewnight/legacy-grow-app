import Link from 'next/link'
import { auth } from '~/server/auth'
import { HydrateClient } from '~/trpc/server'
import { Button } from '~/components/ui/button'

export default async function Home() {
  const session = await auth()

  return (
    <HydrateClient>
      {/* Hero Section */}
      <div className="container mx-auto flex flex-1 px-4">
        <div className="flex flex-col items-center justify-center space-y-8 py-16 text-center">
          <h1 className="text-5xl font-bold tracking-tighter sm:text-6xl">
            Modern Cannabis Cultivation Management
          </h1>
          <p className="max-w-[600px] text-gray-500 md:text-xl">
            Track your plants, monitor growth stages, and manage your
            cultivation operation with ease.
          </p>
          <div className="flex gap-4">
            {session ? (
              <Link href="/plants">
                <Button size="lg">View Plants</Button>
              </Link>
            ) : (
              <Link href="/api/auth/signin">
                <Button size="lg">Get Started</Button>
              </Link>
            )}
            <Link href="https://github.com/your-repo" target="_blank">
              <Button variant="outline" size="lg">
                Learn More
              </Button>
            </Link>
          </div>
          {session && (
            <p className="text-sm text-gray-500">
              Signed in as {session.user?.name}
            </p>
          )}
        </div>
      </div>

      {/* Feature Section */}
      <div className="border-t bg-gray-50">
        <div className="container mx-auto px-4 py-16">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-lg border bg-white p-6">
              <h3 className="mb-2 text-lg font-semibold">Plant Tracking</h3>
              <p className="text-gray-500">
                Monitor your plants from seed to harvest with detailed logging
                and tracking.
              </p>
            </div>
            <div className="rounded-lg border bg-white p-6">
              <h3 className="mb-2 text-lg font-semibold">Growth Stages</h3>
              <p className="text-gray-500">
                Track vegetative and flowering stages with customizable metrics.
              </p>
            </div>
            <div className="rounded-lg border bg-white p-6">
              <h3 className="mb-2 text-lg font-semibold">Health Monitoring</h3>
              <p className="text-gray-500">
                Keep tabs on plant health and get alerts for potential issues.
              </p>
            </div>
          </div>
        </div>
      </div>
    </HydrateClient>
  )
}
