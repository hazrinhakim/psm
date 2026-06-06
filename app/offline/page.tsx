import Link from "next/link"

export default function OfflinePage() {
  return (
    <main className="flex min-h-screen items-center justify-center p-6">
      <div className="w-full max-w-md rounded-3xl border border-border/70 bg-card/90 p-8 shadow-xl backdrop-blur">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          Offline
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-balance">
          Sambungan internet tidak tersedia
        </h1>
        <p className="mt-4 text-sm leading-6 text-muted-foreground">
          ICAMS masih boleh dibuka sebagai aplikasi, tetapi halaman yang belum
          pernah dilawati memerlukan sambungan internet untuk dimuatkan.
        </p>
        <div className="mt-6 flex gap-3">
          <Link
            href="/login"
            className="inline-flex h-11 items-center justify-center rounded-xl bg-primary px-5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
          >
            Cuba Semula
          </Link>
        </div>
      </div>
    </main>
  )
}
