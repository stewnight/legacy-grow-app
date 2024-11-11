import { Button } from '~/components/ui/button'
import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="flex h-[50vh] flex-col items-center justify-center space-y-4">
      <h2 className="text-2xl font-bold">Batch Not Found</h2>
      <p className="text-muted-foreground">
        The batch you're looking for doesn't exist.
      </p>
      <Button asChild>
        <Link href="/batches">Back to Batches</Link>
      </Button>
    </div>
  )
}
