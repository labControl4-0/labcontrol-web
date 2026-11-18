import type { CSSProperties } from "react";
import { cn } from "@/lib/utils";

export type MachineStatus = "running" | "warning" | "stopped";

interface MachineStatusDotProps {
  status: MachineStatus;
  size?: "sm" | "md";
  className?: string;
  style?: CSSProperties;
}

// "stopped" also differs in shape (hollow ring), not only in hue
const statusStyles: Record<MachineStatus, string> = {
  running: "bg-green-500",
  warning: "bg-amber-400",
  stopped: "border-2 border-red-400 bg-red-900",
};

const haloStyles: Record<MachineStatus, string> = {
  running: "shadow-[0_0_0_6px_rgba(34,197,94,0.18)]",
  warning: "shadow-[0_0_0_6px_rgba(251,191,36,0.2)]",
  stopped: "",
};

const MachineStatusDot = ({ status, size = "md", className, style }: MachineStatusDotProps) => {
  return (
    <span
      aria-hidden="true"
      style={style}
      className={cn(
        "block shrink-0 rounded-full",
        size === "md" ? cn("h-3.5 w-3.5", haloStyles[status]) : "h-2.5 w-2.5",
        statusStyles[status],
        className,
      )}
    />
  );
};

export default MachineStatusDot;
