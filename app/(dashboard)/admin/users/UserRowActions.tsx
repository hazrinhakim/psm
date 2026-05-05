'use client'

import { useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Pencil, Trash2 } from 'lucide-react'

type UserRowActionsProps = {
  userId: string
  role: string
  updateUserRole: (formData: FormData) => void | Promise<void>
  deleteUser: (formData: FormData) => void | Promise<void>
}

export function UserRowActions({
  userId,
  role,
  updateUserRole,
  deleteUser,
}: UserRowActionsProps) {
  const roleLabel = useMemo(() => role.replace('_', ' '), [role])
  const [roleValue, setRoleValue] = useState(role)
  const roleDisplay = useMemo(
    () => roleValue.replace('_', ' '),
    [roleValue]
  )

  return (
    <div className="flex">
      <Dialog>
        <DialogTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 rounded-md text-blue-600 hover:bg-blue-50 hover:text-blue-700"
          >
            <Pencil className="h-4 w-4" />
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit user role</DialogTitle>
            <DialogDescription>
              Update the user role and save the changes.
            </DialogDescription>
          </DialogHeader>
          <form action={updateUserRole} className="space-y-4">
            <input type="hidden" name="user_id" value={userId} />
            <input type="hidden" name="role" value={roleValue} />
            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground">
                Select role
              </p>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    type="button"
                    className="w-full justify-between"
                  >
                    {roleDisplay}
                    <span className="text-muted-foreground"></span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-56">
                  <DropdownMenuItem
                    onSelect={event => {
                      event.preventDefault()
                      setRoleValue('admin')
                    }}
                  >
                    Admin
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onSelect={event => {
                      event.preventDefault()
                      setRoleValue('admin_assistant')
                    }}
                  >
                    Admin Assistant
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onSelect={event => {
                      event.preventDefault()
                      setRoleValue('staff')
                    }}
                  >
                    Staff
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <p className="text-xs text-muted-foreground">
                Current role: {roleLabel}
              </p>
            </div>
            <DialogFooter className="gap-2 sm:gap-2">
              <DialogClose asChild>
                <Button variant="outline" type="button">
                  Cancel
                </Button>
              </DialogClose>
              <Button type="submit">
                Save Changes
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog>
        <DialogTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 rounded-md text-red-600 hover:bg-red-50 hover:text-red-700"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete user?</DialogTitle>
            <DialogDescription>
              This action permanently removes the user and their profile.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-2">
            <DialogClose asChild>
              <Button variant="outline" type="button">
                Cancel
              </Button>
            </DialogClose>
            <form action={deleteUser}>
              <input type="hidden" name="user_id" value={userId} />
              <Button type="submit" variant="destructive">
                Delete user
              </Button>
            </form>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
