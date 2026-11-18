import { cn } from "@/lib/utils";
import MachineStatusDot, { type MachineStatus } from "./MachineStatusDot";

interface IllustrationMachine {
  status: MachineStatus;
  left: string;
  top: string;
}

interface IllustrationSector {
  name: string;
  machines: IllustrationMachine[];
}

// Static decoration for the sign-in screen, not real plant data
const sectors: IllustrationSector[] = [
  {
    name: "Sector 1",
    machines: [
      { status: "running", left: "30%", top: "40%" },
      { status: "running", left: "62%", top: "70%" },
    ],
  },
  {
    name: "Sector 2",
    machines: [
      { status: "warning", left: "45%", top: "35%" },
      { status: "running", left: "25%", top: "72%" },
    ],
  },
  {
    name: "Sector 3",
    machines: [{ status: "stopped", left: "55%", top: "50%" }],
  },
];

interface PlantIllustrationProps {
  className?: string;
}

const PlantIllustration = ({ className }: PlantIllustrationProps) => {
  return (
    <div
      role="img"
      aria-label="Floor plan illustration with three sectors and machines running, in warning and stopped"
      className={cn(
        "grid h-[300px] w-full max-w-[560px] grid-cols-3 rounded-md border-[1.5px] border-blue-300/45",
        className,
      )}
    >
      {sectors.map((sector, index) => (
        <div
          key={sector.name}
          className={cn(
            "relative p-3",
            index < sectors.length - 1 && "border-r border-dashed border-blue-300/35",
          )}
        >
          <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-blue-300">
            {sector.name}
          </span>
          {sector.machines.map((machine, machineIndex) => (
            <MachineStatusDot
              key={machineIndex}
              status={machine.status}
              className="absolute"
              style={{ left: machine.left, top: machine.top }}
            />
          ))}
        </div>
      ))}
    </div>
  );
};

export default PlantIllustration;
