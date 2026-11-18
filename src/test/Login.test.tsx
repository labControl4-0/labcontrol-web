import { afterEach, describe, it, expect, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LoginPage from "@/pages/Login";

const fillAndSubmit = () => {
  fireEvent.change(screen.getByLabelText("Email"), { target: { value: "user@example.com" } });
  fireEvent.change(screen.getByLabelText("Password"), { target: { value: "example-password" } });
  fireEvent.click(screen.getByRole("button", { name: /sign in/i }));
};

describe("LoginPage", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("renders labeled email and password fields", () => {
    render(<LoginPage />, { wrapper: MemoryRouter });

    expect(screen.getByLabelText("Email")).toHaveAttribute("autocomplete", "email");
    expect(screen.getByLabelText("Password")).toHaveAttribute("autocomplete", "current-password");
  });

  it("shows loading and sends the request only once", () => {
    const fetchMock = vi.fn(() => new Promise<Response>(() => {}));
    vi.stubGlobal("fetch", fetchMock);
    render(<LoginPage />, { wrapper: MemoryRouter });

    fillAndSubmit();
    const button = screen.getByRole("button", { name: /signing in/i });
    expect(button).toBeDisabled();

    fireEvent.submit(button.closest("form")!);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("shows an inline error when the credentials are rejected", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => ({ ok: false }) as Response));
    vi.spyOn(console, "error").mockImplementation(() => {});
    render(<LoginPage />, { wrapper: MemoryRouter });

    fillAndSubmit();

    expect(await screen.findByRole("alert")).toHaveTextContent("Invalid email or password");
    expect(screen.getByLabelText("Email")).toHaveAttribute("aria-invalid", "true");
    expect(screen.getByRole("button", { name: /sign in/i })).toBeEnabled();
  });

  it("does not log the login response", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => ({ ok: true, json: async () => ({ token: "synthetic-token" }) }) as Response),
    );
    vi.spyOn(console, "error").mockImplementation(() => {});
    const logSpy = vi.spyOn(console, "log").mockImplementation(() => {});
    render(<LoginPage />, { wrapper: MemoryRouter });

    fillAndSubmit();

    await vi.waitFor(() => expect(localStorage.getItem("token")).toBe("synthetic-token"));
    expect(logSpy).not.toHaveBeenCalled();
  });
});
