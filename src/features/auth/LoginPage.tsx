import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import { Alert } from "../../components/ui/Alert";
import { AuthShell } from "../../components/ui/AuthShell";
import { useLanguage } from "../../lib/i18n/useLanguage";
import { loginUser } from "./auth-service";
import { createLoginSchema, type LoginFormData } from "./auth-schemas";
import { useAuth } from "./use-auth";

export function LoginPage() {
  const { handleLoginSuccess } = useAuth();
  const { t } = useLanguage();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(createLoginSchema(t)),
  });

  const loginMutation = useMutation({
    mutationFn: loginUser,
    onSuccess: handleLoginSuccess,
  });

  function onSubmit(data: LoginFormData) {
    loginMutation.mutate(data);
  }

  return (
    <AuthShell
      title={t.auth.signIn}
      description={t.auth.signInDescription}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="text-sm font-medium text-slate-700">
            {t.auth.email}
          </label>
          <input
            type="email"
            autoComplete="email"
            {...register("email")}
            className="mt-1 h-10 w-full rounded-md border border-slate-200 px-3 text-sm outline-none focus:border-emerald-500"
          />
          {errors.email && (
            <p className="mt-1 text-sm text-rose-600">
              {errors.email.message}
            </p>
          )}
        </div>

        <div>
          <label className="text-sm font-medium text-slate-700">
            {t.auth.password}
          </label>
          <input
            type="password"
            autoComplete="current-password"
            {...register("password")}
            className="mt-1 h-10 w-full rounded-md border border-slate-200 px-3 text-sm outline-none focus:border-emerald-500"
          />
          {errors.password && (
            <p className="mt-1 text-sm text-rose-600">
              {errors.password.message}
            </p>
          )}
        </div>

        {loginMutation.isError && (
          <Alert variant="error">{t.auth.invalidCredentials}</Alert>
        )}

        <button
          type="submit"
          disabled={loginMutation.isPending}
          className="inline-flex h-10 w-full items-center justify-center rounded-md bg-emerald-600 px-4 text-sm font-medium text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loginMutation.isPending ? t.auth.signingIn : t.auth.signIn}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-500">
        {t.auth.noAccount}{" "}
        <Link className="font-medium text-emerald-700" to="/register">
          {t.auth.createAccount}
        </Link>
      </p>
    </AuthShell>
  );
}
