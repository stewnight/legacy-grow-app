import { redirect } from 'next/navigation'
import Link from 'next/link'
import { auth } from '~/server/auth'
import { HydrateClient } from '~/trpc/server'
import { Button } from '~/components/ui/button'

export default async function Home() {
  const session = await auth()

  // Redirect authenticated users to dashboard
  if (session) {
    redirect('/dashboard')
  }

  return (
    <HydrateClient>
      {/* Hero Section */}
      <div className="container mx-auto flex flex-1 px-4">
        <div className="flex flex-col items-center justify-center space-y-8 py-16 text-center">
          <div className="rounded-full bg-yellow-100 px-4 py-1.5 text-sm font-medium text-yellow-800">
            Early Development Preview
          </div>
          <h1 className="text-5xl font-bold tracking-tighter sm:text-6xl">
            Modern Cannabis Cultivation Management
          </h1>
          <p className="max-w-[600px] text-gray-500 md:text-xl">
            A comprehensive system for tracking plants, monitoring growth stages, and managing your
            entire cultivation operation with ease.
          </p>
          <div className="flex gap-4">
            <Link href="/api/auth/signin">
              <Button size="lg">Get Started</Button>
            </Link>
            <Link href="https://github.com/stewnight/legacy-grow-app" target="_blank">
              <Button variant="outline" size="lg">
                View on GitHub
              </Button>
            </Link>
          </div>
          <p className="text-sm text-gray-500">
            ⚠️ This is a development preview. All data is temporary and may be reset periodically.
          </p>
        </div>
      </div>

      {/* Feature Section */}
      <div className="border-t bg-gray-50">
        <div className="container mx-auto px-4 py-16">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-lg border bg-white p-6">
              <h3 className="mb-2 text-lg font-semibold">Complete Lifecycle Tracking</h3>
              <p className="text-gray-500">
                Monitor your plants from seed to harvest with genetic strain management, location
                tracking, and detailed logging.
              </p>
            </div>
            <div className="rounded-lg border bg-white p-6">
              <h3 className="mb-2 text-lg font-semibold">Mobile-First Design</h3>
              <p className="text-gray-500">
                Built for cultivators on the move with offline support, quick actions, and camera
                integration for plant photos.
              </p>
            </div>
            <div className="rounded-lg border bg-white p-6">
              <h3 className="mb-2 text-lg font-semibold">Compliance & Reporting</h3>
              <p className="text-gray-500">
                Stay compliant with comprehensive logging, task management, and detailed reporting
                capabilities.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Roadmap Section */}
      <div className="border-t">
        <div className="container mx-auto px-4 py-16">
          <h2 className="mb-8 text-center text-3xl font-bold">Current Development Phase</h2>
          <div className="mx-auto max-w-2xl rounded-lg border bg-white p-6">
            <h3 className="mb-4 text-lg font-semibold">Phase 1: Basic Plant Logging</h3>
            <ul className="list-inside list-disc space-y-2 text-gray-500">
              <li>Plant creation and basic details entry</li>
              <li>Growth stage tracking (seedling, vegetative, flowering)</li>
              <li>Daily/weekly logging functionality</li>
              <li>Basic location tracking</li>
              <li>Mobile-friendly image upload</li>
              <li>Simple task creation and completion</li>
            </ul>
          </div>
        </div>
      </div>
    </HydrateClient>
  )
}
