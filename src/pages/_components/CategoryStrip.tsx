import { motion } from "motion/react";
import { useNavigate } from "react-router-dom";
import { GlassWaterIcon, MusicIcon, SpadeIcon, UtensilsIcon, StarIcon, MapPinIcon } from "lucide-react";

const CATEGORIES = [
  { icon: GlassWaterIcon, label: "Bars", count: 87, color: "text-primary", bg: "bg-primary/10 border-primary/20", href: "/venues?category=bar" },
  { icon: MusicIcon, label: "Clubs", count: 43, color: "text-accent", bg: "bg-accent/10 border-accent/20", href: "/venues?category=club" },
  { icon: SpadeIcon, label: "Casinos", count: 12, color: "text-yellow-400", bg: "bg-yellow-400/10 border-yellow-400/20", href: "/venues?category=casino" },
  { icon: UtensilsIcon, label: "Lounges", count: 34, color: "text-purple-400", bg: "bg-purple-400/10 border-purple-400/20", href: "/venues?category=lounge" },
  { icon: StarIcon, label: "Featured", count: 18, color: "text-pink-400", bg: "bg-pink-400/10 border-pink-400/20", href: "/venues?featured=true" },
  { icon: MapPinIcon, label: "Near Me", count: null, color: "text-green-400", bg: "bg-green-400/10 border-green-400/20", href: "/venues" },
];

export default function CategoryStrip() {
  const navigate = useNavigate();
  return (
    <section className="py-12 border-t border-border bg-card/30">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
          {CATEGORIES.map((cat, i) => (
            <motion.button
              key={cat.label}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.05, ease: "easeOut" }}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate(cat.href)}
              className={`flex flex-col items-center gap-2 p-4 rounded-xl border cursor-pointer transition-colors ${cat.bg} hover:brightness-110`}
            >
              <cat.icon className={`h-6 w-6 ${cat.color}`} />
              <span className="text-sm font-medium text-foreground">{cat.label}</span>
              {cat.count !== null && (
                <span className={`text-xs font-mono ${cat.color}`}>{cat.count}</span>
              )}
            </motion.button>
          ))}
        </div>
      </div>
    </section>
  );
}