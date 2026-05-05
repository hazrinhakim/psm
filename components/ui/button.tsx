import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl border text-sm font-medium tracking-[-0.01em] transition-[color,background-color,border-color,box-shadow,transform] duration-200 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/40 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive active:scale-[0.985]",
  {
    variants: {
      variant: {
        default:
          "border-border/70 bg-primary text-primary-foreground shadow-[0_10px_20px_-16px_color-mix(in_oklab,var(--primary)_42%,black)] hover:bg-primary/92 hover:-translate-y-0.5 dark:border-white/12",
        destructive:
          "border-destructive/40 bg-destructive text-white hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:border-destructive/55 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60",
        outline:
          "border border-border/80 bg-background/80 shadow-[0_8px_18px_-18px_rgba(15,23,42,0.18)] backdrop-blur-sm hover:border-border hover:bg-accent/60 hover:text-accent-foreground dark:border-border/80 dark:bg-input/70 dark:hover:border-border dark:hover:bg-input/85",
        secondary:
          "border-border/70 bg-secondary text-secondary-foreground shadow-[inset_0_1px_0_rgba(255,255,255,0.14)] hover:bg-secondary/88 dark:border-border/75",
        ghost:
          "border-transparent hover:bg-accent/70 hover:text-accent-foreground dark:hover:bg-accent/80",
        link: "border-transparent text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4 py-2 has-[>svg]:px-3",
        xs: "h-6 gap-1 rounded-md px-2 text-xs has-[>svg]:px-1.5 [&_svg:not([class*='size-'])]:size-3",
        sm: "h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5",
        lg: "h-10 rounded-md px-6 has-[>svg]:px-4",
        icon: "size-9",
        "icon-xs": "size-6 rounded-md [&_svg:not([class*='size-'])]:size-3",
        "icon-sm": "size-8",
        "icon-lg": "size-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot : "button"

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
