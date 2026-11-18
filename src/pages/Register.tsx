import React, { useState } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import AuthLayout from "@/components/auth/AuthLayout";
import FormError from "@/components/auth/FormError";
import PasswordInput from "@/components/auth/PasswordInput";
import { authInputClassName } from "@/components/auth/authStyles";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (loading) return;
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/Auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "*/*",
        },
        body: JSON.stringify({
          name,
          email,
          password,
        }),
      });

      if (!response.ok) {
        throw new Error("Invalid credentials");
      }

      // The register endpoint returns the user without a token: sign-in happens on the login screen
      toast.success("Sign Up successful!");

      
      window.location.href = "/";

    } catch (error) {
      console.error(error);
      setError("We couldn't create your account. Check your details or try another email.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <header className="flex flex-col gap-1.5">
        <h1 className="text-[28px] font-bold tracking-tight">Create your account</h1>
        <p className="text-sm text-gray-400">Fill in your details to get started.</p>
      </header>

      <form onSubmit={handleSubmit} className="flex flex-col gap-[18px] [@media(max-height:640px)]:gap-3.5">
        <div className="flex flex-col gap-2">
          <label htmlFor="name" className="text-[13px] font-medium text-gray-300">
            Name
          </label>
          <input
            id="name"
            name="name"
            type="text"
            autoComplete="name"
            required
            placeholder="Your full name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            aria-describedby={error ? "register-error" : undefined}
            className={authInputClassName}
          />
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="email" className="text-[13px] font-medium text-gray-300">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            placeholder="name@company.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            aria-describedby={error ? "register-error" : undefined}
            className={authInputClassName}
          />
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="password" className="text-[13px] font-medium text-gray-300">
            Password
          </label>
          <PasswordInput
            id="password"
            name="password"
            autoComplete="new-password"
            required
            placeholder="Create a password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            aria-describedby={error ? "register-error" : undefined}
            className={authInputClassName}
          />
        </div>

        {error && <FormError id="register-error" message={error} />}

        <button
          type="submit"
          disabled={loading}
          aria-busy={loading}
          className="mt-1.5 flex h-12 items-center justify-center gap-2 rounded-[10px] bg-blue-600 text-[15px] font-semibold text-white transition hover:bg-blue-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#111827] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
          {loading ? "Creating account..." : "Create account"}
        </button>
      </form>

      <p className="text-sm text-gray-400">
        Already have an account?{" "}
        <a href="/" className="text-blue-400 hover:text-blue-300 hover:underline">
          Sign in
        </a>
      </p>
    </AuthLayout>
  );
}
