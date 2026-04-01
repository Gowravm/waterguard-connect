import { useEffect, useRef, useState } from "react";
import AppLayout from "@/components/layout/AppLayout";
import { DEMO_REPORTS, POLLUTION_CATEGORIES, SEVERITY_LABELS } from "@/lib/demoData";
import SeverityBadge from "@/components/SeverityBadge";
import StatusBadge from "@/components/StatusBadge";
import { MapPin, Filter, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const SEVERITY_COLORS: Record<number, string> = {
  1: "#22c55e",
  2: "#84cc16",
  3: "#eab308",
  4: "#f97316",
  5: "#ef4444",
};

export default function MapView() {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);
  const [selected, setSelected] = useState<(typeof DEMO_REPORTS)[0] | null>(null);
  const [filterOpen, setFilterOpen] = useState(false);

  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return;

    const map = L.map(mapRef.current).setView([20.5937, 78.9629], 5);
    mapInstance.current = map;

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(map);

    DEMO_REPORTS.forEach((r) => {
      const color = SEVERITY_COLORS[r.manualSeverity] ?? "#888";
      const size = 10 + r.manualSeverity * 4;

      const icon = L.divIcon({
        className: "",
        html: `
          <div style="position:relative;width:${size}px;height:${size}px;">
            <div style="position:absolute;inset:0;border-radius:50%;background:${color};opacity:0.3;animation:pulse-ring 1.5s ease-out infinite;"></div>
            <div style="position:absolute;inset:2px;border-radius:50%;background:${color};border:2px solid white;box-shadow:0 2px 6px rgba(0,0,0,.3);"></div>
          </div>
        `,
        iconSize: [size, size],
        iconAnchor: [size / 2, size / 2],
      });

      L.marker([r.lat, r.lng], { icon })
        .addTo(map)
        .on("click", () => setSelected(r));
    });

    return () => {
      map.remove();
      mapInstance.current = null;
    };
  }, []);

  return (
    <AppLayout>
      <div className="relative" style={{ height: "calc(100vh - 4rem)" }}>
        <div ref={mapRef} className="absolute inset-0 z-0" />

        {/* Legend */}
        <div className="absolute top-4 left-4 z-10 glass-card p-3 text-xs space-y-1">
          <div className="font-display font-semibold mb-1">Severity</div>
          {SEVERITY_LABELS.map(s => (
            <div key={s.level} className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ background: SEVERITY_COLORS[s.level] }} />
              <span>{s.label}</span>
            </div>
          ))}
          <p className="text-[9px] text-muted-foreground/60 pt-1">Demo markers only</p>
        </div>

        {/* Selected report panel */}
        {selected && (
          <div className="absolute top-4 right-4 z-10 glass-card p-4 w-80 max-h-[50vh] overflow-y-auto">
            <div className="flex items-start justify-between mb-2">
              <h3 className="font-display font-semibold text-sm">{selected.title}</h3>
              <button onClick={() => setSelected(null)}>
                <X className="h-4 w-4 text-muted-foreground" />
              </button>
            </div>
            <div className="flex items-center gap-2 mb-2">
              <SeverityBadge level={selected.manualSeverity} />
              <StatusBadge status={selected.status} />
            </div>
            <p className="text-xs text-muted-foreground mb-2">{selected.description}</p>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <MapPin className="h-3 w-3" />
              {selected.locationText}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              Water body: {selected.waterBodyName}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              Reported by: {selected.userName}
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
