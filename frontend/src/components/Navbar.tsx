"use client";

import { motion } from "framer-motion";
import { Search, Bell, User, LayoutDashboard, Database, Activity, Home } from "lucide-react";
import { Button } from "./Button";
import { useState, useEffect } from "react";

export function Navbar({ isLanding = false, onLaunch }: { isLanding?: boolean, onLaunch?: () => void }) {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className={`fixed top-6 left-1/2 -translate-x-1/2 z-50 transition-all duration-300 ${
        isLanding
          ? "w-[90%] max-w-4xl"
          : "w-[95%] max-w-7xl"
      }`}
    >
      <div className={`flex items-center justify-between px-6 py-3 rounded-full border border-white/10 ${
        isScrolled || !isLanding ? "bg-white/80 backdrop-blur-md shadow-lg border-black/5" : "bg-black/20 backdrop-blur-sm"
      }`}>
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-apex-forest rounded-full flex items-center justify-center">
              <div className="w-3 h-3 bg-apex-mint rounded-full" />
            </div>
            <span className={`font-display font-bold text-xl ${isScrolled || !isLanding ? "text-apex-forest" : "text-white"}`}>
              Meridian
            </span>
          </div>

          <div className="hidden md:flex items-center gap-6">
            {!isLanding && (
              <>
                <NavLink icon={LayoutDashboard} label="Overview" active />
                <NavLink icon={Database} label="Signal Lab" />
                <NavLink icon={Activity} label="Device Pulse" />
              </>
            )}
            {isLanding && (
              <>
                <NavLink icon={Home} label="Features" isLanding={isLanding} />
                <NavLink icon={Activity} label="Solutions" isLanding={isLanding} />
              </>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className={`relative hidden sm:block ${isScrolled || !isLanding ? "text-apex-text-muted" : "text-white/60"}`}>
            <Search className="absolute left-3 top-1/2 -translate-y-1/2" size={16} />
            <input
              type="text"
              placeholder="Search..."
              className={`pl-10 pr-4 py-2 rounded-full text-sm border-none outline-none focus:ring-2 focus:ring-apex-forest/20 transition-all ${
                isScrolled || !isLanding ? "bg-apex-bg text-apex-forest" : "bg-white/10 text-white placeholder:text-white/40"
              }`}
            />
          </div>
          
          <button className={`p-2 rounded-full transition-colors ${isScrolled || !isLanding ? "hover:bg-apex-bg text-apex-forest" : "hover:bg-white/10 text-white"}`}>
            <Bell size={20} />
          </button>
          
          <Button 
            variant={isScrolled || !isLanding ? "primary" : "secondary"} 
            className="h-10 px-4 py-0 text-sm"
            onClick={onLaunch}
          >
            Launch Platform
          </Button>
        </div>
      </div>
    </motion.nav>
  );
}

function NavLink({ icon: Icon, label, active = false, isLanding = false }: { icon: any; label: string; active?: boolean; isLanding?: boolean }) {
  return (
    <a
      href="#"
      className={`flex items-center gap-2 text-sm font-medium transition-all group ${
        active 
          ? (isLanding ? "text-white" : "text-apex-forest") 
          : (isLanding ? "text-white/70 hover:text-white" : "text-apex-text-muted hover:text-apex-forest")
      }`}
    >
      <Icon size={18} strokeWidth={active ? 2.5 : 2} className="group-hover:scale-110 transition-transform" />
      <span>{label}</span>
      {active && (
        <motion.div
          layoutId="nav-underline"
          className={`h-0.5 rounded-full mt-auto ${isLanding ? "bg-white" : "bg-apex-forest"}`}
        />
      )}
    </a>
  );
}
