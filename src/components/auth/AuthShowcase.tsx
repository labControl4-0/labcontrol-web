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
        "min-h-0 min-w-0 flex-col justify-between gap-8 border-r border-white/5 px-12 py-10 xl:px-14 xl:py-12",
        "bg-[#0B1220] bg-[linear-gradient(rgba(96,165,250,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(96,165,250,0.06)_1px,transparent_1px)] bg-[size:32px_32px]",
        className,
      )}
    >
      <BrandMark className="shrink-0" />

      {/* Shrinks with the window height and disappears when there is no room left */}
      <PlantIllustration className="h-auto min-h-[160px] max-h-[300px] flex-1 [@media(max-height:600px)]:hidden" />

      <div className="flex max-w-[520px] shrink-0 flex-col gap-4">
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
