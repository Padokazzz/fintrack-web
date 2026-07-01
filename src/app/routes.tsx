import { createBrowserRouter, Navigate } from "react-router-dom";
import { AppLayout } from "../components/layout/AppLayout";
import { ProtectedRoute } from "../components/layout/ProtectedRoute";
import {
  AccountsRoute,
  CategoriesRoute,
  DashboardRoute,
  LoginRoute,
  MonthlySummaryRoute,
  RegisterRoute,
  TransactionsRoute,
} from "./lazy-pages";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Navigate to="/dashboard" replace />,
  },
  {
    path: "/login",
    element: <LoginRoute />,
  },
  {
    path: "/register",
    element: <RegisterRoute />,
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppLayout />,
        children: [
          {
            path: "/dashboard",
            element: <DashboardRoute />,
          },
          {
            path: "/accounts",
            element: <AccountsRoute />,
          },
          {
            path: "/categories",
            element: <CategoriesRoute />,
          },
          {
            path: "/transactions",
            element: <TransactionsRoute />,
          },
          {
            path: "/reports/monthly-summary",
            element: <MonthlySummaryRoute />,
          },
        ],
      },
    ],
  },
]);
