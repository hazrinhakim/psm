import * as React from "react"

import { cn } from "@/lib/utils"

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/30 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive flex field-sizing-content min-h-24 w-full rounded-xl border border-border/80 bg-background/95 px-3.5 py-2.5 text-base shadow-sm transition-[color,background-color,border-color,box-shadow] outline-none focus-visible:bg-background focus-visible:ring-[4px] disabled:cursor-not-allowed disabled:opacity-50 md:text-sm dark:border-border/85 dark:bg-input/85 dark:shadow-[inset_0_0_0_1px_rgba(255,255,255,0.03)]",
        className
      )}
      {...props}
    />
  )
}

export { Textarea }
