"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Activity, Zap, Cpu, AlertTriangle, ChevronRight, BarChart3, Settings2, Info, Search } from "lucide-react";
import { Button } from "./Button";
import axios from "axios";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

const SAMPLE_TELEMETRY = [
  { battery_voltage: 2.8, pulse_amplitude: 3.5, lead_impedance: 550, activity_sensor: 12 },
  { battery_voltage: 2.7, pulse_amplitude: 3.4, lead_impedance: 560, activity_sensor: 15 },
  { battery_voltage: 2.1, pulse_amplitude: 3.2, lead_impedance: 1200, activity_sensor: 10 }, // Anomaly
  { battery_voltage: 2.5, pulse_amplitude: 3.5, lead_impedance: 540, activity_sensor: 14 },
  { battery_voltage: 2.6, pulse_amplitude: 3.6, lead_impedance: 530, activity_sensor: 13 },
];

export function DevicePulse() {
  const [data, setData] = useState(SAMPLE_TELEMETRY);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [sensitivity, setSensitivity] = useState(0.08);

  const analyzeDevice = async () => {
    setLoading(true);
    try {
      const resp = await axios.post(`${API_BASE}/analyze/device`, {
        records: data,
        feature_columns: ["battery_voltage", "pulse_amplitude", "lead_impedance"],
        contamination: sensitivity
      });
      setResult(resp.data);
    } catch (err) {
      console.error(err);
      alert("Backend error. Make sure the FastAPI server is running.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
      {/* Configuration Sidebar */}
      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="xl:col-span-3 space-y-6"
      >
        <div className="bg-white p-8 rounded-4xl border border-black/5 card-shadow">
          <div className="flex items-center gap-2 mb-8 text-apex-forest">
            <Activity size={24} />
            <h2 className="text-xl font-display font-bold">Device Pulse</h2>
          </div>

          <div className="space-y-8">
            <div className="space-y-4">
              <label className="text-[10px] font-bold uppercase tracking-widest text-apex-text-muted flex items-center justify-between">
                Sensitivity Profile
                <span className="text-apex-forest bg-apex-mint-light px-2 py-0.5 rounded-full">{(sensitivity * 100).toFixed(0)}%</span>
              </label>
              <input 
                type="range" 
                min="0.01" 
                max="0.2" 
                step="0.01" 
                value={sensitivity}
                onChange={(e) => setSensitivity(parseFloat(e.target.value))}
                className="w-full accent-apex-forest"
              />
              <p className="text-[10px] text-apex-text-muted italic">
                Higher sensitivity increases anomaly detection frequency for mission-critical hardware.
              </p>
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-bold uppercase tracking-widest text-apex-text-muted">Targeted Streams</label>
              <StreamToggle label="Battery Voltage" active />
              <StreamToggle label="Pulse Amplitude" active />
              <StreamToggle label="Lead Impedance" active />
              <StreamToggle label="Activity Sensor" />
            </div>

            <Button 
              className="w-full h-14" 
              onClick={analyzeDevice} 
              disabled={loading}
              icon={BarChart3}
            >
              {loading ? "Analyzing..." : "Sync & Scan"}
            </Button>
          </div>
        </div>

        <div className="bg-apex-forest p-8 rounded-4xl text-white shadow-xl">
           <div className="flex items-center gap-3 mb-4">
              <Cpu size={24} className="text-apex-mint" />
              <h4 className="font-bold">Edge Processing</h4>
           </div>
           <p className="text-xs text-white/70 leading-relaxed">
             Telemetry is processed via Meridian's Isolation Forest engine. 
             Low-latency anomaly detection for life-critical implants.
           </p>
        </div>
      </motion.div>

      {/* Main Analysis Area */}
      <div className="xl:col-span-9 space-y-8">
        {!result ? (
           <div className="bg-white p-12 rounded-4xl border border-black/5 card-shadow h-full min-h-[600px] flex flex-col items-center justify-center text-center">
             <div className="w-24 h-24 bg-apex-bg rounded-full flex items-center justify-center mb-8 relative">
               <motion.div 
                 animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.3, 0.1] }}
                 transition={{ duration: 2, repeat: Infinity }}
                 className="absolute inset-0 bg-apex-forest rounded-full"
               />
               <Activity size={40} className="text-apex-forest/30" />
             </div>
             <h3 className="text-2xl font-display font-bold text-apex-forest">Monitor Offline</h3>
             <p className="text-apex-text-muted mt-2 max-w-sm">
               Initialize 'Sync & Scan' to pull telemetry from the medical device network.
             </p>
           </div>
        ) : (
           <motion.div 
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             className="space-y-6"
           >
             {/* Summary Stats */}
             <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <MiniSummary label="Total Signals" value={result.total_records} />
                <MiniSummary label="Alerts" value={result.anomaly_count} color={result.anomaly_count > 0 ? "text-apex-red" : "text-apex-forest"} />
                <MiniSummary label="System Health" value={result.anomaly_count > 0 ? "Attention" : "Nominal"} />
                <MiniSummary label="Engine Latency" value="12ms" />
             </div>

             {/* Anomaly Table */}
             <div className="bg-white p-10 rounded-4xl border border-black/5 card-shadow overflow-hidden">
                <div className="flex items-center justify-between mb-8">
                   <h4 className="font-display font-bold text-lg">Detailed Telemetry Scan</h4>
                   <div className="flex gap-2">
                     <span className="px-3 py-1 bg-apex-bg rounded-full text-[10px] font-bold uppercase tracking-wider text-apex-text-muted">Live Stream</span>
                   </div>
                </div>

                <div className="overflow-x-auto">
                   <table className="w-full text-left">
                     <thead>
                       <tr className="border-b border-black/5">
                         <th className="pb-4 text-[10px] font-bold uppercase tracking-widest text-apex-text-muted">Index</th>
                         <th className="pb-4 text-[10px] font-bold uppercase tracking-widest text-apex-text-muted">Risk Profile</th>
                         <th className="pb-4 text-[10px] font-bold uppercase tracking-widest text-apex-text-muted">Score</th>
                         <th className="pb-4 text-[10px] font-bold uppercase tracking-widest text-apex-text-muted">Primary Indicators</th>
                         <th className="pb-4"></th>
                       </tr>
                     </thead>
                     <tbody className="divide-y divide-black/5">
                       {result.anomalies.map((anom: any, idx: number) => (
                         <motion.tr 
                           key={idx}
                           initial={{ opacity: 0, x: -10 }}
                           animate={{ opacity: 1, x: 0 }}
                           transition={{ delay: idx * 0.1 }}
                           className="group hover:bg-apex-bg/50 transition-colors"
                         >
                           <td className="py-6 font-mono text-xs">#{anom.row_index}</td>
                           <td className="py-6">
                             <span className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase ${
                               anom.risk_level === "High" ? "bg-apex-red/10 text-apex-red" : "bg-apex-amber/10 text-apex-amber"
                             }`}>
                               {anom.risk_level} Risk
                             </span>
                           </td>
                           <td className="py-6 font-mono text-sm">{anom.anomaly_score.toFixed(3)}</td>
                           <td className="py-6">
                             <div className="flex gap-4">
                               <Indicator 
                                  val={anom.row.battery_voltage} 
                                  unit="v" 
                                  label="Batt" 
                                  isAnomaly={anom.row.battery_voltage < 2.5} 
                               />
                               <Indicator 
                                  val={anom.row.lead_impedance} 
                                  unit="Ω" 
                                  label="Imp" 
                                  isAnomaly={anom.row.lead_impedance > 1000} 
                               />
                             </div>
                           </td>
                           <td className="py-6 text-right">
                             <button className="p-2 hover:bg-apex-bg rounded-full transition-colors text-apex-forest">
                               <ChevronRight size={18} />
                             </button>
                           </td>
                         </motion.tr>
                       ))}
                       {result.anomalies.length === 0 && (
                         <tr>
                           <td colSpan={5} className="py-12 text-center text-apex-text-muted">
                             No anomalies detected in the current telemetry batch.
                           </td>
                         </tr>
                       )}
                     </tbody>
                   </table>
                </div>
             </div>

             {/* Contextual Intelligence */}
             {result.anomalies.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <div className="bg-white p-10 rounded-4xl border border-black/5 card-shadow flex gap-6">
                      <div className="w-12 h-12 bg-apex-mint-light rounded-2xl flex items-center justify-center shrink-0">
                         <Info className="text-apex-forest" size={24} />
                      </div>
                      <div>
                        <h4 className="text-[10px] font-bold uppercase tracking-widest text-apex-text-muted mb-2">AI Explanation</h4>
                        <p className="text-sm leading-relaxed text-apex-forest">
                          {result.anomalies[0].explanation}
                        </p>
                      </div>
                   </div>
                   <div className="bg-white p-10 rounded-4xl border border-black/5 card-shadow flex gap-6">
                      <div className="w-12 h-12 bg-apex-forest rounded-2xl flex items-center justify-center shrink-0">
                         <ShieldCheck className="text-white" size={24} />
                      </div>
                      <div>
                        <h4 className="text-[10px] font-bold uppercase tracking-widest text-apex-text-muted mb-2">Clinical Protocol</h4>
                        <p className="text-sm leading-relaxed text-apex-forest">
                          {result.anomalies[0].recommendation}
                        </p>
                      </div>
                   </div>
                </div>
             )}
           </motion.div>
        )}
      </div>
    </div>
  );
}

function StreamToggle({ label, active = false }: { label: string; active?: boolean }) {
  return (
    <div className={`p-4 rounded-3xl border transition-all cursor-pointer flex items-center justify-between group ${
      active ? "bg-apex-bg border-apex-forest/20" : "bg-transparent border-black/5 hover:border-black/10"
    }`}>
      <span className={`text-sm font-medium ${active ? "text-apex-forest" : "text-apex-text-muted"}`}>{label}</span>
      <div className={`w-10 h-6 rounded-full p-1 transition-colors ${active ? "bg-apex-forest" : "bg-black/10"}`}>
        <div className={`w-4 h-4 bg-white rounded-full transition-transform ${active ? "translate-x-4" : "translate-x-0"}`} />
      </div>
    </div>
  );
}

function MiniSummary({ label, value, color }: { label: string; value: string | number; color?: string }) {
  return (
    <div className="bg-white p-6 rounded-4xl border border-black/5 card-shadow">
      <p className="text-[10px] font-bold uppercase tracking-widest text-apex-text-muted mb-1">{label}</p>
      <p className={`text-xl font-display font-bold ${color || "text-apex-forest"}`}>{value}</p>
    </div>
  );
}

function Indicator({ val, unit, label, isAnomaly }: { val: number; unit: string; label: string; isAnomaly?: boolean }) {
  return (
    <div className="flex flex-col">
       <span className="text-[9px] uppercase font-bold text-apex-text-muted">{label}</span>
       <span className={`text-xs font-mono font-bold ${isAnomaly ? "text-apex-red" : "text-apex-forest"}`}>
         {val}{unit}
       </span>
    </div>
  );
}

function ShieldCheck({ className, size }: { className?: string; size?: number }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width={size || 24} 
      height={size || 24} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}
