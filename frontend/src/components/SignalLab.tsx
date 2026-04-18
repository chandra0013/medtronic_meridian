"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Pill, Activity, ShieldCheck, AlertCircle, Search, Info, ChevronRight, BookOpen } from "lucide-react";
import { Button } from "./Button";
import axios from "axios";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export function SignalLab() {
  const [report, setReport] = useState("Patient taking Warfarin reported spontaneous bleeding and coughed up blood after 5 days.");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const analyzeSignal = async () => {
    setLoading(true);
    try {
      const resp = await axios.post(`${API_BASE}/analyze/drug-signal`, {
        report_text: report,
        top_k: 3
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
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* Input Section */}
      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="lg:col-span-4 space-y-6"
      >
        <div className="bg-white p-10 rounded-4xl border border-black/5 card-shadow">
          <div className="flex items-center gap-2 mb-6 text-apex-forest">
            <Pill size={24} />
            <h2 className="text-xl font-display font-bold">Signal Lab</h2>
          </div>
          
          <div className="space-y-4">
            <label className="text-[10px] font-bold uppercase tracking-widest text-apex-text-muted">
              Safety Narrative Report
            </label>
            <textarea
              className="w-full h-48 p-6 bg-apex-bg rounded-3xl border-none outline-none focus:ring-2 focus:ring-apex-forest/10 transition-all text-sm leading-relaxed"
              value={report}
              onChange={(e) => setReport(e.target.value)}
              placeholder="Describe the adverse event narrative..."
            />
            
            <Button 
              onClick={analyzeSignal} 
              className="w-full h-14" 
              disabled={loading}
              icon={Search}
            >
              {loading ? "Processing..." : "Detect Safety Signal"}
            </Button>
          </div>
        </div>

        <div className="bg-apex-mint-light/30 p-8 rounded-4xl border border-apex-mint/20">
          <div className="flex gap-4">
             <ShieldCheck className="text-apex-forest shrink-0" size={24} />
             <div>
               <h4 className="font-bold text-apex-forest text-sm">RAG Engine Active</h4>
               <p className="text-xs text-apex-text-muted mt-1 leading-relaxed">
                 Connected to Meridian's proprietary safety database. Cross-referencing against 45,000+ medical journals.
               </p>
             </div>
          </div>
        </div>
      </motion.div>

      {/* Results Section */}
      <motion.div 
        className="lg:col-span-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <AnimatePresence mode="wait">
          {!result ? (
            <motion.div 
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="h-full min-h-[500px] flex flex-col items-center justify-center text-center p-12 bg-white rounded-4xl border border-black/5 card-shadow pending-stripes"
            >
              <div className="p-6 bg-white rounded-full shadow-sm mb-6">
                <Search size={48} className="text-apex-text-muted opacity-20" />
              </div>
              <h3 className="text-2xl font-display font-bold text-apex-forest">Awaiting Narrative</h3>
              <p className="text-apex-text-muted max-w-sm mt-2">
                Input an adverse event report to initiate &quot;Decision Intelligence&quot; signal extraction.
              </p>
            </motion.div>
          ) : (
            <motion.div 
              key="results"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-6"
            >
              {/* Top Row: Quick Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <ResultMiniCard 
                  label="Signal Strength" 
                  value={result.signal_strength} 
                  color="text-apex-forest" 
                  variant={result.signal_strength === "High" ? "danger" : "safe"}
                />
                <ResultMiniCard 
                  label="Triage Priority" 
                  value={result.triage_priority} 
                  color="text-amber-600"
                />
                <ResultMiniCard 
                  label="Entities Detected" 
                  value={`${result.extracted_drugs.length + result.extracted_symptoms.length}`} 
                  color="text-apex-forest"
                />
              </div>

              {/* Hypothesis & Action */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div className="bg-white p-10 rounded-4xl border border-black/5 card-shadow">
                    <h4 className="text-[10px] font-bold uppercase tracking-widest text-apex-text-muted mb-4">Mechanistic Hypothesis</h4>
                    <p className="text-sm leading-relaxed text-apex-forest">
                      {result.mechanism_hypothesis}
                    </p>
                 </div>
                 <div className="bg-apex-red/5 p-10 rounded-4xl border border-apex-red/10">
                    <h4 className="text-[10px] font-bold uppercase tracking-widest text-apex-red mb-4">Recommended Action</h4>
                    <p className="text-sm leading-relaxed text-apex-red font-semibold">
                      {result.recommended_action}
                    </p>
                 </div>
              </div>

              {/* Narrative Summary */}
              <div className="bg-white p-10 rounded-4xl border border-black/5 card-shadow">
                 <h4 className="text-[10px] font-bold uppercase tracking-widest text-apex-text-muted mb-4">Signal Intelligence Summary</h4>
                 <p className="text-xl font-display font-medium leading-relaxed text-apex-forest">
                   "{result.narrative}"
                 </p>
              </div>

              {/* Evidence Section */}
              <div className="bg-white p-10 rounded-4xl border border-black/5 card-shadow">
                 <div className="flex items-center gap-2 mb-6">
                    <BookOpen size={20} className="text-apex-forest" />
                    <h4 className="font-display font-bold">Evidence Base</h4>
                 </div>
                 <div className="space-y-4">
                    {result.evidence.map((ev: any, idx: number) => (
                      <div key={idx} className="p-6 bg-apex-bg rounded-3xl border border-black/5 hover:border-apex-mint transition-colors">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-bold text-apex-forest uppercase tracking-tight">{ev.title}</span>
                          <span className="text-[10px] text-apex-text-muted">ID: {ev.source_id}</span>
                        </div>
                        <p className="text-sm text-apex-text-muted italic leading-relaxed">
                          &quot;...{ev.snippet}...&quot;
                        </p>
                      </div>
                    ))}
                 </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}

function ResultMiniCard({ label, value, color, variant }: { label: string; value: string; color: string; variant?: string }) {
  return (
    <div className={`bg-white p-8 rounded-4xl border border-black/5 card-shadow`}>
      <p className="text-[10px] font-bold uppercase tracking-widest text-apex-text-muted mb-2">{label}</p>
      <div className={`text-2xl font-display font-bold ${color}`}>
        {value}
      </div>
    </div>
  );
}
