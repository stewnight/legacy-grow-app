'use client'

import { api } from '~/trpc/react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '~/components/ui/card'
import { Button } from '~/components/ui/button'
import { Skeleton } from '~/components/ui/skeleton'
import { Badge } from '~/components/ui/badge'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '~/components/ui/alert-dialog'
import { Trash2 } from 'lucide-react'
import { useToast } from '~/hooks/use-toast'

export function StrainList() {
  const { toast } = useToast()
  const utils = api.useUtils()

  const { data: strains, isLoading } = api.strain.list.useQuery()

  const deleteStrain = api.strain.delete.useMutation({
    onSuccess: () => {
      void utils.strain.list.invalidate()
      toast({
        title: 'Success',
        description: 'Strain deleted successfully',
      })
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      })
    },
  })

  if (isLoading) {
    return <Skeleton className="h-[400px] w-full" />
  }

  if (!strains?.length) {
    return (
      <CardContent>
        <div className="text-center text-muted-foreground">
          No strains found. Create your first strain to get started.
        </div>
      </CardContent>
    )
  }

  return (
    <CardContent className="space-y-4">
      {strains.map((strain) => (
        <Card key={strain.id}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div>
              <CardTitle className="text-lg">{strain.name}</CardTitle>
              <CardDescription>
                <Badge variant="outline">{strain.type}</Badge>
              </CardDescription>
            </div>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Strain</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete this strain? This action
                    cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => deleteStrain.mutate({ id: strain.id })}
                  >
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2">
              {strain.description && (
                <p className="text-sm text-muted-foreground">
                  {strain.description}
                </p>
              )}
              <div className="grid grid-cols-3 gap-2 text-sm">
                {strain.floweringTime && (
                  <div>
                    <span className="text-muted-foreground">Flowering: </span>
                    {strain.floweringTime} weeks
                  </div>
                )}
                {strain.thcPotential && (
                  <div>
                    <span className="text-muted-foreground">THC: </span>
                    {strain.thcPotential}%
                  </div>
                )}
                {strain.cbdPotential && (
                  <div>
                    <span className="text-muted-foreground">CBD: </span>
                    {strain.cbdPotential}%
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </CardContent>
  )
}
