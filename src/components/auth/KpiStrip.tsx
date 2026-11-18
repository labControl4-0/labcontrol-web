import { useEffect, useId, useState } from "react";
import { cn } from "@/lib/utils";
import { useCountUp } from "@/hooks/use-count-up";
import { KPI_HISTORY_SEED, type PlantKpis } from "./plantMock";

interface KpiStripProps {
  kpis: PlantKpis;
  animate: boolean;
  className?: string;
}

const HISTORY_LENGTH = 12;

const KPI_CONFIG: { key: keyof PlantKpis; label: string; unit: string; color: string }[] = [
  { key: "energyKw", label: "Energy", unit: " kW", color: "#60A5FA" },
  { key: "oee", label: "OEE", unit: "%", color: "#22C55E" },
  { key: "activeAlerts", label: "Active alerts", unit: "", color: "#FBBF24" },
];

const Sparkline = ({ values, color }: { values: number[]; color: string }) => {
  const clipId = useId();
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const points = values
    .map((value, index) => {
      const x = (index / (values.length - 1)) * 100;
      const y = 22 - ((value - min) / range) * 20;
      return `${index === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`;
    })
    .join(" ");

  return (
    <svg viewBox="0 0 100 24" preserveAspectRatio="none" aria-hidden="true" className="mt-1 h-6 w-full">
      {/* Revealed left to right by scaling a clip rect: dash tricks break with a stretched viewBox */}
      <clipPath id={clipId}>
        <rect width={100} height={24} className="auth-reveal" style={{ animationDelay: "0.9s" }} />
      </clipPath>
      <path
        d={points}
        fill="none"
        stroke={color}
        strokeWidth={1.5}
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
        clipPath={`url(#${clipId})`}
      />
    </svg>
  );
};

const KpiCard = ({
  label,
  unit,
  color,
  value,
  history,
  animate,
}: {
  label: string;
  unit: string;
  color: string;
  value: number;
  history: number[];
  animate: boolean;
}) => {
  const shown = useCountUp(value, animate);

  return (
    <div className="min-w-0 rounded-lg border border-white/[0.08] bg-white/[0.02] px-3 py-2.5">
      <dt className="truncate text-[11px] font-medium uppercase tracking-[0.08em] text-gray-400">{label}</dt>
      <dd className="text-xl font-semibold tabular-nums text-white">
        {shown}
        <span className="text-sm font-medium text-gray-400">{unit}</span>
      </dd>
      <Sparkline values={history} color={color} />
    </div>
  );
};

const KpiStrip = ({ kpis, animate, className }: KpiStripProps) => {
  const [history, setHistory] = useState(KPI_HISTORY_SEED);

  // Each new reading joins the sparkline
  useEffect(() => {
    setHistory((current) => {
      const next = { ...current };
      for (const { key } of KPI_CONFIG) {
        next[key] = [...current[key], kpis[key]].slice(-HISTORY_LENGTH);
      }
      return next;
    });
  }, [kpis]);

  return (
    <dl aria-label="Plant indicators" className={cn("grid grid-cols-3 gap-3", className)}>
      {KPI_CONFIG.map(({ key, label, unit, color }) => (
        <KpiCard
          key={key}
          label={label}
          unit={unit}
          color={color}
          value={kpis[key]}
          history={history[key]}
          animate={animate}
        />
      ))}
    </dl>
  );
};

export default KpiStrip;
