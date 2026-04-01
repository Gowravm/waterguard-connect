import { cn } from "@/lib/utils";

const statusConfig: Record<string, { label: string; className: string }> = {
  open: { label: "Open", className: "bg-destructive/10 text-destructive" },
  under_review: { label: "Under Review", className: "bg-severity-3/10 text-severity-3" },
  action_planned: { label: "Action Planned", className: "bg-primary/10 text-primary" },
  resolved: { label: "Resolved", className: "bg-severity-1/10 text-severity-1" },
};

export default function StatusBadge({ status }: { status: string }) {
  const cfg = statusConfig[status] ?? { label: status, className: "bg-muted text-muted-foreground" };
  return (
    <span className={cn("inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium", cfg.className)}>
      {cfg.label}
    </span>
  );
}
