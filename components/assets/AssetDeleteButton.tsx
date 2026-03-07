"use client"

import { useId } from "react"
import { useFormStatus } from "react-dom"
import { Trash2, AlertCircle } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Spinner } from "@/components/ui/spinner"

type AssetDeleteButtonProps = {
  action: (formData: FormData) => void
  assetId: string
  redirectTo: string
  assetLabel: string
}

function DeleteConfirmButton() {
  const { pending } = useFormStatus()

  return (
    <Button
      type="submit"
      className="w-full sm:w-auto bg-rose-600 hover:bg-rose-700 text-white"
      disabled={pending}
    >
      {pending ? (
        <>
          <Spinner className="mr-2" />
          Deleting...
        </>
      ) : (
        <>
          <Trash2 className="mr-2 h-4 w-4" />
          Confirm Delete
        </>
      )}
    </Button>
  )
}

export function AssetDeleteButton({
  action,
  assetId,
  redirectTo,
  assetLabel,
}: AssetDeleteButtonProps) {
  const dialogTitleId = useId()

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="gap-2 text-rose-500 border-2 border-rose-200 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-300 transition-all duration-200 h-9 rounded-full group"
          type="button"
        >
          <Trash2 className="h-4 w-4 transition-transform group-hover:scale-110" />
          Delete
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle id={dialogTitleId} className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-rose-600" />
            Delete confirmation
          </DialogTitle>
          <DialogDescription>
            This will permanently delete{" "}
            <span className="font-medium text-foreground">{assetLabel}</span>. This
            action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <form action={action} className="space-y-4">
          <input type="hidden" name="redirectTo" value={redirectTo} />
          <input type="hidden" name="id" value={assetId} />
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </DialogClose>
            <DeleteConfirmButton />
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
