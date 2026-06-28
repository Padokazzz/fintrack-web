import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import { Alert } from "../../components/ui/Alert";
import { AuthShell } from "../../components/ui/AuthShell";
import { getApiErrorMessage } from "../../lib/api-error";
import { registerUser } from "./auth-service";
import { registerSchema, type RegisterFormData } from "./auth-schemas";
import { useAuth } from "./use-auth";

export function RegisterPage() {
  const { handleLoginSuccess } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const registerMutation = useMutation({
    mutationFn: registerUser,
    onSuccess: handleLoginSuccess,
  });

  function onSubmit(data: RegisterFormData) {
    registerMutation.mutate(data);
  }

  return (
    <AuthShell
      title="Create account"
      description="Start tracking your accounts, categories, and transactions in one place."
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="text-sm font-medium text-slate-700">Name</label>
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
          <label className="text-sm font-medium text-slate-700">Email</label>
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
            Password
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

        {registerMutation.isError && (
          <Alert variant="error">
            {getApiErrorMessage(
              registerMutation.error,
              "Could not create account. Try another email."
            )}
          </Alert>
        )}

        <button
          type="submit"
          disabled={registerMutation.isPending}
          className="inline-flex h-10 w-full items-center justify-center rounded-md bg-emerald-600 px-4 text-sm font-medium text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {registerMutation.isPending ? "Creating account..." : "Create account"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-500">
        Already have an account?{" "}
        <Link className="font-medium text-emerald-700" to="/login">
          Sign in
        </Link>
      </p>
    </AuthShell>
  );
}
