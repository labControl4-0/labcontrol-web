import { describe, it, expect } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import PasswordInput from "@/components/auth/PasswordInput";

describe("PasswordInput", () => {
  it("hides the password by default", () => {
    render(<PasswordInput aria-label="Password" />);

    expect(screen.getByLabelText("Password")).toHaveAttribute("type", "password");
  });

  it("toggles password visibility with an accessible button", () => {
    render(<PasswordInput aria-label="Password" />);
    const input = screen.getByLabelText("Password");

    fireEvent.click(screen.getByRole("button", { name: "Show password" }));
    expect(input).toHaveAttribute("type", "text");

    fireEvent.click(screen.getByRole("button", { name: "Hide password" }));
    expect(input).toHaveAttribute("type", "password");
  });
});
