import React, { useState } from "react";
import { toast } from "sonner";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch("http://localhost:8080/api/Auth/login", {
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
    <div className="min-h-screen bg-[#0B0F17] text-white flex items-center justify-center relative overflow-hidden font-sans">
      
      {/* GRID BACKGROUND */}
      <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.04)_1px,transparent_1px)] [background-size:18px_18px]" />

      {/* LIGHT EFFECT */}
      <div className="absolute w-[500px] h-[500px] bg-blue-500/10 blur-[120px] rounded-full top-1/3 left-1/4" />

      {/* CARD */}
      <div className="relative z-10 w-full max-w-md px-6">
        <div className="bg-[#111827]/80 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl flex flex-col gap-6">
          
          {/* HEADER */}
          <div className="text-center flex flex-col items-center gap-2">
            <div className="w-14 h-14 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
              <span className="material-symbols-outlined text-blue-400 text-3xl">
                precision_manufacturing
              </span>
            </div>

            <h1 className="text-xl font-semibold tracking-tight">
              LabControll 4.0
            </h1>

            <p className="text-sm text-gray-400">
              Industrial Monitoring Platform
            </p>
          </div>

          {/* FORM */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">

            {/* EMAIL */}
            <div>
              <label className="text-xs text-gray-400 uppercase tracking-wider">
                Email
              </label>

              <input
                type="email"
                placeholder="admin@labcontrol.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
              />
            </div>

            {/* PASSWORD */}
            <div>
              <div className="flex justify-between items-center">
                <label className="text-xs text-gray-400 uppercase tracking-wider">
                  Password
                </label>

                <a href="#" className="text-xs text-blue-400 hover:underline">
                  Forgot?
                </a>
              </div>

              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
              />
            </div>

            {/* BUTTON */}
            <button
              type="submit"
              disabled={loading}
              className="mt-4 w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 transition-all rounded-lg py-3 font-medium flex items-center justify-center gap-2 shadow-lg hover:shadow-blue-500/20"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          {/* FOOTER */}
          <div className="text-center text-sm text-gray-400">
            Don’t have an account?{" "}
            <a href="#" className="text-blue-400 hover:underline">
              Create one
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}