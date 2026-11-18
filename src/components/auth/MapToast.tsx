import { useEffect, useState } from "react";
import MachineStatusDot, { type MachineStatus } from "./MachineStatusDot";

interface MapToastProps {
  event: { machineId: string; status: MachineStatus; message: string } | null;
  // Changes on every new event so the same message can show again
  eventKey: number;
  durationMs?: number;
}

// Decorative: the map's accessible label already describes the current state
const MapToast = ({ event, eventKey, durationMs = 3500 }: MapToastProps) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!event) return;
    setVisible(true);
    const id = window.setTimeout(() => setVisible(false), durationMs);
    return () => window.clearTimeout(id);
  }, [event, eventKey, durationMs]);

  if (!event) return null;

  return (
    <div
      key={eventKey}
      aria-hidden="true"
      className="auth-card-in absolute right-3 top-3"
    >
      <div
        className="auth-layer flex items-center gap-2 rounded-md border border-white/10 bg-[#0B0F17]/90 px-2.5 py-1.5 text-xs text-gray-200 shadow-lg"
        style={{ opacity: visible ? 1 : 0 }}
      >
        <MachineStatusDot status={event.status} size="sm" />
        <span className="font-mono">{event.machineId}</span>
        <span className="text-gray-400">· {event.message}</span>
      </div>
    </div>
  );
};

export default MapToast;
