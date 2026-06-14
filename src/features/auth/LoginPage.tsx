import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import { loginUser } from "./auth-service";
import { loginSchema, type LoginFormData } from "./auth-schemas";
import { useAuth } from "./use-auth";

export function LoginPage() {
  const { handleLoginSuccess } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const loginMutation = useMutation({
    mutationFn: loginUser,
    onSuccess: handleLoginSuccess,
  });

  function onSubmit(data: LoginFormData) {
    loginMutation.mutate(data);
  }

  return (
    <main>
      <h1>Login</h1>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div>
          <label>Email</label>
          <input type="email" {...register("email")} />
          {errors.email && <span>{errors.email.message}</span>}
        </div>

        <div>
          <label>Password</label>
          <input type="password" {...register("password")} />
          {errors.password && <span>{errors.password.message}</span>}
        </div>

        {loginMutation.isError && (
          <p>Invalid email or password.</p>
        )}

        <button type="submit" disabled={loginMutation.isPending}>
          {loginMutation.isPending ? "Signing in..." : "Sign in"}
        </button>
      </form>

      <p>
        Don't have an account? <Link to="/register">Create account</Link>
      </p>
    </main>
  );
}