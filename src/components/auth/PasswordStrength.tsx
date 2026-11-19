import { strengthLevel, type StrengthLevel } from "./passwordScore";

// Same colors as the machine statuses: stopped, warning, running
const LEVELS: Record<StrengthLevel, { label: string; bars: number; color: string; text: string }> = {
  weak: { label: "Weak", bars: 1, color: "bg-red-400", text: "text-red-400" },
  fair: { label: "Fair", bars: 2, color: "bg-amber-400", text: "text-amber-400" },
  strong: { label: "Strong", bars: 3, color: "bg-green-500", text: "text-green-400" },
};

interface PasswordStrengthProps {
  id: string;
  password: string;
}

const PasswordStrength = ({ id, password }: PasswordStrengthProps) => {
  if (!password) return null;

  const level = LEVELS[strengthLevel(password)];

  return (
    <div className="flex items-center gap-3">
      <div className="flex flex-1 gap-1.5" aria-hidden="true">
        {[0, 1, 2].map((bar) => (
          <div key={bar} className="h-1 flex-1 overflow-hidden rounded-full bg-white/10">
            <div
              className={`auth-meter-fill h-full w-full ${level.color}`}
              style={{ transform: `scaleX(${bar < level.bars ? 1 : 0})` }}
            />
          </div>
        ))}
      </div>
      <p id={id} aria-live="polite" className={`text-xs font-medium ${level.text}`}>
        <span className="sr-only">Password strength: </span>
        {level.label}
      </p>
    </div>
  );
};

export default PasswordStrength;
