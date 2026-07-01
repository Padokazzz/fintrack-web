import { lazy, Suspense } from "react";
import { PageLoader } from "../components/ui/PageLoader";

const LoginPage = lazy(() =>
  import("../features/auth/LoginPage").then((module) => ({
    default: module.LoginPage,
  }))
);

const RegisterPage = lazy(() =>
  import("../features/auth/RegisterPage").then((module) => ({
    default: module.RegisterPage,
  }))
);

const DashboardPage = lazy(() =>
  import("../features/summaries/DashboardPage").then((module) => ({
    default: module.DashboardPage,
  }))
);

const AccountsPage = lazy(() =>
  import("../features/accounts/AccountsPage").then((module) => ({
    default: module.AccountsPage,
  }))
);

const CategoriesPage = lazy(() =>
  import("../features/categories/CategoriesPage").then((module) => ({
    default: module.CategoriesPage,
  }))
);

const TransactionsPage = lazy(() =>
  import("../features/transactions/TransactionsPage").then((module) => ({
    default: module.TransactionsPage,
  }))
);

const MonthlySummaryPage = lazy(() =>
  import("../features/summaries/MonthlySummaryPage").then((module) => ({
    default: module.MonthlySummaryPage,
  }))
);

function LazyPage({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={<PageLoader />}>{children}</Suspense>;
}

export function LoginRoute() {
  return (
    <LazyPage>
      <LoginPage />
    </LazyPage>
  );
}

export function RegisterRoute() {
  return (
    <LazyPage>
      <RegisterPage />
    </LazyPage>
  );
}

export function DashboardRoute() {
  return (
    <LazyPage>
      <DashboardPage />
    </LazyPage>
  );
}

export function AccountsRoute() {
  return (
    <LazyPage>
      <AccountsPage />
    </LazyPage>
  );
}

export function CategoriesRoute() {
  return (
    <LazyPage>
      <CategoriesPage />
    </LazyPage>
  );
}

export function TransactionsRoute() {
  return (
    <LazyPage>
      <TransactionsPage />
    </LazyPage>
  );
}

export function MonthlySummaryRoute() {
  return (
    <LazyPage>
      <MonthlySummaryPage />
    </LazyPage>
  );
}
