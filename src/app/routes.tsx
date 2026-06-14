import { createBrowserRouter, Navigate } from "react-router-dom";
import { AppLayout } from "../components/layout/AppLayout";
import { ProtectedRoute } from "../components/layout/ProtectedRoute";
import { LoginPage } from "../features/auth/LoginPage";
import { RegisterPage } from "../features/auth/RegisterPage";
import { AccountsPage } from "../features/accounts/AccountsPage";
import { CategoriesPage } from "../features/categories/CategoriesPage";
import { TransactionsPage } from "../features/transactions/TransactionsPage";
import { DashboardPage } from "../features/summaries/DashboardPage";
import { MonthlySummaryPage } from "../features/summaries/MonthlySummaryPage";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Navigate to="/dashboard" replace />,
  },
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/register",
    element: <RegisterPage />,
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppLayout />,
        children: [
          {
            path: "/dashboard",
            element: <DashboardPage />,
          },
          {
            path: "/accounts",
            element: <AccountsPage />,
          },
          {
            path: "/categories",
            element: <CategoriesPage />,
          },
          {
            path: "/transactions",
            element: <TransactionsPage />,
          },
          {
            path: "/reports/monthly-summary",
            element: <MonthlySummaryPage />,
          },
        ],
      },
    ],
  },
]);