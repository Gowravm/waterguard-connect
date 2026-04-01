import AppLayout from "@/components/layout/AppLayout";
import { DEMO_ORGANIZATIONS } from "@/lib/demoData";
import { Building2, CheckCircle2, Globe, MapPin, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState } from "react";

const typeIcons: Record<string, string> = {
  NGO: "🏛️",
  government: "🏢",
  community: "🤝",
  informal: "👥",
};

export default function Directory() {
  const [search, setSearch] = useState("");
  const filtered = DEMO_ORGANIZATIONS.filter(o =>
    o.name.toLowerCase().includes(search.toLowerCase()) ||
    o.focusArea.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AppLayout>
      <div className="container py-8">
        <h1 className="font-display text-2xl font-bold mb-2">Organization Directory</h1>
        <p className="text-sm text-muted-foreground mb-6">
          Find NGOs, government departments, and community groups working on water body conservation.
        </p>

        <div className="relative max-w-md mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search organizations..."
            className="pl-9"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(org => (
            <div key={org.id} className="glass-card p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{typeIcons[org.type] ?? "📌"}</span>
                  <div>
                    <h3 className="font-display font-semibold text-sm">{org.name}</h3>
                    <span className="text-xs text-muted-foreground capitalize">{org.type}</span>
                  </div>
                </div>
                {org.verified && (
                  <CheckCircle2 className="h-4 w-4 text-secondary flex-shrink-0" />
                )}
              </div>
              <p className="text-xs text-muted-foreground mb-3">{org.focusArea}</p>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <MapPin className="h-3 w-3" />
                {org.areaServed}, {org.city}
              </div>
              {org.note && (
                <p className="text-[10px] text-muted-foreground/60 mt-2 italic">{org.note}</p>
              )}
            </div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <Building2 className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p className="text-sm">No organizations found</p>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
