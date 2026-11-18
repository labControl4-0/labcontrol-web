import { Factory } from "lucide-react";
import { cn } from "@/lib/utils";

interface BrandMarkProps {
  className?: string;
}

// SVG icon instead of the icon-font ligature: browser translation rewrote the
// ligature text ("precision_manufacturing") and broke the layout.
const BrandMark = ({ className }: BrandMarkProps) => {
  return (
    <div className={cn("flex items-center gap-2.5", className)} translate="no">
      <Factory className="h-6 w-6 text-blue-400" strokeWidth={1.8} aria-hidden="true" />
      <span className="text-[17px] font-bold tracking-tight text-white">LabControl 4.0</span>
    </div>
  );
};

export default BrandMark;
