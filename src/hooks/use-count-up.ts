import * as React from "react";

// Animates a number from its previous value to `target`; jumps straight to it when disabled
export function useCountUp(target: number, enabled: boolean, durationMs = 800) {
  const [value, setValue] = React.useState(enabled ? 0 : target);
  const valueRef = React.useRef(value);

  React.useEffect(() => {
    if (!enabled) {
      valueRef.current = target;
      setValue(target);
      return;
    }

    const from = valueRef.current;
    const start = performance.now();
    let frame = 0;

    const tick = (now: number) => {
      const progress = Math.min((now - start) / durationMs, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const next = Math.round(from + (target - from) * eased);
      valueRef.current = next;
      setValue(next);
      if (progress < 1) frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [target, enabled, durationMs]);

  return value;
}
