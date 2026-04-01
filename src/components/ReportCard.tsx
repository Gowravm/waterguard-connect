import { MapPin, MessageCircle, Heart, Clock } from "lucide-react";
import SeverityBadge from "./SeverityBadge";
import StatusBadge from "./StatusBadge";
import { POLLUTION_CATEGORIES } from "@/lib/demoData";

interface Report {
  id: string;
  title: string;
  description: string;
  locationText: string;
  pollutionCategory: string;
  manualSeverity: number;
  status: string;
  userName: string;
  createdAt: string;
  likes: number;
  comments: number;
}

export default function ReportCard({ report }: { report: Report }) {
  const cat = POLLUTION_CATEGORIES.find(c => c.value === report.pollutionCategory);
  const timeAgo = getTimeAgo(report.createdAt);

  return (
    <div className="glass-card p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className="font-medium text-foreground">{report.userName}</span>
          <span>·</span>
          <Clock className="h-3 w-3" />
          <span>{timeAgo}</span>
        </div>
        <StatusBadge status={report.status} />
      </div>
      <h3 className="font-display font-semibold text-sm mb-1">{report.title}</h3>
      <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{report.description}</p>
      <div className="flex items-center gap-2 flex-wrap mb-3">
        <SeverityBadge level={report.manualSeverity} />
        {cat && (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-muted text-muted-foreground">
            {cat.icon} {cat.label}
          </span>
        )}
      </div>
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <div className="flex items-center gap-1">
          <MapPin className="h-3 w-3" />
          {report.locationText}
        </div>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1"><Heart className="h-3 w-3" />{report.likes}</span>
          <span className="flex items-center gap-1"><MessageCircle className="h-3 w-3" />{report.comments}</span>
        </div>
      </div>
    </div>
  );
}

function getTimeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const hours = Math.floor(diff / 3600000);
  if (hours < 1) return "just now";
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}
