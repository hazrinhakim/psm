"use client"

export default function RegisterLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[12%] top-[8%] h-64 w-64 rounded-full bg-primary/8 blur-3xl" />
        <div className="absolute bottom-[8%] right-[12%] h-72 w-72 rounded-full bg-amber-300/14 blur-3xl dark:bg-amber-200/8" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(100,116,139,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(100,116,139,0.06)_1px,transparent_1px)] bg-[size:80px_80px] opacity-40 [mask-image:radial-gradient(circle_at_center,black,transparent_76%)]" />
      </div>
      <div className="relative z-10 flex min-h-screen items-center justify-center px-4 py-10">
        {children}
      </div>
    </div>
  )
}
