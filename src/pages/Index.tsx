import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Droplets, MapPin, Users, BarChart3, ArrowRight, Shield, Camera, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import AppLayout from "@/components/layout/AppLayout";
import { DEMO_REPORTS, DASHBOARD_STATS } from "@/lib/demoData";
import heroImage from "@/assets/hero-water-community.jpg";

export default function Index() {
  return (
    <AppLayout>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <img src={heroImage} alt="Community volunteers cleaning a lake shoreline at golden hour" width={1920} height={1080} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/80 to-background/40" />
        </div>
        <div className="container relative py-20 md:py-32">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="max-w-2xl"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium mb-6">
              <Droplets className="h-3 w-3" />
              Community-powered water protection
            </div>
            <h1 className="font-display text-4xl md:text-6xl font-extrabold tracking-tight mb-6 text-foreground">
              Protect our{" "}
              <span className="text-primary">water bodies</span>,{" "}
              together
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8 leading-relaxed">
              Report pollution, visualize hotspots, join cleanups, and coordinate with NGOs and local authorities — all in one platform.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button size="lg" asChild>
                <Link to="/report/new">
                  <Camera className="h-4 w-4 mr-2" />
                  Report Pollution
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link to="/map">
                  <MapPin className="h-4 w-4 mr-2" />
                  View Hotspots
                </Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Live Stats Banner */}
      <section className="border-b border-border bg-card">
        <div className="container py-6 grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Reports Filed", value: DASHBOARD_STATS.totalReports, icon: Camera },
            { label: "Open Issues", value: DASHBOARD_STATS.openReports, icon: Shield },
            { label: "Volunteers", value: DASHBOARD_STATS.totalVolunteers, icon: Users },
            { label: "Cleanup Events", value: DASHBOARD_STATS.cleanupEvents, icon: MapPin },
          ].map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + i * 0.1 }}
              className="text-center"
            >
              <s.icon className="h-5 w-5 mx-auto mb-1 text-primary" />
              <div className="font-display text-2xl font-bold">{s.value}</div>
              <div className="text-xs text-muted-foreground">{s.label}</div>
            </motion.div>
          ))}
        </div>
        <div className="text-center pb-2 text-[10px] text-muted-foreground/60">
          Stats from demo seed data only
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-background">
        <div className="container">
          <h2 className="font-display text-2xl md:text-3xl font-bold text-center mb-12">
            How BlueGuard works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: Camera,
                title: "Report Pollution",
                desc: "Snap a photo, tag the water body, set the severity. Your report goes live on the map instantly.",
              },
              {
                icon: Sparkles,
                title: "AI-Assisted Analysis",
                desc: "Our AI suggests waste type, severity, and urgency — labeled clearly as AI-assisted, never as ground truth.",
              },
              {
                icon: Users,
                title: "Coordinate Action",
                desc: "Find nearby NGOs, create cleanup events, rally volunteers. Turn reports into real-world impact.",
              },
            ].map((step, i) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="glass-card p-6 text-center"
              >
                <div className="w-12 h-12 rounded-xl bg-accent flex items-center justify-center mx-auto mb-4">
                  <step.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-display font-semibold mb-2">{step.title}</h3>
                <p className="text-sm text-muted-foreground">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Recent Hotspots Preview */}
      <section className="py-20 bg-muted/50">
        <div className="container">
          <div className="flex items-center justify-between mb-8">
            <h2 className="font-display text-2xl font-bold">Recent Reports</h2>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/feed">
                View all <ArrowRight className="h-4 w-4 ml-1" />
              </Link>
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {DEMO_REPORTS.slice(0, 3).map((r) => (
              <div key={r.id} className="glass-card p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className={`severity-badge-${r.manualSeverity} px-2 py-0.5 rounded-full text-xs font-semibold`}>
                    Severity {r.manualSeverity}
                  </span>
                  <span className="text-xs text-muted-foreground">{r.waterBodyName}</span>
                </div>
                <h3 className="font-display font-semibold text-sm mb-1">{r.title}</h3>
                <p className="text-xs text-muted-foreground line-clamp-2">{r.description}</p>
              </div>
            ))}
          </div>
          <p className="text-[10px] text-muted-foreground/60 mt-4 text-center">Demo seed data — not from real field reports</p>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-r from-primary to-secondary">
        <div className="container text-center">
          <h2 className="font-display text-2xl md:text-3xl font-bold text-primary-foreground mb-4">
            Ready to protect your local water body?
          </h2>
          <p className="text-primary-foreground/80 mb-8 max-w-lg mx-auto">
            Join the community. Every report counts. Every cleanup makes a difference.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Button size="lg" variant="secondary" asChild>
              <Link to="/report/new">Report Now</Link>
            </Button>
            <Button size="lg" variant="outline" className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10" asChild>
              <Link to="/feed">Browse Feed</Link>
            </Button>
          </div>
        </div>
      </section>
    </AppLayout>
  );
}
