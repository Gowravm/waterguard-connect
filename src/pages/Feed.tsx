import { useState } from "react";
import AppLayout from "@/components/layout/AppLayout";
import ReportCard from "@/components/ReportCard";
import PostCard from "@/components/PostCard";
import { DEMO_REPORTS, DEMO_POSTS } from "@/lib/demoData";
import { Button } from "@/components/ui/button";

type Tab = "all" | "reports" | "posts";

export default function Feed() {
  const [tab, setTab] = useState<Tab>("all");

  const tabs: { key: Tab; label: string }[] = [
    { key: "all", label: "All" },
    { key: "reports", label: "Reports" },
    { key: "posts", label: "Community" },
  ];

  return (
    <AppLayout>
      <div className="container py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="font-display text-2xl font-bold">Feed</h1>
          <div className="flex gap-1 bg-muted rounded-lg p-0.5">
            {tabs.map(t => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  tab === t.key ? "bg-card shadow-sm text-foreground" : "text-muted-foreground"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-4 max-w-2xl">
          {(tab === "all" || tab === "reports") &&
            DEMO_REPORTS.map(r => <ReportCard key={r.id} report={r} />)}
          {(tab === "all" || tab === "posts") &&
            DEMO_POSTS.map(p => <PostCard key={p.id} post={p} />)}
        </div>

        <p className="text-[10px] text-muted-foreground/60 mt-6 text-center">
          All content above is demo seed data
        </p>
      </div>
    </AppLayout>
  );
}
