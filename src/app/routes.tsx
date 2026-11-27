import { MyDataPage, PrivacyNoticePage } from "../features/privacy/PrivacyPages";
import { createBrowserRouter, createHashRouter, Navigate } from "react-router-dom";
import { isDesktop } from "../lib/platform/desktop";
import { AppLayout } from "../components/layout/AppLayout";
import { ProtectedRoute } from "../components/layout/ProtectedRoute";
import {
  AccountsRoute,
  CategoriesRoute,
  DashboardRoute,
  LoginRoute,
  MonthlySummaryRoute,
  RegisterRoute,
  RecurrencesRoute,
  TransactionsRoute,
  TransfersRoute,
} from "./lazy-pages";

const createRouter = isDesktop ? createHashRouter : createBrowserRouter;

export const router = createRouter([
  {
    path: "/",
    element: <Navigate to="/dashboard" replace />,
  },
  { path: "/privacy", element: <PrivacyNoticePage /> },
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
          { path: "/my-data", element: <MyDataPage /> },
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
            path: "/recurrences",
            element: <RecurrencesRoute />,
          },
          {
            path: "/transfers",
            element: <TransfersRoute />,
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
