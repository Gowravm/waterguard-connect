import { Heart, MessageCircle, Users, Calendar, Megaphone, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

const typeConfig: Record<string, { icon: any; label: string; className: string }> = {
  event: { icon: Calendar, label: "Event", className: "bg-primary/10 text-primary" },
  update: { icon: Megaphone, label: "Update", className: "bg-secondary/10 text-secondary" },
  call_for_help: { icon: AlertTriangle, label: "Help Needed", className: "bg-destructive/10 text-destructive" },
  general: { icon: Megaphone, label: "Post", className: "bg-muted text-muted-foreground" },
};

interface Post {
  id: string;
  type: string;
  title: string;
  content: string;
  userName: string;
  waterBodyName: string;
  createdAt: string;
  likes: number;
  comments: number;
  participants: number;
}

export default function PostCard({ post }: { post: Post }) {
  const cfg = typeConfig[post.type] ?? typeConfig.general;
  const Icon = cfg.icon;

  return (
    <div className="glass-card p-4 hover:shadow-md transition-shadow">
      <div className="flex items-center gap-2 mb-2">
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${cfg.className}`}>
          <Icon className="h-3 w-3" />
          {cfg.label}
        </span>
        <span className="text-xs text-muted-foreground">· {post.waterBodyName}</span>
      </div>
      <h3 className="font-display font-semibold text-sm mb-1">{post.title}</h3>
      <p className="text-xs text-muted-foreground line-clamp-3 mb-3">{post.content}</p>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1"><Heart className="h-3 w-3" />{post.likes}</span>
          <span className="flex items-center gap-1"><MessageCircle className="h-3 w-3" />{post.comments}</span>
          {post.participants > 0 && (
            <span className="flex items-center gap-1"><Users className="h-3 w-3" />{post.participants} joined</span>
          )}
        </div>
        {post.type === "event" && (
          <Button size="sm" variant="outline" className="h-7 text-xs">Join</Button>
        )}
      </div>
    </div>
  );
}
