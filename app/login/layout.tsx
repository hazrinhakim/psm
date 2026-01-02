"use client"

import { useEffect, useState } from 'react'

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [bubbles, setBubbles] = useState<Array<{id: number; x: number; size: number; duration: number; delay: number}>>([])

  useEffect(() => {
    // Generate bubbles only for bottom and middle areas
    const bottomBubbles = Array.from({ length: 8 }, (_, i) => ({
      id: i,
      x: Math.random() * 100, // Random horizontal position
      size: Math.random() * 40 + 10, // Size between 10-50px
      duration: Math.random() * 15 + 10, // Duration between 10-25s
      delay: Math.random() * 5 // Delay between 0-5s
    }))
    
    const middleBubbles = Array.from({ length: 4 }, (_, i) => ({
      id: i + 8,
      x: Math.random() * 100,
      size: Math.random() * 30 + 5, // Smaller bubbles for middle
      duration: Math.random() * 20 + 15, // Slower movement
      delay: Math.random() * 3
    }))
    
    setBubbles([...bottomBubbles, ...middleBubbles])
  }, [])

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-gradient-to-b from-slate-50 via-white to-slate-100">
      {/* Background Bubbles */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Bottom Area Bubbles */}
        {bubbles.slice(0, 8).map((bubble) => (
          <div
            key={bubble.id}
            className="absolute rounded-full bg-gradient-to-br from-gray-200 to-gray-400 border border-gray-300"
            style={{
              left: `${bubble.x}%`,
              bottom: '-50px', // Start below the screen
              width: `${bubble.size}px`,
              height: `${bubble.size}px`,
              animation: `rise-slow ${bubble.duration}s ease-in ${bubble.delay}s infinite`,
              opacity: Math.random() * 0.3 + 0.1 // Opacity between 0.1-0.4
            }}
          />
        ))}
        
        {/* Middle Area Bubbles */}
        {bubbles.slice(8).map((bubble) => (
          <div
            key={bubble.id}
            className="absolute rounded-full bg-gradient-to-br from-gray-100 to-gray-300 border border-gray-200"
            style={{
              left: `${bubble.x}%`,
              top: '40%', // Start around middle
              width: `${bubble.size}px`,
              height: `${bubble.size}px`,
              animation: `float-horizontal ${bubble.duration}s ease-in-out ${bubble.delay}s infinite`,
              opacity: Math.random() * 0.2 + 0.05 // Very subtle opacity
            }}
          />
        ))}
        
        {/* Subtle grid overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.02)_1px,transparent_1px)] bg-[size:3rem_3rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,black_40%,transparent_100%)]" />
      </div>

      {/* Content */}
      <div className="relative z-10 w-full px-4 py-10">
        {children}
      </div>

      <style jsx>{`
        @keyframes rise-slow {
          0% {
            transform: translateY(0) scale(1);
            opacity: 0.1;
          }
          10% {
            opacity: 0.3;
          }
          90% {
            opacity: 0.2;
          }
          100% {
            transform: translateY(-100vh) scale(0.8);
            opacity: 0;
          }
        }
        
        @keyframes float-horizontal {
          0%, 100% {
            transform: translateX(-20px) scale(1);
            opacity: 0.05;
          }
          50% {
            transform: translateX(20px) scale(1.1);
            opacity: 0.1;
          }
        }
      `}</style>
    </div>
  )
}
