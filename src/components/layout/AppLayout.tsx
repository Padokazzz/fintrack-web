import { Outlet } from "react-router-dom";
import { useState } from "react";
import { Header } from "./Header";
import { Sidebar } from "./Sidebar";

export function AppLayout() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-[calc(100dvh_-_env(safe-area-inset-top)_-_env(safe-area-inset-bottom))] bg-slate-100 text-slate-950">
      <div className="flex min-h-[inherit]">
        <Sidebar
          isMobileOpen={isMobileMenuOpen}
          onMobileClose={() => setIsMobileMenuOpen(false)}
        />

        <div className="flex min-w-0 flex-1 flex-col">
          <Header menuOpen={isMobileMenuOpen} onMenuClick={() => setIsMobileMenuOpen(true)} />

          <main className="flex-1 px-4 py-4 sm:px-6 sm:py-6">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}
