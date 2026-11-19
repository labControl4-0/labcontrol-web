import * as React from "react";

export interface CycleEvent<S> {
  machineId: string;
  status: S;
}

interface CycleState<S, E extends CycleEvent<S>> {
  statuses: Record<string, S>;
  step: number;
  lastEvent: E | null;
}

// Applies the next event every `intervalMs` while enabled; `step` counts applied events
export function useStatusCycle<S, E extends CycleEvent<S>>(
  initial: Record<string, S>,
  cycle: E[],
  enabled: boolean,
  intervalMs = 8000,
) {
  const [state, setState] = React.useState<CycleState<S, E>>({
    statuses: initial,
    step: 0,
    lastEvent: null,
  });

  React.useEffect(() => {
    if (!enabled || cycle.length === 0) return;

    const id = window.setInterval(() => {
      setState((current) => {
        const event = cycle[current.step % cycle.length];
        return {
          statuses: { ...current.statuses, [event.machineId]: event.status },
          step: current.step + 1,
          lastEvent: event,
        };
      });
    }, intervalMs);

    return () => window.clearInterval(id);
  }, [cycle, enabled, intervalMs]);

  return state;
}
