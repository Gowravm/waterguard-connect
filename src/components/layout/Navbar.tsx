import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, Droplets, Map, FileText, Users, BarChart3, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

const navLinks = [
  { to: "/feed", label: "Feed", icon: FileText },
  { to: "/map", label: "Map", icon: Map },
  { to: "/directory", label: "Directory", icon: Users },
  { to: "/dashboard", label: "Dashboard", icon: BarChart3 },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const location = useLocation();

  return (
    <nav className="sticky top-0 z-50 bg-card/90 backdrop-blur-md border-b border-border">
      <div className="container flex items-center justify-between h-16">
        <Link to="/" className="flex items-center gap-2 font-display font-bold text-xl text-primary">
          <Droplets className="h-6 w-6" />
          BlueGuard
        </Link>

        {/* Desktop */}
        <div className="hidden md:flex items-center gap-1">
          {navLinks.map(l => (
            <Link
              key={l.to}
              to={l.to}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                location.pathname === l.to
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
            >
              <l.icon className="h-4 w-4" />
              {l.label}
            </Link>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-2">
          <Button asChild size="sm">
            <Link to="/report/new">
              <Plus className="h-4 w-4 mr-1" />
              Report
            </Link>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link to="/login">Sign In</Link>
          </Button>
        </div>

        {/* Mobile toggle */}
        <button className="md:hidden p-2" onClick={() => setOpen(!open)}>
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden border-t border-border bg-card p-4 space-y-2">
          {navLinks.map(l => (
            <Link
              key={l.to}
              to={l.to}
              onClick={() => setOpen(false)}
              className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium ${
                location.pathname === l.to ? "bg-accent text-accent-foreground" : "text-muted-foreground"
              }`}
            >
              <l.icon className="h-4 w-4" />
              {l.label}
            </Link>
          ))}
          <div className="flex gap-2 pt-2">
            <Button asChild size="sm" className="flex-1">
              <Link to="/report/new" onClick={() => setOpen(false)}>
                <Plus className="h-4 w-4 mr-1" />
                Report
              </Link>
            </Button>
            <Button variant="outline" size="sm" asChild className="flex-1">
              <Link to="/login" onClick={() => setOpen(false)}>Sign In</Link>
            </Button>
          </div>
        </div>
      )}
    </nav>
  );
}
