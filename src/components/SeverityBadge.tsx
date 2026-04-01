import { cn } from "@/lib/utils";
import { SEVERITY_LABELS } from "@/lib/demoData";

export default function SeverityBadge({ level, className }: { level: number; className?: string }) {
  const info = SEVERITY_LABELS.find(s => s.level === level);
  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold",
        `severity-badge-${level}`,
        className
      )}
    >
      {info?.label ?? `Level ${level}`}
    </span>
  );
}
