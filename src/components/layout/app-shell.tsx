import { Bell, Building2, Command, Search, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <main className="water-canvas min-h-screen">
      <header className="sticky top-0 z-20 border-b border-cyan-100/70 bg-aqua/70 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <div className="water-gradient flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-primary-foreground shadow-sm shadow-cyan-900/20">
              <Building2 className="h-5 w-5" aria-hidden="true" />
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-teal-brand">Fresh Water Market</p>
              <h1 className="truncate text-lg font-bold text-primary">Operating System</h1>
            </div>
          </div>
          <div className="hidden min-w-72 items-center gap-2 rounded-xl border border-cyan-100 bg-white/80 px-3 py-2 md:flex">
            <Search className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
            <span className="text-sm text-muted-foreground">Search customers, orders, routes, invoices</span>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" aria-label="Command menu">
              <Command className="h-4 w-4" />
            </Button>
            <Button variant="ghost" aria-label="Notifications">
              <Bell className="h-4 w-4" />
            </Button>
            <Button variant="ghost" aria-label="Settings">
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>
      {children}
    </main>
  );
}
