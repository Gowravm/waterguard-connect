import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AppLayout from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { POLLUTION_CATEGORIES, SEVERITY_LABELS } from "@/lib/demoData";
import { Camera, MapPin, Sparkles } from "lucide-react";
import { toast } from "sonner";

export default function ReportCreate() {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [waterBody, setWaterBody] = useState("");
  const [category, setCategory] = useState("");
  const [severity, setSeverity] = useState("");
  const [lat, setLat] = useState("");
  const [lng, setLng] = useState("");
  const [locating, setLocating] = useState(false);

  const handleGeolocate = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation not supported by your browser");
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLat(pos.coords.latitude.toFixed(6));
        setLng(pos.coords.longitude.toFixed(6));
        setLocating(false);
        toast.success("Location captured");
      },
      () => {
        setLocating(false);
        toast.error("Could not get location");
      }
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !category || !severity) {
      toast.error("Please fill in required fields");
      return;
    }
    toast.success("Report submitted! (Demo — not saved to database yet)");
    navigate("/feed");
  };

  return (
    <AppLayout>
      <div className="container py-8 max-w-xl">
        <h1 className="font-display text-2xl font-bold mb-2">Report Pollution</h1>
        <p className="text-sm text-muted-foreground mb-6">
          Document pollution near a water body. Your report helps the community take action.
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <Label htmlFor="title">Title *</Label>
            <Input id="title" placeholder="e.g., Plastic waste at south bank" value={title} onChange={e => setTitle(e.target.value)} />
          </div>

          <div>
            <Label htmlFor="desc">Description</Label>
            <Textarea id="desc" placeholder="Describe the pollution you observed..." rows={3} value={description} onChange={e => setDescription(e.target.value)} />
          </div>

          <div>
            <Label htmlFor="water">Water Body Name</Label>
            <Input id="water" placeholder="e.g., Ulsoor Lake" value={waterBody} onChange={e => setWaterBody(e.target.value)} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Pollution Category *</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                <SelectContent>
                  {POLLUTION_CATEGORIES.map(c => (
                    <SelectItem key={c.value} value={c.value}>
                      {c.icon} {c.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Severity *</Label>
              <Select value={severity} onValueChange={setSeverity}>
                <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                <SelectContent>
                  {SEVERITY_LABELS.map(s => (
                    <SelectItem key={s.level} value={String(s.level)}>
                      {s.label} ({s.level}/5)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Location */}
          <div>
            <Label>Location</Label>
            <div className="flex gap-2 mt-1">
              <Input placeholder="Latitude" value={lat} onChange={e => setLat(e.target.value)} className="flex-1" />
              <Input placeholder="Longitude" value={lng} onChange={e => setLng(e.target.value)} className="flex-1" />
              <Button type="button" variant="outline" size="icon" onClick={handleGeolocate} disabled={locating}>
                <MapPin className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-1">Click the pin icon to auto-detect your location</p>
          </div>

          {/* Image upload placeholder */}
          <div>
            <Label>Photos</Label>
            <div className="mt-1 border-2 border-dashed border-border rounded-lg p-8 text-center text-muted-foreground">
              <Camera className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Image upload requires Lovable Cloud storage</p>
              <p className="text-xs mt-1">Enable backend to activate photo uploads</p>
            </div>
          </div>

          {/* AI analysis placeholder */}
          <div className="glass-card p-4">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="font-display font-semibold text-sm">AI-Assisted Analysis</span>
              <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full">Coming soon</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Once enabled, AI will suggest waste type, severity, and urgency from your photo and description. All outputs will be clearly labeled as AI suggestions.
            </p>
          </div>

          <Button type="submit" className="w-full" size="lg">
            Submit Report
          </Button>
          <p className="text-[10px] text-muted-foreground text-center">
            Demo mode — reports are not persisted. Enable Lovable Cloud for full functionality.
          </p>
        </form>
      </div>
    </AppLayout>
  );
}
