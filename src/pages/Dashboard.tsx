import AppLayout from "@/components/layout/AppLayout";
import { DASHBOARD_STATS } from "@/lib/demoData";
import { BarChart3, FileText, Users, Calendar, AlertTriangle, CheckCircle } from "lucide-react";

const statCards = [
  { label: "Total Reports", value: DASHBOARD_STATS.totalReports, icon: FileText, color: "text-primary" },
  { label: "Open Reports", value: DASHBOARD_STATS.openReports, icon: AlertTriangle, color: "text-destructive" },
  { label: "Resolved", value: DASHBOARD_STATS.resolvedReports, icon: CheckCircle, color: "text-secondary" },
  { label: "Volunteers", value: DASHBOARD_STATS.totalVolunteers, icon: Users, color: "text-primary" },
  { label: "Cleanup Events", value: DASHBOARD_STATS.cleanupEvents, icon: Calendar, color: "text-secondary" },
];

export default function Dashboard() {
  return (
    <AppLayout>
      <div className="container py-8">
        <h1 className="font-display text-2xl font-bold mb-2">Dashboard</h1>
        <p className="text-sm text-muted-foreground mb-6">
          Overview of pollution reports and community activity.
        </p>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          {statCards.map(s => (
            <div key={s.label} className="glass-card p-4 text-center">
              <s.icon className={`h-5 w-5 mx-auto mb-2 ${s.color}`} />
              <div className="font-display text-2xl font-bold">{s.value}</div>
              <div className="text-xs text-muted-foreground">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Top Water Bodies */}
        <div className="glass-card p-5 mb-6">
          <h2 className="font-display font-semibold mb-4 flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-primary" />
            Top Reported Water Bodies
          </h2>
          <div className="space-y-3">
            {DASHBOARD_STATS.topWaterBodies.map((wb, i) => (
              <div key={wb.name} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-accent flex items-center justify-center text-xs font-bold text-accent-foreground">
                    {i + 1}
                  </span>
                  <span className="text-sm font-medium">{wb.name}</span>
                </div>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span>{wb.reports} reports</span>
                  <div className="flex items-center gap-1">
                    <span>Avg severity:</span>
                    <span className={`severity-badge-${wb.avgSeverity} px-1.5 py-0.5 rounded-full text-[10px] font-semibold`}>
                      {wb.avgSeverity}/5
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <p className="text-[10px] text-muted-foreground/60 text-center">
          {DASHBOARD_STATS.note}
        </p>
      </div>
    </AppLayout>
  );
}
