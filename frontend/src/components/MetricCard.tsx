"use client";

import { motion } from "framer-motion";
import { LucideIcon, TrendingUp, TrendingDown } from "lucide-react";

interface MetricCardProps {
  label: string;
  value: string | number;
  trend?: number;
  icon: LucideIcon;
  subtext?: string;
}

export function MetricCard({ label, value, trend, icon: Icon, subtext }: MetricCardProps) {
  const isPositive = trend && trend > 0;

  return (
    <motion.div
      whileHover={{ y: -5 }}
      className="bg-white p-8 rounded-4xl border border-black/5 card-shadow group"
    >
      <div className="flex items-start justify-between mb-6">
        <div className="p-3 bg-apex-bg rounded-2xl group-hover:bg-apex-forest group-hover:text-white transition-colors duration-300">
          <Icon size={24} strokeWidth={1.5} />
        </div>
        {trend !== undefined && (
          <div className={`flex items-center gap-1 text-xs font-bold px-3 py-1 rounded-full ${
            isPositive ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"
          }`}>
            {isPositive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
            {Math.abs(trend)}%
          </div>
        )}
      </div>
      
      <div className="space-y-1">
        <p className="text-[10px] font-bold uppercase tracking-widest text-apex-text-muted">
          {label}
        </p>
        <h3 className="text-4xl font-display font-bold text-apex-forest">
          {value}
        </h3>
        {subtext && (
          <p className="text-xs text-apex-text-muted mt-2">
            {subtext}
          </p>
        )}
      </div>
    </motion.div>
  );
}
