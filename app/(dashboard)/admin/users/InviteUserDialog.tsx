'use client'

import { useIsMobile } from '@/hooks/use-mobile'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
  DrawerOverlay,
} from '@/components/ui/drawer'
import { ChevronDown, UserPlus } from 'lucide-react'
import { inviteUser } from './actions'

export function InviteUserDialog() {
  const isMobile = useIsMobile()
  const [role, setRole] = useState('staff')
  const roleLabel =
    role === 'admin'
      ? 'Admin'
      : role === 'admin_assistant'
        ? 'Admin Assistant'
        : 'Staff'

  const form = (
    <form action={inviteUser} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="invite-email" className="text-foreground/80">Email</Label>
          <Input
            id="invite-email"
            name="email"
            type="email"
            placeholder="user@company.com"
            className="h-11 bg-white/50 backdrop-blur-sm border-white/20 focus:bg-white/80 transition-all"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="invite-role" className="text-foreground/80">Role</Label>
          <input type="hidden" name="role" value={role} />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="h-11 w-full justify-between bg-white/50 backdrop-blur-sm border-white/20 hover:bg-white/60 transition-all"
                id="invite-role"
                type="button"
              >
                {roleLabel}
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-52 bg-white/90 backdrop-blur-xl border-white/20">
              <DropdownMenuItem onClick={() => setRole('admin')} className="hover:bg-white/60">
                Admin
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setRole('admin_assistant')} className="hover:bg-white/60">
                Admin Assistant
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setRole('staff')} className="hover:bg-white/60">
                Staff
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      <Button type="submit" className="h-11 w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg">
        Send invite
      </Button>
    </form>
  )

  if (isMobile) {
    return (
      <Drawer>
        <DrawerTrigger asChild>
          <Button className="gap-2 bg-black hover:bg-stone-600 hover:text-white shadow-lg">
            <UserPlus className="h-4 w-4" />
            Add User
          </Button>
        </DrawerTrigger>
        <DrawerOverlay className="bg-black/10 backdrop-blur-xs" />
        <DrawerContent className="bg-white/80 backdrop-blur-xl border-t border-white/20">
          <DrawerHeader>
            <DrawerTitle>Invite a user</DrawerTitle>
            <DrawerDescription>
              Send an email invite to create a new account.
            </DrawerDescription>
          </DrawerHeader>
          <div className="px-4">{form}</div>
          <DrawerFooter>
            <DrawerClose asChild>
              <Button variant="outline" className="border-white/20 bg-white/50 backdrop-blur-sm hover:bg-white/60">
                Close
              </Button>
            </DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    )
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="gap-2 bg-black hover:bg-stone-600 hover:text-white shadow-lg">
          <UserPlus className="h-4 w-4" />
          Add User
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-white/80 backdrop-blur-xl border border-white/20 shadow-2xl">
        <DialogHeader>
          <DialogTitle>Invite a user</DialogTitle>
          <DialogDescription>
            Send an email invite to create a new account.
          </DialogDescription>
        </DialogHeader>
        {form}
      </DialogContent>
    </Dialog>
  )
}
