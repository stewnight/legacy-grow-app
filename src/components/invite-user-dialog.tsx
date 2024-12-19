'use client'

import { useState } from 'react'
import { Button } from '~/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '~/components/ui/dialog'
import { Input } from '~/components/ui/input'
import { useToast } from '~/hooks/use-toast'
import { api } from '~/trpc/react'
import { TRPCClientError } from '@trpc/client'

export function InviteUserDialog() {
  const [email, setEmail] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const { toast } = useToast()

  const { mutate: inviteUser, isPending } = api.user.inviteUser.useMutation({
    onSuccess: () => {
      toast({
        title: 'Invitation Sent',
        description: `An invitation has been sent to ${email}`,
      })
      setEmail('')
      setIsOpen(false)
    },
    onError: (error) => {
      if (error instanceof TRPCClientError) {
        toast({
          title: 'Error',
          description: error.message,
          variant: 'destructive',
        })
      }
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    inviteUser({ email })
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">Invite User</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Invite New User</DialogTitle>
          <DialogDescription>
            Send an invitation email to add a new user to Legacy Grow.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? 'Sending Invitation...' : 'Send Invitation'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
