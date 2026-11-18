import { useMemo } from "react";
import { cn } from "@/lib/utils";
import { usePageVisible } from "@/hooks/use-page-visible";
import { usePrefersReducedMotion } from "@/hooks/use-reduced-motion";
import { useStatusCycle } from "@/hooks/use-status-cycle";
import BrandMark from "./BrandMark";
import KpiStrip from "./KpiStrip";
import MapToast from "./MapToast";
import PlantMap from "./PlantMap";
import StatusLegend from "./StatusLegend";
import { computeKpis, INITIAL_STATUSES, STATUS_CYCLE } from "./plantMock";

interface AuthShowcaseProps {
  className?: string;
}

const AuthShowcase = ({ className }: AuthShowcaseProps) => {
  const reducedMotion = usePrefersReducedMotion();
  const visible = usePageVisible();
  // Status changes are a loop: off with reduced motion and while the tab is hidden
  const { statuses, step, lastEvent } = useStatusCycle(INITIAL_STATUSES, STATUS_CYCLE, !reducedMotion && visible);
  // Recomputed only when a status changes, so the sparklines get one point per change
  const kpis = useMemo(() => computeKpis(statuses), [statuses]);

  return (
    <section
      aria-label="About LabControl"
      className={cn(
        "min-h-0 min-w-0 flex-col justify-between gap-8 border-r border-white/5 px-12 py-10 xl:px-14 xl:py-12",
        // Short windows (e.g. 125%+ display scaling): tighter spacing leaves room for the plant
        "[@media(max-height:640px)]:gap-5 [@media(max-height:640px)]:py-6",
        "bg-[#0B1220] bg-[linear-gradient(rgba(96,165,250,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(96,165,250,0.06)_1px,transparent_1px)] bg-[size:32px_32px]",
        !visible && "auth-paused",
        className,
      )}
    >
      <BrandMark className="shrink-0" />

      {/* Fills the column width; shrinks with the window height and disappears when there is no room left */}
      <PlantMap
        statuses={statuses}
        className="min-h-[120px] max-h-[340px] flex-1 [@media(max-height:420px)]:hidden"
      >
        <MapToast event={lastEvent} eventKey={step} />
      </PlantMap>

      <KpiStrip kpis={kpis} animate={!reducedMotion} className="shrink-0 [@media(max-height:480px)]:hidden" />

      <div className="auth-fade-up flex max-w-[520px] shrink-0 flex-col gap-4" style={{ animationDelay: "0.6s" }}>
        <h2 className="text-[34px] font-bold leading-tight tracking-tight text-white [@media(max-height:640px)]:text-[28px]">
          Your plant, in real time.
        </h2>
        <p className="text-base leading-relaxed text-gray-400">
          Track machines, alerts and energy usage in one place.
        </p>
        <StatusLegend />
      </div>
    </section>
  );
};

export default AuthShowcase;
