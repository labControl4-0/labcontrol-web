import MachineStatusDot, { type MachineStatus } from "./MachineStatusDot";

const items: { status: MachineStatus; label: string }[] = [
  { status: "running", label: "Running" },
  { status: "warning", label: "Warning" },
  { status: "stopped", label: "Stopped" },
];

const StatusLegend = () => {
  return (
    <ul aria-label="Machine status legend" className="flex flex-wrap gap-5 text-[13px] text-gray-300">
      {items.map((item) => (
        <li key={item.status} className="flex items-center gap-2">
          <MachineStatusDot status={item.status} size="sm" />
          {item.label}
        </li>
      ))}
    </ul>
  );
};

export default StatusLegend;
