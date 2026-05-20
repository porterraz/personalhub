import { DashboardGrid } from "@/components/dashboard/DashboardGrid";

export default function DashboardPage() {
  return (
    <main className="min-h-screen bg-[#0c0c0f] text-zinc-100">
      <header className="border-b border-zinc-800/80 bg-zinc-950/80 px-6 py-5 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-widest text-indigo-400">
              Personal OS
            </p>
            <h1 className="text-2xl font-bold tracking-tight">Command Center</h1>
          </div>
          <p className="text-sm text-zinc-500">
            {new Date().toLocaleDateString("en-US", {
              weekday: "long",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-4 p-6 md:grid-cols-2 lg:grid-cols-3">
        <DashboardGrid />
      </div>
    </main>
  );
}
