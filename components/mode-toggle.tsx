"use client"

import { useEffect, useState } from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

import { Button } from "@/components/ui/button"

export function ModeToggle() {
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const isDark = resolvedTheme === "dark"
  const nextModeLabel = mounted
    ? `Switch to ${isDark ? "light" : "dark"} mode`
    : "Toggle theme"

  const handleToggle = () => {
    const root = document.documentElement
    root.classList.add("theme-animating")
    setIsAnimating(true)
    setTheme(isDark ? "light" : "dark")

    window.setTimeout(() => {
      root.classList.remove("theme-animating")
      setIsAnimating(false)
    }, 430)
  }

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={handleToggle}
      aria-label={nextModeLabel}
      title={nextModeLabel}
      className={`relative overflow-hidden border-border/70 bg-background/80 shadow-sm backdrop-blur-sm transition-all duration-300 hover:scale-[1.02] hover:shadow-md active:scale-95 ${
        isAnimating ? "scale-[0.985] shadow-md" : ""
      }`}
    >
      <span
        className={`absolute inset-0 rounded-[inherit] bg-gradient-to-br from-foreground/8 via-transparent to-foreground/4 transition-opacity duration-500 ${
          isAnimating ? "opacity-100" : "opacity-0"
        }`}
      />
      <Sun
        className={`h-[1.2rem] w-[1.2rem] scale-100 rotate-0 transition-all duration-500 dark:scale-0 dark:-rotate-90 ${
          isAnimating ? "translate-y-1 rotate-45 scale-75 opacity-0" : ""
        }`}
      />
      <Moon
        className={`absolute h-[1.2rem] w-[1.2rem] scale-0 rotate-90 transition-all duration-500 dark:scale-100 dark:rotate-0 ${
          isAnimating ? "translate-y-0 scale-105 opacity-100" : ""
        }`}
      />
      <span className="sr-only">Toggle theme</span>
    </Button>
  )
}
