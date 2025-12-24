"use client"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useState } from "react"

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true)
  const [isAnimating, setIsAnimating] = useState(false)

  const handleToggle = () => {
    setIsAnimating(true)
    setTimeout(() => {
      setIsLogin(!isLogin)
      setIsAnimating(false)
    }, 200)
  }

  return (
    <main className="flex min-h-screen items-center justify-center">
      <div
        className={cn(
          "relative min-h-screen flex items-center justify-center overflow-hidden"
        )}
      >
        {/* Login/Signup Card */}
        <div className="relative z-10 flex flex-col gap-4 sm:gap-6 px-4 sm:px-0 my-5">
          <Card className="w-full max-w-sm sm:max-w-md mx-auto backdrop-blur-md bg-white/90 border-1 border-stone-400 shadow-md transition-all duration-300">
            <CardHeader className="text-center px-4 sm:px-6">
              <div className={cn(
                "transition-all duration-300 transform",
                isAnimating ? "opacity-0 scale-95" : "opacity-100 scale-100"
              )}>
                <CardTitle className="text-lg sm:text-xl">
                  {isLogin ? "Login" : "Sign Up"}
                </CardTitle>
                <CardDescription className="text-sm">
                  Asset ICT Management System <br /> Pejabat Daerah Kampar
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="px-4 sm:px-6 pb-2">
              <div className="grid gap-4 sm:gap-6">
                <div className={cn(
                  "after:border-border relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t transition-all duration-300",
                  isAnimating ? "opacity-0" : "opacity-100"
                )}>
                  <span className="bg-card text-muted-foreground relative z-10 px-2">
                    IT Department
                  </span>
                </div>
                
                <div className="grid gap-4 sm:gap-6">
                  {/* Full Name Field - Signup Only */}
                  <div className={cn(
                    "grid gap-2 sm:gap-3 transition-all duration-300 overflow-hidden",
                    isLogin ? "max-h-0 opacity-0" : "max-h-20 opacity-100",
                    isAnimating && "transition-none"
                  )}>
                    <Label htmlFor="fullName">Full Name</Label>
                    <Input id="fullName" type="text" required />
                  </div>
                  
                  {/* User ID Field */}
                  <div className={cn(
                    "grid gap-2 sm:gap-3 transition-all duration-300 transform",
                    isAnimating ? "opacity-0 -translate-x-2" : "opacity-100 translate-x-0"
                  )}>
                    <Label htmlFor="userId">User ID</Label>
                    <Input id="userId" type="text" required />
                  </div>
                  
                  {/* Password Field */}
                  <div className={cn(
                    "grid gap-2 sm:gap-3 transition-all duration-300 transform",
                    isAnimating ? "opacity-0 translate-x-2" : "opacity-100 translate-x-0"
                  )}>
                    <div className="flex items-center">
                      <Label htmlFor="password">Password</Label>
                      {isLogin && (
                        <a
                          href="#"
                          className={cn(
                            "ml-auto text-xs sm:text-sm underline-offset-4 hover:underline transition-all duration-300",
                            isAnimating ? "opacity-0" : "opacity-100"
                          )}
                        >
                          Forgot your password?
                        </a>
                      )}
                    </div>
                    <Input id="password" type="password" required />
                  </div>
                  
                  {/* Confirm Password Field - Signup Only */}
                  <div className={cn(
                    "grid gap-2 sm:gap-3 transition-all duration-300 overflow-hidden",
                    isLogin ? "max-h-0 opacity-0" : "max-h-20 opacity-100",
                    isAnimating && "transition-none"
                  )}>
                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                    <Input id="confirmPassword" type="password" required />
                  </div>
                  
                  {/* Submit Button */}
                  <Button 
                    type="submit" 
                    className={cn(
                      "w-full bg-gray-950 hover:bg-gray-50 hover:text-black hover:border border-gray-500 transition-all duration-300 transform mt-2",
                      isAnimating ? "opacity-0 scale-95" : "opacity-100 scale-100"
                    )}
                  >
                    {isLogin ? "Login" : "Sign Up"}
                  </Button>
                </div>
                
                {/* Toggle Link */}
                <div className={cn(
                  "text-center text-sm pt-2 transition-all duration-300",
                  isAnimating ? "opacity-0" : "opacity-100"
                )}>
                  {isLogin ? "Don't have an account? " : "Already have an account? "}
                  <button 
                    onClick={handleToggle}
                    className="underline underline-offset-4 hover:text-primary transition-colors duration-200"
                    disabled={isAnimating}
                  >
                    {isLogin ? "Sign up" : "Login"}
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Terms text */}
          <div className="text-muted-foreground text-center text-xs text-balance px-4 sm:px-0 mt-4">
            <span className="block">
              By clicking continue, you agree to our{" "}
              <a
                href="#"
                className="underline underline-offset-4 hover:text-primary"
              >
                Terms of Service
              </a>{" "}
              and{" "}
              <a
                href="#"
                className="underline underline-offset-4 hover:text-primary"
              >
                Privacy Policy
              </a>
              .
            </span>
          </div>
        </div>
      </div>
    </main>
  )
}