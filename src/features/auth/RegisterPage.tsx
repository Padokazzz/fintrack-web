import { useState } from "react";
import { EmailChallengeForm } from "./EmailChallengeForm";
import type { EmailChallenge } from "./types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { Alert } from "../../components/ui/Alert";
import { AuthShell } from "../../components/ui/AuthShell";
import { getApiErrorMessage } from "../../lib/api-error";
import { useLanguage } from "../../lib/i18n/useLanguage";
import { registerUser } from "./auth-service";
import { createRegisterSchema, type RegisterFormData } from "./auth-schemas";
import { useAuth } from "./use-auth";

export function RegisterPage() {
  const { handleLoginSuccess } = useAuth();
  const navigate = useNavigate();
  const [challenge, setChallenge] = useState<EmailChallenge | null>(null);
  const { t } = useLanguage();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(createRegisterSchema(t)),
  });

  const registerMutation = useMutation({
    mutationFn: registerUser,
    onSuccess: (result) => {
      if ("challengeId" in result) setChallenge(result);
      else handleLoginSuccess(result);
    },
  });

  function onSubmit(data: RegisterFormData) {
    registerMutation.mutate(data);
  }

  if (challenge) return <EmailChallengeForm challengeId={challenge.challengeId}
    onConfirmed={handleLoginSuccess} onBack={() => navigate("/login")} />;

  return (
    <AuthShell
      title={t.auth.createAccount}
      description={t.auth.createAccountDescription}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="text-sm font-medium text-slate-700">
            {t.auth.name}
          </label>
          <input
            type="text"
            autoComplete="name"
            {...register("name")}
            className="mt-1 h-10 w-full rounded-md border border-slate-200 px-3 text-sm outline-none focus:border-emerald-500"
          />
          {errors.name && (
            <p className="mt-1 text-sm text-rose-600">
              {errors.name.message}
            </p>
          )}
        </div>

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
            autoComplete="new-password"
            {...register("password")}
            className="mt-1 h-10 w-full rounded-md border border-slate-200 px-3 text-sm outline-none focus:border-emerald-500"
          />
          {errors.password && (
            <p className="mt-1 text-sm text-rose-600">
              {errors.password.message}
            </p>
          )}
        </div>

        <label className="grid gap-1 text-sm font-medium text-slate-700">
          {t.auth.confirmPassword}
          <input type="password" autoComplete="new-password" maxLength={100}
            {...register("confirmPassword")}
            className="rounded-lg border border-slate-300 px-3 py-2" />
          {errors.confirmPassword && <span role="alert" className="text-rose-700">{errors.confirmPassword.message}</span>}
        </label>

        {registerMutation.isError && (
          <Alert variant="error">
            {getApiErrorMessage(
              registerMutation.error,
              t.auth.registerError,
              t.auth.apiUnavailable,
            )}
          </Alert>
        )}

        <button
          type="submit"
          disabled={registerMutation.isPending}
          className="inline-flex h-10 w-full items-center justify-center rounded-md bg-emerald-600 px-4 text-sm font-medium text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {registerMutation.isPending
            ? t.auth.creatingAccount
            : t.auth.createAccount}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-500">
        {t.auth.alreadyHaveAccount}{" "}
        <Link className="font-medium text-emerald-700" to="/login">
          {t.auth.signIn}
        </Link>
      </p>
    </AuthShell>
  );
}
