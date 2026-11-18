import React, { useState } from "react";
import { toast } from "sonner";
import AuthLayout from "@/components/auth/AuthLayout";
import PasswordInput from "@/components/auth/PasswordInput";

const inputClassName =
  "autofill-dark h-12 w-full rounded-[10px] border border-gray-700 bg-[#0B0F17] px-3.5 text-[15px] text-white placeholder:text-gray-500 transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch("/api/Auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "*/*",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      if (!response.ok) {
        throw new Error("Invalid credentials");
      }

      const data = await response.json();

      console.log("Login success:", data);

      localStorage.setItem("token", data.token);

      toast.success("Login successful!");


      window.location.href = "/plants";

    } catch (error) {
      console.error(error);
      toast.error("Login failed. Check email or password.");
    }
  };

  return (
    <AuthLayout>
      <header className="flex flex-col gap-1.5">
        <h1 className="text-[28px] font-bold tracking-tight">Sign in</h1>
        <p className="text-sm text-gray-400">Use the email registered with your company.</p>
      </header>

      <form onSubmit={handleSubmit} className="flex flex-col gap-[18px]">
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
            className={inputClassName}
          />
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex items-baseline justify-between">
            <label htmlFor="password" className="text-[13px] font-medium text-gray-300">
              Password
            </label>
            <a href="#" className="text-[13px] text-blue-400 hover:text-blue-300 hover:underline">
              Forgot password?
            </a>
          </div>
          <PasswordInput
            id="password"
            name="password"
            autoComplete="current-password"
            required
            placeholder="Your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={inputClassName}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="mt-1.5 flex h-12 items-center justify-center gap-2 rounded-[10px] bg-blue-600 text-[15px] font-semibold text-white transition hover:bg-blue-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#111827] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Signing in..." : "Sign in"}
        </button>
      </form>

      <p className="text-sm text-gray-400">
        Don’t have an account?{" "}
        <a href="/register" className="text-blue-400 hover:text-blue-300 hover:underline">
          Create one
        </a>
      </p>
    </AuthLayout>
  );
}
