import { Button } from '~/components/ui/button'
import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="flex h-[50vh] flex-col items-center justify-center space-y-4">
      <h2 className="text-2xl font-bold">Genetic Not Found</h2>
      <p className="text-muted-foreground">
        The genetic you're looking for doesn't exist.
      </p>
      <Button asChild>
        <Link href="/genetics">Back to Genetics</Link>
      </Button>
    </div>
  )
}
