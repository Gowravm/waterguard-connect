import { Droplets } from "lucide-react";
import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="border-t border-border bg-card mt-auto">
      <div className="container py-10 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div>
          <div className="flex items-center gap-2 font-display font-bold text-lg text-primary mb-2">
            <Droplets className="h-5 w-5" />
            BlueGuard
          </div>
          <p className="text-sm text-muted-foreground">
            Community-powered water body protection. Report pollution, join cleanups, drive change.
          </p>
        </div>
        <div>
          <h4 className="font-display font-semibold mb-3 text-sm">Platform</h4>
          <div className="space-y-2 text-sm text-muted-foreground">
            <Link to="/feed" className="block hover:text-foreground">Feed</Link>
            <Link to="/map" className="block hover:text-foreground">Pollution Map</Link>
            <Link to="/directory" className="block hover:text-foreground">Organizations</Link>
            <Link to="/dashboard" className="block hover:text-foreground">Dashboard</Link>
          </div>
        </div>
        <div>
          <h4 className="font-display font-semibold mb-3 text-sm">About</h4>
          <p className="text-sm text-muted-foreground">
            Built for hackathon demo purposes. All seed data is synthetic and clearly marked. No fabricated impact claims.
          </p>
        </div>
      </div>
      <div className="border-t border-border">
        <div className="container py-4 text-xs text-muted-foreground text-center">
          BlueGuard MVP — Hackathon Demo Build
        </div>
      </div>
    </footer>
  );
}
