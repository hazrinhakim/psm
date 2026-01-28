'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { roleToPath } from '@/lib/roles'
import { toast } from 'sonner'
import { Spinner } from '@/components/ui/spinner'
import { Building, Lock, Mail, Shield, Sparkles, Cpu, Server, HardDrive, Wifi } from 'lucide-react'
import { motion } from 'framer-motion'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setError(error.message)
      toast.error(error.message)
      setLoading(false)
      return
    }

    if (!data.user) {
      setError('Login failed')
      toast.error('Login failed')
      setLoading(false)
      return
    }

    // ⛔ JANGAN fetch profile dulu
    // ⛔ JANGAN redirect ikut role dulu

    // ✅ BIAR middleware urus redirect
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', data.user.id)
      .maybeSingle()

    router.replace(roleToPath(profile?.role))
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white to-gray-100 p-4 relative overflow-hidden">
      {/* Enhanced animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Main animated gradient */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 0.4, scale: 1 }}
          transition={{ duration: 2 }}
          className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-r from-amber-200/50 via-amber-300/40 to-yellow-400/30 rounded-full blur-3xl"
        />
        
        {/* Secondary animated gradient */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 0.3, scale: 1 }}
          transition={{ duration: 2, delay: 0.3 }}
          className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-r from-gray-400/20 via-black/20 to-black/10 rounded-full blur-3xl"
        />
        
        {/* Third animated gradient */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 0.2, scale: 1 }}
          transition={{ duration: 2, delay: 0.6 }}
          className="absolute top-1/2 left-1/4 w-80 h-80 bg-gradient-to-r from-white/10 via-gray-200/10 to-gray-300/10 rounded-full blur-3xl"
        />
      </div>

      {/* Enhanced floating icons with better visibility */}
      <motion.div
        initial={{ y: 40, opacity: 0, rotate: -15 }}
        animate={{ 
          y: [40, 0, 40],
          opacity: [0, 0.6, 0],
          rotate: [-15, 0, 15]
        }}
        transition={{ 
          duration: 8,
          repeat: Infinity,
          delay: 0.2
        }}
        className="absolute top-20 left-10"
      >
        <Cpu className="h-8 w-8 text-amber-400 drop-shadow-lg" />
      </motion.div>
      
      <motion.div
        initial={{ y: -40, opacity: 0, rotate: 15 }}
        animate={{ 
          y: [-40, 0, -40],
          opacity: [0, 0.6, 0],
          rotate: [15, 0, -15]
        }}
        transition={{ 
          duration: 7,
          repeat: Infinity,
          delay: 0.5
        }}
        className="absolute bottom-20 right-10"
      >
        <Server className="h-8 w-8 text-gray-700 drop-shadow-lg" />
      </motion.div>
      
      <motion.div
        initial={{ scale: 0, opacity: 0, rotate: 0 }}
        animate={{ 
          scale: [0, 1, 0.8, 1],
          opacity: [0, 0.5, 0.3, 0],
          rotate: [0, 180, 360]
        }}
        transition={{ 
          duration: 10,
          repeat: Infinity,
          delay: 0.8
        }}
        className="absolute top-1/3 right-1/4"
      >
        <HardDrive className="h-6 w-6 text-yellow-500 drop-shadow-lg" />
      </motion.div>

      {/* Additional floating elements */}
      <motion.div
        initial={{ x: -50, opacity: 0 }}
        animate={{ 
          x: [-50, 50, -50],
          opacity: [0, 0.4, 0]
        }}
        transition={{ 
          duration: 12,
          repeat: Infinity,
          delay: 1.2
        }}
        className="absolute bottom-1/4 left-20"
      >
        <Wifi className="h-5 w-5 text-amber-300 drop-shadow-lg" />
      </motion.div>

      {/* Animated dots/particles */}
      {[...Array(5)].map((_, i) => (
        <motion.div
          key={i}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ 
            scale: [0, 1, 0],
            opacity: [0, 0.3, 0],
            y: [0, -30, 0]
          }}
          transition={{ 
            duration: 4 + i,
            repeat: Infinity,
            delay: i * 0.5,
            ease: "easeInOut"
          }}
          className={`absolute w-2 h-2 bg-amber-400 rounded-full ${
            i % 2 === 0 ? 'left-1/4' : 'right-1/4'
          } ${i < 2 ? 'top-1/4' : 'bottom-1/4'}`}
        />
      ))}

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ 
          duration: 0.8,
          type: "spring",
          stiffness: 100,
          damping: 15
        }}
        className="w-full max-w-sm relative z-10"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ 
            duration: 0.5,
            type: "spring",
            stiffness: 200,
            damping: 20
          }}
        >
          <Card className="border-1 border-gray-300 shadow-xl bg-white/95 backdrop-blur-sm overflow-hidden">
            {/* Enhanced animated gradient header */}
            <div className="relative h-1.5 overflow-hidden">
              <motion.div
                initial={{ x: "-100%" }}
                animate={{ x: "100%" }}
                transition={{ 
                  duration: 3,
                  repeat: Infinity,
                  ease: "linear"
                }}
                className="absolute inset-0 bg-gradient-to-r from-transparent via-amber-300 to-transparent"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black via-amber-300 to-amber-200" />
            </div>
            
            <CardHeader className="text-center pt-3 pb-3">
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ 
                  type: "spring",
                  stiffness: 200,
                  damping: 15,
                  delay: 0.2
                }}
                className="mx-auto"
              >
                <div className="h-12 w-32 flex items-center justify-center shadow-lg p-1">
                  <img
                    src="./icamsrbg.png"
                    alt="ICAMS"
                    className="h-full w-full object-contain"
                  />
                </div>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <CardDescription className="text-xs text-gray-500">
                  ICT Asset Management System for Pejabat Daerah Kampar
                </CardDescription>
              </motion.div>
            </CardHeader>
            
            <CardContent className="pb-2">
              <motion.form 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                onSubmit={handleLogin} 
                className="space-y-5"
              >
                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <motion.div
                      whileHover={{ x: 5 }}
                      transition={{ type: "spring", stiffness: 400, damping: 10 }}
                    >
                      <Label htmlFor="email" className="text-xs font-medium text-gray-800 flex items-center gap-1.5">
                        <Mail className="h-3.5 w-3.5 text-amber-500" />
                        Email Address
                      </Label>
                    </motion.div>
                    <motion.div 
                      whileHover={{ scale: 1.01 }} 
                      whileTap={{ scale: 0.99 }}
                      className="relative"
                    >
                      <Input
                        id="email"
                        type="email"
                        placeholder="you@company.com"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        autoComplete="email"
                        required
                        className="h-10 text-sm border-gray-400 focus:border-amber-300 focus:ring-amber-300 transition-all duration-300 pl-10"
                      />
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    </motion.div>
                  </div>

                  <div className="space-y-1.5">
                    <motion.div
                      whileHover={{ x: 5 }}
                      transition={{ type: "spring", stiffness: 400, damping: 10 }}
                    >
                      <Label htmlFor="password" className="text-xs font-medium text-gray-800 flex items-center gap-1.5">
                        <Lock className="h-3.5 w-3.5 text-amber-500" />
                        Password
                      </Label>
                    </motion.div>
                    <motion.div 
                      whileHover={{ scale: 1.01 }} 
                      whileTap={{ scale: 0.99 }}
                      className="relative"
                    >
                      <Input
                        id="password"
                        type="password"
                        placeholder="Enter your password"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        autoComplete="current-password"
                        required
                        className="h-10 text-sm border-gray-400 focus:border-amber-300 focus:ring-amber-300 transition-all duration-300 pl-10"
                      />
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    </motion.div>
                  </div>
                </div>

                {error && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="p-2 text-sm bg-red-50 border border-red-300 rounded-lg"
                  >
                    <p className="text-xs text-red-700 flex items-center gap-2">
                      <motion.svg
                        animate={{ rotate: [0, 10, -10, 0] }}
                        transition={{ duration: 0.5 }}
                        className="h-3.5 w-3.5"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </motion.svg>
                      {error}
                    </p>
                  </motion.div>
                )}

                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.8 }}
                >
                  <Button 
                    type="submit" 
                    className="w-full h-10 text-sm bg-gradient-to-r from-gray-900 to-black hover:from-gray-800 hover:to-gray-900 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 relative overflow-hidden group"
                    disabled={loading}
                  >
                    {/* Button shine effect */}
                    <motion.div
                      initial={{ x: "-100%" }}
                      animate={{ x: "100%" }}
                      transition={{ 
                        duration: 1.5,
                        repeat: Infinity,
                        delay: 2
                      }}
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                    />
                    
                    {loading ? (
                      <div className="flex items-center justify-center gap-1.5 relative z-10">
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        >
                          <Spinner className="h-4 w-4" />
                        </motion.div>
                        <span>Signing in...</span>
                      </div>
                    ) : (
                      <span className="flex items-center justify-center gap-1.5 relative z-10">
                        <motion.div
                          whileHover={{ rotate: 90 }}
                          transition={{ type: "spring" }}
                        >
                          <Lock className="h-3.5 w-3.5" />
                        </motion.div>
                        Sign In
                      </span>
                    )}
                  </Button>
                </motion.div>
              </motion.form>
            </CardContent>
            
            <CardFooter className="border-t border-gray-300 pt-4 pb-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
                className="w-full text-center"
              >
                <p className="text-xs text-gray-700 font-medium">
                  Integrated Computerized Asset Management System
                </p>
                <p className="text-xs text-gray-600 mt-0.5">
                  Negeri Perak Darul Ridzuan
                </p>
              </motion.div>
            </CardFooter>
          </Card>
        </motion.div>

        {/* Footer note with animation */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2 }}
          className="mt-4 text-center"
        >
          <p className="text-xs text-gray-700 flex items-center justify-center gap-1">
            <motion.div
              animate={{ 
                scale: [1, 1.2, 1],
                rotate: [0, 10, 0]
              }}
              transition={{ 
                duration: 2,
                repeat: Infinity,
                delay: 1.5
              }}
            >
              <Shield className="h-3.5 w-3.5 text-amber-500" />
            </motion.div>
            Secured by{' '}
            <span className="font-semibold bg-gradient-to-r from-gray-900 via-amber-500 to-amber-300 bg-clip-text text-transparent">
              Perak State Security
            </span>
          </p>
        </motion.div>
      </motion.div>

      {/* Add custom styles for animations */}
      <style jsx global>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(5deg); }
        }
        
        @keyframes pulse-glow {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.6; }
        }
        
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        
        .animate-pulse-glow {
          animation: pulse-glow 4s ease-in-out infinite;
        }
      `}</style>
    </div>
  )
}