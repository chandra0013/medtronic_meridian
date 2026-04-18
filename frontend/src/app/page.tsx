"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Navbar } from "@/components/Navbar";
import { MetricCard } from "@/components/MetricCard";
import { DeviceAreaChart, SignalDonutChart } from "@/components/Visualizations";
import { SignalLab } from "@/components/SignalLab";
import { DevicePulse } from "@/components/DevicePulse";
import { Button } from "@/components/Button";
import { 
  ShieldCheck, 
  Activity, 
  Database, 
  ArrowRight, 
  Cpu, 
  Search, 
  Lock, 
  ChevronRight,
  Monitor
} from "lucide-react";

export default function Home() {
  const [view, setView] = useState<"landing" | "dashboard" | "signals" | "pulse">("landing");

  return (
    <main className="min-h-screen">
      <Navbar isLanding={view === "landing"} onLaunch={() => setView("dashboard")} />

      <AnimatePresence mode="wait">
        {view === "landing" ? (
          <LandingView key="landing" onLaunch={() => setView("dashboard")} />
        ) : (
          <DashboardView 
            key="dashboard" 
            view={view} 
            setView={setView} 
          />
        )}
      </AnimatePresence>
    </main>
  );
}

function LandingView({ onLaunch }: { onLaunch: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="relative min-h-screen bg-[#F8F9FA] overflow-y-auto overflow-x-hidden"
    >
      {/* Hero Section - Full Bleed Expansion */}
      <section className="relative h-screen w-full flex flex-col items-center justify-center bg-black overflow-hidden">
        {/* Background Video Simulator / Dark Background */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/60 z-10" />
          <video 
            autoPlay 
            muted 
            loop 
            className="w-full h-full object-cover opacity-40"
          >
            <source src="https://assets.mixkit.co/videos/preview/mixkit-digital-animation-of-a-human-brain-11883-large.mp4" type="video/mp4" />
          </video>
        </div>

        {/* The Masterpiece SVG - Full Screen Expansion */}
        <div className="relative z-20 w-screen h-screen flex items-center justify-center">
          <motion.div
            initial={{ scale: 1.1, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ 
              duration: 1.5, 
              ease: [0.22, 1, 0.36, 1],
              delay: 0.1 
            }}
            className="w-full h-full flex items-center justify-center"
          >
            <img 
              src="https://ik.imagekit.io/fyttdlzz0/La_%20(1).svg" 
              alt="Meridian Branding" 
              className="w-full h-full object-cover"
            />
          </motion.div>
          
          {/* Subtle Overlay to ensure UI readability if needed */}
          <div className="absolute inset-0 bg-black/10 pointer-events-none" />
        </div>

        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 z-20">
          <motion.div 
            animate={{ y: [0, 10, 0] }} 
            transition={{ repeat: Infinity, duration: 2 }}
            className="flex flex-col items-center gap-2"
          >
            <div className="w-px h-12 bg-gradient-to-b from-white/40 to-transparent" />
            <span className="text-[10px] font-bold text-white/30 uppercase tracking-[0.3em]">Discover Potential</span>
          </motion.div>
        </div>
      </section>

      {/* Details Section (Scrollable) */}
      <section className="relative z-30 py-32 px-6 bg-[#F8F9FA]">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <motion.div 
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="space-y-8"
            >
              <h2 className="text-[10px] font-bold uppercase tracking-[0.4em] text-apex-text-muted">
                System Capabilities
              </h2>
              <h3 className="text-6xl font-display font-bold text-apex-forest tracking-tighter leading-[1.1]">
                Precision safety <br/> at cellular scale.
              </h3>
              <p className="text-xl text-apex-text-muted leading-relaxed">
                Meridian unifies clinical telemetry and pharmacovigilance into a single, high-fidelity source of truth. By bridging the gap between raw biometrics and medical insights, we empower teams to detect signals before they become crises.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8 border-t border-black/5">
                <div>
                  <h4 className="font-bold text-apex-forest mb-2">99.4% Signal Accuracy</h4>
                  <p className="text-sm text-apex-text-muted">Validated against historical Novartis safety datasets with near-zero false positives.</p>
                </div>
                <div>
                  <h4 className="font-bold text-apex-forest mb-2">Real-time Telemetry</h4>
                  <p className="text-sm text-apex-text-muted">Edge-processed anomaly detection for Medtronic critical device networks.</p>
                </div>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1 }}
              className="relative aspect-square bg-white rounded-4xl border border-black/5 card-shadow overflow-hidden flex items-center justify-center p-12"
            >
              <div className="absolute inset-0 pending-stripes opacity-30" />
              <div className="relative z-10 w-full h-full flex flex-col items-center justify-center text-center space-y-6">
                <div className="w-24 h-24 bg-apex-mint-light rounded-3xl flex items-center justify-center text-apex-forest">
                  <ShieldCheck size={48} strokeWidth={1.5} />
                </div>
                <h4 className="text-2xl font-display font-bold text-apex-forest">Intelligence Secured.</h4>
                <p className="text-sm text-apex-text-muted max-w-xs">
                  Enterprise-grade encryption for PII/PHI data streams across all intelligence nodes.
                </p>
              </div>
            </motion.div>
          </div>
          
          <div className="mt-40 grid grid-cols-1 md:grid-cols-3 gap-12">
            <LandingCard 
              icon={Activity} 
              title="Anomaly Detection" 
              text="Isolation Forest ML engines processing millions of data points per second."
            />
            <LandingCard 
              icon={Database} 
              title="Signal Lab RAG" 
              text="Cross-reference safety reports against clinical archives with LLM synthesis."
            />
            <LandingCard 
              icon={Cpu} 
              title="Fast Decisioning" 
              text="Powered by Groq infrastructure for sub-100ms reasoning cycles."
            />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 px-6 border-t border-black/5 text-center">
         <div className="max-w-7xl mx-auto flex flex-col items-center gap-8">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-apex-forest rounded-full flex items-center justify-center">
                <div className="w-3 h-3 bg-apex-mint rounded-full" />
              </div>
              <span className="font-display font-bold text-xl text-apex-forest">Meridian</span>
            </div>
            <p className="text-xs text-apex-text-muted uppercase tracking-[0.2em]">&copy; 2026 Meridian AI. All Rights Reserved.</p>
         </div>
      </footer>
    </motion.div>
  );
}

function LandingCard({ icon: Icon, title, text }: { icon: any, title: string, text: string }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="p-10 bg-white rounded-4xl border border-black/5 card-shadow space-y-4"
    >
      <div className="w-12 h-12 bg-apex-bg rounded-2xl flex items-center justify-center text-apex-forest mb-4">
        <Icon size={24} strokeWidth={1.5} />
      </div>
      <h4 className="text-lg font-display font-bold text-apex-forest">{title}</h4>
      <p className="text-sm text-apex-text-muted leading-relaxed">{text}</p>
    </motion.div>
  );
}


function DashboardView({ view, setView }: { view: string, setView: (v: any) => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-7xl mx-auto px-6 pt-32 pb-20 overflow-x-hidden"
    >
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div>
          <h2 className="text-[10px] font-bold uppercase tracking-[0.4em] text-apex-text-muted mb-4 flex items-center gap-2">
            <div className="w-1 h-1 bg-apex-forest rounded-full" />
            Decision Intelligence Node v1.0
          </h2>
          <h1 className="text-5xl md:text-6xl font-display font-bold text-apex-forest tracking-tighter">
            System Overview
          </h1>
        </div>
        
        <div className="flex gap-3 bg-white p-2 rounded-full border border-black/5 card-shadow">
          <TabButton active={view === "dashboard"} onClick={() => setView("dashboard")} label="Overview" icon={Activity} />
          <TabButton active={view === "signals"} onClick={() => setView("signals")} label="Signal Lab" icon={Database} />
          <TabButton active={view === "pulse"} onClick={() => setView("pulse")} label="Device Pulse" icon={Monitor} />
        </div>
      </div>

      <AnimatePresence mode="wait">
        {view === "dashboard" && (
          <motion.div 
            key="overview"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-12"
          >
            {/* Top KPI row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <MetricCard 
                label="Active Implants" 
                value="14,208" 
                trend={+12} 
                icon={Activity} 
                subtext="Real-time telemetry streams"
              />
              <MetricCard 
                label="Safety Signals" 
                value="284" 
                trend={-4} 
                icon={Database} 
                subtext="Pharmacovigilance matches"
              />
              <MetricCard 
                label="Triage Confidence" 
                value="98.2%" 
                trend={+0.5} 
                icon={ShieldCheck} 
                subtext="AI-verfied accuracy"
              />
              <MetricCard 
                label="Processing Latency" 
                value="14ms" 
                trend={-15} 
                icon={Cpu} 
                subtext="End-to-edge response"
              />
            </div>

            {/* Main Visuals Row */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <div className="lg:col-span-8 bg-white p-10 rounded-4xl border border-black/5 card-shadow">
                <div className="flex items-center justify-between mb-8">
                  <h3 className="font-display font-bold text-xl text-apex-forest">Telemetry Velocity</h3>
                  <div className="flex gap-2">
                     <span className="px-4 py-1.5 bg-apex-bg rounded-full text-[10px] font-bold uppercase tracking-wider text-apex-text-muted">7 Day Window</span>
                  </div>
                </div>
                <DeviceAreaChart />
              </div>
              
              <div className="lg:col-span-4 bg-white p-10 rounded-4xl border border-black/5 card-shadow">
                <h3 className="font-display font-bold text-xl text-apex-forest mb-8">Signal Distribution</h3>
                <SignalDonutChart />
                <div className="space-y-4 mt-8">
                   <LegendItem color="bg-apex-forest" label="Critical Alerts" val="40%" />
                   <LegendItem color="bg-apex-mint" label="High Priority" val="30%" />
                   <LegendItem color="bg-apex-mint-light" label="Medical Insight" val="20%" />
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
               <FeatureCard 
                 title="Automated Case Triage" 
                 desc="Leverage LLM-driven entity extraction for adverse event narratives."
                 icon={ShieldCheck}
                 onClick={() => setView("signals")}
               />
               <FeatureCard 
                 title="Telemetry Anomaly Lab" 
                 desc="Isolation Forest engine for hardware failure prediction."
                 icon={Cpu}
                 onClick={() => setView("pulse")}
               />
               <FeatureCard 
                 title="Enterprise RAG" 
                 desc="Cross-reference safety data against clinical libraries."
                 icon={Lock}
                 onClick={() => setView("signals")}
               />
            </div>
          </motion.div>
        )}

        {view === "signals" && <SignalLab key="signals" />}
        {view === "pulse" && <DevicePulse key="pulse" />}
      </AnimatePresence>
    </motion.div>
  );
}

function TabButton({ active, label, icon: Icon, onClick }: { active: boolean, label: string, icon: any, onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-6 py-2 rounded-full text-sm font-bold transition-all ${
        active 
          ? "bg-apex-forest text-white shadow-md shadow-apex-forest/20" 
          : "text-apex-text-muted hover:bg-apex-bg"
      }`}
    >
      <Icon size={16} />
      {label}
    </button>
  );
}

function LegendItem({ color, label, val }: { color: string, label: string, val: string }) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
         <div className={`w-3 h-3 rounded-full ${color}`} />
         <span className="text-xs font-semibold text-apex-text-muted">{label}</span>
      </div>
      <span className="text-xs font-bold font-mono">{val}</span>
    </div>
  );
}

function FeatureCard({ title, desc, icon: Icon, onClick }: { title: string, desc: string, icon: any, onClick: () => void }) {
  return (
    <motion.div 
      whileHover={{ y: -8 }}
      onClick={onClick}
      className="bg-white p-10 rounded-4xl border border-black/5 card-shadow cursor-pointer group"
    >
      <div className="w-14 h-14 bg-apex-bg rounded-2xl flex items-center justify-center mb-6 group-hover:bg-apex-forest group-hover:text-white transition-colors">
        <Icon size={28} strokeWidth={1.5} />
      </div>
      <h4 className="text-xl font-display font-bold text-apex-forest mb-3 flex items-center gap-2">
        {title} <ChevronRight size={20} className="opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
      </h4>
      <p className="text-sm text-apex-text-muted leading-relaxed">
        {desc}
      </p>
    </motion.div>
  );
}
