import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";
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
    <main>
      <h1>Create account</h1>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div>
          <label>Name</label>
          <input type="text" {...register("name")} />
          {errors.name && <span>{errors.name.message}</span>}
        </div>

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

        {registerMutation.isError && (
          <p>Could not create account. Try another email.</p>
        )}

        <button type="submit" disabled={registerMutation.isPending}>
          {registerMutation.isPending ? "Creating account..." : "Create account"}
        </button>
      </form>

      <p>
        Already have an account? <Link to="/login">Sign in</Link>
      </p>
    </main>
  );
}