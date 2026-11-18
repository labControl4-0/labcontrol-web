import { describe, it, expect } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import AuthLayout from "@/components/auth/AuthLayout";
import LoginPage from "@/pages/Login";
import RegisterPage from "@/pages/Register";

const renderAuthRoutes = (path: string) =>
  render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route element={<AuthLayout />}>
          <Route path="/" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Route>
      </Routes>
    </MemoryRouter>,
  );

describe("AuthLayout", () => {
  it("keeps the brand name out of browser translation", () => {
    renderAuthRoutes("/");

    for (const brand of screen.getAllByText("LabControl 4.0")) {
      expect(brand.closest("[translate='no']")).not.toBeNull();
    }
  });

  it("keeps the same showcase mounted when switching between sign-in and sign-up", () => {
    renderAuthRoutes("/");
    const showcase = screen.getByRole("region", { name: "About LabControl" });

    fireEvent.click(screen.getByRole("link", { name: "Create one" }));
    expect(screen.getByRole("heading", { name: "Create your account" })).toBeInTheDocument();
    expect(screen.getByRole("region", { name: "About LabControl" })).toBe(showcase);

    fireEvent.click(screen.getByRole("link", { name: "Sign in" }));
    expect(screen.getByRole("heading", { name: "Sign in" })).toBeInTheDocument();
    expect(screen.getByRole("region", { name: "About LabControl" })).toBe(showcase);
  });
});
