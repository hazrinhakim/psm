// app/homepage/page.tsx
export default function Homepage() {
  return (
    <main className="min-h-screen bg-slate-50">
      <div className="max-w-5xl mx-auto px-4 py-10">
        <h1 className="text-3xl font-bold mb-4">
          Welcome to PuraArena Dashboard 👋
        </h1>

        <p className="text-slate-600 mb-6">
          This is your main page after login. Nanti kau boleh letak
          booking list, stats, etc kat sini.
        </p>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-xl border bg-white p-4 shadow-sm">
            <h2 className="font-semibold mb-1">Today&apos;s Bookings</h2>
            <p className="text-sm text-slate-500">
              Nanti fetch data booking kat sini.
            </p>
          </div>

          <div className="rounded-xl border bg-white p-4 shadow-sm">
            <h2 className="font-semibold mb-1">Courts</h2>
            <p className="text-sm text-slate-500">
              Futsal, badminton, tennis etc.
            </p>
          </div>

          <div className="rounded-xl border bg-white p-4 shadow-sm">
            <h2 className="font-semibold mb-1">Profile</h2>
            <p className="text-sm text-slate-500">
              Shortcut ke user / admin info.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
