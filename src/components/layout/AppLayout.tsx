import { Link, Outlet } from "react-router-dom";

export function AppLayout() {
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
      </aside>

      <main>
        <Outlet />
      </main>
    </div>
  );
}