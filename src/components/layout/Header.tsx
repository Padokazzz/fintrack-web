import { LogOut } from "lucide-react";
import { useAuth } from "../../features/auth/use-auth";

export function Header() {
  const { user, logout } = useAuth();

  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-slate-200 bg-white px-6">
      <div>
        <p className="text-sm font-medium text-slate-950">
          {user?.name || "User"}
        </p>
        <p className="text-xs text-slate-500">{user?.email}</p>
      </div>

      <button
        type="button"
        onClick={logout}
        className="inline-flex h-9 items-center gap-2 rounded-md border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
      >
        <LogOut className="h-4 w-4" />
        Logout
      </button>
    </header>
  );
}