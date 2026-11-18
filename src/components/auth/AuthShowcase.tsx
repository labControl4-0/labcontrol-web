import { cn } from "@/lib/utils";
import BrandMark from "./BrandMark";
import PlantIllustration from "./PlantIllustration";
import StatusLegend from "./StatusLegend";

interface AuthShowcaseProps {
  className?: string;
}

const AuthShowcase = ({ className }: AuthShowcaseProps) => {
  return (
    <section
      aria-label="About LabControl"
      className={cn(
        "min-w-0 flex-col justify-between gap-10 border-r border-white/5 px-14 py-12",
        "bg-[#0B1220] bg-[linear-gradient(rgba(96,165,250,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(96,165,250,0.06)_1px,transparent_1px)] bg-[size:32px_32px]",
        className,
      )}
    >
      <BrandMark />

      <PlantIllustration />

      <div className="flex max-w-[520px] flex-col gap-4">
        <h2 className="text-[34px] font-bold leading-tight tracking-tight text-white">
          Your plant, in real time.
        </h2>
        <p className="text-base leading-relaxed text-gray-400">
          Track machines, alerts and energy usage for every sector in one place.
        </p>
        <StatusLegend />
      </div>
    </section>
  );
};

export default AuthShowcase;
