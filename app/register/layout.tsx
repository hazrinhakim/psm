"use client"

import { useEffect, useState } from 'react'

export default function RegisterLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [bubbles, setBubbles] = useState<
    Array<{ id: number; x: number; size: number; duration: number; delay: number }>
  >([])

  useEffect(() => {
    const bottomBubbles = Array.from({ length: 8 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      size: Math.random() * 40 + 10,
      duration: Math.random() * 15 + 10,
      delay: Math.random() * 5,
    }))

    const middleBubbles = Array.from({ length: 4 }, (_, i) => ({
      id: i + 8,
      x: Math.random() * 100,
      size: Math.random() * 30 + 5,
      duration: Math.random() * 20 + 15,
      delay: Math.random() * 3,
    }))

    setBubbles([...bottomBubbles, ...middleBubbles])
  }, [])

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-gradient-to-b from-slate-50 via-white to-slate-100">
      <div className="absolute inset-0 overflow-hidden">
        {bubbles.slice(0, 8).map(bubble => (
          <div
            key={bubble.id}
            className="absolute rounded-full bg-gradient-to-br from-gray-200 to-gray-400 border border-gray-300"
            style={{
              left: `${bubble.x}%`,
              bottom: '-50px',
              width: `${bubble.size}px`,
              height: `${bubble.size}px`,
              animation: `rise-slow ${bubble.duration}s ease-in ${bubble.delay}s infinite`,
              opacity: Math.random() * 0.3 + 0.1,
            }}
          />
        ))}

        {bubbles.slice(8).map(bubble => (
          <div
            key={bubble.id}
            className="absolute rounded-full bg-gradient-to-br from-gray-100 to-gray-300 border border-gray-200"
            style={{
              left: `${bubble.x}%`,
              top: '40%',
              width: `${bubble.size}px`,
              height: `${bubble.size}px`,
              animation: `float-horizontal ${bubble.duration}s ease-in-out ${bubble.delay}s infinite`,
              opacity: Math.random() * 0.2 + 0.05,
            }}
          />
        ))}

        <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.02)_1px,transparent_1px)] bg-[size:3rem_3rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,black_40%,transparent_100%)]" />
      </div>

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
