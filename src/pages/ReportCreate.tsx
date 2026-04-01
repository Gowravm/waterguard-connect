import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AppLayout from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { POLLUTION_CATEGORIES, SEVERITY_LABELS } from "@/lib/demoData";
import { Camera, MapPin, Sparkles, Loader2, CheckCircle2, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface AiAnalysis {
  predicted_waste_type: string;
  predicted_tags: string[];
  confidence_score: number;
  severity_score: number;
  severity_reason: string;
  urgency_flag: boolean;
  suggested_action: string;
  _meta: { model: string; disclaimer: string };
}

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
  const [analyzing, setAnalyzing] = useState(false);
  const [aiResult, setAiResult] = useState<AiAnalysis | null>(null);
  const [submitting, setSubmitting] = useState(false);

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

  const handleAiAnalyze = async () => {
    if (!title && !description) {
      toast.error("Add a title or description first so AI can analyze");
      return;
    }
    setAnalyzing(true);
    setAiResult(null);
    try {
      const { data, error } = await supabase.functions.invoke("analyze-report", {
        body: {
          title,
          description,
          pollutionCategory: category || undefined,
        },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      setAiResult(data as AiAnalysis);

      // Auto-fill category and severity from AI if user hasn't set them
      if (!category && data.predicted_waste_type) {
        setCategory(data.predicted_waste_type);
      }
      if (!severity && data.severity_score) {
        setSeverity(String(data.severity_score));
      }

      toast.success("AI analysis complete — review suggestions below");
    } catch (err: any) {
      console.error("AI analysis error:", err);
      toast.error(err.message || "AI analysis failed");
    } finally {
      setAnalyzing(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !category || !severity) {
      toast.error("Please fill in required fields");
      return;
    }

    setSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        toast.error("Please sign in to submit a report");
        setSubmitting(false);
        return;
      }

      const { data: report, error } = await supabase
        .from("pollution_reports")
        .insert({
          user_id: user.id,
          title,
          description: description || null,
          water_body_name: waterBody || null,
          lat: lat ? parseFloat(lat) : null,
          lng: lng ? parseFloat(lng) : null,
          location_text: waterBody || null,
          pollution_category: category,
          manual_severity: parseInt(severity),
          ai_severity: aiResult?.severity_score || null,
          status: "open",
        })
        .select()
        .single();

      if (error) throw error;

      // Save AI analysis if we have one
      if (aiResult && report) {
        await supabase.from("report_ai_analysis").insert({
          report_id: report.id,
          predicted_waste_type: aiResult.predicted_waste_type,
          predicted_tags: aiResult.predicted_tags,
          confidence_score: aiResult.confidence_score,
          severity_score: aiResult.severity_score,
          severity_reason: aiResult.severity_reason,
          urgency_flag: aiResult.urgency_flag,
          suggested_action: aiResult.suggested_action,
          model_version: aiResult._meta?.model || "gemini-2.5-flash",
        });
      }

      toast.success("Report submitted successfully!");
      navigate("/feed");
    } catch (err: any) {
      console.error("Submit error:", err);
      toast.error(err.message || "Failed to submit report");
    } finally {
      setSubmitting(false);
    }
  };

  const actionLabels: Record<string, string> = {
    notify_ngo: "Notify nearby NGO",
    notify_ward_office: "Notify ward office",
    schedule_cleanup: "Schedule a cleanup drive",
    inspect_urgently: "Request urgent inspection",
    monitor_recurrence: "Monitor for recurrence",
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
              <p className="text-sm">Photo upload coming soon</p>
              <p className="text-xs mt-1">Storage bucket is ready — UI integration in progress</p>
            </div>
          </div>

          {/* AI Analysis */}
          <div className="glass-card p-4">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="font-display font-semibold text-sm">AI-Assisted Analysis</span>
            </div>

            {!aiResult && !analyzing && (
              <>
                <p className="text-xs text-muted-foreground mb-3">
                  Get AI-powered suggestions for waste type, severity, and recommended action based on your report details.
                </p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAiAnalyze}
                  disabled={!title && !description}
                >
                  <Sparkles className="h-3 w-3 mr-1" />
                  Analyze with AI
                </Button>
              </>
            )}

            {analyzing && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Analyzing your report...
              </div>
            )}

            {aiResult && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-green-600">
                  <CheckCircle2 className="h-4 w-4" />
                  Analysis complete
                </div>

                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-muted-foreground text-xs">Waste Type</span>
                    <p className="font-medium capitalize">{aiResult.predicted_waste_type?.replace("_", " ")}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground text-xs">Severity</span>
                    <p className="font-medium">{aiResult.severity_score}/5</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground text-xs">Confidence</span>
                    <p className="font-medium">{Math.round((aiResult.confidence_score || 0) * 100)}%</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground text-xs">Action</span>
                    <p className="font-medium text-xs">{actionLabels[aiResult.suggested_action] || aiResult.suggested_action}</p>
                  </div>
                </div>

                {aiResult.urgency_flag && (
                  <div className="flex items-center gap-2 text-sm text-amber-600 bg-amber-50 rounded-md px-3 py-2">
                    <AlertTriangle className="h-4 w-4" />
                    Flagged as urgent — potential health hazard
                  </div>
                )}

                <p className="text-xs text-muted-foreground">{aiResult.severity_reason}</p>

                {aiResult.predicted_tags && aiResult.predicted_tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {aiResult.predicted_tags.map((tag) => (
                      <span key={tag} className="text-[10px] bg-muted px-2 py-0.5 rounded-full">{tag}</span>
                    ))}
                  </div>
                )}

                <p className="text-[10px] text-muted-foreground/70 italic">
                  ⚠️ {aiResult._meta?.disclaimer || "AI-assisted suggestion — not ground truth"}
                </p>

                <Button type="button" variant="ghost" size="sm" onClick={handleAiAnalyze}>
                  Re-analyze
                </Button>
              </div>
            )}
          </div>

          <Button type="submit" className="w-full" size="lg" disabled={submitting}>
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Submitting...
              </>
            ) : (
              "Submit Report"
            )}
          </Button>
          <p className="text-[10px] text-muted-foreground text-center">
            Sign in required to submit reports. Reports are stored in the database.
          </p>
        </form>
      </div>
    </AppLayout>
  );
}
