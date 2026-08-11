import { useState } from "react";
import { motion } from "motion/react";
import { useNavigate } from "react-router-dom";
import { SearchIcon, ArrowRightIcon } from "lucide-react";
import { Button } from "@/components/ui/button.tsx";

// Rain-slicked Vancouver street at night
const HERO_IMAGE =
  "https://images.unsplash.com/photo-1740872496475-beac097666a3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NzIwMTN8MHwxfHNlYXJjaHwyfHxWYW5jb3V2ZXIlMjBHcmFudmlsbGUlMjBTdHJlZXQlMjBuaWdodGxpZmUlMjByYWluJTIwbmVvbiUyMGxpZ2h0c3xlbnwwfHx8fDE3ODQwMTc3MDJ8MA&ixlib=rb-4.1.0&q=80&w=1080";

const STATS = [
  { value: "200+", label: "Venues Listed" },
  { value: "12", label: "Neighbourhoods" },
  { value: "4.8★", label: "Avg. Rating" },
];

export default function Hero() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");

  const handleExplore = () => {
    navigate(search ? `/venues?search=${encodeURIComponent(search)}` : "/venues");
  };
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
      {/* Background image with overlay */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${HERO_IMAGE})` }}
      />
      {/* Deep gradient overlay for readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-background/70 via-background/50 to-background" />
      {/* Neon glow blobs */}
      <div className="absolute top-1/3 left-1/4 w-96 h-96 rounded-full bg-primary/10 blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/3 right-1/4 w-80 h-80 rounded-full bg-accent/10 blur-3xl pointer-events-none" />

      <div className="relative z-10 mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 text-center">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="inline-flex items-center gap-2 mb-6 px-4 py-1.5 rounded-full border border-primary/30 bg-primary/10 text-primary text-xs font-semibold uppercase tracking-widest"
        >
          <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
          Vancouver Lower Mainland
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
          className="text-5xl sm:text-7xl font-extrabold tracking-tight text-balance leading-none mb-4"
        >
          <span className="text-white">Survive YVR Nights</span>
          <br />
          <span className="text-primary">Without Regrets.</span>
        </motion.h1>

        {/* Subheadline */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
          className="mt-4 text-lg sm:text-xl text-foreground/80 max-w-2xl mx-auto text-balance"
        >
          The community-powered nightlife directory for bars, clubs, and casinos
          across Vancouver&apos;s Lower Mainland. Find your scene. Rate your experience.
        </motion.p>

        {/* Search bar */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3, ease: "easeOut" }}
          className="mt-10 flex flex-col sm:flex-row gap-3 max-w-xl mx-auto"
        >
          <div className="relative flex-1">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search bars, clubs, casinos..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleExplore()}
              className="w-full pl-10 pr-4 py-3 rounded-md bg-card border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary text-sm"
            />
          </div>
          <Button size="lg" className="gap-2 whitespace-nowrap" onClick={handleExplore}>
            Explore <ArrowRightIcon className="h-4 w-4" />
          </Button>
        </motion.div>

        {/* Stats row */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.5, ease: "easeOut" }}
          className="mt-14 flex justify-center gap-10 sm:gap-16"
        >
          {STATS.map((s) => (
            <div key={s.label} className="text-center">
              <div className="text-2xl sm:text-3xl font-bold text-primary">{s.value}</div>
              <div className="text-xs text-muted-foreground mt-1 uppercase tracking-wide">{s.label}</div>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1"
      >
        <div className="w-px h-10 bg-gradient-to-b from-primary/60 to-transparent animate-pulse" />
      </motion.div>
    </section>
  );
}