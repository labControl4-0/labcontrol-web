import { afterEach, describe, it, expect, vi } from "vitest";
import { act, render, renderHook, screen } from "@testing-library/react";
import { useStatusCycle } from "@/hooks/use-status-cycle";
import PasswordStrength from "@/components/auth/PasswordStrength";
import { strengthLevel } from "@/components/auth/passwordScore";
import { computeKpis, INITIAL_STATUSES, STATUS_CYCLE } from "@/components/auth/plantMock";

describe("plant mock", () => {
  it("returns to the initial statuses after a full cycle", () => {
    const statuses = { ...INITIAL_STATUSES };
    for (const event of STATUS_CYCLE) statuses[event.machineId] = event.status;

    expect(statuses).toEqual(INITIAL_STATUSES);
  });

  it("derives KPIs from machine statuses", () => {
    const allRunning = computeKpis({ a: "running", b: "running" });
    const oneStopped = computeKpis({ a: "running", b: "stopped" });

    expect(allRunning.activeAlerts).toBe(0);
    expect(oneStopped.activeAlerts).toBe(1);
    expect(oneStopped.energyKw).toBeLessThan(allRunning.energyKw);
    expect(oneStopped.oee).toBeLessThan(allRunning.oee);
  });
});

describe("useStatusCycle", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("applies the next event on every interval", () => {
    vi.useFakeTimers();
    const { result } = renderHook(() => useStatusCycle(INITIAL_STATUSES, STATUS_CYCLE, true, 8000));

    act(() => vi.advanceTimersByTime(8000));

    const first = STATUS_CYCLE[0];
    expect(result.current.step).toBe(1);
    expect(result.current.lastEvent).toEqual(first);
    expect(result.current.statuses[first.machineId]).toBe(first.status);
  });

  it("stays still while disabled", () => {
    vi.useFakeTimers();
    const { result } = renderHook(() => useStatusCycle(INITIAL_STATUSES, STATUS_CYCLE, false, 8000));

    act(() => vi.advanceTimersByTime(24000));

    expect(result.current.step).toBe(0);
    expect(result.current.statuses).toEqual(INITIAL_STATUSES);
  });
});

describe("password strength", () => {
  it("grades passwords as weak, fair or strong", () => {
    expect(strengthLevel("abc")).toBe("weak");
    expect(strengthLevel("Password1")).toBe("fair");
    expect(strengthLevel("Example-Pass-2026")).toBe("strong");
  });

  it("announces the level and hides when the password is empty", () => {
    const { rerender } = render(<PasswordStrength id="strength" password="" />);
    expect(screen.queryByText(/password strength/i)).not.toBeInTheDocument();

    rerender(<PasswordStrength id="strength" password="Example-Pass-2026" />);
    expect(screen.getByText(/password strength/i).parentElement).toHaveTextContent("Strong");
  });
});
