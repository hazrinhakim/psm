"use client"

import * as React from "react"
import * as TabsPrimitive from "@radix-ui/react-tabs"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

function Tabs({
  className,
  orientation = "horizontal",
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Root>) {
  return (
    <TabsPrimitive.Root
      data-slot="tabs"
      data-orientation={orientation}
      orientation={orientation}
      className={cn(
        "group/tabs flex gap-2 data-[orientation=horizontal]:flex-col",
        className
      )}
      {...props}
    />
  )
}

const tabsListVariants = cva(
  "rounded-xl border border-white/45 bg-white/45 p-1 shadow-[0_10px_30px_-18px_rgba(15,23,42,0.35)] backdrop-blur-xl supports-[backdrop-filter]:bg-white/40 group-data-[orientation=horizontal]/tabs:h-11 data-[variant=line]:rounded-none data-[variant=line]:border-0 data-[variant=line]:bg-transparent data-[variant=line]:p-0 data-[variant=line]:shadow-none data-[variant=line]:backdrop-blur-0 group/tabs-list text-muted-foreground inline-flex w-fit items-center justify-center group-data-[orientation=vertical]/tabs:h-fit group-data-[orientation=vertical]/tabs:flex-col dark:border-white/10 dark:bg-white/8 dark:shadow-[0_14px_36px_-20px_rgba(0,0,0,0.65)] supports-[backdrop-filter]:dark:bg-white/8",
  {
    variants: {
      variant: {
        default: "",
        line: "gap-1 bg-transparent",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function TabsList({
  className,
  variant = "default",
  ...props
}: React.ComponentProps<typeof TabsPrimitive.List> &
  VariantProps<typeof tabsListVariants>) {
  const listRef = React.useRef<HTMLDivElement | null>(null)
  const [indicatorStyle, setIndicatorStyle] = React.useState<React.CSSProperties>({
    opacity: 0,
  })

  React.useEffect(() => {
    if (variant !== "default") {
      return
    }

    const listElement = listRef.current
    if (!listElement) {
      return
    }

    const updateIndicator = () => {
      const activeTrigger = listElement.querySelector<HTMLElement>(
        '[data-slot="tabs-trigger"][data-state="active"]'
      )

      if (!activeTrigger) {
        setIndicatorStyle({ opacity: 0 })
        return
      }

      setIndicatorStyle({
        opacity: 1,
        width: activeTrigger.offsetWidth,
        height: activeTrigger.offsetHeight,
        transform: `translateX(${activeTrigger.offsetLeft}px) translateY(${activeTrigger.offsetTop}px)`,
      })
    }

    updateIndicator()

    const resizeObserver = new ResizeObserver(() => {
      updateIndicator()
    })

    resizeObserver.observe(listElement)
    Array.from(listElement.children).forEach(child => resizeObserver.observe(child))

    const mutationObserver = new MutationObserver(() => {
      updateIndicator()
    })

    mutationObserver.observe(listElement, {
      subtree: true,
      attributes: true,
      attributeFilter: ["data-state"],
    })

    listElement.addEventListener("scroll", updateIndicator, { passive: true })
    window.addEventListener("resize", updateIndicator)

    return () => {
      resizeObserver.disconnect()
      mutationObserver.disconnect()
      listElement.removeEventListener("scroll", updateIndicator)
      window.removeEventListener("resize", updateIndicator)
    }
  }, [variant])

  return (
    <TabsPrimitive.List
      ref={listRef}
      data-slot="tabs-list"
      data-variant={variant}
      className={cn("relative isolate", tabsListVariants({ variant }), className)}
      {...props}
    >
      {variant === "default" ? (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute left-0 top-0 z-0 rounded-lg border border-slate-950/95 bg-slate-950 shadow-[0_14px_30px_-18px_rgba(15,23,42,0.85)] transition-[transform,width,height,opacity] duration-300 ease-out dark:border-white/15 dark:bg-white dark:shadow-[0_16px_32px_-20px_rgba(0,0,0,0.85)] motion-reduce:transition-none"
          style={indicatorStyle}
        />
      ) : null}
      {props.children}
    </TabsPrimitive.List>
  )
}

function TabsTrigger({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Trigger>) {
  return (
    <TabsPrimitive.Trigger
      data-slot="tabs-trigger"
      className={cn(
        "focus-visible:border-ring focus-visible:ring-ring/30 focus-visible:outline-ring text-foreground/70 hover:text-foreground dark:text-white/70 dark:hover:text-white relative z-10 inline-flex h-[calc(100%-1px)] flex-1 items-center justify-center gap-1.5 rounded-lg border border-transparent px-3 py-1.5 text-sm font-medium whitespace-nowrap transition-[color,background-color,border-color,box-shadow,transform,opacity] duration-300 ease-out group-data-[orientation=vertical]/tabs:w-full group-data-[orientation=vertical]/tabs:justify-start focus-visible:ring-[3px] focus-visible:outline-1 disabled:pointer-events-none disabled:opacity-50 motion-reduce:transition-none group-data-[variant=default]/tabs-list:bg-white/10 group-data-[variant=default]/tabs-list:shadow-[inset_0_1px_0_rgba(255,255,255,0.18)] group-data-[variant=default]/tabs-list:backdrop-blur-md group-data-[variant=default]/tabs-list:dark:bg-white/5 group-data-[variant=default]/tabs-list:dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] group-data-[variant=default]/tabs-list:data-[state=active]:bg-transparent group-data-[variant=default]/tabs-list:data-[state=active]:shadow-none group-data-[variant=line]/tabs-list:data-[state=active]:shadow-none [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        "group-data-[variant=line]/tabs-list:bg-transparent group-data-[variant=line]/tabs-list:data-[state=active]:bg-transparent dark:group-data-[variant=line]/tabs-list:data-[state=active]:border-transparent dark:group-data-[variant=line]/tabs-list:data-[state=active]:bg-transparent",
        "data-[state=active]:text-white dark:data-[state=active]:text-slate-950 motion-reduce:data-[state=active]:translate-y-0 motion-reduce:data-[state=active]:scale-100",
        "after:bg-foreground after:absolute after:opacity-0 after:transition-[opacity,transform] after:duration-300 after:ease-out group-data-[orientation=horizontal]/tabs:after:inset-x-2 group-data-[orientation=horizontal]/tabs:after:bottom-[-6px] group-data-[orientation=horizontal]/tabs:after:h-px group-data-[orientation=horizontal]/tabs:after:scale-x-75 group-data-[orientation=vertical]/tabs:after:inset-y-2 group-data-[orientation=vertical]/tabs:after:-right-1 group-data-[orientation=vertical]/tabs:after:w-px group-data-[orientation=vertical]/tabs:after:scale-y-75 group-data-[variant=line]/tabs-list:data-[state=active]:after:opacity-100 group-data-[variant=line]/tabs-list:data-[state=active]:after:scale-100 motion-reduce:after:transition-none",
        className
      )}
      {...props}
    />
  )
}

function TabsContent({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Content>) {
  return (
    <TabsPrimitive.Content
      data-slot="tabs-content"
      className={cn("flex-1 outline-none", className)}
      {...props}
    />
  )
}

export { Tabs, TabsList, TabsTrigger, TabsContent, tabsListVariants }
