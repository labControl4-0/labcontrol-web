import { afterEach, describe, it, expect, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import RegisterPage from "@/pages/Register";

const fillAndSubmit = () => {
  fireEvent.change(screen.getByLabelText("Name"), { target: { value: "Example User" } });
  fireEvent.change(screen.getByLabelText("Email"), { target: { value: "user@example.com" } });
  fireEvent.change(screen.getByLabelText("Password"), { target: { value: "example-password" } });
  fireEvent.click(screen.getByRole("button", { name: /create account/i }));
};

describe("RegisterPage", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
    localStorage.clear();
  });

  it("renders labeled fields with sign-up autocomplete hints", () => {
    render(<RegisterPage />, { wrapper: MemoryRouter });

    expect(screen.getByLabelText("Name")).toHaveAttribute("autocomplete", "name");
    expect(screen.getByLabelText("Email")).toHaveAttribute("autocomplete", "email");
    expect(screen.getByLabelText("Password")).toHaveAttribute("autocomplete", "new-password");
  });

  it("links back to the sign-in screen", () => {
    render(<RegisterPage />, { wrapper: MemoryRouter });

    expect(screen.getByRole("link", { name: "Sign in" })).toHaveAttribute("href", "/");
    expect(screen.queryByRole("link", { name: /forgot/i })).not.toBeInTheDocument();
  });

  it("shows loading and sends the request only once", () => {
    const fetchMock = vi.fn(() => new Promise<Response>(() => {}));
    vi.stubGlobal("fetch", fetchMock);
    render(<RegisterPage />, { wrapper: MemoryRouter });

    fillAndSubmit();
    const button = screen.getByRole("button", { name: /creating account/i });
    expect(button).toBeDisabled();

    fireEvent.submit(button.closest("form")!);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("shows an inline error when sign-up is rejected", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => ({ ok: false }) as Response));
    vi.spyOn(console, "error").mockImplementation(() => {});
    render(<RegisterPage />, { wrapper: MemoryRouter });

    fillAndSubmit();

    expect(await screen.findByRole("alert")).toHaveTextContent("We couldn't create your account");
    expect(screen.getByLabelText("Email")).toHaveAttribute("aria-describedby", "register-error");
    expect(screen.getByRole("button", { name: /create account/i })).toBeEnabled();
  });

  it("does not log the response or store a token after sign-up", async () => {
    const fetchMock = vi.fn(
      async () =>
        ({ ok: true, json: async () => ({ id: "1", name: "Example User", email: "user@example.com" }) }) as Response,
    );
    vi.stubGlobal("fetch", fetchMock);
    vi.spyOn(console, "error").mockImplementation(() => {});
    const logSpy = vi.spyOn(console, "log").mockImplementation(() => {});
    render(<RegisterPage />, { wrapper: MemoryRouter });

    fillAndSubmit();

    await vi.waitFor(() => expect(screen.getByRole("button", { name: /create account/i })).toBeEnabled());
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(localStorage.getItem("token")).toBeNull();
    expect(logSpy).not.toHaveBeenCalled();
  });
});
