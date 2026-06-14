import { Link, Outlet } from "react-router-dom";
import { useAuth } from "../../features/auth/use-auth";

export function AppLayout() {
  const { user, logout } = useAuth();

  return (
    <div>
      <aside>
        <h2>FinTrack</h2>

        <nav>
          <Link to="/dashboard">Dashboard</Link>
          <Link to="/accounts">Accounts</Link>
          <Link to="/categories">Categories</Link>
          <Link to="/transactions">Transactions</Link>
          <Link to="/reports/monthly-summary">Reports</Link>
        </nav>

        <button type="button" onClick={logout}>
          Logout
        </button>
      </aside>

      <main>
        <header>
          <span>{user?.name}</span>
        </header>

        <Outlet />
      </main>
    </div>
  );
}